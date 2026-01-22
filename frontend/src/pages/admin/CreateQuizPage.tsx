import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QuizForm } from '../../components/quiz/QuizForm';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useQuiz } from '../../hooks/useQuizzes';

export const CreateQuizPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { quizId } = useParams<{ quizId?: string }>();
  const isEditing = !!quizId;

  // Fetch quiz data if editing
  const { data: quizData, isLoading, error } = useQuiz(quizId || '');

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  const handleSuccess = () => {
    if (isEditing && quizId) {
      navigate(`/admin/quizzes/${quizId}`);
    } else {
      navigate('/admin/quizzes');
    }
  };

  const handleCancel = () => {
    if (isEditing && quizId) {
      navigate(`/admin/quizzes/${quizId}`);
    } else {
      navigate('/admin/quizzes');
    }
  };

  // Loading state for edit mode
  if (isEditing && isLoading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error state for edit mode
  if (isEditing && error) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Quiz</h2>
              <p className="text-red-700 mb-4">Unable to load quiz details. Please try again.</p>
              <button
                onClick={() => navigate('/admin/quizzes')}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Back to Quizzes
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 mb-4 flex items-center"
          >
            ← {isEditing ? 'Back to Quiz' : 'Back to Quizzes'}
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Quiz' : 'Create New Quiz'}
          </h1>
        </div>
        
        <QuizForm
          initialData={isEditing && quizData?.data ? {
            ...quizData.data,
            // Ensure course is a string ID (backend might populate it as an object)
            course: typeof quizData.data.course === 'object' && quizData.data.course?._id 
              ? quizData.data.course._id 
              : quizData.data.course,
            // Ensure lesson is a string ID if it exists
            lesson: quizData.data.lesson 
              ? (typeof quizData.data.lesson === 'object' && quizData.data.lesson?._id 
                  ? quizData.data.lesson._id 
                  : quizData.data.lesson)
              : undefined
          } : undefined}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </MainLayout>
  );
}; 