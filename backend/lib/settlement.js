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

    // Over/Under
    if (marketLower.includes('over 0.5') || marketLower === 'over05') return totalGoals >= 1;
    if (marketLower.includes('over 1.5') || marketLower === 'over15') return totalGoals >= 2;
    if (marketLower.includes('over 2.5') || marketLower === 'over25') return totalGoals >= 3;
    if (marketLower.includes('over 3.5') || marketLower === 'over35') return totalGoals >= 4;
    if (marketLower.includes('under 1.5') || marketLower === 'under15') return totalGoals <= 1;
    if (marketLower.includes('under 2.5') || marketLower === 'under25') return totalGoals <= 2;
    if (marketLower.includes('under 3.5') || marketLower === 'under35') return totalGoals <= 3;
    if (marketLower.includes('under 4.5') || marketLower === 'under45') return totalGoals <= 4;

    // BTTS
    if (marketLower === 'btts' || marketLower.includes('btts')) {
        return homeGoals >= 1 && awayGoals >= 1;
    }

    // 1X2
    if (marketLower.includes('home win') || marketLower === 'ms1') return homeGoals > awayGoals;
    if (marketLower.includes('away win') || marketLower === 'ms2') return awayGoals > homeGoals;
    if (marketLower.includes('draw') || marketLower === 'x') return homeGoals === awayGoals;

    // Double Chance
    if (marketLower.includes('1x') || marketLower.includes('double chance')) {
        return homeGoals >= awayGoals;
    }
    if (marketLower.includes('x2')) return awayGoals >= homeGoals;
    if (marketLower.includes('12')) return homeGoals !== awayGoals;

    // Home Goals
    if (marketLower.includes('home over 1.5') || marketLower.includes('home o1.5')) return homeGoals >= 2;
    if (marketLower.includes('home over 0.5') || marketLower.includes('home o0.5')) return homeGoals >= 1;

    // Away Goals
    if (marketLower.includes('away over 0.5') || marketLower.includes('dep 0.5')) return awayGoals >= 1;
    if (marketLower.includes('away over 1.5') || marketLower.includes('dep 1.5')) return awayGoals >= 2;

    // First Half
    if (marketLower.includes('first half over 0.5') || marketLower.includes('1h over 0.5') || marketLower.includes('1y 0.5')) {
        if (htHome !== null && htAway !== null) {
            return (htHome + htAway) >= 1;
        }
        return totalGoals >= 1; // Fallback
    }

    // MS1 & 1.5 Üst
    if (marketLower.includes('ms1') && marketLower.includes('1.5')) {
        return homeGoals > awayGoals && totalGoals >= 2;
    }

    // 1X + 1.5 Üst
    if (marketLower.includes('1x') && marketLower.includes('1.5')) {
        return homeGoals >= awayGoals && totalGoals >= 2;
    }

    // Handicap
    if (marketLower.includes('hnd') || marketLower.includes('handicap')) {
        if (marketLower.includes('ms1') || marketLower.includes('home')) {
            return (homeGoals - awayGoals) >= 2;
        }
        if (marketLower.includes('ms2') || marketLower.includes('away')) {
            return (awayGoals - homeGoals) >= 2;
        }
    }

    // Ev Herhangi Yarı
    if (marketLower.includes('ev herhangi') || marketLower.includes('home wins either half')) {
        if (htHome !== null && htAway !== null) {
            const homeWon1H = htHome > htAway;
            const h2Home = homeGoals - htHome;
            const h2Away = awayGoals - htAway;
            const homeWon2H = h2Home > h2Away;
            return homeWon1H || homeWon2H;
        }
        return homeGoals > awayGoals; // Fallback
    }

    // Dep DNB
    if (marketLower.includes('dep dnb') || marketLower.includes('away dnb')) {
        if (awayGoals > homeGoals) return 'WON';
        if (awayGoals === homeGoals) return 'REFUND';
        return 'LOST';
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
    const result = await flashscore.fetchMatchDetails(bet.matchId);
    if (!result) {
        return { success: false, error: 'Could not fetch match details' };
    }

    const parsed = flashscore.parseMatchResult(result);
    if (!parsed) {
        return { success: false, error: 'Could not parse match result' };
    }

    if (!parsed.isFinished) {
        return { success: false, error: 'Match not finished yet' };
    }

    const evalResult = evaluatePrediction(
        bet.market,
        parsed.homeGoals,
        parsed.awayGoals,
        parsed.htHome,
        parsed.htAway
    );

    if (evalResult === null) {
        return { success: false, error: 'Unknown market type' };
    }

    const status = typeof evalResult === 'string' ? evalResult : (evalResult ? 'WON' : 'LOST');

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
