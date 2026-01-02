/**
 * Live Bot - Auto Settlement Module
 * Settles live signals after 1 hour based on score change
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
 * Settle a single live signal
 * WON if score changed from entry, LOST if same
 */
async function settleLiveSignal(signal) {
    console.log(`[LiveSettlement] Processing signal ${signal.id} (Match: ${signal.matchId})`);

    try {
        // Fetch current match details
        const details = await flashscore.fetchMatchDetails(signal.matchId);

        if (!details) {
            console.log(`[LiveSettlement] Could not fetch details for ${signal.matchId}`);
            return { success: false, error: 'Could not fetch match details' };
        }

        // Parse final score
        const homeGoals = parseInt(details.home_team?.score) || 0;
        const awayGoals = parseInt(details.away_team?.score) || 0;
        const finalScore = `${homeGoals}-${awayGoals}`;

        // Compare with entry score
        const entryScore = signal.entryScore || '0-0';
        const scoreChanged = finalScore !== entryScore;

        const status = scoreChanged ? 'WON' : 'LOST';

        console.log(`[LiveSettlement] Entry: ${entryScore} → Final: ${finalScore} = ${status}`);

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
    SETTLEMENT_DELAY_MS
};
