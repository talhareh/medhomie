import mongoose, { Document, Schema, Types } from 'mongoose';
import { UserRole } from './User';

export enum CourseState {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

// Base interfaces for data
export interface ILessonData {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  order: number;
  duration?: number;
  video?: string;
  attachments: string[];
  isPreview: boolean;
}

export interface IModuleData {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  order: number;
  lessons: ILessonData[];
}

export interface ICourseData {
  title: string;
  description: string;
  price: number;
  thumbnail?: string;
  banner?: string;
  state: CourseState;
  modules: IModuleData[];
  noticeBoard: string[];
  enrollmentCount: number;
  createdBy: Types.ObjectId | string;
}

// Mongoose Document interfaces
export interface ILessonDocument extends Omit<ILessonData, '_id'>, Document {
  _id: Types.ObjectId;
}

export interface IModuleDocument extends Omit<IModuleData, '_id' | 'lessons'>, Document {
  _id: Types.ObjectId;
  lessons: Types.DocumentArray<ILessonDocument>;
}

export interface ICourseDocument extends Omit<ICourseData, 'modules' | 'createdBy'>, Document {
  _id: Types.ObjectId;
  modules: Types.DocumentArray<IModuleDocument>;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new Schema<ILessonDocument>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, required: true },
  duration: { type: Number },
  video: { type: String },
  attachments: [{ type: String }],
  isPreview: { type: Boolean, default: false }
}, { _id: true });

const moduleSchema = new Schema<IModuleDocument>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, required: true },
  lessons: [lessonSchema]
}, { _id: true });

const courseSchema = new Schema<ICourseDocument>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  thumbnail: { type: String },
  banner: { type: String },
  state: { 
    type: String, 
    enum: Object.values(CourseState),
    default: CourseState.DRAFT,
    required: true 
  },
  modules: [moduleSchema],
  noticeBoard: [{ type: String }],
  enrollmentCount: { type: Number, default: 0 },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function(userId: Types.ObjectId) {
        const User = mongoose.model('User');
        const user = await User.findById(userId);
        return user && (user.role === UserRole.ADMIN || user.role === UserRole.INSTRUCTOR);
      },
      message: 'Course can only be created by an admin or instructor'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total lessons count
courseSchema.virtual('totalLessons').get(function(this: ICourseDocument) {
  return this.modules?.reduce((total, module) => total + (module.lessons?.length || 0), 0) || 0;
});

// Virtual for total duration
courseSchema.virtual('totalDuration').get(function(this: ICourseDocument) {
  return this.modules?.reduce((total, module) => {
    return total + (module.lessons?.reduce((moduleTotal, lesson) => moduleTotal + (lesson.duration || 0), 0) || 0);
  }, 0) || 0;
});

export const Course = mongoose.model<ICourseDocument>('Course', courseSchema);
