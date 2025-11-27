import { Schema, model, Document } from 'mongoose';

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  FILL_BLANK = 'fill_blank',
  ESSAY = 'essay'
}

interface IQuestion extends Document {
  quiz: Schema.Types.ObjectId; // Reference to Quiz
  question: string;
  type: QuestionType;
  options?: string[]; // For multiple choice
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>({
  quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  question: { type: String, required: true },
  type: { type: String, enum: Object.values(QuestionType), required: true },
  options: { type: [String] }, // For multiple choice questions
  correctAnswer: { type: Schema.Types.Mixed, required: true },
  explanation: { type: String },
  points: { type: Number, required: true, default: 1 },
  order: { type: Number, required: true, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes for better query performance
questionSchema.index({ quiz: 1 });
questionSchema.index({ quiz: 1, order: 1 });

export const Question = model<IQuestion>('Question', questionSchema);
