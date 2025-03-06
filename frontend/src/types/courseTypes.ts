// courseTypes.ts - Type definitions for course-related components
export interface ApiLesson {
  _id: string;
  title: string;
  description: string;
  order: number;
  duration?: number;
  video?: string;
  attachments: string[];
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
  videoUrl?: string;
  description: string;
  isPreview: boolean;
  attachments?: Attachment[];
}

export interface Section {
  id: string;
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
}
