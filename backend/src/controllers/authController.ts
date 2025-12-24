import { Request, Response } from 'express';
import jwt, { SignOptions, Secret, TokenExpiredError } from 'jsonwebtoken';
import { User, UserRole } from '../models/User';
import { LoginHistory } from '../models/LoginHistory';
import { extractDeviceInfo, generateDeviceFingerprint, getDeviceName } from '../utils/deviceInfo';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangeNotification,
  sendNewDeviceEmail,
  sendDeviceLimitReachedEmail
} from '../services/emailService';
import { UserDevice } from '../models/UserDevice';
import { AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

// Helper function to create tokens
const createTokens = (userId: string, role: UserRole): { token: string; refreshToken: string; expiresIn: number } => {
  const jwtSecret: Secret = process.env.JWT_SECRET || 'your_jwt_secret_key';
  const refreshSecret: Secret = process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key';

  // 24 hours in seconds
  const tokenExpiry = 24 * 60 * 60;

  // 7 days in seconds for refresh token
  const refreshExpiry = 7 * 24 * 60 * 60;

  const token = jwt.sign(
    { userId, role },
    jwtSecret,
    { expiresIn: tokenExpiry }
  );

  const refreshToken = jwt.sign(
    { userId, role },
    refreshSecret,
    { expiresIn: refreshExpiry }
  );

  return {
    token,
    refreshToken,
    expiresIn: Date.now() + (tokenExpiry * 1000) // Convert to milliseconds
  };
};

// Helper function to log user login
const logUserLogin = async (userId: string, req: Request): Promise<void> => {
  const { deviceInfo, userAgent, ipAddress } = extractDeviceInfo(req);

  await LoginHistory.create({
    userId,
    deviceInfo,
    userAgent,
    ipAddress,
    timestamp: new Date()
  });
};

// Register new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, fullName, whatsappNumber, role = UserRole.STUDENT } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      fullName,
      whatsappNumber,
      role
    });

    // Generate verification token
    const verificationToken = user.createEmailVerificationToken();
    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, user.fullName, verificationToken);

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
};

// Verify email
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired verification token' });
      return;
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying email', error });
  }
};



// ... imports ...

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user and check password
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check if email is verified
    if (!user.emailVerified) {
      res.status(403).json({ message: 'Please verify your email before logging in' });
      return;
    }

    // Device Management Logic
    const deviceFingerprint = generateDeviceFingerprint(req);
    const { deviceInfo } = extractDeviceInfo(req);
    const deviceName = getDeviceName(deviceInfo);

    let userDevice = await UserDevice.findOne({ userId: user._id, deviceFingerprint });

    if (userDevice) {
      // Known device - update last login
      userDevice.lastLogin = new Date();
      userDevice.isActive = true;
      userDevice.deviceInfo = {
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        platform: deviceInfo.device, // mapping device type/model to platform field
        userAgent: req.headers['user-agent']
      };
      await userDevice.save();
    } else {
      // New device - check limit
      const deviceCount = await UserDevice.countDocuments({ userId: user._id });
      const MAX_DEVICES = 3;

      // if (deviceCount >= MAX_DEVICES) {
      //   // Block login
      //   const devices = await UserDevice.find({ userId: user._id }).select('deviceName');
      //   const deviceNames = devices.map(d => d.deviceName);

      //   await sendDeviceLimitReachedEmail(user.email, user.fullName, deviceName, deviceNames);

      //   res.status(403).json({
      //     message: 'Device limit reached. You can only be logged in on 3 devices.',
      //     code: 'DEVICE_LIMIT_REACHED',
      //     currentDevices: deviceNames
      //   });
      //   return;
      // }

      // Register new device
      userDevice = await UserDevice.create({
        userId: user._id,
        deviceFingerprint,
        deviceName,
        deviceInfo: {
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          platform: deviceInfo.device,
          userAgent: req.headers['user-agent']
        }
      });

      // Send new device email
      // await sendNewDeviceEmail(user.email, user.fullName, deviceName, deviceCount + 1, MAX_DEVICES);
    }

    // Create new tokens
    const { token, refreshToken, expiresIn } = createTokens(user._id, user.role);
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    // Log login activity
    await logUserLogin(user._id, req);

    res.status(200).json({
      token,
      refreshToken,
      expiresIn,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isApproved: user.isApproved,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error });
  }
};

// Request password reset
export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (!user) {
      // Return success even if user doesn't exist (security)
      res.status(200).json({ message: 'If your email is registered, you will receive a password reset link' });
      return;
    }

    const resetToken = user.createPasswordResetToken();
    await user.save();

    await sendPasswordResetEmail(user.email, user.fullName, resetToken);

    res.status(200).json({ message: 'If your email is registered, you will receive a password reset link' });
  } catch (error) {
    res.status(500).json({ message: 'Error requesting password reset', error });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired reset token' });
      return;
    }

    // Note: Password validation and confirmation is handled on the frontend
    // The frontend only sends the validated password field

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken = undefined; // Invalidate any existing sessions
    await user.save();

    // Notify user about password change
    await sendPasswordChangeNotification(user.email, user.fullName);

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error });
  }
};

// Refresh token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: oldRefreshToken } = req.body;
    if (!oldRefreshToken) {
      res.status(401).json({ message: 'Refresh token required' });
      return;
    }

    const user = await User.findOne({ refreshToken: oldRefreshToken });
    if (!user) {
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }

    // Verify refresh token
    jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key');

    // Create new tokens
    const { token, refreshToken, expiresIn } = createTokens(user._id, user.role);
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({ token, refreshToken, expiresIn });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Refresh token expired' });
    } else {
      res.status(401).json({ message: 'Invalid refresh token' });
    }
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const user = await User.findById(authReq.user?._id)
      .select('-password -refreshToken');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return Promise.resolve();
    }

    res.status(200).json(user);
    return Promise.resolve();
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error });
    return Promise.resolve();
  }
};

// Logout
export const logout = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    if (authReq.user?._id) {
      await User.findByIdAndUpdate(authReq.user._id, { $unset: { refreshToken: 1 } });
    }
    res.status(200).json({ message: 'Logged out successfully' });
    return Promise.resolve();
  } catch (error) {
    res.status(500).json({ message: 'Error logging out', error });
    return Promise.resolve();
  }
};
