import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  faTimesCircle,
  faPlay
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { 
  useQuiz, 
  useStartQuizAttempt, 
  useSubmitQuizAttempt,
  useQuizEligibility 
} from '../../hooks/useQuizzes';
import { QuestionType } from '../../types/quiz';

interface QuizViewerProps {
  quizId: string;
  onComplete?: (score: number, passed: boolean) => void;
  onExit?: () => void; // For returning to lesson content
}

export const QuizViewer: React.FC<QuizViewerProps> = ({
  quizId,
  onComplete,
  onExit
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [quizStarted, setQuizStarted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    score: number;
    percentage: number;
    passed: boolean;
    timeSpent: number;
    completedAt?: string;
  } | null>(null);
  const [submittedAttemptId, setSubmittedAttemptId] = useState<string | null>(null);

  // Fetch quiz data and eligibility
  const { data: quizData, isLoading: quizLoading } = useQuiz(quizId);
  const { data: eligibilityData } = useQuizEligibility(quizId);
  const startAttemptMutation = useStartQuizAttempt();
  const submitAttemptMutation = useSubmitQuizAttempt();
  const [localAttempt, setLocalAttempt] = useState<any>(null);
  const activeAttempt = localAttempt || startAttemptMutation.data?.attempt;

  const quiz = quizData?.data;
  const eligibility = eligibilityData?.data;

  // Timer effect
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || !quizStarted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, quizStarted]);

  // Set timer when attempt starts
  useEffect(() => {
    if (activeAttempt && quiz?.timeLimit && quizStarted) {
      const timeLimitSeconds = quiz.timeLimit * 60;
      setTimeRemaining(timeLimitSeconds);
    }
  }, [activeAttempt, quiz?.timeLimit, quizStarted]);

  const handleStartQuiz = async () => {
    if (!quiz || startAttemptMutation.isPending) return;
    try {
      const response = await startAttemptMutation.mutateAsync(quizId);
      console.log('[QuizViewer] Attempt started', response);
      const attemptPayload =
        (response as any)?.attempt ||
        (response as any)?.data?.attempt ||
        (response as any)?.data;
      if (!attemptPayload?._id) {
        console.warn('[QuizViewer] Attempt response missing ID', response);
        toast.error('Unable to start quiz attempt. Please try again.');
        return;
      }
      setLocalAttempt(attemptPayload);
      setSubmissionResult(null);
      setSubmittedAttemptId(null);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setFlaggedQuestions(new Set());
      setQuizStarted(true);
      toast.success('Quiz started! Good luck!');
    } catch (error) {
      console.error('[QuizViewer] Failed to start attempt', error);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // Auto-save progress (in real implementation, this would call an API)
    // For now, we'll save to localStorage
    const progressKey = `quiz_progress_${quizId}_${user?._id}`;
    const progress = {
      answers: { ...answers, [questionId]: answer },
      currentQuestionIndex,
      timeRemaining,
      flaggedQuestions: Array.from(flaggedQuestions)
    };
    localStorage.setItem(progressKey, JSON.stringify(progress));
  };

  const toggleFlagQuestion = (index: number) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleSubmitQuiz = async () => {
    console.log('[QuizViewer] Submit requested', { activeAttemptId: activeAttempt?._id, answerCount: Object.keys(answers).length });
    if (!activeAttempt?._id) {
      console.warn('[QuizViewer] No active attempt available during submit');
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        question: questionId,
        answer,
        timeSpent: 0 // You might want to track this
      }));

      console.log('[QuizViewer] Submitting answers payload', formattedAnswers);
      const response = await submitAttemptMutation.mutateAsync({
        attemptId: activeAttempt._id,
        answers: formattedAnswers
      });
      console.log('[QuizViewer] Submission response', response);

      // Clear saved progress
      const progressKey = `quiz_progress_${quizId}_${user?._id}`;
      localStorage.removeItem(progressKey);

      const attemptSummary = (response as any)?.attempt || (response as any)?.attemptSummary || (response as any)?.data;
      if (attemptSummary) {
        setSubmissionResult({
          score: attemptSummary.score,
          percentage: attemptSummary.percentage,
          passed: attemptSummary.passed,
          timeSpent: attemptSummary.timeSpent || 0,
          completedAt: attemptSummary.completedAt
        });
        setSubmittedAttemptId(activeAttempt._id);
        onComplete?.(attemptSummary.score, attemptSummary.passed);
      }

      setQuizStarted(false);
      setLocalAttempt(null);
      setAnswers({});
      setFlaggedQuestions(new Set());
      setTimeRemaining(null);
      toast.success('Quiz submitted successfully!');

    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Load saved progress on component mount
  useEffect(() => {
    const progressKey = `quiz_progress_${quizId}_${user?._id}`;
    const savedProgress = localStorage.getItem(progressKey);
    
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        setAnswers(progress.answers || {});
        setCurrentQuestionIndex(progress.currentQuestionIndex || 0);
        setTimeRemaining(progress.timeRemaining);
        setFlaggedQuestions(new Set(progress.flaggedQuestions || []));
        
        if (Object.keys(progress.answers || {}).length > 0) {
          setQuizStarted(true);
        }
      } catch (error) {
        console.error('Error loading quiz progress:', error);
      }
    }
  }, [quizId, user?._id]);

  // Loading state
  if (quizLoading || !quiz) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Eligibility check
  if (eligibility && !eligibility.canTake) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Cannot Take Quiz</h2>
          <p className="text-red-700 mb-4">{eligibility.reason}</p>
          {onExit && (
            <button
              onClick={onExit}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Back to Lesson
            </button>
          )}
        </div>
      </div>
    );
  }

  // Check if quiz has questions
  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="w-12 h-12 text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Quiz Not Ready</h2>
          <p className="text-yellow-700 mb-4">This quiz doesn't have any questions yet. Please check back later.</p>
          {onExit && (
            <button
              onClick={onExit}
              className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
            >
              Back to Lesson
            </button>
          )}
        </div>
      </div>
    );
  }

  // Quiz completion summary
  if (submissionResult && !quizStarted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Quiz Complete</h1>
              <p className="text-gray-600">{quiz.title}</p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${submissionResult.passed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {submissionResult.passed ? 'Passed' : 'Needs Review'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-500 mb-1">Score</p>
              <p className="text-2xl font-bold text-gray-900">{submissionResult.score}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-500 mb-1">Percentage</p>
              <p className="text-2xl font-bold text-gray-900">{submissionResult.percentage.toFixed(1)}%</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-500 mb-1">Time Spent</p>
              <p className="text-2xl font-bold text-gray-900">{formatTime(submissionResult.timeSpent || 0)}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            {submittedAttemptId && (
              <button
                onClick={() => navigate(`/student/quiz-results/${submittedAttemptId}`)}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center"
              >
                View Detailed Results
              </button>
            )}
            <button
              onClick={onExit}
              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-center"
            >
              Back to Lesson
            </button>
            <button
              onClick={() => {
                setSubmissionResult(null);
                setSubmittedAttemptId(null);
                setLocalAttempt(null);
                startAttemptMutation.reset();
                handleStartQuiz();
              }}
              className="px-6 py-3 border border-blue-200 text-blue-700 rounded-md hover:bg-blue-50 text-center"
              disabled={startAttemptMutation.isPending}
            >
              {startAttemptMutation.isPending ? 'Preparing...' : 'Retake Quiz'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz start screen
  if (!quizStarted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Quiz Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-gray-600 text-lg mb-6">{quiz.description}</p>
            )}
          </div>

          {/* Quiz Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{quiz.questions.length}</div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {quiz.timeLimit ? `${quiz.timeLimit} min` : 'No limit'}
              </div>
              <div className="text-sm text-gray-600">Time Limit</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{quiz.passingScore}%</div>
              <div className="text-sm text-gray-600">Passing Score</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{quiz.maxAttempts}</div>
              <div className="text-sm text-gray-600">Max Attempts</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            {onExit && (
              <button
                onClick={onExit}
                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                Back to Lesson
              </button>
            )}
            <button
              onClick={handleStartQuiz}
              disabled={startAttemptMutation.isPending}
              className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faPlay} className="mr-2" />
              {startAttemptMutation.isPending ? 'Starting...' : 'Start Quiz'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz taking interface
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(answers).filter(key => {
    const answer = answers[key];
    if (Array.isArray(answer)) return answer.length > 0;
    return typeof answer === 'string' && answer.trim() !== '';
  }).length;

  if (!currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Question Not Found</h2>
          <p className="text-red-700 mb-4">Unable to load the current question. Please try again.</p>
          {onExit && (
            <button
              onClick={onExit}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Back to Lesson
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-gray-600">Question {currentQuestionIndex + 1} of {totalQuestions}</p>
          </div>
          <div className="flex items-center space-x-4">
            {timeRemaining !== null && (
              <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                timeRemaining < 300 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
              }`}>
                <FontAwesomeIcon icon={faClock} className="mr-2" />
                {formatTime(timeRemaining)}
              </div>
            )}
            {onExit && (
              <button
                onClick={onExit}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                Back to Lesson
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Quiz Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Question Header */}
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
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
            
            <p className="text-gray-800 mb-4">{currentQuestion.question}</p>
            
            {/* Question Type Badge */}
            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium mb-4">
              {currentQuestion.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>

            {/* Answer Options */}
            <div className="space-y-4">
              {currentQuestion.type === QuestionType.MULTIPLE_CHOICE && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <label key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name={`question-${currentQuestion._id}`}
                        value={option}
                        checked={answers[currentQuestion._id] === option}
                        onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-gray-700">{option}</span>
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
                        onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQuestion.type === QuestionType.FILL_BLANK && (
                <div>
                  <input
                    type="text"
                    value={(answers[currentQuestion._id] as string) || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Type your answer here..."
                  />
                </div>
              )}

              {currentQuestion.type === QuestionType.ESSAY && (
                <div>
                  <textarea
                    value={(answers[currentQuestion._id] as string) || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={6}
                    placeholder="Write your essay answer here..."
                  />
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                Previous
              </button>

              <div className="flex space-x-3">
                {currentQuestionIndex === totalQuestions - 1 ? (
                  <button
                    onClick={() => setShowConfirmSubmit(true)}
                    className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <FontAwesomeIcon icon={faCheck} className="mr-2" />
                    Submit Quiz
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestionIndex(Math.min(totalQuestions - 1, currentQuestionIndex + 1))}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Next
                    <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Progress</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Answered</span>
                <span>{answeredCount}/{totalQuestions}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Question Navigator */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Question Navigator</h3>
            <div className="grid grid-cols-5 gap-2">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? 'bg-blue-600 text-white'
                      : answers[quiz.questions[index]._id]
                      ? 'bg-green-100 text-green-600'
                      : flaggedQuestions.has(index)
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="mt-3 space-y-1 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded mr-2"></div>
                <span>Unanswered</span>
              </div>
            </div>
          </div>

          {/* Submit Quiz Button */}
          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700"
          >
            Submit Quiz
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Quiz</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to submit your quiz? You have answered {answeredCount} out of {totalQuestions} questions.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 