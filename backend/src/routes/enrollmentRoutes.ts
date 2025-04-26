import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { uploadPaymentReceipt } from '../utils/fileUpload';
import {
  enrollInCourse,
  getEnrollments,
  updateEnrollmentStatus,
  getMyEnrollments,
  bulkEnrollStudents,
  bulkRemoveStudents
} from '../controllers/enrollmentController';

const router = express.Router();

// Enrollment routes
router.post(
  '/courses/:courseId/enroll',
  authenticateToken,
  uploadPaymentReceipt.single('paymentReceipt'),
  enrollInCourse
);
router.get('/', authenticateToken, getEnrollments);
router.get('/my-enrollments', authenticateToken, getMyEnrollments);
router.patch('/:enrollmentId/status', authenticateToken, updateEnrollmentStatus);

// Bulk enrollment routes
router.post('/courses/:courseId/bulk-enroll', authenticateToken, bulkEnrollStudents);
router.post('/courses/:courseId/bulk-remove', authenticateToken, bulkRemoveStudents);

export default router;
