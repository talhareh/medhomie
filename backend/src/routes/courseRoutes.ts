import express from 'express';
import { authenticateToken as auth, authorizeRoles, isAdminOrCourseInstructor } from '../middleware/auth';
import { UserRole } from '../models/User';
import { uploadImage } from '../utils/fileUpload';
import {
  createCourse,
  getCourseDetails as getCourse,
  getAllCourses,
  updateCourse,
  deleteCourse,
  updateCourseState,
  cloneCourse,
  getCourseQuizzes
} from '../controllers/courseController';
import {
  addModule,
  getModule,
  updateModule,
  deleteModule,
  reorderModules
} from '../controllers/moduleController';

const router = express.Router();

const courseImageUpload = uploadImage.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]);

const manageCourseRoles = authorizeRoles(UserRole.ADMIN, UserRole.INSTRUCTOR);

// Course routes
router.post('/', auth, manageCourseRoles, courseImageUpload, createCourse);
router.get('/', auth, manageCourseRoles, getAllCourses);
router.get('/:courseId', auth, getCourse);
router.put('/:courseId', auth, isAdminOrCourseInstructor, courseImageUpload, updateCourse);
router.delete('/:courseId', auth, isAdminOrCourseInstructor, deleteCourse);
router.patch('/:courseId/state', auth, isAdminOrCourseInstructor, updateCourseState);
router.post('/:courseId/clone', auth, authorizeRoles(UserRole.ADMIN), cloneCourse);
router.get('/:courseId/quizzes', auth, getCourseQuizzes);

// Module routes
router.post('/:courseId/modules', auth, isAdminOrCourseInstructor, addModule);
router.get('/:courseId/modules/:moduleId', getModule);
router.put('/:courseId/modules/:moduleId', auth, isAdminOrCourseInstructor, updateModule);
router.delete('/:courseId/modules/:moduleId', auth, isAdminOrCourseInstructor, deleteModule);
router.post('/:courseId/modules/reorder', auth, isAdminOrCourseInstructor, reorderModules);

export default router;
