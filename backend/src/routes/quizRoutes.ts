import express, { Request, Response, NextFunction } from 'express';
import quizController from '../controllers/quizController';
import { uploadQuestionImage } from '../controllers/quizController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

// Type the request handlers properly
const createQuizHandler = (req: Request, res: Response, next: NextFunction) => quizController.createQuiz(req, res, next);
const getQuizHandler = (req: Request, res: Response, next: NextFunction) => quizController.getQuiz(req, res, next);
const updateQuizHandler = (req: Request, res: Response, next: NextFunction) => quizController.updateQuiz(req, res, next);
const deleteQuizHandler = (req: Request, res: Response, next: NextFunction) => quizController.deleteQuiz(req, res, next);

const addQuestionHandler = (req: Request, res: Response, next: NextFunction) => quizController.addQuestion(req, res, next);
const updateQuestionHandler = (req: Request, res: Response, next: NextFunction) => quizController.updateQuestion(req, res, next);
const deleteQuestionHandler = (req: Request, res: Response, next: NextFunction) => quizController.deleteQuestion(req, res, next);

const startAttemptHandler = (req: Request, res: Response, next: NextFunction) => quizController.startAttempt(req, res, next);
const submitAttemptHandler = (req: Request, res: Response, next: NextFunction) => quizController.submitAttempt(req, res, next);

const getQuizStatisticsHandler = (req: Request, res: Response, next: NextFunction) => quizController.getQuizStatistics(req, res, next);

// Quiz Routes
router.post('/:id', authenticateToken, authorizeRoles(UserRole.ADMIN, UserRole.INSTRUCTOR), createQuizHandler);
router.get('/:id', getQuizHandler);
router.put('/:id', authenticateToken, authorizeRoles(UserRole.ADMIN, UserRole.INSTRUCTOR), updateQuizHandler);
router.delete('/:id', authenticateToken, authorizeRoles(UserRole.ADMIN), deleteQuizHandler);

// Question Routes
router.post('/:quizId/questions', authenticateToken, uploadQuestionImage, addQuestionHandler);
router.put('/:quizId/questions/:questionId', authenticateToken, updateQuestionHandler);
router.delete('/:quizId/questions/:questionId', authenticateToken, deleteQuestionHandler);

// Attempt Routes
router.post('/:quizId/attempts', authenticateToken, startAttemptHandler);
router.put('/attempts/:attemptId', authenticateToken, submitAttemptHandler);

// Analytics Routes
router.get('/:quizId/statistics', authenticateToken, getQuizStatisticsHandler);

export default router;
