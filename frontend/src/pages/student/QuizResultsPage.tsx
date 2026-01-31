import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft,
  faBars,
  faTimes,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useQuizAttempt, useCourseQuizzes } from '../../hooks/useQuizzes';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/axios';
import { ApiCourse, MedicalCourse } from '../../types/courseTypes';
import { transformCourse } from '../../utils/courseTransformations';
import { CourseSidebar } from '../../components/course/CourseSidebar';
import { QuizResultsViewer } from '../../components/course/QuizResultsViewer';
import MedicMenu from '../medicMaterial/MedicMenu';

export const QuizResultsPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [course, setCourse] = useState<MedicalCourse | null>(null);

  // All hooks must be called before any early returns
  const { data: attemptData, isLoading, error } = useQuizAttempt(attemptId!);

  // Extract courseId from quiz (handle both string and object formats)
  // This will be null until attemptData loads, but we need to call hooks unconditionally
  const courseId = attemptData?.data?.quiz?.course 
    ? (typeof attemptData.data.quiz.course === 'object' && attemptData.data.quiz.course?._id 
        ? attemptData.data.quiz.course._id 
        : typeof attemptData.data.quiz.course === 'string' 
        ? attemptData.data.quiz.course 
        : null)
    : null;

  // Fetch course data - always call useQuery, but enable conditionally
  const { data: apiCourse, isLoading: courseLoading, error: courseError } = useQuery<ApiCourse>({
    queryKey: ['course-content', courseId],
    queryFn: async () => {
      const response = await api.get(`/public/courses/${courseId}`);
      return response.data;
    },
    enabled: !!courseId,
  });

  // Fetch course quizzes - always call, but it will handle empty courseId internally
  const { data: quizzesData } = useCourseQuizzes(courseId || '');
  const quizzes = quizzesData?.data?.quizzes || [];

  // Transform course data when available
  useEffect(() => {
    if (apiCourse) {
      const transformedCourse = transformCourse(apiCourse, quizzes);
      setCourse(transformedCourse);
      // Expand first section by default
      if (transformedCourse.sections.length > 0) {
        setExpandedSections({ [transformedCourse.sections[0].id]: true });
      }
    }
  }, [apiCourse, quizzes]);

  // Handle mobile sidebar resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle escape key to close mobile sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileSidebarOpen]);

  // Handle body scroll lock when mobile sidebar is open
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileSidebarOpen]);

  // Early returns after all hooks
  if (!user) {
    navigate('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MedicMenu />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !attemptData?.data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MedicMenu />
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
      </div>
    );
  }

  const attempt = attemptData.data;
  const quiz = attempt.quiz;

  // Navigation handlers for course sidebar
  const navigateToLesson = (sectionId: string, lessonId: string) => {
    if (courseId) {
      navigate(`/courses/${courseId}/learn`, {
        state: {
          moduleId: sectionId,
          lessonId
        }
      });
    }
  };

  const navigateToQuiz = (sectionId: string, lessonId: string) => {
    // This is for lesson-specific quizzes - navigate to lesson with quiz content type
    navigateToLesson(sectionId, lessonId);
  };

  const navigateToCourseQuiz = (quizId: string) => {
    // Navigate to quiz taking page
    navigate(`/student/quiz/${quizId}`);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const openPDFInNewTab = (lesson: any, attachmentIndex?: number) => {
    // PDF opening logic - can be simplified for quiz results page
    const pdfUrl = lesson.pdfUrl || (lesson.attachments && lesson.attachments[0]?.path);
    if (pdfUrl) {
      const encodedUrl = encodeURIComponent(pdfUrl);
      const encodedTitle = encodeURIComponent(lesson.ebookName || `${lesson.title}.pdf`);
      const viewerUrl = `${window.location.origin}/pdf-enhanced?url=${encodedUrl}&title=${encodedTitle}`;
      window.open(viewerUrl, '_blank');
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <MedicMenu />
      
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => courseId ? navigate(`/courses/${courseId}/learn`) : navigate(-1)}
                className="text-gray-500 hover:text-gray-700 flex items-center"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-2" />
                Back to Course
              </button>
              {course && (
                <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                  <span>{course.title}</span>
                  <span>/</span>
                  <span className="text-gray-900 font-medium">Quiz Results</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="md:hidden text-gray-500 hover:text-gray-700 p-2"
              aria-label="Toggle sidebar"
            >
              <FontAwesomeIcon icon={isMobileSidebarOpen ? faTimes : faBars} className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        {course && course.sections && (
          <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 bg-white border-r border-gray-200 h-[calc(100vh-4rem)] overflow-y-auto sticky top-16">
              <CourseSidebar
                sections={course.sections}
                expandedSections={expandedSections}
                currentLessonId={null}
                hasAccess={true}
                completedLessons={0}
                totalLessons={course.totalLessons || 0}
                totalHours={course.totalHours || 0}
                progressPercentage={0}
                toggleSection={toggleSection}
                navigateToLesson={navigateToLesson}
                navigateToQuiz={navigateToQuiz}
                navigateToCourseQuiz={navigateToCourseQuiz}
                courseQuizzes={course.courseQuizzes || []}
                openPDFInNewTab={openPDFInNewTab}
              />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileSidebarOpen && (
              <>
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                  onClick={() => setIsMobileSidebarOpen(false)}
                />
                <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto z-50 md:hidden">
                  <CourseSidebar
                    sections={course.sections}
                    expandedSections={expandedSections}
                    currentLessonId={null}
                    hasAccess={true}
                    completedLessons={0}
                    totalLessons={course.totalLessons || 0}
                    totalHours={course.totalHours || 0}
                    progressPercentage={0}
                    toggleSection={toggleSection}
                    navigateToLesson={navigateToLesson}
                    navigateToQuiz={navigateToQuiz}
                    navigateToCourseQuiz={navigateToCourseQuiz}
                    courseQuizzes={course.courseQuizzes || []}
                    openPDFInNewTab={openPDFInNewTab}
                    onMobileClose={() => setIsMobileSidebarOpen(false)}
                  />
                </aside>
              </>
            )}
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 bg-gray-50">
          <div className="p-4 sm:p-6">
            <QuizResultsViewer
              attempt={attempt}
              onBack={() => courseId ? navigate(`/courses/${courseId}/learn`) : navigate(-1)}
              onRetake={
                attempt.attemptNumber < quiz.maxAttempts
                  ? () => navigate(`/student/quiz/${quiz._id}`)
                  : undefined
              }
            />
            
            {/* Attempt Info Footer */}
            <div className="mt-6 max-w-6xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm text-gray-600">
                  <div>
                    Completed on {new Date(attempt.completedAt || attempt.updatedAt).toLocaleDateString()}
                  </div>
                  <div>
                    Attempt #{attempt.attemptNumber} of {quiz.maxAttempts}
                    {attempt.attemptNumber < quiz.maxAttempts && (
                      <span className="text-blue-600 ml-2">• You can try again to improve your score</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}; 