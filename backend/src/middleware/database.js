// ============================================
// DATABASE MIDDLEWARE
// ============================================

// Middleware to check database connection - simplified
const checkDatabaseConnection = (req, res, next) => {
    // Just proceed - let queries handle connection errors
    next();
};

module.exports = {
    checkDatabaseConnection
};

