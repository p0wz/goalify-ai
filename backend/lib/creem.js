/**
 * Creem.io Payment Integration
 * Handles checkout sessions and webhook events
 */

const CREEM_API_KEY = process.env.CREEM_API_KEY;
const CREEM_API_URL = 'https://api.creem.io/v1';

// Product IDs
const PRODUCTS = {
    monthly: 'prod_1k9SeBnQF1PGFE9GOD4rmZ',
    yearly: 'prod_7NvE42XjRyjARYQHhxAqRE'
};

/**
 * Create a checkout session for a user
 * @param {Object} options
 * @param {string} options.productId - Creem product ID
 * @param {string} options.userId - Internal user ID
 * @param {string} options.email - User email
 * @param {string} options.successUrl - Redirect URL on success
 * @param {string} options.cancelUrl - Redirect URL on cancel
 * @returns {Promise<Object>} Checkout session with URL
 */
async function createCheckout({ productId, userId, email, successUrl, cancelUrl }) {
    if (!CREEM_API_KEY) {
        throw new Error('CREEM_API_KEY not configured');
    }

    const response = await fetch(`${CREEM_API_URL}/checkouts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CREEM_API_KEY}`
        },
        body: JSON.stringify({
            product_id: productId,
            success_url: successUrl,
            cancel_url: cancelUrl,
            request_id: `user_${userId}_${Date.now()}`,
            metadata: {
                user_id: userId,
                email: email
            }
        })
    });

    if (!response.ok) {
        const error = await response.text();
        console.error('[Creem] Checkout creation failed:', error);
        throw new Error('Failed to create checkout session');
    }

    const data = await response.json();
    console.log('[Creem] Checkout created:', data.id);
    return data;
}

/**
 * Verify webhook signature (if Creem provides one)
 * For now, we'll just parse the event
 */
function parseWebhookEvent(body, signature) {
    // TODO: Add signature verification when Creem provides it
    return body;
}

/**
 * Get product ID by plan type
 */
function getProductId(planType) {
    if (planType === 'yearly' || planType === 'annual') {
        return PRODUCTS.yearly;
    }
    return PRODUCTS.monthly;
}

module.exports = {
    createCheckout,
    parseWebhookEvent,
    getProductId,
    PRODUCTS
};
