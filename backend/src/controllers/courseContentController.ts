import { Request, Response } from 'express';
import { Course, IModuleDocument, ILessonDocument, ILessonData } from '../models/Course';
import { AuthRequest } from '../middleware/auth';
import { validateLesson } from '../validators/courseValidator';

// Helper function to validate BunnyCDN Video IDs
const validateBunnyCDNVideoId = (videoId: string): boolean => {
  // Bunny CDN video IDs are GUIDs in the format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const bunnyVideoIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return bunnyVideoIdPattern.test(videoId);
};

// Add lesson to a module
export const addLesson = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const { courseId, moduleId } = req.params;
    // Remove file upload logic for video
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);

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

    // Create lesson data object with basic fields
    const lessonData: ILessonData = {
      title: req.body.title,
      description: '', // Default empty description
      order: req.body.order ? parseInt(req.body.order) : module.lessons.length + 1,
      duration: req.body.duration ? parseInt(req.body.duration) : undefined,
      attachments: [], // Keep empty array for compatibility
      isPreview: req.body.isPreview === 'true'
    };

    // Accept video source and video ID/URL
    if (req.body.videoSource) {
      lessonData.videoSource = req.body.videoSource;
    }
    if (req.body.video) {
      lessonData.video = req.body.video;
    }

    // Validate video source and video ID format - REJECT full URLs
    if (lessonData.video && lessonData.videoSource) {
      // Reject any video that looks like a URL (contains slashes or dots)
      if (lessonData.video.includes('/') || lessonData.video.includes('.')) {
        res.status(400).json({ 
          message: 'Invalid video format. Only video IDs are allowed, not full URLs. Please use the video ID from your CDN dashboard.' 
        });
        return;
      }

      if (lessonData.videoSource === 'bunnycdn') {
        if (!validateBunnyCDNVideoId(lessonData.video)) {
          res.status(400).json({ 
            message: 'Invalid BunnyCDN video ID format. Should be a valid GUID (e.g., 9b7d3c2a-4e5f-6a7b-8c9d-0e1f2a3b4c5d).' 
          });
          return;
        }
      }
    }

    // Accept PDF URL
    if (req.body.pdfUrl) {
      lessonData.pdfUrl = req.body.pdfUrl;
    }

    // Accept ebook name
    if (req.body.ebookName) {
      lessonData.ebookName = req.body.ebookName;
    }

    // Validate that at least one of video or pdfUrl is provided
    if (!lessonData.video && !lessonData.pdfUrl) {
      res.status(400).json({ message: 'Either a video or PDF URL is required' });
      return;
    }

    console.log('Created lesson data with video ID:', lessonData.video);
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
    // Remove file upload logic for video
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

    const existingLesson = module.lessons.id(lessonId) as ILessonDocument | null;
    if (!existingLesson) {
      res.status(404).json({ message: 'Lesson not found' });
      return;
    }

    // Create a new lesson object with updated fields
    const updatedLessonData = {
      title: req.body.title || existingLesson.title,
      description: existingLesson.description, // Keep existing description (not editable)
      order: req.body.order ? parseInt(req.body.order) : existingLesson.order,
      duration: req.body.duration ? parseInt(req.body.duration) : existingLesson.duration,
      video: req.body.video || existingLesson.video,
      videoSource: req.body.videoSource || existingLesson.videoSource,
      attachments: [...(existingLesson.attachments || [])],
      pdfUrl: req.body.pdfUrl !== undefined ? req.body.pdfUrl : existingLesson.pdfUrl,
      ebookName: req.body.ebookName !== undefined ? req.body.ebookName : existingLesson.ebookName,
      isPreview: typeof req.body.isPreview === 'boolean' ? req.body.isPreview : existingLesson.isPreview
    };

    // Validate video source and video ID format for updates - REJECT full URLs
    if (updatedLessonData.video && updatedLessonData.videoSource) {
      // Reject any video that looks like a URL (contains slashes or dots)
      if (updatedLessonData.video.includes('/') || updatedLessonData.video.includes('.')) {
        res.status(400).json({ 
          message: 'Invalid video format. Only video IDs are allowed, not full URLs. Please use the video ID from your CDN dashboard.' 
        });
        return;
      }

      if (updatedLessonData.videoSource === 'bunnycdn') {
        if (!validateBunnyCDNVideoId(updatedLessonData.video)) {
          res.status(400).json({ 
            message: 'Invalid BunnyCDN video ID format. Should be a valid GUID (e.g., 9b7d3c2a-4e5f-6a7b-8c9d-0e1f2a3b4c5d).' 
          });
          return;
        }
      }
    }

    // Handle PDF URL - replace existing PDF if new one is provided
    if (req.body.pdfUrl !== undefined) {
      updatedLessonData.pdfUrl = req.body.pdfUrl;
    }

    const { error } = validateLesson(updatedLessonData);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    // Remove the old lesson and add the updated one
    const lessonIndex = module.lessons.findIndex(l => l._id?.toString() === lessonId);
    if (lessonIndex !== -1) {
      module.lessons.splice(lessonIndex, 1, updatedLessonData);
    }

    await course.save();
    
    res.status(200).json({ message: 'Lesson updated successfully', lesson: updatedLessonData });
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
  const requestId = Math.random().toString(36).substr(2, 9);
  console.log(`🔍 BACKEND DEBUG [${requestId}] - PDF attachment request received`);
  
  try {
    const { courseId, moduleId, lessonId } = req.params;
    
    console.log(`🔍 BACKEND DEBUG [${requestId}] - Request details:`, {
      params: { courseId, moduleId, lessonId },
      method: req.method,
      url: req.originalUrl,
      headers: {
        userAgent: req.headers['user-agent'],
        accept: req.headers.accept,
        referer: req.headers.referer,
        contentType: req.headers['content-type']
      },
      query: req.query
    });
    
    console.log(`🔍 BACKEND DEBUG [${requestId}] - Attempting to find course: ${courseId}`);
    const course = await Course.findById(courseId);
    
    if (!course) {
      console.error(`❌ BACKEND DEBUG [${requestId}] - Course not found:`, {
        courseId,
        courseIdType: typeof courseId,
        courseIdLength: courseId?.length
      });
      res.status(404).json({ message: 'Course not found' });
      return;
    }
    
    console.log(`✅ BACKEND DEBUG [${requestId}] - Course found:`, {
      courseId: course._id,
      courseTitle: course.title,
      moduleCount: course.modules?.length || 0,
      moduleIds: course.modules?.map(m => m._id?.toString()) || []
    });

    console.log(`🔍 BACKEND DEBUG [${requestId}] - Attempting to find module: ${moduleId}`);
    const module = course.modules.id(moduleId) as IModuleDocument | null;
    
    if (!module) {
      console.error(`❌ BACKEND DEBUG [${requestId}] - Module not found:`, {
        moduleId,
        moduleIdType: typeof moduleId,
        moduleIdLength: moduleId?.length,
        availableModules: course.modules?.map(m => ({
          id: m._id?.toString(),
          title: m.title
        })) || []
      });
      res.status(404).json({ message: 'Module not found' });
      return;
    }
    
    console.log(`✅ BACKEND DEBUG [${requestId}] - Module found:`, {
      moduleId: module._id,
      moduleTitle: module.title,
      lessonCount: module.lessons?.length || 0,
      lessonIds: module.lessons?.map(l => l._id?.toString()) || []
    });

    console.log(`🔍 BACKEND DEBUG [${requestId}] - Attempting to find lesson: ${lessonId}`);
    const lesson = module.lessons.id(lessonId) as ILessonDocument | null;
    
    if (!lesson) {
      console.error(`❌ BACKEND DEBUG [${requestId}] - Lesson not found:`, {
        lessonId,
        lessonIdType: typeof lessonId,
        lessonIdLength: lessonId?.length,
        availableLessons: module.lessons?.map(l => ({
          id: l._id?.toString(),
          title: l.title
        })) || []
      });
      res.status(404).json({ message: 'Lesson not found' });
      return;
    }
    
    console.log(`✅ BACKEND DEBUG [${requestId}] - Lesson found:`, {
      lessonId: lesson._id,
      lessonTitle: lesson.title,
      pdfUrl: lesson.pdfUrl
    });

    if (!lesson.pdfUrl) {
      console.error(`❌ BACKEND DEBUG [${requestId}] - No PDF URL found:`, {
        lessonId: lesson._id,
        lessonTitle: lesson.title
      });
      res.status(404).json({ message: 'No PDF URL found for this lesson' });
      return;
    }

    const pdfUrl = lesson.pdfUrl;
    console.log(`🔍 BACKEND DEBUG [${requestId}] - Processing PDF URL:`, {
      url: pdfUrl,
      urlType: typeof pdfUrl,
      isHttpsUrl: pdfUrl.startsWith('https://'),
      isHttpUrl: pdfUrl.startsWith('http://')
    });
    
    // Check if this is an HTTPS URL (Bunny CDN or other CDN)
    if (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://')) {
      console.log(`🔍 BACKEND DEBUG [${requestId}] - HTTPS URL detected, redirecting:`, {
        url: pdfUrl
      });
      
      // Redirect to the URL
      res.redirect(pdfUrl);
      return;
    }
    
    // Only HTTPS URLs are supported
    console.error(`❌ BACKEND DEBUG [${requestId}] - Non-HTTPS URL detected (local files no longer supported):`, {
      pdfUrl,
      message: 'Only HTTPS URLs are supported'
    });
    
    res.status(400).json({ 
      message: 'Invalid PDF URL - only HTTPS URLs are supported',
      receivedUrl: pdfUrl 
    });
    return;

  } catch (error) {
    console.error(`❌ BACKEND DEBUG [${requestId}] - Server error:`, {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({ message: 'Error viewing PDF attachment', error });
  }
};

// Proxy PDF endpoint - serves PDF without exposing the actual URL
export const proxyPdf = async (req: Request, res: Response): Promise<void> => {
  try {
    const pdfUrl = req.query.url as string;
    
    if (!pdfUrl) {
      res.status(400).json({ message: 'PDF URL is required' });
      return;
    }

    // Validate URL is HTTPS
    if (!pdfUrl.startsWith('https://')) {
      res.status(400).json({ message: 'Only HTTPS URLs are allowed' });
      return;
    }

    // Fetch the PDF from the URL
    const response = await fetch(pdfUrl);
    
    if (!response.ok) {
      res.status(response.status).json({ message: 'Failed to fetch PDF' });
      return;
    }

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="document.pdf"');
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Stream the PDF to the client
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Error proxying PDF:', error);
    res.status(500).json({ message: 'Error proxying PDF', error });
  }
};

// Note: Cloudflare R2 upload function removed - using Bunny CDN for all media
