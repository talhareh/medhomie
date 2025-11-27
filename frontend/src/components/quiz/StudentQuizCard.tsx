import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlay, 
  faCheckCircle, 
  faClock, 
  faTrophy, 
  faExclamationTriangle,
  faEye,
  faRedo
} from '@fortawesome/free-solid-svg-icons';
import { QuizWithQuestions, QuizAttempt } from '../../types/quiz';

interface StudentQuizCardProps {
  quiz: QuizWithQuestions;
  attempts?: QuizAttempt[];
  courseId: string;
  lessonId?: string;
}

export const StudentQuizCard: React.FC<StudentQuizCardProps> = ({
  quiz,
  attempts = [],
  courseId,
  lessonId
}) => {
  const navigate = useNavigate();

  const latestAttempt = attempts.length > 0 ? attempts[0] : null;
  const attemptsRemaining = quiz.maxAttempts - attempts.length;
  const canTakeQuiz = attemptsRemaining > 0 && quiz.isActive;

  const formatTime = (minutes?: number) => {
    if (!minutes) return 'No time limit';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} minutes`;
  };

  const getQuizStatus = () => {
    if (!quiz.isActive) {
      return {
        status: 'inactive',
        label: 'Not Available',
        color: 'bg-gray-100 text-gray-600',
        icon: faExclamationTriangle
      };
    }

    if (attempts.length === 0) {
      return {
        status: 'not-started',
        label: 'Not Started',
        color: 'bg-blue-100 text-blue-600',
        icon: faPlay
      };
    }

    if (latestAttempt?.passed) {
      return {
        status: 'passed',
        label: 'Passed',
        color: 'bg-green-100 text-green-600',
        icon: faTrophy
      };
    }

    if (attemptsRemaining > 0) {
      return {
        status: 'failed-retry',
        label: 'Failed - Can Retry',
        color: 'bg-yellow-100 text-yellow-600',
        icon: faRedo
      };
    }

    return {
      status: 'failed-no-retry',
      label: 'Failed - No Retries',
      color: 'bg-red-100 text-red-600',
      icon: faExclamationTriangle
    };
  };

  const quizStatus = getQuizStatus();

  const handleStartQuiz = () => {
    if (canTakeQuiz) {
      navigate(`/student/quiz/${quiz._id}`);
    }
  };

  const handleViewResults = () => {
    if (latestAttempt) {
      navigate(`/student/quiz-results/${latestAttempt._id}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{quiz.title}</h3>
            {quiz.description && (
              <p className="text-gray-600 text-sm line-clamp-2">{quiz.description}</p>
            )}
          </div>
          <div className="ml-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${quizStatus.color}`}>
              <FontAwesomeIcon icon={quizStatus.icon} className="w-3 h-3 mr-1" />
              {quizStatus.label}
            </span>
          </div>
        </div>

        {/* Quiz Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-sm">
            <span className="text-gray-500">Questions:</span>
            <span className="ml-1 font-medium">{quiz.questions.length}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Time Limit:</span>
            <span className="ml-1 font-medium">{formatTime(quiz.timeLimit)}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Passing Score:</span>
            <span className="ml-1 font-medium">{quiz.passingScore}%</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Max Attempts:</span>
            <span className="ml-1 font-medium">{quiz.maxAttempts}</span>
          </div>
        </div>

        {/* Attempt Info */}
        {attempts.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex justify-between items-center">
              <div className="text-sm">
                <span className="text-gray-500">Latest Attempt:</span>
                <span className="ml-1 font-medium">
                  {latestAttempt?.percentage.toFixed(1)}% 
                  {latestAttempt?.passed ? ' (Passed)' : ' (Failed)'}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(latestAttempt?.completedAt || latestAttempt?.updatedAt || '').toLocaleDateString()}
              </div>
            </div>
            {attemptsRemaining > 0 && (
              <div className="text-sm text-blue-600 mt-1">
                {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {canTakeQuiz ? (
            <button
              onClick={handleStartQuiz}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faPlay} className="w-4 h-4 mr-2" />
              {attempts.length === 0 ? 'Start Quiz' : 'Try Again'}
            </button>
          ) : (
            <button
              disabled
              className="flex-1 bg-gray-300 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4 mr-2" />
              {quiz.isActive ? 'No Attempts Left' : 'Not Available'}
            </button>
          )}

          {latestAttempt && (
            <button
              onClick={handleViewResults}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center"
            >
              <FontAwesomeIcon icon={faEye} className="w-4 h-4 mr-2" />
              Results
            </button>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-xs text-gray-500">
            <span>
              {quiz.shuffleQuestions && 'Questions shuffled • '}
              {quiz.showCorrectAnswers && 'Answers shown • '}
              {quiz.allowReview && 'Review allowed'}
            </span>
            <span>Created {new Date(quiz.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 