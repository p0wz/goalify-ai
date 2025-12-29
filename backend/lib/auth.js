const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'goalify-default-secret-do-not-use-in-prod-without-env';

/**
 * Middleware to verify JWT token
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    // Bearer TOKEN
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, error: 'Access denied: No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, error: 'Access denied: Invalid token' });
        }
        req.user = user;
        next();
    });
}

/**
 * Generate JWT token
 */
function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

module.exports = {
    authenticateToken,
    generateToken
};
