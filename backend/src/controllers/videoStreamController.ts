import { Response } from 'express';
import { Course, ICourseDocument, IModuleDocument, ILessonDocument } from '../models/Course';
import { Enrollment, EnrollmentStatus } from '../models/Enrollment';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../models/User';
import { streamVideo } from '../utils/videoStreaming';
import path from 'path';

export const streamCourseVideo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId, moduleId, lessonId } = req.params;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    // Find the module and lesson
    const module = course.modules.id(moduleId) as IModuleDocument | null;
    if (!module) {
      res.status(404).json({ message: 'Module not found' });
      return;
    }

    const lesson = module.lessons.id(lessonId) as ILessonDocument | null;
    if (!lesson || !lesson.video) {
      res.status(404).json({ message: 'Video not found' });
      return;
    }

    // Check if user has access to the video
    const hasAccess = await checkVideoAccess(req.user._id, course, lesson.isPreview, req.user.role);
    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    // Get the absolute path of the video file
    const videoPath = path.resolve(lesson.video);

    // Check if file exists
    if (!require('fs').existsSync(videoPath)) {
      res.status(404).json({ message: 'Video file not found' });
      return;
    }

    // Stream the video
    streamVideo(videoPath, req, res);
  } catch (error) {
    console.error('Error streaming video:', error);
    res.status(500).json({ message: 'Error streaming video', error });
  }
};

const checkVideoAccess = async (
  userId: string,
  course: ICourseDocument,
  isPreview: boolean,
  userRole: UserRole
): Promise<boolean> => {
  // Course creator/admin always has access
  if (userRole === UserRole.ADMIN || course.createdBy.toString() === userId) {
    return true;
  }

  // If it's a preview video, everyone has access
  if (isPreview) {
    return true;
  }

  // Check if user is enrolled and approved for the course
  const enrollment = await Enrollment.findOne({
    student: userId,
    course: course._id,
    status: EnrollmentStatus.APPROVED
  });

  return !!enrollment;
};
