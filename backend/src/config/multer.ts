import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import fs from 'fs';

// Create uploads directories if they don't exist
const imageUploadDir = path.join(process.cwd(), 'uploads', 'course-images');
const videoUploadDir = path.join(process.cwd(), 'uploads', 'course-videos');
const attachmentUploadDir = path.join(process.cwd(), 'uploads', 'course-attachments');

// Ensure all directories exist
[imageUploadDir, videoUploadDir, attachmentUploadDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage based on file type
const storage = multer.diskStorage({
  destination: function (_req: Request, file: Express.Multer.File, cb) {
    // Determine the appropriate directory based on file type
    if (file.fieldname === 'video') {
      cb(null, videoUploadDir);
    } else if (file.fieldname === 'attachments') {
      cb(null, attachmentUploadDir);
    } else {
      // Default to images for course thumbnails, etc.
      cb(null, imageUploadDir);
    }
  },
  filename: function (_req: Request, file: Express.Multer.File, cb) {
    // For videos, use the lesson ID if available (will be set in the controller)
    if (file.fieldname === 'video' && _req.params.lessonId) {
      cb(null, _req.params.lessonId + path.extname(file.originalname));
    } else {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }
});

// File filter based on field name
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow different file types based on the field name
  if (file.fieldname === 'video') {
    const allowedVideoMimes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (allowedVideoMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid video file type. Only MP4, WebM, and OGG files are allowed.'));
    }
  } else if (file.fieldname === 'attachments') {
    const allowedAttachmentMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];
    if (allowedAttachmentMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid attachment file type. Only PDF, DOC, DOCX, PPT, and PPTX files are allowed.'));
    }
  } else {
    // Default to image validation for course thumbnails, etc.
    const allowedImageMimes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedImageMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image file type. Only JPEG, JPG and PNG files are allowed.'));
    }
  }
};

// Export multer instance with different limits based on file type
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024 // 2GB limit for videos
  }
});

// Create specialized upload instances for different file types
export const imageUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for images
  }
});

// Export a function to create a multer middleware that can handle multiple file types
export const createMultiUpload = () => {
  return upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'attachments', maxCount: 10 },
    { name: 'thumbnail', maxCount: 1 }
  ]);
};
