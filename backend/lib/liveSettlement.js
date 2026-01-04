/**
 * Live Bot - Auto Settlement Module
 * Settles live signals based on market type and final score
 * Updated for form-based markets (Over/Under/BTTS/Goals)
 */

const database = require('./database');
const flashscore = require('./flashscore');

const SETTLEMENT_DELAY_MS = 60 * 60 * 1000; // 1 hour

/**
 * Check if signal is ready for settlement
 */
function isReadyForSettlement(signal) {
    const entryTime = signal.entryTime || signal.createdAt;
    if (!entryTime) return false;

    const timestamp = typeof entryTime === 'number' ? entryTime : new Date(entryTime).getTime();
    return Date.now() >= timestamp + SETTLEMENT_DELAY_MS;
}

/**
 * Parse score string to [home, away] numbers
 */
function parseScore(scoreStr) {
    if (!scoreStr) return [0, 0];
    const parts = scoreStr.split('-').map(s => parseInt(s) || 0);
    return [parts[0] || 0, parts[1] || 0];
}

/**
 * Evaluate if market won based on final score
 */
function evaluateMarket(market, entryScore, finalScore, strategyCode) {
    const [entryHome, entryAway] = parseScore(entryScore);
    const [finalHome, finalAway] = parseScore(finalScore);

    const entryTotal = entryHome + entryAway;
    const finalTotal = finalHome + finalAway;

    // Goals scored after entry
    const goalsAfterEntry = finalTotal - entryTotal;
    const homeGoalsAfter = finalHome - entryHome;
    const awayGoalsAfter = finalAway - entryAway;

    const marketLower = (market || '').toLowerCase();

    // ============ OVER/UNDER MARKETS ============

    // İY Over 0.5
    if (marketLower.includes('iy over 0.5') || marketLower.includes('ht over 0.5')) {
        // For first half, check HT score
        return finalTotal >= 1;
    }

    // Over X.5 markets
    if (marketLower.includes('over')) {
        const match = marketLower.match(/over\s*(\d+\.5)/);
        if (match) {
            const line = parseFloat(match[1]);
            return finalTotal > line;
        }
        // Generic "over" - at least 1 goal after entry
        return goalsAfterEntry >= 1;
    }

    // Under X.5 markets
    if (marketLower.includes('under')) {
        const match = marketLower.match(/under\s*(\d+\.5)/);
        if (match) {
            const line = parseFloat(match[1]);
            return finalTotal < line;
        }
        // Generic "under" - no more goals after entry
        return goalsAfterEntry === 0;
    }

    // ============ BTTS MARKETS ============
    if (marketLower.includes('btts') || marketLower.includes('both teams')) {
        if (marketLower.includes('no')) {
            return finalHome === 0 || finalAway === 0;
        }
        // BTTS Yes
        return finalHome >= 1 && finalAway >= 1;
    }

    // ============ GOAL MARKETS ============
    if (marketLower.includes('home goal') || marketLower.includes('ev gol')) {
        return homeGoalsAfter >= 1;
    }

    if (marketLower.includes('away goal') || marketLower.includes('dep gol')) {
        return awayGoalsAfter >= 1;
    }

    // ============ DRAW MARKET ============
    if (marketLower.includes('draw') || marketLower.includes('beraberlik')) {
        return finalHome === finalAway;
    }

    // ============ FALLBACK: Score changed (legacy) ============
    // For any unrecognized market, use old logic
    console.log(`[LiveSettlement] Unknown market "${market}" - using score-changed fallback`);
    return finalScore !== entryScore;
}

/**
 * Settle a single live signal
 */
async function settleLiveSignal(signal) {
    console.log(`[LiveSettlement] Processing signal ${signal.id}`);
    console.log(`[LiveSettlement]    Match: ${signal.home} vs ${signal.away}`);
    console.log(`[LiveSettlement]    Market: ${signal.strategy}, Entry: ${signal.entryScore}`);

    try {
        // Fetch current match details
        const details = await flashscore.fetchMatchDetails(signal.matchId);

        if (!details) {
            console.log(`[LiveSettlement] Could not fetch details for ${signal.matchId}`);
            return { success: false, error: 'Could not fetch match details' };
        }

        let finalScore;
        let checkScore;

        // For FIRST_HALF strategy, check HT score for İY markets
        const isFirstHalf = signal.strategyCode === 'FIRST_HALF';
        const marketLower = (signal.strategy || '').toLowerCase();
        const isHTMarket = marketLower.includes('iy') || marketLower.includes('ht') || marketLower.includes('İy');

        if (isFirstHalf && isHTMarket) {
            const htHome = parseInt(details.home_team?.score_1st_half) || 0;
            const htAway = parseInt(details.away_team?.score_1st_half) || 0;
            finalScore = `${htHome}-${htAway}`;
            checkScore = 'HT';
        } else {
            // Use full-time score for most markets
            const ftHome = parseInt(details.home_team?.score) || 0;
            const ftAway = parseInt(details.away_team?.score) || 0;
            finalScore = `${ftHome}-${ftAway}`;
            checkScore = 'FT';
        }

        console.log(`[LiveSettlement]    Using ${checkScore} score: ${finalScore}`);

        // Evaluate market outcome
        const entryScore = signal.entryScore || '0-0';
        const won = evaluateMarket(signal.strategy, entryScore, finalScore, signal.strategyCode);
        const status = won ? 'WON' : 'LOST';

        console.log(`[LiveSettlement]    Entry: ${entryScore} → ${checkScore}: ${finalScore}`);
        console.log(`[LiveSettlement]    Market "${signal.strategy}" = ${status}`);

        return {
            success: true,
            status,
            entryScore,
            finalScore
        };

    } catch (error) {
        console.error(`[LiveSettlement] Error settling ${signal.id}:`, error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Run settlement cycle for all pending live signals
 */
async function runLiveSettlement() {
    console.log('[LiveSettlement] Starting settlement cycle...');

    try {
        // Get pending live signals
        const pendingSignals = await database.getLiveSignals('PENDING');
        console.log(`[LiveSettlement] Found ${pendingSignals.length} pending signals`);

        let settledCount = 0;

        for (const signal of pendingSignals) {
            // Check if ready (1 hour passed)
            if (!isReadyForSettlement(signal)) {
                const entryTime = signal.entryTime || signal.createdAt;
                const timestamp = typeof entryTime === 'number' ? entryTime : new Date(entryTime).getTime();
                const waitMs = (timestamp + SETTLEMENT_DELAY_MS) - Date.now();
                console.log(`[LiveSettlement] Signal ${signal.id} not ready (wait ${Math.round(waitMs / 60000)}min)`);
                continue;
            }

            // Settle the signal
            const result = await settleLiveSignal(signal);

            if (result.success) {
                // Update in database
                await database.updateLiveSignal(signal.id, {
                    status: result.status,
                    finalScore: result.finalScore,
                    settledAt: Date.now()
                });
                settledCount++;
                console.log(`[LiveSettlement] Signal ${signal.id} settled as ${result.status}`);
            }

            // Small delay between API calls
            await new Promise(r => setTimeout(r, 1000));
        }

        console.log(`[LiveSettlement] Cycle complete. Settled ${settledCount} signals.`);
        return { settled: settledCount };

    } catch (error) {
        console.error('[LiveSettlement] Cycle error:', error.message);
        return { error: error.message };
    }
}

module.exports = {
    isReadyForSettlement,
    settleLiveSignal,
    runLiveSettlement,
    evaluateMarket,
    SETTLEMENT_DELAY_MS
};
