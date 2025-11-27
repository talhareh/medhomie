import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClock, 
  faCheck, 
  faTimes, 
  faArrowLeft, 
  faArrowRight, 
  faFlag,
  faExclamationTriangle,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { 
  useQuiz, 
  useStartQuizAttempt, 
  useSubmitQuizAttempt,
  useQuizEligibility 
} from '../../hooks/useQuizzes';
import { QuestionType, QuizWithQuestions } from '../../types/quiz';
import { MainLayout } from '../../components/layout/MainLayout';

export const QuizTakingPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());

  // Fetch quiz data and eligibility
  const { data: quizData, isLoading: quizLoading } = useQuiz(quizId!);
  const { data: eligibilityData } = useQuizEligibility(quizId!);
  const startAttemptMutation = useStartQuizAttempt();
  const submitAttemptMutation = useSubmitQuizAttempt();
  const activeAttempt = startAttemptMutation.data?.attempt;

  const quiz = quizData?.data;
  const eligibility = eligibilityData?.data;

  // Timer effect
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          // Auto-submit when time runs out
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Start quiz attempt when component mounts
  useEffect(() => {
    if (quiz && !startAttemptMutation.data && !startAttemptMutation.isPending) {
      startAttemptMutation.mutate(quizId!);
    }
  }, [quiz, quizId]);

  // Set timer when attempt starts
  useEffect(() => {
    if (activeAttempt && quiz?.timeLimit) {
      const timeLimitSeconds = quiz.timeLimit * 60;
      setTimeRemaining(timeLimitSeconds);
    }
  }, [activeAttempt, quiz?.timeLimit]);

  const handleAnswerChange = useCallback((questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  }, []);

  const handleMultipleChoiceAnswer = (questionId: string, option: string) => {
    const currentAnswer = answers[questionId];
    if (Array.isArray(currentAnswer)) {
      // Toggle option in array
      const newAnswer = currentAnswer.includes(option)
        ? currentAnswer.filter(a => a !== option)
        : [...currentAnswer, option];
      handleAnswerChange(questionId, newAnswer);
    } else {
      // Single selection
      handleAnswerChange(questionId, option);
    }
  };

  const handleCheckboxAnswer = (questionId: string, option: string) => {
    const currentAnswer = answers[questionId];
    if (Array.isArray(currentAnswer)) {
      const newAnswer = currentAnswer.includes(option)
        ? currentAnswer.filter(a => a !== option)
        : [...currentAnswer, option];
      handleAnswerChange(questionId, newAnswer);
    } else {
      handleAnswerChange(questionId, [option]);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!activeAttempt?._id) {
      toast.error('No active quiz attempt found');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitAttemptMutation.mutateAsync({
        attemptId: activeAttempt._id,
        answers
      });
      
      // Navigate to results page
      navigate(`/student/quiz-results/${activeAttempt._id}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz. Please try again.');
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFlagQuestion = (questionIndex: number) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionIndex)) {
        newSet.delete(questionIndex);
      } else {
        newSet.add(questionIndex);
      }
      return newSet;
    });
  };

  const getQuestionStatus = (questionIndex: number) => {
    const question = quiz?.questions[questionIndex];
    if (!question) return 'unanswered';
    
    const answer = answers[question._id];
    if (!answer) return 'unanswered';
    
    if (Array.isArray(answer) && answer.length === 0) return 'unanswered';
    if (typeof answer === 'string' && answer.trim() === '') return 'unanswered';
    
    return 'answered';
  };

  // Loading state
  if (quizLoading || !quiz) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  // Eligibility check
  if (eligibility && !eligibility.canTake) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Cannot Take Quiz</h2>
            <p className="text-red-700 mb-4">{eligibility.reason}</p>
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

  // Check if quiz has questions
  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="w-12 h-12 text-yellow-500 mb-4" />
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">Quiz Not Ready</h2>
            <p className="text-yellow-700 mb-4">This quiz doesn't have any questions yet. Please check back later.</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(answers).filter(key => {
    const answer = answers[key];
    if (Array.isArray(answer)) return answer.length > 0;
    return typeof answer === 'string' && answer.trim() !== '';
  }).length;

  // Safety check for currentQuestion
  if (!currentQuestion) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Question Not Found</h2>
            <p className="text-red-700 mb-4">Unable to load the current question. Please try again.</p>
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

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-gray-600 text-sm md:text-base">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Timer */}
              {timeRemaining !== null && (
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
                  timeRemaining < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  <FontAwesomeIcon icon={faClock} className="w-4 h-4" />
                  <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
                </div>
              )}
              
              {/* Progress */}
              <div className="text-sm text-gray-600">
                {answeredCount} of {totalQuestions} answered
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          {/* Question Navigator - Top on mobile, sidebar on desktop */}
          <div className="lg:w-64 order-first lg:order-last">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Navigator</h3>
              
              {/* Mobile-friendly question grid */}
              <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-5 gap-2 mb-4">
                {quiz.questions.map((_, index) => {
                  const status = getQuestionStatus(index);
                  const isCurrent = index === currentQuestionIndex;
                  const isFlagged = flaggedQuestions.has(index);
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-lg text-xs md:text-sm font-medium flex items-center justify-center ${
                        isCurrent
                          ? 'bg-blue-600 text-white'
                          : status === 'answered'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      } ${isFlagged ? 'ring-2 ring-yellow-400' : ''}`}
                      title={`Question ${index + 1}${isFlagged ? ' (Flagged)' : ''}`}
                    >
                      {index + 1}
                      {isFlagged && (
                        <FontAwesomeIcon icon={faFlag} className="w-2 h-2 ml-1 hidden md:inline" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
                  <span>Current</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
                  <span>Unanswered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-100 ring-2 ring-yellow-400 rounded mr-2"></div>
                  <span>Flagged</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
              {/* Question */}
              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Question {currentQuestionIndex + 1}
                  </h2>
                  <button
                    onClick={() => toggleFlagQuestion(currentQuestionIndex)}
                    className={`p-2 rounded-full ${
                      flaggedQuestions.has(currentQuestionIndex)
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-gray-100 text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <FontAwesomeIcon icon={faFlag} className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-gray-800 mb-4 text-sm md:text-base">{currentQuestion.question}</p>
                
                {/* Question Type Badge */}
                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs md:text-sm font-medium mb-4">
                  {currentQuestion.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>

              {/* Answer Options */}
              <div className="space-y-3 md:space-y-4">
                {currentQuestion.type === QuestionType.MULTIPLE_CHOICE && currentQuestion.options && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <label key={index} className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${currentQuestion._id}`}
                          value={option}
                          checked={answers[currentQuestion._id] === option}
                          onChange={() => handleMultipleChoiceAnswer(currentQuestion._id, option)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-0.5 flex-shrink-0"
                        />
                        <span className="ml-3 text-gray-700 text-sm md:text-base">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {currentQuestion.type === QuestionType.TRUE_FALSE && (
                  <div className="space-y-3">
                    {['True', 'False'].map((option) => (
                      <label key={option} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${currentQuestion._id}`}
                          value={option}
                          checked={answers[currentQuestion._id] === option}
                          onChange={() => handleMultipleChoiceAnswer(currentQuestion._id, option)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-3 text-gray-700 text-sm md:text-base">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {currentQuestion.type === QuestionType.FILL_BLANK && (
                  <div>
                    <input
                      type="text"
                      value={answers[currentQuestion._id] as string || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                      placeholder="Enter your answer..."
                    />
                  </div>
                )}

                {currentQuestion.type === QuestionType.ESSAY && (
                  <div>
                    <textarea
                      value={answers[currentQuestion._id] as string || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                      placeholder="Enter your answer..."
                    />
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex flex-col sm:flex-row justify-between items-center mt-6 md:mt-8 pt-4 md:pt-6 border-t gap-4 sm:gap-0">
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-2" />
                  Previous
                </button>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                      className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm md:text-base"
                    >
                      Next
                      <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4 ml-2" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowConfirmSubmit(true)}
                      disabled={isSubmitting}
                      className="w-full sm:w-auto flex items-center justify-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm md:text-base"
                    >
                      <FontAwesomeIcon icon={faCheck} className="w-4 h-4 mr-2" />
                      {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirm Submit Modal */}
        {showConfirmSubmit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Submission</h3>
              <p className="text-gray-600 mb-4">
                You have answered {answeredCount} out of {totalQuestions} questions. 
                Are you sure you want to submit your quiz?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Continue Quiz
                </button>
                <button
                  onClick={() => {
                    setShowConfirmSubmit(false);
                    handleSubmitQuiz();
                  }}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}; 