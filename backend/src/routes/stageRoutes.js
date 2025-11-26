// ============================================
// STAGE ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { getStages } = require('../controllers/stageController');

router.get('/', getStages);

module.exports = router;

