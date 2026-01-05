const admin = require('firebase-admin');

// Initialize Firebase Admin
// Expecting FIREBASE_SERVICE_ACCOUNT environment variable containing the JSON string
// OR GOOGLE_APPLICATION_CREDENTIALS path
try {
    if (admin.apps.length === 0) {
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('[Firebase] Admin SDK initialized with service account from ENV');
        } else {
            // Fallback to default (useful for local if GOOGLE_APPLICATION_CREDENTIALS is set)
            admin.initializeApp();
            console.log('[Firebase] Admin SDK initialized with default credentials');
        }
    }
} catch (error) {
    console.error('[Firebase] Failed to initialize Admin SDK:', error.message);
}

module.exports = admin;
