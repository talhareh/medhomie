// CourseContentPage.tsx - Main page for viewing course content
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import MedicMenu from './medicMaterial/MedicMenu';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';
import { useQuery } from '@tanstack/react-query';
import { ApiCourse, Lesson, MedicalCourse } from '../types/courseTypes';
import { transformCourse } from '../utils/courseTransformations';
import { CourseSidebar } from '../components/course/CourseSidebar';
import { LessonContent } from '../components/course/LessonContent';
import { EnrollmentModal } from '../components/course/EnrollmentModal';
import { useCourseQuizzes } from '../hooks/useQuizzes';
import { setStoredResumeCourse } from '../utils/resumeCourseStorage';

type CourseLearnLocationState = {
  moduleId?: string;
  lessonId?: string;
  contentType?: 'video' | 'quiz';
  courseQuizId?: string;
};

export const CourseContentPage: React.FC = () => {
  const { courseId, sectionId: urlSectionId, lessonId: urlLessonId } = useParams<{
    courseId: string;
    sectionId?: string;
    lessonId?: string;
  }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [currentLessonData, setCurrentLessonData] = useState<Lesson | null>(null);
  const [preferredContentType, setPreferredContentType] = useState<'video' | 'quiz' | null>(null);
  const [videoErrors, setVideoErrors] = useState<Record<string, string>>({});

  const courseQuizFromUrl = searchParams.get('courseQuiz');

  // Fetch course data from API
  const { data: apiCourse, isLoading, error } = useQuery<ApiCourse>({
    queryKey: ['course-content', courseId],
    queryFn: async () => {
      const response = await api.get(`/public/courses/${courseId}`);
      return response.data;
    },
    enabled: !!courseId,
  });

  // Fetch course quizzes
  const { data: quizzesData, error: quizzesError } = useCourseQuizzes(courseId!);
  const quizzes = quizzesData?.data?.quizzes || [];

  useEffect(() => {
    if (quizzesError) {
      console.error('Error fetching quizzes:', quizzesError);
    }
  }, [quizzesError]);

  const [course, setCourse] = useState<MedicalCourse | null>(null);

  useEffect(() => {
    if (apiCourse) {
      const transformedCourse = transformCourse(apiCourse, quizzes);
      setCourse(transformedCourse);
    }
  }, [apiCourse, quizzes]);

  useEffect(() => {
    if (courseId && course?.title) {
      setStoredResumeCourse(courseId, course.title);
    }
  }, [courseId, course?.title]);

  // Select lesson and/or course-level quiz from URL, query, and navigation state
  useEffect(() => {
    if (!course) return;

    const st = (location.state || {}) as CourseLearnLocationState;

    if (courseQuizFromUrl) {
      setCurrentLessonData(null);
      setPreferredContentType('quiz');
      return;
    }

    const modId = urlSectionId ?? st.moduleId;
    const lesId = urlLessonId ?? st.lessonId;

    if (modId && lesId) {
      const section = course.sections.find((s) => s.id === modId);
      const lesson = section?.lessons.find((l) => l.id === lesId);
      if (lesson) {
        setCurrentLessonData(lesson);
        setPreferredContentType(st.contentType === 'quiz' ? 'quiz' : null);
        return;
      }
    }

    const first = course.sections[0]?.lessons[0];
    if (first) {
      setCurrentLessonData(first);
      setPreferredContentType(null);
      if (course.sections[0]) {
        setExpandedSections({ [course.sections[0].id]: true });
      }
    }
  }, [course, courseQuizFromUrl, urlSectionId, urlLessonId, location.state]);

  useEffect(() => {
    if (!course) return;
    if (urlSectionId) {
      setExpandedSections({ [urlSectionId]: true });
      return;
    }
    if (currentLessonData && !courseQuizFromUrl) {
      const sid = course.sections.find((s) => s.lessons.some((l) => l.id === currentLessonData.id))?.id;
      if (sid) setExpandedSections({ [sid]: true });
    }
  }, [course, urlSectionId, currentLessonData, courseQuizFromUrl]);

  useEffect(() => {
    const preventDownload = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', preventDownload);

    return () => {
      window.removeEventListener('keydown', preventDownload);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileSidebarOpen]);

  const hasAccess = Boolean(user && course?.enrollmentStatus === 'approved');

  const exitStandaloneCourseQuiz = () => {
    const firstSection = course?.sections[0];
    const firstLesson = firstSection?.lessons[0];
    if (firstSection && firstLesson && courseId) {
      navigate({
        pathname: `/courses/${courseId}/learn/${firstSection.id}/${firstLesson.id}`,
        search: '',
      });
      setCurrentLessonData(firstLesson);
    } else if (courseId) {
      navigate({ pathname: `/courses/${courseId}/learn`, search: '' });
    }
    setPreferredContentType(null);
  };

  const navigateToLesson = (
    sectionId: string,
    lessonId: string,
    options?: { contentType?: 'video' | 'quiz' }
  ) => {
    if (!hasAccess) {
      setIsModalOpen(true);
      return;
    }

    const section = course?.sections.find((s) => s.id === sectionId);
    if (!section) return;
    const lesson = section.lessons.find((l) => l.id === lessonId);
    if (!lesson || !courseId) return;

    setVideoErrors((prev) => {
      const next = { ...prev };
      if (next[lesson.id]) delete next[lesson.id];
      return next;
    });

    navigate({
      pathname: `/courses/${courseId}/learn/${sectionId}/${lessonId}`,
      search: '',
      state: {
        moduleId: sectionId,
        lessonId,
        contentType: options?.contentType,
      },
    });
    setCurrentLessonData(lesson);
    setPreferredContentType(options?.contentType ?? null);
    setIsMobileSidebarOpen(false);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const navigateToQuiz = (sectionId: string, lessonId: string) => {
    if (!hasAccess) {
      setIsModalOpen(true);
      return;
    }
    setIsMobileSidebarOpen(false);
    navigateToLesson(sectionId, lessonId, { contentType: 'quiz' });
  };

  const navigateToCourseQuiz = (quizId: string) => {
    if (!hasAccess) {
      setIsModalOpen(true);
      return;
    }
    setIsMobileSidebarOpen(false);
    if (!courseId) return;
    navigate({
      pathname: `/courses/${courseId}/learn`,
      search: `?courseQuiz=${encodeURIComponent(quizId)}`,
      state: { courseQuizId: quizId },
    });
    setCurrentLessonData(null);
    setPreferredContentType('quiz');
  };

  const openPDFInNewTab = (lesson: Lesson, attachmentIndex: number = 0) => {
    let pdfUrl: string | undefined;
    let filename: string;

    if (lesson.pdfUrl) {
      pdfUrl = lesson.pdfUrl;
      filename = lesson.ebookName || `${lesson.title}.pdf`;
    } else if (lesson.attachments && lesson.attachments.length > 0) {
      const attachment = lesson.attachments[attachmentIndex];
      if (!attachment) {
        return;
      }
      pdfUrl = typeof attachment === 'string' ? attachment : attachment.path;
      filename =
        typeof attachment === 'string'
          ? 'Attachment.pdf'
          : attachment.filename || `${lesson.title}.pdf`;
    } else {
      return;
    }

    if (!pdfUrl || !pdfUrl.startsWith('https://')) {
      console.error('Invalid PDF URL:', pdfUrl);
      return;
    }

    try {
      const encodedUrl = encodeURIComponent(pdfUrl);
      const encodedTitle = encodeURIComponent(filename);
      const viewerUrl = `${window.location.origin}/pdf-enhanced?url=${encodedUrl}&title=${encodedTitle}`;
      const newWindow = window.open(viewerUrl, '_blank');

      if (!newWindow) {
        throw new Error('Failed to open new tab. Please allow popups for this site.');
      }
    } catch (err) {
      console.error('Error opening PDF in protected viewer:', err);
    }
  };

  const totalLessons = course?.sections.reduce((acc, section) => acc + section.totalLessons, 0) || 0;
  const completedLessons = course?.sections.reduce((acc, section) => acc + section.completedLessons, 0) || 0;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  if (isLoading || !course) {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-white">
        <MedicMenu />
        <div className="flex justify-center items-center flex-1">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-white">
        <MedicMenu />
        <div className="flex justify-center items-center flex-1">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> Failed to load course content</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] h-[100dvh] max-h-[100dvh] flex-col bg-white">
      <MedicMenu />

      <div
        className="flex shrink-0 items-center justify-between bg-neutral-900 px-4 py-2 text-white sm:py-3"
        style={{
          paddingTop: 'max(0.5rem, env(safe-area-inset-top))',
          paddingLeft: 'max(1rem, env(safe-area-inset-left))',
          paddingRight: 'max(1rem, env(safe-area-inset-right))',
        }}
      >
        <div className="flex min-w-0 flex-1 items-center">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="mr-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-white/10 md:hidden touch-manipulation"
            aria-label="Toggle course menu"
          >
            <FontAwesomeIcon icon={isMobileSidebarOpen ? faTimes : faBars} className="text-lg" />
          </button>

          <button
            type="button"
            onClick={() => navigate(`/student/courses`)}
            className="mr-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-white/10 touch-manipulation"
            aria-label="Back to my courses"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <div className="flex min-w-0 items-center text-sm sm:text-base">
            <button
              type="button"
              className="truncate rounded-md px-1 py-2 text-left hover:text-gray-300 touch-manipulation sm:py-1"
              onClick={() => navigate('/student/courses')}
            >
              Courses
            </button>
            <span className="mx-1 shrink-0 sm:mx-2">/</span>
            <button
              type="button"
              className="max-w-[40vw] truncate rounded-md px-1 py-2 text-left hover:text-gray-300 touch-manipulation sm:max-w-xs sm:py-1"
              onClick={() => navigate(`/courses/${courseId}`)}
            >
              {course.title}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        <div
          className={`
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          transform transition-transform duration-300 ease-in-out
          fixed md:relative
          z-50 md:z-auto
          h-full
          w-full sm:w-80 md:w-60 lg:w-64
        `}
        >
          <CourseSidebar
            sections={course.sections}
            expandedSections={expandedSections}
            currentLessonId={currentLessonData?.id || null}
            hasAccess={hasAccess}
            completedLessons={completedLessons}
            totalLessons={totalLessons}
            totalHours={course.totalHours}
            progressPercentage={progressPercentage}
            toggleSection={toggleSection}
            navigateToLesson={navigateToLesson}
            navigateToQuiz={navigateToQuiz}
            navigateToCourseQuiz={navigateToCourseQuiz}
            courseQuizzes={course.courseQuizzes || []}
            openPDFInNewTab={openPDFInNewTab}
            onMobileClose={() => setIsMobileSidebarOpen(false)}
            selectedCourseQuizId={courseQuizFromUrl}
          />
        </div>

        <div className="min-w-0 flex-1 overflow-y-auto bg-white pb-[env(safe-area-inset-bottom)] flex flex-col">
          <LessonContent
            key={`${currentLessonData?.id ?? 'none'}-${courseQuizFromUrl ?? 'noq'}`}
            lesson={currentLessonData}
            videoErrors={videoErrors}
            preferredContentType={preferredContentType}
            onPreferredContentTypeHandled={() => setPreferredContentType(null)}
            standaloneQuizId={courseQuizFromUrl}
            onExitStandaloneQuiz={exitStandaloneCourseQuiz}
          />
        </div>
      </div>

      <EnrollmentModal isOpen={isModalOpen} courseId={courseId || ''} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
