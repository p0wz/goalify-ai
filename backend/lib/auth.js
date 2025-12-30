const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const database = require('./database');

const JWT_SECRET = process.env.JWT_SECRET || 'goalify-default-secret-do-not-use-in-prod-without-env';

/**
 * Middleware to verify JWT token
 */
async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    // Bearer TOKEN
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, error: 'Access denied: No token provided' });
    }

    try {
        console.log(`[Auth] Verifying token. Type: ${typeof token}, Length: ${token.length}`);
        console.log(`[Auth] Secret Type: ${typeof JWT_SECRET}, Length: ${JWT_SECRET.length}`);

        // Ensure secret is string
        const secret = String(JWT_SECRET);
        const decoded = jwt.verify(token, secret);

        // console.log('[Auth] Decoded:', JSON.stringify(decoded));

        // Verify user exists in DB (optional security check)
        const user = await database.getUserById(decoded.id);
        if (!user) {
            console.error(`[Auth] User not found for ID: ${decoded.id}`);
            return res.status(403).json({ success: false, error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('[Auth] Token verification failed:', err.message);
        return res.status(403).json({ success: false, error: 'Access denied: Invalid token' });
    }
}

/**
 * Require Admin Role Middleware
 */
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Access denied: Admin only' });
    }
    next();
}

/**
 * Generate JWT token
 */
function generateToken(user) {
    return jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
        plan: user.plan
    }, JWT_SECRET, { expiresIn: '24h' });
}

/**
 * Hash password
 */
async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

/**
 * Compare password
 */
async function comparePassword(plain, hashed) {
    return await bcrypt.compare(plain, hashed);
}

module.exports = {
    authenticateToken,
    requireAdmin,
    generateToken,
    hashPassword,
    comparePassword
};
