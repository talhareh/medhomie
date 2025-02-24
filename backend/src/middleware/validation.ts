import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';
import { PaymentMethod, PaymentStatus } from '../models/Payment';

export const validateRegistration = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password, firstName, lastName, role } = req.body;

  if (!email || !firstName || !lastName) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: 'Invalid email format' });
    return;
  }

  // Password validation (only if not Google auth)
  if (!req.body.googleId && (!password || password.length < 6)) {
    res.status(400).json({ message: 'Password must be at least 6 characters long' });
    return;
  }

  // Role validation
  if (role && !Object.values(UserRole).includes(role)) {
    res.status(400).json({ message: 'Invalid role' });
    return;
  }

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: 'Invalid email format' });
    return;
  }

  next();
};

export const validateGoogleAuth = (req: Request, res: Response, next: NextFunction): void => {
  const { token } = req.body;

  if (!token) {
    res.status(400).json({ message: 'Google token is required' });
    return;
  }

  next();
};

export const validateRefreshToken = (req: Request, res: Response, next: NextFunction): void => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ message: 'Refresh token is required' });
    return;
  }

  next();
};

export const validatePaymentCreation = (req: Request, res: Response, next: NextFunction): void => {
  const { amount, paymentDate, paymentMethod, bankName, accountHolderNumber } = req.body;

  // Check required fields
  if (!amount || !paymentDate || !paymentMethod) {
    res.status(400).json({ message: 'Amount, payment date, and payment method are required' });
    return;
  }

  // Validate amount
  if (isNaN(amount) || amount <= 0) {
    res.status(400).json({ message: 'Amount must be a positive number' });
    return;
  }

  // Validate payment date
  const date = new Date(paymentDate);
  if (isNaN(date.getTime())) {
    res.status(400).json({ message: 'Invalid payment date' });
    return;
  }

  // Validate payment method
  if (!Object.values(PaymentMethod).includes(paymentMethod)) {
    res.status(400).json({ message: 'Invalid payment method' });
    return;
  }

  // Validate bank details if payment method is bank transfer
  if (paymentMethod === PaymentMethod.BANK_TRANSFER) {
    if (!bankName || !accountHolderNumber) {
      res.status(400).json({ message: 'Bank name and account holder number are required for bank transfers' });
      return;
    }
  }

  // Validate file type
  if (!req.file) {
    res.status(400).json({ message: 'Payment receipt is required' });
    return;
  }

  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    res.status(400).json({ message: 'Invalid file type. Only JPG, PNG and PDF files are allowed' });
    return;
  }

  next();
};

export const validatePaymentStatusUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { status, reason } = req.body;

  // Check required fields
  if (!status) {
    res.status(400).json({ message: 'Payment status is required' });
    return;
  }

  // Validate status
  if (!Object.values(PaymentStatus).includes(status)) {
    res.status(400).json({ message: 'Invalid payment status' });
    return;
  }

  // Require reason for rejection
  if (status === PaymentStatus.REJECTED && !reason) {
    res.status(400).json({ message: 'Reason is required when rejecting a payment' });
    return;
  }

  next();
};

export const validatePaymentReupload = (req: Request, res: Response, next: NextFunction): void => {
  // Validate file presence
  if (!req.file) {
    res.status(400).json({ message: 'Payment receipt is required' });
    return;
  }

  // Validate file type
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    res.status(400).json({ message: 'Invalid file type. Only JPG, PNG and PDF files are allowed' });
    return;
  }

  next();
};
