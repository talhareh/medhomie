// index.ts - Export all types for easier imports

// Auth types
export * from './auth';

// Course types - Export specific types to avoid conflicts
export { 
  CourseState, 
  Module, 
  Category, 
  Tag, 
  Course, 
  Filters,
  Lesson as CourseLesson 
} from './course';

export { 
  ApiLesson, 
  ApiModule, 
  ApiCourse, 
  Attachment, 
  Section, 
  MedicalCourse,
  Lesson as UILesson 
} from './courseTypes';

// Enrollment types
export * from './enrollment';

// Quiz types
export * from './quiz';

// WhatsApp types
export * from './whatsapp'; 