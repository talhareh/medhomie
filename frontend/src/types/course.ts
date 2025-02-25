export enum CourseState {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export interface Lesson {
  _id?: string;
  title: string;
  description: string;
  order: number;
  duration?: number;
  video?: string;
  attachments: string[];
  isPreview: boolean;
}

export interface Module {
  _id?: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  thumbnail?: string;
  banner?: string;
  state: CourseState;
  modules: Module[];
  noticeBoard: string[];
  enrollmentCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Filters {
  search?: string;
  state?: CourseState;
  sortBy?: string;
  order?: 'asc' | 'desc';
}
