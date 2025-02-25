import express from 'express';
import { authenticateToken as auth } from '../middleware/auth';
import {
  addNotice,
  removeNotice
} from '../controllers/courseContentController';

const router = express.Router();

// Notice routes
router.post('/:courseId/notices', auth, addNotice);
router.delete('/:courseId/notices/:noticeId', auth, removeNotice);

export default router;
