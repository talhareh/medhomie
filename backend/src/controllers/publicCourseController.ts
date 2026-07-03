import { Request, Response } from 'express';
import { Course, ICourseDocument } from '../models/Course';
import { Enrollment, EnrollmentStatus } from '../models/Enrollment';
import { CourseState } from '../models/Course';
import { AuthRequest } from '../middleware/auth';
import { Types } from 'mongoose';

/** Normalize Express `req.query` id (string | string[] | ParsedQs) to a single ObjectId. */
function parseObjectIdFromQuery(raw: unknown): Types.ObjectId | null {
  if (raw === undefined || raw === null) return null;
  const first = Array.isArray(raw) ? raw[0] : raw;
  if (typeof first !== 'string' || !first.trim()) return null;
  const id = first.trim();
  if (!Types.ObjectId.isValid(id)) return null;
  return new Types.ObjectId(id);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Interface for public course response
interface PublicCourseResponse {
  _id: Types.ObjectId;
  title: string;
  description: string;
  price: number;
  thumbnail?: string;
  banner?: string;
  enrollmentCount: number;
  categories?: any[];
  tags?: any[];
  isEnrolled?: boolean;
  enrollmentStatus?: string | null;
  /** Included for authenticated users (e.g. student dashboard notices) */
  noticeBoard?: string[];
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

    const categoryId = parseObjectIdFromQuery(req.query.category);
    const search =
      typeof req.query.search === 'string' ? req.query.search.trim() : '';

    const conditions: Record<string, unknown>[] = [{ state: CourseState.ACTIVE }];

    if (categoryId) {
      conditions.push({ categories: { $in: [categoryId] } });
    }

    if (search) {
      const safe = escapeRegex(search);
      conditions.push({
        $or: [
          { title: { $regex: safe, $options: 'i' } },
          { description: { $regex: safe, $options: 'i' } }
        ]
      });
    }

    const filter =
      conditions.length === 1 ? conditions[0] : { $and: conditions };

    const courses = await Course.find(filter)
      .select('title description price thumbnail banner enrollmentCount categories tags noticeBoard')
      .populate('categories', 'name slug')
      .populate('tags', 'name slug')
      .sort({ createdAt: -1 })
      .lean();

    console.log('Found courses:', courses.length);

    const activeEnrollmentCount = async (courseId: Types.ObjectId) =>
      Enrollment.countDocuments({
        course: courseId,
        status: EnrollmentStatus.APPROVED,
        isExpired: { $ne: true }
      });

    const publicCourses: PublicCourseResponse[] = await Promise.all(
      courses.map(async (course) => ({
        _id: course._id,
        title: course.title,
        description: course.description,
        price: course.price,
        thumbnail: course.thumbnail,
        banner: course.banner,
        enrollmentCount: await activeEnrollmentCount(course._id as Types.ObjectId),
        categories: (course as any).categories || [],
        tags: (course as any).tags || [],
        noticeBoard: Array.isArray((course as any).noticeBoard) ? (course as any).noticeBoard : [],
        isEnrolled: false,
        enrollmentStatus: null as string | null
      }))
    );

    if ((req as AuthRequest).user) {
      console.log('User is authenticated, checking enrollments...');
      const userEnrollments = await Enrollment.find({
        student: (req as AuthRequest).user!._id,
        course: { $in: publicCourses.map((course) => course._id) }
      }).select('course status isExpired');

      publicCourses.forEach((course) => {
        const enrollment = userEnrollments.find(
          (e) => e.course.toString() === course._id.toString()
        );
        if (!enrollment) {
          return;
        }
        course.enrollmentStatus = enrollment.status;
        if (
          enrollment.status === EnrollmentStatus.REJECTED ||
          enrollment.status === EnrollmentStatus.WITHDRAWN
        ) {
          course.isEnrolled = false;
        } else {
          const hasAccess =
            enrollment.status === EnrollmentStatus.APPROVED &&
            enrollment.isExpired !== true;
          const isPending = enrollment.status === EnrollmentStatus.PENDING;
          course.isEnrolled = hasAccess || isPending;
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
        video?: string;
        isAccessible: boolean;
        pdfUrl?: string;
        ebookName?: string;
      }[];
  }[];
  enrollmentStatus?: string | null;
  noticeBoard: string[];
}

const publicCourseDetailPopulate = {
  path: 'modules' as const,
  select: 'title description order',
  populate: {
    path: 'lessons',
    select: 'title description order duration isPreview video pdfUrl ebookName'
  }
};

// Get public course details
export const getPublicCourseDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { courseId } = req.params;
    const authReq = req as AuthRequest;

    let course = await Course.findOne({
      _id: courseId,
      state: CourseState.ACTIVE
    }).populate(publicCourseDetailPopulate);

    if (!course) {
      if (!authReq.user) {
        res.status(404).json({ message: 'Course not found' });
        return;
      }

      const inactiveCourse = await Course.findOne({
        _id: courseId,
        state: CourseState.INACTIVE
      }).populate(publicCourseDetailPopulate);

      if (!inactiveCourse) {
        res.status(404).json({ message: 'Course not found' });
        return;
      }

      const gateEnrollment = await Enrollment.findOne({
        student: authReq.user._id,
        course: courseId
      }).select('status isExpired expirationDate');

      const nowGate = new Date();
      const withinGate =
        !gateEnrollment?.expirationDate || gateEnrollment.expirationDate > nowGate;
      const allowedInactive =
        !!gateEnrollment &&
        gateEnrollment.status === EnrollmentStatus.APPROVED &&
        gateEnrollment.isExpired !== true &&
        withinGate;

      if (!allowedInactive) {
        res.status(404).json({ message: 'Course not found' });
        return;
      }

      course = inactiveCourse;
    }

    let enrollmentStatus: string | null = null;
    let hasContentAccess = false;
    if (authReq.user) {
      const enrollment = await Enrollment.findOne({
        student: authReq.user._id,
        course: courseId
      }).select('status isExpired expirationDate');

      if (enrollment) {
        enrollmentStatus = enrollment.status;
        const now = new Date();
        const withinWindow =
          !enrollment.expirationDate || enrollment.expirationDate > now;
        hasContentAccess =
          enrollment.status === EnrollmentStatus.APPROVED &&
          enrollment.isExpired !== true &&
          withinWindow;
      }
    }

    const response: PublicCourseDetailResponse = {
      _id: course._id,
      title: course.title,
      description: course.description,
      price: course.price,
      thumbnail: course.thumbnail,
      banner: course.banner,
      enrollmentCount: await Enrollment.countDocuments({
        course: course._id,
        status: EnrollmentStatus.APPROVED,
        isExpired: { $ne: true }
      }),
      modules: course.modules.map(module => ({
        _id: module._id,
        title: module.title,
        description: module.description,
        order: module.order,
        lessons: module.lessons.map(lesson => ({
          _id: lesson._id,
          title: lesson.title,
          description: lesson.description,
          order: lesson.order,
          duration: lesson.duration,
          isPreview: lesson.isPreview,
          video: lesson.video,
          isAccessible: lesson.isPreview || hasContentAccess,
          pdfUrl: lesson.pdfUrl,
          ebookName: lesson.ebookName
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
