import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import * as quizService from '../services/quizService';
import {
  QuizFilters,
  CreateQuizData,
  UpdateQuizData,
  CreateQuestionData,
  UpdateQuestionData
} from '../types/quiz';

// ===== QUIZ MANAGEMENT HOOKS =====

// Get all quizzes with filters
export const useQuizzes = (page = 1, limit = 10, filters?: QuizFilters) => {
  return useQuery({
    queryKey: ['quizzes', page, limit, filters],
    queryFn: () => quizService.getQuizzes(page, limit, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get quizzes by course
export const useQuizzesByCourse = (courseId: string) => {
  return useQuery({
    queryKey: ['quizzes', 'course', courseId],
    queryFn: () => quizService.getQuizzesByCourse(courseId),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });
};

// Get a single quiz
export const useQuiz = (quizId: string) => {
  return useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => quizService.getQuiz(quizId),
    enabled: !!quizId,
    staleTime: 5 * 60 * 1000,
  });
};

// Create quiz mutation
export const useCreateQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (quizData: CreateQuizData) => quizService.createQuiz(quizData),
    onSuccess: (data: any) => {
      toast.success('Quiz created successfully!');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      // Handle both response formats
      const courseId = data.data?.course || data.quiz?.course;
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: ['quizzes', 'course', courseId] });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create quiz');
    },
  });
};

// Update quiz mutation
export const useUpdateQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ quizId, quizData }: { quizId: string; quizData: UpdateQuizData }) =>
      quizService.updateQuiz(quizId, quizData),
    onSuccess: (data: any, variables) => {
      toast.success('Quiz updated successfully!');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['quiz', variables.quizId] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      // Handle both response formats
      const courseId = data.data?.course || data.quiz?.course;
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: ['quizzes', 'course', courseId] });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update quiz');
    },
  });
};

// Delete quiz mutation
export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (quizId: string) => quizService.deleteQuiz(quizId),
    onSuccess: (data, quizId) => {
      toast.success('Quiz deleted successfully!');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.removeQueries({ queryKey: ['quiz', quizId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete quiz');
    },
  });
};

// Get quiz statistics
export const useQuizStatistics = (quizId: string) => {
  return useQuery({
    queryKey: ['quiz', quizId, 'statistics'],
    queryFn: () => quizService.getQuizStatistics(quizId),
    enabled: !!quizId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// ===== QUESTION MANAGEMENT HOOKS =====

// Add question mutation
export const useAddQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ quizId, questionData }: { quizId: string; questionData: CreateQuestionData }) =>
      quizService.addQuestion(quizId, questionData),
    onSuccess: (data, variables) => {
      toast.success('Question added successfully!');
      // Invalidate quiz queries and force refetch
      queryClient.invalidateQueries({ queryKey: ['quiz', variables.quizId] });
      queryClient.refetchQueries({ queryKey: ['quiz', variables.quizId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add question');
    },
  });
};

// Update question mutation
export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ questionId, questionData }: { questionId: string; questionData: UpdateQuestionData }) =>
      quizService.updateQuestion(questionId, questionData),
    onSuccess: (data, variables) => {
      toast.success('Question updated successfully!');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update question');
    },
  });
};

// Delete question mutation
export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (questionId: string) => quizService.deleteQuestion(questionId),
    onSuccess: (data, questionId) => {
      toast.success('Question deleted successfully!');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete question');
    },
  });
};

// Get a single question
export const useQuestion = (questionId: string) => {
  return useQuery({
    queryKey: ['question', questionId],
    queryFn: () => quizService.getQuestion(questionId),
    enabled: !!questionId,
    staleTime: 5 * 60 * 1000,
  });
};

// ===== QUIZ ATTEMPT HOOKS =====

// Start quiz attempt mutation
export const useStartQuizAttempt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (quizId: string) => quizService.startQuizAttempt(quizId),
    onSuccess: (data, quizId) => {
      toast.success('Quiz started!');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId, 'attempts'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to start quiz');
    },
  });
};

// Submit quiz attempt mutation
export const useSubmitQuizAttempt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ attemptId, answers }: { attemptId: string; answers: Record<string, string | string[]> | Array<{ question: string; answer: string | string[]; timeSpent?: number }> }) =>
      quizService.submitQuizAttempt(attemptId, answers),
    onSuccess: (data, variables) => {
      toast.success('Quiz submitted successfully!');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['quiz', 'attempts'] });
      queryClient.invalidateQueries({ queryKey: ['quiz', 'attempt', variables.attemptId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit quiz');
    },
  });
};

// Get quiz attempt
export const useQuizAttempt = (attemptId: string) => {
  return useQuery({
    queryKey: ['quiz', 'attempt', attemptId],
    queryFn: () => quizService.getQuizAttempt(attemptId),
    enabled: !!attemptId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Get user's quiz attempts
export const useUserQuizAttempts = (quizId: string) => {
  return useQuery({
    queryKey: ['quiz', quizId, 'attempts'],
    queryFn: () => quizService.getUserQuizAttempts(quizId),
    enabled: !!quizId,
    staleTime: 2 * 60 * 1000,
  });
};

// Get all attempts for a quiz (Admin/Instructor)
export const useAllQuizAttempts = (quizId: string) => {
  return useQuery({
    queryKey: ['quiz', quizId, 'attempts', 'all'],
    queryFn: () => quizService.getAllQuizAttempts(quizId),
    enabled: !!quizId,
    staleTime: 2 * 60 * 1000,
  });
};

// ===== COURSE INTEGRATION HOOKS =====

// Get course quizzes
export const useCourseQuizzes = (courseId: string) => {
  return useQuery({
    queryKey: ['course', courseId, 'quizzes'],
    queryFn: () => quizService.getCourseQuizzes(courseId),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });
};

// ===== UTILITY HOOKS =====

// Check quiz eligibility
export const useQuizEligibility = (quizId: string) => {
  return useQuery({
    queryKey: ['quiz', quizId, 'eligibility'],
    queryFn: () => quizService.checkQuizEligibility(quizId),
    enabled: !!quizId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Get quiz preview
export const useQuizPreview = (quizId: string) => {
  return useQuery({
    queryKey: ['quiz', quizId, 'preview'],
    queryFn: () => quizService.getQuizPreview(quizId),
    enabled: !!quizId,
    staleTime: 5 * 60 * 1000,
  });
};

// Bulk add questions mutation
export const useBulkAddQuestions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ quizId, questions }: { quizId: string; questions: CreateQuestionData[] }) =>
      quizService.bulkAddQuestions(quizId, questions),
    onSuccess: (data, variables) => {
      toast.success(`${variables.questions.length} questions added successfully!`);
      // Invalidate quiz queries
      queryClient.invalidateQueries({ queryKey: ['quiz', variables.quizId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add questions');
    },
  });
};

// Reorder questions mutation
export const useReorderQuestions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ quizId, questionOrder }: { quizId: string; questionOrder: { questionId: string; order: number }[] }) =>
      quizService.reorderQuestions(quizId, questionOrder),
    onSuccess: (data, variables) => {
      toast.success('Questions reordered successfully!');
      // Invalidate quiz queries
      queryClient.invalidateQueries({ queryKey: ['quiz', variables.quizId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reorder questions');
    },
  });
};

// Export quiz mutation
export const useExportQuiz = () => {
  return useMutation({
    mutationFn: (quizId: string) => quizService.exportQuiz(quizId),
    onSuccess: (data) => {
      toast.success('Quiz exported successfully!');
      // Handle file download if needed
      if (data.data) {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quiz-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to export quiz');
    },
  });
};

// Import quiz mutation
export const useImportQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ courseId, quizData }: { courseId: string; quizData: any }) =>
      quizService.importQuiz(courseId, quizData),
    onSuccess: (data, variables) => {
      toast.success('Quiz imported successfully!');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['quizzes', 'course', variables.courseId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to import quiz');
    },
  });
}; 