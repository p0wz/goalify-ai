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

        // Find last H2H match (within last 2 years)
        const TWO_YEARS_MS = 2 * 365 * 24 * 60 * 60 * 1000;
        const now = Date.now();

        const h2hMatch = matches.find(m => {
            const isHome = (m.home_team?.name === homeTeam && m.away_team?.name === awayTeam);
            const isAway = (m.home_team?.name === awayTeam && m.away_team?.name === homeTeam);
            const matchTime = m.startTime * 1000; // Assuming timestamp is seconds
            const isRecent = (now - matchTime) < TWO_YEARS_MS;
            return (isHome || isAway) && isRecent;
        });

        // Analyze H2H match if exists
        if (h2hMatch) {
            const h2hDetails = await flashscore.fetchMatchDetails(h2hMatch.match_id);
            if (h2hDetails) {
                const h2hTotal = (parseInt(h2hDetails.home_team?.score) || 0) + (parseInt(h2hDetails.away_team?.score) || 0);

                // HT Specific Analysis
                const h2hHTHome = parseInt(h2hDetails.home_team?.score_1st_half) || 0;
                const h2hHTAway = parseInt(h2hDetails.away_team?.score_1st_half) || 0;
                const h2hHTTotal = h2hHTHome + h2hHTAway;

                h2hResult = {
                    goals: h2hTotal,
                    wasGoalFest: h2hTotal >= 3,
                    htGoals: h2hHTTotal,
                    date: new Date(h2hMatch.startTime * 1000).toLocaleDateString()
                };

                if (isFirstHalf) {
                    console.log(`[LiveH2H] Found recent H2H (${h2hResult.date}): HT Score ${h2hHTHome}-${h2hHTAway} (${h2hHTTotal} goals)`);
                } else {
                    console.log(`[LiveH2H] Found recent H2H (${h2hResult.date}): FT Score ${h2hDetails.home_team?.score}-${h2hDetails.away_team?.score}`);
                }
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
    let remainingPotential = relevantAvg - currentGoals;

    // Apply H2H specific modifiers
    if (h2hResult) {
        if (isFirstHalf) {
            // If recent H2H had 0 goals in HT, reduce potential
            if (h2hResult.htGoals === 0) {
                remainingPotential -= 0.3;
                console.log(`[LiveH2H] 📉 Dampened potential (-0.3) due to 0-0 HT H2H history`);
            } else if (h2hResult.htGoals >= 2) {
                remainingPotential += 0.2; // Boost for history of action
                console.log(`[LiveH2H] 📈 Boosted potential (+0.2) due to action-packed HT H2H history`);
            }
        } else {
            // Second half or late game
            if (h2hResult.goals < 2) {
                remainingPotential -= 0.2; // Low scoring history
                console.log(`[LiveH2H] 📉 Dampened potential (-0.2) due to low scoring H2H history (< 2 goals)`);
            }
        }
    }

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

/**
 * Analyze H2H for Dead Match Bot (reverse logic - looking for LOW scoring patterns)
 * @param {string} matchId - Current match ID
 * @param {string} homeTeam - Home team name
 * @param {string} awayTeam - Away team name
 * @returns {object} Dead match H2H analysis result
 */
async function analyzeDeadH2H(matchId, homeTeam, awayTeam) {
    let homeTeamAvgGoals = 0;
    let awayTeamAvgGoals = 0;
    let h2hGoals = null;
    let matchesChecked = 0;
    let confidenceBonus = 0;
    const reasons = [];

    try {
        const h2hData = await flashscore.fetchMatchH2H(matchId);

        if (!h2hData) {
            return { valid: true, reason: 'No H2H data', confidenceBonus: 0 };
        }

        const matches = Array.isArray(h2hData) ? h2hData : (h2hData.DATA || []);

        // Home team last 2 matches
        const homeMatches = matches.filter(m =>
            m.home_team?.name === homeTeam || m.away_team?.name === homeTeam
        ).slice(0, 2);

        // Away team last 2 matches
        const awayMatches = matches.filter(m =>
            m.home_team?.name === awayTeam || m.away_team?.name === awayTeam
        ).slice(0, 2);

        // Last H2H match
        const h2hMatch = matches.find(m =>
            (m.home_team?.name === homeTeam && m.away_team?.name === awayTeam) ||
            (m.home_team?.name === awayTeam && m.away_team?.name === homeTeam)
        );

        // Analyze home team last 2 matches
        let homeGoals = 0;
        for (const match of homeMatches) {
            if (match.match_id) {
                const details = await flashscore.fetchMatchDetails(match.match_id);
                if (details) {
                    matchesChecked++;
                    const total = (parseInt(details.home_team?.score) || 0) + (parseInt(details.away_team?.score) || 0);
                    homeGoals += total;
                }
            }
        }
        homeTeamAvgGoals = homeMatches.length > 0 ? homeGoals / homeMatches.length : 2.5;

        // Analyze away team last 2 matches
        let awayGoals = 0;
        for (const match of awayMatches) {
            if (match.match_id) {
                const details = await flashscore.fetchMatchDetails(match.match_id);
                if (details) {
                    matchesChecked++;
                    const total = (parseInt(details.home_team?.score) || 0) + (parseInt(details.away_team?.score) || 0);
                    awayGoals += total;
                }
            }
        }
        awayTeamAvgGoals = awayMatches.length > 0 ? awayGoals / awayMatches.length : 2.5;

        // Analyze H2H match
        if (h2hMatch && h2hMatch.match_id) {
            const h2hDetails = await flashscore.fetchMatchDetails(h2hMatch.match_id);
            if (h2hDetails) {
                h2hGoals = (parseInt(h2hDetails.home_team?.score) || 0) + (parseInt(h2hDetails.away_team?.score) || 0);
            }
        }

        // Calculate confidence bonuses for DEAD MATCH (reverse logic)

        // Home team plays low-scoring matches
        if (homeTeamAvgGoals <= 1.5) {
            confidenceBonus += 10;
            reasons.push(`Ev ${homeTeamAvgGoals.toFixed(1)} ort`);
        } else if (homeTeamAvgGoals <= 2.0) {
            confidenceBonus += 5;
            reasons.push(`Ev ${homeTeamAvgGoals.toFixed(1)} ort`);
        } else if (homeTeamAvgGoals >= 3.0) {
            confidenceBonus -= 10;
            reasons.push(`Ev yüksek gol ${homeTeamAvgGoals.toFixed(1)}`);
        }

        // Away team plays low-scoring matches
        if (awayTeamAvgGoals <= 1.5) {
            confidenceBonus += 10;
            reasons.push(`Dep ${awayTeamAvgGoals.toFixed(1)} ort`);
        } else if (awayTeamAvgGoals <= 2.0) {
            confidenceBonus += 5;
            reasons.push(`Dep ${awayTeamAvgGoals.toFixed(1)} ort`);
        } else if (awayTeamAvgGoals >= 3.0) {
            confidenceBonus -= 10;
            reasons.push(`Dep yüksek gol ${awayTeamAvgGoals.toFixed(1)}`);
        }

        // H2H history
        if (h2hGoals !== null) {
            if (h2hGoals <= 1) {
                confidenceBonus += 12;
                reasons.push(`H2H ${h2hGoals} gol ✓`);
            } else if (h2hGoals <= 2) {
                confidenceBonus += 6;
                reasons.push(`H2H ${h2hGoals} gol`);
            } else if (h2hGoals >= 4) {
                confidenceBonus -= 12;
                reasons.push(`H2H ${h2hGoals} gol ⚠️`);
            }
        }

        // Check if signal should be blocked (both teams high-scoring)
        if (homeTeamAvgGoals >= 3.0 && awayTeamAvgGoals >= 3.0) {
            return {
                valid: false,
                reason: 'Her iki takım da golcü - dead match sinyali riskli',
                confidenceBonus: -20,
                homeTeamAvgGoals,
                awayTeamAvgGoals,
                h2hGoals
            };
        }

    } catch (error) {
        console.error('[LiveH2H] Dead H2H error:', error.message);
        return { valid: true, reason: 'H2H fetch error', confidenceBonus: 0 };
    }

    return {
        valid: true,
        reason: reasons.join(' | ') || 'H2H OK',
        confidenceBonus,
        homeTeamAvgGoals,
        awayTeamAvgGoals,
        h2hGoals,
        matchesChecked
    };
}

module.exports = {
    analyzeH2H,
    analyzeDeadH2H
};
