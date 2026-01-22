import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faTrash, 
  faArrowLeft, 
  faPlus,
  faChartBar,
  faUsers,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faEye,
  faFileExcel
} from '@fortawesome/free-solid-svg-icons';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useQuiz, useDeleteQuiz } from '../../hooks/useQuizzes';
import { QuestionType } from '../../types/quiz';
import { ImportQuestionsModal } from '../../components/quiz/ImportQuestionsModal';

export const QuizDetailPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const { data: quizData, isLoading, error, refetch } = useQuiz(quizId!);
  const deleteQuizMutation = useDeleteQuiz();

  // Debug logging
  console.log('QuizDetailPage - quizData:', quizData);
  console.log('QuizDetailPage - questions count:', quizData?.data?.questions?.length);

  // Force refetch when component mounts or quizId changes
  React.useEffect(() => {
    if (quizId) {
      refetch();
    }
  }, [quizId, refetch]);

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

  if (error) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <FontAwesomeIcon icon={faTimesCircle} className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Quiz</h2>
            <p className="text-red-700 mb-4">Unable to load quiz details. Please try again.</p>
            <p className="text-red-600 text-sm mb-4">Error: {error.message}</p>
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

  if (!quizData?.data) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">No Quiz Data</h2>
            <p className="text-yellow-700 mb-4">Quiz data is not available.</p>
            <button
              onClick={() => navigate('/admin/quizzes')}
              className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
            >
              Back to Quizzes
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const quiz = quizData?.data;

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      deleteQuizMutation.mutate(quizId!, {
        onSuccess: () => {
          navigate('/admin/quizzes');
        }
      });
    }
  };

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case QuestionType.MULTIPLE_CHOICE:
        return 'Multiple Choice';
      case QuestionType.TRUE_FALSE:
        return 'True/False';
      case QuestionType.FILL_BLANK:
        return 'Fill in the Blank';
      case QuestionType.ESSAY:
        return 'Essay';
      default:
        return type;
    }
  };

  const formatTime = (minutes?: number) => {
    if (!minutes) return 'No time limit';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} minutes`;
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <button
              onClick={() => navigate('/admin/quizzes')}
              className="text-gray-500 hover:text-gray-700 mb-4 flex items-center"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-2" />
              Back to Quizzes
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-gray-600">Quiz Details</p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => refetch()}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={() => navigate(`/admin/quizzes/${quizId}/edit`)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <FontAwesomeIcon icon={faEdit} className="w-4 h-4 mr-2" />
              Edit Quiz
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center"
              disabled={deleteQuizMutation.isPending}
            >
              <FontAwesomeIcon icon={faTrash} className="w-4 h-4 mr-2" />
              {deleteQuizMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
            quiz.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {quiz.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Quiz Information */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quiz Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Title</label>
                  <p className="text-gray-900">{quiz.title}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Course</label>
                  <p className="text-gray-900">{quiz.course?.title || 'Unknown Course'}</p>
                </div>
                
                {quiz.lesson && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Lesson ID</label>
                    <p className="text-gray-900">{quiz.lesson.toString()}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Questions</label>
                  <p className="text-gray-900">{quiz.questions.length}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Time Limit</label>
                  <p className="text-gray-900">{formatTime(quiz.timeLimit)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Passing Score</label>
                  <p className="text-gray-900">{quiz.passingScore}%</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Max Attempts</label>
                  <p className="text-gray-900">{quiz.maxAttempts}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Created</label>
                  <p className="text-gray-900">{new Date(quiz.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {quiz.description && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-900">{quiz.description}</p>
                </div>
              )}
            </div>

            {/* Quiz Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quiz Settings</h2>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <FontAwesomeIcon 
                    icon={quiz.shuffleQuestions ? faCheckCircle : faTimesCircle} 
                    className={`w-5 h-5 mr-3 ${quiz.shuffleQuestions ? 'text-green-600' : 'text-red-600'}`} 
                  />
                  <span className="text-gray-700">Shuffle questions for each attempt</span>
                </div>
                
                <div className="flex items-center">
                  <FontAwesomeIcon 
                    icon={quiz.showCorrectAnswers ? faCheckCircle : faTimesCircle} 
                    className={`w-5 h-5 mr-3 ${quiz.showCorrectAnswers ? 'text-green-600' : 'text-red-600'}`} 
                  />
                  <span className="text-gray-700">Show correct answers after submission</span>
                </div>
                
                <div className="flex items-center">
                  <FontAwesomeIcon 
                    icon={quiz.allowReview ? faCheckCircle : faTimesCircle} 
                    className={`w-5 h-5 mr-3 ${quiz.allowReview ? 'text-green-600' : 'text-red-600'}`} 
                  />
                  <span className="text-gray-700">Allow students to review their answers</span>
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Questions ({quiz.questions.length})</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
                  >
                    <FontAwesomeIcon icon={faFileExcel} className="w-4 h-4 mr-2" />
                    Import from Excel
                  </button>
                  <button
                    onClick={() => navigate(`/admin/quizzes/${quizId}/questions/new`)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
                    Add Question
                  </button>
                </div>
              </div>

              {quiz.questions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No questions added yet.</p>
                  <button
                    onClick={() => navigate(`/admin/quizzes/${quizId}/questions/new`)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Add Your First Question
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {quiz.questions.map((question, index) => (
                    <div key={question._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm font-medium">
                            Q{index + 1}
                          </span>
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                            {getQuestionTypeLabel(question.type)}
                          </span>
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
                            {question.points} pts
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/admin/questions/${question._id}/edit`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {/* Handle delete question */}}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-800 mb-2">{question.question}</p>
                      {question.explanation && (
                        <p className="text-sm text-gray-600">Explanation: {question.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Summary</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Questions:</span>
                  <span className="font-medium">{quiz.questions.length}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Limit:</span>
                  <span className="font-medium">{formatTime(quiz.timeLimit)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Passing Score:</span>
                  <span className="font-medium">{quiz.passingScore}%</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Attempts:</span>
                  <span className="font-medium">{quiz.maxAttempts}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${quiz.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {quiz.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Import Questions Modal */}
      <ImportQuestionsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        quizId={quizId!}
        onImportSuccess={() => {
          refetch();
          setIsImportModalOpen(false);
        }}
      />
    </MainLayout>
  );

}; 