import { Request, Response, NextFunction } from 'express';
import { Quiz } from '../models/Quiz';
import { Question } from '../models/Question';
import { QuizAttempt } from '../models/QuizAttempt';
import multer from 'multer';
import path from 'path';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../models/User';
import * as XLSX from 'xlsx';
import { Types } from 'mongoose';

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

// Multer configuration for Excel file uploads
const excelStorage = multer.memoryStorage();
const excelFileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel' // .xls
  ];
  const allowedExtensions = ['.xlsx', '.xls'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Only .xlsx and .xls files are allowed'), false);
  }
};

const uploadExcel = multer({
  storage: excelStorage,
  fileFilter: excelFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Quiz CRUD Operations
const createQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const { courseId, lessonId, title, description, passingScore, maxAttempts, timeLimit, shuffleQuestions, showCorrectAnswers, allowReview } = req.body;
    
    // Validate required fields
    if (!courseId || !title || !passingScore) {
      res.status(400).json({ message: 'Course ID, title, and passing score are required' });
      return;
    }

    const quizData = {
      course: courseId,
      lesson: lessonId && lessonId.trim() !== '' ? lessonId : undefined, // Only set if not empty
      title,
      description,
      passingScore,
      maxAttempts: maxAttempts || 1,
      timeLimit,
      shuffleQuestions: shuffleQuestions || false,
      showCorrectAnswers: showCorrectAnswers || false,
      allowReview: allowReview !== false, // Default to true
      isActive: true
    };
    
    console.log('Creating quiz with data:', quizData);
    
    const quiz = await Quiz.create(quizData);

    // Populate course reference
    await quiz.populate('course');

    res.status(201).json({
      success: true,
      data: quiz,
      message: 'Quiz created successfully'
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error creating quiz:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error creating quiz', 
      error: err.message 
    });
  }
};

const getQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('course')
      .populate('questions');
    
    if (!quiz) {
      res.status(404).json({ message: 'Quiz not found' });
      return;
    }
    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error getting quiz:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error getting quiz', 
      error: err.message 
    });
  }
};

const getAllQuizzes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  if (authReq.user.role !== UserRole.ADMIN && authReq.user.role !== UserRole.INSTRUCTOR) {
    return next(new Error('Unauthorized: Only admins and instructors can view all quizzes'));
  }
  
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter conditions
    const filter: any = {};
    
    if (req.query.courseId) {
      filter.course = req.query.courseId;
    }
    
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Get quizzes with pagination
    const quizzes = await Quiz.find(filter)
      .populate('course', 'title')
      .populate('questions')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Quiz.countDocuments(filter);
    
    // Transform quizzes to include additional info
    const transformedQuizzes = quizzes.map(quiz => {
      const populatedCourse = quiz.course as any; // Type assertion for populated document
      return {
        _id: quiz._id,
        title: quiz.title,
        course: populatedCourse ? {
          _id: populatedCourse._id,
          title: populatedCourse.title
        } : {
          _id: 'unknown',
          title: 'Course not found'
        },
        lesson: quiz.lesson,
        questionCount: quiz.questions.length,
        isActive: quiz.isActive,
        createdAt: quiz.createdAt,
        totalAttempts: 0, // TODO: Add attempt count
        averageScore: 0 // TODO: Add average score calculation
      };
    });
    
    res.json({
      success: true,
      data: {
        quizzes: transformedQuizzes,
        count: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error getting all quizzes:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error getting quizzes', 
      error: err.message 
    });
  }
};

const getQuizzesByCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId } = req.params;
    const quizzes = await Quiz.find({ course: courseId, isActive: true })
      .populate('questions')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: {
        quizzes
      },
      message: 'Quizzes retrieved successfully'
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error getting quizzes by course:', err);
    res.status(500).json({ message: 'Error getting quizzes', error: err.message });
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
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('course');
    
    if (!quiz) {
      return next(new Error('Quiz not found'));
    }
    res.json({
      success: true,
      data: quiz,
      message: 'Quiz updated successfully'
    });
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
    res.json({ 
      success: true,
      message: 'Quiz deleted successfully' 
    });
  } catch (error) {
    next(error);
  }
};

// Question Management
const getQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  if (authReq.user.role !== UserRole.ADMIN && authReq.user.role !== UserRole.INSTRUCTOR) {
    return next(new Error('Unauthorized: Only admins and instructors can view questions'));
  }
  try {
    const question = await Question.findById(req.params.questionId);
    if (!question) {
      res.status(404).json({
        success: false,
        message: 'Question not found'
      });
      return;
    }

    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    next(error);
  }
};

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
    const { question, type, options, correctAnswer, explanation, points, order } = req.body;
    
    // Validate required fields
    if (!question || !type || !correctAnswer) {
      res.status(400).json({ message: 'Question text, type, and correct answer are required' });
      return;
    }

    const newQuestion = await Question.create({
      quiz: quizId,
      question,
      type,
      options,
      correctAnswer,
      explanation,
      points: points || 1,
      order: order || 0,
      isActive: true
    });

    // Add the question ID to the quiz's questions array
    await Quiz.findByIdAndUpdate(quizId, {
      $push: { questions: newQuestion._id }
    });

    res.status(201).json({
      success: true,
      message: 'Question added successfully',
      data: newQuestion
    });
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
    res.json({
      success: true,
      message: 'Question updated successfully',
      data: question
    });
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

    // Remove the question ID from the quiz's questions array
    await Quiz.findByIdAndUpdate(question.quiz, {
      $pull: { questions: question._id }
    });

    res.json({ 
      success: true,
      message: 'Question deleted successfully' 
    });
  } catch (error) {
    next(error);
  }
};

const MAX_QUIZ_IMPORT_OPTIONS = 26; // Option A through Option Z
const OPTION_COLUMN_PATTERN = /^option\s+([a-z])$/i;

interface DiscoveredOptionColumn {
  letter: string;
  key: string;
}

const discoverOptionColumns = (firstRow: Record<string, unknown>): {
  optionColumns: DiscoveredOptionColumn[];
  error?: string;
} => {
  const optionColumns: DiscoveredOptionColumn[] = [];

  Object.keys(firstRow).forEach(key => {
    const match = key.trim().match(OPTION_COLUMN_PATTERN);
    if (match) {
      optionColumns.push({ letter: match[1].toUpperCase(), key });
    }
  });

  optionColumns.sort((a, b) => a.letter.charCodeAt(0) - b.letter.charCodeAt(0));

  if (optionColumns.length < 2) {
    return {
      optionColumns,
      error: 'At least Option A and Option B columns are required'
    };
  }

  if (optionColumns[0].letter !== 'A') {
    return {
      optionColumns,
      error: 'Option columns must start with Option A'
    };
  }

  for (let i = 1; i < optionColumns.length; i++) {
    const expectedLetter = String.fromCharCode(optionColumns[i - 1].letter.charCodeAt(0) + 1);
    if (optionColumns[i].letter !== expectedLetter) {
      return {
        optionColumns,
        error: 'Option columns must be contiguous (e.g. Option A, Option B, Option C with no gaps)'
      };
    }
  }

  if (optionColumns.length > MAX_QUIZ_IMPORT_OPTIONS) {
    return {
      optionColumns,
      error: `A maximum of ${MAX_QUIZ_IMPORT_OPTIONS} option columns (Option A through Option Z) is supported`
    };
  }

  return { optionColumns };
};

const buildOptionsFromRow = (
  row: Record<string, unknown>,
  optionColumns: DiscoveredOptionColumn[]
): { options: string[]; errors: string[] } => {
  const options: string[] = [];
  const errors: string[] = [];
  let sawEmpty = false;

  for (const { key } of optionColumns) {
    const value = row[key]?.toString().trim() || '';
    if (value) {
      if (sawEmpty) {
        errors.push('Options must be contiguous (no empty cells between Option A and the last option)');
        return { options, errors };
      }
      options.push(value);
    } else {
      sawEmpty = true;
    }
  }

  if (options.length < 2) {
    errors.push('At least Option A and Option B are required');
  }

  return { options, errors };
};

// Import questions from Excel file
const importQuestionsFromExcel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  if (authReq.user.role !== UserRole.ADMIN && authReq.user.role !== UserRole.INSTRUCTOR) {
    res.status(403).json({ message: 'Unauthorized: Only admins and instructors can import questions' });
    return;
  }

  try {
    const { quizId } = req.params;
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    // Validate file type
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!['.xlsx', '.xls'].includes(fileExtension)) {
      res.status(400).json({ message: 'Invalid file type. Only .xlsx and .xls files are allowed' });
      return;
    }

    // Check if quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      res.status(404).json({ message: 'Quiz not found' });
      return;
    }

    // Parse Excel file
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { raw: false });

    if (!Array.isArray(data) || data.length === 0) {
      res.status(400).json({ message: 'Excel file is empty or invalid' });
      return;
    }

    // Normalize column names from first row (case-insensitive matching)
    const firstRow = data[0] as Record<string, unknown>;
    const columnMap: Record<string, string> = {};
    Object.keys(firstRow).forEach(key => {
      const normalizedKey = key.trim();
      columnMap[normalizedKey.toLowerCase()] = key;
    });

    const requiredColumns = ['Question', 'Correct Answer'];
    const missingColumns: string[] = [];
    requiredColumns.forEach(col => {
      if (!columnMap[col.toLowerCase()]) {
        missingColumns.push(col);
      }
    });

    if (missingColumns.length > 0) {
      res.status(400).json({
        message: `Missing required columns: ${missingColumns.join(', ')}`,
        missingColumns
      });
      return;
    }

    const { optionColumns, error: optionColumnError } = discoverOptionColumns(firstRow);
    if (optionColumnError) {
      res.status(400).json({ message: optionColumnError });
      return;
    }

    // Get existing questions count for order calculation
    const existingQuestionsCount = quiz.questions.length;

    // Process each row
    const successfulQuestions: Types.ObjectId[] = [];
    const failedRows: Array<{
      rowNumber: number;
      question?: string;
      errors: string[];
    }> = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any;
      const rowNumber = i + 2; // +2 because Excel rows are 1-indexed and first row is header
      const errors: string[] = [];

      // Extract values (case-insensitive)
      const getValue = (columnName: string): string | undefined => {
        const key = columnMap[columnName.toLowerCase()];
        return key ? (row[key]?.toString().trim() || '') : undefined;
      };

      const questionText = getValue('Question');
      const correctAnswer = getValue('Correct Answer');
      const pointsStr = getValue('Points');
      const explanation = getValue('Explanation');
      const orderStr = getValue('Order');

      // Validate question text
      if (!questionText || questionText.length === 0) {
        errors.push('Question text is required');
      }

      const { options, errors: optionErrors } = buildOptionsFromRow(row, optionColumns);
      errors.push(...optionErrors);

      const maxAnswerLetter = String.fromCharCode(65 + options.length - 1);

      // Validate correct answer
      if (!correctAnswer) {
        errors.push('Correct Answer is required');
      } else {
        const normalizedAnswer = correctAnswer.trim().toUpperCase();
        if (!/^[A-Z]$/.test(normalizedAnswer)) {
          errors.push('Correct Answer must be a single letter (e.g. A, B, C)');
        } else {
          const optionIndex = normalizedAnswer.charCodeAt(0) - 65;
          if (optionIndex >= options.length) {
            errors.push(
              options.length > 0
                ? `Correct Answer "${normalizedAnswer}" refers to an option that does not exist (valid: A through ${maxAnswerLetter})`
                : `Correct Answer "${normalizedAnswer}" refers to an option that does not exist`
            );
          }
        }
      }

      // Validate points
      let points = 1;
      if (pointsStr) {
        const parsedPoints = parseFloat(pointsStr);
        if (isNaN(parsedPoints) || parsedPoints <= 0) {
          errors.push('Points must be a positive number');
        } else {
          points = parsedPoints;
        }
      }

      // Validate order
      let order = existingQuestionsCount + successfulQuestions.length + 1;
      if (orderStr) {
        const parsedOrder = parseInt(orderStr, 10);
        if (!isNaN(parsedOrder) && parsedOrder > 0) {
          order = parsedOrder;
        }
      }

      // If there are errors, skip this row
      if (errors.length > 0) {
        failedRows.push({
          rowNumber,
          question: questionText || 'N/A',
          errors
        });
        continue;
      }

      // Create question
      try {
        const normalizedCorrectAnswer = correctAnswer!.trim().toUpperCase();
        const newQuestion = await Question.create({
          quiz: quizId,
          question: questionText!,
          type: 'multiple_choice',
          options: options,
          correctAnswer: options[normalizedCorrectAnswer.charCodeAt(0) - 65], // Convert A/B/C/D to option index
          explanation: explanation || undefined,
          points: points,
          order: order,
          isActive: true
        });

        successfulQuestions.push(newQuestion._id as Types.ObjectId);
      } catch (error) {
        failedRows.push({
          rowNumber,
          question: questionText || 'N/A',
          errors: [`Failed to create question: ${error instanceof Error ? error.message : 'Unknown error'}`]
        });
      }
    }

    // Update quiz's questions array with all successfully created questions
    if (successfulQuestions.length > 0) {
      await Quiz.findByIdAndUpdate(quizId, {
        $push: { questions: { $each: successfulQuestions } }
      });
    }

    // Return results
    res.json({
      success: true,
      successCount: successfulQuestions.length,
      failedCount: failedRows.length,
      failedRows: failedRows,
      successfulQuestions: successfulQuestions.map(id => id.toString())
    });
  } catch (error) {
    console.error('Error importing questions from Excel:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error importing questions from Excel',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
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

    // Only submitted attempts count toward the quiz limit.
    const completedAttempts = await QuizAttempt.countDocuments({
      student: authReq.user._id, 
      quiz: quiz._id,
      completedAt: { $ne: null }
    });

    if (completedAttempts >= quiz.maxAttempts) {
      res.status(400).json({ message: 'Maximum attempts reached for this quiz' });
      return;
    }

    const inProgressAttempt = await QuizAttempt.findOne({
      student: authReq.user._id,
      quiz: quiz._id,
      completedAt: null
    }).sort({ startedAt: -1 });

    if (inProgressAttempt) {
      res.status(200).json({
        message: 'Resuming quiz attempt',
        resumed: true,
        attempt: inProgressAttempt
      });
      return;
    }

    const attempt = await QuizAttempt.create({
      student: authReq.user._id,
      quiz: quiz._id,
      course: quiz.course,
      startedAt: new Date(),
      attemptNumber: completedAttempts + 1,
      score: 0,
      percentage: 0,
      passed: false,
      timeSpent: 0,
      answers: []
    });

    res.status(201).json({
      message: 'Quiz attempt started successfully',
      attempt
    });
  } catch (error) {
    const err = error as Error;
    if ((error as { code?: number }).code === 11000) {
      try {
        const resumedAttempt = await QuizAttempt.findOne({
          student: authReq.user._id,
          quiz: req.params.quizId,
          completedAt: null
        }).sort({ startedAt: -1 });

        if (resumedAttempt) {
          res.status(200).json({
            message: 'Resuming quiz attempt',
            resumed: true,
            attempt: resumedAttempt
          });
          return;
        }
      } catch (lookupError) {
        console.error('Error recovering duplicate in-progress attempt:', lookupError);
      }
    }
    console.error('Error starting attempt:', err);
    res.status(500).json({ message: 'Error starting attempt', error: err.message });
  }
};

const submitAttempt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  try {
    const { answers } = req.body;
    const attempt = await QuizAttempt.findById(req.params.attemptId);
    
    if (!attempt) {
      res.status(404).json({ message: 'Attempt not found' });
      return;
    }

    // Verify the attempt belongs to the user
    if (attempt.student.toString() !== authReq.user._id.toString()) {
      res.status(403).json({ message: 'Unauthorized: This attempt does not belong to you' });
      return;
    }

    if (attempt.completedAt) {
      res.status(400).json({ message: 'This attempt has already been submitted' });
      return;
    }

    // Get quiz details for scoring
    const quiz = await Quiz.findById(attempt.quiz).populate('questions');
    if (!quiz) {
      res.status(404).json({ message: 'Quiz not found' });
      return;
    }

    // Calculate score
    let totalScore = 0;
    let totalPoints = 0;
    const scoredAnswers = [];

    for (const answer of answers) {
      const question = (quiz as any).questions.find((q: any) => q._id.toString() === answer.question);
      if (question) {
        const isCorrect = checkAnswer(question, answer.answer);
        const points = isCorrect ? question.points : 0;
        
        scoredAnswers.push({
          question: answer.question,
          answer: answer.answer,
          isCorrect,
          points,
          timeSpent: answer.timeSpent || 0
        });

        totalScore += points;
        totalPoints += question.points;
      }
    }

    const percentage = totalPoints > 0 ? (totalScore / totalPoints) * 100 : 0;
    const passed = percentage >= quiz.passingScore;

    const completedAttempts = await QuizAttempt.countDocuments({
      student: attempt.student,
      quiz: attempt.quiz,
      completedAt: { $ne: null }
    });

    if (completedAttempts >= quiz.maxAttempts) {
      res.status(400).json({ message: 'Maximum attempts reached for this quiz' });
      return;
    }

    // Update attempt
    attempt.answers = scoredAnswers;
    attempt.score = totalScore;
    attempt.percentage = percentage;
    attempt.passed = passed;
    attempt.attemptNumber = completedAttempts + 1;
    attempt.completedAt = new Date();
    attempt.timeSpent = answers.reduce((total: number, ans: any) => total + (ans.timeSpent || 0), 0);

    await attempt.save();

    res.json({
      message: 'Quiz attempt submitted successfully',
      attempt: {
        score: totalScore,
        percentage,
        passed,
        timeSpent: attempt.timeSpent,
        completedAt: attempt.completedAt
      }
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error submitting attempt:', err);
    res.status(500).json({ message: 'Error submitting attempt', error: err.message });
  }
};

// Get all completed quiz attempts for the logged-in student (one row per attempt)
const getMyAttempts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  try {
    const attempts = await QuizAttempt.find({
      student: authReq.user._id,
      completedAt: { $ne: null },
    })
      .populate('quiz', 'title')
      .populate('course', 'title')
      .sort({ completedAt: -1 })
      .lean();

    const data = attempts.map((attempt) => {
      const quiz = attempt.quiz as { _id?: Types.ObjectId; title?: string } | Types.ObjectId | null;
      const course = attempt.course as { _id?: Types.ObjectId; title?: string } | Types.ObjectId | null;

      const quizId =
        quiz && typeof quiz === 'object' && '_id' in quiz && quiz._id
          ? quiz._id.toString()
          : quiz?.toString() ?? '';
      const courseId =
        course && typeof course === 'object' && '_id' in course && course._id
          ? course._id.toString()
          : course?.toString() ?? '';

      return {
        attemptId: attempt._id.toString(),
        quizId,
        quizTitle:
          quiz && typeof quiz === 'object' && 'title' in quiz && quiz.title
            ? quiz.title
            : 'Unknown Quiz',
        courseId,
        courseTitle:
          course && typeof course === 'object' && 'title' in course && course.title
            ? course.title
            : 'Unknown Course',
        attemptNumber: attempt.attemptNumber,
        completedAt: attempt.completedAt,
        score: attempt.score,
        percentage: attempt.percentage,
        passed: attempt.passed,
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    const err = error as Error;
    console.error('Error getting student quiz attempts:', err);
    res.status(500).json({
      success: false,
      message: 'Error getting quiz attempts',
      error: err.message,
    });
  }
};

// Get quiz attempt by ID
const getAttempt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  try {
    const attempt = await QuizAttempt.findById(req.params.attemptId)
      .populate({
        path: 'quiz',
        populate: {
          path: 'questions'
        }
      });
    
    if (!attempt) {
      res.status(404).json({ 
        success: false,
        message: 'Attempt not found' 
      });
      return;
    }

    // Verify the attempt belongs to the user
    if (attempt.student.toString() !== authReq.user._id.toString()) {
      res.status(403).json({ 
        success: false,
        message: 'Unauthorized: This attempt does not belong to you' 
      });
      return;
    }

    res.json({
      success: true,
      data: attempt
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error getting attempt:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error getting attempt', 
      error: err.message 
    });
  }
};

// Helper function to check if an answer is correct
const checkAnswer = (question: any, userAnswer: any): boolean => {
  if (question.type === 'multiple_choice') {
    return userAnswer === question.correctAnswer;
  } else if (question.type === 'true_false') {
    return userAnswer === question.correctAnswer;
  } else if (question.type === 'fill_blank') {
    return userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
  } else if (question.type === 'essay') {
    // For essay questions, we might need manual grading
    // For now, return true if answer is not empty
    return userAnswer && userAnswer.trim().length > 0;
  }
  return false;
};

// Analytics Endpoints
const getQuizStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const stats = await QuizAttempt.aggregate([
      { $match: { quiz: quiz._id, completedAt: { $ne: null } } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: '$score' },
          averagePercentage: { $avg: '$percentage' },
          passedCount: { $sum: { $cond: ['$passed', 1, 0] } },
          averageTimeSpent: { $avg: '$timeSpent' }
        }
      }
    ]);

    res.json({
      quiz: quiz.title,
      statistics: stats[0] || {
        totalAttempts: 0,
        averageScore: 0,
        averagePercentage: 0,
        passedCount: 0,
        averageTimeSpent: 0
      }
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error getting quiz statistics:', err);
    res.status(500).json({ message: 'Error getting quiz statistics', error: err.message });
  }
};

// Check quiz eligibility (if user can take the quiz)
const checkQuizEligibility = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    const { id: quizId } = req.params;
    
    // Get the quiz
    const quiz = await Quiz.findById(quizId).populate('course');
    if (!quiz) {
      res.status(404).json({ 
        success: false,
        message: 'Quiz not found' 
      });
      return;
    }

    // Check if user is enrolled in the course, not expired
    const { Enrollment, EnrollmentStatus } = await import('../models/Enrollment');
    const enrollment = await Enrollment.findOne({ 
      student: authReq.user._id, 
      course: quiz.course,
      status: EnrollmentStatus.APPROVED,
      isExpired: false
    });

    if (!enrollment) {
      res.json({
        success: true,
        data: {
          canTake: false,
          reason: 'You must be enrolled in this course to take the quiz',
          attemptsRemaining: 0,
          maxAttempts: quiz.maxAttempts
        }
      });
      return;
    }

    // Check if enrollment has not expired
    // If expirationDate is not set (legacy enrollment), treat as not expired
    if (enrollment.expirationDate) {
      const now = new Date();
      if (enrollment.expirationDate <= now) {
        res.json({
          success: true,
          data: {
            canTake: false,
            reason: 'Your enrollment in this course has expired',
            attemptsRemaining: 0,
            maxAttempts: quiz.maxAttempts
          }
        });
        return;
      }
    }

    // Check if quiz is active
    if (!quiz.isActive) {
      res.json({
        success: true,
        data: {
          canTake: false,
          reason: 'This quiz is currently inactive',
          attemptsRemaining: 0,
          maxAttempts: quiz.maxAttempts
        }
      });
      return;
    }

    // Check attempts
    const completedAttemptCount = await QuizAttempt.countDocuments({
      student: authReq.user._id,
      quiz: quizId,
      completedAt: { $ne: null }
    });

    const inProgressAttempt = await QuizAttempt.findOne({
      student: authReq.user._id,
      quiz: quizId,
      completedAt: null
    }).sort({ startedAt: -1 });

    const attemptsRemaining = quiz.maxAttempts - completedAttemptCount;

    if (attemptsRemaining <= 0) {
      res.json({
        success: true,
        data: {
          canTake: false,
          reason: `You have used all ${quiz.maxAttempts} attempts for this quiz`,
          attemptsRemaining: 0,
          maxAttempts: quiz.maxAttempts
        }
      });
      return;
    }

    const passedAttempt = await QuizAttempt.findOne({
      student: authReq.user._id,
      quiz: quizId,
      passed: true,
      completedAt: { $ne: null }
    });

    if (passedAttempt) {
      res.json({
        success: true,
        data: {
          canTake: false,
          reason: 'You have already passed this quiz',
          attemptsRemaining: Math.max(0, attemptsRemaining),
          maxAttempts: quiz.maxAttempts
        }
      });
      return;
    }

    // User can take the quiz
    res.json({
      success: true,
      data: {
        canTake: true,
        attemptsRemaining,
        maxAttempts: quiz.maxAttempts,
        hasInProgressAttempt: !!inProgressAttempt,
        inProgressAttemptId: inProgressAttempt?._id?.toString()
      }
    });

  } catch (error) {
    const err = error as Error;
    console.error('Error checking quiz eligibility:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error checking quiz eligibility', 
      error: err.message 
    });
  }
};

export const uploadQuestionImage = upload.single('image');
export const uploadExcelFile = uploadExcel.single('file');

export default {
  createQuiz,
  getQuiz,
  getAllQuizzes,
  getQuizzesByCourse,
  updateQuiz,
  deleteQuiz,
  getQuestion,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  importQuestionsFromExcel,
  startAttempt,
  submitAttempt,
  getAttempt,
  getMyAttempts,
  getQuizStatistics,
  checkQuizEligibility
};
