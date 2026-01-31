require('dotenv').config();
const flashscore = require('./lib/flashscore');

async function test() {
    console.log('--- FETCHING LIVE MATCHES (V2) ---');
    try {
        const liveData = await flashscore.fetchLiveMatches();
        console.log(`TYPE: ${Array.isArray(liveData) ? 'Array' : typeof liveData}`);
        console.log(`COUNT: ${liveData.length}`);

        if (liveData.length > 0) {
            const tournament = liveData[0];
            console.log('--- SAMPLE TOURNAMENT ---');
            console.log(`NAME: ${tournament.name}`);

            if (tournament.matches && tournament.matches.length > 0) {
                const m = tournament.matches[0];
                console.log('--- SAMPLE MATCH RAW ---');
                console.log(JSON.stringify(m, null, 2));

                console.log('--- PARSED VALUES (Server Logic) ---');
                const elapsed = m.match_status?.live_time || parseInt(m.stage) || 0;
                const homeScore = parseInt(m.scores?.home) || parseInt(m.home_team?.score) || 0;
                const awayScore = parseInt(m.scores?.away) || parseInt(m.away_team?.score) || 0;

                console.log(`ELAPSED: ${elapsed}`);
                console.log(`HOME SCORE: ${homeScore} (Type: ${typeof homeScore})`);
                console.log(`AWAY SCORE: ${awayScore} (Type: ${typeof awayScore})`);
            } else {
                console.log('No matches in first tournament');
            }
        }
    } catch (error) {
        console.error('ERROR:', error);
    }
}

test();
