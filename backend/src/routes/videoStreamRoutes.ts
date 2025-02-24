import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { streamCourseVideo } from '../controllers/videoStreamController';

const router = express.Router();

// Video streaming route
router.get('/:courseId/content/:contentId/stream', authenticateToken, streamCourseVideo);

export default router;
