/**
 * Database Module - Turso/LibSQL
 */

const { createClient } = require('@libsql/client');
const { v4: uuidv4 } = require('uuid');

let db = null;

function getClient() {
    if (db) return db;

    let url = process.env.TURSO_DATABASE_URL || 'file:local.db';
    if (url.startsWith('libsql://')) {
        url = url.replace('libsql://', 'https://');
    }

    db = createClient({
        url,
        authToken: process.env.TURSO_AUTH_TOKEN || undefined
    });

    return db;
}

async function initDatabase() {
    const client = getClient();

    // Create approved_bets table
    await client.execute(`
        CREATE TABLE IF NOT EXISTS approved_bets (
            id TEXT PRIMARY KEY,
            match_id TEXT,
            home_team TEXT,
            away_team TEXT,
            league TEXT,
            market TEXT,
            odds TEXT,
            status TEXT DEFAULT 'PENDING',
            final_score TEXT,
            approved_at TEXT,
            settled_at TEXT,
            match_time TEXT
        )
    `);

    // Create training_pool table
    await client.execute(`
        CREATE TABLE IF NOT EXISTS training_pool (
            id TEXT PRIMARY KEY,
            match TEXT,
            home_team TEXT,
            away_team TEXT,
            league TEXT,
            market TEXT,
            odds TEXT,
            result TEXT,
            final_score TEXT,
            home_goals INTEGER,
            away_goals INTEGER,
            stats TEXT,
            settled_at TEXT
        )
    `);

    // Create users table
    await client.execute(`
        CREATE TABLE IF NOT EXISTS users(
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        password_hash TEXT,
        firebase_uid TEXT,
        name TEXT,
        role TEXT DEFAULT 'user',
        plan TEXT DEFAULT 'free',
        is_premium INTEGER DEFAULT 0,
        created_at TEXT
    )
        `);

    // Migration: Add is_premium column if not exists
    try {
        await client.execute(`ALTER TABLE users ADD COLUMN is_premium INTEGER DEFAULT 0`);
        console.log('[Database] Added is_premium column');
    } catch (e) {
        // Column already exists, ignore
    }

    // Migration: Add firebase_uid column if not exists
    try {
        await client.execute(`ALTER TABLE users ADD COLUMN firebase_uid TEXT`);
        console.log('[Database] Added firebase_uid column');
    } catch (e) {
        // Column already exists, ignore
    }

    // Migration: Add name column if not exists
    try {
        await client.execute(`ALTER TABLE users ADD COLUMN name TEXT`);
        console.log('[Database] Added name column');
    } catch (e) {
        // Column already exists, ignore
    }

    // Create mobile_bets table
    await client.execute(`
        CREATE TABLE IF NOT EXISTS mobile_bets (
            id TEXT PRIMARY KEY,
            bet_id TEXT,
            home_team TEXT,
            away_team TEXT,
            league TEXT,
            market TEXT,
            odds TEXT,
            status TEXT DEFAULT 'PENDING',
            final_score TEXT,
            match_time TEXT,
            created_at TEXT
        )
    `);

    // Create live_signals table
    await client.execute(`
        CREATE TABLE IF NOT EXISTS live_signals (
            id TEXT PRIMARY KEY,
            match_id TEXT,
            home_team TEXT,
            away_team TEXT,
            league TEXT,
            strategy TEXT,
            strategy_code TEXT,
            entry_score TEXT,
            entry_time INTEGER,
            confidence INTEGER,
            reason TEXT,
            status TEXT DEFAULT 'PENDING',
            final_score TEXT,
            settled_at INTEGER
        )
    `);

    console.log('[Database] Initialized');
}

// ============ APPROVED BETS ============

async function approveBet(betData) {
    const client = getClient();
    const id = uuidv4();
    const now = new Date().toISOString();

    await client.execute({
        sql: `INSERT INTO approved_bets(id, match_id, home_team, away_team, league, market, odds, status, approved_at, match_time)
              VALUES(?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
        args: [
            id,
            betData.matchId,
            betData.homeTeam,
            betData.awayTeam,
            betData.league,
            betData.market,
            betData.odds || null,
            now,
            betData.matchTime || null
        ]
    });

    return { success: true, id };
}

function mapBetFromDB(row) {
    return {
        id: row.id,
        matchId: row.match_id,
        homeTeam: row.home_team,
        awayTeam: row.away_team,
        league: row.league,
        market: row.market,
        odds: row.odds,
        status: row.status,
        finalScore: row.final_score,
        approvedAt: row.approved_at,
        settledAt: row.settled_at,
        matchTime: row.match_time
    };
}

async function getAllApprovedBets() {
    const client = getClient();
    const result = await client.execute('SELECT * FROM approved_bets ORDER BY approved_at DESC');
    return result.rows.map(mapBetFromDB);
}

async function getPendingBets() {
    const client = getClient();
    const result = await client.execute({
        sql: 'SELECT * FROM approved_bets WHERE status = ? ORDER BY approved_at DESC',
        args: ['PENDING']
    });
    return result.rows.map(mapBetFromDB);
}

async function settleBetInDB(id, status, finalScore) {
    const client = getClient();
    const now = new Date().toISOString();

    await client.execute({
        sql: 'UPDATE approved_bets SET status = ?, final_score = ?, settled_at = ? WHERE id = ?',
        args: [status, finalScore, now, id]
    });

    return { success: true };
}

async function deleteBet(id) {
    const client = getClient();
    await client.execute({
        sql: 'DELETE FROM approved_bets WHERE id = ?',
        args: [id]
    });
    return { success: true };
}

// ============ TRAINING POOL ============

async function addToTrainingPool(data) {
    const client = getClient();
    const id = uuidv4();
    const now = new Date().toISOString();

    await client.execute({
        sql: `INSERT INTO training_pool(id, match, home_team, away_team, league, market, odds, result, final_score, home_goals, away_goals, stats, settled_at)
              VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
            id,
            `${data.homeTeam} vs ${data.awayTeam}`,
            data.homeTeam,
            data.awayTeam,
            data.league,
            data.market,
            data.odds || null,
            data.result,
            data.finalScore,
            data.homeGoals,
            data.awayGoals,
            data.stats ? JSON.stringify(data.stats) : null,
            now
        ]
    });

    return { success: true, id };
}

async function getAllTrainingData() {
    const client = getClient();
    const result = await client.execute('SELECT * FROM training_pool ORDER BY settled_at DESC');
    return result.rows.map(row => ({
        ...row,
        stats: row.stats ? JSON.parse(row.stats) : null
    }));
}

async function getTrainingStats() {
    const client = getClient();

    // Global Stats
    const result = await client.execute(`
        SELECT 
            COUNT(*) as total,
        SUM(CASE WHEN result = 'WON' THEN 1 ELSE 0 END) as won,
        SUM(CASE WHEN result = 'LOST' THEN 1 ELSE 0 END) as lost,
        SUM(CASE WHEN result = 'REFUND' THEN 1 ELSE 0 END) as refund
        FROM training_pool
        `);

    const row = result.rows[0];
    const stats = {
        total: row.total || 0,
        won: row.won || 0,
        lost: row.lost || 0,
        refund: row.refund || 0,
        winRate: 0
    };
    stats.winRate = (stats.won + stats.lost) > 0 ? ((stats.won / (stats.won + stats.lost)) * 100).toFixed(1) : 0;

    // Market Stats
    const marketResult = await client.execute(`
        SELECT 
            market,
        COUNT(*) as total,
        SUM(CASE WHEN result = 'WON' THEN 1 ELSE 0 END) as won,
        SUM(CASE WHEN result = 'LOST' THEN 1 ELSE 0 END) as lost,
        SUM(CASE WHEN result = 'REFUND' THEN 1 ELSE 0 END) as refund
        FROM training_pool
        GROUP BY market
        ORDER BY total DESC
        `);

    const marketStats = marketResult.rows.map(m => {
        const wr = (m.won + m.lost) > 0 ? ((m.won / (m.won + m.lost)) * 100).toFixed(1) : 0;
        return { ...m, winRate: parseFloat(wr) };
    });

    return { ...stats, winRate: parseFloat(stats.winRate), byMarket: marketStats };
}

async function deleteTrainingEntry(id) {
    const client = getClient();
    await client.execute({
        sql: 'DELETE FROM training_pool WHERE id = ?',
        args: [id]
    });
    return { success: true };
}

async function clearTrainingPool() {
    const client = getClient();
    await client.execute('DELETE FROM training_pool');
    return { success: true };
}

// ============ USER MANAGEMENT ============

async function createUser({ email, passwordHash, role = 'user', plan = 'free' }) {
    const client = getClient();
    const id = uuidv4();
    const now = new Date().toISOString();

    try {
        await client.execute({
            sql: `INSERT INTO users(id, email, password_hash, role, plan, created_at)
                  VALUES(?, ?, ?, ?, ?, ?)`,
            args: [id, email, passwordHash, role, plan, now]
        });
        return { success: true, id, email, role, plan };
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            throw new Error('Email already exists');
        }
        throw error;
    }
}

async function getUserByEmail(email) {
    const client = getClient();
    const result = await client.execute({
        sql: 'SELECT * FROM users WHERE email = ?',
        args: [email]
    });
    return result.rows[0] || null;
}

async function getUserByFirebaseUid(firebaseUid) {
    const client = getClient();
    const result = await client.execute({
        sql: 'SELECT id, email, role, plan, is_premium, firebase_uid, name, created_at FROM users WHERE firebase_uid = ?',
        args: [firebaseUid]
    });
    return result.rows[0] || null;
}

async function createFirebaseUser({ firebaseUid, email, name, role = 'user', plan = 'free' }) {
    const client = getClient();
    const id = uuidv4();
    const now = new Date().toISOString();

    await client.execute({
        sql: `INSERT INTO users(id, firebase_uid, email, name, role, plan, is_premium, created_at)
              VALUES(?, ?, ?, ?, ?, ?, 0, ?)`,
        args: [id, firebaseUid, email, name, role, plan, now]
    });

    return { id, firebaseUid, email, name, role, plan, isPremium: false };
}

async function getUserById(id) {
    const client = getClient();
    const result = await client.execute({
        sql: 'SELECT id, email, role, plan, is_premium, firebase_uid, name, created_at FROM users WHERE id = ?',
        args: [id]
    });
    return result.rows[0] || null;
}

async function getAllUsers() {
    const client = getClient();
    const result = await client.execute('SELECT id, email, role, plan, is_premium, created_at FROM users ORDER BY created_at DESC');
    return result.rows.map(row => ({
        ...row,
        isPremium: row.is_premium === 1
    }));
}

async function updateUserPlan(id, plan) {
    const client = getClient();
    await client.execute({
        sql: 'UPDATE users SET plan = ? WHERE id = ?',
        args: [plan, id]
    });
    return { success: true };
}

async function updateUserPremium(id, isPremium) {
    const client = getClient();
    await client.execute({
        sql: 'UPDATE users SET is_premium = ? WHERE id = ?',
        args: [isPremium ? 1 : 0, id]
    });
    return { success: true };
}

// ============ MOBILE BETS ============

async function addToMobileBets(betData) {
    const client = getClient();
    const id = uuidv4();
    const now = new Date().toISOString();

    await client.execute({
        sql: `INSERT INTO mobile_bets(id, bet_id, home_team, away_team, league, market, odds, status, match_time, created_at)
              VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
            id,
            betData.betId || null,
            betData.homeTeam,
            betData.awayTeam,
            betData.league,
            betData.market,
            betData.odds || null,
            betData.status || 'PENDING',
            betData.matchTime || null,
            now
        ]
    });

    return { success: true, id };
}

function mapMobileBetFromDB(row) {
    return {
        id: row.id,
        betId: row.bet_id,
        homeTeam: row.home_team,
        awayTeam: row.away_team,
        league: row.league,
        market: row.market,
        odds: row.odds,
        status: row.status,
        finalScore: row.final_score,
        matchTime: row.match_time,
        createdAt: row.created_at
    };
}

async function getAllMobileBets() {
    const client = getClient();
    const result = await client.execute('SELECT * FROM mobile_bets ORDER BY created_at DESC');
    return result.rows.map(mapMobileBetFromDB);
}

async function getMobileBetsByStatus(status) {
    const client = getClient();
    const result = await client.execute({
        sql: 'SELECT * FROM mobile_bets WHERE status = ? ORDER BY created_at DESC',
        args: [status]
    });
    return result.rows.map(mapMobileBetFromDB);
}

async function updateMobileBetStatus(id, status, finalScore = null) {
    const client = getClient();
    await client.execute({
        sql: 'UPDATE mobile_bets SET status = ?, final_score = ? WHERE id = ?',
        args: [status, finalScore, id]
    });
    return { success: true };
}

async function deleteMobileBet(id) {
    const client = getClient();
    await client.execute({
        sql: 'DELETE FROM mobile_bets WHERE id = ?',
        args: [id]
    });
    return { success: true };
}

// ============ LIVE SIGNALS ============

async function addLiveSignal(signal) {
    const client = getClient();
    const id = signal.id || uuidv4();

    await client.execute({
        sql: `INSERT INTO live_signals(id, match_id, home_team, away_team, league, strategy, strategy_code, entry_score, entry_time, confidence, reason, status)
              VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
        args: [
            id,
            signal.matchId,
            signal.home,
            signal.away,
            signal.league,
            signal.strategy,
            signal.strategyCode,
            signal.entryScore || signal.score,
            Date.now(),
            signal.confidencePercent,
            signal.reason || ''
        ]
    });

    return { success: true, id };
}

function mapLiveSignalFromDB(row) {
    return {
        id: row.id,
        matchId: row.match_id,
        home: row.home_team,
        away: row.away_team,
        league: row.league,
        strategy: row.strategy,
        strategyCode: row.strategy_code,
        entryScore: row.entry_score,
        entryTime: row.entry_time,
        confidence: row.confidence,
        reason: row.reason,
        status: row.status,
        finalScore: row.final_score,
        settledAt: row.settled_at
    };
}

async function getLiveSignals(status = null) {
    const client = getClient();
    let result;
    if (status) {
        result = await client.execute({
            sql: 'SELECT * FROM live_signals WHERE status = ? ORDER BY entry_time DESC',
            args: [status]
        });
    } else {
        result = await client.execute('SELECT * FROM live_signals ORDER BY entry_time DESC');
    }
    return result.rows.map(mapLiveSignalFromDB);
}

async function updateLiveSignal(id, updates) {
    const client = getClient();

    const fields = [];
    const args = [];

    if (updates.status) { fields.push('status = ?'); args.push(updates.status); }
    if (updates.finalScore) { fields.push('final_score = ?'); args.push(updates.finalScore); }
    if (updates.settledAt) { fields.push('settled_at = ?'); args.push(updates.settledAt); }

    args.push(id);

    await client.execute({
        sql: `UPDATE live_signals SET ${fields.join(', ')} WHERE id = ?`,
        args
    });

    return { success: true };
}

async function getLiveSignalStats() {
    const client = getClient();
    const result = await client.execute(`
        SELECT 
            strategy_code,
            status,
            COUNT(*) as count
        FROM live_signals
        GROUP BY strategy_code, status
    `);
    return result.rows;
}

module.exports = {
    initDatabase,
    // Approved Bets
    approveBet,
    getAllApprovedBets,
    getPendingBets,
    settleBetInDB,
    deleteBet,
    // Training Pool
    addToTrainingPool,
    getAllTrainingData,
    getTrainingStats,
    deleteTrainingEntry,
    clearTrainingPool,
    // Users
    createUser,
    getUserByEmail,
    getUserByFirebaseUid,
    createFirebaseUser,
    getUserById,
    getAllUsers,
    updateUserPlan,
    updateUserPremium,
    // Mobile Bets
    addToMobileBets,
    getAllMobileBets,
    getMobileBetsByStatus,
    updateMobileBetStatus,
    deleteMobileBet,
    // Live Signals
    addLiveSignal,
    getLiveSignals,
    updateLiveSignal,
    getLiveSignalStats
};
