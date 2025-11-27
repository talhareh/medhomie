import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QuestionForm } from '../../components/quiz/QuestionForm';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useQuestion } from '../../hooks/useQuizzes';

export const EditQuestionPage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: questionData, isLoading, error } = useQuestion(questionId!);

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !questionData?.data) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Question</h2>
            <p className="text-red-700 mb-4">Unable to load question details. Please try again.</p>
            <button
              onClick={() => navigate('/admin/quizzes')}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Back to Quizzes
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const handleSuccess = () => {
    navigate(`/admin/quizzes/${questionData.data.quiz}`);
  };

  const handleCancel = () => {
    navigate(`/admin/quizzes/${questionData.data.quiz}`);
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={() => navigate(`/admin/quizzes/${questionData.data.quiz}`)}
            className="text-gray-500 hover:text-gray-700 mb-4 flex items-center"
          >
            ← Back to Quiz
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Question</h1>
        </div>
        
        <QuestionForm
          quizId={questionData.data.quiz}
          initialData={questionData.data}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </MainLayout>
  );
}; 