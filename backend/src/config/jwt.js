// ============================================
// JWT CONFIGURATION
// ============================================

// JWT Secret Key (fallback for development if env not provided)
const DEFAULT_SECRET = 'medhome_secret_key_2024_secure_token';
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_SECRET;

module.exports = {
    JWT_SECRET
};

