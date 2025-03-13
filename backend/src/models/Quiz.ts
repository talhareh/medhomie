import { Schema, model, Document } from 'mongoose';

interface IQuiz extends Document {
  courseId: Schema.Types.ObjectId;
  title: string;
  description?: string;
  passingScore: number;
  maxAttempts: number;
  timeLimit?: number;
  isPublished: boolean;
  questions: Schema.Types.ObjectId[];
  categories: Schema.Types.ObjectId[];
  tags: Schema.Types.ObjectId[];
}

const quizSchema = new Schema<IQuiz>({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  description: { type: String },
  passingScore: { type: Number, required: true },
  maxAttempts: { type: Number, required: true, default: 1 },
  timeLimit: { type: Number },
  isPublished: { type: Boolean, default: false },
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }]
}, { timestamps: true });

export const Quiz = model<IQuiz>('Quiz', quizSchema);
