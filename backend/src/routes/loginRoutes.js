// ============================================
// LOGIN ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { login, verifyTokenController } = require('../controllers/authController');
const { checkDatabaseConnection } = require('../middleware/database');

// Login route
router.post('/', checkDatabaseConnection, login);

// Token verification route (for testing in Postman)
router.post('/verify', verifyTokenController);
router.get('/verify', verifyTokenController);

module.exports = router;

