/**
 * Sentio Picks - Twitter Growth Bot (Image Reply Version)
 * 
 * This bot monitors trending betting tweets and replies with
 * a promotional image instead of text.
 * 
 * USAGE:
 * 1. node twitter-sniper.js
 * 2. Login manually on first run
 * 3. Bot will automatically reply with images
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const fs = require('fs');
const path = require('path');

// ============ CONFIGURATION ============

const CONFIG = {
    // Keywords for GLOBAL market
    keywords: [
        '#betting',
        '#sportsbetting',
        '#footballbets',
        '#bettingtips',
        '#premierleague',
        '#championsleague',
        '#soccertips',
        '#acca',
        '#parlay',
        'Manchester United',
        'Liverpool FC',
        'Arsenal FC',
        'Real Madrid'
    ],

    // Image to reply with (change this path or use API)
    promoImagePath: './promo-image.jpg',

    // Optional short text with image (can be empty)
    imageCaption: "🎯 sentiopicks.com",

    // Safety settings
    minDelayBetweenReplies: 90000,  // 1.5 minutes
    maxRepliesPerHour: 8,           // Max 8 replies per hour
    minLikesToReply: 30,            // Only tweets with 30+ likes

    // File paths
    cookiesPath: './twitter-cookies.json',
    logPath: './twitter-bot.log',

    // Browser settings
    headless: false  // Set to true after testing
};

// ============ HELPER FUNCTIONS ============

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    fs.appendFileSync(CONFIG.logPath, logMessage + '\n');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms + Math.random() * 5000));
}

async function saveCookies(page) {
    const cookies = await page.cookies();
    fs.writeFileSync(CONFIG.cookiesPath, JSON.stringify(cookies, null, 2));
    log('✅ Cookies saved.');
}

async function loadCookies(page) {
    if (fs.existsSync(CONFIG.cookiesPath)) {
        const cookies = JSON.parse(fs.readFileSync(CONFIG.cookiesPath));
        await page.setCookie(...cookies);
        log('✅ Cookies loaded.');
        return true;
    }
    return false;
}

// ============ MAIN BOT LOGIC ============

async function main() {
    log('=== Sentio Picks Twitter Bot (Image Mode) Starting ===');

    // Check if promo image exists
    if (!fs.existsSync(CONFIG.promoImagePath)) {
        log('❌ ERROR: Promo image not found at ' + CONFIG.promoImagePath);
        log('Please add your promotional image as "promo-image.jpg"');
        process.exit(1);
    }

    const absoluteImagePath = path.resolve(CONFIG.promoImagePath);
    log('📷 Using image: ' + absoluteImagePath);

    // Launch browser with REAL Chrome profile
    // This uses your actual Chrome with existing login!
    const chromeUserDataDir = 'C:\\Users\\p0wzs\\AppData\\Local\\Google\\Chrome\\User Data';

    log('🔑 Using your real Chrome profile...');
    log('⚠️ IMPORTANT: Close all Chrome windows first!');

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        userDataDir: chromeUserDataDir,
        args: ['--start-maximized', '--no-sandbox', '--profile-directory=Default']
    });

    const page = await browser.newPage();

    // Using real Chrome profile - no need to set user agent or load cookies
    // Your existing Twitter login will be used automatically!

    // Go to Twitter
    await page.goto('https://twitter.com/home', { waitUntil: 'networkidle2' });
    await sleep(5000);

    // Check login status
    const isLoggedIn = await page.evaluate(() => {
        return document.querySelector('[data-testid="SideNav_AccountSwitcher_Button"]') !== null;
    });

    if (!isLoggedIn) {
        log('⚠️ Twitter login required!');
        log('Please login manually in the browser...');
        log('Press ENTER after logging in.');

        await new Promise(resolve => {
            process.stdin.once('data', () => resolve());
        });

        await saveCookies(page);
    }

    log('✅ Twitter login successful!');

    let repliesThisHour = 0;
    let hourStartTime = Date.now();

    // Main loop
    while (true) {
        // Hourly limit check
        if (Date.now() - hourStartTime > 3600000) {
            repliesThisHour = 0;
            hourStartTime = Date.now();
            log('🔄 Hourly limit reset.');
        }

        if (repliesThisHour >= CONFIG.maxRepliesPerHour) {
            log(`⏸️ Hourly limit reached (${CONFIG.maxRepliesPerHour}). Waiting...`);
            await sleep(300000);
            continue;
        }

        // Pick random keyword
        const keyword = CONFIG.keywords[Math.floor(Math.random() * CONFIG.keywords.length)];
        log(`🔍 Searching: "${keyword}"`);

        try {
            // Search Twitter
            const searchUrl = `https://twitter.com/search?q=${encodeURIComponent(keyword)}&src=typed_query&f=live`;
            await page.goto(searchUrl, { waitUntil: 'networkidle2' });
            await sleep(3000);

            // Find tweets
            const tweets = await page.evaluate((minLikes) => {
                const tweetElements = document.querySelectorAll('[data-testid="tweet"]');
                const results = [];

                tweetElements.forEach((tweet, index) => {
                    if (index > 15) return;

                    // Get like count
                    const likeButton = tweet.querySelector('[data-testid="like"]');
                    const ariaLabel = likeButton?.getAttribute('aria-label') || '';
                    const likeMatch = ariaLabel.match(/(\d+)/);
                    const likeCount = likeMatch ? parseInt(likeMatch[1]) : 0;

                    // Get tweet text
                    const tweetText = tweet.querySelector('[data-testid="tweetText"]')?.textContent || '';

                    // Check if we already replied (look for our replies)
                    const hasReply = tweet.textContent.includes('sentiopicks');

                    if (likeCount >= minLikes && !hasReply) {
                        results.push({
                            index,
                            likeCount,
                            text: tweetText.substring(0, 80)
                        });
                    }
                });

                return results;
            }, CONFIG.minLikesToReply);

            if (tweets.length === 0) {
                log(`😴 No suitable tweets found. (min ${CONFIG.minLikesToReply} likes)`);
                await sleep(45000);
                continue;
            }

            // Target first suitable tweet
            const targetTweet = tweets[0];
            log(`🎯 Target found! Likes: ${targetTweet.likeCount}, Text: "${targetTweet.text}..."`);

            // Click on tweet to open it
            const tweetElements = await page.$$('[data-testid="tweet"]');
            if (tweetElements[targetTweet.index]) {
                await tweetElements[targetTweet.index].click();
                await sleep(2500);

                // Find reply box
                const replyBox = await page.$('[data-testid="tweetTextarea_0"]');
                if (replyBox) {
                    // Click to focus
                    await replyBox.click();
                    await sleep(500);

                    // Type short caption if provided
                    if (CONFIG.imageCaption) {
                        await replyBox.type(CONFIG.imageCaption, { delay: 30 });
                        await sleep(500);
                    }

                    // Find the image upload button (media button)
                    const mediaButton = await page.$('[data-testid="fileInput"]');

                    if (mediaButton) {
                        // Upload image
                        await mediaButton.uploadFile(absoluteImagePath);
                        log('📷 Image uploaded!');
                        await sleep(3000); // Wait for upload

                        // Click send button
                        const sendButton = await page.$('[data-testid="tweetButtonInline"]');
                        if (sendButton) {
                            await sendButton.click();
                            log(`✅ Image reply sent!`);
                            repliesThisHour++;

                            // Wait before next action
                            const waitTime = CONFIG.minDelayBetweenReplies;
                            log(`⏳ Waiting ${Math.round(waitTime / 1000)} seconds...`);
                            await sleep(waitTime);
                        } else {
                            log('❌ Send button not found');
                        }
                    } else {
                        log('❌ Media upload button not found');
                    }
                } else {
                    log('❌ Reply box not found');
                }

                // Go back
                await page.goBack();
                await sleep(2000);
            }

        } catch (error) {
            log(`❌ Error: ${error.message}`);
            await sleep(60000);
        }
    }
}

// Start
main().catch(error => {
    log(`Fatal error: ${error.message}`);
    process.exit(1);
});
