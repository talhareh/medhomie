import express, { RequestHandler, Response, NextFunction } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
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
// Apply middleware and routes
router.get('/me', authenticateToken, authController.getCurrentUser);
router.post('/logout', authenticateToken, authController.logout);

export default router;
