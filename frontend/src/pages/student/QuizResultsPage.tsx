import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faTimesCircle, 
  faClock, 
  faTrophy, 
  faChartBar,
  faArrowLeft,
  faRedo,
  faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useQuizAttempt } from '../../hooks/useQuizzes';
import { QuestionType } from '../../types/quiz';
import { MainLayout } from '../../components/layout/MainLayout';

export const QuizResultsPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAnswers, setShowAnswers] = React.useState(false);

  const { data: attemptData, isLoading, error } = useQuizAttempt(attemptId!);

  if (!user) {
    navigate('/login');
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

  if (error || !attemptData?.data) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <FontAwesomeIcon icon={faTimesCircle} className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Results</h2>
            <p className="text-red-700 mb-4">Unable to load quiz results. Please try again.</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const attempt = attemptData.data;
  const quiz = attempt.quiz;
  const totalQuestions = quiz.questions.length;
  const correctAnswers = attempt.answers.filter(answer => answer.isCorrect).length;
  const incorrectAnswers = attempt.answers.filter(answer => !answer.isCorrect).length;
  const unansweredQuestions = totalQuestions - attempt.answers.length;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
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

  const formatAnswer = (answer: string | string[]) => {
    if (Array.isArray(answer)) {
      return answer.join(', ');
    }
    return answer;
  };

  const getFeedbackMessage = () => {
    if (attempt.passed) {
      if (attempt.percentage >= 90) {
        return "Excellent work! You've demonstrated a thorough understanding of the material.";
      } else if (attempt.percentage >= 80) {
        return "Great job! You have a solid grasp of the concepts.";
      } else {
        return "Good work! You've passed the quiz successfully.";
      }
    } else {
      if (attempt.percentage >= 60) {
        return "You're close! Review the material and try again.";
      } else {
        return "Keep studying! Focus on the areas where you struggled.";
      }
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="text-gray-500 hover:text-gray-700 mb-4 flex items-center"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-2" />
              Back to Course
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-gray-600">Quiz Results</p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">
              Completed on {new Date(attempt.completedAt || attempt.updatedAt).toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-500">
              Attempt #{attempt.attemptNumber}
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${
                attempt.passed ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <FontAwesomeIcon 
                  icon={attempt.passed ? faTrophy : faTimesCircle} 
                  className={`w-8 h-8 ${attempt.passed ? 'text-green-600' : 'text-red-600'}`} 
                />
              </div>
              <div className="text-sm font-medium text-gray-600">Status</div>
              <div className={`text-lg font-bold ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                {attempt.passed ? 'PASSED' : 'FAILED'}
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FontAwesomeIcon icon={faChartBar} className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-sm font-medium text-gray-600">Score</div>
              <div className="text-lg font-bold text-blue-600">{attempt.percentage.toFixed(1)}%</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FontAwesomeIcon icon={faCheckCircle} className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-sm font-medium text-gray-600">Correct</div>
              <div className="text-lg font-bold text-green-600">{correctAnswers}/{totalQuestions}</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FontAwesomeIcon icon={faClock} className="w-8 h-8 text-gray-600" />
              </div>
              <div className="text-sm font-medium text-gray-600">Time</div>
              <div className="text-lg font-bold text-gray-600">{formatTime(attempt.timeSpent)}</div>
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-800">{getFeedbackMessage()}</p>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Question Results</h2>
            <button
              onClick={() => setShowAnswers(!showAnswers)}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <FontAwesomeIcon icon={showAnswers ? faEyeSlash : faEye} className="w-4 h-4 mr-2" />
              {showAnswers ? 'Hide' : 'Show'} Answers
            </button>
          </div>

          <div className="space-y-4">
            {quiz.questions.map((question, index) => {
              const answer = attempt.answers.find(a => a.question === question._id);
              const isCorrect = answer?.isCorrect || false;
              const userAnswer = answer?.answer || 'Not answered';
              const pointsEarned = answer?.points || 0;

              return (
                <div key={question._id} className={`border rounded-lg p-4 ${
                  isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm font-medium">
                        Q{index + 1}
                      </span>
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                        {getQuestionTypeLabel(question.type)}
                      </span>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
                        {pointsEarned}/{question.points} pts
                      </span>
                    </div>
                    <div className="flex items-center">
                      {isCorrect ? (
                        <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-green-600" />
                      ) : (
                        <FontAwesomeIcon icon={faTimesCircle} className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </div>

                  <p className="text-gray-800 mb-3">{question.question}</p>

                  {showAnswers && (
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Your Answer:</span>
                        <p className="text-gray-800 ml-2">{formatAnswer(userAnswer)}</p>
                      </div>
                      
                      {!isCorrect && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Correct Answer:</span>
                          <p className="text-green-700 ml-2">{formatAnswer(question.correctAnswer)}</p>
                        </div>
                      )}

                      {question.explanation && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Explanation:</span>
                          <p className="text-gray-700 ml-2">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Back to Course
          </button>
          
          {attempt.attemptNumber < quiz.maxAttempts && (
            <button
              onClick={() => navigate(`/student/quiz/${quiz._id}`)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <FontAwesomeIcon icon={faRedo} className="w-4 h-4 mr-2" />
              Try Again
            </button>
          )}
        </div>

        {/* Attempts Info */}
        {quiz.maxAttempts > 1 && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 text-center">
              You have used {attempt.attemptNumber} of {quiz.maxAttempts} attempts.
              {attempt.attemptNumber < quiz.maxAttempts && (
                <span className="text-blue-600"> You can try again to improve your score.</span>
              )}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}; 