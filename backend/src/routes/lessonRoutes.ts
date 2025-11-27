import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { uploadVideo } from '../utils/fileUpload';
import {
  addLesson,
  removeLesson,
  updateLesson,
  getLesson
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

export default router;
