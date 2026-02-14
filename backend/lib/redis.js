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

// ============ ANALYSIS CACHE ============

const ANALYSIS_CACHE_KEY = 'goalsniper:analysis:results';
const ANALYSIS_CACHE_TTL = 3600; // 1 hour

async function cacheAnalysisResults(results) {
    const client = getClient();
    if (!client) return false;

    try {
        await client.set(ANALYSIS_CACHE_KEY, JSON.stringify(results), { ex: ANALYSIS_CACHE_TTL });
        console.log(`[Redis] Cached ${results.length} analysis results`);
        return true;
    } catch (error) {
        console.error('[Redis] Cache error:', error.message);
        return false;
    }
}

async function getCachedAnalysisResults() {
    const client = getClient();
    if (!client) return null;

    try {
        const data = await client.get(ANALYSIS_CACHE_KEY);
        if (data) {
            const results = typeof data === 'string' ? JSON.parse(data) : data;
            console.log(`[Redis] Retrieved ${results.length} cached results`);
            return results;
        }
        return null;
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

module.exports = {
    getClient,
    // Analysis Cache
    cacheAnalysisResults,
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
    clearPublishedMatches
};
