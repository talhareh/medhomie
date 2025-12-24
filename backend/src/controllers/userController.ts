import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User, UserRole } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { sendAdminCreatedUserEmail } from '../services/emailService';

import { UserDevice } from '../models/UserDevice';
import { Enrollment } from '../models/Enrollment';
import { Payment } from '../models/Payment';

// Get all users (admin only)
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.role !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const { role } = req.query;
    const query = role ? { role } : {};

    const users = await User.find(query).select('-password -refreshToken').lean();

    // Get device counts for all users
    const usersWithDevices = await Promise.all(users.map(async (user) => {
      const deviceCount = await UserDevice.countDocuments({ userId: user._id });
      return { ...user, deviceCount };
    }));

    res.status(200).json(usersWithDevices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Only allow admins to view other users
    if (authReq.user.role !== UserRole.ADMIN && authReq.user._id !== req.params.id) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const user = await User.findById(req.params.id).select('-password -refreshToken').lean();
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Get user devices
    const devices = await UserDevice.find({ userId: user._id }).sort({ lastLogin: -1 });

    // Get user enrollments
    const enrollments = await Enrollment.find({ student: user._id })
      .populate('course', 'title price thumbnail')
      .sort({ createdAt: -1 });

    // Get user payments
    const payments = await Payment.find({ student: user._id })
      .populate('course', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({ ...user, devices, enrollments, payments });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Only allow users to update their own profile or admins to update any profile
    if (authReq.user.role !== UserRole.ADMIN && authReq.user._id !== req.params.id) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const { fullName, whatsappNumber, password, email } = req.body;

    // Update basic info
    if (fullName) user.fullName = fullName;
    if (whatsappNumber) user.whatsappNumber = whatsappNumber;
    if (email) user.email = email.toLowerCase();

    // Handle password update
    if (password) {
      user.password = password; // This will be hashed by the pre-save middleware
    }

    // Only admins can update role and approval status
    if (authReq.user.role === UserRole.ADMIN) {
      if (req.body.role) user.role = req.body.role;
      if (typeof req.body.isApproved === 'boolean') user.isApproved = req.body.isApproved;
    }

    await user.save();

    // Create a safe response object without sensitive data
    const userResponse = {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      whatsappNumber: user.whatsappNumber,
      role: user.role,
      emailVerified: user.emailVerified,
      isApproved: user.isApproved
    };

    res.status(200).json({
      message: 'User updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', error });
  }
};

// Delete user (admin only)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.role !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
};

// Update user status (Admin only)
export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.role !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const { isApproved } = req.body;
    const userId = req.params.id;

    // Don't allow admin to block themselves
    if (userId === authReq.user._id) {
      res.status(400).json({ message: 'Cannot modify own account status' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.isApproved = isApproved;
    await user.save();

    res.status(200).json({
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isApproved: user.isApproved
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status', error });
  }
};

// Update user role (Admin only)
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.role !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const { role } = req.body;
    const userId = req.params.id;

    // Don't allow admin to change their own role
    if (userId === authReq.user._id) {
      res.status(400).json({ message: 'Cannot modify own role' });
      return;
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      res.status(400).json({ message: 'Invalid role' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isApproved: user.isApproved
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role', error });
  }
};

// Create user (admin only)
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.role !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const { email, password, fullName, whatsappNumber, role = UserRole.STUDENT } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      res.status(400).json({ message: 'Invalid role' });
      return;
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      fullName,
      whatsappNumber,
      role,
      emailVerified: true, // Admin-created users are automatically verified
      isApproved: true // Admin-created users are automatically approved
    });

    await user.save();

    // Send welcome email to the user
    try {
      await sendAdminCreatedUserEmail(
        user.email,
        user.fullName || 'User',
        user.email, // Using email as username
        password // Send the original password before hashing
      );
    } catch (emailError) {
      console.error('Error sending admin-created user email:', emailError);
      // Don't fail the user creation if email fails
    }

    // Convert to plain object and remove sensitive fields
    const userDoc = user.toObject();

    // Create a safe user object without sensitive data
    const userResponse = {
      _id: userDoc._id,
      email: userDoc.email,
      fullName: userDoc.fullName,
      whatsappNumber: userDoc.whatsappNumber,
      role: userDoc.role,
      emailVerified: userDoc.emailVerified,
      isApproved: userDoc.isApproved
    };

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user', error });
  }
};

// Get available students for enrollment (students not enrolled in a specific course)
export const getAvailableStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Only allow admins and instructors to access this endpoint
    if (authReq.user.role !== UserRole.ADMIN && authReq.user.role !== UserRole.INSTRUCTOR) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const { courseId, search } = req.query;

    if (!courseId) {
      res.status(400).json({ message: 'Course ID is required' });
      return;
    }

    // Find all students (users with role STUDENT)
    const query: any = { role: UserRole.STUDENT, isApproved: true };

    // Add search filter if provided
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get all students
    const students = await User.find(query).select('_id fullName email whatsappNumber');

    // Get all enrollments for the course
    const enrollments = await mongoose.model('Enrollment').find({
      course: courseId
    }).select('student');

    // Extract student IDs from enrollments
    const enrolledStudentIds = enrollments.map(enrollment => enrollment.student.toString());

    // Filter out students who are already enrolled
    const availableStudents = students.filter(student =>
      !enrolledStudentIds.includes(student._id.toString())
    );

    res.status(200).json(availableStudents);
  } catch (error) {
    console.error('Error in getAvailableStudents:', error);
    res.status(500).json({ message: 'Error fetching available students', error });
  }
};
