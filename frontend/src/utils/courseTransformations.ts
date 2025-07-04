// courseTransformations.ts - Utility functions for transforming course data
import { ApiCourse, MedicalCourse, Section, Attachment } from '../types/courseTypes';

/**
 * Transforms API course data to the internal format used by the UI
 */
export const transformCourse = (apiCourse: ApiCourse): MedicalCourse => {
  // Calculate total duration in hours
  const totalMinutes = apiCourse.modules.reduce((acc, module) => {
    return acc + module.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);
  }, 0);
  
  const totalHours = Math.floor(totalMinutes / 60);
  
  // Transform modules to sections
  const sections = apiCourse.modules
    .sort((a, b) => a.order - b.order)
    .map(module => {
      // Store the course ID in each section for correct PDF URL construction
      const lessons = module.lessons
        .sort((a, b) => a.order - b.order)
        .map(lesson => {
          // Process attachments to include filenames
          let processedAttachments: Attachment[] = [];
          if (lesson.attachments && lesson.attachments.length > 0) {
            // Map the attachments to include both the API path and the filename
            processedAttachments = lesson.attachments.map((path, index) => {
              let filename;
              let apiPath = path;
              
              // Check if the path is already an API path (which is what we're receiving from the backend)
              if (path.includes('/attachments/')) {
                // For API paths, we need to make a separate request to get the filename
                // For now, use a placeholder filename
                filename = `Attachment ${index + 1}.pdf`;
                
                // Remove /api prefix if it exists since axios already adds it
                if (path.startsWith('/api/')) {
                  apiPath = path.substring(4);
                }
              } else {
                // For direct file paths (which we're not currently receiving)
                // Extract filename from the original path stored in the database
                filename = path.split('/').pop() || `Attachment ${index + 1}`;
                // Create API path for the attachment
                apiPath = `/api/course-content/public/${apiCourse._id}/modules/${module._id}/lessons/${lesson._id}/attachments/${index}`;
              }
              
              console.log(`ATTACHMENT CHECK - Lesson: ${lesson.title}, Path: ${path}, Filename: ${filename}, API Path: ${apiPath}`);
              
              // Return the API path with metadata
              return {
                path: apiPath,
                filename: filename,
                originalPath: path
              };
            });
          }
          
          // Debug info for video paths
          console.log(`Processing lesson ${lesson.title}:`, {
            hasVideo: !!lesson.video,
            videoPath: lesson.video
          });
          
          // Determine the video URL
          let videoUrl = '';
          if (lesson.video) {
            videoUrl = `/stream/${apiCourse._id}/modules/${module._id}/lessons/${lesson._id}/stream`;
          }
          
          // TEMPORARY FIX: For testing purposes, assume all lessons have videos
          // In production, this should be fixed on the backend
          return {
            id: lesson._id,
            title: lesson.title,
            duration: `${lesson.duration || 0}min`,
            completed: false, // We'll need to fetch this from user progress
            type: (lesson.video ? 'video' : 'file') as 'video' | 'file',
            content: lesson.description,
            videoUrl: videoUrl,
            description: lesson.description,
            isPreview: lesson.isPreview,
            attachments: processedAttachments
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
