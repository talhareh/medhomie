import express from 'express';
import { authenticateToken as auth } from '../middleware/auth';
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

// Course routes
router.post('/', auth, uploadImage.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), createCourse);
router.get('/', getAllCourses);
router.get('/:courseId', auth, getCourse);
router.put('/:courseId', auth, uploadImage.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), updateCourse);
router.delete('/:courseId', auth, deleteCourse);
router.patch('/:courseId/state', auth, updateCourseState);
router.post('/:courseId/clone', auth, cloneCourse);
router.get('/:courseId/quizzes', auth, getCourseQuizzes);

// Module routes
router.post('/:courseId/modules', auth, addModule);
router.get('/:courseId/modules/:moduleId', getModule);
router.put('/:courseId/modules/:moduleId', auth, updateModule);
router.delete('/:courseId/modules/:moduleId', auth, deleteModule);
router.post('/:courseId/modules/reorder', auth, reorderModules);

export default router;
