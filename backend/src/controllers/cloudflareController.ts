import axios from 'axios';
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
// Remove protocol for allowedOrigins
const ALLOWED_ORIGIN = FRONTEND_URL.replace(/^https?:\/\//, '');

// You can add multiple domains if needed
const ALLOWED_ORIGINS = [
  ALLOWED_ORIGIN,
  // Add additional domains here if needed:
  // 'yourdomain.com',
  // 'staging.yourdomain.com',
];

if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
  throw new Error('Cloudflare credentials are not set in environment variables');
}

/**
 * Generates a Cloudflare Stream direct upload URL for admin users.
 * Returns the upload URL and video ID.
 */
export const getCloudflareDirectUploadUrl = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only allow admin users
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ message: 'Forbidden: Admins only' });
      return;
    }

    const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/direct_upload`;
    const body = {
      maxDurationSeconds: 36000, // 10 hours max duration
      requireSignedURLs: false,
      allowedOrigins: ['localhost:5173', 'uat.medhome.courses', 'medhome.courses'],
    };

    const response = await axios.post(apiUrl, body, {
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.data && response.data.result && response.data.result.uploadURL && response.data.result.uid) {
      res.json({
        uploadURL: response.data.result.uploadURL,
        videoId: response.data.result.uid,
      });
      return;
    } else {
      res.status(500).json({ message: 'Unexpected response from Cloudflare', data: response.data });
      return;
    }
  } catch (error: any) {
    console.error('Error generating Cloudflare direct upload URL:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to generate Cloudflare direct upload URL', error: error.message });
    return;
  }
}; 