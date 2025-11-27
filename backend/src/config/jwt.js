// ============================================
// JWT CONFIGURATION
// ============================================

// Load environment variables (required)
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Validate required environment variable
if (!JWT_SECRET) {
    console.error('❌ Missing required JWT_SECRET environment variable!');
    console.error('Please set JWT_SECRET in your .env file.');
    process.exit(1);
}

module.exports = {
    JWT_SECRET
};

