import { Request, Response } from 'express';
import { Course, IModuleDocument, ILessonDocument, ILessonData } from '../models/Course';
import { AuthRequest } from '../middleware/auth';
import { validateLesson } from '../validators/courseValidator';
import path from 'path';
import fs from 'fs';

// Add lesson to a module
export const addLesson = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const { courseId, moduleId } = req.params;
    const file = req.file;
    
    console.log('Request file:', file);
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    
    // Log more details about the files
    if (req.files && typeof req.files === 'object' && !Array.isArray(req.files)) {
      console.log('Files object keys:', Object.keys(req.files));
      const videoFiles = req.files['video'];
      if (videoFiles && Array.isArray(videoFiles) && videoFiles.length > 0) {
        console.log('Video file details:', videoFiles[0]);
      }
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    const module = course.modules.id(moduleId) as IModuleDocument | null;
    if (!module) {
      res.status(404).json({ message: 'Module not found' });
      return;
    }

    // Get the video file from the files object
    let videoPath = undefined;
    if (req.files && typeof req.files === 'object' && !Array.isArray(req.files)) {
      const videoFiles = req.files['video'];
      if (videoFiles && Array.isArray(videoFiles) && videoFiles.length > 0) {
        videoPath = videoFiles[0].path;
        console.log('Setting video path to:', videoPath);
      }
    } else if (file) {
      // Fallback to single file upload
      videoPath = file.path;
      console.log('Setting video path from single file to:', videoPath);
    }
    
    // Create lesson data object with basic fields
    const lessonData: ILessonData = {
      title: req.body.title,
      description: req.body.description,
      order: module.lessons.length,
      duration: req.body.duration ? parseInt(req.body.duration) : undefined,
      attachments: [],
      isPreview: req.body.isPreview === 'true'
    };
    
    // Handle video file upload
    if (videoPath) {
      lessonData.video = videoPath;
    }
    
    // Handle attachment files upload
    if (req.files && typeof req.files === 'object' && !Array.isArray(req.files)) {
      const attachmentFiles = req.files['attachments'];
      if (attachmentFiles && Array.isArray(attachmentFiles) && attachmentFiles.length > 0) {
        // Add each attachment path to the lesson data
        attachmentFiles.forEach(file => {
          lessonData.attachments.push(file.path);
          console.log('Added attachment path:', file.path);
        });
      }
    }
    
    // Validate that at least one of video or attachments is provided
    if (!videoPath && lessonData.attachments.length === 0) {
      res.status(400).json({ message: 'Either a video or at least one attachment is required' });
      return;
    }
    
    console.log('Created lesson data with video path:', lessonData.video);
    console.log('Created lesson data with attachments:', lessonData.attachments);
    console.log('Full lesson data:', lessonData);

    const { error } = validateLesson(lessonData);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    module.lessons.push(lessonData);
    await course.save();

    res.status(201).json({ message: 'Lesson added successfully', lesson: lessonData });
  } catch (error) {
    console.error('Error adding lesson:', error);
    res.status(500).json({ message: 'Error adding lesson', error });
  }
};

// Remove lesson from a module
export const removeLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, moduleId, lessonId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    const module = course.modules.id(moduleId) as IModuleDocument | null;
    if (!module) {
      res.status(404).json({ message: 'Module not found' });
      return;
    }

    const lessonIndex = module.lessons.findIndex(
      lesson => lesson._id.toString() === lessonId
    );

    if (lessonIndex === -1) {
      res.status(404).json({ message: 'Lesson not found' });
      return;
    }

    // Remove the lesson
    module.lessons.splice(lessonIndex, 1);

    // Reorder remaining lessons
    module.lessons.forEach((lesson, index) => {
      lesson.order = index;
    });

    await course.save();
    res.status(200).json({ message: 'Lesson removed successfully' });
  } catch (error) {
    console.error('Error removing lesson:', error);
    res.status(500).json({ message: 'Error removing lesson', error });
  }
};

// Update lesson details
export const updateLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, moduleId, lessonId } = req.params;
    const file = req.file;
    
    console.log('Update lesson request file:', file);
    console.log('Update lesson request body:', req.body);
    console.log('Update lesson request files:', req.files);

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

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

    // Update lesson fields
    if (req.body.title) lesson.title = req.body.title;
    if (req.body.description) lesson.description = req.body.description;
    if (req.body.duration) {
      lesson.duration = parseInt(req.body.duration);
    }
    
    // Handle traditional video file upload
    if (req.files && typeof req.files === 'object' && !Array.isArray(req.files)) {
      const videoFiles = req.files['video'];
      if (videoFiles && Array.isArray(videoFiles) && videoFiles.length > 0) {
        const videoPath = videoFiles[0].path;
        console.log('Setting video path to:', videoPath);
        lesson.video = videoPath;
      }
    } else if (file) {
      // Fallback to single file upload
      console.log('Setting video path from single file to:', file.path);
      lesson.video = file.path;
    }
    
    if (typeof req.body.isPreview === 'boolean') {
      lesson.isPreview = req.body.isPreview;
    }

    const { error } = validateLesson(lesson);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    await course.save();
    res.status(200).json({ message: 'Lesson updated successfully', lesson });
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ message: 'Error updating lesson', error });
  }
};

// Get lesson details
export const getLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, moduleId, lessonId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

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

    res.status(200).json(lesson);
  } catch (error) {
    console.error('Error getting lesson:', error);
    res.status(500).json({ message: 'Error getting lesson', error });
  }
};

// Add notice to course
export const addNotice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { notice } = req.body;

    if (!notice || typeof notice !== 'string' || notice.trim().length === 0) {
      res.status(400).json({ message: 'Notice text is required' });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    course.noticeBoard.push(notice.trim());
    await course.save();

    res.status(201).json({ message: 'Notice added successfully' });
  } catch (error) {
    console.error('Error adding notice:', error);
    res.status(500).json({ message: 'Error adding notice', error });
  }
};

// Remove notice from course
export const removeNotice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { noticeIndex } = req.body;

    if (typeof noticeIndex !== 'number' || noticeIndex < 0) {
      res.status(400).json({ message: 'Valid notice index is required' });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    if (noticeIndex >= course.noticeBoard.length) {
      res.status(404).json({ message: 'Notice not found' });
      return;
    }

    course.noticeBoard.splice(noticeIndex, 1);
    await course.save();

    res.status(200).json({ message: 'Notice removed successfully' });
  } catch (error) {
    console.error('Error removing notice:', error);
    res.status(500).json({ message: 'Error removing notice', error });
  }
};

// View PDF lesson attachment in browser (for enrolled students)
export const viewPdfAttachment = async (req: Request, res: Response): Promise<void> => {
  console.log("Request received to view PDF");
  try {
    const { courseId, moduleId, lessonId } = req.params;
    
    console.log(`Attempting to view PDF: courseId=${courseId}, moduleId=${moduleId}, lessonId=${lessonId}`);

    const course = await Course.findById(courseId);
    if (!course) {
      console.log(`Course not found: ${courseId}`);
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    const module = course.modules.id(moduleId) as IModuleDocument | null;
    if (!module) {
      console.log(`Module not found: ${moduleId}`);
      res.status(404).json({ message: 'Module not found' });
      return;
    }

    const lesson = module.lessons.id(lessonId) as ILessonDocument | null;
    if (!lesson) {
      console.log(`Lesson not found: ${lessonId}`);
      res.status(404).json({ message: 'Lesson not found' });
      return;
    }

    console.log(`Lesson found. Attachments: ${JSON.stringify(lesson.attachments)}`);

    if (!lesson.attachments || lesson.attachments.length === 0) {
      console.log('No attachments found for this lesson');
      res.status(404).json({ message: 'No attachments found for this lesson' });
      return;
    }

    // Always use the first attachment
    const attachmentPath = lesson.attachments[0];
    console.log(`Attachment path: ${attachmentPath}`);
    // Make sure we have the full path
    const fullPath = path.isAbsolute(attachmentPath) 
      ? attachmentPath 
      : path.join(__dirname, '../../', attachmentPath);
    
    console.log(`Full attachment path: ${fullPath}`);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`Attachment file not found at path: ${fullPath}`);
      res.status(404).json({ message: 'Attachment file not found' });
      return;
    }

    const filename = path.basename(fullPath);
    const fileExtension = path.extname(fullPath).toLowerCase();
    
    // Check if the file is a PDF
    if (fileExtension !== '.pdf') {
      console.log(`File is not a PDF: ${fileExtension}`);
      res.status(400).json({ message: 'This endpoint is only for viewing PDF files' });
      return;
    }
    
    console.log(`Serving PDF file: ${filename} for inline viewing`);
    
    // Set headers for inline viewing in browser
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');
    
    // Add cache control headers for better performance
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    
    // Add CORS headers to allow embedding in iframe
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    
    // Add Content-Security-Policy to help hide PDF viewer controls
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'none'; object-src 'self'");
    
    const fileStream = fs.createReadStream(fullPath);
    fileStream.on('error', (err) => {
      console.error(`Error reading file stream: ${err.message}`);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error streaming file' });
      }
    });
    
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error viewing PDF attachment:', error);
    res.status(500).json({ message: 'Error viewing PDF attachment', error });
  }
};
