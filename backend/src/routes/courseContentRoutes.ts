import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { uploadVideo } from '../utils/fileUpload';
import {
  addLesson,
  removeLesson,
  updateLesson,
  getLesson,
  addNotice,
  removeNotice
} from '../controllers/courseContentController';

const router = express.Router();

// Lesson routes
router.post(
  '/:courseId/modules/:moduleId/lessons',
  authenticateToken,
  uploadVideo.single('video'),
  addLesson
);

router.put(
  '/:courseId/modules/:moduleId/lessons/:lessonId',
  authenticateToken,
  uploadVideo.single('video'),
  updateLesson
);

router.delete(
  '/:courseId/modules/:moduleId/lessons/:lessonId',
  authenticateToken,
  removeLesson
);

router.get(
  '/:courseId/modules/:moduleId/lessons/:lessonId',
  authenticateToken,
  getLesson
);

// Notice board routes
router.post('/:courseId/notices', authenticateToken, addNotice);
router.delete('/:courseId/notices/:noticeId', authenticateToken, removeNotice);

export default router;
