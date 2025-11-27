import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { getCloudflareDirectUploadUrl } from '../controllers/cloudflareController';

const router = express.Router();

// Route to get a direct upload URL for Cloudflare Stream (admin only)
router.post('/direct-upload-url', authenticateToken, getCloudflareDirectUploadUrl);

export default router; 