import express from 'express';
import { authenticateToken as auth } from '../middleware/auth';
import { 
  createCategory, 
  getAllCategories, 
  getCategoryById, 
  updateCategory, 
  deleteCategory 
} from '../controllers/categoryController';

const router = express.Router();

// Public route - anyone can view categories
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Protected routes - only authenticated users with appropriate role can modify
router.post('/', auth, createCategory);
router.put('/:id', auth, updateCategory);
router.delete('/:id', auth, deleteCategory);

export default router;
