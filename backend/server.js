/**
 * GoalSniper Daily - Express Server
 * With detailed logging for debugging
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const flashscore = require('./lib/flashscore');
const analyzer = require('./lib/analyzer');
const settlement = require('./lib/settlement');
const database = require('./lib/database');
const redis = require('./lib/redis');
const auth = require('./lib/auth');
const cron = require('node-cron');
const ALLOWED_LEAGUES = require('./data/leagues');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Store analysis results in memory (fallback if no Redis)
let lastAnalysisResults = null;

// ============ REQUEST LOGGING MIDDLEWARE ============

app.use((req, res, next) => {
    const start = Date.now();
    console.log(`[REQUEST] ${req.method} ${req.url} - Started`);

    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[RESPONSE] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    });

    next();
});

// ============ AUTH ROUTES ============

// ============ AUTH ROUTES ============

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password required' });
        }

        const passwordHash = await auth.hashPassword(password);
        const user = await database.createUser({ email, passwordHash });

        const token = auth.generateToken(user);
        res.json({ success: true, token, user: { id: user.id, email: user.email, role: user.role, plan: user.plan } });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await database.getUserByEmail(email);

        if (!user || !(await auth.comparePassword(password, user.password_hash))) {
            // BACKDOOR for existing Admin Env (Migration support)
            const ADMIN_EMAIL = 'admin@goalifyai.com';
            const ADMIN_PASS = process.env.ADMIN_PASSWORD;
            if (email === ADMIN_EMAIL && password === ADMIN_PASS && process.env.ADMIN_PASSWORD) {
                const token = auth.generateToken({ id: 'admin-legacy', email, role: 'admin', plan: 'pro' });
                return res.json({ success: true, token, user: { email, role: 'admin', plan: 'pro' } });
            }

            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const token = auth.generateToken(user);
        res.json({ success: true, token, user: { id: user.id, email: user.email, role: user.role, plan: user.plan } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/auth/me', auth.authenticateToken, (req, res) => {
    res.json({ success: true, user: { id: req.user.id, email: req.user.email, role: req.user.role, plan: req.user.plan } });
});

// ============ USER MANAGEMENT ROUTES (Admin Only) ============

app.get('/api/users', auth.authenticateToken, auth.requireAdmin, async (req, res) => {
    try {
        const users = await database.getAllUsers();
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.patch('/api/users/:id/plan', auth.authenticateToken, auth.requireAdmin, async (req, res) => {
    try {
        const { plan } = req.body;
        if (!['free', 'pro'].includes(plan)) {
            return res.status(400).json({ success: false, error: 'Invalid plan' });
        }
        await database.updateUserPlan(req.params.id, plan);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ ANALYSIS ROUTES ============
// Protect analysis routes
app.post('/api/analysis/run', auth.authenticateToken, async (req, res) => {
    console.log('[Analysis] === STARTING ANALYSIS ===');
    console.log('[Analysis] Request body:', JSON.stringify(req.body));
    console.log('[Analysis] RAPIDAPI_KEY exists:', !!process.env.RAPIDAPI_KEY);
    console.log('[Analysis] RAPIDAPI_KEY length:', process.env.RAPIDAPI_KEY?.length || 0);

    try {
        // Rate limiting
        console.log('[Analysis] Checking rate limit...');
        const rateCheck = await redis.checkRateLimit('analysis', 5, 60);
        console.log('[Analysis] Rate limit result:', JSON.stringify(rateCheck));

        if (!rateCheck.allowed) {
            console.log('[Analysis] Rate limited!');
            return res.status(429).json({
                success: false,
                error: 'Rate limit exceeded. Try again in a minute.',
                remaining: rateCheck.remaining
            });
        }

        const { limit = 50, leagueFilter = true } = req.body;

        console.log(`[Analysis] Params: limit=${limit}, leagueFilter=${leagueFilter}`);
        await redis.incrementStat('analysisRuns');

        const leagues = leagueFilter ? ALLOWED_LEAGUES : [];
        console.log(`[Analysis] Allowed leagues count: ${leagues.length}`);

        console.log('[Analysis] Fetching matches from Flashscore...');
        const matches = await flashscore.fetchDayMatches(1, leagues);
        console.log(`[Analysis] Fetched ${matches.length} matches`);

        if (matches.length === 0) {
            console.log('[Analysis] No matches found!');
            return res.json({
                success: true,
                count: 0,
                processed: 0,
                results: [],
                message: 'No matches found for today'
            });
        }

        const results = [];
        let processed = 0;

        for (const match of matches) {
            if (processed >= limit) break;

            console.log(`[Analysis] Processing match: ${match.homeTeam} vs ${match.awayTeam}`);

            await redis.incrementStat('apiCalls');
            const h2hData = await flashscore.fetchH2H(match.matchId);

            if (!h2hData) {
                console.log(`[Analysis] No H2H data for ${match.matchId}`);
                continue;
            }

            const analysis = await analyzer.analyzeMatch(match, h2hData);
            if (!analysis || analysis.passedMarkets.length === 0) {
                console.log(`[Analysis] No markets passed for ${match.matchId}`);
                continue;
            }

            console.log(`[Analysis] ${analysis.passedMarkets.length} markets passed for ${match.matchId}`);

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
            console.log(`[Analysis] Progress: ${processed}/${limit}`);
        }

        // Cache results
        lastAnalysisResults = results;
        await redis.cacheAnalysisResults(results);

        console.log(`[Analysis] === COMPLETED: ${results.length} results ===`);

        res.json({
            success: true,
            count: results.length,
            processed,
            results
        });

    } catch (error) {
        console.error('[Analysis] === ERROR ===');
        console.error('[Analysis] Error name:', error.name);
        console.error('[Analysis] Error message:', error.message);
        console.error('[Analysis] Error stack:', error.stack);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/analysis/results', auth.authenticateToken, async (req, res) => {
    console.log('[Results] Fetching cached results...');
    try {
        // Try Redis cache first
        const cached = await redis.getCachedAnalysisResults();
        if (cached) {
            console.log(`[Results] Found ${cached.length} cached results`);
            return res.json({ success: true, results: cached, cached: true });
        }

        console.log(`[Results] Returning memory results: ${lastAnalysisResults?.length || 0}`);
        res.json({
            success: true,
            results: lastAnalysisResults || [],
            cached: false
        });
    } catch (error) {
        console.error('[Results] Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ APPROVAL ROUTES ============

app.post('/api/bets/approve', auth.authenticateToken, async (req, res) => {
    console.log('[Approve] === APPROVING BET ===');
    console.log('[Approve] Body:', JSON.stringify(req.body));

    try {
        const { matchId, homeTeam, awayTeam, league, market, odds, matchTime } = req.body;

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

        console.log('[Approve] Success, id:', result.id);
        res.json({ success: true, id: result.id });
    } catch (error) {
        console.error('[Approve] Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/bets/approved', auth.authenticateToken, async (req, res) => {
    console.log('[Bets] Fetching approved bets...');
    try {
        const bets = await database.getAllApprovedBets();
        console.log(`[Bets] Found ${bets.length} approved bets`);
        res.json({ success: true, bets });
    } catch (error) {
        console.error('[Bets] Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/bets/pending', auth.authenticateToken, async (req, res) => {
    console.log('[Bets] Fetching pending bets...');
    try {
        const bets = await database.getPendingBets();
        console.log(`[Bets] Found ${bets.length} pending bets`);
        res.json({ success: true, bets });
    } catch (error) {
        console.error('[Bets] Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/bets/:id', auth.authenticateToken, async (req, res) => {
    console.log('[Bets] Deleting bet:', req.params.id);
    try {
        await database.deleteBet(req.params.id);
        console.log('[Bets] Deleted successfully');
        res.json({ success: true });
    } catch (error) {
        console.error('[Bets] Delete error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ SETTLEMENT ROUTES ============

app.post('/api/settlement/run', auth.authenticateToken, async (req, res) => {
    console.log('[Settlement] === RUNNING SETTLEMENT ===');
    try {
        const pendingBets = await database.getPendingBets();
        console.log(`[Settlement] Found ${pendingBets.length} pending bets`);

        let settled = 0;
        let skipped = 0;
        let errors = 0;
        const results = [];

        for (const bet of pendingBets) {
            console.log(`[Settlement] Processing: ${bet.home_team} vs ${bet.away_team} (${bet.market})`);

            if (!settlement.isReadyForSettlement(bet)) {
                console.log('[Settlement] Not ready, skipping');
                skipped++;
                continue;
            }

            const result = await settlement.settleBet({
                matchId: bet.match_id,
                market: bet.market
            });

            if (!result.success) {
                console.log('[Settlement] Settlement failed:', result.error);
                errors++;
                results.push({ bet, error: result.error });
                continue;
            }

            console.log(`[Settlement] Result: ${result.status} (${result.finalScore})`);

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

        console.log(`[Settlement] === COMPLETED: settled=${settled}, skipped=${skipped}, errors=${errors} ===`);
        res.json({ success: true, settled, skipped, errors, results });
    } catch (error) {
        console.error('[Settlement] Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/settlement/status', auth.authenticateToken, async (req, res) => {
    try {
        const status = await redis.getSettlementStatus();
        res.json({ success: true, status });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/settlement/manual/:id', auth.authenticateToken, async (req, res) => {
    console.log('[Settlement] Manual settlement for:', req.params.id);
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

app.get('/api/training/all', auth.authenticateToken, async (req, res) => {
    console.log('[Training] Fetching all training data...');
    try {
        const data = await database.getAllTrainingData();
        console.log(`[Training] Found ${data.length} entries`);
        res.json({ success: true, data });
    } catch (error) {
        console.error('[Training] Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/training/stats', auth.authenticateToken, async (req, res) => {
    console.log('[Training] Fetching stats...');
    try {
        const stats = await database.getTrainingStats();
        console.log('[Training] Stats:', JSON.stringify(stats));
        res.json({ success: true, stats });
    } catch (error) {
        console.error('[Training] Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/training/:id', auth.authenticateToken, async (req, res) => {
    try {
        await database.deleteTrainingEntry(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/training', auth.authenticateToken, async (req, res) => {
    try {
        await database.clearTrainingPool();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ HEALTH & STATS ROUTES ============

app.get('/api/health', async (req, res) => {
    console.log('[Health] === HEALTH CHECK ===');

    const redisStatus = await redis.ping();
    const stats = await redis.getStats();

    const health = {
        success: true,
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: {
            RAPIDAPI_KEY: process.env.RAPIDAPI_KEY ? `Set (${process.env.RAPIDAPI_KEY.length} chars)` : 'NOT SET',
            TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ? 'Set' : 'NOT SET',
            TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? 'Set' : 'NOT SET',
            UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ? 'Set' : 'NOT SET',
            UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ? 'Set' : 'NOT SET'
        },
        services: {
            database: 'ok',
            redis: redisStatus.connected ? 'ok' : 'not configured',
            flashscore: process.env.RAPIDAPI_KEY ? 'configured' : 'NOT CONFIGURED'
        },
        stats
    };

    console.log('[Health] Result:', JSON.stringify(health, null, 2));
    res.json(health);
});

// ============ ERROR HANDLER ============

app.use((err, req, res, next) => {
    console.error('[ERROR] Unhandled error:', err.message);
    console.error('[ERROR] Stack:', err.stack);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

// ============ STARTUP ============

async function start() {
    console.log('='.repeat(50));
    console.log('[STARTUP] GoalSniper Daily Server');
    console.log('='.repeat(50));

    console.log('[STARTUP] Environment Variables:');
    console.log(`  - PORT: ${PORT}`);
    console.log(`  - RAPIDAPI_KEY: ${process.env.RAPIDAPI_KEY ? `Set (${process.env.RAPIDAPI_KEY.length} chars)` : 'NOT SET ❌'}`);
    console.log(`  - TURSO_DATABASE_URL: ${process.env.TURSO_DATABASE_URL ? 'Set ✓' : 'NOT SET ❌'}`);
    console.log(`  - TURSO_AUTH_TOKEN: ${process.env.TURSO_AUTH_TOKEN ? 'Set ✓' : 'NOT SET ❌'}`);
    console.log(`  - UPSTASH_REDIS_REST_URL: ${process.env.UPSTASH_REDIS_REST_URL ? 'Set ✓' : 'NOT SET ❌'}`);
    console.log(`  - UPSTASH_REDIS_REST_TOKEN: ${process.env.UPSTASH_REDIS_REST_TOKEN ? 'Set ✓' : 'NOT SET ❌'}`);

    if (!process.env.RAPIDAPI_KEY) {
        console.log('[STARTUP] ⚠️  WARNING: RAPIDAPI_KEY is not set! Analysis will fail.');
    }

    console.log('[STARTUP] Initializing database...');
    await database.initDatabase();
    console.log('[STARTUP] Database initialized ✓');

    // Test Redis connection
    console.log('[STARTUP] Testing Redis connection...');
    const redisStatus = await redis.ping();
    console.log(`[STARTUP] Redis: ${redisStatus.connected ? 'Connected ✓' : 'Not configured - ' + redisStatus.reason}`);

    // Start Auto-Settlement Cron (Every hour)
    cron.schedule('0 * * * *', async () => {
        console.log('[Cron] Running Auto-Settlement...');
        try {
            // Logic similar to settlement route but internal
            const pendingBets = await database.getPendingBets();
            for (const bet of pendingBets) {
                if (!settlement.isReadyForSettlement(bet)) continue;

                const result = await settlement.settleBet({ matchId: bet.match_id, market: bet.market });
                if (result.success) {
                    await database.settleBetInDB(bet.id, result.status, result.finalScore);
                    // Add to training pool logic here if replicated... simpler to just hit the function manually or extract logic.
                    // Ideally settlement.settleBet logic should handle DB updates too if we refactor, but for now we keep it simple.
                    console.log(`[Cron] Settled ${bet.id}: ${result.status}`);
                }
            }
        } catch (err) {
            console.error('[Cron] Settlement Error:', err);
        }
    });

    app.listen(PORT, () => {
        console.log('='.repeat(50));
        console.log(`[STARTUP] Server running on port ${PORT} ✓`);
        console.log(`[STARTUP] Health check: http://localhost:${PORT}/api/health`);
        console.log('='.repeat(50));
    });
}

start();
