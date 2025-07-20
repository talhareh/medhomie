import express, { Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth';
import { uploadLessonContent } from '../utils/fileUpload';

// Middleware to log request details
const logRequestDetails = (req: Request, res: Response, next: NextFunction) => {
  console.log('Request headers:', req.headers);
  console.log('Request content type:', req.headers['content-type']);
  next();
};
import {
  addLesson,
  removeLesson,
  updateLesson,
  getLesson,
  addNotice,
  removeNotice,
  viewPdfAttachment
} from '../controllers/courseContentController';

const router = express.Router();

// Lesson routes
router.post(
  '/:courseId/modules/:moduleId/lessons',
  authenticateToken,
  logRequestDetails,
  (req: Request, res: Response, next: NextFunction) => {
    console.log('Processing lesson upload request');
    next();
  },
  uploadLessonContent,
  addLesson
);

router.put(
  '/:courseId/modules/:moduleId/lessons/:lessonId',
  authenticateToken,
  logRequestDetails,
  (req: Request, res: Response, next: NextFunction) => {
    console.log('Processing lesson update request');
    next();
  },
  uploadLessonContent,
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

// Attachment routes
// Remove 'downloadAttachment' from the import list at the top
// Remove any route that uses downloadAttachment

// Debug middleware for public routes
const debugPublicRoute = (req: Request, res: Response, next: NextFunction) => {
  console.log('DEBUG - Public PDF route accessed');
  console.log('DEBUG - Request URL:', req.originalUrl);
  console.log('DEBUG - Request params:', req.params);
  next();
};

// Public attachment route (for enrolled students)
router.get(
  '/public/:courseId/modules/:moduleId/lessons/:lessonId/attachment',
  debugPublicRoute,
  viewPdfAttachment
);

// Notice board routes
router.post('/:courseId/notices', authenticateToken, addNotice);
router.delete('/:courseId/notices/:noticeId', authenticateToken, removeNotice);

export default router;
