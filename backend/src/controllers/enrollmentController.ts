import { Response } from 'express';
import { Types } from 'mongoose';
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
    res.status(500).json({ message: 'Error enrolling in course', error });
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
      .populate('course', 'title')
      .sort({ enrollmentDate: -1 });

    res.status(200).json(enrollments);
  } catch (error) {
    console.error('Error in getEnrollments:', error);
    res.status(500).json({ message: 'Error fetching enrollments', error });
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
    res.status(500).json({ message: 'Error updating enrollment status', error });
  }
};

// Get student's enrollments
export const getMyEnrollments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate('course', 'title description price image content noticeBoard')
      .populate('student', 'name email')
      .sort({ enrollmentDate: -1 });

    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your enrollments', error });
  }
};
