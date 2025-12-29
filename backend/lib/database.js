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

    console.log('[Database] Initialized');
}

// ============ APPROVED BETS ============

async function approveBet(betData) {
    const client = getClient();
    const id = uuidv4();
    const now = new Date().toISOString();

    await client.execute({
        sql: `INSERT INTO approved_bets (id, match_id, home_team, away_team, league, market, odds, status, approved_at, match_time)
              VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
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

async function getAllApprovedBets() {
    const client = getClient();
    const result = await client.execute('SELECT * FROM approved_bets ORDER BY approved_at DESC');
    return result.rows;
}

async function getPendingBets() {
    const client = getClient();
    const result = await client.execute({
        sql: 'SELECT * FROM approved_bets WHERE status = ? ORDER BY approved_at DESC',
        args: ['PENDING']
    });
    return result.rows;
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
        sql: `INSERT INTO training_pool (id, match, home_team, away_team, league, market, odds, result, final_score, home_goals, away_goals, stats, settled_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    const result = await client.execute(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN result = 'WON' THEN 1 ELSE 0 END) as won,
            SUM(CASE WHEN result = 'LOST' THEN 1 ELSE 0 END) as lost,
            SUM(CASE WHEN result = 'REFUND' THEN 1 ELSE 0 END) as refund
        FROM training_pool
    `);

    const row = result.rows[0];
    const total = row.total || 0;
    const won = row.won || 0;
    const lost = row.lost || 0;
    const refund = row.refund || 0;
    const winRate = (won + lost) > 0 ? ((won / (won + lost)) * 100).toFixed(1) : 0;

    return { total, won, lost, refund, winRate: parseFloat(winRate) };
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
    clearTrainingPool
};
