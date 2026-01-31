import api from '../utils/axios';
import { getAuthHeaders } from '../utils/authUtils';
import {
  Quiz,
  Question,
  QuizAttempt,
  QuizWithQuestions,
  QuizAttemptWithDetails,
  QuizStatistics,
  CreateQuizData,
  UpdateQuizData,
  CreateQuestionData,
  UpdateQuestionData,
  QuizListResponse,
  QuizDetailResponse,
  QuizAttemptResponse,
  QuizStatisticsResponse,
  QuizFilters,
  QuizListItem
} from '../types/quiz';

// ===== QUIZ MANAGEMENT (Admin/Instructor) =====

// Get all quizzes with optional filters
export const getQuizzes = async (
  page = 1,
  limit = 10,
  filters?: QuizFilters
): Promise<QuizListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  if (filters?.courseId) params.append('courseId', filters.courseId);
  if (filters?.lessonId) params.append('lessonId', filters.lessonId);
  if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
  if (filters?.search) params.append('search', filters.search);
  
  const response = await api.get(`/quizzes?${params.toString()}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Get quizzes by course
export const getQuizzesByCourse = async (courseId: string): Promise<QuizDetailResponse[]> => {
  const response = await api.get(`/quizzes/courses/${courseId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Get a single quiz by ID
export const getQuiz = async (quizId: string): Promise<QuizDetailResponse> => {
  const response = await api.get(`/quizzes/${quizId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Create a new quiz
export const createQuiz = async (quizData: CreateQuizData): Promise<QuizDetailResponse> => {
  // Clean the data to avoid sending empty strings for optional fields
  const cleanData = {
    ...quizData,
    lessonId: quizData.lessonId && quizData.lessonId.trim() !== '' ? quizData.lessonId : undefined
  };
  
  const response = await api.post(
    `/quizzes/courses/${cleanData.courseId}`,
    cleanData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Update a quiz
export const updateQuiz = async (quizId: string, quizData: UpdateQuizData): Promise<QuizDetailResponse> => {
  // Clean the data to avoid sending empty strings for optional fields
  // Map courseId to course (backend expects 'course' field, not 'courseId')
  const cleanData: any = {
    ...quizData,
    lesson: quizData.lessonId && quizData.lessonId.trim() !== '' ? quizData.lessonId : undefined
  };
  
  // Remove courseId and use course instead (backend expects 'course' field)
  if (quizData.courseId) {
    cleanData.course = quizData.courseId;
    delete cleanData.courseId;
  }
  
  // Remove lessonId as we've mapped it to lesson
  delete cleanData.lessonId;
  
  const response = await api.put(
    `/quizzes/${quizId}`,
    cleanData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Delete a quiz
export const deleteQuiz = async (quizId: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(
    `/quizzes/${quizId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Get quiz statistics
export const getQuizStatistics = async (quizId: string): Promise<QuizStatisticsResponse> => {
  const response = await api.get(`/quizzes/${quizId}/statistics`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// ===== QUESTION MANAGEMENT =====

// Add a question to a quiz
export const addQuestion = async (quizId: string, questionData: CreateQuestionData): Promise<{ success: boolean; data: Question }> => {
  const response = await api.post(
    `/quizzes/${quizId}/questions`,
    questionData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Update a question
export const updateQuestion = async (quizId: string, questionId: string, questionData: UpdateQuestionData): Promise<{ success: boolean; data: Question }> => {
  const response = await api.put(
    `/quizzes/${quizId}/questions/${questionId}`,
    questionData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Delete a question
export const deleteQuestion = async (questionId: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(
    `/questions/${questionId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Get a single question
export const getQuestion = async (questionId: string): Promise<{ success: boolean; data: Question }> => {
  const response = await api.get(`/questions/${questionId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// ===== QUIZ ATTEMPTS (Student) =====

// Start a quiz attempt
export const startQuizAttempt = async (quizId: string): Promise<QuizAttemptResponse> => {
  const response = await api.post(
    `/quizzes/${quizId}/attempts`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Submit a quiz attempt
type RawQuizAnswers =
  | Record<string, string | string[]>
  | Array<{ question: string; answer: string | string[]; timeSpent?: number }>;

export const submitQuizAttempt = async (
  attemptId: string,
  answers: RawQuizAnswers
): Promise<QuizAttemptResponse> => {
  const normalizedAnswers = Array.isArray(answers)
    ? answers
    : Object.entries(answers).map(([questionId, answer]) => ({
        question: questionId,
        answer,
        timeSpent: 0,
      }));

  const response = await api.put(
    `/quizzes/attempts/${attemptId}`,
    { answers: normalizedAnswers },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Get quiz attempt details
export const getQuizAttempt = async (attemptId: string): Promise<QuizAttemptResponse> => {
  const response = await api.get(`/quizzes/attempts/${attemptId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Import questions from Excel
export interface ImportQuestionsResponse {
  success: boolean;
  successCount: number;
  failedCount: number;
  failedRows: Array<{
    rowNumber: number;
    question?: string;
    errors: string[];
  }>;
  successfulQuestions?: string[];
}

export const importQuestionsFromExcel = async (quizId: string, file: File): Promise<ImportQuestionsResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/quizzes/${quizId}/questions/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...getAuthHeaders()
    }
  });
  return response.data;
};

// Get user's attempts for a quiz
export const getUserQuizAttempts = async (quizId: string): Promise<{ success: boolean; data: QuizAttempt[] }> => {
  const response = await api.get(`/quizzes/${quizId}/attempts`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Get all attempts for a quiz (Admin/Instructor)
export const getAllQuizAttempts = async (quizId: string): Promise<{ success: boolean; data: QuizAttempt[] }> => {
  const response = await api.get(`/quizzes/${quizId}/attempts/all`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// ===== COURSE INTEGRATION =====

// Get quizzes for a specific course
export const getCourseQuizzes = async (courseId: string): Promise<{ success: boolean; data: { quizzes: QuizWithQuestions[]; count: number } }> => {
  const response = await api.get(`/courses/${courseId}/quizzes`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// ===== UTILITY FUNCTIONS =====

// Check if user can take a quiz (has attempts remaining, is enrolled, etc.)
export const checkQuizEligibility = async (quizId: string): Promise<{ 
  success: boolean; 
  data: { 
    canTake: boolean; 
    reason?: string; 
    attemptsRemaining: number;
    maxAttempts: number;
  } 
}> => {
  const response = await api.get(`/quizzes/${quizId}/eligibility`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Get quiz preview (for instructors to review)
export const getQuizPreview = async (quizId: string): Promise<QuizDetailResponse> => {
  const response = await api.get(`/quizzes/${quizId}/preview`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Bulk operations for questions
export const bulkAddQuestions = async (
  quizId: string, 
  questions: CreateQuestionData[]
): Promise<{ success: boolean; data: Question[] }> => {
  const response = await api.post(
    `/quizzes/${quizId}/questions/bulk`,
    { questions },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Reorder questions in a quiz
export const reorderQuestions = async (
  quizId: string, 
  questionOrder: { questionId: string; order: number }[]
): Promise<{ success: boolean; message: string }> => {
  const response = await api.put(
    `/quizzes/${quizId}/questions/reorder`,
    { questionOrder },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Export quiz data (for backup or migration)
export const exportQuiz = async (quizId: string): Promise<{ success: boolean; data: any }> => {
  const response = await api.get(`/quizzes/${quizId}/export`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Import quiz data
export const importQuiz = async (courseId: string, quizData: any): Promise<QuizDetailResponse> => {
  const response = await api.post(
    `/quizzes/courses/${courseId}/import`,
    quizData,
    { headers: getAuthHeaders() }
  );
  return response.data;
}; 