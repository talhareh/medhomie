// quiz.ts - Type definitions for quiz-related components

// Question types enum
export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  FILL_BLANK = 'fill_blank',
  ESSAY = 'essay'
}

// Quiz interface
export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  course: string; // Course ID
  lesson?: string; // Lesson ID (optional)
  questions: string[]; // Array of question IDs
  timeLimit?: number; // Time limit in minutes
  passingScore: number; // Minimum score to pass (percentage)
  maxAttempts: number;
  isActive: boolean;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  allowReview: boolean;
  createdAt: string;
  updatedAt: string;
}

// Question interface
export interface Question {
  _id: string;
  quiz: string; // Quiz ID
  question: string;
  type: QuestionType;
  options?: string[]; // For multiple choice questions
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Quiz attempt answer interface
export interface QuizAnswer {
  question: string; // Question ID
  answer: string | string[];
  isCorrect: boolean;
  points: number;
  timeSpent: number; // Time spent on this question in seconds
}

// Quiz attempt interface
export interface QuizAttempt {
  _id: string;
  student: string; // User ID
  quiz: string; // Quiz ID
  course: string; // Course ID
  answers: QuizAnswer[];
  score: number;
  percentage: number;
  passed: boolean;
  timeSpent: number; // Total time spent in seconds
  startedAt: string;
  completedAt?: string;
  attemptNumber: number; // Which attempt this is
  createdAt: string;
  updatedAt: string;
}

// Quiz statistics interface
export interface QuizStatistics {
  totalAttempts: number;
  averageScore: number;
  averagePercentage: number;
  passedCount: number;
  averageTimeSpent: number;
  totalQuestions: number;
}

// Quiz with populated questions
export interface QuizWithQuestions extends Omit<Quiz, 'questions'> {
  questions: Question[];
}

// Quiz with populated data (course, questions)
export interface QuizWithPopulatedData extends Omit<Quiz, 'course' | 'questions'> {
  course: {
    _id: string;
    title: string;
    description?: string;
    price: number;
    thumbnail?: string;
    state: string;
    modules: any[];
    noticeBoard: string[];
    enrollmentCount: number;
    categories: string[];
    tags: string[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    totalLessons: number;
    totalDuration: number;
    id: string;
  };

  questions: Question[];
}

// Quiz attempt with populated quiz and questions
export interface QuizAttemptWithDetails extends Omit<QuizAttempt, 'quiz'> {
  quiz: QuizWithQuestions;
}

// Quiz creation form data
export interface CreateQuizData {
  title: string;
  description?: string;
  courseId: string;
  lessonId?: string;
  timeLimit?: number;
  passingScore: number;
  maxAttempts: number;
  isActive: boolean;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  allowReview: boolean;
}

// Quiz update form data
export interface UpdateQuizData extends Partial<CreateQuizData> {
  _id: string;
}

// Question creation form data
export interface CreateQuestionData {
  quizId: string;
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  order: number;
  isActive: boolean;
}

// Question update form data
export interface UpdateQuestionData extends Partial<CreateQuestionData> {
  _id: string;
}

// Quiz taking interface data
export interface QuizTakingData {
  quiz: QuizWithQuestions;
  attempt: QuizAttempt;
  currentQuestionIndex: number;
  timeRemaining: number; // in seconds
  answers: Record<string, string | string[]>; // questionId -> answer
}

// Quiz results interface
export interface QuizResults {
  attempt: QuizAttemptWithDetails;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  timeSpent: string; // formatted time
  scorePercentage: number;
  passed: boolean;
  feedback: string;
}

// Quiz list item for admin interface
export interface QuizListItem {
  _id: string;
  title: string;
  course: {
    _id: string;
    title: string;
  };
  lesson?: {
    _id: string;
    title: string;
  };
  questionCount: number;
  isActive: boolean;
  createdAt: string;
  totalAttempts: number;
  averageScore: number;
}

// Quiz filter options
export interface QuizFilters {
  courseId?: string;
  lessonId?: string;
  isActive?: boolean;
  search?: string;
}

// Quiz API response types
export interface QuizListResponse {
  success: boolean;
  data: {
    quizzes: QuizListItem[];
    count: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface QuizDetailResponse {
  success: boolean;
  data: QuizWithPopulatedData;
}

export interface QuizAttemptResponse {
  success: boolean;
  data: QuizAttemptWithDetails;
}

export interface QuizStatisticsResponse {
  success: boolean;
  data: QuizStatistics;
} 