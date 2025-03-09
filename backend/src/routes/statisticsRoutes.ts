import express from 'express';
import { getDashboardStats } from '../controllers/statisticsController';
import { authenticateToken, isAdmin } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', authenticateToken, isAdmin, getDashboardStats);

export default router;
