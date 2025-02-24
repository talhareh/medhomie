import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Create uploads directory if it doesn't exist
const createUploadDirectories = () => {
  const dirs = ['uploads', 'uploads/course-content', 'uploads/payment-receipts'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirectories();

// Configure storage for course content
const courseContentStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, 'uploads/course-content');
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

// File filter for course content
const courseContentFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = {
    'video': ['video/mp4', 'video/webm'],
    'pdf': ['application/pdf'],
    'image': ['image/jpeg', 'image/png', 'image/gif']
  };
  
  const contentType = (req.body.type || 'pdf') as keyof typeof allowedTypes;
  if (!allowedTypes[contentType]?.includes(file.mimetype)) {
    cb(new Error('Invalid file type'));
    return;
  }
  cb(null, true);
};

// File filter for payment receipts
const paymentReceiptFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowedMimes.includes(file.mimetype)) {
    cb(new Error('Invalid file type. Only JPG, PNG and PDF files are allowed'));
    return;
  }
  cb(null, true);
};

export const uploadCourseContent = multer({
  storage: courseContentStorage,
  fileFilter: courseContentFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

export const uploadPaymentReceipt = multer({
  storage: paymentReceiptStorage,
  fileFilter: paymentReceiptFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});
