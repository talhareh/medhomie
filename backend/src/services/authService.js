// ============================================
// AUTHENTICATION SERVICE
// ============================================

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id,
            email: user.email,
            name: user.name
        },
        JWT_SECRET,
        { expiresIn: '7d' } // Token expires in 7 days
    );
};

// Verify JWT token
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return { valid: true, decoded };
    } catch (error) {
        return { valid: false, error: error.message };
    }
};

module.exports = {
    generateToken,
    verifyToken
};

