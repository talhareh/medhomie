import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faLock,
  faChevronRight,
  faChevronDown,
  faCheck,
  faFile,
  faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import MedicMenu from './medicMaterial/MedicMenu';
import api from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import { EnrollmentStatus } from './PublicCoursesPage';
import Modal from 'react-modal';
import { useCourseQuizzes } from '../hooks/useQuizzes';

// Bind modal to your appElement for accessibility
Modal.setAppElement('#root');

const customModalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '500px',
    width: '90%',
    padding: '2rem',
    borderRadius: '0.5rem',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
};

interface Lesson {
  _id: string;
  title: string;
  description: string;
  order: number;
  duration?: number;
  isPreview: boolean;
  isAccessible?: boolean;
  video?: boolean; // Added video property
  attachments?: string[]; // Added attachments property for PDFs
}

interface Module {
  _id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  thumbnail?: string;
  banner?: string;
  enrollmentCount: number;
  modules: Module[];
  enrollmentStatus?: string | null;
  noticeBoard: string[];
}

export const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [courseAssessmentsOpen, setCourseAssessmentsOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: course, isLoading, error } = useQuery<Course>({
    queryKey: ['public-course', courseId],
    queryFn: async () => {
      console.log('Fetching course details for ID:', courseId);
      // Remove the /api prefix since it's already in the axios baseURL
      const response = await api.get(`/public/courses/${courseId}`);
      console.log('Course details response:', response.data);
      return response.data;
    },
  });

  // Fetch course quizzes
  const { data: quizzesData, error: quizzesError, isLoading: quizzesLoading } = useCourseQuizzes(courseId!);
  const quizzes = quizzesData?.data?.quizzes || [];

  // Log quiz fetching errors for debugging
  useEffect(() => {
    if (quizzesError) {
      console.error('Error fetching quizzes:', quizzesError);
    }
  }, [quizzesError]);

  // Separate lesson-specific quizzes from course-level quizzes
  const lessonSpecificQuizzes = quizzes.filter((quiz: any) => quiz.lesson);
  const courseLevelQuizzes = quizzes.filter((quiz: any) => !quiz.lesson);

  // Helper function to get quizzes for a specific lesson
  const getQuizzesForLesson = (lessonId: string) => {
    return lessonSpecificQuizzes.filter((quiz: any) => {
      const quizLessonId = typeof quiz.lesson === 'object' ? quiz.lesson._id || quiz.lesson.toString() : quiz.lesson.toString();
      return quizLessonId === lessonId;
    });
  };

  // Expand the first module by default when course data is loaded
  React.useEffect(() => {
    if (course && course.modules.length > 0) {
      setExpandedModules({ [course.modules[0]._id]: true });
    }
  }, [course]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  // Check if user has access to the course
  const hasAccess = user && course?.enrollmentStatus === 'approved';

  const handleLessonClick = (moduleId: string, lessonId: string) => {
    const lesson = course?.modules
      .find(m => m._id === moduleId)
      ?.lessons.find(l => l._id === lessonId);

    if (lesson?.isAccessible) {
      navigate(`/courses/${courseId}/learn/${moduleId}/${lessonId}`, {
        state: {
          moduleId,
          lessonId
        }
      });
    } else {
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleLessonQuizClick = (moduleId: string, lessonId: string) => {
    if (!hasAccess) {
      setIsModalOpen(true);
      return;
    }
    navigate(`/courses/${courseId}/learn/${moduleId}/${lessonId}`, {
      state: {
        moduleId,
        lessonId,
        contentType: 'quiz' as const
      }
    });
  };

  const handleCourseLevelQuizClick = (quizId: string) => {
    if (!hasAccess) {
      setIsModalOpen(true);
      return;
    }
    navigate({
      pathname: `/courses/${courseId}/learn`,
      search: `?courseQuiz=${encodeURIComponent(quizId)}`,
      state: { courseQuizId: quizId }
    });
  };

  // Function to open PDF in new tab with security protections
  const openPDFInNewTab = (pdfUrl: string, filename: string) => {
    try {
      console.log('Opening PDF in protected viewer (new tab):', { pdfUrl, filename });

      // Encode URL and title for query parameters
      const encodedUrl = encodeURIComponent(pdfUrl);
      const encodedTitle = encodeURIComponent(filename);

      // Open in new tab with enhanced PDF viewer that has full features
      const viewerUrl = `${window.location.origin}/pdf-enhanced?url=${encodedUrl}&title=${encodedTitle}`;
      const newWindow = window.open(viewerUrl, '_blank');

      if (!newWindow) {
        throw new Error('Failed to open new tab. Please allow popups for this site.');
      }

      console.log('PDF opened in protected viewer (new tab) successfully');
    } catch (error) {
      console.error('Error opening PDF in protected viewer:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MedicMenu />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MedicMenu />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> Failed to load course details</span>
          </div>
        </div>
      </div>
    );
  }

  const totalLessons = course.modules.reduce(
    (acc, module) => acc + module.lessons.length,
    0
  );

  const totalDuration = course.modules.reduce(
    (acc, module) => acc + module.lessons.reduce(
      (sum, lesson) => sum + (lesson.duration || 0),
      0
    ),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <MedicMenu />

      {/* Hero Section */}
      <div className="bg-neutral-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm mb-6">
            <Link to="/courses" className="hover:text-primary-light transition-colors">Courses</Link>
            <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
            <span className="text-neutral-300">{course.title}</span>
          </div>

          {/* Course Header */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-neutral-300 mb-6">{course.description}</p>

              {/* Course Stats */}
              <div className="flex items-center space-x-6 text-neutral-300">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faPlay} className="mr-2" />
                  <span>{totalLessons} lessons</span>
                </div>
                {/* <div>
                  <span>{course.enrollmentCount} students enrolled</span>
                </div> */}
              </div>

              {/* Enrollment Status */}
              {course.enrollmentStatus && (
                <span className={`inline-block mt-4 px-3 py-1 rounded-full text-sm ${course.enrollmentStatus === 'approved'
                    ? 'bg-green-500/20 text-green-500'
                    : course.enrollmentStatus === 'rejected'
                      ? 'bg-red-500/20 text-red-500'
                      : 'bg-yellow-500/20 text-yellow-500'
                  }`}>
                  {course.enrollmentStatus.charAt(0).toUpperCase() + course.enrollmentStatus.slice(1)}
                </span>
              )}

              {!user && (
                <div className="mt-6 bg-yellow-100 text-yellow-800 p-4 rounded-md">
                  <p>You need to be logged in to enroll in this course.</p>
                  <button
                    onClick={() => navigate('/auth?mode=login')}
                    className="mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                  >
                    Login to Enroll
                  </button>
                </div>
              )}

              {user && !course.enrollmentStatus && (
                <button
                  onClick={() => navigate(`/courses?enroll=${course._id}`)}
                  className="mt-6 px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark"
                >
                  Enroll Now
                </button>
              )}

              {user && course.enrollmentStatus === 'rejected' && (
                <div className="mt-6">
                  <p className="text-red-500 mb-2">Your enrollment was rejected.</p>
                  <button
                    onClick={() => navigate(`/courses?enroll=${course._id}`)}
                    className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark"
                  >
                    Apply Again
                  </button>
                </div>
              )}
            </div>

            {/* Preview Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {course.thumbnail && (
                  <div className="relative">
                    <img
                      src={course.thumbnail.replace('uploads/', '/api/uploads/')}
                      alt={course.title}
                      className="w-full aspect-video object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  {/* <div className="text-3xl font-bold mb-6 text-black">Rs. {course.price}</div> */}
                  {course.enrollmentStatus === 'approved' ? (
                    <button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition-colors">
                      <FontAwesomeIcon icon={faCheck} className="mr-2" />
                      Enrolled
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => navigate(`/courses?enroll=${course._id}`)}
                        className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium mb-3 transition-colors"
                      >
                        Enroll Now
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Notice Board */}
              {course.noticeBoard && course.noticeBoard.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg mt-6 p-6">
                  <h3 className="text-lg font-semibold mb-4">Notice Board</h3>
                  <div className="space-y-3">
                    {course.noticeBoard.map((notice, index) => (
                      <p key={index} className="text-neutral-600">{notice}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Content — touch-friendly chips & buttons for mobile (iOS ~44pt targets) */}
      <div
        className="max-w-7xl mx-auto px-4 py-8 sm:py-12"
        style={{
          paddingLeft: 'max(1rem, env(safe-area-inset-left))',
          paddingRight: 'max(1rem, env(safe-area-inset-right))',
          paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
        }}
      >
        <h2 className="text-2xl font-bold text-neutral-800 mb-6 sm:mb-8">Course Content</h2>

        {/* Modules and Lessons */}
        <div className="space-y-6">
          {course.modules.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center text-neutral-500">
              No content available for this course yet.
            </div>
          ) : (
            course.modules
              .sort((a, b) => a.order - b.order)
              .map((module) => (
                <div key={module._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleModule(module._id)}
                    className="flex min-h-[52px] w-full touch-manipulation items-center justify-between border-b border-neutral-200 p-4 text-left transition-colors hover:bg-neutral-50 sm:min-h-0 sm:p-6"
                  >
                    <div className="text-left">
                      <h3 className="text-xl font-semibold text-neutral-800">{module.title}</h3>
                      <p className="text-neutral-600 mt-1">{module.description}</p>
                    </div>
                    <FontAwesomeIcon
                      icon={expandedModules[module._id] ? faChevronDown : faChevronRight}
                      className="text-neutral-500 text-lg"
                    />
                  </button>

                  {expandedModules[module._id] && (
                    <div className="divide-y divide-neutral-200">
                      {module.lessons
                        .sort((a, b) => a.order - b.order)
                        .map((lesson) => (
                          <div
                            key={lesson._id}
                            className="flex items-start justify-between gap-2 p-3 transition-colors hover:bg-neutral-50 sm:items-center sm:p-4"
                          >
                            <div className="flex min-w-0 flex-1 items-start gap-2 sm:items-center sm:gap-3">
                              {lesson.isAccessible ? (
                                <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                                  {lesson.video && (
                                    <button
                                      type="button"
                                      className="inline-flex h-11 w-11 touch-manipulation items-center justify-center rounded-lg hover:bg-neutral-100 active:bg-neutral-200"
                                      onClick={() => handleLessonClick(module._id, lesson._id)}
                                      title="Open video lesson"
                                      aria-label="Open video lesson"
                                    >
                                      <FontAwesomeIcon
                                        icon={faPlay}
                                        className={`text-lg ${lesson.isPreview ? 'text-primary' : 'text-neutral-400'}`}
                                      />
                                    </button>
                                  )}
                                  {lesson.attachments && lesson.attachments.length > 0 && (
                                    <button
                                      type="button"
                                      className="inline-flex h-11 w-11 touch-manipulation items-center justify-center rounded-lg hover:bg-neutral-100 active:bg-neutral-200"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const firstAttachment = lesson.attachments![0];
                                        const filename = `Lesson ${lesson.title}.pdf`;
                                        openPDFInNewTab(firstAttachment, filename);
                                      }}
                                      title="Open PDF"
                                      aria-label="Open lesson PDF"
                                    >
                                      <FontAwesomeIcon
                                        icon={faFile}
                                        className={`text-lg ${lesson.isPreview ? 'text-primary' : 'text-neutral-400'}`}
                                      />
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <FontAwesomeIcon icon={faLock} className="mt-2 shrink-0 text-neutral-400" />
                              )}
                              <div className="min-w-0 flex-1">
                                <button
                                  type="button"
                                  disabled={!lesson.isAccessible}
                                  className={`w-full rounded-lg py-2 text-left text-base font-medium touch-manipulation sm:py-0 sm:text-[inherit] ${
                                    lesson.isAccessible
                                      ? 'text-neutral-800 hover:text-primary active:bg-neutral-100/80'
                                      : 'cursor-not-allowed text-neutral-400'
                                  }`}
                                  onClick={() => lesson.isAccessible && handleLessonClick(module._id, lesson._id)}
                                >
                                  {lesson.title}
                                </button>
                                {lesson.isPreview && (
                                  <span className="mt-1 inline-block text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                                    Preview
                                  </span>
                                )}
                                {lesson.isAccessible && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {lesson.video && (
                                      <button
                                        type="button"
                                        className="touch-chip border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100"
                                        onClick={() => handleLessonClick(module._id, lesson._id)}
                                      >
                                        Video
                                      </button>
                                    )}
                                    {(lesson.pdfUrl || (lesson.attachments && lesson.attachments.length > 0)) && (
                                      <button
                                        type="button"
                                        className="touch-chip border-green-200 bg-green-50 text-green-800 hover:bg-green-100"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const pdfUrl =
                                            lesson.pdfUrl ||
                                            (lesson.attachments && typeof lesson.attachments[0] === 'string'
                                              ? lesson.attachments[0]
                                              : lesson.attachments?.[0]?.path);
                                          const filename = lesson.ebookName || `Lesson ${lesson.title}.pdf`;
                                          if (pdfUrl) {
                                            openPDFInNewTab(pdfUrl, filename);
                                          }
                                        }}
                                      >
                                        PDF
                                      </button>
                                    )}
                                    {getQuizzesForLesson(lesson._id).map(
                                      (quiz: { _id?: string; id?: string; title?: string }) => (
                                        <button
                                          type="button"
                                          key={quiz._id || quiz.id}
                                          className="touch-chip max-w-full border-purple-200 bg-purple-50 text-left text-purple-900 hover:bg-purple-100"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleLessonQuizClick(module._id, lesson._id);
                                          }}
                                        >
                                          <FontAwesomeIcon icon={faQuestionCircle} className="shrink-0" />
                                          <span className="min-w-0 truncate">{quiz.title || 'Quiz'}</span>
                                        </button>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))
          )}

          {courseLevelQuizzes.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-purple-100">
              <button
                type="button"
                onClick={() => setCourseAssessmentsOpen((o) => !o)}
                className="flex min-h-[56px] w-full touch-manipulation items-center justify-between border-b border-neutral-200 p-4 text-left transition-colors hover:bg-purple-50/80 sm:min-h-0 sm:p-6"
              >
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-purple-900 sm:text-xl">
                    <FontAwesomeIcon icon={faQuestionCircle} className="text-purple-600" />
                    Course assessments
                  </h3>
                  <p className="mt-1 text-sm text-neutral-600">
                    Final or course-level quizzes (not tied to a single lesson)
                  </p>
                </div>
                <FontAwesomeIcon
                  icon={courseAssessmentsOpen ? faChevronDown : faChevronRight}
                  className="text-neutral-500 text-lg flex-shrink-0"
                />
              </button>

              {courseAssessmentsOpen && (
                <div className="divide-y divide-neutral-200 bg-purple-50/50">
                  {courseLevelQuizzes.map((quiz: { _id?: string; id?: string; title?: string; description?: string }) => (
                    <button
                      type="button"
                      key={quiz._id || quiz.id}
                      onClick={() => handleCourseLevelQuizClick((quiz._id || quiz.id) as string)}
                      className="flex min-h-[52px] w-full touch-manipulation items-start justify-between gap-3 p-4 text-left transition-colors hover:bg-purple-100/60 active:bg-purple-100 sm:min-h-0"
                    >
                      <div>
                        <p className="font-medium text-purple-900">{quiz.title}</p>
                        {quiz.description && (
                          <p className="text-sm text-purple-700/90 mt-1">{quiz.description}</p>
                        )}
                      </div>
                      <FontAwesomeIcon icon={faChevronRight} className="text-purple-400 mt-1 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enrollment Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={customModalStyles}
        contentLabel="Enrollment Required"
      >
        <div className="text-center">
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded-full inline-flex items-center justify-center mb-4">
            <FontAwesomeIcon icon={faLock} size="2x" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Enrollment Required</h2>
          <p className="text-neutral-600 mb-6">
            You need to be enrolled in this course to access its content.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={closeModal}
              className="px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                closeModal();
                navigate(`/courses?enroll=${courseId}`);
              }}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Enroll Now
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
