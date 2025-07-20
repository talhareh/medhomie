import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export enum UserRole {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  STUDENT = 'student'
}

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  role: UserRole;
  fullName: string;
  whatsappNumber: string;
  googleId?: string;
  profilePicture?: string;
  isApproved: boolean;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  refreshToken?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createEmailVerificationToken(): string;
  createPasswordResetToken(): string;
}



const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId;
    },
    minlength: 6
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  whatsappNumber: {
    type: String,
    required: true,
    trim: true
  },
  googleId: {
    type: String,
    sparse: true
  },
  profilePicture: {
    type: String
  },
  isApproved: {
    type: Boolean,
    default: function() {
      return this.role === UserRole.STUDENT;
    }
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  refreshToken: String
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  // Prevent double-hashing: only hash if not already a bcrypt hash
  // Bcrypt hashes start with $2a$, $2b$, or $2y$
  if (/^\$2[aby]\$/.test(this.password)) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Create email verification token
userSchema.methods.createEmailVerificationToken = function(): string {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  this.emailVerificationExpires = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours
  return token;
};

// Create password reset token
userSchema.methods.createPasswordResetToken = function(): string {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  this.passwordResetExpires = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours
  return token;
};

export const User = mongoose.model<IUser>('User', userSchema);
