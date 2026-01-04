/**
 * Live Dead Match Bot - Main Module
 * Scans live matches for "dead match" Under/No Goal signals
 * Operates independently from momentum bot
 */

const flashscore = require('./flashscore');
const database = require('./database');
const antiMomentum = require('./liveAntiMomentum');
const deadStrategies = require('./liveDeadStrategies');
const telegram = require('./telegram');
const ALLOWED_LEAGUES = require('../data/leagues');

// Bot state (separate from momentum bot)
let isRunning = false;
let useLeagueFilter = true;
let scanInterval = null;
let lastScanTime = null;
let dailySignalCounts = {};
let dailySignalDate = null;

const SCAN_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes
const SIGNAL_LIMITS = {
    FH_LOCK: 1,
    FH_SLEEPY: 1,
    FH_TACTICAL: 1,
    LATE_LOCK: 1,
    SCORELESS: 1,
    PARKED_BUS: 1
};

/**
 * Check daily signal limit for match/strategy
 */
function checkSignalLimit(matchId, strategyCode) {
    const today = new Date().toISOString().split('T')[0];

    if (dailySignalDate !== today) {
        dailySignalCounts = {};
        dailySignalDate = today;
    }

    const key = `${matchId}:${strategyCode}`;
    const current = dailySignalCounts[key] || 0;
    const limit = SIGNAL_LIMITS[strategyCode] || 1;

    return current < limit;
}

function recordSignalSent(matchId, strategyCode) {
    const key = `${matchId}:${strategyCode}`;
    dailySignalCounts[key] = (dailySignalCounts[key] || 0) + 1;
}

/**
 * Parse elapsed time from stage string
 */
function parseElapsedTime(stage) {
    if (!stage) return 0;
    const str = stage.toString();

    // Handle "1st Half 25:00" format
    const minuteMatch = str.match(/(\d+):/);
    if (minuteMatch) return parseInt(minuteMatch[1]);

    // Handle "25'" format
    const primeMatch = str.match(/(\d+)/);
    if (primeMatch) return parseInt(primeMatch[1]);

    return 0;
}

/**
 * Parse match stats from API response
 */
function parseMatchStats(data) {
    const stats = {
        shots: { home: 0, away: 0 },
        shotsOnTarget: { home: 0, away: 0 },
        corners: { home: 0, away: 0 },
        possession: { home: 50, away: 50 },
        xG: { home: 0, away: 0 },
        redCards: { home: 0, away: 0 }
    };

    if (!data || !data.stats) return stats;

    for (const stat of data.stats) {
        const name = (stat.name || '').toLowerCase();
        const home = parseInt(stat.home) || 0;
        const away = parseInt(stat.away) || 0;

        if (name.includes('shots on target')) {
            stats.shotsOnTarget = { home, away };
        } else if (name.includes('shots') && !name.includes('blocked')) {
            stats.shots = { home, away };
        } else if (name.includes('corner')) {
            stats.corners = { home, away };
        } else if (name.includes('possession')) {
            stats.possession = { home, away };
        } else if (name.includes('expected goals') || name === 'xg') {
            stats.xG = { home: parseFloat(stat.home) || 0, away: parseFloat(stat.away) || 0 };
        } else if (name.includes('red card')) {
            stats.redCards = { home, away };
        }
    }

    return stats;
}

/**
 * Main scan function for dead matches
 */
async function scanDeadMatches() {
    if (!isRunning) {
        console.log('[DeadBot] Not running, skipping scan');
        return [];
    }

    console.log('[DeadBot] ════════════════════════════════════════');
    console.log(`[DeadBot] Starting scan at ${new Date().toLocaleTimeString('tr-TR')}`);

    const signals = [];

    try {
        // Fetch live matches
        const liveData = await flashscore.fetchLiveMatches();
        if (!liveData || !Array.isArray(liveData)) {
            console.log('[DeadBot] No live data');
            return signals;
        }

        // Flatten tournaments to matches
        const allMatches = [];
        for (const tournament of liveData) {
            for (const match of (tournament.matches || [])) {
                allMatches.push({
                    ...match,
                    league_name: tournament.name,
                    country_name: tournament.country_name
                });
            }
        }

        console.log(`[DeadBot] Total live matches: ${allMatches.length}`);
        console.log(`[DeadBot] League Filter: ${useLeagueFilter ? 'ON' : 'OFF'}`);

        // Filter candidates for dead match analysis
        const candidates = allMatches.filter(m => {
            // League filter
            if (useLeagueFilter) {
                const fullLeague = `${m.country_name}: ${m.league_name}`;
                const isAllowed = ALLOWED_LEAGUES.some(l =>
                    fullLeague.toUpperCase().includes(l.toUpperCase())
                );
                if (!isAllowed) return false;
            }

            const elapsed = parseElapsedTime(m.stage);
            const stageStr = (m.stage || '').toString().toUpperCase();
            const isFinished = stageStr.includes('FT') || stageStr.includes('AET') || elapsed >= 90;
            if (isFinished) return false;

            // Dead match windows: 25-43' (FH) or 55-82' (SH)
            const isFirstHalfWindow = elapsed >= 25 && elapsed <= 43;
            const isSecondHalfWindow = elapsed >= 55 && elapsed <= 82;

            return isFirstHalfWindow || isSecondHalfWindow;
        });

        console.log(`[DeadBot] Candidates: ${candidates.length}`);

        // Clean old history
        antiMomentum.cleanOldHistory();

        // Analyze each candidate
        for (const match of candidates) {
            const elapsed = parseElapsedTime(match.stage);
            const matchId = match.match_id;
            const score = `${match.home_team?.score || 0}-${match.away_team?.score || 0}`;
            const league = `${match.country_name}: ${match.league_name}`;

            console.log(`[DeadBot] ────────────────────────────────────`);
            console.log(`[DeadBot] 📉 ${match.home_team?.name} vs ${match.away_team?.name}`);
            console.log(`[DeadBot]    League: ${league}`);
            console.log(`[DeadBot]    Score: ${score} | Time: ${elapsed}'`);

            // Fetch stats
            const statsData = await flashscore.fetchMatchStats(matchId);
            if (!statsData) {
                console.log(`[DeadBot]    ❌ No stats available`);
                continue;
            }

            const stats = parseMatchStats(statsData);
            console.log(`[DeadBot]    Stats: Shots ${stats.shots.home}-${stats.shots.away} | SoT ${stats.shotsOnTarget.home}-${stats.shotsOnTarget.away}`);
            console.log(`[DeadBot]    xG: ${stats.xG.home.toFixed(2)}-${stats.xG.away.toFixed(2)} | Corners ${stats.corners.home}-${stats.corners.away}`);

            // Red card = game could open up, skip
            if (stats.redCards.home > 0 || stats.redCards.away > 0) {
                console.log(`[DeadBot]    ❌ Red card detected - game may open up`);
                continue;
            }

            // Record stats for collapse detection
            antiMomentum.recordStats(matchId, stats, score);

            // Detect momentum collapse
            const collapseResult = antiMomentum.detectCollapse(matchId, stats, score);
            if (collapseResult.collapsed) {
                console.log(`[DeadBot]    💤 COLLAPSE: ${collapseResult.reason}`);
            }

            // Run dead match strategies
            const candidate = deadStrategies.analyzeDeadMatch(match, elapsed, stats, collapseResult);

            if (!candidate) {
                console.log(`[DeadBot]    ❌ No dead match strategy matched`);
                continue;
            }

            console.log(`[DeadBot]    ✓ Strategy: ${candidate.strategy} (${candidate.confidencePercent}%)`);

            // Check signal limit
            if (!checkSignalLimit(matchId, candidate.strategyCode)) {
                console.log(`[DeadBot]    ❌ Signal limit reached for ${candidate.strategyCode}`);
                continue;
            }

            // Score safety check
            console.log(`[DeadBot]    🔒 Score safety check...`);
            const freshLiveData = await flashscore.fetchLiveMatches();
            const freshTournaments = Array.isArray(freshLiveData) ? freshLiveData : [];
            let freshMatch = null;

            for (const t of freshTournaments) {
                freshMatch = (t.matches || []).find(m => m.match_id === matchId);
                if (freshMatch) break;
            }

            if (freshMatch) {
                const freshScore = `${freshMatch.home_team?.score || 0}-${freshMatch.away_team?.score || 0}`;
                if (freshScore !== score) {
                    console.log(`[DeadBot]    ⚠️ Score changed: ${score} → ${freshScore} - SKIPPING`);
                    continue;
                }
                console.log(`[DeadBot]    ✓ Score unchanged: ${freshScore}`);
            }

            console.log(`[DeadBot]    📉 DEAD SIGNAL: ${candidate.strategy} (${candidate.confidencePercent}%)`);
            console.log(`[DeadBot] ────────────────────────────────────`);

            // Save to database
            await database.addLiveSignal(candidate);

            // Send to Telegram
            await telegram.sendLiveSignal(candidate);

            // Record for limit tracking
            recordSignalSent(matchId, candidate.strategyCode);

            signals.push(candidate);

            // Rate limit delay
            await new Promise(r => setTimeout(r, 2000));
        }

        lastScanTime = new Date().toISOString();
        console.log(`[DeadBot] ════════════════════════════════════════`);
        console.log(`[DeadBot] Scan complete: ${signals.length} signals generated`);
        console.log('[DeadBot] ════════════════════════════════════════');

    } catch (error) {
        console.error('[DeadBot] Scan error:', error.message);
    }

    return signals;
}

/**
 * Start the dead match bot
 */
function startBot(filterEnabled = true) {
    if (isRunning) {
        console.log('[DeadBot] Already running');
        return { success: false, message: 'Already running' };
    }

    isRunning = true;
    useLeagueFilter = filterEnabled;
    console.log(`[DeadBot] Starting... (League Filter: ${useLeagueFilter ? 'ON' : 'OFF'})`);

    // Initial scan
    scanDeadMatches();

    // Schedule periodic scans
    scanInterval = setInterval(scanDeadMatches, SCAN_INTERVAL_MS);

    return {
        success: true,
        message: `Dead Bot started (Filter: ${useLeagueFilter ? 'ON' : 'OFF'})`,
        filterEnabled: useLeagueFilter
    };
}

/**
 * Stop the dead match bot
 */
function stopBot() {
    if (!isRunning) {
        console.log('[DeadBot] Already stopped');
        return { success: false, message: 'Already stopped' };
    }

    isRunning = false;
    if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
    }

    console.log('[DeadBot] Stopped');
    return { success: true, message: 'Dead Bot stopped' };
}

/**
 * Get bot status
 */
function getStatus() {
    return {
        isRunning,
        useLeagueFilter,
        lastScanTime,
        signalCounts: dailySignalCounts,
        signalDate: dailySignalDate
    };
}

module.exports = {
    startBot,
    stopBot,
    getStatus,
    scanDeadMatches
};
