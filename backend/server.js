/**
 * GoalSniper Daily - Express Server
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const flashscore = require('./lib/flashscore');
const analyzer = require('./lib/analyzer');
const settlement = require('./lib/settlement');
const database = require('./lib/database');
const redis = require('./lib/redis');
const ALLOWED_LEAGUES = require('./data/leagues');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Store analysis results in memory (fallback if no Redis)
let lastAnalysisResults = null;

// ============ ANALYSIS ROUTES ============

app.post('/api/analysis/run', async (req, res) => {
    try {
        // Rate limiting
        const rateCheck = await redis.checkRateLimit('analysis', 5, 60);
        if (!rateCheck.allowed) {
            return res.status(429).json({
                success: false,
                error: 'Rate limit exceeded. Try again in a minute.',
                remaining: rateCheck.remaining
            });
        }

        const { limit = 50, leagueFilter = true } = req.body;

        console.log(`[Analysis] Starting with limit=${limit}, leagueFilter=${leagueFilter}`);
        await redis.incrementStat('analysisRuns');

        const leagues = leagueFilter ? ALLOWED_LEAGUES : [];
        const matches = await flashscore.fetchDayMatches(1, leagues);

        console.log(`[Analysis] Found ${matches.length} matches`);

        const results = [];
        let processed = 0;

        for (const match of matches) {
            if (processed >= limit) break;

            await redis.incrementStat('apiCalls');
            const h2hData = await flashscore.fetchH2H(match.matchId);
            if (!h2hData) continue;

            const analysis = await analyzer.analyzeMatch(match, h2hData);
            if (!analysis || analysis.passedMarkets.length === 0) continue;

            // Fetch odds
            const odds = await flashscore.fetchMatchOdds(match.matchId);
            const oddsText = flashscore.formatOddsForPrompt(odds);

            // Generate prompts for each passed market
            for (const pm of analysis.passedMarkets) {
                const aiPrompt = analyzer.generateAIPrompt(match, analysis.stats, pm.market);
                const rawStats = analyzer.generateRawStats(match, analysis.stats, oddsText);

                results.push({
                    id: `${match.matchId}_${pm.key}`,
                    matchId: match.matchId,
                    homeTeam: match.homeTeam,
                    awayTeam: match.awayTeam,
                    league: match.league,
                    timestamp: match.timestamp,
                    market: pm.market,
                    marketKey: pm.key,
                    stats: analysis.stats,
                    aiPrompt,
                    rawStats,
                    odds: null,
                    oddsData: odds
                });
            }

            processed++;
            console.log(`[Analysis] ${processed}/${limit} - ${match.homeTeam} vs ${match.awayTeam}: ${analysis.passedMarkets.length} markets`);
        }

        // Cache results
        lastAnalysisResults = results;
        await redis.cacheAnalysisResults(results);

        res.json({
            success: true,
            count: results.length,
            processed,
            results
        });

    } catch (error) {
        console.error('[Analysis] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/analysis/results', async (req, res) => {
    // Try Redis cache first
    const cached = await redis.getCachedAnalysisResults();
    if (cached) {
        return res.json({ success: true, results: cached, cached: true });
    }

    res.json({
        success: true,
        results: lastAnalysisResults || [],
        cached: false
    });
});

// ============ APPROVAL ROUTES ============

app.post('/api/bets/approve', async (req, res) => {
    try {
        const { matchId, homeTeam, awayTeam, league, market, odds, matchTime, stats } = req.body;

        const result = await database.approveBet({
            matchId,
            homeTeam,
            awayTeam,
            league,
            market,
            odds,
            matchTime
        });

        await redis.incrementStat('betsApproved');
        await redis.invalidateAnalysisCache();

        res.json({ success: true, id: result.id });
    } catch (error) {
        console.error('[Approve] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/bets/approved', async (req, res) => {
    try {
        const bets = await database.getAllApprovedBets();
        res.json({ success: true, bets });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/bets/pending', async (req, res) => {
    try {
        const bets = await database.getPendingBets();
        res.json({ success: true, bets });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/bets/:id', async (req, res) => {
    try {
        await database.deleteBet(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ SETTLEMENT ROUTES ============

app.post('/api/settlement/run', async (req, res) => {
    try {
        const pendingBets = await database.getPendingBets();
        let settled = 0;
        let skipped = 0;
        let errors = 0;
        const results = [];

        for (const bet of pendingBets) {
            if (!settlement.isReadyForSettlement(bet)) {
                skipped++;
                continue;
            }

            const result = await settlement.settleBet({
                matchId: bet.match_id,
                market: bet.market
            });

            if (!result.success) {
                errors++;
                results.push({ bet, error: result.error });
                continue;
            }

            // Update bet status
            await database.settleBetInDB(bet.id, result.status, result.finalScore);

            // Add to training pool
            await database.addToTrainingPool({
                homeTeam: bet.home_team,
                awayTeam: bet.away_team,
                league: bet.league,
                market: bet.market,
                odds: bet.odds,
                result: result.status,
                finalScore: result.finalScore,
                homeGoals: result.homeGoals,
                awayGoals: result.awayGoals
            });

            await redis.incrementStat('betsSettled');
            settled++;
            results.push({ bet, status: result.status, score: result.finalScore });
        }

        // Update settlement status in Redis
        await redis.setSettlementStatus({ settled, skipped, errors, lastRun: new Date().toISOString() });

        res.json({ success: true, settled, skipped, errors, results });
    } catch (error) {
        console.error('[Settlement] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/settlement/status', async (req, res) => {
    try {
        const status = await redis.getSettlementStatus();
        res.json({ success: true, status });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/settlement/manual/:id', async (req, res) => {
    try {
        const { status, finalScore } = req.body;
        const bet = (await database.getAllApprovedBets()).find(b => b.id === req.params.id);

        if (!bet) {
            return res.status(404).json({ success: false, error: 'Bet not found' });
        }

        await database.settleBetInDB(req.params.id, status, finalScore);

        // Add to training pool
        const [homeGoals, awayGoals] = (finalScore || '0-0').split('-').map(Number);
        await database.addToTrainingPool({
            homeTeam: bet.home_team,
            awayTeam: bet.away_team,
            league: bet.league,
            market: bet.market,
            odds: bet.odds,
            result: status,
            finalScore,
            homeGoals,
            awayGoals
        });

        await redis.incrementStat('betsSettled');
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ TRAINING POOL ROUTES ============

app.get('/api/training/all', async (req, res) => {
    try {
        const data = await database.getAllTrainingData();
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/training/stats', async (req, res) => {
    try {
        const stats = await database.getTrainingStats();
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/training/:id', async (req, res) => {
    try {
        await database.deleteTrainingEntry(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/training', async (req, res) => {
    try {
        await database.clearTrainingPool();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ HEALTH & STATS ROUTES ============

app.get('/api/health', async (req, res) => {
    const redisStatus = await redis.ping();
    const stats = await redis.getStats();

    res.json({
        success: true,
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
            database: 'ok',
            redis: redisStatus.connected ? 'ok' : 'not configured',
            flashscore: process.env.RAPIDAPI_KEY ? 'configured' : 'not configured'
        },
        stats
    });
});

// ============ STARTUP ============

async function start() {
    await database.initDatabase();

    // Test Redis connection
    const redisStatus = await redis.ping();
    console.log(`[Redis] Status: ${redisStatus.connected ? 'Connected' : redisStatus.reason}`);

    app.listen(PORT, () => {
        console.log(`[Server] Running on port ${PORT}`);
        console.log(`[Server] RAPIDAPI_KEY: ${process.env.RAPIDAPI_KEY ? 'Set' : 'NOT SET'}`);
        console.log(`[Server] UPSTASH_REDIS: ${process.env.UPSTASH_REDIS_REST_URL ? 'Set' : 'NOT SET'}`);
    });
}

start();

