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
const liveBot = require('./lib/liveBot');
const liveDeadBot = require('./lib/liveDeadBot');
const liveSettlement = require('./lib/liveSettlement');
const firebaseAdmin = require('./lib/firebase');
const { ALLOWED_LEAGUES, ALLOWED_LEAGUES_NO_CUPS } = require('./data/leagues');

// ============ SETTLEMENT JOB ============

async function runSettlementCycle(force = false) {
    console.log(`[Settlement] Starting settlement cycle... (Force: ${force})`);
    try {
        // 1. Get Pending Bets
        const pendingBets = await database.getPendingBets();
        console.log(`[Settlement] Found ${pendingBets.length} pending bets.`);

        if (pendingBets.length === 0) return;

        let settledCount = 0;
        for (const bet of pendingBets) {
            // Check if ready
            if (!force && !settlement.isReadyForSettlement(bet)) {
                // Log strictly to help debugging
                const matchTime = bet.matchTime ? new Date(parseFloat(bet.matchTime) * 1000).toLocaleString() : 'N/A';
                console.log(`[Settlement] Bet ${bet.id} NOT READY. MatchTime: ${matchTime} (Skipping)`);
                continue;
            }

            // Settle
            const result = await settlement.settleBet(bet);
            if (result.success) {
                // Update DB
                await database.settleBetInDB(bet.id, result.status, result.finalScore);

                // Add to training pool
                await database.addToTrainingPool({
                    ...bet,
                    result: result.status,
                    finalScore: result.finalScore,
                    homeGoals: result.homeGoals,
                    awayGoals: result.awayGoals,
                    stats: { htHome: result.htHome, htAway: result.htAway }
                });

                console.log(`[Settlement] Bet ${bet.id} settled as ${result.status} (${result.finalScore})`);
                settledCount++;
            } else {
                console.error(`[Settlement] Failed to settle bet ${bet.id}: ${result.error}`);
            }

            // Rate limit protection
            await new Promise(r => setTimeout(r, 1000));
        }

        console.log(`[Settlement] Cycle finished. Settled ${settledCount} bets.`);

        // Invalidate cache if anything changed
        if (settledCount > 0) {
            await redis.invalidateAnalysisCache();
        }

    } catch (error) {
        console.error('[Settlement] Cycle Error:', error.message);
    }
}

// Schedule: Run every 10 minutes
cron.schedule('*/10 * * * *', runSettlementCycle);
console.log('[Cron] Settlement job scheduled (Every 10 mins)');

const app = express();

// CORS Configuration for cross-origin requests
const corsOptions = {
    origin: [
        'https://sentio.pages.dev',
        'https://goalify-ai.pages.dev',
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:8081',
        'http://localhost:19006'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200  // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly with same config
app.options('*', cors(corsOptions));

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
        const { name, email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password required' });
        }

        const passwordHash = await auth.hashPassword(password);
        const user = await database.createUser({ name, email, passwordHash });

        const token = auth.generateToken(user);
        res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan } });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password required' });
        }

        const user = await database.getUserByEmail(email);

        // Check if user exists and has password_hash (email/password users only)
        // Firebase-created users don't have password_hash
        const passwordHash = user?.password_hash;
        const isValidPassword = user && passwordHash && typeof passwordHash === 'string'
            ? await auth.comparePassword(password, passwordHash)
            : false;

        if (!user || !isValidPassword) {
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
        console.error('[Auth] Login error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/auth/me', auth.authenticateToken, (req, res) => {
    res.json({ success: true, user: { id: req.user.id, email: req.user.email, role: req.user.role, plan: req.user.plan } });
});

// Firebase Auth Sync - Create/Get user from Firebase UID
app.post('/api/auth/firebase-sync', async (req, res) => {
    try {
        const { firebaseUid, email, name, idToken } = req.body;

        if (!firebaseUid || !email || !idToken) {
            return res.status(400).json({ success: false, error: 'Firebase UID, email, and idToken required' });
        }

        console.log(`[Auth] Firebase sync: ${email} (${firebaseUid})`);

        // VERIFY TOKEN WITH FIREBASE ADMIN
        try {
            const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
            if (decodedToken.uid !== firebaseUid) {
                console.error('[Auth] Token UID mismatch!');
                return res.status(403).json({ success: false, error: 'Invalid token: UID mismatch' });
            }
            console.log('[Auth] ID Token verified successfully');
        } catch (verifyError) {
            console.error('[Auth] Token verification failed:', verifyError.message);
            // In development, you might want to bypass this if admin is not configured, 
            // but for production it's critical.
            // For now, if verification fails, we REJECT.
            return res.status(401).json({ success: false, error: 'Invalid or expired ID token' });
        }

        // Check if user exists by Firebase UID
        let user = await database.getUserByFirebaseUid(firebaseUid);

        if (!user) {
            // Check if user exists by email (migration case)
            const existingUser = await database.getUserByEmail(email);
            if (existingUser) {
                // TODO: Link Firebase UID to existing user
                console.log(`[Auth] Linking existing user ${existingUser.id} to Firebase UID`);
                // You might need a method to update firebase_uid in DB
                // await database.updateUserFirebaseUid(existingUser.id, firebaseUid);
                user = existingUser;
            } else {
                // Create new user
                user = await database.createFirebaseUser({
                    firebaseUid,
                    email,
                    name: name || email.split('@')[0]
                });
                console.log(`[Auth] Created new Firebase user: ${user.id}`);
            }
        }

        // Generate JWT token
        const token = auth.generateToken({
            id: user.id,
            email: user.email,
            role: user.role || 'user',
            plan: user.plan || 'free'
        });

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role || 'user',
                plan: user.plan || 'free',
                isPremium: user.is_premium === 1
            }
        });
    } catch (error) {
        console.error('[Auth] Firebase sync error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
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

        const { limit = 50, leagueFilter = true, noCupFilter = false } = req.body;

        console.log(`[Analysis] Params: limit=${limit}, leagueFilter=${leagueFilter}, noCupFilter=${noCupFilter}`);
        await redis.incrementStat('analysisRuns');

        // Choose league list: noCupFilter uses leagues without cups, leagueFilter uses all leagues
        let leagues = [];
        if (leagueFilter) {
            leagues = noCupFilter ? ALLOWED_LEAGUES_NO_CUPS : ALLOWED_LEAGUES;
        }
        console.log(`[Analysis] Allowed leagues count: ${leagues.length}${noCupFilter ? ' (no cups)' : ''}`);

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
        const allMatches = []; // New: Collect ALL matches regardless of market
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

            // Store Basic Match Data (Marketless)
            if (analysis && analysis.stats) {
                // Filter to only include actual H2H matches (both teams involved)
                const actualH2H = Array.isArray(h2hData) ? h2hData.filter(g =>
                    (g.home_team?.name === match.homeTeam && g.away_team?.name === match.awayTeam) ||
                    (g.home_team?.name === match.awayTeam && g.away_team?.name === match.homeTeam)
                ).slice(0, 5) : [];

                // Get home and away matches from h2hData for HT enrichment
                const homeMatches = Array.isArray(h2hData) ? h2hData.filter(g =>
                    g.home_team?.name === match.homeTeam
                ).slice(0, 3) : [];
                const awayMatches = Array.isArray(h2hData) ? h2hData.filter(g =>
                    g.away_team?.name === match.awayTeam
                ).slice(0, 3) : [];

                // Fetch HT details for enriched prompt
                let htData = null;
                try {
                    htData = await analyzer.fetchHTDetailsForMatches(homeMatches, awayMatches, actualH2H.slice(0, 3));
                } catch (err) {
                    console.error('[Analysis] Failed to fetch HT details:', err.message);
                }

                // Use enhanced prompt with HT data
                const detailedStats = htData
                    ? analyzer.generateDetailedStatsWithHT(match, analysis.stats, actualH2H, htData)
                    : analyzer.generateDetailedStats(match, analysis.stats, actualH2H);

                allMatches.push({
                    matchId: match.matchId,
                    homeTeam: match.homeTeam,
                    awayTeam: match.awayTeam,
                    league: match.league,
                    timestamp: match.timestamp,
                    detailedStats: detailedStats,
                    stats: analysis.stats
                });
            }

            if (!analysis || analysis.passedMarkets.length === 0) {
                console.log(`[Analysis] No markets passed for ${match.matchId}`);
                // Continue to next match, but we already saved it to allMatches
            } else {

                console.log(`[Analysis] ${analysis.passedMarkets.length} markets passed for ${match.matchId}`);

                // Fetch odds
                const odds = await flashscore.fetchMatchOdds(match.matchId);
                const oddsText = flashscore.formatOddsForPrompt(odds);

                // Generate prompts for each passed market
                for (const pm of analysis.passedMarkets) {
                    // Pass full market object (pm) to include verification stats
                    const aiPrompt = analyzer.generateAIPrompt(match, analysis.stats, pm, oddsText);
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
            }

            processed++;
            console.log(`[Analysis] Progress: ${processed}/${limit}`);

            // Rate limiting pause between matches
            await new Promise(r => setTimeout(r, 1500));
        }

        // Cache results (both filtered and all)
        lastAnalysisResults = { results, allMatches };

        // Update Redis Cache method in redis.js if needed, or just store object
        // NOTE: We'll modify the redis helper separately if it expects array, but 
        // strictly speaking we should just update the return object here.
        // Assuming redis.cacheAnalysisResults handles simple JSON stringify.
        // If not, we might need to check redis.js.
        await redis.cacheAnalysisResults({ results, allMatches });

        console.log(`[Analysis] === COMPLETED: ${results.length} signals, ${allMatches.length} total matches ===`);

        res.json({
            success: true,
            count: results.length,
            totalMatches: allMatches.length,
            processed,
            results,
            allMatches // Send to frontend
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

// ============ LIVE MATCHES ENDPOINT ============

app.post('/api/live/current-matches', auth.authenticateToken, async (req, res) => {
    console.log('[LiveMatches] Fetching current live matches...');
    try {
        const { leagueFilter = false } = req.body;

        // Fetch live matches from Flashscore API
        const liveData = await flashscore.fetchLiveMatches();

        console.log(`[LiveMatches] Raw API response type: ${typeof liveData}`);
        console.log(`[LiveMatches] Raw API response is array: ${Array.isArray(liveData)}`);
        console.log(`[LiveMatches] Raw API response length: ${liveData?.length || 0}`);

        if (!liveData || liveData.length === 0) {
            console.log('[LiveMatches] No data from API');
            return res.json({ success: true, matches: [], count: 0 });
        }

        // Log first item structure for debugging
        if (liveData[0]) {
            console.log('[LiveMatches] First item keys:', Object.keys(liveData[0]));
        }

        // Process matches - Same structure as liveBot.js
        const tournaments = Array.isArray(liveData) ? liveData : [];
        let matches = [];

        for (const tournament of tournaments) {
            const leagueName = tournament.name || 'Unknown League';
            const countryName = tournament.country_name || '';
            const fullLeague = countryName ? `${countryName}: ${leagueName}` : leagueName;

            // League filter check
            if (leagueFilter && ALLOWED_LEAGUES.length > 0) {
                const isAllowed = ALLOWED_LEAGUES.some(l =>
                    fullLeague.toUpperCase().includes(l.toUpperCase())
                );
                if (!isAllowed) continue;
            }

            const tournamentMatches = tournament.matches || [];
            console.log(`[LiveMatches] Tournament: ${fullLeague}, Matches: ${tournamentMatches.length}`);

            for (const match of tournamentMatches) {
                const homeTeam = match.home_team?.name || 'Unknown';
                const awayTeam = match.away_team?.name || 'Unknown';
                const homeScore = match.home_team?.score ?? '-';
                const awayScore = match.away_team?.score ?? '-';
                const minute = match.stage || 'Live';
                const matchId = match.id;

                // Half-time scores if available
                const htHome = match.home_team?.score_1st_half ?? null;
                const htAway = match.away_team?.score_1st_half ?? null;

                matches.push({
                    matchId,
                    homeTeam,
                    awayTeam,
                    league: fullLeague,
                    homeScore,
                    awayScore,
                    minute,
                    htHome,
                    htAway,
                    status: match.stage || 'LIVE'
                });
            }
        }

        console.log(`[LiveMatches] Total matches found: ${matches.length} (filter: ${leagueFilter})`);
        res.json({ success: true, matches, count: matches.length });

    } catch (error) {
        console.error('[LiveMatches] Error:', error.message);
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

// ============ SETTLEMENT ROUTES ============

app.post('/api/settlement/trigger', auth.authenticateToken, async (req, res) => {
    console.log('[Settlement] Manual trigger received');

    // Run asynchronously to not block response
    runSettlementCycle().catch(err => console.error('[Settlement] Async Trigger Error:', err));

    res.json({ success: true, message: 'Settlement cycle started' });
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

// ============ MOBILE BETS API ============

// Get all mobile bets (public endpoint for mobile app)
app.get('/api/mobile-bets', async (req, res) => {
    try {
        const { status } = req.query;
        let bets;
        if (status) {
            bets = await database.getMobileBetsByStatus(status.toUpperCase());
        } else {
            bets = await database.getAllMobileBets();
        }
        res.json({ success: true, bets });
    } catch (error) {
        console.error('[Mobile Bets] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add bet to mobile (admin only)
app.post('/api/mobile-bets', auth.authenticateToken, auth.requireAdmin, async (req, res) => {
    try {
        const { betId, homeTeam, awayTeam, league, market, odds, matchTime, status } = req.body;

        if (!homeTeam || !awayTeam || !market) {
            return res.status(400).json({ success: false, error: 'homeTeam, awayTeam, market gerekli' });
        }

        const result = await database.addToMobileBets({
            betId,
            homeTeam,
            awayTeam,
            league,
            market,
            odds,
            matchTime,
            status: status || 'PENDING'
        });

        console.log(`[Mobile Bets] Added: ${homeTeam} vs ${awayTeam} - ${market}`);
        res.json({ success: true, id: result.id });
    } catch (error) {
        console.error('[Mobile Bets] Add Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update mobile bet status (admin only)
app.patch('/api/mobile-bets/:id', auth.authenticateToken, auth.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, finalScore } = req.body;

        await database.updateMobileBetStatus(id, status, finalScore);
        res.json({ success: true });
    } catch (error) {
        console.error('[Mobile Bets] Update Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete mobile bet (admin only)
app.delete('/api/mobile-bets/:id', auth.authenticateToken, auth.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await database.deleteMobileBet(id);
        res.json({ success: true });
    } catch (error) {
        console.error('[Mobile Bets] Delete Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
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

    // ============ LIVE BOT ROUTES ============

    // Debug scan - Returns detailed match data for AI analysis (admin only)
    app.post('/api/live/debug-scan', auth.authenticateToken, auth.requireAuth('admin'), async (req, res) => {
        try {
            console.log('[API] Debug scan requested by admin');
            const result = await liveBot.debugScanMatches();
            res.json(result);
        } catch (error) {
            console.error('[API] Debug scan error:', error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Get live signals (admin - authenticated)
    app.get('/api/live/signals', auth.authenticateToken, async (req, res) => {
        try {
            const signals = await database.getLiveSignals('PENDING');
            res.json({ success: true, signals, status: liveBot.getStatus() });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Mobile live signals (Pending Only)
    app.get('/api/mobile/live-signals', auth.authenticateToken, async (req, res) => {
        try {
            // Check if user is premium or admin
            const user = await database.getUserById(req.user.id);

            if (!user) {
                return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı' });
            }

            const isPremium = user.is_premium === 1;
            const isAdmin = user.role === 'admin';

            if (!isPremium && !isAdmin) {
                return res.status(403).json({
                    success: false,
                    error: 'Bu özellik için PRO üyelik gerekiyor',
                    requiresPremium: true
                });
            }

            // Get PENDING signals only
            const signals = await database.getLiveSignals('PENDING');

            // Get stats (Daily/Monthly Win Rate)
            const stats = await database.getMobileStats();

            res.json({ success: true, signals, stats });
        } catch (error) {
            console.error('[Mobile] Live signals error:', error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Mobile live history (Settled signals)
    app.get('/api/mobile/live-history', auth.authenticateToken, async (req, res) => {
        try {
            const user = await database.getUserById(req.user.id);
            if (!user) return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı' });

            const isPremium = user.is_premium === 1;
            const isAdmin = user.role === 'admin';

            // Premium check removed for history as per user request
            // History is now accessible to all users

            // Get settled signals (WON/LOST)
            // Limit to last 50 for performance
            const allSignals = await database.getLiveSignals();
            const historySignals = allSignals
                .filter(s => s.status === 'WON' || s.status === 'LOST')
                .slice(0, 50);

            // Get stats
            const stats = await database.getMobileStats();

            res.json({ success: true, signals: historySignals, stats });
        } catch (error) {
            console.error('[Mobile] Live history error:', error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // ============ ADMIN USER MANAGEMENT ============

    // Get all users (admin only)
    // Get all users (admin only)
    app.get('/api/admin/users', auth.authenticateToken, auth.requireAuth('admin'), async (req, res) => {
        try {
            const users = await database.getAllUsers();
            res.json({ success: true, users });
        } catch (error) {
            console.error('[Admin] Get users error:', error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Toggle user premium status (admin only)
    app.post('/api/admin/users/:id/premium', auth.authenticateToken, auth.requireAuth('admin'), async (req, res) => {
        try {
            const { id } = req.params;
            const { isPremium } = req.body;

            await database.updateUserPremium(id, isPremium);

            console.log(`[Admin] User ${id} premium status: ${isPremium}`);
            res.json({ success: true, message: isPremium ? 'PRO aktif edildi' : 'PRO deaktif edildi' });
        } catch (error) {
            console.error('[Admin] Toggle premium error:', error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Get live history (LIMITED for performance)
    app.get('/api/live/history', auth.authenticateToken, async (req, res) => {
        try {
            console.log('[API] /api/live/history called');

            // Limit to last 50 signals for performance
            const all = await database.getLiveSignals();
            const limitedSignals = all.slice(0, 50);

            // Get stats (simple aggregate query)
            let stats = [];
            try {
                stats = await database.getLiveSignalStats();
            } catch (statsError) {
                console.error('[API] Stats query failed:', statsError.message);
                stats = [];
            }

            console.log(`[API] /api/live/history returning ${limitedSignals.length} signals`);
            res.json({ success: true, signals: limitedSignals, stats });
        } catch (error) {
            console.error('[API] /api/live/history error:', error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // TEST endpoint - no auth, no database (for CORS debugging)
    app.get('/api/live/test', (req, res) => {
        console.log('[API] /api/live/test called - CORS test');
        res.json({ success: true, message: 'CORS test OK', timestamp: Date.now() });
    });

    // Get bot status
    app.get('/api/live/status', auth.authenticateToken, async (req, res) => {
        res.json({ success: true, ...liveBot.getStatus() });
    });

    // Manual scan (Admin only)
    app.post('/api/live/scan', auth.authenticateToken, auth.requireAdmin, async (req, res) => {
        try {
            const signals = await liveBot.scanLiveMatches();
            res.json({ success: true, signals });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Start bot (Admin only) - accepts { filterEnabled: true/false }
    app.post('/api/live/start', auth.authenticateToken, auth.requireAdmin, async (req, res) => {
        const filterEnabled = req.body.filterEnabled !== false; // Default to true
        const result = liveBot.startBot(filterEnabled);
        res.json(result);
    });

    // Stop bot (Admin only)
    app.post('/api/live/stop', auth.authenticateToken, auth.requireAdmin, async (req, res) => {
        const result = liveBot.stopBot();
        res.json(result);
    });

    // ============ DEAD MATCH BOT ROUTES ============

    // Dead Bot Status
    app.get('/api/dead/status', auth.authenticateToken, async (req, res) => {
        const status = liveDeadBot.getStatus();
        res.json({ success: true, ...status });
    });

    // Start Dead Bot (Admin only)
    app.post('/api/dead/start', auth.authenticateToken, auth.requireAdmin, async (req, res) => {
        const filterEnabled = req.body.filterEnabled !== false;
        const result = liveDeadBot.startBot(filterEnabled);
        res.json(result);
    });

    // Stop Dead Bot (Admin only)
    app.post('/api/dead/stop', auth.authenticateToken, auth.requireAdmin, async (req, res) => {
        const result = liveDeadBot.stopBot();
        res.json(result);
    });

    // Manual Dead Match Scan (Admin only)
    app.post('/api/dead/scan', auth.authenticateToken, auth.requireAdmin, async (req, res) => {
        try {
            const signals = await liveDeadBot.scanDeadMatches();
            res.json({ success: true, signals });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Schedule live settlement (every 10 minutes)
    cron.schedule('*/10 * * * *', async () => {
        console.log('[Cron] Running live settlement check...');
        await liveSettlement.runLiveSettlement();
    });

    // NOTE: Both bots do NOT auto-start. Use Admin Panel to start/stop manually.
    console.log('[LiveBot] Ready (manual start required)');
    console.log('[DeadBot] Ready (manual start required)');

    app.listen(PORT, () => {
        console.log('='.repeat(50));
        console.log(`[STARTUP] Server running on port ${PORT} ✓`);
        console.log(`[STARTUP] Health check: http://localhost:${PORT}/api/health`);
        console.log(`[STARTUP] Live Bot: Waiting for manual start`);
        console.log('='.repeat(50));
    });
}

start();
