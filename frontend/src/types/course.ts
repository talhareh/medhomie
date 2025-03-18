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

// Alias for Lesson interface used in LessonForm component
export type ILessonData = Lesson;

export interface Module {
  _id?: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  slug: string;
  parent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
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
  categories: Category[];
  tags: Tag[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Filters {
  search?: string;
  state?: CourseState;
  category?: string;
  tag?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}
