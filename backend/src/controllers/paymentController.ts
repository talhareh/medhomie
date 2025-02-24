import { Response } from 'express';
import { Types } from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import { Payment, PaymentStatus } from '../models/Payment';
import { Enrollment, EnrollmentStatus } from '../models/Enrollment';
import { UserRole } from '../models/User';
import { Course, ICourse } from '../models/Course';
import { sendNotification } from '../utils/notification';

// Create a new payment
export const createPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { enrollmentId } = req.params;
    const {
      amount,
      paymentDate,
      paymentMethod,
      bankName,
      accountHolderNumber,
      transactionId
    } = req.body;
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: 'Payment receipt is required' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const enrollment = await Enrollment.findById(enrollmentId)
      .populate<{ course: ICourse }>('course');

    if (!enrollment) {
      res.status(404).json({ message: 'Enrollment not found' });
      return;
    }

    if (enrollment.student.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to make payment for this enrollment' });
      return;
    }

    if (!enrollment.course) {
      res.status(404).json({ message: 'Course not found for this enrollment' });
      return;
    }

    const payment = new Payment({
      enrollment: enrollmentId,
      student: req.user._id,
      course: enrollment.course._id,
      amount,
      paymentDate,
      paymentMethod,
      bankName,
      accountHolderNumber,
      transactionId,
      receiptPath: file.path,
      statusHistory: [{
        status: PaymentStatus.PENDING,
        updatedBy: new Types.ObjectId(req.user._id),
        updatedAt: new Date()
      }]
    });

    await payment.save();

    // Notify createdBy about new payment
    const course = await Course.findById(enrollment.course._id)
      .populate('createdBy');
    
    if (course?.createdBy) {
      await sendNotification(
        course.createdBy._id.toString(),
        'New Payment Received',
        `A new payment has been submitted for course: ${course.title}`
      );
    }

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating payment', error });
  }
};

// Update payment status
export const updatePaymentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.params;
    const { status, reason } = req.body;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const payment = await Payment.findById(paymentId)
      .populate('enrollment');

    if (!payment) {
      res.status(404).json({ message: 'Payment not found' });
      return;
    }

    // Check authorization
    if (req.user.role !== UserRole.ADMIN) {
      const course = await Course.findById(payment.course);
      if (!course || course.createdBy.toString() !== req.user._id.toString()) {
        res.status(403).json({ message: 'Not authorized to update payment status' });
        return;
      }
    }

    // Update payment status
    payment.status = status;
    payment.statusHistory.push({
      status,
      updatedBy: new Types.ObjectId(req.user._id),
      updatedAt: new Date(),
      reason
    });

    // If payment is rejected, reject the enrollment
    if (status === PaymentStatus.REJECTED && payment.enrollment) {
      const enrollmentId = payment.enrollment instanceof Types.ObjectId 
        ? payment.enrollment 
        : payment.enrollment._id;
      
      await Enrollment.findByIdAndUpdate(enrollmentId, {
        status: EnrollmentStatus.REJECTED,
        rejectionReason: reason || 'Payment was rejected'
      });
    }

    await payment.save();

    // Notify student about payment status update
    await sendNotification(
      payment.student.toString(),
      'Payment Status Updated',
      `Your payment status has been updated to ${status}${reason ? ': ' + reason : ''}`
    );

    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating payment status', error });
  }
};

// Get payments (filtered by role)
export const getPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { status, courseId, startDate, endDate } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build query based on role and filters
    const query: any = {};

    // Apply role-based filters
    if (req.user.role === UserRole.STUDENT) {
      query.student = req.user._id;
    } else if (req.user.role === UserRole.INSTRUCTOR) {
      const courses = await Course.find({ createdBy: req.user._id });
      query.course = { $in: courses.map(course => course._id) };
    }

    // Apply optional filters
    if (status) {
      query.status = status;
    }
    if (courseId) {
      query.course = new Types.ObjectId(courseId as string);
    }
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) {
        query.paymentDate.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.paymentDate.$lte = new Date(endDate as string);
      }
    }

    // Get total count for pagination
    const total = await Payment.countDocuments(query);

    // Execute query with pagination
    const payments = await Payment.find(query)
      .populate('student', 'firstName lastName email')
      .populate('course', 'title code')
      .populate('enrollment')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments', error });
  }
};

// Get payment by ID
export const getPaymentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.params;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const payment = await Payment.findById(paymentId)
      .populate('student', 'firstName lastName email')
      .populate('course', 'title createdBy')
      .populate('enrollment');

    if (!payment) {
      res.status(404).json({ message: 'Payment not found' });
      return;
    }

    // Check authorization
    const populatedStudent = payment.student as any;
    if (req.user.role === UserRole.STUDENT && 
        populatedStudent._id.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to view this payment' });
      return;
    } else if (req.user.role === UserRole.INSTRUCTOR) {
      const course = await Course.findById(payment.course);
      if (!course || course.createdBy.toString() !== req.user._id.toString()) {
        res.status(403).json({ message: 'Not authorized to view this payment' });
        return;
      }
    }

    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment', error });
  }
};

// Reupload payment receipt
export const reuploadePaymentReceipt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.params;
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: 'Payment receipt is required' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      res.status(404).json({ message: 'Payment not found' });
      return;
    }

    if (payment.student.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to update this payment' });
      return;
    }

    if (payment.status !== PaymentStatus.REJECTED) {
      res.status(400).json({ message: 'Can only reupload receipt for rejected payments' });
      return;
    }

    payment.receiptPath = file.path;
    payment.status = PaymentStatus.PENDING;
    payment.statusHistory.push({
      status: PaymentStatus.PENDING,
      updatedBy: new Types.ObjectId(req.user._id),
      updatedAt: new Date(),
      reason: 'Receipt reuploaded'
    });

    await payment.save();

    // Notify createdBy about reuploaded receipt
    const course = await Course.findById(payment.course)
      .populate('createdBy');
    
    if (course?.createdBy) {
      await sendNotification(
        course.createdBy._id.toString(),
        'Payment Receipt Reuploaded',
        `A payment receipt has been reuploaded for course: ${course.title}`
      );
    }

    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error reuploading payment receipt', error });
  }
};
