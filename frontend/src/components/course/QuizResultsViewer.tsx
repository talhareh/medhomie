import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faTimesCircle, 
  faClock, 
  faTrophy, 
  faChartBar,
  faArrowLeft,
  faArrowRight,
  faCheck,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { QuizAttemptWithDetails } from '../../types/quiz';
import { QuestionType } from '../../types/quiz';

interface QuizResultsViewerProps {
  attempt: QuizAttemptWithDetails;
  onBack?: () => void;
  onRetake?: () => void;
}

export const QuizResultsViewer: React.FC<QuizResultsViewerProps> = ({
  attempt,
  onBack,
  onRetake
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const quiz = attempt.quiz;
  const totalQuestions = quiz.questions.length;
  const correctAnswers = attempt.answers.filter(answer => answer.isCorrect).length;
  const incorrectAnswers = attempt.answers.filter(answer => !answer.isCorrect).length;
  const unansweredQuestions = totalQuestions - attempt.answers.length;

  // Helper function to normalize question IDs for comparison
  const normalizeQuestionId = (id: any): string | null => {
    if (!id) return null;
    if (typeof id === 'string') return id;
    if (typeof id === 'object' && id._id) return id._id.toString();
    return id.toString();
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  
  // Safety check
  if (!currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <FontAwesomeIcon icon={faTimesCircle} className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Question Not Found</h2>
          <p className="text-red-700 mb-4">Unable to load the question. Please try again.</p>
          {onBack && (
            <button
              onClick={onBack}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentAnswer = attempt.answers.find(
    a => {
      // Normalize both IDs to strings for comparison
      const normalizedCurrentQuestionId = normalizeQuestionId(currentQuestion._id);
      const answerQuestionId = normalizeQuestionId(a.question);
      
      return answerQuestionId === normalizedCurrentQuestionId;
    }
  );

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
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
        return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const formatAnswer = (answer: string | string[]) => {
    if (Array.isArray(answer)) {
      return answer.join(', ');
    }
    return answer || 'Not answered';
  };

  const getQuestionStatus = (questionId: string) => {
    // Normalize the question ID to string for comparison
    const normalizedQuestionId = normalizeQuestionId(questionId);
    if (!normalizedQuestionId) return 'unanswered';
    
    const answer = attempt.answers.find(a => {
      // Get the question ID from the answer
      const answerQuestionId = normalizeQuestionId(a.question);
      
      // Compare normalized IDs
      return answerQuestionId === normalizedQuestionId;
    });
    
    if (!answer) return 'unanswered';
    return answer.isCorrect ? 'correct' : 'incorrect';
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

  const isCorrect = currentAnswer?.isCorrect || false;
  const userAnswer = currentAnswer?.answer || 'Not answered';
  const pointsEarned = currentAnswer?.points || 0;
  const correctAnswer = currentQuestion.correctAnswer;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-gray-600 text-sm sm:text-base">Quiz Results</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
              attempt.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {attempt.passed ? 'PASSED' : 'FAILED'}
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${
            attempt.passed ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <FontAwesomeIcon 
              icon={attempt.passed ? faTrophy : faTimesCircle} 
              className={`w-6 h-6 sm:w-8 sm:h-8 ${attempt.passed ? 'text-green-600' : 'text-red-600'}`} 
            />
          </div>
          <div className="text-xs sm:text-sm font-medium text-gray-600">Status</div>
          <div className={`text-base sm:text-lg font-bold ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
            {attempt.passed ? 'PASSED' : 'FAILED'}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <FontAwesomeIcon icon={faChartBar} className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          </div>
          <div className="text-xs sm:text-sm font-medium text-gray-600">Score</div>
          <div className="text-base sm:text-lg font-bold text-blue-600">{attempt.percentage.toFixed(1)}%</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <FontAwesomeIcon icon={faCheckCircle} className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          </div>
          <div className="text-xs sm:text-sm font-medium text-gray-600">Correct</div>
          <div className="text-base sm:text-lg font-bold text-green-600">{correctAnswers}/{totalQuestions}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <FontAwesomeIcon icon={faClock} className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600" />
          </div>
          <div className="text-xs sm:text-sm font-medium text-gray-600">Time</div>
          <div className="text-base sm:text-lg font-bold text-gray-600">{formatTime(attempt.timeSpent)}</div>
        </div>
      </div>

      {/* Feedback Message */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
          <p className="text-sm sm:text-base text-gray-800">{getFeedbackMessage()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            {/* Question Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Question {currentQuestionIndex + 1}
                </h2>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs sm:text-sm font-medium">
                  {getQuestionTypeLabel(currentQuestion.type)}
                </span>
                <span className={`px-2 py-1 rounded text-xs sm:text-sm font-medium ${
                  isCorrect 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {pointsEarned}/{currentQuestion.points} pts
                </span>
              </div>
              <div className="flex items-center">
                {isCorrect ? (
                  <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                ) : (
                  <FontAwesomeIcon icon={faTimesCircle} className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                )}
              </div>
            </div>

            {/* Question Text */}
            <p className="text-base sm:text-lg text-gray-800 mb-6">{currentQuestion.question}</p>

            {/* Answer Comparison */}
            <div className="space-y-4 mb-6">
              {/* Your Answer */}
              <div className={`border-2 rounded-lg p-4 ${
                isCorrect 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-red-300 bg-red-50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <FontAwesomeIcon 
                    icon={isCorrect ? faCheckCircle : faTimesCircle} 
                    className={`w-4 h-4 ${isCorrect ? 'text-green-600' : 'text-red-600'}`} 
                  />
                  <span className="text-sm font-semibold text-gray-700">Your Answer:</span>
                </div>
                <p className={`text-sm sm:text-base ml-6 ${
                  isCorrect ? 'text-green-800' : 'text-red-800'
                }`}>
                  {formatAnswer(userAnswer)}
                </p>
              </div>

              {/* Correct Answer */}
              {!isCorrect && (
                <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-gray-700">Correct Answer:</span>
                  </div>
                  <p className="text-sm sm:text-base ml-6 text-green-800">
                    {formatAnswer(correctAnswer)}
                  </p>
                </div>
              )}

              {/* Show correct answer even if user got it right (for review) */}
              {isCorrect && (
                <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-gray-700">Correct Answer:</span>
                  </div>
                  <p className="text-sm sm:text-base ml-6 text-green-800">
                    {formatAnswer(correctAnswer)}
                  </p>
                </div>
              )}
            </div>

            {/* Explanation */}
            {currentQuestion.explanation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <FontAwesomeIcon icon={faChartBar} className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900">Explanation:</span>
                </div>
                <p className="text-sm sm:text-base text-blue-800 ml-6">{currentQuestion.explanation}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="flex items-center px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                Previous
              </button>

              <div className="text-sm text-gray-600">
                {currentQuestionIndex + 1} of {totalQuestions}
              </div>

              <button
                onClick={() => setCurrentQuestionIndex(Math.min(totalQuestions - 1, currentQuestionIndex + 1))}
                disabled={currentQuestionIndex === totalQuestions - 1}
                className="flex items-center px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                Next
                <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar - Question Navigator */}
        <div className="space-y-4 sm:space-y-6">
          {/* Progress Summary */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Summary</h3>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Questions</span>
                <span className="font-medium text-gray-900">{totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Correct</span>
                <span className="font-medium text-green-600">{correctAnswers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Incorrect</span>
                <span className="font-medium text-red-600">{incorrectAnswers}</span>
              </div>
              {unansweredQuestions > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Unanswered</span>
                  <span className="font-medium text-gray-600">{unansweredQuestions}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">Passing Score</span>
                  <span className="font-medium text-gray-900">{quiz.passingScore}%</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-gray-600">Your Score</span>
                  <span className={`font-medium ${
                    attempt.passed ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {attempt.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Navigator */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Question Navigator</h3>
            <div className="grid grid-cols-5 sm:grid-cols-5 gap-2">
              {quiz.questions.map((question, index) => {
                const status = getQuestionStatus(question._id);
                const isCurrent = index === currentQuestionIndex;
                
                return (
                  <button
                    key={question._id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded text-xs sm:text-sm font-medium transition-all ${
                      isCurrent
                        ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-600 text-white scale-110'
                        : status === 'correct'
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : status === 'incorrect'
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="mt-4 space-y-1.5 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                <span>Correct</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                <span>Incorrect</span>
              </div>
              {unansweredQuestions > 0 && (
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-200 rounded mr-2"></div>
                  <span>Unanswered</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {onRetake && (
            <button
              onClick={onRetake}
              className="w-full bg-blue-600 text-white py-2 sm:py-3 rounded-lg font-medium hover:bg-blue-700 text-sm sm:text-base transition-colors"
            >
              Retake Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
