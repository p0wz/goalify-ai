/**
 * Live Form Analysis Module
 * Analyzes team form and remaining potential for signal generation
 * Replaces momentum detection with form-based analysis
 */

const flashscore = require('./flashscore');

// Cache for form data (per match session)
const formCache = {};

/**
 * Analyze form for a match - main entry point
 * @param {string} matchId 
 * @param {string} homeTeam 
 * @param {string} awayTeam 
 * @param {string} score - Current score e.g. "1-0"
 * @param {number} elapsed - Current minute
 * @returns {object} Form analysis result with remaining potential
 */
async function analyzeForm(matchId, homeTeam, awayTeam, score, elapsed) {
    const cacheKey = matchId;
    const isFirstHalf = elapsed <= 45;

    // Check cache (form data doesn't change during match)
    if (formCache[cacheKey]) {
        return calculatePotential(formCache[cacheKey], score, elapsed);
    }

    console.log(`[FormAnalysis] Fetching form data for ${homeTeam} vs ${awayTeam}`);

    try {
        // Fetch H2H data (contains recent matches)
        const h2hData = await flashscore.fetchMatchH2H(matchId);

        if (!h2hData) {
            console.log('[FormAnalysis] No H2H data available');
            return getDefaultResult();
        }

        const matches = Array.isArray(h2hData) ? h2hData : (h2hData.DATA || []);

        // Get last 5 matches for each team
        const homeMatches = matches.filter(m =>
            m.home_team?.name === homeTeam || m.away_team?.name === homeTeam
        ).slice(0, 5);

        const awayMatches = matches.filter(m =>
            m.home_team?.name === awayTeam || m.away_team?.name === awayTeam
        ).slice(0, 5);

        // Fetch match details for HT scores (last 3 matches each)
        const homeDetails = await fetchMatchDetails(homeMatches.slice(0, 3), homeTeam);
        const awayDetails = await fetchMatchDetails(awayMatches.slice(0, 3), awayTeam);

        // Calculate averages
        const homeStats = calculateTeamStats(homeDetails, homeTeam);
        const awayStats = calculateTeamStats(awayDetails, awayTeam);

        console.log(`[FormAnalysis] Home (${homeTeam}): FT avg ${homeStats.ftAvg.toFixed(2)}, HT avg ${homeStats.htAvg.toFixed(2)}`);
        console.log(`[FormAnalysis] Away (${awayTeam}): FT avg ${awayStats.ftAvg.toFixed(2)}, HT avg ${awayStats.htAvg.toFixed(2)}`);

        // Cache the result
        formCache[cacheKey] = {
            homeTeam,
            awayTeam,
            homeStats,
            awayStats,
            timestamp: Date.now()
        };

        return calculatePotential(formCache[cacheKey], score, elapsed);

    } catch (error) {
        console.error('[FormAnalysis] Error:', error.message);
        return getDefaultResult();
    }
}

/**
 * Fetch match details for HT scores
 */
async function fetchMatchDetails(matches, teamName) {
    const details = [];

    for (const match of matches) {
        if (!match.match_id) continue;

        try {
            const data = await flashscore.fetchMatchDetails(match.match_id);
            if (data) {
                const isHome = data.home_team?.name === teamName;

                details.push({
                    matchId: match.match_id,
                    isHome,
                    htHome: parseInt(data.home_team?.score_1st_half) || 0,
                    htAway: parseInt(data.away_team?.score_1st_half) || 0,
                    ftHome: parseInt(data.home_team?.score) || 0,
                    ftAway: parseInt(data.away_team?.score) || 0
                });
            }
        } catch (e) {
            console.log(`[FormAnalysis] Failed to fetch details for ${match.match_id}`);
        }

        // Rate limiting
        await new Promise(r => setTimeout(r, 300));
    }

    return details;
}

/**
 * Calculate team stats from match details
 */
function calculateTeamStats(details, teamName) {
    if (details.length === 0) {
        return { ftAvg: 1.5, htAvg: 0.7, ftConcededAvg: 1.2, htConcededAvg: 0.5 };
    }

    let ftScored = 0, htScored = 0;
    let ftConceded = 0, htConceded = 0;

    for (const d of details) {
        if (d.isHome) {
            ftScored += d.ftHome;
            htScored += d.htHome;
            ftConceded += d.ftAway;
            htConceded += d.htAway;
        } else {
            ftScored += d.ftAway;
            htScored += d.htAway;
            ftConceded += d.ftHome;
            htConceded += d.htHome;
        }
    }

    const count = details.length;

    return {
        ftAvg: ftScored / count,
        htAvg: htScored / count,
        ftConcededAvg: ftConceded / count,
        htConcededAvg: htConceded / count,
        matchCount: count
    };
}

/**
 * Calculate remaining potential based on form and current score
 * Now considers both attack strength AND opponent's defensive weakness
 */
function calculatePotential(formData, score, elapsed) {
    const [homeGoals, awayGoals] = score.split('-').map(s => parseInt(s) || 0);
    const totalGoals = homeGoals + awayGoals;
    const isFirstHalf = elapsed <= 45;

    const { homeStats, awayStats } = formData;

    // Get attack and defense stats based on half
    const homeAttack = isFirstHalf ? homeStats.htAvg : homeStats.ftAvg;
    const awayAttack = isFirstHalf ? awayStats.htAvg : awayStats.ftAvg;
    const homeConceded = isFirstHalf ? homeStats.htConcededAvg : homeStats.ftConcededAvg;
    const awayConceded = isFirstHalf ? awayStats.htConcededAvg : awayStats.ftConcededAvg;

    // WEIGHTED EXPECTED GOALS:
    // Attack is 70% of the calculation, opponent's defensive weakness is 30%
    // This keeps attack power dominant while considering defense
    const homeExpected = (homeAttack * 0.7) + (awayConceded * 0.3);
    const awayExpected = (awayAttack * 0.7) + (homeConceded * 0.3);

    // Remaining potential per team
    const homeRemaining = homeExpected - homeGoals;
    const awayRemaining = awayExpected - awayGoals;
    const totalRemaining = homeRemaining + awayRemaining;

    // Time adjustment (less time = less potential)
    const timeRatio = isFirstHalf
        ? (45 - elapsed) / 45
        : (90 - elapsed) / 45;
    const adjustedRemaining = totalRemaining * Math.max(0.3, timeRatio);

    // Generate market suggestions based on potential
    const markets = selectMarkets(homeRemaining, awayRemaining, homeGoals, awayGoals, elapsed);

    return {
        valid: true,
        homeRemaining: Math.round(homeRemaining * 100) / 100,
        awayRemaining: Math.round(awayRemaining * 100) / 100,
        totalRemaining: Math.round(totalRemaining * 100) / 100,
        adjustedRemaining: Math.round(adjustedRemaining * 100) / 100,
        homeExpected: Math.round(homeExpected * 100) / 100,
        awayExpected: Math.round(awayExpected * 100) / 100,
        // Extra debug info
        homeAttack: Math.round(homeAttack * 100) / 100,
        awayAttack: Math.round(awayAttack * 100) / 100,
        awayConceded: Math.round(awayConceded * 100) / 100,
        homeConceded: Math.round(homeConceded * 100) / 100,
        isFirstHalf,
        elapsed,
        score,
        markets,
        reason: generateReason(homeRemaining, awayRemaining, isFirstHalf, homeExpected, awayExpected)
    };
}

/**
 * Select markets based on remaining potential
 */
function selectMarkets(homeRem, awayRem, homeGoals, awayGoals, elapsed) {
    const total = homeGoals + awayGoals;
    const diff = Math.abs(homeGoals - awayGoals);
    const isFirstHalf = elapsed <= 45;
    const markets = [];

    // Both teams have potential
    if (homeRem >= 0.5 && awayRem >= 0.5) {
        if (total === 0 && isFirstHalf) {
            markets.push({ name: 'İY Over 0.5', type: 'OVER', confidence: calculateMarketConfidence(homeRem + awayRem, 'OVER', elapsed) });
        }
        if (total === 0 && !isFirstHalf && elapsed <= 70) {
            markets.push({ name: 'Over 1.5', type: 'OVER', confidence: calculateMarketConfidence(homeRem + awayRem, 'OVER', elapsed) });
        }
        // Removed BTTS - replaced with next goal market
        if (total >= 1 && elapsed <= 75) {
            markets.push({ name: `Over ${total + 0.5}`, type: 'OVER', confidence: calculateMarketConfidence(homeRem + awayRem, 'OVER', elapsed) });
        }
    }

    // Home has potential, away exhausted
    if (homeRem >= 0.8 && awayRem < 0.3) {
        markets.push({ name: 'Home Goal', type: 'HOME_GOAL', confidence: calculateMarketConfidence(homeRem, 'OVER', elapsed) });
    }

    // Away has potential, home exhausted
    if (awayRem >= 0.8 && homeRem < 0.3) {
        markets.push({ name: 'Away Goal', type: 'AWAY_GOAL', confidence: calculateMarketConfidence(awayRem, 'OVER', elapsed) });
    }

    // Both exhausted
    if (homeRem < 0.3 && awayRem < 0.3) {
        markets.push({ name: `Under ${total + 0.5}`, type: 'UNDER', confidence: calculateMarketConfidence(-(homeRem + awayRem), 'UNDER', elapsed) });
        if (homeGoals === awayGoals && elapsed >= 70) {
            markets.push({ name: 'Draw', type: 'DRAW', confidence: calculateMarketConfidence(0.5, 'DRAW', elapsed) });
        }
    }

    // High scoring potential
    if (homeRem + awayRem >= 1.5 && elapsed <= 75) {
        markets.push({ name: `Over ${total + 0.5}`, type: 'OVER', confidence: calculateMarketConfidence(homeRem + awayRem, 'OVER', elapsed) });
    }

    // Sort by confidence
    return markets.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Calculate market confidence based on potential and timing
 */
function calculateMarketConfidence(potentialValue, marketType, elapsed) {
    let base = 50;

    // Potential bonus
    if (marketType === 'OVER' || marketType === 'BTTS') {
        if (potentialValue >= 2.0) base += 20;
        else if (potentialValue >= 1.5) base += 15;
        else if (potentialValue >= 1.0) base += 10;
        else if (potentialValue >= 0.5) base += 5;
        else base -= 10;
    }

    if (marketType === 'UNDER') {
        if (potentialValue >= 0.5) base += 15; // Negative remaining = good for under
        else if (potentialValue >= 0) base += 10;
        else base -= 5;
    }

    // Time bonus/penalty
    if (elapsed >= 75) {
        if (marketType === 'UNDER' || marketType === 'DRAW') base += 10;
        else base -= 5;
    }
    if (elapsed <= 35) {
        if (marketType === 'OVER') base -= 5; // Too early
    }

    return Math.min(92, Math.max(45, base));
}

/**
 * Generate human-readable reason
 */
function generateReason(homeRem, awayRem, isFirstHalf, homeExp, awayExp) {
    const parts = [];

    if (homeRem >= 1.0) parts.push(`Ev +${homeRem.toFixed(1)} potansiyel`);
    else if (homeRem < 0) parts.push(`Ev aştı (${homeRem.toFixed(1)})`);
    else parts.push(`Ev ${homeRem.toFixed(1)} kalan`);

    if (awayRem >= 1.0) parts.push(`Dep +${awayRem.toFixed(1)} potansiyel`);
    else if (awayRem < 0) parts.push(`Dep aştı (${awayRem.toFixed(1)})`);
    else parts.push(`Dep ${awayRem.toFixed(1)} kalan`);

    // Add expected goals info
    if (homeExp && awayExp) {
        parts.push(`Beklenen: ${homeExp.toFixed(1)}-${awayExp.toFixed(1)}`);
    }

    if (isFirstHalf) parts.push('(HT bazlı)');

    return parts.join(' | ');
}

/**
 * Default result when form data unavailable
 */
function getDefaultResult() {
    return {
        valid: false,
        reason: 'Form verisi bulunamadı',
        homeRemaining: 0,
        awayRemaining: 0,
        totalRemaining: 0,
        markets: []
    };
}

/**
 * Clear form cache (call periodically)
 */
function clearCache() {
    const now = Date.now();
    for (const key of Object.keys(formCache)) {
        if (now - formCache[key].timestamp > 2 * 60 * 60 * 1000) { // 2 hours
            delete formCache[key];
        }
    }
}

module.exports = {
    analyzeForm,
    calculatePotential,
    clearCache
};
