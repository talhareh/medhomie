import { Schema, model, Document } from 'mongoose';

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  FILE_UPLOAD = 'FILE_UPLOAD'
}

interface IQuestion extends Document {
  quizId: Schema.Types.ObjectId;
  questionText: string;
  questionType: QuestionType;
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  explanation?: string;
  imageUrl?: string;
}

const questionSchema = new Schema<IQuestion>({
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  questionText: { type: String, required: true },
  questionType: { type: String, enum: Object.values(QuestionType), required: true },
  options: { type: [String] },
  correctAnswer: { type: Schema.Types.Mixed, required: true },
  points: { type: Number, required: true, default: 1 },
  explanation: { type: String },
  imageUrl: { type: String }
}, { timestamps: true });

export const Question = model<IQuestion>('Question', questionSchema);
