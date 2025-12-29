const https = require('https');

async function postRequest(url, name) {
    console.log(`\n--- Testing ${name} ---`);
    console.log(`URL: ${url}`);

    return new Promise((resolve) => {
        const req = https.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, (res) => {
            console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log('Body:', data.substring(0, 1000));
                resolve();
            });
        });

        req.on('error', (e) => {
            console.error('Error:', e.message);
            resolve();
        });

        req.write(JSON.stringify({ limit: 1, leagueFilter: true }));
        req.end();
    });
}

async function run() {
    // 1. Backend Direct
    await postRequest('https://goalify-ai.onrender.com/api/analysis/run', 'DIRECT BACKEND');

    // 2. Frontend Proxy
    await postRequest('https://goalify-ai.pages.dev/api/analysis/run', 'CLOUDFLARE PROXY');
}

run();
