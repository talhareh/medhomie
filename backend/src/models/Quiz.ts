import { Schema, model, Document } from 'mongoose';

interface IQuiz extends Document {
  title: string;
  description?: string;
  course: Schema.Types.ObjectId; // Reference to Course
  lesson?: Schema.Types.ObjectId; // Reference to Lesson ID (optional, embedded in Course)
  questions: Schema.Types.ObjectId[];
  timeLimit?: number; // Time limit in minutes
  passingScore: number; // Minimum score to pass (percentage)
  maxAttempts: number;
  isActive: boolean;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  allowReview: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const quizSchema = new Schema<IQuiz>({
  title: { type: String, required: true },
  description: { type: String },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  lesson: { type: Schema.Types.ObjectId }, // Optional - for lesson-specific quizzes (embedded in Course)
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  timeLimit: { type: Number }, // Time limit in minutes
  passingScore: { type: Number, required: true, min: 0, max: 100 },
  maxAttempts: { type: Number, required: true, default: 1, min: 1 },
  isActive: { type: Boolean, default: true },
  shuffleQuestions: { type: Boolean, default: false },
  showCorrectAnswers: { type: Boolean, default: false },
  allowReview: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes for better query performance
quizSchema.index({ course: 1 });
quizSchema.index({ lesson: 1 });
quizSchema.index({ isActive: 1 });

export const Quiz = model<IQuiz>('Quiz', quizSchema);
