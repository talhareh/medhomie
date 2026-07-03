import express, { Request, Response, NextFunction } from 'express';
import quizController from '../controllers/quizController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

const getQuestionHandler = (req: Request, res: Response, next: NextFunction) =>
  quizController.getQuestion(req, res, next);

const deleteQuestionHandler = (req: Request, res: Response, next: NextFunction) =>
  quizController.deleteQuestion(req, res, next);

// Get a single question by ID
router.get(
  '/:questionId',
  authenticateToken,
  authorizeRoles(UserRole.ADMIN, UserRole.INSTRUCTOR),
  getQuestionHandler
);

// Delete a question by ID
router.delete(
  '/:questionId',
  authenticateToken,
  authorizeRoles(UserRole.ADMIN),
  deleteQuestionHandler
);

export default router;

