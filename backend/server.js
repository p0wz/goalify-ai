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
const creem = require('./lib/creem');
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
    origin: function (origin, callback) {
        const allowedOrigins = [
            'https://sentiopicks.com',
            'https://www.sentiopicks.com',
            'https://sentio.pages.dev',
            'https://goalify-ai.pages.dev',
            'http://localhost:5173',
            'http://localhost:3000',
            'http://localhost:8081',
            'http://localhost:19006'
        ];
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('[CORS] Blocked origin:', origin);
            callback(null, true); // Allow anyway for debugging
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200,
    preflightContinue: false
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
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

// ============ PUBLISHED MATCHES (User-facing Analiz Tab) ============

// Admin publishes a match (with stats) to the user-facing Analiz tab
app.post('/api/matches/publish', auth.authenticateToken, auth.requireAuth('admin'), async (req, res) => {
    console.log('[Publish] Publishing match to Analiz tab...');
    try {
        const { matchId, homeTeam, awayTeam, league, timestamp, stats, detailedStats } = req.body;

        if (!matchId || !homeTeam || !awayTeam) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const result = await redis.publishMatch({
            matchId,
            homeTeam,
            awayTeam,
            league: league || 'Unknown',
            timestamp: timestamp || Math.floor(Date.now() / 1000),
            stats: stats || {},
            detailedStats: detailedStats || ''
        });

        if (result.duplicate) {
            return res.json({ success: true, message: 'Already published', duplicate: true });
        }

        console.log(`[Publish] ✅ ${homeTeam} vs ${awayTeam} published (total: ${result.total})`);
        res.json({ success: true, message: 'Match published', total: result.total });
    } catch (error) {
        console.error('[Publish] Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Users fetch published matches (premium gate applied)
app.get('/api/public/matches', auth.authenticateToken, async (req, res) => {
    try {
        const allMatches = await redis.getPublishedMatches();

        // Sort by timestamp ascending (earliest first)
        allMatches.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

        const user = req.user;
        const isPremium = user?.isPremium || user?.is_premium || user?.plan === 'pro' || user?.plan === 'pro_plus' || user?.role === 'admin';
        const FREE_LIMIT = 3;

        const matches = isPremium ? allMatches : allMatches.slice(0, FREE_LIMIT);

        res.json({
            success: true,
            matches,
            totalCount: allMatches.length,
            isPremium,
            limited: !isPremium && allMatches.length > FREE_LIMIT
        });
    } catch (error) {
        console.error('[PublicMatches] Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin clears all published matches
app.delete('/api/matches/published', auth.authenticateToken, auth.requireAuth('admin'), async (req, res) => {
    try {
        await redis.clearPublishedMatches();
        res.json({ success: true, message: 'All published matches cleared' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ ETSY API (Public Data + Key Management) ============

// Public data endpoint — no auth, API key validation only
app.get('/api/etsy/daily', async (req, res) => {
    try {
        const key = req.query.key;
        if (!key) return res.status(400).json({ error: 'API key required' });

        const valid = await redis.validateEtsyKey(key);
        if (!valid) return res.status(403).json({ error: 'Invalid or revoked API key' });

        const matches = await redis.getPublishedMatches();
        matches.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

        const today = new Date().toISOString().split('T')[0];
        res.json({
            date: today,
            count: matches.length,
            provider: 'SENTIO PICKS AI',
            matches: matches.map(m => ({
                homeTeam: m.homeTeam,
                awayTeam: m.awayTeam,
                league: m.league,
                kickoff: m.timestamp ? new Date(m.timestamp * 1000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '--:--',
                stats: m.stats || {},
                detailedStats: m.detailedStats || ''
            }))
        });
    } catch (error) {
        console.error('[Etsy] Error:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin: Generate key
app.post('/api/admin/etsy-keys', auth.authenticateToken, auth.requireAuth('admin'), async (req, res) => {
    try {
        const { label } = req.body;
        const key = await redis.generateEtsyKey(label);
        if (!key) return res.status(500).json({ success: false, error: 'Key generation failed' });
        res.json({ success: true, key });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin: List all keys
app.get('/api/admin/etsy-keys', auth.authenticateToken, auth.requireAuth('admin'), async (req, res) => {
    try {
        const keys = await redis.listEtsyKeys();
        res.json({ success: true, keys });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin: Revoke key
app.delete('/api/admin/etsy-keys/:key', auth.authenticateToken, auth.requireAuth('admin'), async (req, res) => {
    try {
        const result = await redis.revokeEtsyKey(req.params.key);
        res.json({ success: result, message: result ? 'Key revoked' : 'Key not found' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin: Generate Excel from published matches
app.post('/api/export/excel', auth.authenticateToken, auth.requireAuth('admin'), async (req, res) => {
    try {
        const ExcelJS = require('exceljs');
        const matches = await redis.getPublishedMatches();
        matches.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

        const wb = new ExcelJS.Workbook();
        wb.creator = 'SENTIO PICKS AI';
        wb.created = new Date();

        // === OVERVIEW SHEET ===
        const ws = wb.addWorksheet('Overview', { views: [{ state: 'frozen', ySplit: 2 }] });

        // Branding row
        ws.mergeCells('A1:Q1');
        const brandCell = ws.getCell('A1');
        brandCell.value = `SENTIO PICKS — Daily AI Football Analysis • ${new Date().toLocaleDateString('en-US')}`;
        brandCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
        brandCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
        brandCell.alignment = { horizontal: 'center', vertical: 'middle' };
        ws.getRow(1).height = 36;

        // Headers
        const headers = [
            'Match', 'League', 'Time', 'League Avg',
            'H Win%', 'A Win%', 'H O2.5%', 'A O2.5%',
            'BTTS%', 'H Avg Scored', 'A Avg Scored',
            'H Avg Conceded', 'A Avg Conceded', 'H CS%', 'A CS%',
            'H FH Win%', 'A FH Win%'
        ];
        const headerRow = ws.addRow(headers);
        headerRow.eachCell(cell => {
            cell.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.border = {
                bottom: { style: 'thin', color: { argb: 'FF10B981' } }
            };
        });
        headerRow.height = 28;

        // Data rows
        for (const m of matches) {
            const s = m.stats || {};
            const hf = s.homeForm || {};
            const af = s.awayForm || {};
            const hh = s.homeHomeStats || {};
            const aa = s.awayAwayStats || {};
            const kickoff = m.timestamp ? new Date(m.timestamp * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--';
            const leagueAvg = hf.avgTotalGoals && af.avgTotalGoals ? ((hf.avgTotalGoals + af.avgTotalGoals) / 2).toFixed(2) : '-';

            const row = ws.addRow([
                `${m.homeTeam} vs ${m.awayTeam}`,
                m.league,
                kickoff,
                leagueAvg,
                hf.winRate ? hf.winRate.toFixed(0) : '-',
                af.winRate ? af.winRate.toFixed(0) : '-',
                hf.over25Rate ? hf.over25Rate.toFixed(0) : '-',
                af.over25Rate ? af.over25Rate.toFixed(0) : '-',
                hf.bttsRate && af.bttsRate ? ((hf.bttsRate + af.bttsRate) / 2).toFixed(0) : '-',
                hh.avgScored ? hh.avgScored.toFixed(2) : '-',
                aa.avgScored ? aa.avgScored.toFixed(2) : '-',
                hh.avgConceded ? hh.avgConceded.toFixed(2) : '-',
                aa.avgConceded ? aa.avgConceded.toFixed(2) : '-',
                hf.cleanSheetRate ? hf.cleanSheetRate.toFixed(0) : '-',
                af.cleanSheetRate ? af.cleanSheetRate.toFixed(0) : '-',
                hf.firstHalfWinRate ? hf.firstHalfWinRate.toFixed(0) : '-',
                af.firstHalfWinRate ? af.firstHalfWinRate.toFixed(0) : '-'
            ]);

            row.eachCell((cell, colNum) => {
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.font = { size: 10 };

                // Conditional coloring for percentage columns (5-17)
                if (colNum >= 5 && colNum <= 17) {
                    const val = parseFloat(cell.value);
                    if (!isNaN(val)) {
                        if (val >= 70) cell.font = { size: 10, color: { argb: 'FF10B981' }, bold: true };
                        else if (val >= 40) cell.font = { size: 10, color: { argb: 'FFF59E0B' } };
                        else cell.font = { size: 10, color: { argb: 'FFEF4444' } };
                    }
                }
            });
        }

        // Auto-fit columns
        ws.columns.forEach((col, i) => {
            col.width = i === 0 ? 32 : i === 1 ? 24 : 12;
        });

        // === GUIDE SHEET ===
        const guide = wb.addWorksheet('User Guide');
        guide.mergeCells('A1:D1');
        guide.getCell('A1').value = 'SENTIO PICKS — User Guide';
        guide.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FF10B981' } };

        const instructions = [
            '', 'This spreadsheet was generated by SENTIO AI.',
            '', '📊 Overview Sheet:',
            '  • Contains detailed statistics for all matches.',
            '  • Green = 70%+ (Strong)', '  • Yellow = 40-70% (Medium)', '  • Red = Below 40% (Weak)',
            '', '📌 Column Descriptions:',
            '  • League Avg = Average total goals per match for both teams',
            '  • H/A Win% = Win rate', '  • O2.5% = Over 2.5 goals rate',
            '  • BTTS% = Both teams to score rate', '  • CS% = Clean sheet rate',
            '  • FH Win% = First half win rate',
            '', '📄 AI Prompt Sheet:',
            '  • Copy the text from the AI Prompt sheet and paste it into ChatGPT, Claude, or any AI to get detailed analysis.',
            '', '⚡ For daily updates, use the Google Sheets script or VBA macro.',
            '  Extensions > Apps Script > Run fetchTodaysData'
        ];
        instructions.forEach((line, i) => {
            guide.getCell(`A${i + 3}`).value = line;
            guide.getCell(`A${i + 3}`).font = { size: 11 };
        });
        guide.getColumn(1).width = 70;

        // === AI PROMPT SHEET ===
        const promptSheet = wb.addWorksheet('AI Prompt');
        promptSheet.mergeCells('A1:C1');
        promptSheet.getCell('A1').value = 'SENTIO PICKS — AI Analysis Prompt';
        promptSheet.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FF10B981' } };
        promptSheet.getCell('A2').value = 'Copy this text and paste it into ChatGPT, Claude, or any AI chatbot to get a detailed match analysis.';
        promptSheet.getCell('A2').font = { size: 10, italic: true, color: { argb: 'FF9CA3AF' } };

        let promptRow = 4;
        for (const m of matches) {
            if (m.detailedStats) {
                const lines = m.detailedStats.split('\n');
                for (const line of lines) {
                    promptSheet.getCell(`A${promptRow}`).value = line;
                    promptSheet.getCell(`A${promptRow}`).font = { size: 10, name: 'Consolas' };
                    promptRow++;
                }
                // Separator
                promptSheet.getCell(`A${promptRow}`).value = '---';
                promptSheet.getCell(`A${promptRow}`).font = { size: 10, color: { argb: 'FF6B7280' } };
                promptRow += 2;
            }
        }
        promptSheet.getColumn(1).width = 100;

        // Generate buffer
        const buffer = await wb.xlsx.writeBuffer();
        const filename = `SENTIO_Daily_Analysis_${new Date().toISOString().split('T')[0]}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(Buffer.from(buffer));
    } catch (error) {
        console.error('[Excel] Error:', error.message);
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

    // Get current live matches (Admin - Live Scores Tab)
    app.post('/api/live/current-matches', auth.authenticateToken, auth.requireAuth('admin'), async (req, res) => {
        try {
            const { leagueFilter } = req.body;
            console.log(`[API] Fetching live matches (Filter: ${leagueFilter})`);

            let matches = [];

            // 1. Try V2 (Hybrid Strategy) from Live Bot Key
            try {
                const liveData = await flashscore.fetchLiveMatches();
                const tournaments = Array.isArray(liveData) ? liveData : [];

                for (const tournament of tournaments) {
                    if (!tournament.matches) continue;
                    for (const m of tournament.matches) {
                        // V2 Exact Parsing based on User JSON
                        // live_time: "22", "Half Time", "90+"
                        let elapsed = m.match_status?.live_time || '';
                        let displayMinute = elapsed; // For UI

                        // Parse simple integer for sorting/logic if needed, but UI can take string
                        if (elapsed === 'Half Time') displayMinute = 'HT';

                        // Score is DIRECT number in V2
                        // Check explicit undefined because 0 is falsy
                        const homeScore = m.scores?.home !== undefined ? m.scores.home : 0;
                        const awayScore = m.scores?.away !== undefined ? m.scores.away : 0;

                        // Status check
                        const isFinished = m.match_status?.is_finished === true;

                        if (!isFinished) {
                            matches.push({
                                matchId: m.match_id || m.id,
                                homeTeam: m.home_team?.name || 'Unknown',
                                awayTeam: m.away_team?.name || 'Unknown',
                                homeScore,
                                awayScore,
                                minute: displayMinute,
                                league: `${tournament.country_name || ''}: ${tournament.name || m.league_name || ''}`,
                                status: m.match_status?.status_type || 'LIVE' // e.g. "live"
                            });
                        }
                    }
                }
            } catch (v2Error) {
                console.error('[API] V2 Fetch failed, trying V1 fallback:', v2Error.message);
            }

            // 2. Fallback to V1 (Daily Key/Live Key) if V2 returned nothing or failed
            if (matches.length === 0) {
                console.log('[API] V2 returned 0 matches, switching to V1 Fallback...');
                try {
                    const liveDataV1 = await flashscore.fetchLiveMatchesV1(); // Explicit V1 call
                    const list = Array.isArray(liveDataV1) ? liveDataV1 : [];

                    for (const tournament of list) {
                        for (const m of tournament.matches || []) {
                            const elapsed = parseInt(m.stage) || 0; // V1: "45" or "1"
                            // V1 Parsing: home_team.score is usually set
                            matches.push({
                                matchId: m.match_id || m.id,
                                homeTeam: m.home_team?.name || 'Unknown',
                                awayTeam: m.away_team?.name || 'Unknown',
                                homeScore: parseInt(m.home_team?.score) || 0,
                                awayScore: parseInt(m.away_team?.score) || 0,
                                minute: elapsed,
                                league: `${tournament.country_name || ''}: ${tournament.name || 'Unknown'}`,
                                status: 'LIVE'
                            });
                        }
                    }
                } catch (v1Error) {
                    console.error('[API] V1 Fallback failed:', v1Error.message);
                }
            }

            console.log(`[API] Returning ${matches.length} live matches (Source: ${matches.length > 0 ? 'Hybrid/V2' : 'Empty'})`);
            res.json({
                success: true,
                matches,
                count: matches.length,
                backendVersion: 'v2.3' // Version Check
            });
        } catch (error) {
            console.error('[API] Live matches error:', error.message);
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

    // ============ CREEM.IO PAYMENT ROUTES ============

    // Create checkout session
    app.post('/api/payments/checkout', auth.authenticateToken, async (req, res) => {
        try {
            const { planType } = req.body; // 'monthly' or 'yearly'
            const user = req.user;

            console.log(`[Payment] Request from user ${user.id} (${user.email}), plan: ${planType}`);

            if (!planType || !['monthly', 'yearly'].includes(planType)) {
                return res.status(400).json({ success: false, error: 'Invalid plan type' });
            }

            const productId = creem.getProductId(planType);
            console.log(`[Payment] Product ID: ${productId}`);

            const baseUrl = 'https://sentiopicks.com';

            const checkout = await creem.createCheckout({
                productId,
                userId: user.id,
                email: user.email,
                successUrl: `${baseUrl}/premium?success=true`
            });

            console.log('[Payment] Full checkout response:', JSON.stringify(checkout, null, 2));
            console.log('[Payment] checkout_url:', checkout.checkout_url);

            // Return the Creem checkout URL
            const checkoutUrl = checkout.checkout_url;
            if (!checkoutUrl) {
                console.error('[Payment] No checkout_url in response!');
                return res.status(500).json({ success: false, error: 'No checkout URL returned from Creem' });
            }

            console.log(`[Payment] Checkout created for user ${user.id}: ${planType}, URL: ${checkoutUrl}`);
            res.json({ success: true, checkoutUrl: checkoutUrl });
        } catch (error) {
            console.error('[Payment] Checkout error:', error.message);
            console.error('[Payment] Full error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Creem webhook handler
    // Handles checkout.completed events to upgrade users to PRO
    app.post('/api/webhooks/creem', express.json(), async (req, res) => {
        try {
            const parsed = creem.parseWebhookEvent(req.body);
            console.log('[Webhook] Creem event received:', parsed.eventType || 'unknown');
            console.log('[Webhook] Metadata:', JSON.stringify(parsed.metadata));

            // Handle checkout completion
            if (parsed.eventType === 'checkout.completed') {
                const userId = parsed.metadata?.user_id;
                const email = parsed.metadata?.email || parsed.customerEmail;

                if (userId) {
                    // Upgrade user to premium by ID
                    await database.updateUserPlan(userId, 'pro');
                    await database.updateUserPremium(userId, true);
                    console.log(`[Webhook] User ${userId} upgraded to PRO`);
                } else if (email) {
                    // Find user by email and upgrade
                    const user = await database.getUserByEmail(email);
                    if (user) {
                        await database.updateUserPlan(user.id, 'pro');
                        await database.updateUserPremium(user.id, true);
                        console.log(`[Webhook] User ${email} (ID: ${user.id}) upgraded to PRO`);
                    } else {
                        console.log(`[Webhook] User with email ${email} not found in database`);
                    }
                } else {
                    console.log('[Webhook] No user_id or email found in webhook');
                }
            }

            // Handle subscription expiration (user keeps access until period ends if canceled)
            // subscription.canceled = user requested cancel, but still has access until period ends
            // subscription.expired = period ended, now downgrade to free
            if (parsed.eventType === 'subscription.expired') {
                const email = parsed.customerEmail || parsed.metadata?.email;
                const userId = parsed.metadata?.user_id;

                console.log(`[Webhook] Subscription expired for user: ${userId || email}`);

                if (userId) {
                    await database.updateUserPlan(userId, 'free');
                    await database.updateUserPremium(userId, false);
                    console.log(`[Webhook] User ${userId} downgraded to FREE`);
                } else if (email) {
                    const user = await database.getUserByEmail(email);
                    if (user) {
                        await database.updateUserPlan(user.id, 'free');
                        await database.updateUserPremium(user.id, false);
                        console.log(`[Webhook] User ${email} (ID: ${user.id}) downgraded to FREE`);
                    }
                }
            }

            // Log canceled events for tracking (but don't downgrade yet)
            if (parsed.eventType === 'subscription.canceled') {
                console.log(`[Webhook] Subscription canceled (user keeps access until period ends): ${parsed.metadata?.user_id || parsed.customerEmail}`);
            }

            res.json({ received: true });
        } catch (error) {
            console.error('[Webhook] Error:', error.message);
            res.status(400).json({ error: error.message });
        }
    });

    // ============ ETSY GOOGLE SHEETS PUBLIC API ============

    // Admin publishes current analysis to public endpoint
    app.post('/api/stats/publish', auth.authenticateToken, auth.requireAuth('admin'), async (req, res) => {
        try {
            console.log('[Publish] Publishing stats to public endpoint...');

            // Get current cached analysis
            const cached = await redis.getCachedAnalysisResults();
            if (!cached || !cached.allMatches) {
                return res.status(400).json({
                    success: false,
                    error: 'No analysis data to publish. Run analysis first.'
                });
            }

            // Format for public consumption
            const publishedData = {
                publishedAt: new Date().toISOString(),
                matchCount: cached.allMatches.length,
                matches: cached.allMatches.map(m => ({
                    homeTeam: m.homeTeam,
                    awayTeam: m.awayTeam,
                    league: m.league,
                    kickoff: new Date(m.timestamp * 1000).toISOString(),
                    stats: m.detailedStats
                }))
            };

            // Store in Redis with public key
            await redis.set('public:etsy:stats', JSON.stringify(publishedData));

            console.log(`[Publish] Published ${publishedData.matchCount} matches`);
            res.json({
                success: true,
                message: `Published ${publishedData.matchCount} matches`,
                publishedAt: publishedData.publishedAt
            });
        } catch (error) {
            console.error('[Publish] Error:', error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Public endpoint for Google Sheets (PROTECTED BY QUERY KEY)
    app.get('/api/public/stats', async (req, res) => {
        try {
            // Simple security check
            // Müşterilerin script içinde bu key'i görebilir ama rastgele internet ziyaretçilerini engeller.
            const accessKey = req.query.key;
            if (accessKey !== 'sentio_secure_etsy_2026_x99') {
                return res.status(403).json({ success: false, error: 'Unauthorized access' });
            }

            const data = await redis.get('public:etsy:stats');
            if (!data) {
                return res.json({
                    success: false,
                    message: 'No published stats available yet.',
                    matches: []
                });
            }

            const parsed = JSON.parse(data);
            res.json({
                success: true,
                publishedAt: parsed.publishedAt,
                matchCount: parsed.matchCount,
                matches: parsed.matches
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
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
