import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { streamCourseVideo, getSignedVideoUrl, streamVideoWithToken } from '../controllers/videoStreamController';

const router = express.Router();

// Get signed URL for video streaming (authenticated)
router.get(
  '/:courseId/modules/:moduleId/lessons/:lessonId/signed-url',
  authenticateToken,
  getSignedVideoUrl
);

// Stream video with token (no authentication required)
router.get(
  '/video/:token',
  streamVideoWithToken
);

// Original video streaming route (authenticated)
router.get(
  '/:courseId/modules/:moduleId/lessons/:lessonId/stream',
  authenticateToken,
  streamCourseVideo
);

export default router;
