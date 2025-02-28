import { Request, Response } from 'express';
import { Course, ICourseDocument } from '../models/Course';
import { Enrollment } from '../models/Enrollment';
import { CourseState } from '../models/Course';
import { AuthRequest } from '../middleware/auth';
import { Types } from 'mongoose';

// Interface for public course response
interface PublicCourseResponse {
  _id: Types.ObjectId;
  title: string;
  description: string;
  price: number;
  thumbnail?: string;
  banner?: string;
  enrollmentCount: number;
  isEnrolled?: boolean;
  enrollmentStatus?: string | null;
}

// Test route to check course states
export const testPublicCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const allCourses = await Course.find().select('title state').lean();
    res.json({
      message: 'Course states',
      courses: allCourses
    });
  } catch (error) {
    console.error('Error in test route:', error);
    res.status(500).json({ message: 'Error in test route' });
  }
};

// Get all active public courses
export const getPublicCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log('Fetching public courses...');
    const courses = await Course.find({ state: CourseState.ACTIVE })
      .select('title description price thumbnail banner enrollmentCount')
      .lean();

    console.log('Found courses:', courses.length);

    // Transform courses to include enrollment status
    const publicCourses: PublicCourseResponse[] = courses.map(course => ({
      _id: course._id,
      title: course.title,
      description: course.description,
      price: course.price,
      thumbnail: course.thumbnail,
      banner: course.banner,
      enrollmentCount: course.enrollmentCount,
      isEnrolled: false, // Default value
      enrollmentStatus: null // Default value
    }));

    // If user is authenticated, check their enrollment status
    if ((req as AuthRequest).user) {
      console.log('User is authenticated, checking enrollments...');
      const userEnrollments = await Enrollment.find({
        student: (req as AuthRequest).user!._id,
        course: { $in: publicCourses.map(course => course._id) }
      }).select('course status');

      const enrolledCourseIds = new Set(
        userEnrollments.map(e => e.course.toString())
      );
      
      publicCourses.forEach(course => {
        course.isEnrolled = enrolledCourseIds.has(course._id.toString());
        const enrollment = userEnrollments.find(e => e.course.toString() === course._id.toString());
        if (enrollment) {
          course.enrollmentStatus = enrollment.status;
        }
      });
    }

    res.json(publicCourses);
  } catch (error) {
    console.error('Error fetching public courses:', error);
    res.status(500).json({ message: 'Error fetching courses' });
  }
};

// Interface for public course detail response
interface PublicCourseDetailResponse {
  _id: Types.ObjectId;
  title: string;
  description: string;
  price: number;
  thumbnail?: string;
  banner?: string;
  enrollmentCount: number;
  modules: {
    _id: Types.ObjectId;
    title: string;
    description: string;
    order: number;
    lessons: {
      _id: Types.ObjectId;
      title: string;
      description: string;
      order: number;
      duration?: number;
      isPreview: boolean;
    }[];
  }[];
  enrollmentStatus?: string | null;
  noticeBoard: string[];
}

// Get public course details
export const getPublicCourseDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { courseId } = req.params;

    const course = await Course.findOne({
      _id: courseId,
      state: CourseState.ACTIVE
    }).populate({
      path: 'modules',
      select: 'title description order',
      populate: {
        path: 'lessons',
        select: 'title description order duration isPreview'
      }
    });

    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    // Check if user is enrolled
    let enrollmentStatus = null;
    if ((req as AuthRequest).user) {
      const enrollment = await Enrollment.findOne({
        student: (req as AuthRequest).user!._id,
        course: courseId
      }).select('status');
      
      if (enrollment) {
        enrollmentStatus = enrollment.status;
      }
    }

    // Format response
    const response: PublicCourseDetailResponse = {
      _id: course._id,
      title: course.title,
      description: course.description,
      price: course.price,
      thumbnail: course.thumbnail,
      banner: course.banner,
      enrollmentCount: course.enrollmentCount,
      modules: course.modules.map(module => ({
        _id: module._id,
        title: module.title,
        description: module.description,
        order: module.order,
        lessons: module.lessons
          .filter(lesson => lesson.isPreview || enrollmentStatus === 'approved')
          .map(lesson => ({
            _id: lesson._id,
            title: lesson.title,
            description: lesson.description,
            order: lesson.order,
            duration: lesson.duration,
            isPreview: lesson.isPreview
          }))
      })),
      enrollmentStatus,
      noticeBoard: course.noticeBoard
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching course details:', error);
    res.status(500).json({ message: 'Error fetching course details' });
  }
};
