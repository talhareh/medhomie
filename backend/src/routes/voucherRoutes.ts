import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth';
import {
  createVoucher,
  getVouchers,
  getVoucherById,
  updateVoucher,
  deleteVoucher,
  validateVoucher,
  getMyVoucherUsage,
  applyVoucherRetroactive
} from '../controllers/voucherController';

const router = express.Router();

// Admin routes
router.post('/', authenticateToken, isAdmin, createVoucher);
router.get('/', authenticateToken, isAdmin, getVouchers);
router.get('/:id', authenticateToken, isAdmin, getVoucherById);
router.put('/:id', authenticateToken, isAdmin, updateVoucher);
router.delete('/:id', authenticateToken, isAdmin, deleteVoucher);
router.post('/apply-retroactive', authenticateToken, isAdmin, applyVoucherRetroactive);

// Student routes
router.post('/validate', authenticateToken, validateVoucher);
router.get('/my-usage', authenticateToken, getMyVoucherUsage);

export default router;

