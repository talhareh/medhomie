import express from 'express';
import { optionalAuthToken } from '../middleware/auth';
import { 
  getPublicCourses,
  getPublicCourseDetails,
  testPublicCourses
} from '../controllers/publicCourseController';

const router = express.Router();

// Test route
router.get('/test', testPublicCourses);

// Public routes with optional auth for enrollment status
router.get('/', optionalAuthToken, getPublicCourses);
router.get('/:courseId', optionalAuthToken, getPublicCourseDetails);

export default router;
