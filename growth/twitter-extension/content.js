// Sentio Quick Reply - Twitter Chrome Extension
// This adds a "Quick Reply" button to every tweet

const REPLY_TEMPLATES = [
    "🎯 Our AI analyzed this! Check predictions at sentiopicks.com",
    "🔥 Sentio Picks AI had this one too! sentiopicks.com",
    "⚽ Great pick! More at sentiopicks.com",
    "💰 Our algorithm agrees! Free picks: sentiopicks.com",
    "🧠 AI-powered analysis available: sentiopicks.com"
];

function getRandomReply() {
    return REPLY_TEMPLATES[Math.floor(Math.random() * REPLY_TEMPLATES.length)];
}

function createQuickButton() {
    const btn = document.createElement('button');
    btn.className = 'sentio-quick-btn';
    btn.innerHTML = '⚡ Quick Reply';
    btn.title = 'Send Sentio Picks reply';
    return btn;
}

function addButtonsToTweets() {
    // Find all tweets that don't already have our button
    const tweets = document.querySelectorAll('[data-testid="tweet"]');

    tweets.forEach(tweet => {
        if (tweet.querySelector('.sentio-quick-btn')) return; // Already has button

        // Find the action bar (like, retweet, reply icons)
        const actionBar = tweet.querySelector('[role="group"]');
        if (!actionBar) return;

        const btn = createQuickButton();

        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Click on the tweet first to open it
            const tweetText = tweet.querySelector('[data-testid="tweetText"]');
            if (tweetText) {
                tweetText.click();

                // Wait for reply box to appear
                await new Promise(r => setTimeout(r, 1500));

                // Find reply box and type
                const replyBox = document.querySelector('[data-testid="tweetTextarea_0"]');
                if (replyBox) {
                    // Focus and paste text
                    replyBox.focus();

                    // Use execCommand for compatibility
                    const reply = getRandomReply();
                    document.execCommand('insertText', false, reply);

                    // Visual feedback
                    btn.innerHTML = '✅ Pasted!';
                    btn.style.background = '#22c55e';

                    setTimeout(() => {
                        btn.innerHTML = '⚡ Quick Reply';
                        btn.style.background = '';
                    }, 2000);
                }
            }
        });

        actionBar.appendChild(btn);
    });
}

// Run on page load and on scroll (Twitter loads dynamically)
function init() {
    addButtonsToTweets();

    // Watch for new tweets being loaded
    const observer = new MutationObserver(() => {
        addButtonsToTweets();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

console.log('🎯 Sentio Quick Reply loaded!');
