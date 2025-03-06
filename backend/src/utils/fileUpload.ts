import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request as ExpressRequest, Response, NextFunction } from 'express';

// Extend the Express Request interface to include our custom properties
interface Request extends ExpressRequest {
  fileTypeError?: string;
}

// Create uploads directory if it doesn't exist
const createUploadDirectories = () => {
  const dirs = [
    'uploads',
    'uploads/course-videos',
    'uploads/course-attachments',
    'uploads/course-images',
    'uploads/payment-receipts'
  ];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirectories();

// Configure storage for course videos
const courseVideoStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, 'uploads/course-videos');
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure storage for course images (thumbnails, banners)
const courseImageStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, 'uploads/course-images');
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure storage for course attachments
const courseAttachmentStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, 'uploads/course-attachments');
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure storage for payment receipts
const paymentReceiptStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, 'uploads/payment-receipts');
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for videos
const videoFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['video/mp4', 'video/webm'];
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new Error('Invalid file type. Only MP4 and WebM videos are allowed.'));
    return;
  }
  cb(null, true);
};

// File filter for images
const imageFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new Error('Invalid file type. Only JPEG, PNG and GIF images are allowed.'));
    return;
  }
  cb(null, true);
};

// File filter for attachments
const attachmentFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    return;
  }
  cb(null, true);
};

// File filter for payment receipts
const paymentReceiptFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new Error('Invalid file type. Only images and PDF files are allowed.'));
    return;
  }
  cb(null, true);
};

// Multer instances for different upload types
export const uploadVideo = multer({
  storage: courseVideoStorage,
  fileFilter: videoFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max file size
  }
});

export const uploadImage = multer({
  storage: courseImageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

export const uploadAttachment = multer({
  storage: courseAttachmentStorage,
  fileFilter: attachmentFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

export const uploadPaymentReceipt = multer({
  storage: paymentReceiptStorage,
  fileFilter: paymentReceiptFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Combined middleware for handling both video and attachments
const logFileInfo = (req: any, res: any, next: any) => {
  console.log('Multer middleware - Request body before processing:', req.body);
  console.log('Multer middleware - Request files before processing:', req.files);
  next();
};

// Create a custom multer storage configuration
const lessonContentStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    console.log(`Processing file: ${file.fieldname}, mimetype: ${file.mimetype}`);
    if (file.fieldname === 'video') {
      cb(null, 'uploads/course-videos');
    } else if (file.fieldname === 'attachments') {
      cb(null, 'uploads/course-attachments');
    } else {
      // Store unexpected fields in a temporary directory
      console.log(`Unexpected field: ${file.fieldname}, storing in temp directory`);
      // Make sure the temp directory exists
      const tempDir = 'uploads/temp';
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      cb(null, tempDir);
    }
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    console.log(`Generated filename: ${filename} for ${file.fieldname}`);
    cb(null, filename);
  }
});

// Create a custom file filter function
const lessonContentFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  console.log(`Filtering file: ${file.fieldname}, mimetype: ${file.mimetype}`);
  
  if (file.fieldname === 'video') {
    // Apply video filter
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedTypes.includes(file.mimetype)) {
      const errorMessage = `Invalid video file type: ${file.mimetype}. Only MP4, WebM, and OGG videos are allowed.`;
      console.log(`Rejected video file: ${errorMessage}`);
      req.fileTypeError = errorMessage;
      // Return false to reject the file without throwing an error
      return cb(null, false);
    }
    console.log('Video file accepted');
    return cb(null, true);
  } else if (file.fieldname === 'attachments') {
    // Apply attachment filter
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      const errorMessage = `Invalid attachment file type: ${file.mimetype}. Only PDF, Office documents, and images are allowed.`;
      console.log(`Rejected attachment file: ${errorMessage}`);
      req.fileTypeError = errorMessage;
      // Return false to reject the file without throwing an error
      return cb(null, false);
    }
    console.log('Attachment file accepted');
    return cb(null, true);
  } else {
    console.log(`Unexpected field: ${file.fieldname}`);
    // Instead of rejecting, we'll accept the file to avoid the 'Unexpected field' error
    // This will allow the request to proceed, and we can handle unexpected fields in the controller
    return cb(null, true);
  }
};

// Create a multer instance for lesson content uploads
const lessonUpload = multer({
  storage: lessonContentStorage,
  fileFilter: lessonContentFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
    files: 10 // Allow up to 10 files to be uploaded at once
  }
}).fields([
  { name: 'video', maxCount: 1 },
  { name: 'attachments', maxCount: 5 }
]);

// Wrapper function to handle errors
export const uploadLessonContent = (req: Request, res: Response, next: NextFunction) => {
  lessonUpload(req, res, (err: any) => {
    if (err) {
      return handleMulterErrorMiddleware(err, req, res, next);
    }
    next();
  });
};

// Error handling middleware for multer
const handleMulterErrorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err.code, err.message);
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        message: `Unexpected field: ${err.field}. Only 'video' and 'attachments' fields are allowed.` 
      });
    } else if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: `File too large: Maximum file size is 100MB for videos and 10MB for attachments.` 
      });
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        message: `Too many files: Maximum 1 video and 5 attachments allowed.` 
      });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  } else if (err) {
    console.error('Other upload error:', err.message);
    return res.status(500).json({ message: `Server error during upload: ${err.message}` });
  }
  
  // Check if any files were rejected due to file type
  if (req.fileTypeError) {
    return res.status(400).json({ message: req.fileTypeError });
  }
  
  next();
};

// Create a wrapper function that can be used as regular middleware
export const handleMulterError = (req: Request, res: Response, next: NextFunction) => {
  // If there's no error, just pass through
  if (!req.fileTypeError) {
    return next();
  }
  
  // Handle file type errors
  return res.status(400).json({ message: req.fileTypeError });
};
