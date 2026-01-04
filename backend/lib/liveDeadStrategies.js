/**
 * Live Bot - Dead Match Strategies
 * 6 Under/No Goal strategies based on anti-momentum detection
 */

const antiMomentum = require('./liveAntiMomentum');

// Strategy codes for signal limits
const DEAD_STRATEGY_CODES = {
    FH_LOCK: 'FH_LOCK',           // First Half Lock
    FH_SLEEPY: 'FH_SLEEPY',       // Sleepy First Half
    FH_TACTICAL: 'FH_TACTICAL',   // Tactical Stalemate (1st half)
    LATE_LOCK: 'LATE_LOCK',       // Late Game Lock
    SCORELESS: 'SCORELESS',       // Scoreless Stalemate
    PARKED_BUS: 'PARKED_BUS'      // Parked Bus
};

/**
 * Build signal object for dead match strategies
 */
function buildDeadSignal(match, elapsed, stats, strategy, strategyCode, market, confidence, reason) {
    const homeScore = parseInt(match.home_team?.score) || 0;
    const awayScore = parseInt(match.away_team?.score) || 0;

    return {
        matchId: match.match_id,
        home: match.home_team?.name,
        away: match.away_team?.name,
        league: `${match.country_name}: ${match.league_name}`,
        strategy,
        strategyCode,
        market,
        entryScore: `${homeScore}-${awayScore}`,
        entryMinute: elapsed,
        confidencePercent: Math.min(95, Math.max(45, confidence)),
        reason,
        stats: {
            shots: `${stats?.shots?.home || 0}-${stats?.shots?.away || 0}`,
            sot: `${stats?.shotsOnTarget?.home || 0}-${stats?.shotsOnTarget?.away || 0}`,
            corners: `${stats?.corners?.home || 0}-${stats?.corners?.away || 0}`,
            xG: `${(stats?.xG?.home || 0).toFixed(2)}-${(stats?.xG?.away || 0).toFixed(2)}`
        },
        isDeadMatch: true // Flag for Telegram formatting
    };
}

// ═══════════════════════════════════════════════════════════════
// FIRST HALF STRATEGIES
// ═══════════════════════════════════════════════════════════════

/**
 * Strateji 1: First Half Lock (İY Kilidi)
 * 30'-42', 0-0, very low activity → IY Under 0.5
 */
function analyzeFirstHalfLock(match, elapsed, stats, collapseResult) {
    // Time window: 30-42'
    if (elapsed < 30 || elapsed > 42) return null;

    const homeScore = parseInt(match.home_team?.score) || 0;
    const awayScore = parseInt(match.away_team?.score) || 0;

    // Must be 0-0
    if (homeScore !== 0 || awayScore !== 0) return null;

    // Check if match is absolutely dead
    const deadCheck = antiMomentum.checkAbsoluteDead(elapsed, stats, true);
    if (!deadCheck.isDead) return null;

    // Additional: collapse detection for extra confidence
    let confidence = deadCheck.confidence;
    if (collapseResult?.collapsed) {
        confidence += 10;
    }

    // Close to HT bonus
    if (elapsed >= 40) confidence += 8;

    return buildDeadSignal(
        match, elapsed, stats,
        'İY Bajo 0.5',
        DEAD_STRATEGY_CODES.FH_LOCK,
        'First Half Under 0.5',
        confidence,
        deadCheck.reason
    );
}

/**
 * Strateji 2: Sleepy First Half (Uyuyan İlk Yarı)
 * 25'-38', 0-0, total shots < 3, corners < 2 → IY 0-0
 */
function analyzeSleepyFirstHalf(match, elapsed, stats, collapseResult) {
    // Time window: 25-38'
    if (elapsed < 25 || elapsed > 38) return null;

    const homeScore = parseInt(match.home_team?.score) || 0;
    const awayScore = parseInt(match.away_team?.score) || 0;

    // Must be 0-0
    if (homeScore !== 0 || awayScore !== 0) return null;

    const totalShots = (stats?.shots?.home || 0) + (stats?.shots?.away || 0);
    const totalCorners = (stats?.corners?.home || 0) + (stats?.corners?.away || 0);
    const homePoss = stats?.possession?.home || 50;

    // Very low activity
    if (totalShots >= 3 || totalCorners >= 2) return null;

    // Balanced possession (both teams cautious)
    const isPossBalanced = homePoss >= 45 && homePoss <= 55;

    let confidence = 55;

    if (totalShots === 0) confidence += 15;
    else if (totalShots === 1) confidence += 10;

    if (isPossBalanced) confidence += 8;

    if (elapsed >= 35) confidence += 10;

    if (collapseResult?.collapsed) confidence += 8;

    return buildDeadSignal(
        match, elapsed, stats,
        'İY 0-0 Skor',
        DEAD_STRATEGY_CODES.FH_SLEEPY,
        'First Half 0-0',
        confidence,
        `Sleepy 1H: ${totalShots}S, ${totalCorners}C, ${homePoss}% poss`
    );
}

/**
 * Strateji 3: Tactical Stalemate (Taktik Çıkmaz)
 * 35'-43', 0-0 or 1-1, no activity in last 15min → HT current score
 */
function analyzeTacticalStalemate(match, elapsed, stats, collapseResult) {
    // Time window: 35-43'
    if (elapsed < 35 || elapsed > 43) return null;

    const homeScore = parseInt(match.home_team?.score) || 0;
    const awayScore = parseInt(match.away_team?.score) || 0;

    // 0-0 or 1-1
    if (!(homeScore === 0 && awayScore === 0) && !(homeScore === 1 && awayScore === 1)) {
        return null;
    }

    // Must have collapse (no activity recently)
    if (!collapseResult?.collapsed) return null;

    let confidence = 58;

    // Timeframe bonus
    if (collapseResult.timeframe >= 10) confidence += 12;
    else if (collapseResult.timeframe >= 8) confidence += 8;

    // Close to HT
    if (elapsed >= 42) confidence += 10;
    else if (elapsed >= 40) confidence += 5;

    const currentScore = `${homeScore}-${awayScore}`;
    const market = homeScore === 0 ? 'First Half 0-0' : 'First Half 1-1';

    return buildDeadSignal(
        match, elapsed, stats,
        `İY ${currentScore} Skor`,
        DEAD_STRATEGY_CODES.FH_TACTICAL,
        market,
        confidence,
        collapseResult.reason
    );
}

// ═══════════════════════════════════════════════════════════════
// SECOND HALF STRATEGIES
// ═══════════════════════════════════════════════════════════════

/**
 * Strateji 4: Late Game Lock (Geç Oyun Kilidi)
 * 65'-80', any low score, very low recent activity → Under 0.5 remaining
 */
function analyzeLateGameLock(match, elapsed, stats, collapseResult) {
    // Time window: 65-80'
    if (elapsed < 65 || elapsed > 80) return null;

    const homeScore = parseInt(match.home_team?.score) || 0;
    const awayScore = parseInt(match.away_team?.score) || 0;
    const scoreDiff = Math.abs(homeScore - awayScore);

    // Max 1 goal difference
    if (scoreDiff > 1) return null;

    // Check absolute dead or collapse
    const deadCheck = antiMomentum.checkAbsoluteDead(elapsed, stats, false);
    const hasCriteria = deadCheck.isDead || collapseResult?.collapsed;

    if (!hasCriteria) return null;

    let confidence = 52;

    if (deadCheck.isDead) confidence += deadCheck.confidence - 50;
    if (collapseResult?.collapsed) confidence += 12;

    // Time bonus
    if (elapsed >= 78) confidence += 15;
    else if (elapsed >= 75) confidence += 10;
    else if (elapsed >= 70) confidence += 5;

    const reason = collapseResult?.collapsed
        ? collapseResult.reason
        : deadCheck.reason;

    return buildDeadSignal(
        match, elapsed, stats,
        'Kalan Süre Under 0.5',
        DEAD_STRATEGY_CODES.LATE_LOCK,
        'No More Goals',
        confidence,
        reason
    );
}

/**
 * Strateji 5: Scoreless Stalemate (Golsüz Çıkmaz)
 * 55'-75', 0-0, low xG → 0-0 or Under 1.5
 */
function analyzeScorelessStalemate(match, elapsed, stats, collapseResult) {
    // Time window: 55-75'
    if (elapsed < 55 || elapsed > 75) return null;

    const homeScore = parseInt(match.home_team?.score) || 0;
    const awayScore = parseInt(match.away_team?.score) || 0;

    // Must be 0-0
    if (homeScore !== 0 || awayScore !== 0) return null;

    const stalemateCheck = antiMomentum.checkScorelessStalemate(elapsed, stats, homeScore, awayScore);
    if (!stalemateCheck.isStalemate) return null;

    let confidence = stalemateCheck.confidence;

    if (collapseResult?.collapsed) confidence += 10;

    // Decide between 0-0 and Under 1.5 based on confidence
    const market = confidence >= 70 ? 'Match 0-0' : 'Under 1.5';
    const strategy = confidence >= 70 ? 'Maç Sonucu 0-0' : 'Under 1.5 Goals';

    return buildDeadSignal(
        match, elapsed, stats,
        strategy,
        DEAD_STRATEGY_CODES.SCORELESS,
        market,
        confidence,
        stalemateCheck.reason
    );
}

/**
 * Strateji 6: Parked Bus (Otobüs Parkı)
 * 60'-82', 1-0 or 2-0, leading team not attacking → No more goals
 */
function analyzeParkedBus(match, elapsed, stats, collapseResult) {
    // Time window: 60-82'
    if (elapsed < 60 || elapsed > 82) return null;

    const homeScore = parseInt(match.home_team?.score) || 0;
    const awayScore = parseInt(match.away_team?.score) || 0;

    const parkedCheck = antiMomentum.checkParkedBus(elapsed, stats, homeScore, awayScore);
    if (!parkedCheck.isParked) return null;

    let confidence = parkedCheck.confidence;

    if (collapseResult?.collapsed) confidence += 8;

    // Time bonus
    if (elapsed >= 78) confidence += 12;
    else if (elapsed >= 72) confidence += 6;

    return buildDeadSignal(
        match, elapsed, stats,
        'Gol Olmaz',
        DEAD_STRATEGY_CODES.PARKED_BUS,
        'No More Goals',
        confidence,
        parkedCheck.reason
    );
}

/**
 * Analyze match for all dead match strategies
 * Returns first matching strategy (priority order)
 */
function analyzeDeadMatch(match, elapsed, stats, collapseResult) {
    // First Half strategies (priority for FH window)
    if (elapsed < 45) {
        let signal = analyzeFirstHalfLock(match, elapsed, stats, collapseResult);
        if (signal) return signal;

        signal = analyzeSleepyFirstHalf(match, elapsed, stats, collapseResult);
        if (signal) return signal;

        signal = analyzeTacticalStalemate(match, elapsed, stats, collapseResult);
        if (signal) return signal;
    }

    // Second Half strategies
    if (elapsed >= 46) {
        let signal = analyzeScorelessStalemate(match, elapsed, stats, collapseResult);
        if (signal) return signal;

        signal = analyzeLateGameLock(match, elapsed, stats, collapseResult);
        if (signal) return signal;

        signal = analyzeParkedBus(match, elapsed, stats, collapseResult);
        if (signal) return signal;
    }

    return null;
}

module.exports = {
    analyzeDeadMatch,
    analyzeFirstHalfLock,
    analyzeSleepyFirstHalf,
    analyzeTacticalStalemate,
    analyzeLateGameLock,
    analyzeScorelessStalemate,
    analyzeParkedBus,
    DEAD_STRATEGY_CODES
};
