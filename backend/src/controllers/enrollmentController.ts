import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import { Course } from '../models/Course';
import { Enrollment, EnrollmentStatus } from '../models/Enrollment';
import { AuthRequest } from '../middleware/auth';
import { User, UserRole } from '../models/User';
import {
  sendAdminSuccessfulPaymentEmail,
  sendEnrollmentNotification,
  sendStudentPaymentConfirmationEmail
} from '../services/emailService';
import { generateInvoicePDF } from '../services/invoiceService';
import { Payment, PaymentStatus, PaymentMethod } from '../models/Payment';
import { validateVoucherForCourse } from './voucherController';
import { Voucher } from '../models/Voucher';
import { VoucherUsage } from '../models/VoucherUsage';
import { hasActiveEnrollmentAccess } from '../utils/enrollmentAccess';
import { CheckoutOrder } from '../models/PayPalOrder';

// Interface for User document
interface UserDocument {
  _id: Types.ObjectId;
  fullName?: string;
  email?: string;
  whatsappNumber?: string;
  name?: string;
}

const normalizeBaseUrl = (value: string): string => value.replace(/\/+$/, '');

const resolveBackendBaseUrl = (): string => {
  const configuredBaseUrl = process.env.BACKEND_URL || process.env.FRONTEND_URL;
  return configuredBaseUrl
    ? normalizeBaseUrl(configuredBaseUrl)
    : 'http://localhost:5000';
};

// Enroll in a course
export const enrollInCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { voucherCode } = req.body;
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: 'Payment receipt is required' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const course = await Course.findById(courseId);
    
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    });

    if (existingEnrollment && hasActiveEnrollmentAccess(existingEnrollment)) {
      res.status(400).json({ message: 'Already enrolled in this course' });
      return;
    }

    // Validate and apply voucher if provided
    let voucherData = null;
    if (voucherCode) {
      const validationResult = await validateVoucherForCourse(
        voucherCode.trim().toUpperCase(),
        courseId,
        req.user._id
      );

      if (!validationResult.valid) {
        res.status(400).json({
          message: validationResult.message || 'Invalid voucher code'
        });
        return;
      }

      voucherData = {
        voucher: validationResult.voucher!,
        discountAmount: validationResult.discountAmount!,
        originalPrice: validationResult.originalPrice!,
        finalPrice: validationResult.finalPrice!
      };
    }

    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 10);

    let enrollment;
    if (existingEnrollment) {
      existingEnrollment.paymentReceipt = file.path;
      existingEnrollment.voucherCode = voucherCode ? voucherCode.trim().toUpperCase() : undefined;
      existingEnrollment.status = EnrollmentStatus.PENDING;
      existingEnrollment.rejectionReason = undefined;
      existingEnrollment.expirationDate = expirationDate;
      existingEnrollment.isExpired = false;
      await existingEnrollment.save();
      enrollment = existingEnrollment;
    } else {
      enrollment = new Enrollment({
        student: req.user._id,
        course: courseId,
        paymentReceipt: file.path,
        voucherCode: voucherCode ? voucherCode.trim().toUpperCase() : undefined,
        status: EnrollmentStatus.PENDING,
        expirationDate: expirationDate,
        isExpired: false
      });
      await enrollment.save();
    }

    // Create voucher usage record if voucher was applied
    if (voucherData) {
      const voucherUsage = new VoucherUsage({
        voucher: voucherData.voucher._id,
        student: req.user._id,
        course: courseId,
        enrollment: enrollment._id,
        discountAmount: voucherData.discountAmount,
        originalPrice: voucherData.originalPrice,
        finalPrice: voucherData.finalPrice,
        appliedBy: req.user._id
      });

      await voucherUsage.save();

      // Update voucher used count
      voucherData.voucher.usedCount += 1;
      await voucherData.voucher.save();
    }

    res.status(201).json({
      ...enrollment.toObject(),
      voucherApplied: !!voucherData,
      discountAmount: voucherData?.discountAmount,
      finalPrice: voucherData?.finalPrice || course.price
    });
  } catch (error) {
    console.error('Error in enrollInCourse:', error);
    res.status(500).json({ 
      message: 'Error enrolling in course', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Get enrollments (for admin and instructors)
export const getEnrollments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.INSTRUCTOR) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    interface QueryType {
      course?: Types.ObjectId | { $in: Types.ObjectId[] };
      enrollmentDate?: {
        $gte?: Date;
        $lte?: Date;
      };
      status?: string;
      $or?: Array<{
        student?: { $in: Types.ObjectId[] };
        'course.title'?: RegExp;
      }>;
    }

    let query: QueryType = {};
    
    // If instructor, only show enrollments for their courses
    if (req.user.role === UserRole.INSTRUCTOR) {
      const courses = await Course.find({ createdBy: req.user._id });
      const courseIds = courses.map(course => course._id) as Types.ObjectId[];

      if (req.query.courseId) {
        const courseId = new Types.ObjectId(req.query.courseId as string);
        if (!courseIds.some((id) => id.equals(courseId))) {
          res.status(403).json({ message: 'Access denied' });
          return;
        }
        query.course = courseId;
      } else {
        query.course = { $in: courseIds };
      }
    } else if (req.query.courseId) {
      query.course = new Types.ObjectId(req.query.courseId as string);
    }
    
    // Add date range filter
    if (req.query.startDate || req.query.endDate) {
      query.enrollmentDate = {};
      if (req.query.startDate) {
        query.enrollmentDate.$gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        query.enrollmentDate.$lte = new Date(req.query.endDate as string);
      }
    }

    // Add status filter
    if (req.query.status) {
      query.status = req.query.status as string;
    }

    // Add search filter
    if (req.query.search) {
      const searchRegex = new RegExp(String(req.query.search), 'i');
      const students = await User.find({
        $or: [
          { fullName: searchRegex },
          { email: searchRegex }
        ]
      }).select('_id') as UserDocument[];
      
      query.$or = [
        { student: { $in: students.map((s: UserDocument) => s._id) } },
        { 'course.title': searchRegex }
      ];
    }

    if (req.query.excludeWithdrawn === 'true' && !req.query.status) {
      (query as Record<string, unknown>).status = { $ne: EnrollmentStatus.WITHDRAWN };
    }

    const enrollments = await Enrollment.find(query)
      .populate('student', 'fullName email whatsappNumber')
      .populate('course', 'title price')
      .sort({ enrollmentDate: -1 });

    // Fetch associated payments for each enrollment
    const enrollmentsWithPayments = await Promise.all(
      enrollments.map(async (enrollment) => {
        const payment = await Payment.findOne({ enrollment: enrollment._id })
          .populate('student', 'fullName email')
          .populate('course', 'title price');
        
        // Convert enrollment to the format expected by frontend
        const enrollmentData: any = enrollment.toObject();
        
        // Add payment information if it exists
        if (payment) {
          enrollmentData.paymentReceipt = payment.receiptPath;
          enrollmentData.paymentMethod = payment.paymentMethod;
          enrollmentData.paymentStatus = payment.status;
          enrollmentData.paymentDate = payment.paymentDate;
          enrollmentData.paymentId = payment._id;
        }
        
        return enrollmentData;
      })
    );

    res.status(200).json(enrollmentsWithPayments);
  } catch (error) {
    console.error('Error in getEnrollments:', error);
    res.status(500).json({ 
      message: 'Error fetching enrollments', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Approve or reject enrollment (admin only)
export const updateEnrollmentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { enrollmentId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!req.user || req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Only admins can update enrollment status' });
      return;
    }

    const enrollment = await Enrollment.findById(enrollmentId);
    
    if (!enrollment) {
      res.status(404).json({ message: 'Enrollment not found' });
      return;
    }

    enrollment.status = status;
    if (status === EnrollmentStatus.APPROVED) {
      enrollment.approvalDate = new Date();
      
      // Set expiration date if not already set (for legacy enrollments)
      if (!enrollment.expirationDate) {
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 10);
        enrollment.expirationDate = expirationDate;
      }
      
      // Reset isExpired if enrollment is being re-approved
      if (enrollment.isExpired) {
        enrollment.isExpired = false;
      }
      
      // Add student to course's enrolled students
      await Course.findByIdAndUpdate(enrollment.course, {
        $addToSet: { enrolledStudents: enrollment.student }
      });

      // Send enrollment notification email
      try {
        const student = await User.findById(enrollment.student);
        const course = await Course.findById(enrollment.course);
        
        if (student && course) {
          await sendEnrollmentNotification(
            student.email,
            student.fullName || 'Student',
            course.title,
            'enrolled'
          );
        }
      } catch (emailError) {
        console.error('Error sending enrollment approval email:', emailError);
        // Don't fail the approval if email fails
      }
    } else if (status === EnrollmentStatus.REJECTED) {
      enrollment.rejectionReason = rejectionReason;
    }

    await enrollment.save();
    res.status(200).json(enrollment);
  } catch (error) {
    console.error('Error in updateEnrollmentStatus:', error);
    res.status(500).json({ 
      message: 'Error updating enrollment status', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Get student's enrollments
export const getMyEnrollments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Populate 'state' so we can filter by it
    const enrollments = await Enrollment.find({
      student: req.user._id,
      status: { $ne: EnrollmentStatus.WITHDRAWN }
    })
      .populate('course', 'title description price image state')
      .populate('student', 'name email')
      .sort({ enrollmentDate: -1 });

    // Active + inactive courses (student may access inactive only when admin re-enrolls them)
    const activeEnrollments = enrollments.filter((enrollment) => {
      if (!enrollment.course || typeof enrollment.course !== 'object') return false;
      // @ts-ignore — populated course has state
      const st = enrollment.course.state as string;
      return st === 'ACTIVE' || st === 'INACTIVE';
    });

    // Fetch associated payments for each enrollment
    const enrollmentsWithPayments = await Promise.all(
      activeEnrollments.map(async (enrollment) => {
        const payment = await Payment.findOne({ enrollment: enrollment._id })
          .populate('student', 'fullName email')
          .populate('course', 'title price');
        
        // Convert enrollment to the format expected by frontend
        const enrollmentData: any = enrollment.toObject();
        
        // Add payment information if it exists
        if (payment) {
          enrollmentData.paymentReceipt = payment.receiptPath;
          enrollmentData.paymentMethod = payment.paymentMethod;
          enrollmentData.paymentStatus = payment.status;
          enrollmentData.paymentDate = payment.paymentDate;
          enrollmentData.paymentId = payment._id;
        }
        
        return enrollmentData;
      })
    );

    res.status(200).json(enrollmentsWithPayments);
  } catch (error) {
    console.error('Error in getMyEnrollments:', error);
    res.status(500).json({ 
      message: 'Error fetching your enrollments', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Bulk enroll students in a course (admin only)
export const bulkEnrollStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    let { studentIds, expirationDate } = req.body;

    // Check if user is admin
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Only admin can perform bulk enrollment' });
      return;
    }

    // Validate input
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      res.status(400).json({ message: 'Student IDs array is required' });
      return;
    }

    // Validate expiration date
    if (!expirationDate) {
      res.status(400).json({ message: 'Expiration date is required' });
      return;
    }

    const expiration = new Date(expirationDate);
    if (isNaN(expiration.getTime())) {
      res.status(400).json({ message: 'Invalid expiration date format' });
      return;
    }

    // Validate expiration date is in the future
    const now = new Date();
    if (expiration <= now) {
      res.status(400).json({ message: 'Expiration date must be in the future' });
      return;
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    // Check if all students exist
    const students = await User.find({ 
      _id: { $in: studentIds },
      role: UserRole.STUDENT 
    });

    if (students.length !== studentIds.length) {
      res.status(400).json({ message: 'Some student IDs are invalid' });
      return;
    }

    const existingEnrollments = await Enrollment.find({
      course: courseId,
      student: { $in: studentIds }
    });
    const byStudentId = new Map(
      existingEnrollments.map((e) => [e.student.toString(), e])
    );

    const toInsert: string[] = [];
    const toReactivate: typeof existingEnrollments = [];
    const skippedAlreadyActive: string[] = [];

    for (const id of studentIds) {
      const sid = id.toString();
      const existing = byStudentId.get(sid);
      if (!existing) {
        toInsert.push(sid);
      } else if (hasActiveEnrollmentAccess(existing)) {
        skippedAlreadyActive.push(sid);
      } else {
        toReactivate.push(existing);
      }
    }

    const affectedStudentIds = [
      ...toInsert,
      ...toReactivate.map((e) => e.student.toString())
    ];

    if (affectedStudentIds.length === 0) {
      res.status(400).json({ message: 'All selected students are already actively enrolled' });
      return;
    }

    if (toInsert.length > 0) {
      const newRows = toInsert.map((studentId) => ({
        student: studentId,
        course: courseId,
        paymentReceipt: 'admin-enrollment',
        status: EnrollmentStatus.APPROVED,
        enrollmentDate: new Date(),
        approvalDate: new Date(),
        expirationDate: expiration,
        isExpired: false
      }));
      await Enrollment.insertMany(newRows);
    }

    for (const doc of toReactivate) {
      doc.status = EnrollmentStatus.APPROVED;
      doc.approvalDate = new Date();
      doc.expirationDate = expiration;
      doc.isExpired = false;
      doc.rejectionReason = undefined;
      doc.paymentReceipt = 'admin-enrollment';
      await doc.save();
    }

    // Send enrollment notification emails to all enrolled students
    try {
      const enrolledStudents = await User.find({ _id: { $in: affectedStudentIds } });
      
      for (const student of enrolledStudents) {
        try {
          await sendEnrollmentNotification(
            student.email,
            student.fullName || 'Student',
            course.title,
            'enrolled'
          );
        } catch (emailError) {
          console.error(`Error sending enrollment email to ${student.email}:`, emailError);
          // Continue with other emails even if one fails
        }
      }
    } catch (emailError) {
      console.error('Error sending enrollment notification emails:', emailError);
      // Don't fail the enrollment if emails fail
    }

    res.status(201).json({
      message: 'Students enrolled successfully',
      enrolledCount: affectedStudentIds.length,
      skippedAlreadyActiveCount: skippedAlreadyActive.length
    });
  } catch (error) {
    console.error('Error in bulkEnrollStudents:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update enrollment expiration date (admin only)
export const updateEnrollmentExpiration = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { enrollmentId } = req.params;
    const { expirationDate, enrollmentIds } = req.body;

    // Check if user is admin
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Only admin can update enrollment expiration' });
      return;
    }

    // Validate expiration date
    if (!expirationDate) {
      res.status(400).json({ message: 'Expiration date is required' });
      return;
    }

    const expiration = new Date(expirationDate);
    if (isNaN(expiration.getTime())) {
      res.status(400).json({ message: 'Invalid expiration date format' });
      return;
    }

    // Validate expiration date is in the future
    const now = new Date();
    if (expiration <= now) {
      res.status(400).json({ message: 'Expiration date must be in the future' });
      return;
    }

    // Handle bulk update
    if (enrollmentIds && Array.isArray(enrollmentIds)) {
      const result = await Enrollment.updateMany(
        { _id: { $in: enrollmentIds } },
        { expirationDate: expiration }
      );
      res.status(200).json({
        message: 'Expiration dates updated successfully',
        updatedCount: result.modifiedCount
      });
      return;
    }

    // Handle single update
    if (!enrollmentId) {
      res.status(400).json({ message: 'Enrollment ID is required for single update' });
      return;
    }

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      res.status(404).json({ message: 'Enrollment not found' });
      return;
    }

    enrollment.expirationDate = expiration;
    // If enrollment was expired and new date is in future, reset isExpired
    if (enrollment.isExpired && expiration > now) {
      enrollment.isExpired = false;
    }

    await enrollment.save();
    res.status(200).json(enrollment);
  } catch (error) {
    console.error('Error in updateEnrollmentExpiration:', error);
    res.status(500).json({ 
      message: 'Error updating enrollment expiration', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Process card payment and auto-approve enrollment
export const processCardPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { paymentMethod, paymentDetails, voucherCode } = req.body;
    const normalizedMethod = (paymentMethod || '').toLowerCase();
    const storedPaymentMethod = normalizedMethod === 'kuickpay'
      ? PaymentMethod.KUICKPAY
      : PaymentMethod.PAYPAL;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const course = await Course.findById(courseId);
    
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    // Validate and apply voucher if provided
    let voucherData = null;
    let finalPrice = course.price;
    let discountAmount = 0;
    let originalAmount = course.price;
    let kuickpayOrder = null;

    if (voucherCode) {
      const validationResult = await validateVoucherForCourse(
        voucherCode.trim().toUpperCase(),
        courseId,
        req.user._id
      );

      if (!validationResult.valid) {
        res.status(400).json({
          message: validationResult.message || 'Invalid voucher code'
        });
        return;
      }

      voucherData = {
        voucher: validationResult.voucher!,
        discountAmount: validationResult.discountAmount!,
        originalPrice: validationResult.originalPrice!,
        finalPrice: validationResult.finalPrice!
      };

      finalPrice = voucherData.finalPrice;
      discountAmount = voucherData.discountAmount;
      originalAmount = voucherData.originalPrice;
    }

    if (storedPaymentMethod === PaymentMethod.KUICKPAY) {
      kuickpayOrder = await CheckoutOrder.findOne({
        gatewayOrderId: paymentDetails?.orderId,
        student: req.user._id,
        course: courseId
      });

      if (!kuickpayOrder) {
        res.status(400).json({ message: 'Matching Kuickpay order not found' });
        return;
      }
    }

    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    });

    if (existingEnrollment && hasActiveEnrollmentAccess(existingEnrollment)) {
      res.status(400).json({ message: 'Already enrolled in this course' });
      return;
    }

    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 10);

    let enrollment;
    if (existingEnrollment) {
      existingEnrollment.status = EnrollmentStatus.APPROVED;
      existingEnrollment.approvalDate = new Date();
      existingEnrollment.paymentMethod = paymentMethod;
      existingEnrollment.paymentDetails = paymentDetails;
      existingEnrollment.voucherCode = voucherCode ? voucherCode.trim().toUpperCase() : undefined;
      existingEnrollment.rejectionReason = undefined;
      existingEnrollment.expirationDate = expirationDate;
      existingEnrollment.isExpired = false;
      await existingEnrollment.save();
      enrollment = existingEnrollment;
    } else {
      enrollment = new Enrollment({
        student: req.user._id,
        course: courseId,
        paymentMethod: paymentMethod,
        paymentDetails: paymentDetails,
        voucherCode: voucherCode ? voucherCode.trim().toUpperCase() : undefined,
        status: EnrollmentStatus.APPROVED,
        approvalDate: new Date(),
        expirationDate: expirationDate,
        isExpired: false
      });
      await enrollment.save();
    }
    
    // Add student to course's enrolled students
    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledStudents: req.user._id }
    });

    // Create Payment record for gateway payment
    const payment = new Payment({
      enrollment: enrollment._id,
      student: req.user._id,
      course: courseId,
      amount: finalPrice,
      originalAmount: originalAmount,
      discountAmount: discountAmount,
      exchangeRate: kuickpayOrder?.exchangeRate,
      exchangeRateDate: kuickpayOrder?.exchangeRateDate,
      pkrAmount: kuickpayOrder?.pkrAmount,
      pkrCurrency: kuickpayOrder?.pkrCurrency || 'PKR',
      voucher: voucherData ? voucherData.voucher._id : undefined,
      paymentDate: new Date(),
      paymentMethod: storedPaymentMethod,
      transactionId: paymentDetails.transactionId,
      receiptPath: '', // Will be updated after PDF generation
      status: PaymentStatus.VERIFIED,
      statusHistory: [{
        status: PaymentStatus.VERIFIED,
        updatedBy: req.user._id,
        updatedAt: new Date()
      }]
    });

    await payment.save();
    console.log('✅ Payment record created:', payment._id);

    // Create voucher usage record if voucher was applied
    if (voucherData) {
      const voucherUsage = new VoucherUsage({
        voucher: voucherData.voucher._id,
        student: req.user._id,
        course: courseId,
        enrollment: enrollment._id,
        payment: payment._id,
        discountAmount: discountAmount,
        originalPrice: originalAmount,
        finalPrice: finalPrice,
        appliedBy: req.user._id
      });

      await voucherUsage.save();

      // Update voucher used count
      voucherData.voucher.usedCount += 1;
      await voucherData.voucher.save();
    }

    let invoiceUrl: string | undefined;

    // Generate invoice PDF
    try {
      const user = await User.findById(req.user._id);
      if (user) {
        const invoicePath = await generateInvoicePDF(payment, user, course);
        payment.receiptPath = invoicePath;
        await payment.save();
        invoiceUrl = `${resolveBackendBaseUrl()}/api/payments/${payment._id}/invoice`;
        console.log('✅ Invoice generated and saved:', invoicePath);
      }
    } catch (invoiceError) {
      console.error('❌ Error generating invoice:', invoiceError);
      // Don't fail the enrollment if invoice generation fails
    }

    // Send student payment confirmation and admin notification emails
    try {
      const user = await User.findById(req.user._id);
      if (user) {
        await sendStudentPaymentConfirmationEmail({
          to: user.email,
          fullName: user.fullName || 'Student',
          courseTitle: course.title,
          amountPaid: finalPrice,
          originalAmount,
          discountAmount,
          transactionId: paymentDetails.transactionId,
          orderId: paymentDetails.orderId,
          paymentMethod: storedPaymentMethod,
          invoiceUrl,
          voucherCode: voucherCode ? voucherCode.trim().toUpperCase() : undefined
        });

        await sendEnrollmentNotification(
          user.email,
          user.fullName || 'Student',
          course.title,
          'enrolled'
        );

        await sendAdminSuccessfulPaymentEmail({
          studentName: user.fullName || 'Student',
          studentEmail: user.email,
          whatsappNumber: user.whatsappNumber,
          courseTitle: course.title,
          amountPaid: finalPrice,
          originalAmount,
          discountAmount,
          transactionId: paymentDetails.transactionId,
          orderId: paymentDetails.orderId,
          paymentMethod: storedPaymentMethod,
          paymentDate: payment.paymentDate,
          voucherCode: voucherCode ? voucherCode.trim().toUpperCase() : undefined
        });
      }
    } catch (emailError) {
      console.error('Error sending payment notification emails:', emailError);
      // Don't fail the enrollment if email fails
    }

    res.status(201).json({
      message: 'Payment processed and enrollment approved',
      enrollment,
      payment: {
        id: payment._id,
        invoiceGenerated: !!payment.receiptPath
      }
    });
  } catch (error) {
    console.error('Error in processCardPayment:', error);
    res.status(500).json({ 
      message: 'Error processing payment', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Bulk remove students from a course (admin only)
export const bulkRemoveStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { studentIds } = req.body;

    // Check if user is admin
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Only admin can perform bulk removal' });
      return;
    }

    // Validate input
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      res.status(400).json({ message: 'Student IDs array is required' });
      return;
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    const existingEnrollments = await Enrollment.find({
      course: courseId,
      student: { $in: studentIds },
      status: { $ne: EnrollmentStatus.WITHDRAWN }
    });

    if (existingEnrollments.length === 0) {
      res.status(400).json({ message: 'No matching enrollments found' });
      return;
    }

    const studentsToRemove = await User.find({ _id: { $in: studentIds } });

    let withdrawnCount = 0;
    for (const enrollment of existingEnrollments) {
      enrollment.status = EnrollmentStatus.WITHDRAWN;
      enrollment.rejectionReason = 'Removed by administrator';
      enrollment.isExpired = false;
      await enrollment.save();
      withdrawnCount += 1;
    }

    await Course.findByIdAndUpdate(courseId, {
      $pull: { enrolledStudents: { $in: studentIds } }
    });

    // Send removal notification emails to all removed students
    try {
      for (const student of studentsToRemove) {
        try {
          await sendEnrollmentNotification(
            student.email,
            student.fullName || 'Student',
            course.title,
            'removed'
          );
        } catch (emailError) {
          console.error(`Error sending removal email to ${student.email}:`, emailError);
          // Continue with other emails even if one fails
        }
      }
    } catch (emailError) {
      console.error('Error sending removal notification emails:', emailError);
      // Don't fail the removal if emails fail
    }

    res.status(200).json({
      message: 'Students removed successfully',
      removedCount: withdrawnCount
    });
  } catch (error) {
    console.error('Error in bulkRemoveStudents:', error);
    res.status(500).json({ 
      message: 'Error removing students', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Cancel enrollment (student can cancel their own enrollment)
export const cancelEnrollment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { enrollmentId } = req.params;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const enrollment = await Enrollment.findById(enrollmentId);
    
    if (!enrollment) {
      res.status(404).json({ message: 'Enrollment not found' });
      return;
    }

    // Check if the user is the owner of this enrollment
    if (enrollment.student.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'You can only cancel your own enrollments' });
      return;
    }

    // Only allow cancellation of pending enrollments
    if (enrollment.status !== EnrollmentStatus.PENDING) {
      res.status(400).json({ message: 'Only pending enrollments can be cancelled' });
      return;
    }

    await Enrollment.findByIdAndDelete(enrollmentId);
    
    res.status(200).json({ message: 'Enrollment cancelled successfully' });
  } catch (error) {
    console.error('Error in cancelEnrollment:', error);
    res.status(500).json({ 
      message: 'Error cancelling enrollment', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};
