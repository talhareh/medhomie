// courseTypes.ts - Type definitions for course-related components
export type VideoCDNProvider = 'bunnycdn';

export interface ApiLesson {
  _id: string;
  title: string;
  description: string;
  order: number;
  duration?: number;
  video?: string; // Video ID from Bunny CDN
  videoSource?: VideoCDNProvider; // CDN provider: 'bunnycdn'
  attachments: string[];
  ebookName?: string;
  isPreview: boolean;
}

export interface ApiModule {
  _id: string;
  title: string;
  description: string;
  order: number;
  lessons: ApiLesson[];
}

export interface ApiCourse {
  _id: string;
  title: string;
  description: string;
  price: number;
  thumbnail?: string;
  banner?: string;
  enrollmentCount: number;
  modules: ApiModule[];
  enrollmentStatus?: string | null;
  noticeBoard: string[];
}

// Internal interfaces for the UI
export interface Attachment {
  path: string;
  filename: string;
  originalPath: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  type: 'video' | 'file' | 'quiz';
  content?: string;
  videoUrl?: string; // Video ID from Bunny CDN
  videoSource?: VideoCDNProvider; // CDN provider: 'bunnycdn'
  description: string;
  isPreview: boolean;
  attachments?: Attachment[]; // For PDF from pdfUrl (kept for compatibility)
  pdfUrl?: string; // PDF URL from Bunny CDN
  ebookName?: string; // Custom name for the PDF
  // Quiz-related fields
  quiz?: string; // Quiz ID if this lesson has an associated quiz
  quizCompleted?: boolean; // Whether the quiz has been completed
  quizScore?: number; // Quiz score if completed
}

export interface Section {
  id: string;
  courseId?: string; // The parent course ID (important for PDF URLs)
  title: string;
  duration: string;
  completedLessons: number;
  totalLessons: number;
  expanded: boolean;
  lessons: Lesson[];
  description: string;
}

export interface MedicalCourse {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  rating: number;
  ratingCount: number;
  lastUpdated: string;
  totalHours: number;
  studentsCount: number;
  sections: Section[];
  enrollmentStatus?: string | null;
  courseQuizzes?: any[]; // Course-level quizzes (not attached to specific lessons)
}