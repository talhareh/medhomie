import { Request, Response, NextFunction } from 'express';
import { FileArray } from 'express-fileupload';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User';

interface TokenPayload {
  userId: string;
  role: UserRole;
}

// Extend the Express Request type
export interface AuthRequest extends Request {
  user?: {
    _id: string;
    role: UserRole;
  };
  files?: FileArray | null;
}

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

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    User.findById(decoded.userId)
      .then(user => {
        if (!user) {
          res.status(401).json({ message: 'Invalid token' });
          return;
        }

        (req as AuthRequest).user = {
          _id: user._id.toString(),
          role: user.role
        };
        next();
      })
      .catch(() => {
        res.status(401).json({ message: 'Invalid token' });
      });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const authReq = req as AuthRequest;
  if (!authReq.user || authReq.user.role !== UserRole.ADMIN) {
    res.status(403).json({ message: 'Access denied. Admin only.' });
    return;
  }
  next();
};

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Not authorized to access this resource' });
      return;
    }
    next();
  };
};
