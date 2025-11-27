import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import { Voucher, IVoucher } from '../models/Voucher';
import { VoucherUsage } from '../models/VoucherUsage';
import { Course } from '../models/Course';
import { UserRole } from '../models/User';
import { Enrollment } from '../models/Enrollment';
import { Payment } from '../models/Payment';
import { User } from '../models/User';
import { sendVoucherAppliedEmail } from '../services/emailService';

// Create a new voucher (Admin only)
export const createVoucher = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Only admins can create vouchers' });
      return;
    }

    const {
      code,
      description,
      discountPercentage,
      applicableCourses,
      usageLimit,
      validFrom,
      validUntil
    } = req.body;

    // Validate code is provided
    if (!code || !code.trim()) {
      res.status(400).json({ message: 'Voucher code is required' });
      return;
    }

    // Check if voucher code already exists (case-insensitive)
    const existingVoucher = await Voucher.findOne({
      code: code.trim().toUpperCase()
    });

    if (existingVoucher) {
      res.status(400).json({ message: 'Voucher code already exists' });
      return;
    }

    // Validate discount percentage
    if (!discountPercentage || discountPercentage < 0 || discountPercentage > 100) {
      res.status(400).json({ message: 'Discount percentage must be between 0 and 100' });
      return;
    }

    // Validate applicable courses
    if (!applicableCourses || !Array.isArray(applicableCourses) || applicableCourses.length === 0) {
      res.status(400).json({ message: 'At least one applicable course is required' });
      return;
    }

    // Validate that all courses exist
    const courses = await Course.find({ _id: { $in: applicableCourses } });
    if (courses.length !== applicableCourses.length) {
      res.status(400).json({ message: 'One or more courses not found' });
      return;
    }

    // Validate dates
    const fromDate = new Date(validFrom);
    const untilDate = new Date(validUntil);
    if (isNaN(fromDate.getTime()) || isNaN(untilDate.getTime())) {
      res.status(400).json({ message: 'Invalid date format' });
      return;
    }

    if (untilDate <= fromDate) {
      res.status(400).json({ message: 'validUntil must be after validFrom' });
      return;
    }

    // Validate usage limit
    if (!usageLimit || usageLimit < 1) {
      res.status(400).json({ message: 'Usage limit must be at least 1' });
      return;
    }

    const voucher = new Voucher({
      code: code.trim().toUpperCase(),
      description: description?.trim(),
      discountPercentage,
      applicableCourses,
      usageLimit,
      validFrom: fromDate,
      validUntil: untilDate,
      isActive: true,
      createdBy: req.user._id
    });

    await voucher.save();

    // Populate courses for response
    await voucher.populate('applicableCourses', 'title price');

    res.status(201).json({
      success: true,
      data: voucher,
      message: 'Voucher created successfully'
    });
  } catch (error) {
    console.error('Error creating voucher:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating voucher',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Get all vouchers (Admin only)
export const getVouchers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Only admins can view vouchers' });
      return;
    }

    const { isActive, courseId, search } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (courseId) {
      query.applicableCourses = new Types.ObjectId(courseId as string);
    }

    if (search) {
      query.code = { $regex: search, $options: 'i' };
    }

    const total = await Voucher.countDocuments(query);

    const vouchers = await Voucher.find(query)
      .populate('applicableCourses', 'title price')
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: vouchers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vouchers',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Get voucher by ID (Admin only)
export const getVoucherById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Only admins can view vouchers' });
      return;
    }

    const { id } = req.params;

    const voucher = await Voucher.findById(id)
      .populate('applicableCourses', 'title price')
      .populate('createdBy', 'fullName email');

    if (!voucher) {
      res.status(404).json({ message: 'Voucher not found' });
      return;
    }

    // Get usage statistics
    const usageCount = await VoucherUsage.countDocuments({ voucher: voucher._id });
    const recentUsages = await VoucherUsage.find({ voucher: voucher._id })
      .populate('student', 'fullName email')
      .populate('course', 'title')
      .sort({ usedAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        voucher,
        usageCount,
        recentUsages
      }
    });
  } catch (error) {
    console.error('Error fetching voucher:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching voucher',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Update voucher (Admin only)
export const updateVoucher = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Only admins can update vouchers' });
      return;
    }

    const { id } = req.params;
    const {
      code,
      description,
      discountPercentage,
      applicableCourses,
      usageLimit,
      validFrom,
      validUntil,
      isActive
    } = req.body;

    const voucher = await Voucher.findById(id);

    if (!voucher) {
      res.status(404).json({ message: 'Voucher not found' });
      return;
    }

    // If code is being changed, check for duplicates
    if (code && code.trim().toUpperCase() !== voucher.code) {
      const existingVoucher = await Voucher.findOne({
        code: code.trim().toUpperCase(),
        _id: { $ne: id }
      });

      if (existingVoucher) {
        res.status(400).json({ message: 'Voucher code already exists' });
        return;
      }
      voucher.code = code.trim().toUpperCase();
    }

    if (description !== undefined) {
      voucher.description = description?.trim();
    }

    if (discountPercentage !== undefined) {
      if (discountPercentage < 0 || discountPercentage > 100) {
        res.status(400).json({ message: 'Discount percentage must be between 0 and 100' });
        return;
      }
      voucher.discountPercentage = discountPercentage;
    }

    if (applicableCourses !== undefined) {
      if (!Array.isArray(applicableCourses) || applicableCourses.length === 0) {
        res.status(400).json({ message: 'At least one applicable course is required' });
        return;
      }

      const courses = await Course.find({ _id: { $in: applicableCourses } });
      if (courses.length !== applicableCourses.length) {
        res.status(400).json({ message: 'One or more courses not found' });
        return;
      }
      voucher.applicableCourses = applicableCourses;
    }

    if (usageLimit !== undefined) {
      if (usageLimit < voucher.usedCount) {
        res.status(400).json({ message: 'Usage limit cannot be less than current usage count' });
        return;
      }
      if (usageLimit < 1) {
        res.status(400).json({ message: 'Usage limit must be at least 1' });
        return;
      }
      voucher.usageLimit = usageLimit;
    }

    if (validFrom !== undefined) {
      const fromDate = new Date(validFrom);
      if (isNaN(fromDate.getTime())) {
        res.status(400).json({ message: 'Invalid validFrom date format' });
        return;
      }
      voucher.validFrom = fromDate;
    }

    if (validUntil !== undefined) {
      const untilDate = new Date(validUntil);
      if (isNaN(untilDate.getTime())) {
        res.status(400).json({ message: 'Invalid validUntil date format' });
        return;
      }
      voucher.validUntil = untilDate;
    }

    // Validate dates are in correct order
    if (voucher.validUntil <= voucher.validFrom) {
      res.status(400).json({ message: 'validUntil must be after validFrom' });
      return;
    }

    if (isActive !== undefined) {
      voucher.isActive = isActive;
    }

    await voucher.save();
    await voucher.populate('applicableCourses', 'title price');

    res.status(200).json({
      success: true,
      data: voucher,
      message: 'Voucher updated successfully'
    });
  } catch (error) {
    console.error('Error updating voucher:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating voucher',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Delete voucher (Admin only)
export const deleteVoucher = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Only admins can delete vouchers' });
      return;
    }

    const { id } = req.params;

    const voucher = await Voucher.findById(id);

    if (!voucher) {
      res.status(404).json({ message: 'Voucher not found' });
      return;
    }

    // Check if voucher has been used
    const usageCount = await VoucherUsage.countDocuments({ voucher: voucher._id });
    if (usageCount > 0) {
      // Instead of deleting, deactivate it
      voucher.isActive = false;
      await voucher.save();
      res.status(200).json({
        success: true,
        message: 'Voucher has been used and cannot be deleted. It has been deactivated instead.'
      });
      return;
    }

    await Voucher.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Voucher deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting voucher:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting voucher',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Validate voucher code (Student endpoint)
export const validateVoucher = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { code, courseId } = req.body;

    if (!code || !courseId) {
      res.status(400).json({ message: 'Voucher code and course ID are required' });
      return;
    }

    const validationResult = await validateVoucherForCourse(
      code.trim().toUpperCase(),
      courseId,
      req.user._id
    );

    if (!validationResult.valid) {
      res.status(400).json({
        success: false,
        message: validationResult.message
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        voucher: validationResult.voucher,
        discountPercentage: validationResult.voucher!.discountPercentage,
        originalPrice: validationResult.originalPrice,
        discountAmount: validationResult.discountAmount,
        finalPrice: validationResult.finalPrice
      }
    });
  } catch (error) {
    console.error('Error validating voucher:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating voucher',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Get student's voucher usage history
export const getMyVoucherUsage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const usages = await VoucherUsage.find({ student: req.user._id })
      .populate('voucher', 'code discountPercentage')
      .populate('course', 'title')
      .populate('enrollment')
      .sort({ usedAt: -1 });

    res.status(200).json({
      success: true,
      data: usages
    });
  } catch (error) {
    console.error('Error fetching voucher usage:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching voucher usage',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Apply voucher retroactively (Admin only)
export const applyVoucherRetroactive = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Only admins can apply vouchers retroactively' });
      return;
    }

    const { enrollmentId, voucherCode } = req.body;

    if (!enrollmentId || !voucherCode) {
      res.status(400).json({ message: 'Enrollment ID and voucher code are required' });
      return;
    }

    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('student')
      .populate('course');

    if (!enrollment) {
      res.status(404).json({ message: 'Enrollment not found' });
      return;
    }

    const course = await Course.findById(enrollment.course);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    // Validate voucher
    const validationResult = await validateVoucherForCourse(
      voucherCode.trim().toUpperCase(),
      course._id.toString(),
      enrollment.student.toString()
    );

    if (!validationResult.valid) {
      res.status(400).json({
        success: false,
        message: validationResult.message
      });
      return;
    }

    const voucher = validationResult.voucher!;

    // Check if voucher already used for this enrollment
    const existingUsage = await VoucherUsage.findOne({
      voucher: voucher._id,
      student: enrollment.student,
      enrollment: enrollment._id
    });

    if (existingUsage) {
      res.status(400).json({ message: 'Voucher already applied to this enrollment' });
      return;
    }

    // Create voucher usage record
    const voucherUsage = new VoucherUsage({
      voucher: voucher._id,
      student: enrollment.student,
      course: enrollment.course,
      enrollment: enrollment._id,
      discountAmount: validationResult.discountAmount,
      originalPrice: validationResult.originalPrice,
      finalPrice: validationResult.finalPrice,
      appliedBy: req.user._id
    });

    await voucherUsage.save();

    // Update voucher used count
    voucher.usedCount += 1;
    await voucher.save();

    // Update enrollment with voucher code
    enrollment.voucherCode = voucher.code;
    await enrollment.save();

    // Send email notification to student
    try {
      const student = await User.findById(enrollment.student);
      if (student && validationResult.discountAmount !== undefined && validationResult.finalPrice !== undefined) {
        await sendVoucherAppliedEmail(
          student.email,
          student.fullName || 'Student',
          voucher.code,
          course.title,
          validationResult.discountAmount,
          validationResult.finalPrice
        );
      }
    } catch (emailError) {
      console.error('Error sending voucher email:', emailError);
      // Don't fail the operation if email fails
    }

    res.status(200).json({
      success: true,
      data: voucherUsage,
      message: 'Voucher applied successfully. Student has been notified via email.'
    });
  } catch (error) {
    console.error('Error applying voucher retroactively:', error);
    res.status(500).json({
      success: false,
      message: 'Error applying voucher',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Helper function to validate voucher for a course
export const validateVoucherForCourse = async (
  code: string,
  courseId: string,
  studentId: string
): Promise<{
  valid: boolean;
  message?: string;
  voucher?: IVoucher;
  originalPrice?: number;
  discountAmount?: number;
  finalPrice?: number;
}> => {
  try {
    // Find voucher (case-insensitive)
    const voucher = await Voucher.findOne({ code: code.toUpperCase() });

    if (!voucher) {
      return { valid: false, message: 'Invalid voucher code' };
    }

    // Check if voucher is active
    if (!voucher.isActive) {
      return { valid: false, message: 'Voucher is not active' };
    }

    // Check expiry dates
    const now = new Date();
    if (now < voucher.validFrom) {
      return { valid: false, message: 'Voucher is not yet valid' };
    }

    if (now > voucher.validUntil) {
      return { valid: false, message: 'Voucher has expired' };
    }

    // Check usage limit
    if (voucher.usedCount >= voucher.usageLimit) {
      return { valid: false, message: 'Voucher usage limit has been reached' };
    }

    // Check if course is applicable
    const courseObjectId = new Types.ObjectId(courseId);
    if (!voucher.applicableCourses.some(c => c.toString() === courseObjectId.toString())) {
      return { valid: false, message: 'Voucher is not applicable to this course' };
    }

    // Get course to check for existing discount
    const course = await Course.findById(courseId);
    if (!course) {
      return { valid: false, message: 'Course not found' };
    }

    // Check if course already has discount
    // Note: According to requirements, vouchers cannot apply to already discounted courses
    // If the Course model has a discountPercentage field that is set, the course is considered discounted
    // Since the field doesn't exist in the current model, we skip this check
    // This can be added later if the Course model is updated with discountPercentage field

    // Check if student already used this voucher
    const existingUsage = await VoucherUsage.findOne({
      voucher: voucher._id,
      student: new Types.ObjectId(studentId)
    });

    if (existingUsage) {
      return { valid: false, message: 'You have already used this voucher' };
    }

    // Calculate discount
    const originalPrice = course.price;
    const discountAmount = (originalPrice * voucher.discountPercentage) / 100;
    const finalPrice = originalPrice - discountAmount;

    return {
      valid: true,
      voucher,
      originalPrice,
      discountAmount,
      finalPrice
    };
  } catch (error) {
    console.error('Error in validateVoucherForCourse:', error);
    return { valid: false, message: 'Error validating voucher' };
  }
};

