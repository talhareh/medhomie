import { Response } from 'express';
import { Course } from '../models/Course';
import { Enrollment, EnrollmentStatus } from '../models/Enrollment';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../models/User';
import { streamVideo } from '../utils/videoStreaming';
import path from 'path';

export const streamCourseVideo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId, contentId } = req.params;

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

    // Find the specific content item
    const content = course.content.find((item) => item._id?.toString() === contentId);
    if (!content || !content.video) {
      res.status(404).json({ message: 'Video content not found' });
      return;
    }
    // Check if user has access to the video
    const hasAccess = await checkVideoAccess(req.user._id, course, req.user.role);
    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    // Get the absolute path of the video file
    const videoPath = path.resolve(content.video);

    // Check if file exists
    if (!require('fs').existsSync(videoPath)) {
      res.status(404).json({ message: 'Video file not found' });
      return;
    }

    // Stream the video
    streamVideo(videoPath, req, res);
  } catch (error) {
    res.status(500).json({ message: 'Error streaming video', error });
  }
};

async function checkVideoAccess(
  userId: string,
  course: any,
  userRole: UserRole
): Promise<boolean> {
  // Admin and course instructor always have access
  if (userRole === UserRole.ADMIN || course.instructor.toString() === userId) {
    return true;
  }

  // For students, check if they are enrolled and approved
  if (userRole === UserRole.STUDENT) {
    const enrollment = await Enrollment.findOne({
      student: userId,
      course: course._id,
      status: EnrollmentStatus.APPROVED
    });
    return !!enrollment;
  }

  return false;
}
