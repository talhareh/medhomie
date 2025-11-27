import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QuestionForm } from '../../components/quiz/QuestionForm';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';

export const CreateQuestionPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  const handleSuccess = () => {
    navigate(`/admin/quizzes/${quizId}`);
  };

  const handleCancel = () => {
    navigate(`/admin/quizzes/${quizId}`);
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={() => navigate(`/admin/quizzes/${quizId}`)}
            className="text-gray-500 hover:text-gray-700 mb-4 flex items-center"
          >
            ← Back to Quiz
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Add New Question</h1>
        </div>
        
        <QuestionForm
          quizId={quizId!}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </MainLayout>
  );
}; 