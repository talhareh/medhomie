import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { uploadPaymentReceipt } from '../utils/fileUpload';
import {
  validatePaymentCreation,
  validatePaymentStatusUpdate,
  validatePaymentReupload
} from '../middleware/validation';
import {
  createPayment,
  updatePaymentStatus,
  getPayments,
  getPaymentById,
  reuploadePaymentReceipt
} from '../controllers/paymentController';

const router = express.Router();

// Payment routes
router.post(
  '/enrollments/:enrollmentId/payment',
  authenticateToken,
  uploadPaymentReceipt.single('paymentReceipt'),
  validatePaymentCreation,
  createPayment
);

router.patch(
  '/:paymentId/status',
  authenticateToken,
  validatePaymentStatusUpdate,
  updatePaymentStatus
);

router.get(
  '/',
  authenticateToken,
  getPayments
);

router.get(
  '/:paymentId',
  authenticateToken,
  getPaymentById
);

router.post(
  '/:paymentId/reupload',
  authenticateToken,
  uploadPaymentReceipt.single('paymentReceipt'),
  validatePaymentReupload,
  reuploadePaymentReceipt
);

export default router;
