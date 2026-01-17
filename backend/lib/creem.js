/**
 * Creem.io Payment Integration
 * Based on official Creem.io API documentation: https://docs.creem.io/
 * 
 * API Base URLs:
 * - Production: https://api.creem.io
 * - Test Mode: https://test-api.creem.io
 * 
 * Authentication: x-api-key header
 */

const CREEM_API_KEY = process.env.CREEM_API_KEY;

// Use test API if key starts with test_ or creem_test, otherwise production
const isTestMode = CREEM_API_KEY?.includes('test') || false;
const CREEM_API_URL = isTestMode
    ? 'https://test-api.creem.io/v1'
    : 'https://api.creem.io/v1';

// Product IDs from Creem dashboard
const PRODUCTS = {
    monthly: 'prod_1k9SeBnQF1PGFE9GOD4rmZ',
    yearly: 'prod_7NvE42XjRyjARYQHhxAqRE'
};

/**
 * Create a checkout session for a user
 * Based on: https://docs.creem.io/api-reference/endpoint/create-checkout
 * 
 * @param {Object} options
 * @param {string} options.productId - Creem product ID (prod_xxx)
 * @param {string} options.userId - Internal user ID for tracking
 * @param {string} options.email - User email for prefill
 * @param {string} options.successUrl - Redirect URL on success
 * @returns {Promise<Object>} Checkout session with checkout_url
 */
async function createCheckout({ productId, userId, email, successUrl }) {
    if (!CREEM_API_KEY) {
        throw new Error('CREEM_API_KEY environment variable not configured');
    }

    console.log(`[Creem] Creating checkout for product: ${productId}`);
    console.log(`[Creem] API URL: ${CREEM_API_URL}`);

    const requestBody = {
        product_id: productId,
        success_url: successUrl,
        request_id: `sentio_${userId}_${Date.now()}`,
        metadata: {
            user_id: String(userId),
            email: email
        }
    };

    // Optionally prefill customer email
    if (email) {
        requestBody.customer = {
            email: email
        };
    }

    console.log('[Creem] Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${CREEM_API_URL}/checkouts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': CREEM_API_KEY
        },
        body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    console.log(`[Creem] Response status: ${response.status}`);
    console.log(`[Creem] Response body: ${responseText}`);

    if (!response.ok) {
        console.error('[Creem] Checkout creation failed:', responseText);
        throw new Error(`Creem API error (${response.status}): ${responseText}`);
    }

    const data = JSON.parse(responseText);
    console.log('[Creem] Checkout created successfully:', data.id);
    console.log('[Creem] Checkout URL:', data.checkout_url);

    return data;
}

/**
 * Parse webhook event from Creem
 * Based on: https://docs.creem.io/code/webhooks
 * 
 * Webhook payload structure:
 * {
 *   "id": "evt_xxx",
 *   "eventType": "checkout.completed",
 *   "created_at": 1728734325927,
 *   "object": {
 *     "id": "ch_xxx",
 *     "object": "checkout",
 *     "request_id": "my-request-id",
 *     "customer": { "id": "cust_xxx", "email": "..." },
 *     "metadata": { "user_id": "...", "email": "..." },
 *     "status": "completed"
 *   }
 * }
 */
function parseWebhookEvent(body) {
    const event = typeof body === 'string' ? JSON.parse(body) : body;

    console.log('[Creem] Parsing webhook event:', event.eventType);
    console.log('[Creem] Full event:', JSON.stringify(event, null, 2));

    const checkoutObject = event.object || {};
    const customer = checkoutObject.customer || {};
    const metadata = checkoutObject.metadata || {};

    return {
        eventId: event.id,
        eventType: event.eventType,
        createdAt: event.created_at,
        // Checkout details
        checkoutId: checkoutObject.id,
        checkoutStatus: checkoutObject.status,
        requestId: checkoutObject.request_id,
        // Customer info
        customerId: customer.id,
        customerEmail: customer.email,
        // Metadata (our custom data)
        metadata: metadata,
        userId: metadata.user_id,
        userEmail: metadata.email,
        // Subscription if applicable
        subscription: checkoutObject.subscription,
        // Raw event for debugging
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

/**
 * Verify webhook signature (if implemented by Creem)
 * Currently Creem does not require signature verification
 */
function verifyWebhookSignature(body, signature) {
    // Creem webhook signature verification
    // Currently not required, but placeholder for future
    return true;
}

module.exports = {
    createCheckout,
    parseWebhookEvent,
    getProductId,
    verifyWebhookSignature,
    PRODUCTS,
    CREEM_API_URL,
    isTestMode
};
