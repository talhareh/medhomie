import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createOrder,
  verifyPayment,
  getOrderStatus,
  handleWebhook
} from '../controllers/paypalController';

const router = express.Router();

// PayPal order routes (authenticated)
router.post('/create-order/:courseId', authenticateToken, createOrder);
router.post('/verify-payment', authenticateToken, verifyPayment);
router.get('/order-status/:orderId', authenticateToken, getOrderStatus);

// PayPal webhook route (no authentication required)
router.post('/webhook', handleWebhook);

export default router;
