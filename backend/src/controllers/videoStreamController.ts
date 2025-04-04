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
    if (!lesson) {
      res.status(404).json({ message: 'Lesson not found' });
      return;
    }
    
    // TEMPORARY FIX: For testing, check if video exists in the expected location
    // even if the lesson.video field is not set
    const expectedVideoPath = `uploads/course-videos/${lesson._id}.mp4`;
    const fs = require('fs');
    
    // Log for debugging
    console.log('Checking for video at path:', expectedVideoPath);
    console.log('Lesson video field:', lesson.video);
    
    // Use the video field if it exists, otherwise use the expected path
    const videoPath = lesson.video || (fs.existsSync(expectedVideoPath) ? expectedVideoPath : null);
    
    if (!videoPath) {
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
    const absoluteVideoPath = path.resolve(videoPath);

    // Check if file exists
    if (!require('fs').existsSync(absoluteVideoPath)) {
      console.log('Video file not found at path:', absoluteVideoPath);
      res.status(404).json({ message: 'Video file not found' });
      return;
    }
    
    console.log('Video file found at path:', absoluteVideoPath);

    // Stream the video
    console.log('Streaming video from path:', absoluteVideoPath);
    streamVideo(absoluteVideoPath, req, res);
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
