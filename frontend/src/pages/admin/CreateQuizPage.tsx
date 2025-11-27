import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizForm } from '../../components/quiz/QuizForm';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';

export const CreateQuizPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  const handleSuccess = () => {
    navigate('/admin/quizzes');
  };

  const handleCancel = () => {
    navigate('/admin/quizzes');
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/quizzes')}
            className="text-gray-500 hover:text-gray-700 mb-4 flex items-center"
          >
            ← Back to Quizzes
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create New Quiz</h1>
        </div>
        
        <QuizForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </MainLayout>
  );
}; 