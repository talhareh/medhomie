import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import { Course } from '../models/Course';
import { Enrollment, EnrollmentStatus } from '../models/Enrollment';
import { AuthRequest } from '../middleware/auth';
import { User, UserRole } from '../models/User';

// Interface for User document
interface UserDocument {
  _id: Types.ObjectId;
  fullName?: string;
  email?: string;
  whatsappNumber?: string;
  name?: string;
}

// Enroll in a course
export const enrollInCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
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

    // Check if student is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    });

    if (existingEnrollment) {
      res.status(400).json({ message: 'Already enrolled in this course' });
      return;
    }

    const enrollment = new Enrollment({
      student: req.user._id,
      course: courseId,
      paymentReceipt: file.path,
      status: EnrollmentStatus.PENDING
    });

    await enrollment.save();
    res.status(201).json(enrollment);
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

    interface QueryType {
      course?: { $in: Types.ObjectId[] };
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
      const courses = await Course.find({ instructor: req.user._id });
      const courseIds = courses.map(course => course._id) as Types.ObjectId[];
      query.course = { $in: courseIds };
    }

    // Add courseId filter if provided
    if (req.query.courseId) {
      // If there's already a course filter (for instructors), we need to ensure it's also in their courses
      if (query.course && query.course.$in) {
        // Keep only this courseId if it's in the instructor's courses
        const courseId = new Types.ObjectId(req.query.courseId as string);
        if (query.course.$in.some(id => id.equals(courseId))) {
          query.course = { $in: [courseId] };
        }
      } else {
        // For admins or when no previous course filter exists
        query.course = { $in: [new Types.ObjectId(req.query.courseId as string)] };
      }
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

    const enrollments = await Enrollment.find(query)
      .populate('student', 'fullName email whatsappNumber')
      .populate('course', 'title price')
      .sort({ enrollmentDate: -1 });

    res.status(200).json(enrollments);
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
      
      // Add student to course's enrolled students
      await Course.findByIdAndUpdate(enrollment.course, {
        $addToSet: { enrolledStudents: enrollment.student }
      });
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
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate('course', 'title description price image state')
      .populate('student', 'name email')
      .sort({ enrollmentDate: -1 });

    // Only return enrollments where course exists and is ACTIVE
    const activeEnrollments = enrollments.filter(enrollment => {
      // If course is not populated (deleted), skip
      if (!enrollment.course || typeof enrollment.course !== 'object') return false;
      // @ts-ignore
      return enrollment.course.state === 'ACTIVE';
    });

    res.status(200).json(activeEnrollments);
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
    let { studentIds } = req.body;

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

    // Check for existing enrollments
    const existingEnrollments = await Enrollment.find({
      course: courseId,
      student: { $in: studentIds }
    });

    if (existingEnrollments.length > 0) {
      const enrolledStudentIds = existingEnrollments.map(e => e.student.toString());
      studentIds = studentIds.filter(id => !enrolledStudentIds.includes(id.toString()));

      if (studentIds.length === 0) {
        res.status(400).json({ message: 'All students are already enrolled' });
        return;
      }
    }

    // Create enrollments
    const enrollments = studentIds.map((studentId: Types.ObjectId | string) => ({
      student: studentId,
      course: courseId,
      paymentReceipt: 'admin-enrollment', // Default value for admin enrollments
      status: EnrollmentStatus.APPROVED,
      enrollmentDate: new Date(),
      approvalDate: new Date()
    }));

    await Enrollment.insertMany(enrollments);

    res.status(201).json({
      message: 'Students enrolled successfully',
      enrolledCount: studentIds.length
    });
  } catch (error) {
    console.error('Error in bulkEnrollStudents:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Process card payment and auto-approve enrollment
export const processCardPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { paymentMethod, paymentDetails } = req.body;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const course = await Course.findById(courseId);
    
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    // Check if student is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    });

    if (existingEnrollment && existingEnrollment.status === EnrollmentStatus.APPROVED) {
      res.status(400).json({ message: 'Already enrolled in this course' });
      return;
    }

    // If there's a rejected enrollment, update it instead of creating a new one
    if (existingEnrollment && existingEnrollment.status === EnrollmentStatus.REJECTED) {
      existingEnrollment.status = EnrollmentStatus.APPROVED;
      existingEnrollment.approvalDate = new Date();
      existingEnrollment.paymentMethod = paymentMethod;
      existingEnrollment.paymentDetails = paymentDetails;
      existingEnrollment.rejectionReason = undefined;
      
      await existingEnrollment.save();
      
      // Add student to course's enrolled students
      await Course.findByIdAndUpdate(courseId, {
        $addToSet: { enrolledStudents: req.user._id }
      });
      
      res.status(200).json({
        message: 'Payment processed and enrollment approved',
        enrollment: existingEnrollment
      });
      return;
    }

    // Create a new enrollment with approved status
    const enrollment = new Enrollment({
      student: req.user._id,
      course: courseId,
      paymentMethod: paymentMethod,
      paymentDetails: paymentDetails,
      status: EnrollmentStatus.APPROVED,
      approvalDate: new Date()
    });

    await enrollment.save();
    
    // Add student to course's enrolled students
    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledStudents: req.user._id }
    });

    res.status(201).json({
      message: 'Payment processed and enrollment approved',
      enrollment
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

    // Check if enrollments exist
    const existingEnrollments = await Enrollment.find({
      course: courseId,
      student: { $in: studentIds }
    });

    if (existingEnrollments.length === 0) {
      res.status(400).json({ message: 'No matching enrollments found' });
      return;
    }

    // Remove enrollments
    const result = await Enrollment.deleteMany({
      course: courseId,
      student: { $in: studentIds }
    });

    // Update course enrollment count if needed
    if (result.deletedCount > 0) {
      await Course.findByIdAndUpdate(courseId, {
        $inc: { enrollmentCount: -result.deletedCount }
      });
    }

    res.status(200).json({
      message: 'Students removed successfully',
      removedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error in bulkRemoveStudents:', error);
    res.status(500).json({ 
      message: 'Error removing students', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};
