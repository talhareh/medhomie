import { Schema, model, Document } from 'mongoose';

interface IQuizAttempt extends Document {
  userId: Schema.Types.ObjectId;
  quizId: Schema.Types.ObjectId;
  answers: {
    questionId: Schema.Types.ObjectId;
    answer: string | string[];
    isCorrect: boolean;
    pointsEarned: number;
    timeTaken: number; // in seconds
    confidenceLevel?: number; // optional user-provided confidence rating
  }[];
  score: number;
  isPassed: boolean;
  timeTaken: number; // in seconds
  attemptNumber: number;
  startedAt: Date;
  completedAt: Date;
  reviewNotes?: string; // optional notes for later review
}

const quizAttemptSchema = new Schema<IQuizAttempt>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  answers: [{
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    answer: { type: Schema.Types.Mixed, required: true },
    isCorrect: { type: Boolean, required: true },
    pointsEarned: { type: Number, required: true },
    timeTaken: { type: Number, required: true },
    confidenceLevel: { type: Number, min: 1, max: 5 }
  }],
  score: { type: Number, required: true },
  isPassed: { type: Boolean, required: true },
  timeTaken: { type: Number, required: true },
  attemptNumber: { type: Number, required: true },
  startedAt: { type: Date, required: true },
  completedAt: { type: Date, required: true },
  reviewNotes: { type: String }
}, { timestamps: true });

export const QuizAttempt = model<IQuizAttempt>('QuizAttempt', quizAttemptSchema);
