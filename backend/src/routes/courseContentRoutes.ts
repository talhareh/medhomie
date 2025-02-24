import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { uploadCourseContent } from '../utils/fileUpload';
import {
  addCourseContent,
  removeCourseContent,
  viewCourseContent,
  addNotice,
  removeNotice
} from '../controllers/courseContentController';

const router = express.Router();

// Course content routes
router.post(
  '/:courseId/content',
  authenticateToken,
  uploadCourseContent.single('file'),
  addCourseContent
);
router.delete('/:courseId/content/:contentId', authenticateToken, removeCourseContent);
router.get('/:courseId/content/:contentId/view', authenticateToken, viewCourseContent);

// Notice board routes
router.post('/:courseId/notices', authenticateToken, addNotice);
router.delete('/:courseId/notices/:noticeId', authenticateToken, removeNotice);

export default router;
