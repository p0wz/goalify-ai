/**
 * Auto-Settlement System
 * Settles approved bets after match completion
 */

const flashscore = require('./flashscore');

const SETTLEMENT_DELAY_HOURS = 3;

/**
 * Evaluate prediction based on market type
 */
function evaluatePrediction(market, homeGoals, awayGoals, htHome = null, htAway = null) {
    const totalGoals = homeGoals + awayGoals;
    const marketLower = (market || '').toLowerCase().trim();

    // Helper to return status
    const result = (condition) => condition ? 'WON' : 'LOST';

    // Over/Under
    if (marketLower.includes('over 0.5') || marketLower === 'over05') return result(totalGoals >= 1);
    if (marketLower.includes('over 1.5') || marketLower === 'over15') return result(totalGoals >= 2);
    if (marketLower.includes('over 2.5') || marketLower === 'over25') return result(totalGoals >= 3);
    if (marketLower.includes('over 3.5') || marketLower === 'over35') return result(totalGoals >= 4);
    if (marketLower.includes('under 1.5') || marketLower === 'under15') return result(totalGoals <= 1);
    if (marketLower.includes('under 2.5') || marketLower === 'under25') return result(totalGoals <= 2);
    if (marketLower.includes('under 3.5') || marketLower === 'under35') return result(totalGoals <= 3);
    if (marketLower.includes('under 4.5') || marketLower === 'under45') return result(totalGoals <= 4);

    // BTTS
    if (marketLower === 'btts' || marketLower.includes('btts') || marketLower.includes('kg var')) {
        return result(homeGoals >= 1 && awayGoals >= 1);
    }
    if (marketLower.includes('btts no') || marketLower.includes('kg yok')) {
        return result(homeGoals === 0 || awayGoals === 0);
    }

    // 1X2
    if (marketLower.includes('home win') || marketLower === 'ms1') return result(homeGoals > awayGoals);
    if (marketLower.includes('away win') || marketLower === 'ms2') return result(awayGoals > homeGoals);
    if (marketLower.includes('draw') || marketLower === 'x' || marketLower === 'msx') return result(homeGoals === awayGoals);

    // Double Chance
    if (marketLower.includes('1x') || marketLower.includes('double chance')) {
        return result(homeGoals >= awayGoals);
    }
    if (marketLower.includes('x2')) return result(awayGoals >= homeGoals);
    if (marketLower.includes('12')) return result(homeGoals !== awayGoals);

    // Home Goals
    if (marketLower.includes('home over 1.5') || marketLower.includes('home o1.5')) return result(homeGoals >= 2);
    if (marketLower.includes('home over 0.5') || marketLower.includes('home o0.5')) return result(homeGoals >= 1);

    // Away Goals
    if (marketLower.includes('away over 0.5') || marketLower.includes('dep 0.5')) return result(awayGoals >= 1);
    if (marketLower.includes('away over 1.5') || marketLower.includes('dep 1.5')) return result(awayGoals >= 2);

    // DNB (Draw No Bet) / Beraberlikte İade
    // Home DNB
    if (marketLower.includes('home dnb') || marketLower.includes('ev dnb') || marketLower.includes('dnb 1')) {
        if (homeGoals > awayGoals) return 'WON';
        if (homeGoals === awayGoals) return 'REFUND';
        return 'LOST';
    }
    // Away DNB
    if (marketLower.includes('away dnb') || marketLower.includes('dep dnb') || marketLower.includes('dnb 2')) {
        if (awayGoals > homeGoals) return 'WON';
        if (awayGoals === homeGoals) return 'REFUND';
        return 'LOST';
    }

    // First Half Over 0.5
    if (marketLower.includes('first half over 0.5') || marketLower.includes('1h over 0.5') || marketLower.includes('1y 0.5')) {
        if (htHome !== null && htAway !== null) {
            return result((htHome + htAway) >= 1);
        }
        console.log(`[Settlement] Missing HT scores for ${market} (HT: ${htHome}-${htAway})`);
        return null;
    }

    // First Half Over 1.5
    if (marketLower.includes('first half over 1.5') || marketLower.includes('1h over 1.5') || marketLower.includes('1y 1.5')) {
        if (htHome !== null && htAway !== null) {
            return result((htHome + htAway) >= 2);
        }
        console.log(`[Settlement] Missing HT scores for ${market} (HT: ${htHome}-${htAway})`);
        return null;
    }

    // First Half Under 0.5
    if (marketLower.includes('first half under 0.5') || marketLower.includes('1h under 0.5') || marketLower.includes('1y 0.5 alt')) {
        if (htHome !== null && htAway !== null) {
            return result((htHome + htAway) === 0);
        }
        console.log(`[Settlement] Missing HT scores for ${market} (HT: ${htHome}-${htAway})`);
        return null;
    }

    // Second Half Over 0.5
    if (marketLower.includes('2h over 0.5') || marketLower.includes('2y 0.5')) {
        if (htHome !== null && htAway !== null) {
            const h2Goals = (homeGoals - htHome) + (awayGoals - htAway);
            return result(h2Goals >= 1);
        }
        console.log(`[Settlement] Missing HT scores for ${market} (HT: ${htHome}-${htAway})`);
        return null;
    }

    // Second Half Over 1.5
    if (marketLower.includes('2h over 1.5') || marketLower.includes('2y 1.5')) {
        if (htHome !== null && htAway !== null) {
            const h2Goals = (homeGoals - htHome) + (awayGoals - htAway);
            return result(h2Goals >= 2);
        }
        console.log(`[Settlement] Missing HT scores for ${market} (HT: ${htHome}-${htAway})`);
        return null;
    }

    // MS1 & 1.5 Üst
    if (marketLower.includes('ms1') && marketLower.includes('1.5')) {
        return result(homeGoals > awayGoals && totalGoals >= 2);
    }

    // 1X + 1.5 Üst
    if (marketLower.includes('1x') && marketLower.includes('1.5')) {
        return result(homeGoals >= awayGoals && totalGoals >= 2);
    }

    // Handicap
    if (marketLower.includes('hnd') || marketLower.includes('handicap')) {
        if (marketLower.includes('ms1') || marketLower.includes('home')) {
            return result((homeGoals - awayGoals) >= 2);
        }
        if (marketLower.includes('ms2') || marketLower.includes('away')) {
            return result((awayGoals - homeGoals) >= 2);
        }
    }

    // ============ COMBINATION MARKETS ============

    // BTTS + Over 2.5
    if (marketLower.includes('btts') && marketLower.includes('over 2.5')) {
        return result(homeGoals >= 1 && awayGoals >= 1 && totalGoals >= 3);
    }

    // 2X + OVER/UNDER (Away or Draw + Goals)
    if (marketLower.includes('2x')) {
        const doubleChanceX2 = awayGoals >= homeGoals; // Draw or Away Win
        if (marketLower.includes('over 1.5')) return result(doubleChanceX2 && totalGoals >= 2);
        if (marketLower.includes('over 2.5')) return result(doubleChanceX2 && totalGoals >= 3);
        if (marketLower.includes('under 3.5')) return result(doubleChanceX2 && totalGoals <= 3);
        if (marketLower.includes('under 4.5')) return result(doubleChanceX2 && totalGoals <= 4);
        if (marketLower.includes('under 5.5')) return result(doubleChanceX2 && totalGoals <= 5);
        // Plain 2X without goals
        return result(doubleChanceX2);
    }

    // 1X + OVER/UNDER (Home or Draw + Goals)
    if (marketLower.includes('1x')) {
        const doubleChance1X = homeGoals >= awayGoals; // Draw or Home Win
        if (marketLower.includes('over 1.5')) return result(doubleChance1X && totalGoals >= 2);
        if (marketLower.includes('over 2.5')) return result(doubleChance1X && totalGoals >= 3);
        if (marketLower.includes('under 3.5')) return result(doubleChance1X && totalGoals <= 3);
        if (marketLower.includes('under 4.5')) return result(doubleChance1X && totalGoals <= 4);
        if (marketLower.includes('under 5.5')) return result(doubleChance1X && totalGoals <= 5);
        // Plain 1X without goals
        return result(doubleChance1X);
    }

    // 2 + OVER/UNDER (Away Win + Goals)
    if (marketLower.match(/^2\s*\+/) || marketLower.match(/\s2\s*\+/)) {
        const awayWin = awayGoals > homeGoals;
        if (marketLower.includes('over 1.5')) return result(awayWin && totalGoals >= 2);
        if (marketLower.includes('over 2.5')) return result(awayWin && totalGoals >= 3);
        if (marketLower.includes('under 3.5')) return result(awayWin && totalGoals <= 3);
        if (marketLower.includes('under 4.5')) return result(awayWin && totalGoals <= 4);
        if (marketLower.includes('under 5.5')) return result(awayWin && totalGoals <= 5);
    }

    // 1 + OVER/UNDER (Home Win + Goals)
    if (marketLower.match(/^1\s*\+/) || marketLower.match(/\s1\s*\+/)) {
        const homeWin = homeGoals > awayGoals;
        if (marketLower.includes('over 1.5')) return result(homeWin && totalGoals >= 2);
        if (marketLower.includes('over 2.5')) return result(homeWin && totalGoals >= 3);
        if (marketLower.includes('under 3.5')) return result(homeWin && totalGoals <= 3);
        if (marketLower.includes('under 4.5')) return result(homeWin && totalGoals <= 4);
        if (marketLower.includes('under 5.5')) return result(homeWin && totalGoals <= 5);
    }

    // Ev Herhangi Yarı (Home Wins Either Half)
    if (marketLower.includes('ev herhangi') || marketLower.includes('home wins either half')) {
        if (htHome !== null && htAway !== null) {
            const homeWon1H = htHome > htAway;
            const h2Home = homeGoals - htHome;
            const h2Away = awayGoals - htAway;
            const homeWon2H = h2Home > h2Away;
            return result(homeWon1H || homeWon2H);
        }
        return result(homeGoals > awayGoals); // Fallback
    }

    // Away Wins Either Half (Dep Yarı Kazanır)
    if (marketLower.includes('dep herhangi') || marketLower.includes('away wins either half')) {
        if (htHome !== null && htAway !== null) {
            const awayWon1H = htAway > htHome;
            const h2Home = homeGoals - htHome;
            const h2Away = awayGoals - htAway;
            const awayWon2H = h2Away > h2Home;
            return result(awayWon1H || awayWon2H);
        }
        return result(awayGoals > homeGoals); // Fallback
    }

    console.log(`[Settlement] Unknown market: ${market}`);
    return null;
}

/**
 * Check if bet is ready for settlement
 */
function isReadyForSettlement(bet) {
    const matchTime = bet.matchTime || bet.timestamp;
    if (matchTime && !isNaN(parseFloat(matchTime))) {
        const matchTimestamp = parseFloat(matchTime) * 1000;
        const settlementTime = matchTimestamp + (SETTLEMENT_DELAY_HOURS * 60 * 60 * 1000);
        return Date.now() >= settlementTime;
    }

    // Fallback: approved more than 4 hours ago
    if (bet.approvedAt) {
        const approvedAt = new Date(bet.approvedAt);
        const hoursAgo = (Date.now() - approvedAt.getTime()) / (1000 * 60 * 60);
        return hoursAgo >= 4;
    }

    return false;
}

/**
 * Settle a single bet
 */
async function settleBet(bet) {
    console.log(`[Settlement] Processing bet ${bet.id} (Match: ${bet.matchId}, Market: ${bet.market})`);

    // 1. Fetch Match Details
    console.log(`[Settlement] Fetching details for match ${bet.matchId}...`);
    const result = await flashscore.fetchMatchDetails(bet.matchId);
    if (!result) {
        console.error(`[Settlement] FAILED: Could not fetch match details for ${bet.matchId}`);
        return { success: false, error: 'Could not fetch match details' };
    }

    // 2. Parse Result
    const parsed = flashscore.parseMatchResult(result);
    if (!parsed) {
        console.error(`[Settlement] FAILED: Could not parse match result for ${bet.matchId}`);
        console.log(`[Settlement] Raw Result Data Preview:`, JSON.stringify(result).substring(0, 200));
        return { success: false, error: 'Could not parse match result' };
    }

    console.log(`[Settlement] Parsed Result:`, JSON.stringify(parsed));

    if (!parsed.isFinished) {
        console.log(`[Settlement] SKIPPED: Match not finished yet (Status: ${parsed.status})`);
        return { success: false, error: 'Match not finished yet' };
    }

    // 3. Evaluate Result
    console.log(`[Settlement] Evaluating market '${bet.market}' against result...`);
    const evalResult = evaluatePrediction(
        bet.market,
        parsed.homeGoals,
        parsed.awayGoals,
        parsed.htHome,
        parsed.htAway
    );

    if (evalResult === null) {
        console.error(`[Settlement] FAILED: Unknown market type '${bet.market}'`);
        return { success: false, error: 'Unknown market type' };
    }

    console.log(`[Settlement] Evaluation Outcome: ${evalResult}`);

    const status = evalResult;

    return {
        success: true,
        status,
        finalScore: parsed.finalScore,
        homeGoals: parsed.homeGoals,
        awayGoals: parsed.awayGoals,
        htHome: parsed.htHome,
        htAway: parsed.htAway
    };
}

module.exports = {
    evaluatePrediction,
    isReadyForSettlement,
    settleBet,
    SETTLEMENT_DELAY_HOURS
};
