/**
 * Live Bot - Score-Aware H2H Analysis Module
 * Analyzes team form relative to current match score
 */

const flashscore = require('./flashscore');

/**
 * Analyze H2H and team form (optimized - only for momentum matches)
 * @param {string} matchId - Current match ID
 * @param {string} homeTeam - Home team name
 * @param {string} awayTeam - Away team name
 * @param {string} currentScore - Current score (e.g., "1-1")
 * @param {number} elapsed - Current minute
 * @returns {object} H2H analysis result
 */
async function analyzeH2H(matchId, homeTeam, awayTeam, currentScore = '0-0', elapsed = 0) {
    const [curHome, curAway] = currentScore.split('-').map(s => parseInt(s) || 0);
    const currentGoals = curHome + curAway;
    const isFirstHalf = elapsed <= 45;

    let htGoals = 0, shGoals = 0, totalGoals = 0;
    let matchesChecked = 0;
    let h2hResult = null;

    try {
        // Fetch H2H data (contains recent matches for both teams)
        const h2hData = await flashscore.fetchMatchH2H(matchId);

        if (!h2hData) {
            return { valid: true, reason: 'No H2H data (defaulting to valid)', remainingPotential: 1.0 };
        }

        const matches = Array.isArray(h2hData) ? h2hData : (h2hData.DATA || []);

        // Find home team last 2 matches
        const homeMatches = matches.filter(m =>
            m.home_team?.name === homeTeam || m.away_team?.name === homeTeam
        ).slice(0, 2);

        // Find away team last 2 matches
        const awayMatches = matches.filter(m =>
            m.home_team?.name === awayTeam || m.away_team?.name === awayTeam
        ).slice(0, 2);

        // Find last H2H match
        const h2hMatch = matches.find(m =>
            (m.home_team?.name === homeTeam && m.away_team?.name === awayTeam) ||
            (m.home_team?.name === awayTeam && m.away_team?.name === homeTeam)
        );

        // Analyze each match for HT/FT goals
        const allMatches = [...homeMatches, ...awayMatches];
        const uniqueIds = [...new Set(allMatches.map(m => m.match_id).filter(Boolean))].slice(0, 4);

        for (const mId of uniqueIds) {
            const details = await flashscore.fetchMatchDetails(mId);
            if (details) {
                matchesChecked++;
                const htHome = parseInt(details.home_team?.score_1st_half) || 0;
                const htAway = parseInt(details.away_team?.score_1st_half) || 0;
                const ftHome = parseInt(details.home_team?.score) || 0;
                const ftAway = parseInt(details.away_team?.score) || 0;

                htGoals += htHome + htAway;
                shGoals += (ftHome - htHome) + (ftAway - htAway);
                totalGoals += ftHome + ftAway;
            }
        }

        // Analyze H2H match if exists
        if (h2hMatch) {
            const h2hDetails = await flashscore.fetchMatchDetails(h2hMatch.match_id);
            if (h2hDetails) {
                const h2hTotal = (parseInt(h2hDetails.home_team?.score) || 0) + (parseInt(h2hDetails.away_team?.score) || 0);
                h2hResult = { goals: h2hTotal, wasGoalFest: h2hTotal >= 3 };
            }
        }

    } catch (error) {
        console.error('[LiveH2H] Error:', error.message);
        return { valid: true, reason: 'H2H fetch error (defaulting to valid)', remainingPotential: 1.0 };
    }

    // Calculate averages
    const avgHTGoals = matchesChecked > 0 ? htGoals / matchesChecked : 1.5;
    const avg2HGoals = matchesChecked > 0 ? shGoals / matchesChecked : 1.5;
    const avgTotalGoals = matchesChecked > 0 ? totalGoals / matchesChecked : 2.5;

    // Score-aware remaining potential
    const relevantAvg = isFirstHalf ? avgHTGoals : avgTotalGoals;
    const remainingPotential = relevantAvg - currentGoals;

    // Determine validity based on remaining potential
    if (remainingPotential < 0.5) {
        return {
            valid: false,
            reason: `Low potential (${remainingPotential.toFixed(1)} < 0.5, avg ${relevantAvg.toFixed(1)}, current ${currentGoals})`,
            remainingPotential,
            avgHTGoals,
            avg2HGoals,
            h2hResult,
            matchesChecked
        };
    }

    // Calculate confidence bonuses
    let confidenceBonus = 0;
    const bonusReasons = [];

    // HT/2H rate bonuses
    const htRate = matchesChecked > 0 ? (htGoals / matchesChecked) : 0;
    const shRate = matchesChecked > 0 ? (shGoals / matchesChecked) : 0;

    if (isFirstHalf) {
        if (htRate > 1.4) { confidenceBonus += 12; bonusReasons.push(`High HT rate (${htRate.toFixed(1)})`); }
        else if (htRate >= 1.0) { confidenceBonus += 6; bonusReasons.push(`Good HT rate (${htRate.toFixed(1)})`); }
        else if (htRate < 0.8) { confidenceBonus -= 15; bonusReasons.push(`Low HT rate (${htRate.toFixed(1)})`); }
    } else {
        if (shRate > 1.4) { confidenceBonus += 12; bonusReasons.push(`High 2H rate (${shRate.toFixed(1)})`); }
        else if (shRate >= 1.0) { confidenceBonus += 6; bonusReasons.push(`Good 2H rate (${shRate.toFixed(1)})`); }
        else if (shRate < 0.8) { confidenceBonus -= 15; bonusReasons.push(`Low 2H rate (${shRate.toFixed(1)})`); }
    }

    // Remaining potential bonus
    if (remainingPotential >= 1.5) { confidenceBonus += 15; bonusReasons.push(`High potential (+${remainingPotential.toFixed(1)})`); }
    else if (remainingPotential >= 0.8) { confidenceBonus += 8; bonusReasons.push(`Good potential (+${remainingPotential.toFixed(1)})`); }

    // H2H result bonus
    if (h2hResult) {
        if (h2hResult.wasGoalFest) { confidenceBonus += 8; bonusReasons.push(`H2H was golcü (${h2hResult.goals})`); }
        else if (h2hResult.goals <= 1) { confidenceBonus -= 8; bonusReasons.push(`H2H golsüz (${h2hResult.goals})`); }
    }

    return {
        valid: true,
        reason: bonusReasons.join(' | ') || 'H2H OK',
        remainingPotential,
        avgHTGoals,
        avg2HGoals,
        avgTotalGoals,
        h2hResult,
        matchesChecked,
        confidenceBonus
    };
}

module.exports = {
    analyzeH2H
};
