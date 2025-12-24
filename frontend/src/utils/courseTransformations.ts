// courseTransformations.ts - Utility functions for transforming course data
import { ApiCourse, MedicalCourse, Section, Attachment } from '../types/courseTypes';
import { getBunnyHlsUrl } from '../config/videoCDN';

/**
 * Transforms API course data to the internal format used by the UI
 */
export const transformCourse = (apiCourse: ApiCourse, quizzes: any[] = []): MedicalCourse => {
  // Calculate total duration in hours
  const totalMinutes = apiCourse.modules.reduce((acc, module) => {
    return acc + module.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);
  }, 0);
  
  const totalHours = Math.floor(totalMinutes / 60);
  
  // Transform modules to sections
  const sections = apiCourse.modules
    .sort((a, b) => a.order - b.order)
    .map(module => {
      const lessons = module.lessons
        .sort((a, b) => a.order - b.order)
        .map(lesson => {
          // Process PDF URL - convert to attachment format for compatibility
          let processedAttachments: Attachment[] = [];
          
          if (lesson.pdfUrl) {
            // Extract filename from URL
            const extractFilename = (url: string): string => {
              // If ebookName is provided, use it
              if (lesson.ebookName) {
                return lesson.ebookName;
              }
              
              try {
                // Try to extract filename from URL path
                const urlPath = new URL(url).pathname;
                const filename = urlPath.split('/').pop();
                
                // If we found a filename with extension, use it
                if (filename && filename.includes('.')) {
                  return filename;
                }
                
                // Fallback to generic name
                return 'Lesson PDF.pdf';
              } catch (error) {
                // If URL parsing fails, use fallback
                return 'Lesson PDF.pdf';
              }
            };
            
            processedAttachments = [{
              path: lesson.pdfUrl,
              filename: extractFilename(lesson.pdfUrl),
              originalPath: lesson.pdfUrl
            }];
          }
          
          // For video URLs, pass them directly to the HLS player
          // The video field now contains either Cloudflare HLS URLs or BunnyCDN HLS URLs
          
          // Find quiz for this lesson
          const lessonQuiz = quizzes.find(quiz => {
            if (!quiz.lesson) return false; // Skip quizzes without lesson assignment
            
            // Handle different possible formats for lesson ID comparison
            const quizLessonId = typeof quiz.lesson === 'object' ? quiz.lesson._id || quiz.lesson.toString() : quiz.lesson.toString();
            const currentLessonId = lesson._id.toString();
            
            return quizLessonId === currentLessonId;
          });
          
          // Determine lesson type with quiz support
          const lessonType: 'video' | 'file' | 'quiz' = (() => {
            // If lesson has a quiz and no other primary content, it's a quiz lesson
            if (lessonQuiz && !lesson.video && !lesson.pdfUrl) {
              return 'quiz';
            }
            // Preserve existing logic: video takes priority, then file
            if (lesson.video) {
              return 'video';
            }
            // Default to file for lessons with PDF or no content
            return 'file';
          })();
          
          // Debug logging for videoSource
          if (lesson.title === 'Test Bunny 1') {
            console.log('🔍 DEBUG: Processing Test Bunny 1 lesson in transformation:', {
              lessonId: lesson._id,
              title: lesson.title,
              video: lesson.video,
              videoSource: lesson.videoSource,
              hasVideoSource: !!lesson.videoSource
            });
          }

          const rawVideoId = lesson.video || '';
          const isLikelyBunnyId = !!rawVideoId && !rawVideoId.startsWith('http');
          const resolvedVideoSource = lesson.videoSource || (isLikelyBunnyId ? 'bunnycdn' : undefined);

          const resolvedVideoUrl = (() => {
            if (!rawVideoId) return undefined;
            if (resolvedVideoSource === 'bunnycdn') {
              return getBunnyHlsUrl(rawVideoId);
            }
            return rawVideoId;
          })();

          return {
            id: lesson._id,
            title: lesson.title,
            duration: `${lesson.duration || 0}min`,
            completed: false, // We'll need to fetch this from user progress
            type: lessonType, // Use the determined type
            content: lesson.description,
            videoUrl: resolvedVideoUrl, // Resolved playable URL
            videoSource: resolvedVideoSource, // Inferred CDN provider
            description: lesson.description,
            isPreview: lesson.isPreview,
            attachments: processedAttachments, // Contains PDF from pdfUrl if available
            pdfUrl: lesson.pdfUrl, // Also include pdfUrl directly for easy access
            quiz: lessonQuiz ? (lessonQuiz._id || lessonQuiz.id) : undefined, // Handle both _id and id fields
            quizCompleted: false, // TODO: Fetch from user progress
            quizScore: undefined // TODO: Fetch from user progress
          };
        });
      
      return {
        id: module._id,
        courseId: apiCourse._id, // Add the course ID to each section for correct PDF URL construction
        title: module.title,
        description: module.description,
        duration: `${module.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0)}min`,
        completedLessons: 0, // We'll need to fetch this from user progress
        totalLessons: lessons.length,
        expanded: false, // Default to collapsed
        lessons
      };
    });
  
  return {
    _id: apiCourse._id,
    title: apiCourse.title,
    description: apiCourse.description,
    instructor: 'Course Instructor', // This would come from the API
    rating: 0, // This would come from the API
    ratingCount: 0, // This would come from the API
    lastUpdated: new Date().toLocaleDateString(),
    totalHours,
    studentsCount: apiCourse.enrollmentCount,
    sections,
    enrollmentStatus: apiCourse.enrollmentStatus
  };
};

/**
 * Finds the module ID for a given lesson ID
 */
export const findModuleIdForLesson = (sections: Section[], lessonId: string): string | null => {
  for (const section of sections) {
    for (const lesson of section.lessons) {
      if (lesson.id === lessonId) {
        return section.id;
      }
    }
  }
  return null;
};