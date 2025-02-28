import { UserRole } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}
