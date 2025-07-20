import { Request, Response, NextFunction } from 'express';
import { Quiz } from '../models/Quiz';
import { Question } from '../models/Question';
import { QuizAttempt } from '../models/QuizAttempt';
import multer from 'multer';
import path from 'path';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../models/User';

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/question-images'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for image uploads
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpeg, .png, and .gif formats allowed'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Quiz CRUD Operations
const createQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const { title, description, passingScore, maxAttempts, timeLimit, categories, tags } = req.body;
    const quiz = await Quiz.create({
      title,
      description,
      passingScore,
      maxAttempts,
      timeLimit,
      categories,
      tags
    });
    res.status(201).json(quiz);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Error creating quiz', error: err.message });
  }
};

const getQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('categories')
      .populate('tags')
      .populate('questions');
    if (!quiz) {
      res.status(404).json({ message: 'Quiz not found' });
      return;
    }
    res.json(quiz);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Error getting quiz', error: err.message });
  }
};

const updateQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  if (authReq.user.role !== UserRole.ADMIN && authReq.user.role !== UserRole.INSTRUCTOR) {
    return next(new Error('Unauthorized: Only admins and instructors can update quizzes'));
  }
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!quiz) {
      return next(new Error('Quiz not found'));
    }
    res.json(quiz);
  } catch (error) {
    next(error);
  }
};

const deleteQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  if (authReq.user.role !== UserRole.ADMIN) {
    return next(new Error('Unauthorized: Only admins can delete quizzes'));
  }
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) {
      return next(new Error('Quiz not found'));
    }
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Question Management
const addQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  if (authReq.user.role !== UserRole.ADMIN && authReq.user.role !== UserRole.INSTRUCTOR) {
    return next(new Error('Unauthorized: Only admins and instructors can add questions'));
  }
  try {
    const { quizId } = req.params;
    const question = await Question.create({ ...req.body, quiz: quizId });
    res.status(201).json(question);
  } catch (error) {
    next(error);
  }
};

const updateQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  if (authReq.user.role !== UserRole.ADMIN && authReq.user.role !== UserRole.INSTRUCTOR) {
    return next(new Error('Unauthorized: Only admins and instructors can update questions'));
  }
  try {
    const question = await Question.findByIdAndUpdate(req.params.questionId, req.body, { new: true });
    if (!question) {
      return next(new Error('Question not found'));
    }
    res.json(question);
  } catch (error) {
    next(error);
  }
};

const deleteQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  if (authReq.user.role !== UserRole.ADMIN) {
    return next(new Error('Unauthorized: Only admins can delete questions'));
  }
  try {
    const question = await Question.findByIdAndDelete(req.params.questionId);
    if (!question) {
      return next(new Error('Question not found'));
    }
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Quiz Attempt Tracking
const startAttempt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      res.status(404).json({ message: 'Quiz not found' });
      return;
    }
    const attempt = await QuizAttempt.create({
      userId: authReq.user._id,
      quizId: quiz._id,
      startedAt: new Date(),
      attemptNumber: await QuizAttempt.countDocuments({ userId: authReq.user._id, quizId: quiz._id }) + 1
    });
    res.status(201).json(attempt);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Error starting attempt', error: err.message });
  }
};

const submitAttempt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const attempt = await QuizAttempt.findById(req.params.attemptId);
    if (!attempt) {
      res.status(404).json({ message: 'Attempt not found' });
      return;
    }
    // Calculate score and update attempt
    res.json(attempt);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Error submitting attempt', error: err.message });
  }
};

// Analytics Endpoints
const getQuizStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      res.status(404).json({ message: 'Quiz not found' });
      return;
    }
    const stats = await QuizAttempt.aggregate([
      { $match: { quizId: quiz._id } },
      // Add aggregation pipeline stages
    ]);
    res.json(stats);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Error getting quiz statistics', error: err.message });
  }
};

export const uploadQuestionImage = upload.single('image');

export default {
  createQuiz,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  startAttempt,
  submitAttempt,
  getQuizStatistics
};
