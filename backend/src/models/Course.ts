import mongoose, { Document, Schema, Types } from 'mongoose';
import { UserRole } from './User';

export interface IContent {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  video?: string;
  attachments: string[];
}

export interface ICourse extends Document {
  title: string;
  description: string;
  price: number;
  image?: string;
  content: IContent[];
  noticeBoard: string[];
  enrollmentCount: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const contentSchema = new Schema<IContent>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  video: { type: String },
  attachments: [{ type: String }]
}, { _id: true });

const courseSchema = new Schema<ICourse>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  content: [contentSchema],
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
        return user && user.role === UserRole.ADMIN;
      },
      message: 'Course can only be created by an admin'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export const Course = mongoose.model<ICourse>('Course', courseSchema);
