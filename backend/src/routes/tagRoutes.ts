import express from 'express';
import { authenticateToken as auth } from '../middleware/auth';
import { 
  createTag, 
  getAllTags, 
  getTagById, 
  updateTag, 
  deleteTag 
} from '../controllers/tagController';

const router = express.Router();

// Public route - anyone can view tags
router.get('/', getAllTags);
router.get('/:id', getTagById);

// Protected routes - only authenticated users with appropriate role can modify
router.post('/', auth, createTag);
router.put('/:id', auth, updateTag);
router.delete('/:id', auth, deleteTag);

export default router;
