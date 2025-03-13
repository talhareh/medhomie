import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Course } from '../models/Course'; // Import the Course model

interface TokenPayload {
  userId: string;
  role: UserRole;
}

// Define the user property interface
interface UserInfo {
  _id: string;
  email: string;
  role: UserRole;
}

// Define UserRole enum
export enum UserRole {
  Admin = 'Admin',
  Instructor = 'Instructor',
  Student = 'Student',
  Guest = 'Guest'
}

// Extend the Express Request type
export interface AuthRequest extends Request {
  user: UserInfo;
}

// Create type-safe middleware functions
type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

// Token expiry times in seconds
const TOKEN_EXPIRY = 24 * 60 * 60; // 24 hours
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days

export const generateTokens = (userId: string, role: UserRole) => {
  const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key';

  const accessToken = jwt.sign(
    { userId, role },
    jwtSecret,
    { expiresIn: TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { userId, role },
    refreshSecret,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  return { 
    accessToken, 
    refreshToken,
    expiresIn: Date.now() + (TOKEN_EXPIRY * 1000) // Convert to milliseconds
  };
};

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const token = authReq.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new Error('Authentication required');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key') as TokenPayload;
    authReq.user = {
      _id: decoded.userId,
      role: decoded.role
    };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authReq = req as AuthRequest;
  if (authReq.user.role === UserRole.Admin) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

export const isAdminOrInstructor = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authReq = req as AuthRequest;
  if (authReq.user.role === UserRole.Admin || authReq.user.role === UserRole.Instructor) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin or instructor role required.' });
  }
};

export const isAdminOrCourseInstructor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (authReq.user.role === UserRole.Admin) {
      next();
      return;
    }

    const course = await Course.findById(req.params.courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    if (course.createdBy.toString() === authReq.user._id) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Not authorized to modify this course.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error checking course ownership' });
  }
};

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;
    if (!authReq.user || !roles.includes(authReq.user.role)) {
      res.status(403).json({ message: 'Not authorized to access this resource' });
      return;
    }
    next();
  };
};

// Optional authentication middleware
export const optionalAuthToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key';
    const payload = jwt.verify(token, jwtSecret) as TokenPayload;

    const user = await User.findById(payload.userId);
    if (!user) {
      return next();
    }

    (req as AuthRequest).user = {
      _id: user._id.toString(),
      email: user.email, // Add email property
      role: user.role
    };
    next();
  } catch (error) {
    // If token is invalid, continue without user
    next();
  }
};
