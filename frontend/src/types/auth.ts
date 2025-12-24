export enum UserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin'
}

export interface User {
  _id: string;
  email: string;
  fullName: string;
  whatsappNumber: string;
  role: UserRole;
  profilePicture?: string;
  emailVerified: boolean;
  isApproved: boolean;
  lastLogin?: Date;
  deviceCount?: number;
  devices?: any[]; // Using any[] for now, can define proper type if needed
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  whatsappNumber: string;
  role?: UserRole; // Made optional since it defaults to student
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  newPassword: string;
}
