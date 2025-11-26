// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

// Token verification middleware
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1] || req.headers['x-access-token'];
    
    if (!token) {
        return res.status(401).json({ 
            message: "Access denied. No token provided." 
        });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach user info to request
        next();
    } catch (error) {
        return res.status(403).json({ 
            message: "Invalid or expired token." 
        });
    }
};

module.exports = {
    verifyToken
};

