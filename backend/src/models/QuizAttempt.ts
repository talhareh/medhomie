import { Schema, model, Document } from 'mongoose';

interface IQuizAttempt extends Document {
  student: Schema.Types.ObjectId; // Reference to User
  quiz: Schema.Types.ObjectId; // Reference to Quiz
  course: Schema.Types.ObjectId; // Reference to Course
  answers: {
    question: Schema.Types.ObjectId; // Reference to Question
    answer: string | string[];
    isCorrect: boolean;
    points: number;
    timeSpent: number; // Time spent on this question in seconds
  }[];
  score: number;
  percentage: number;
  passed: boolean;
  timeSpent: number; // Total time spent in seconds
  startedAt: Date;
  completedAt?: Date;
  attemptNumber: number; // Which attempt this is
  createdAt: Date;
  updatedAt: Date;
}

const quizAttemptSchema = new Schema<IQuizAttempt>({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  answers: [{
    question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    answer: { type: Schema.Types.Mixed, required: true },
    isCorrect: { type: Boolean, required: true },
    points: { type: Number, required: true },
    timeSpent: { type: Number, required: true, default: 0 }
  }],
  score: { type: Number, required: true },
  percentage: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  timeSpent: { type: Number, required: true, default: 0 },
  startedAt: { type: Date, required: true },
  completedAt: { type: Date },
  attemptNumber: { type: Number, required: true, default: 1 }
}, { timestamps: true });

// Indexes for better query performance
quizAttemptSchema.index({ student: 1 });
quizAttemptSchema.index({ quiz: 1 });
quizAttemptSchema.index({ course: 1 });
quizAttemptSchema.index({ student: 1, quiz: 1, attemptNumber: 1 });

export const QuizAttempt = model<IQuizAttempt>('QuizAttempt', quizAttemptSchema);
