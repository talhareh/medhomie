import express, { RequestHandler } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as authController from '../controllers/authController';

const router = express.Router();

// Public routes
router.post('/register', authController.register as RequestHandler);
router.post('/login', authController.login as RequestHandler);
router.post('/refresh-token', authController.refreshToken as RequestHandler);
router.get('/verify-email/:token', authController.verifyEmail as RequestHandler);
router.post('/request-password-reset', authController.requestPasswordReset as RequestHandler);
router.post('/reset-password/:token', authController.resetPassword as RequestHandler);

// Protected routes
router.get('/me', authenticateToken as RequestHandler, authController.getCurrentUser as RequestHandler);
router.post('/logout', authenticateToken as RequestHandler, authController.logout as RequestHandler);

export default router;
