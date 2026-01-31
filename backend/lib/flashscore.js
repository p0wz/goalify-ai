/**
 * Flashscore API Client
 * Handles all API requests and response parsing
 */

const axios = require('axios');

// Main API config (for daily analysis)
const FLASHSCORE_API = {
    baseURL: 'https://flashscore4.p.rapidapi.com',
    headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
        'X-RapidAPI-Host': 'flashscore4.p.rapidapi.com'
    }
};

// Live Bot API config (separate key for live scanning)
const FLASHSCORE_API_LIVE = {
    baseURL: 'https://flashscore4.p.rapidapi.com',
    headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY_LIVE || process.env.RAPIDAPI_KEY || '',
        'X-RapidAPI-Host': 'flashscore4.p.rapidapi.com'
    }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url, options, retries = 5, delay = 2000) {
    try {
        return await axios.get(url, options);
    } catch (error) {
        if (error.response && error.response.status === 429 && retries > 0) {
            console.log(`[Flashscore] Rate limit (429). Waiting ${delay / 1000}s... (Retries left: ${retries})`);
            await sleep(delay);
            return fetchWithRetry(url, options, retries - 1, delay * 2); // Exponential backoff
        }
        throw error;
    }
}

/**
 * Fetch matches for a specific day
 * @param {number} day - 0 (yesterday), 1 (today), 2 (tomorrow)
 * @param {Array} allowedLeagues - List of allowed leagues
 */
async function fetchDayMatches(day = 1, allowedLeagues = []) {
    try {
        const response = await fetchWithRetry(
            `${FLASHSCORE_API.baseURL}/api/flashscore/v1/match/list/${day}/0`,
            { headers: FLASHSCORE_API.headers, timeout: 15000 }
        );

        const data = response.data;
        const matches = [];
        const list = Array.isArray(data) ? data : Object.values(data);
        const now = Date.now();

        list.forEach(tournament => {
            if (!tournament.matches || !Array.isArray(tournament.matches)) return;

            const leagueName = tournament.name || 'Unknown League';

            // League filter
            if (allowedLeagues.length > 0) {
                const normalizedLeague = normalizeText(leagueName);
                const isAllowed = allowedLeagues.some(allowed => {
                    const normalizedAllowed = normalizeText(allowed);
                    return normalizedLeague.includes(normalizedAllowed) ||
                        normalizedAllowed.includes(normalizedLeague);
                });
                if (!isAllowed) return;
            }

            tournament.matches.forEach((match, index) => {
                if (index === 0) console.log('[Flashscore] RAW Match Sample:', JSON.stringify(match));
                const matchTime = match.timestamp ? match.timestamp * 1000 : 0;
                if (matchTime < now) return; // Skip started/finished matches

                const matchId = match.match_id || match.id || match.eventId ||
                    `${match.timestamp}_${(match.home_team?.name || 'UNK').substring(0, 3)}_${(match.away_team?.name || 'UNK').substring(0, 3)}`;

                matches.push({
                    matchId,
                    timestamp: match.timestamp,
                    homeTeam: match.home_team?.name || 'Unknown',
                    awayTeam: match.away_team?.name || 'Unknown',
                    league: leagueName
                });
            });
        });

        return matches;
    } catch (error) {
        console.error('[Flashscore] fetchDayMatches error:', error.message);
        return [];
    }
}

/**
 * Fetch H2H data for a match
 */
async function fetchH2H(matchId) {
    try {
        await sleep(400);
        const response = await fetchWithRetry(
            `${FLASHSCORE_API.baseURL}/api/flashscore/v1/match/h2h/${matchId}`,
            { headers: FLASHSCORE_API.headers, timeout: 15000 }
        );

        const data = response.data;
        return Array.isArray(data) ? data : (data.DATA || []);
    } catch (error) {
        console.error('[Flashscore] fetchH2H error:', error.message);
        return null;
    }
}

/**
 * Fetch match details (for HT scores)
 */
async function fetchMatchDetails(matchId) {
    try {
        await sleep(300);
        const response = await fetchWithRetry(
            `${FLASHSCORE_API.baseURL}/api/flashscore/v1/match/details/${matchId}`,
            { headers: FLASHSCORE_API.headers, timeout: 15000 }
        );
        return response.data;
    } catch (error) {
        console.error('[Flashscore] fetchMatchDetails error:', error.message);
        return null;
    }
}

/**
 * Fetch match odds
 */
async function fetchMatchOdds(matchId) {
    try {
        await sleep(300);
        const response = await fetchWithRetry(
            `${FLASHSCORE_API.baseURL}/api/flashscore/v1/match/odds/${matchId}`,
            { headers: FLASHSCORE_API.headers, timeout: 15000 }
        );
        return response.data;
    } catch (error) {
        return null;
    }
}

/**
 * Parse match result from details response
 */
function parseMatchResult(data) {
    if (!data) return null;

    let homeGoals = null;
    let awayGoals = null;

    // Try multiple formats
    if (data.home_team?.score !== undefined && data.away_team?.score !== undefined) {
        homeGoals = parseInt(data.home_team.score) || 0;
        awayGoals = parseInt(data.away_team.score) || 0;
    } else if (data.home_score?.current !== undefined) {
        homeGoals = parseInt(data.home_score.current) || 0;
        awayGoals = parseInt(data.away_score.current) || 0;
    } else if (data.result_home !== undefined) {
        homeGoals = parseInt(data.result_home) || 0;
        awayGoals = parseInt(data.result_away) || 0;
    } else if (data.homeScore !== undefined) {
        homeGoals = parseInt(data.homeScore) || 0;
        awayGoals = parseInt(data.awayScore) || 0;
    } else if (data.score) {
        const parts = data.score.replace(/\s/g, '').split('-');
        if (parts.length === 2) {
            homeGoals = parseInt(parts[0]) || 0;
            awayGoals = parseInt(parts[1]) || 0;
        }
    } else if (data.scores?.home !== undefined) {
        homeGoals = parseInt(data.scores.home) || 0;
        awayGoals = parseInt(data.scores.away) || 0;
    }

    // Parse HT scores
    let htHome = null;
    let htAway = null;

    if (data.home_team?.score_1st_half !== undefined) {
        htHome = parseInt(data.home_team.score_1st_half) || 0;
        htAway = parseInt(data.away_team.score_1st_half) || 0;
    } else if (data.home_score?.period1 !== undefined) {
        htHome = parseInt(data.home_score.period1) || 0;
        htAway = parseInt(data.away_score.period1) || 0;
    } else if (data.scores?.['1st_half']) {
        const htParts = String(data.scores['1st_half']).split('-');
        if (htParts.length === 2) {
            htHome = parseInt(htParts[0]) || 0;
            htAway = parseInt(htParts[1]) || 0;
        }
    }

    // Check if finished
    const status = data.stage || data.status || data.matchStatus;
    const isFinished = status && (
        status.toLowerCase().includes('finished') ||
        status.toLowerCase().includes('ft') ||
        status.toLowerCase().includes('ended')
    );

    if (homeGoals === null) return null;

    return {
        homeGoals,
        awayGoals,
        htHome,
        htAway,
        finalScore: `${homeGoals}-${awayGoals}`,
        isFinished,
        status
    };
}

/**
 * Format odds for AI prompt
 */
function formatOddsForPrompt(oddsData) {
    if (!oddsData || !Array.isArray(oddsData) || oddsData.length === 0) return '';

    const bookmaker = oddsData[0];
    if (!bookmaker || !bookmaker.odds) return '';

    const oddsArray = bookmaker.odds;
    let oddsText = `\n5. BETTING ODDS (${bookmaker.name}):\n`;
    let hasOdds = false;

    const findOdds = (type, scope = 'FULL_TIME') =>
        oddsArray.find(o => o.bettingType === type && o.bettingScope === scope);

    // 1X2
    const hda = findOdds('HOME_DRAW_AWAY');
    if (hda && hda.odds && hda.odds.length >= 3) {
        const home = hda.odds[0]?.value;
        const draw = hda.odds[1]?.value || hda.odds.find(o => o.eventParticipantId === null)?.value;
        const away = hda.odds[2]?.value || hda.odds[1]?.value;
        oddsText += `   - 1X2: Home ${home || 'N/A'} | Draw ${draw || 'N/A'} | Away ${away || 'N/A'}\n`;
        hasOdds = true;
    }

    // Over/Under
    const ou = findOdds('OVER_UNDER');
    if (ou && ou.odds) {
        const overUnder = {};
        ou.odds.forEach(o => {
            if (o.handicap?.value && o.selection) {
                const line = o.handicap.value;
                if (!overUnder[line]) overUnder[line] = {};
                overUnder[line][o.selection] = o.value;
            }
        });
        ['1.5', '2.5', '3.5'].forEach(line => {
            if (overUnder[line]) {
                oddsText += `   - O/U ${line}: Over ${overUnder[line].OVER || 'N/A'} | Under ${overUnder[line].UNDER || 'N/A'}\n`;
                hasOdds = true;
            }
        });
    }

    // BTTS
    const btts = findOdds('BOTH_TEAMS_TO_SCORE');
    if (btts && btts.odds) {
        const yesOdd = btts.odds.find(o => o.bothTeamsToScore === true)?.value;
        const noOdd = btts.odds.find(o => o.bothTeamsToScore === false)?.value;
        if (yesOdd || noOdd) {
            oddsText += `   - BTTS: Yes ${yesOdd || 'N/A'} | No ${noOdd || 'N/A'}\n`;
            hasOdds = true;
        }
    }

    // Double Chance
    const dc = findOdds('DOUBLE_CHANCE');
    if (dc && dc.odds && dc.odds.length >= 3) {
        const dcOdds = dc.odds.map(o => o.value);
        oddsText += `   - DC: 1X ${dcOdds[0] || 'N/A'} | 12 ${dcOdds[1] || 'N/A'} | X2 ${dcOdds[2] || 'N/A'}\n`;
        hasOdds = true;
    }

    return hasOdds ? oddsText : '';
}

function normalizeText(text) {
    if (!text) return '';
    return text
        .toLowerCase()
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ç/g, 'c')
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ö/g, 'o')
        .replace(/é/g, 'e')
        .replace(/á/g, 'a')
        .replace(/ñ/g, 'n')
        .replace(/[^a-z0-9\s]/g, '');
}

/**
 * Fetch live matches (v2) - Uses LIVE key
 */
async function fetchLiveMatchesV2() {
    try {
        await sleep(400);
        // v2 endpoint: /api/flashscore/v2/matches/live
        const response = await fetchWithRetry(
            `${FLASHSCORE_API_LIVE.baseURL}/api/flashscore/v2/matches/live?sport_id=1`,
            { headers: FLASHSCORE_API_LIVE.headers, timeout: 15000 }
        );
        return response.data || [];
    } catch (error) {
        console.error('[Flashscore] fetchLiveMatchesV2 error:', error.message);
        return [];
    }
}

/**
 * Fetch match statistics (v2) - Uses LIVE key
 */
async function fetchMatchStatsV2(matchId) {
    try {
        await sleep(400);
        // v2 endpoint: /api/flashscore/v2/matches/match/stats
        const response = await fetchWithRetry(
            `${FLASHSCORE_API_LIVE.baseURL}/api/flashscore/v2/matches/match/stats?match_id=${matchId}`,
            { headers: FLASHSCORE_API_LIVE.headers, timeout: 15000 }
        );
        return response.data || null;
    } catch (error) {
        console.error('[Flashscore] fetchMatchStatsV2 error:', error.message);
        return null;
    }
}

/**
 * Fetch match H2H (alias for live bot compatibility)
 * Note: Still using v1 H2H for now unless specifically requested to migrate H2H too
 */
async function fetchMatchH2H(matchId) {
    return fetchH2H(matchId);
}

module.exports = {
    fetchDayMatches,
    fetchH2H,
    fetchMatchDetails,
    fetchMatchOdds,
    parseMatchResult,
    formatOddsForPrompt,
    normalizeText,
    // Live bot functions
    fetchLiveMatches: fetchLiveMatchesV2, // Pointing "fetchLiveMatches" to V2 implementation
    fetchMatchStats: fetchMatchStatsV2,   // Pointing "fetchMatchStats" to V2 implementation
    fetchLiveMatchesV1: fetchLiveMatches, // Keeping original as backup alias
    fetchMatchStatsV1: fetchMatchStats,   // Keeping original as backup alias
    fetchMatchH2H
};
