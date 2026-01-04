/**
 * Live Bot - Anti-Momentum Detection Module
 * Detects "dead matches" with no activity for Under/No Goal signals
 */

// Match history buffer (shared with momentum module concept)
const DEAD_MATCH_HISTORY = {};
const MAX_HISTORY_LENGTH = 4;
const LOOKBACK_MS = 12 * 60 * 1000; // 12 minutes

// Dead match thresholds
const DEAD_THRESHOLDS = {
    // Absolute dead match criteria
    ABSOLUTE: {
        maxShots: 6,
        maxSoT: 2,
        maxCorners: 4,
        maxxG: 0.6
    },
    // First half criteria (stricter for shorter time)
    FIRST_HALF: {
        maxShots: 4,
        maxSoT: 1,
        maxCorners: 2,
        maxxG: 0.4
    },
    // Momentum collapse (no change in lookback period)
    COLLAPSE: {
        maxDeltaShots: 1,
        maxDeltaSoT: 0,
        maxDeltaCorners: 1,
        maxDeltaxG: 0.1
    }
};

/**
 * Record match stats for dead match tracking
 */
function recordStats(matchId, stats, score = '0-0') {
    if (!DEAD_MATCH_HISTORY[matchId]) {
        DEAD_MATCH_HISTORY[matchId] = [];
    }

    DEAD_MATCH_HISTORY[matchId].push({
        timestamp: Date.now(),
        score,
        stats: { ...stats }
    });

    // Keep only last N snapshots
    if (DEAD_MATCH_HISTORY[matchId].length > MAX_HISTORY_LENGTH) {
        DEAD_MATCH_HISTORY[matchId].shift();
    }
}

/**
 * Get match history
 */
function getHistory(matchId) {
    return DEAD_MATCH_HISTORY[matchId] || [];
}

/**
 * Clean old history entries
 */
function cleanOldHistory() {
    const now = Date.now();
    for (const matchId of Object.keys(DEAD_MATCH_HISTORY)) {
        const history = DEAD_MATCH_HISTORY[matchId];
        if (history.length > 0) {
            const lastEntry = history[history.length - 1];
            if ((now - lastEntry.timestamp) > LOOKBACK_MS * 2) {
                delete DEAD_MATCH_HISTORY[matchId];
            }
        }
    }
}

/**
 * Check if match is "absolutely dead"
 * Returns: { isDead: boolean, reason: string, confidence: number }
 */
function checkAbsoluteDead(elapsed, stats, isFirstHalf = false) {
    const thresholds = isFirstHalf ? DEAD_THRESHOLDS.FIRST_HALF : DEAD_THRESHOLDS.ABSOLUTE;

    const totalShots = (stats?.shots?.home || 0) + (stats?.shots?.away || 0);
    const totalSoT = (stats?.shotsOnTarget?.home || 0) + (stats?.shotsOnTarget?.away || 0);
    const totalCorners = (stats?.corners?.home || 0) + (stats?.corners?.away || 0);
    const totalxG = (stats?.xG?.home || 0) + (stats?.xG?.away || 0);

    const checks = {
        lowShots: totalShots <= thresholds.maxShots,
        lowSoT: totalSoT <= thresholds.maxSoT,
        lowCorners: totalCorners <= thresholds.maxCorners,
        lowxG: totalxG <= thresholds.maxxG
    };

    // Need at least 3 of 4 criteria to pass
    const passedCount = Object.values(checks).filter(v => v).length;
    const isDead = passedCount >= 3;

    if (!isDead) {
        return { isDead: false, reason: null, confidence: 0 };
    }

    // Calculate confidence based on how dead the match is
    let confidence = 50;

    // Bonus for very low stats
    if (totalxG < 0.3) confidence += 12;
    else if (totalxG < 0.5) confidence += 8;

    if (totalSoT === 0) confidence += 10;
    else if (totalSoT === 1) confidence += 5;

    if (totalShots < 3) confidence += 8;

    // Time-based bonus
    if (isFirstHalf) {
        if (elapsed >= 35) confidence += 10; // Close to HT
        else if (elapsed >= 30) confidence += 5;
    } else {
        if (elapsed >= 75) confidence += 15;
        else if (elapsed >= 70) confidence += 10;
        else if (elapsed >= 65) confidence += 5;
    }

    const reason = `Dead Match: ${totalShots}S, ${totalSoT}SoT, ${totalxG.toFixed(2)}xG`;

    return { isDead: true, reason, confidence, stats: { shots: totalShots, sot: totalSoT, xG: totalxG, corners: totalCorners } };
}

/**
 * Detect momentum collapse (no activity increase in lookback period)
 * Returns: { collapsed: boolean, reason: string, timeframe: number }
 */
function detectCollapse(matchId, currentStats, currentScore = '0-0') {
    const history = getHistory(matchId);
    const now = Date.now();

    if (history.length === 0) {
        return { collapsed: false, reason: 'No history yet' };
    }

    // Get current totals
    const currentShots = (currentStats?.shots?.home || 0) + (currentStats?.shots?.away || 0);
    const currentSoT = (currentStats?.shotsOnTarget?.home || 0) + (currentStats?.shotsOnTarget?.away || 0);
    const currentCorners = (currentStats?.corners?.home || 0) + (currentStats?.corners?.away || 0);
    const currentxG = (currentStats?.xG?.home || 0) + (currentStats?.xG?.away || 0);

    // Check oldest snapshot within lookback
    for (let i = 0; i < history.length; i++) {
        const snapshot = history[i];

        // Stop if score changed
        if (snapshot.score && snapshot.score !== currentScore) {
            return { collapsed: false, reason: 'Score changed' };
        }

        const timeDiffMs = now - snapshot.timestamp;
        const timeDiffMins = Math.round(timeDiffMs / 60000);

        // Skip if too old
        if (timeDiffMs > LOOKBACK_MS) continue;

        const oldShots = (snapshot.stats?.shots?.home || 0) + (snapshot.stats?.shots?.away || 0);
        const oldSoT = (snapshot.stats?.shotsOnTarget?.home || 0) + (snapshot.stats?.shotsOnTarget?.away || 0);
        const oldCorners = (snapshot.stats?.corners?.home || 0) + (snapshot.stats?.corners?.away || 0);
        const oldxG = (snapshot.stats?.xG?.home || 0) + (snapshot.stats?.xG?.away || 0);

        const deltaShots = currentShots - oldShots;
        const deltaSoT = currentSoT - oldSoT;
        const deltaCorners = currentCorners - oldCorners;
        const deltaxG = currentxG - oldxG;

        // Check for collapse (no significant activity)
        const isCollapsed =
            deltaShots <= DEAD_THRESHOLDS.COLLAPSE.maxDeltaShots &&
            deltaSoT <= DEAD_THRESHOLDS.COLLAPSE.maxDeltaSoT &&
            deltaCorners <= DEAD_THRESHOLDS.COLLAPSE.maxDeltaCorners &&
            deltaxG <= DEAD_THRESHOLDS.COLLAPSE.maxDeltaxG;

        if (isCollapsed && timeDiffMins >= 6) { // At least 6 minutes of inactivity
            return {
                collapsed: true,
                reason: `No activity in ~${timeDiffMins}min (Δ${deltaShots}S, Δ${deltaSoT}SoT)`,
                timeframe: timeDiffMins,
                deltas: { shots: deltaShots, sot: deltaSoT, corners: deltaCorners, xG: deltaxG }
            };
        }
    }

    return { collapsed: false, reason: 'Activity detected' };
}

/**
 * Analyze if match is a "Parked Bus" scenario
 * Leading team has stopped attacking
 */
function checkParkedBus(elapsed, stats, homeScore, awayScore) {
    // Must be leading by 1-2 goals
    const scoreDiff = homeScore - awayScore;
    if (Math.abs(scoreDiff) < 1 || Math.abs(scoreDiff) > 2) {
        return { isParked: false };
    }

    const leadingTeam = scoreDiff > 0 ? 'home' : 'away';
    const trailingTeam = scoreDiff > 0 ? 'away' : 'home';

    // Check if leading team has stopped attacking
    const leadingShots = stats?.shots?.[leadingTeam] || 0;
    const leadingSoT = stats?.shotsOnTarget?.[leadingTeam] || 0;

    // Very conservative attack from leading team
    const expectedShots = Math.floor(elapsed * 0.08); // ~0.08 shots per minute per team
    const isParked = leadingShots < expectedShots * 0.5; // Less than 50% of expected

    if (!isParked) {
        return { isParked: false };
    }

    let confidence = 55;

    // Trailing team also not dangerous
    const trailingSoT = stats?.shotsOnTarget?.[trailingTeam] || 0;
    if (trailingSoT < 2) confidence += 10;

    // Time bonus
    if (elapsed >= 75) confidence += 12;
    else if (elapsed >= 70) confidence += 8;

    return {
        isParked: true,
        leadingTeam,
        reason: `Parked Bus: ${leadingTeam === 'home' ? homeScore : awayScore}-${leadingTeam === 'home' ? awayScore : homeScore}, leading team ${leadingShots}S`,
        confidence
    };
}

/**
 * Check for scoreless stalemate (0-0 with very low xG)
 */
function checkScorelessStalemate(elapsed, stats, homeScore, awayScore) {
    // Must be 0-0
    if (homeScore !== 0 || awayScore !== 0) {
        return { isStalemate: false };
    }

    const totalxG = (stats?.xG?.home || 0) + (stats?.xG?.away || 0);
    const totalSoT = (stats?.shotsOnTarget?.home || 0) + (stats?.shotsOnTarget?.away || 0);

    // Very low expected goals
    const isStalemate = totalxG < 0.8 && totalSoT < 4;

    if (!isStalemate) {
        return { isStalemate: false };
    }

    let confidence = 55;

    if (totalxG < 0.4) confidence += 15;
    else if (totalxG < 0.6) confidence += 10;

    if (totalSoT < 2) confidence += 10;

    // Time-based
    if (elapsed >= 70) confidence += 12;
    else if (elapsed >= 60) confidence += 8;

    return {
        isStalemate: true,
        reason: `Scoreless Stalemate: 0-0, ${totalxG.toFixed(2)}xG, ${totalSoT}SoT`,
        confidence
    };
}

module.exports = {
    recordStats,
    getHistory,
    cleanOldHistory,
    checkAbsoluteDead,
    detectCollapse,
    checkParkedBus,
    checkScorelessStalemate,
    DEAD_THRESHOLDS
};
