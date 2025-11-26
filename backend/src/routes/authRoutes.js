// ============================================
// AUTHENTICATION ROUTES (SIGNUP)
// ============================================

const express = require('express');
const router = express.Router();
const { signup } = require('../controllers/authController');
const { checkDatabaseConnection } = require('../middleware/database');

// Signup route - mounted at /signup in server.js
router.post('/', checkDatabaseConnection, signup);

module.exports = router;
