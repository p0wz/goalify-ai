/**
 * Live Bot - Momentum Detection Module
 * Detects momentum shifts in live matches using historical snapshots
 */

// Match history buffer - stores last 4 snapshots per match
const MATCH_HISTORY = {};
const MAX_HISTORY_LENGTH = 4;
const MAX_LOOKBACK_MS = 12 * 60 * 1000; // 12 minutes

// Momentum thresholds
const MOMENTUM_THRESHOLDS = {
    CORNER_SIEGE: 3,      // +3 corners in lookback
    SHOT_SURGE: 4,        // +4 shots
    SOT_THREAT: 2,        // +2 shots on target
    XG_SPIKE: 0.4         // +0.4 xG
};

/**
 * Record match stats snapshot
 */
function recordMatchStats(matchId, stats, score = '0-0') {
    if (!MATCH_HISTORY[matchId]) {
        MATCH_HISTORY[matchId] = [];
    }

    MATCH_HISTORY[matchId].push({
        timestamp: Date.now(),
        score,
        stats: { ...stats }
    });

    // Keep only last N snapshots
    if (MATCH_HISTORY[matchId].length > MAX_HISTORY_LENGTH) {
        MATCH_HISTORY[matchId].shift();
    }
}

/**
 * Get match history
 */
function getMatchHistory(matchId) {
    return MATCH_HISTORY[matchId] || [];
}

/**
 * Clean old history entries
 */
function cleanOldHistory() {
    const now = Date.now();
    for (const matchId of Object.keys(MATCH_HISTORY)) {
        const history = MATCH_HISTORY[matchId];
        if (history.length > 0) {
            const lastEntry = history[history.length - 1];
            if ((now - lastEntry.timestamp) > MAX_LOOKBACK_MS * 2) {
                delete MATCH_HISTORY[matchId];
            }
        }
    }
}

/**
 * Detect momentum triggers
 * Returns: { detected: boolean, trigger: string, reason: string, timeframe: number, deltas: object }
 */
function detectMomentum(matchId, currentStats, currentScore = '0-0') {
    const history = getMatchHistory(matchId);
    const now = Date.now();

    if (history.length === 0) {
        return { detected: false, trigger: null, timeframe: null };
    }

    // Get current totals
    const currentCorners = (currentStats?.corners?.home || 0) + (currentStats?.corners?.away || 0);
    const currentShots = (currentStats?.shots?.home || 0) + (currentStats?.shots?.away || 0);
    const currentSoT = (currentStats?.shotsOnTarget?.home || 0) + (currentStats?.shotsOnTarget?.away || 0);
    const currentxG = (currentStats?.xG?.home || 0) + (currentStats?.xG?.away || 0);

    // Check each historical snapshot (most recent first)
    for (let i = history.length - 1; i >= 0; i--) {
        const snapshot = history[i];

        // Stop if score changed (goal resets momentum)
        if (snapshot.score && snapshot.score !== currentScore) {
            break;
        }

        const timeDiffMs = now - snapshot.timestamp;
        const timeDiffMins = Math.round(timeDiffMs / 60000);

        // Skip if older than max lookback
        if (timeDiffMs > MAX_LOOKBACK_MS) continue;

        const oldCorners = (snapshot.stats?.corners?.home || 0) + (snapshot.stats?.corners?.away || 0);
        const oldShots = (snapshot.stats?.shots?.home || 0) + (snapshot.stats?.shots?.away || 0);
        const oldSoT = (snapshot.stats?.shotsOnTarget?.home || 0) + (snapshot.stats?.shotsOnTarget?.away || 0);
        const oldxG = (snapshot.stats?.xG?.home || 0) + (snapshot.stats?.xG?.away || 0);

        const deltaCorners = currentCorners - oldCorners;
        const deltaShots = currentShots - oldShots;
        const deltaSoT = currentSoT - oldSoT;
        const deltaxG = currentxG - oldxG;

        // Trigger 1: Corner Siege
        if (deltaCorners >= MOMENTUM_THRESHOLDS.CORNER_SIEGE) {
            return {
                detected: true,
                trigger: 'CORNER_SIEGE',
                reason: `Corner Siege (+${deltaCorners} in ~${timeDiffMins}min)`,
                timeframe: timeDiffMins,
                deltas: { corners: deltaCorners, shots: deltaShots, sot: deltaSoT }
            };
        }

        // Trigger 2: Shot Surge or SOT Threat
        if (deltaShots >= MOMENTUM_THRESHOLDS.SHOT_SURGE || deltaSoT >= MOMENTUM_THRESHOLDS.SOT_THREAT) {
            const trigger = deltaSoT >= MOMENTUM_THRESHOLDS.SOT_THREAT ? 'SOT_THREAT' : 'SHOT_SURGE';
            return {
                detected: true,
                trigger,
                reason: deltaSoT >= MOMENTUM_THRESHOLDS.SOT_THREAT
                    ? `SOT Threat (+${deltaSoT} on target in ~${timeDiffMins}min)`
                    : `Shot Surge (+${deltaShots} shots in ~${timeDiffMins}min)`,
                timeframe: timeDiffMins,
                deltas: { corners: deltaCorners, shots: deltaShots, sot: deltaSoT }
            };
        }

        // Trigger 3: xG Spike
        if (currentxG > 0 && deltaxG >= MOMENTUM_THRESHOLDS.XG_SPIKE) {
            return {
                detected: true,
                trigger: 'XG_SPIKE',
                reason: `xG Spike (+${deltaxG.toFixed(2)} in ~${timeDiffMins}min)`,
                timeframe: timeDiffMins,
                deltas: { corners: deltaCorners, shots: deltaShots, sot: deltaSoT, xg: deltaxG }
            };
        }
    }

    return { detected: false, trigger: null, timeframe: null };
}

/**
 * Check base activity (is match "alive"?)
 */
function checkBaseActivity(elapsed, stats) {
    const totalShots = (stats?.shots?.home || 0) + (stats?.shots?.away || 0);
    const totalCorners = (stats?.corners?.home || 0) + (stats?.corners?.away || 0);

    // Early game buffer
    if (elapsed < 16) {
        return { isAlive: true, reason: 'Early game buffer' };
    }

    // Dynamic thresholds: ~0.14 shots/min, ~0.06 corners/min
    const minShots = Math.floor(elapsed * 0.14);
    const minCorners = Math.floor(elapsed * 0.06);

    const isAlive = totalShots >= minShots || totalCorners >= minCorners;

    return {
        isAlive,
        reason: isAlive
            ? `Active (${totalShots}S/${totalCorners}C vs req ${minShots}S/${minCorners}C)`
            : `Dead Match (need >${minShots}S or >${minCorners}C)`
    };
}

module.exports = {
    recordMatchStats,
    getMatchHistory,
    cleanOldHistory,
    detectMomentum,
    checkBaseActivity,
    MOMENTUM_THRESHOLDS
};
