import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth';
import {
  getAllCourses,
  getPublicCourses,
  getCourseDetails,
  createCourse,
  updateCourse,
  deleteCourse
} from '../controllers/courseController';

const router = express.Router();

// Public routes
router.get('/public', getPublicCourses);

// Admin routes
router.get('/', authenticateToken, isAdmin, getAllCourses);
router.post('/', authenticateToken, isAdmin, createCourse);
router.get('/:courseId', authenticateToken, isAdmin, getCourseDetails);
router.put('/:courseId', authenticateToken, isAdmin, updateCourse);
router.delete('/:courseId', authenticateToken, isAdmin, deleteCourse);

export default router;
