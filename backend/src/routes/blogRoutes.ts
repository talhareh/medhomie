import express from 'express';
import { 
  createBlog, 
  getBlogs, 
  getBlogBySlug, 
  updateBlog, 
  deleteBlog,
  uploadBlogImage
} from '../controllers/blogController';
import { authenticateToken, authorizeRoles, optionalAuthToken } from '../middleware/auth';
import { UserRole } from '../models/User';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/blogs');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `blog-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (ext && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Public routes - use optionalAuthToken so admins can see all blogs when authenticated
router.get('/', optionalAuthToken, getBlogs);

// Admin only routes - must come before /:slug to avoid route conflicts
router.post('/upload-image', authenticateToken, authorizeRoles(UserRole.ADMIN), upload.single('image'), uploadBlogImage);
router.post('/', authenticateToken, authorizeRoles(UserRole.ADMIN), createBlog);
router.put('/:id', authenticateToken, authorizeRoles(UserRole.ADMIN), updateBlog);
router.delete('/:id', authenticateToken, authorizeRoles(UserRole.ADMIN), deleteBlog);

// Public route - must come last, use optionalAuthToken so admins can access DRAFT blogs
router.get('/:slug', optionalAuthToken, getBlogBySlug);

export default router;
