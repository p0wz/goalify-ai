/**
 * Live Form Analysis Module
 * Analyzes team form and remaining potential for signal generation
 * Replaces momentum detection with form-based analysis
 */

const flashscore = require('./flashscore');
const liveH2H = require('./liveH2H');

// Cache for form data (per match session)
const formCache = {};

/**
 * Analyze form for a match - main entry point
 * @param {string} matchId 
 * @param {string} homeTeam 
 * @param {string} awayTeam 
 * @param {string} score - Current score e.g. "1-0"
 * @param {number} elapsed - Current minute
 * @param {object} liveStats - Live match statistics (optional)
 * @returns {object} Form analysis result with remaining potential
 */
async function analyzeForm(matchId, homeTeam, awayTeam, score, elapsed, liveStats = null) {
    const cacheKey = matchId;
    const isFirstHalf = elapsed <= 45;

    // Check cache (form data doesn't change during match)
    if (formCache[cacheKey]) {
        return calculatePotential(formCache[cacheKey], score, elapsed, liveStats);
    }

    console.log(`[FormAnalysis] Fetching form data for ${homeTeam} vs ${awayTeam}`);

    try {
        // Fetch H2H and Odds data in parallel
        const [h2hData, oddsData] = await Promise.all([
            flashscore.fetchMatchH2H(matchId),
            flashscore.fetchMatchOdds(matchId).catch(err => {
                console.warn(`[FormAnalysis] Odds fetch failed for ${matchId}:`, err.message);
                return null;
            })
        ]);

        if (!h2hData) {
            console.log('[FormAnalysis] No H2H data available');
            return getDefaultResult();
        }

        // Determine Favorite from Odds (if available)
        let favorite = null; // 'HOME', 'AWAY', or null
        if (oddsData && Array.isArray(oddsData)) {
            const bookmaker = oddsData.find(b => b.name === 'bet365' || b.name === 'Unibet' || b.name === '1xBet');
            if (bookmaker && bookmaker.odds) {
                const fullTimeOdds = bookmaker.odds.find(o => o.bettingType === 'HOME_DRAW_AWAY' && o.bettingScope === 'FULL_TIME');
                if (fullTimeOdds && fullTimeOdds.odds && fullTimeOdds.odds.length >= 2) {
                    const homeOpening = parseFloat(fullTimeOdds.odds[0].opening);
                    const awayOpening = parseFloat(fullTimeOdds.odds[1].opening);

                    if (homeOpening < 2.05 && homeOpening < awayOpening) favorite = 'HOME';
                    else if (awayOpening < 2.05 && awayOpening < homeOpening) favorite = 'AWAY';

                    if (favorite) {
                        console.log(`[FormAnalysis] 🦁 Detected Favorite: ${favorite} (Odds: H ${homeOpening} - A ${awayOpening})`);
                    }
                }
            }
        }

        const matches = Array.isArray(h2hData) ? h2hData : (h2hData.DATA || []);

        // NEW: Home/Away Separation
        // Home team's HOME matches only (more relevant for home performance)
        const homeMatches = matches.filter(m =>
            m.home_team?.name === homeTeam
        ).slice(0, 5);

        // Away team's AWAY matches only (more relevant for away performance)
        const awayMatches = matches.filter(m =>
            m.away_team?.name === awayTeam
        ).slice(0, 5);

        // Fallback: If not enough home/away specific matches, use all matches
        const homeMatchesFallback = homeMatches.length >= 2 ? homeMatches : matches.filter(m =>
            m.home_team?.name === homeTeam || m.away_team?.name === homeTeam
        ).slice(0, 5);

        const awayMatchesFallback = awayMatches.length >= 2 ? awayMatches : matches.filter(m =>
            m.home_team?.name === awayTeam || m.away_team?.name === awayTeam
        ).slice(0, 5);

        // Fetch match details for HT scores (last 3 matches each)
        const homeDetails = await fetchMatchDetails(homeMatchesFallback.slice(0, 3), homeTeam);
        const awayDetails = await fetchMatchDetails(awayMatchesFallback.slice(0, 3), awayTeam);

        // NEW: Also fetch older matches for recency weighting
        const homeDetailsOld = await fetchMatchDetails(homeMatchesFallback.slice(3, 5), homeTeam);
        const awayDetailsOld = await fetchMatchDetails(awayMatchesFallback.slice(3, 5), awayTeam);

        // Calculate averages with recency weighting
        const homeStats = calculateTeamStatsWeighted(homeDetails, homeDetailsOld, homeTeam);
        const awayStats = calculateTeamStatsWeighted(awayDetails, awayDetailsOld, awayTeam);

        console.log(`[FormAnalysis] Home (${homeTeam}): FT avg ${homeStats.ftAvg.toFixed(2)}, HT avg ${homeStats.htAvg.toFixed(2)}`);
        console.log(`[FormAnalysis] Away (${awayTeam}): FT avg ${awayStats.ftAvg.toFixed(2)}, HT avg ${awayStats.htAvg.toFixed(2)}`);

        // NEW: Analyze H2H for additional context
        const h2hAnalysis = await liveH2H.analyzeH2H(matchId, homeTeam, awayTeam, score, elapsed);
        if (h2hAnalysis.confidenceBonus) {
            console.log(`[FormAnalysis] H2H Bonus: ${h2hAnalysis.confidenceBonus > 0 ? '+' : ''}${h2hAnalysis.confidenceBonus}%`);
        }

        // Cache the result (now includes H2H)
        formCache[cacheKey] = {
            homeTeam,
            awayTeam,
            homeStats,
            awayStats,
            h2hAnalysis, // NEW: Store H2H analysis
            timestamp: Date.now()
        };

        return calculatePotential(formCache[cacheKey], score, elapsed, liveStats, favorite);

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
 * NEW: Calculate team stats with recency weighting
 * Last 3 matches: 70% weight, Older matches (4-5): 30% weight
 */
function calculateTeamStatsWeighted(recentDetails, oldDetails, teamName) {
    // Calculate recent stats (last 3)
    const recentStats = calculateTeamStats(recentDetails, teamName);

    // Calculate volatility from all available matches
    const allDetails = [...recentDetails, ...(oldDetails || [])];
    const volatility = calculateVolatility(allDetails, teamName);

    // If no old matches, just return recent with volatility
    if (!oldDetails || oldDetails.length === 0) {
        return { ...recentStats, volatility };
    }

    // Calculate old stats (matches 4-5)
    const oldStats = calculateTeamStats(oldDetails, teamName);

    // Weighted average: 70% recent, 30% old
    const RECENT_WEIGHT = 0.70;
    const OLD_WEIGHT = 0.30;

    return {
        ftAvg: (recentStats.ftAvg * RECENT_WEIGHT) + (oldStats.ftAvg * OLD_WEIGHT),
        htAvg: (recentStats.htAvg * RECENT_WEIGHT) + (oldStats.htAvg * OLD_WEIGHT),
        ftConcededAvg: (recentStats.ftConcededAvg * RECENT_WEIGHT) + (oldStats.ftConcededAvg * OLD_WEIGHT),
        htConcededAvg: (recentStats.htConcededAvg * RECENT_WEIGHT) + (oldStats.htConcededAvg * OLD_WEIGHT),
        matchCount: recentDetails.length + oldDetails.length,
        isWeighted: true,
        volatility
    };
}

/**
 * NEW: Calculate volatility (Coefficient of Variation) from match scores
 * Lower CV = more consistent, Higher CV = more volatile
 */
function calculateVolatility(details, teamName) {
    if (!details || details.length < 2) {
        return { cv: 50, isConsistent: false, isVolatile: false }; // Default neutral
    }

    // Extract goals scored by this team in each match
    const scores = details.map(d => {
        if (d.isHome) return d.ftHome;
        return d.ftAway;
    });

    // Calculate mean
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;

    // If mean is 0, avoid division by zero
    if (mean === 0) {
        return { cv: 100, isConsistent: false, isVolatile: true };
    }

    // Calculate standard deviation
    const squaredDiffs = scores.map(s => Math.pow(s - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / scores.length;
    const stdDev = Math.sqrt(avgSquaredDiff);

    // Coefficient of Variation (CV) = (StdDev / Mean) * 100
    const cv = (stdDev / mean) * 100;

    return {
        cv: Math.round(cv),
        isConsistent: cv < 35,   // Very consistent
        isVolatile: cv > 70,     // Very volatile
        scores,
        mean: Math.round(mean * 100) / 100,
        stdDev: Math.round(stdDev * 100) / 100
    };
}

/**
 * Calculates remaining potential with Game State Logic
 */
function calculatePotential(formData, score, elapsed, liveStats = null, favorite = null) {
    const [homeGoals, awayGoals] = score.split('-').map(s => parseInt(s) || 0);
    const scoreDiff = homeGoals - awayGoals;
    const totalGoals = homeGoals + awayGoals;
    const isFirstHalf = elapsed <= 45;

    let reason = [];
    let potentialModifier = 0;
    let confidenceBooster = 0;

    // --- GAME STATE LOGIC ---
    if (favorite) {
        // Rule 1: Dampen Underdog if losing badly to Favorite
        if (favorite === 'HOME' && scoreDiff >= 2) {
            potentialModifier -= 1.0;
            reason.push("📉 Dampened: Favorite winning 2-0+, underdog resistance broken");
        } else if (favorite === 'AWAY' && scoreDiff <= -2) {
            potentialModifier -= 1.0;
            reason.push("📉 Dampened: Favorite winning 0-2+, underdog resistance broken");
        }

        // Rule 2: Boost Favorite if trailing or drawing (Urgency Mode)
        // Only apply if match is beyond 30th minute specific to Favorite
        // Note: Assuming we are analyzing the match as a whole, but we prioritize the Favorite's action
        if (elapsed > 30) {
            if (favorite === 'HOME' && scoreDiff <= 0) {
                potentialModifier += 0.3;
                confidenceBooster += 15;
                reason.push("🦁 Favorite Needs Goal (Trailing/Draw)");
            } else if (favorite === 'AWAY' && scoreDiff >= 0) {
                potentialModifier += 0.3;
                confidenceBooster += 15;
                reason.push("🦁 Favorite Needs Goal (Trailing/Draw)");
            }
        }
    }

    const { homeStats, awayStats } = formData;

    // Get attack and defense stats based on half
    const homeAttack = isFirstHalf ? homeStats.htAvg : homeStats.ftAvg;
    const awayAttack = isFirstHalf ? awayStats.htAvg : awayStats.ftAvg;
    const homeConceded = isFirstHalf ? homeStats.htConcededAvg : homeStats.ftConcededAvg;
    const awayConceded = isFirstHalf ? awayStats.htConcededAvg : awayStats.ftConcededAvg;

    // Calculate combined volatility (average of both teams)
    const homeVolatility = homeStats.volatility || { cv: 50 };
    const awayVolatility = awayStats.volatility || { cv: 50 };
    const combinedCV = (homeVolatility.cv + awayVolatility.cv) / 2;
    const consistencyBonus = getConsistencyBonus(combinedCV);

    // NEW: Calculate tempo bonus from live stats
    const tempoResult = calculateTempo(liveStats, elapsed);
    const tempoBonus = tempoResult.bonus;

    // NEW: Get H2H bonus if available
    const h2hBonus = formData.h2hAnalysis?.confidenceBonus || 0;

    // Combined bonus (consistency + tempo + Game State + H2H)
    const totalBonus = consistencyBonus + tempoBonus + confidenceBooster + h2hBonus;

    // WEIGHTED EXPECTED GOALS:
    // Attack is 70% of the calculation, opponent's defensive weakness is 30%
    // This keeps attack power dominant while considering defense
    const homeExpected = (homeAttack * 0.7) + (awayConceded * 0.3);
    const awayExpected = (awayAttack * 0.7) + (homeConceded * 0.3);

    // Remaining potential per team (with Game State modifier)
    const homeRemaining = (homeExpected - homeGoals) + (potentialModifier / 2);
    const awayRemaining = (awayExpected - awayGoals) + (potentialModifier / 2);
    const totalRemaining = homeRemaining + awayRemaining;

    // Time adjustment (less time = less potential)
    const timeRatio = isFirstHalf
        ? (45 - elapsed) / 45
        : (90 - elapsed) / 45;
    const adjustedRemaining = totalRemaining * Math.max(0.3, timeRatio);

    // Generate market suggestions based on potential (now with combined bonus)
    const markets = selectMarkets(homeRemaining, awayRemaining, homeGoals, awayGoals, elapsed, totalBonus);

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
        // Volatility info
        homeVolatility: homeVolatility.cv,
        awayVolatility: awayVolatility.cv,
        combinedCV: Math.round(combinedCV),
        consistencyBonus,
        // NEW: Tempo info
        tempo: tempoResult.tempo,
        tempoBonus,
        totalBonus,
        liveShots: tempoResult.totalShots,
        liveSoT: tempoResult.totalSoT,
        liveCorners: tempoResult.totalCorners,
        isFirstHalf,
        elapsed,
        score,
        markets,
        reason: generateReason(homeRemaining, awayRemaining, isFirstHalf, homeExpected, awayExpected, consistencyBonus, tempoResult)
    };
}

/**
 * NEW: Calculate tempo from live match stats
 * Tempo = (shots / elapsed) * 90 (normalized to 90 min projection)
 */
function calculateTempo(liveStats, elapsed) {
    if (!liveStats || elapsed < 10) {
        return { tempo: 'normal', bonus: 0, totalShots: 0, totalSoT: 0, totalCorners: 0 };
    }

    const totalShots = (liveStats.shots?.home || 0) + (liveStats.shots?.away || 0);
    const totalSoT = (liveStats.shotsOnTarget?.home || 0) + (liveStats.shotsOnTarget?.away || 0);
    const totalCorners = (liveStats.corners?.home || 0) + (liveStats.corners?.away || 0);

    // Normalize to 90-minute projection
    const projectedShots = (totalShots / elapsed) * 90;
    const projectedSoT = (totalSoT / elapsed) * 90;
    const projectedCorners = (totalCorners / elapsed) * 90;

    // Determine tempo level
    let tempo = 'normal';
    let bonus = 0;

    // High tempo: > 15 projected shots OR > 6 projected SoT
    if (projectedShots >= 18 || projectedSoT >= 8) {
        tempo = 'very_high';
        bonus = 7;
    } else if (projectedShots >= 14 || projectedSoT >= 5) {
        tempo = 'high';
        bonus = 4;
    }
    // Low tempo: < 8 projected shots AND < 3 projected SoT
    else if (projectedShots < 8 && projectedSoT < 3) {
        tempo = 'low';
        bonus = -5;
    } else if (projectedShots < 10 && projectedSoT < 4) {
        tempo = 'slow';
        bonus = -2;
    }

    console.log(`[FormAnalysis] Tempo: ${tempo} (${projectedShots.toFixed(1)} proj shots, ${projectedSoT.toFixed(1)} proj SoT) → ${bonus >= 0 ? '+' : ''}${bonus}%`);

    return {
        tempo,
        bonus,
        totalShots,
        totalSoT,
        totalCorners,
        projectedShots: Math.round(projectedShots * 10) / 10,
        projectedSoT: Math.round(projectedSoT * 10) / 10,
        projectedCorners: Math.round(projectedCorners * 10) / 10
    };
}

/**
 * NEW: Get consistency bonus/penalty based on combined CV
 */
function getConsistencyBonus(combinedCV) {
    if (combinedCV < 30) return 5;      // Very consistent: +5%
    if (combinedCV < 50) return 0;      // Normal: neutral
    if (combinedCV < 80) return -3;     // Volatile: -3%
    return -7;                          // Very volatile: -7%
}

/**
 * Select markets based on remaining potential
 */
function selectMarkets(homeRem, awayRem, homeGoals, awayGoals, elapsed, consistencyBonus = 0) {
    const total = homeGoals + awayGoals;
    const diff = Math.abs(homeGoals - awayGoals);
    const isFirstHalf = elapsed <= 45;
    const markets = [];

    // Both teams have potential
    if (homeRem >= 0.5 && awayRem >= 0.5) {
        if (total === 0 && isFirstHalf) {
            markets.push({ name: 'İY Over 0.5', type: 'OVER', confidence: calculateMarketConfidence(homeRem + awayRem, 'OVER', elapsed, consistencyBonus) });
        }
        if (total === 0 && !isFirstHalf && elapsed <= 70) {
            markets.push({ name: 'Over 1.5', type: 'OVER', confidence: calculateMarketConfidence(homeRem + awayRem, 'OVER', elapsed, consistencyBonus) });
        }
        // Removed BTTS - replaced with next goal market
        if (total >= 1 && elapsed <= 75) {
            markets.push({ name: `Over ${total + 0.5}`, type: 'OVER', confidence: calculateMarketConfidence(homeRem + awayRem, 'OVER', elapsed, consistencyBonus) });
        }
    }

    // Home has potential, away exhausted
    if (homeRem >= 0.8 && awayRem < 0.3) {
        markets.push({ name: 'Home Goal', type: 'HOME_GOAL', confidence: calculateMarketConfidence(homeRem, 'OVER', elapsed, consistencyBonus) });
    }

    // Away has potential, home exhausted
    if (awayRem >= 0.8 && homeRem < 0.3) {
        markets.push({ name: 'Away Goal', type: 'AWAY_GOAL', confidence: calculateMarketConfidence(awayRem, 'OVER', elapsed, consistencyBonus) });
    }

    // Both exhausted
    if (homeRem < 0.3 && awayRem < 0.3) {
        markets.push({ name: `Under ${total + 0.5}`, type: 'UNDER', confidence: calculateMarketConfidence(-(homeRem + awayRem), 'UNDER', elapsed, consistencyBonus) });
        if (homeGoals === awayGoals && elapsed >= 70) {
            markets.push({ name: 'Draw', type: 'DRAW', confidence: calculateMarketConfidence(0.5, 'DRAW', elapsed, consistencyBonus) });
        }
    }

    // High scoring potential
    if (homeRem + awayRem >= 1.5 && elapsed <= 75) {
        markets.push({ name: `Over ${total + 0.5}`, type: 'OVER', confidence: calculateMarketConfidence(homeRem + awayRem, 'OVER', elapsed, consistencyBonus) });
    }

    // Sort by confidence
    return markets.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Calculate market confidence based on potential and timing
 */
function calculateMarketConfidence(potentialValue, marketType, elapsed, consistencyBonus = 0) {
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

    // NEW: Apply consistency bonus/penalty
    base += consistencyBonus;

    return Math.min(92, Math.max(45, base));
}

/**
 * Generate human-readable reason
 */
function generateReason(homeRem, awayRem, isFirstHalf, homeExp, awayExp, consistencyBonus = 0, tempoResult = null) {
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

    // Add consistency info
    if (consistencyBonus > 0) parts.push('✓Tutarlı');
    else if (consistencyBonus < -5) parts.push('⚠️Volatil');
    else if (consistencyBonus < 0) parts.push('~Değişken');

    // NEW: Add tempo info
    if (tempoResult && tempoResult.tempo) {
        if (tempoResult.tempo === 'very_high') parts.push('🔥Yüksek Tempo');
        else if (tempoResult.tempo === 'high') parts.push('⚡Hızlı');
        else if (tempoResult.tempo === 'low') parts.push('💤Düşük Tempo');
        else if (tempoResult.tempo === 'slow') parts.push('🐢Yavaş');
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
// Force deploy update
