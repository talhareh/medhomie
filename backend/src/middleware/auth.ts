import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Course } from '../models/Course'; // Import the Course model
import { UserRole } from '../models/User';

interface TokenPayload {
  userId: string;
  role: UserRole;
}

// Define the user property interface
interface UserInfo {
  _id: string;
  email: string;
  role: import('../models/User').UserRole;
}

// Extend the Express Request type to include multer file property
export interface AuthRequest extends Request {
  user?: UserInfo;
  file?: Express.Multer.File;
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
    const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key';
    const decoded = jwt.verify(token, jwtSecret) as TokenPayload;

    // Find user to get email
    const user = await User.findById(decoded.userId);
    if (!user) {
      // Instead of returning a response directly, set status and locals, then call next with error
      res.status(404);
      const error = new Error('User not found');
      return next(error);
    }
    
    (req as AuthRequest).user = {
      _id: decoded.userId,
      email: user.email,
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
  if (!authReq.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  if (authReq.user.role === UserRole.ADMIN) {
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
  if (!authReq.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  if (authReq.user.role === UserRole.ADMIN || authReq.user.role === UserRole.INSTRUCTOR) {
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
    if (!authReq.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    if (authReq.user.role === UserRole.ADMIN) {
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
      email: user.email,
      role: user.role
    };
    next();
  } catch (error) {
    // If token is invalid, continue without user
    next();
  }
};
