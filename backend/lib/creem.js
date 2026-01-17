/**
 * Creem.io Payment Integration
 * Based on Creem.io docs: https://docs.creem.io/
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
            'x-api-key': CREEM_API_KEY
        },
        body: JSON.stringify({
            product_id: productId,
            success_url: successUrl,
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
        throw new Error(`Failed to create checkout session: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Creem] Checkout created:', data.id || data.checkout_url);
    return data;
}

/**
 * Parse webhook event from Creem
 * Based on Creem webhook format:
 * {
 *   "id": "evt_xxx",
 *   "eventType": "checkout.completed",
 *   "object": {
 *     "customer": { "email": "..." },
 *     "metadata": { "user_id": "...", "email": "..." }
 *   }
 * }
 */
function parseWebhookEvent(body) {
    const event = typeof body === 'string' ? JSON.parse(body) : body;

    return {
        eventType: event.eventType,
        checkoutId: event.object?.id,
        customerId: event.object?.customer?.id,
        customerEmail: event.object?.customer?.email,
        metadata: event.object?.metadata || {},
        subscription: event.object?.subscription,
        raw: event
    };
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
