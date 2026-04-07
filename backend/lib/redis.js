/**
 * Redis Cache Module - Upstash Redis
 * Used for caching analysis results and real-time state
 */

const { Redis } = require('@upstash/redis');

let redis = null;

function getClient() {
    if (redis) return redis;

    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        console.log('[Redis] Not configured - using memory cache');
        return null;
    }

    redis = new Redis({ url, token });
    console.log('[Redis] Connected to Upstash');
    return redis;
}

// ============ ANALYSIS CACHE (CHUNKED) ============

const ANALYSIS_CACHE_KEY = 'goalsniper:analysis:results';
const ANALYSIS_RESULTS_PREFIX = 'goalsniper:analysis:results:part';
const ANALYSIS_MATCHES_PREFIX = 'goalsniper:analysis:matches:part';
const ANALYSIS_CACHE_TTL = 7200; // 2 hours
const CHUNK_SIZE = 50; // Legacy keeping, no longer governs index strictly

async function savePartialAnalysisResults(resultsChunk, matchesChunk, isFirst = false) {
    const client = getClient();
    if (!client) return false;

    try {
        let metadata = { 
            resultsCount: 0, 
            allMatchesCount: 0, 
            resultsParts: 0, 
            matchesParts: 0, 
            version: 'double-chunked-v2' 
        };
        
        if (!isFirst) {
            const existing = await client.get(ANALYSIS_CACHE_KEY);
            if (existing) {
                const parsed = typeof existing === 'string' ? JSON.parse(existing) : existing;
                metadata = { ...metadata, ...parsed };
            }
        } else {
            console.log('[Redis] New analysis started, resetting chunk indexes...');
        }

        const resultsPartIdx = metadata.resultsParts || 0;
        const matchesPartIdx = metadata.matchesParts || 0;

        let resultsAdded = false;
        let matchesAdded = false;

        // Save results chunk safely in its own unique key
        if (resultsChunk && resultsChunk.length > 0) {
            const key = `${ANALYSIS_RESULTS_PREFIX}${resultsPartIdx}`;
            await client.set(key, JSON.stringify(resultsChunk), { ex: ANALYSIS_CACHE_TTL });
            metadata.resultsParts = resultsPartIdx + 1;
            metadata.resultsCount += resultsChunk.length;
            resultsAdded = true;
        }

        // Save matches chunk safely in its own unique key
        if (matchesChunk && matchesChunk.length > 0) {
            const key = `${ANALYSIS_MATCHES_PREFIX}${matchesPartIdx}`;
            await client.set(key, JSON.stringify(matchesChunk), { ex: ANALYSIS_CACHE_TTL });
            metadata.matchesParts = matchesPartIdx + 1;
            metadata.allMatchesCount += matchesChunk.length;
            matchesAdded = true;
        }

        metadata.version = 'double-chunked-v2';

        // Save metadata
        await client.set(ANALYSIS_CACHE_KEY, JSON.stringify(metadata), { ex: ANALYSIS_CACHE_TTL });

        console.log(`[Redis] Flush: Results Part ${resultsAdded ? resultsPartIdx : '-'} (${resultsChunk.length}), Matches Part ${matchesAdded ? matchesPartIdx : '-'} (${matchesChunk.length})`);
        return true;
    } catch (error) {
        console.error('[Redis] Partial cache error:', error.message);
        return false;
    }
}

// Wrapper for backward compatibility
async function cacheAnalysisResults(data) {
    const { results = [], allMatches = [] } = data;
    return savePartialAnalysisResults(results, allMatches, true);
}

async function getCachedAnalysisResults() {
    const client = getClient();
    if (!client) return null;

    try {
        const metadataRaw = await client.get(ANALYSIS_CACHE_KEY);
        if (!metadataRaw) return null;

        const metadata = typeof metadataRaw === 'string' ? JSON.parse(metadataRaw) : metadataRaw;

        // Backward compatibility
        if (metadata.version !== 'double-chunked' && metadata.version !== 'double-chunked-v2') {
            console.log('[Redis] Legacy cache format detected');
            return Array.isArray(metadata.results) ? metadata : { results: [], allMatches: [] };
        }

        const results = [];
        const allMatches = [];

        // 1. Fetch Results Chunks
        const resultsPartCount = metadata.version === 'double-chunked-v2' 
            ? (metadata.resultsParts || 0) 
            : Math.ceil((metadata.resultsCount || 0) / CHUNK_SIZE);
            
        for (let i = 0; i < resultsPartCount; i++) {
            const key = `${ANALYSIS_RESULTS_PREFIX}${i}`;
            const chunkRaw = await client.get(key);
            if (chunkRaw) {
                const chunk = typeof chunkRaw === 'string' ? JSON.parse(chunkRaw) : chunkRaw;
                if (Array.isArray(chunk)) results.push(...chunk);
            }
        }

        // 2. Fetch Matches Chunks
        const matchesPartCount = metadata.version === 'double-chunked-v2'
            ? (metadata.matchesParts || 0)
            : Math.ceil((metadata.allMatchesCount || 0) / CHUNK_SIZE);
            
        for (let i = 0; i < matchesPartCount; i++) {
            const key = `${ANALYSIS_MATCHES_PREFIX}${i}`;
            const chunkRaw = await client.get(key);
            if (chunkRaw) {
                const chunk = typeof chunkRaw === 'string' ? JSON.parse(chunkRaw) : chunkRaw;
                if (Array.isArray(chunk)) allMatches.push(...chunk);
            }
        }

        console.log(`[Redis] Reconstructed ${results.length} results and ${allMatches.length} total matches. Metadata claimed: ${metadata.resultsCount} res, ${metadata.allMatchesCount} matches.`);
        return { results, allMatches };
    } catch (error) {
        console.error('[Redis] Get cache error:', error.message);
        return null;
    }
}

async function invalidateAnalysisCache() {
    const client = getClient();
    if (!client) return false;

    try {
        await client.del(ANALYSIS_CACHE_KEY);
        console.log('[Redis] Analysis cache invalidated');
        return true;
    } catch (error) {
        return false;
    }
}

// ============ SETTLEMENT STATUS ============

const SETTLEMENT_STATUS_KEY = 'goalsniper:settlement:status';

async function setSettlementStatus(status) {
    const client = getClient();
    if (!client) return false;

    try {
        await client.set(SETTLEMENT_STATUS_KEY, JSON.stringify({
            ...status,
            updatedAt: new Date().toISOString()
        }), { ex: 86400 }); // 24 hours
        return true;
    } catch (error) {
        return false;
    }
}

async function getSettlementStatus() {
    const client = getClient();
    if (!client) return null;

    try {
        const data = await client.get(SETTLEMENT_STATUS_KEY);
        return data ? (typeof data === 'string' ? JSON.parse(data) : data) : null;
    } catch (error) {
        return null;
    }
}

// ============ RATE LIMITING ============

async function checkRateLimit(key, maxRequests = 10, windowSeconds = 60) {
    const client = getClient();
    if (!client) return { allowed: true }; // No rate limiting without Redis

    try {
        const rateLimitKey = `goalsniper:ratelimit:${key}`;
        const current = await client.incr(rateLimitKey);

        if (current === 1) {
            await client.expire(rateLimitKey, windowSeconds);
        }

        const allowed = current <= maxRequests;
        return {
            allowed,
            current,
            limit: maxRequests,
            remaining: Math.max(0, maxRequests - current)
        };
    } catch (error) {
        return { allowed: true };
    }
}

// ============ REAL-TIME STATS ============

async function incrementStat(stat) {
    const client = getClient();
    if (!client) return;

    try {
        const key = `goalsniper:stats:${stat}`;
        await client.incr(key);
    } catch (error) {
        // Silently fail
    }
}

async function getStats() {
    const client = getClient();
    if (!client) return null;

    try {
        const keys = ['analysisRuns', 'betsApproved', 'betsSettled', 'apiCalls'];
        const result = {};

        for (const key of keys) {
            const val = await client.get(`goalsniper:stats:${key}`);
            result[key] = parseInt(val) || 0;
        }

        return result;
    } catch (error) {
        return null;
    }
}

// ============ HEALTH CHECK ============

async function ping() {
    const client = getClient();
    if (!client) return { connected: false, reason: 'Not configured' };

    try {
        const result = await client.ping();
        return { connected: true, result };
    } catch (error) {
        return { connected: false, reason: error.message };
    }
}

// ============ PUBLISHED MATCHES (User-facing Analiz Tab) ============

const PUBLISHED_MATCHES_KEY = 'goalsniper:published:matches';
const PUBLISHED_MATCHES_TTL = 86400; // 24 hours

async function publishMatch(matchData) {
    const client = getClient();
    if (!client) return false;

    try {
        const existing = await getPublishedMatches();
        const alreadyPublished = existing.some(m => m.matchId === matchData.matchId);
        if (alreadyPublished) {
            console.log(`[Redis] Match ${matchData.matchId} already published, skipping`);
            return { success: true, duplicate: true };
        }

        const enriched = {
            ...matchData,
            publishedAt: new Date().toISOString()
        };

        const updated = [...existing, enriched];
        await client.set(PUBLISHED_MATCHES_KEY, JSON.stringify(updated), { ex: PUBLISHED_MATCHES_TTL });
        console.log(`[Redis] Published match: ${matchData.homeTeam} vs ${matchData.awayTeam} (total: ${updated.length})`);
        return { success: true, duplicate: false, total: updated.length };
    } catch (error) {
        console.error('[Redis] Publish error:', error.message);
        return { success: false, error: error.message };
    }
}

async function getPublishedMatches() {
    const client = getClient();
    if (!client) return [];

    try {
        const data = await client.get(PUBLISHED_MATCHES_KEY);
        if (data) {
            const matches = typeof data === 'string' ? JSON.parse(data) : data;
            return Array.isArray(matches) ? matches : [];
        }
        return [];
    } catch (error) {
        console.error('[Redis] Get published error:', error.message);
        return [];
    }
}

async function clearPublishedMatches() {
    const client = getClient();
    if (!client) return false;

    try {
        await client.del(PUBLISHED_MATCHES_KEY);
        console.log('[Redis] Published matches cleared');
        return true;
    } catch (error) {
        return false;
    }
}

// ============ ETSY API KEYS ============

const ETSY_KEYS_KEY = 'goalsniper:etsy:keys';

function generateKeyString() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let key = 'SENTIO_';
    for (let i = 0; i < 16; i++) key += chars[Math.floor(Math.random() * chars.length)];
    return key;
}

async function generateEtsyKey(label = '') {
    const client = getClient();
    if (!client) return null;

    try {
        const key = generateKeyString();
        const meta = JSON.stringify({
            label: label || 'Etsy Customer',
            createdAt: new Date().toISOString(),
            active: true
        });
        await client.hset(ETSY_KEYS_KEY, { [key]: meta });
        console.log(`[Redis] Generated Etsy key: ${key}`);
        return key;
    } catch (error) {
        console.error('[Redis] Etsy key gen error:', error.message);
        return null;
    }
}

async function validateEtsyKey(key) {
    const client = getClient();
    if (!client) return false;

    try {
        const meta = await client.hget(ETSY_KEYS_KEY, key);
        if (!meta) return false;
        const parsed = typeof meta === 'string' ? JSON.parse(meta) : meta;
        return parsed.active !== false;
    } catch (error) {
        return false;
    }
}

async function listEtsyKeys() {
    const client = getClient();
    if (!client) return [];

    try {
        const all = await client.hgetall(ETSY_KEYS_KEY);
        if (!all) return [];
        return Object.entries(all).map(([key, meta]) => {
            const parsed = typeof meta === 'string' ? JSON.parse(meta) : meta;
            return { key, ...parsed };
        });
    } catch (error) {
        return [];
    }
}

async function revokeEtsyKey(key) {
    const client = getClient();
    if (!client) return false;

    try {
        await client.hdel(ETSY_KEYS_KEY, key);
        console.log(`[Redis] Revoked Etsy key: ${key}`);
        return true;
    } catch (error) {
        return false;
    }
}

module.exports = {
    getClient,
    // Analysis Cache
    cacheAnalysisResults,
    savePartialAnalysisResults,
    getCachedAnalysisResults,
    invalidateAnalysisCache,
    // Settlement
    setSettlementStatus,
    getSettlementStatus,
    // Rate Limiting
    checkRateLimit,
    // Stats
    incrementStat,
    getStats,
    // Health
    ping,
    // Published Matches
    publishMatch,
    getPublishedMatches,
    clearPublishedMatches,
    // Etsy API Keys
    generateEtsyKey,
    validateEtsyKey,
    listEtsyKeys,
    revokeEtsyKey
};
