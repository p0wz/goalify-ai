/**
 * Live Match Bot - Main Module
 * Form-based signal generation (replaces momentum detection)
 * Scans every 5 minutes, uses team potential analysis
 */

const flashscore = require('./flashscore');
const database = require('./database');
const formAnalysis = require('./liveFormAnalysis');
const telegram = require('./telegram');
const ALLOWED_LEAGUES = require('../data/leagues');

// Bot state
let isRunning = false;
let useLeagueFilter = true; // League filter toggle
let scanInterval = null;
let lastScanTime = null;
let dailySignalCounts = {};
let dailySignalDate = null;

const SCAN_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const SIGNAL_LIMITS = {
    FIRST_HALF: 1,
    LATE_GAME: 2
};

/**
 * Check daily signal limit for match/strategy
 */
function checkSignalLimit(matchId, strategyCode) {
    const today = new Date().toISOString().split('T')[0];

    // Reset if new day
    if (dailySignalDate !== today) {
        dailySignalCounts = {};
        dailySignalDate = today;
    }

    const key = `${matchId}_${strategyCode}`;
    const limit = SIGNAL_LIMITS[strategyCode] || 1;
    const count = dailySignalCounts[key] || 0;

    return count < limit;
}

/**
 * Record signal for daily limit tracking
 */
function recordSignalSent(matchId, strategyCode) {
    const key = `${matchId}_${strategyCode}`;
    dailySignalCounts[key] = (dailySignalCounts[key] || 0) + 1;
}

/**
 * Parse elapsed time from stage string
 */
function parseElapsedTime(stage) {
    if (!stage) return 0;
    const stageStr = String(stage).toLowerCase();

    const minuteMatch = stageStr.match(/(\d+)/);
    if (minuteMatch) {
        const mins = parseInt(minuteMatch[1]);
        if (mins >= 1 && mins <= 120) return mins;
    }

    if (stageStr.includes('halftime') || stageStr.includes('ht')) return 45;
    if (stageStr.includes('2nd half')) return 60;
    if (stageStr.includes('1st half')) return 25;

    return 0;
}

/**
 * Parse match statistics from API response
 */
function parseMatchStats(statsData) {
    const stats = {
        possession: { home: 50, away: 50 },
        shots: { home: 0, away: 0 },
        shotsOnTarget: { home: 0, away: 0 },
        corners: { home: 0, away: 0 },
        xG: { home: 0, away: 0 },
        redCards: { home: 0, away: 0 }
    };

    // Find stats array
    let statsList = [];
    const keys = ['match', 'all-match', 'ALL', 'all', 'full-match'];

    for (const key of keys) {
        if (statsData[key] && Array.isArray(statsData[key]) && statsData[key].length > 0) {
            statsList = statsData[key];
            break;
        }
    }

    if (statsList.length === 0 && typeof statsData === 'object') {
        for (const key of Object.keys(statsData)) {
            if (Array.isArray(statsData[key]) && statsData[key].length > 0) {
                statsList = statsData[key];
                break;
            }
        }
    }

    for (const stat of statsList) {
        const name = stat.name?.toLowerCase() || '';
        const home = stat.home_team;
        const away = stat.away_team;

        if (name.includes('ball possession')) {
            stats.possession.home = parseInt(home) || 50;
            stats.possession.away = parseInt(away) || 50;
        }
        if (name === 'total shots' || name === 'shots total') {
            stats.shots.home = parseInt(home) || 0;
            stats.shots.away = parseInt(away) || 0;
        }
        if (name === 'shots on target' || name.includes('on target')) {
            stats.shotsOnTarget.home = parseInt(home) || 0;
            stats.shotsOnTarget.away = parseInt(away) || 0;
        }
        if (name === 'corner kicks' || name === 'corners') {
            stats.corners.home = parseInt(home) || 0;
            stats.corners.away = parseInt(away) || 0;
        }
        if (name.includes('expected goals') || name.includes('xg')) {
            stats.xG.home = parseFloat(home) || 0;
            stats.xG.away = parseFloat(away) || 0;
        }
        if (name.includes('red card')) {
            stats.redCards.home = parseInt(home) || 0;
            stats.redCards.away = parseInt(away) || 0;
        }
    }

    return stats;
}

/**
 * Main scan loop
 */
async function scanLiveMatches() {
    if (!isRunning) return [];

    console.log('[LiveBot] ════════════════════════════════════════');
    console.log('[LiveBot] Starting scan...');

    const signals = [];

    try {
        // Fetch live matches
        const liveData = await flashscore.fetchLiveMatches();
        const tournaments = Array.isArray(liveData) ? liveData : [];

        console.log(`[LiveBot] Found ${tournaments.length} tournaments`);

        // Flatten matches
        const allMatches = [];
        for (const tournament of tournaments) {
            for (const match of tournament.matches || []) {
                allMatches.push({
                    ...match,
                    league_name: tournament.name,
                    country_name: tournament.country_name
                });
            }
        }

        console.log(`[LiveBot] Total live matches: ${allMatches.length}`);
        console.log(`[LiveBot] League Filter: ${useLeagueFilter ? 'ON' : 'OFF'}`);

        // Filter candidates
        const candidates = allMatches.filter(m => {
            // League filter (if enabled)
            if (useLeagueFilter) {
                const leagueName = m.league_name || '';
                const fullLeague = `${m.country_name}: ${leagueName}`;
                const isAllowed = ALLOWED_LEAGUES.some(l =>
                    fullLeague.toUpperCase().includes(l.toUpperCase())
                );
                if (!isAllowed) return false;
            }

            const elapsed = parseElapsedTime(m.stage);
            const homeScore = m.home_team?.score || 0;
            const awayScore = m.away_team?.score || 0;
            const scoreDiff = Math.abs(homeScore - awayScore);

            const stageStr = (m.stage || '').toString().toUpperCase();
            const isFinished = stageStr.includes('FT') || stageStr.includes('AET') || elapsed >= 90;
            if (isFinished) return false;

            const isFirstHalf = elapsed >= 12 && elapsed <= 38 && scoreDiff <= 1;
            const isLateGame = elapsed >= 46 && elapsed <= 82 && scoreDiff <= 2;

            return isFirstHalf || isLateGame;
        });

        console.log(`[LiveBot] Candidates: ${candidates.length}`);

        // Clear old form cache periodically
        formAnalysis.clearCache();

        // Analyze each candidate with form-based approach
        for (const match of candidates) {
            const elapsed = parseElapsedTime(match.stage);
            const matchId = match.match_id;
            const homeTeam = match.home_team?.name;
            const awayTeam = match.away_team?.name;
            const score = `${match.home_team?.score || 0}-${match.away_team?.score || 0}`;
            const league = `${match.country_name}: ${match.league_name}`;

            console.log(`[LiveBot] ────────────────────────────────────`);
            console.log(`[LiveBot] 📊 ${homeTeam} vs ${awayTeam}`);
            console.log(`[LiveBot]    League: ${league}`);
            console.log(`[LiveBot]    Score: ${score} | Time: ${elapsed}'`);

            // ============ FORM ANALYSIS (replaces momentum) ============
            console.log(`[LiveBot]    📈 Running form analysis...`);
            const formResult = await formAnalysis.analyzeForm(matchId, homeTeam, awayTeam, score, elapsed);

            if (!formResult.valid) {
                console.log(`[LiveBot]    ❌ Form analysis failed: ${formResult.reason}`);
                continue;
            }

            console.log(`[LiveBot]    Ev Kalan: ${formResult.homeRemaining} | Dep Kalan: ${formResult.awayRemaining}`);
            console.log(`[LiveBot]    Toplam Potansiyel: ${formResult.totalRemaining} (adj: ${formResult.adjustedRemaining})`);
            console.log(`[LiveBot]    ${formResult.reason}`);

            // Check if any markets available
            if (!formResult.markets || formResult.markets.length === 0) {
                console.log(`[LiveBot]    ❌ No suitable markets found`);
                continue;
            }

            // Get best market
            const bestMarket = formResult.markets[0];
            console.log(`[LiveBot]    ✓ Best Market: ${bestMarket.name} (${bestMarket.confidence}%)`);

            // Minimum confidence check
            if (bestMarket.confidence < 60) {
                console.log(`[LiveBot]    ❌ Confidence too low (${bestMarket.confidence}% < 60%)`);
                continue;
            }

            // Determine strategy code based on timing
            const strategyCode = elapsed <= 45 ? 'FIRST_HALF' : 'LATE_GAME';

            // Check signal limit
            if (!checkSignalLimit(matchId, strategyCode)) {
                console.log(`[LiveBot]    ❌ Signal limit reached for ${strategyCode}`);
                continue;
            }

            // ============ SCORE SAFETY CHECK ============
            console.log(`[LiveBot]    🔒 Score safety check...`);
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
                    console.log(`[LiveBot]    ⚠️ Score changed: ${score} → ${freshScore} - SKIPPING`);
                    continue;
                }
                console.log(`[LiveBot]    ✓ Score unchanged: ${freshScore}`);
            }
            // ============ END SCORE SAFETY CHECK ============

            // Build signal object
            const candidate = {
                matchId,
                home: homeTeam,
                away: awayTeam,
                league,
                strategy: bestMarket.name,
                strategyCode,
                market: bestMarket.name,
                entryScore: score,
                entryMinute: elapsed,
                confidencePercent: bestMarket.confidence,
                reason: formResult.reason,
                stats: {
                    homeRemaining: formResult.homeRemaining,
                    awayRemaining: formResult.awayRemaining,
                    homeExpected: formResult.homeExpected?.toFixed(2),
                    awayExpected: formResult.awayExpected?.toFixed(2)
                },
                isFormBased: true
            };

            console.log(`[LiveBot]    🎯 SIGNAL GENERATED: ${candidate.strategy} (${candidate.confidencePercent}%)`);
            console.log(`[LiveBot] ────────────────────────────────────`);

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
        console.log(`[LiveBot] ════════════════════════════════════════`);
        console.log(`[LiveBot] Scan complete: ${signals.length} signals generated`);
        console.log('[LiveBot] ════════════════════════════════════════');

    } catch (error) {
        console.error('[LiveBot] Scan error:', error.message);
    }

    return signals;
}

/**
 * Start the live bot
 * @param {boolean} filterEnabled - Whether to enable league filter (default: true)
 */
function startBot(filterEnabled = true) {
    if (isRunning) {
        console.log('[LiveBot] Already running');
        return { success: false, message: 'Already running' };
    }

    isRunning = true;
    useLeagueFilter = filterEnabled;
    console.log(`[LiveBot] Starting... (League Filter: ${useLeagueFilter ? 'ON' : 'OFF'})`);

    // Initial scan
    scanLiveMatches();

    // Schedule periodic scans
    scanInterval = setInterval(scanLiveMatches, SCAN_INTERVAL_MS);

    // Note: Settlement is handled by cron job in server.js

    return {
        success: true,
        message: `Bot started (Filter: ${useLeagueFilter ? 'ON' : 'OFF'})`,
        filterEnabled: useLeagueFilter
    };
}

/**
 * Stop the live bot
 */
function stopBot() {
    if (!isRunning) {
        console.log('[LiveBot] Already stopped');
        return { success: false, message: 'Already stopped' };
    }

    isRunning = false;
    if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
    }

    console.log('[LiveBot] Stopped');
    return { success: true, message: 'Bot stopped' };
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
    scanLiveMatches,
    ALLOWED_LEAGUES
};
