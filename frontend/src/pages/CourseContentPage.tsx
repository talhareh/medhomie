// CourseContentPage.tsx - Main page for viewing course content
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faExclamationTriangle, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import MedicMenu from './medicMaterial/MedicMenu';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';
import { useQuery } from '@tanstack/react-query';
import { ApiCourse, Lesson, MedicalCourse } from '../types/courseTypes';
import { transformCourse, findModuleIdForLesson } from '../utils/courseTransformations';
import { CourseSidebar } from '../components/course/CourseSidebar';
import { LessonContent } from '../components/course/LessonContent';
import { EnrollmentModal } from '../components/course/EnrollmentModal';
import CourseAIBot from '../components/common/CourseAIBot';
import { useCourseQuizzes, useUserQuizAttempts } from '../hooks/useQuizzes';

export const CourseContentPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [currentLessonData, setCurrentLessonData] = useState<Lesson | null>(null);
  const [preferredContentType, setPreferredContentType] = useState<'video' | 'quiz' | null>(null);
  // Removed videoBlobs and videoLoading - no longer needed with Cloudflare Player embed
  const [videoErrors, setVideoErrors] = useState<Record<string, string>>({});


  // Extract moduleId and lessonId from location state
  const moduleId = location.state?.moduleId;
  const lessonId = location.state?.lessonId;

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
  const { data: quizzesData, error: quizzesError, isLoading: quizzesLoading } = useCourseQuizzes(courseId!);
  const quizzes = quizzesData?.data?.quizzes || [];

  // Create a derived state for the transformed course
  const [course, setCourse] = useState<MedicalCourse | null>(null);

  // Update the course when API data changes
  useEffect(() => {
    if (apiCourse) {
      console.log('API Course data received:', apiCourse);
      console.log('🔍 DEBUG: Checking videoSource in API data for Test Bunny 1:',
        apiCourse.modules?.[0]?.lessons?.find(l => l.title === 'Test Bunny 1')?.videoSource);
      const transformedCourse = transformCourse(apiCourse, quizzes);
      console.log('Transformed course data:', transformedCourse);
      console.log('🔍 DEBUG: Checking videoSource in transformed data for Test Bunny 1:',
        transformedCourse.sections?.[0]?.lessons?.find(l => l.title === 'Test Bunny 1')?.videoSource);
      setCourse(transformedCourse);

      // Find the current lesson if moduleId and lessonId are provided
      if (moduleId && lessonId) {
        const module = transformedCourse.sections.find(section => section.id === moduleId);
        if (module) {
          const lesson = module.lessons.find(lesson => lesson.id === lessonId);
          if (lesson) {
            console.log('🔍 DEBUG: Setting lesson data for:', lesson.title, {
              lessonId: lesson.id,
              videoUrl: lesson.videoUrl,
              videoSource: lesson.videoSource,
              hasVideoSource: !!lesson.videoSource
            });
            setCurrentLessonData(lesson);

            // Auto-detect and open appropriate content based on lesson type
            // This handles the case when user clicks from course detail page
            console.log('Auto-detecting content for lesson:', lesson.title, {
              type: lesson.type,
              hasVideo: !!lesson.videoUrl,
              hasAttachments: lesson.attachments && lesson.attachments.length > 0
            });

            // If lesson has video, it will auto-play
            // PDFs are only accessible via sidebar links (opening in new tab)
          }
        }
      } else if (transformedCourse.sections.length > 0 && transformedCourse.sections[0].lessons.length > 0) {
        // Default to the first lesson of the first section if no specific lesson is provided
        setCurrentLessonData(transformedCourse.sections[0].lessons[0]);
      }
    }
  }, [apiCourse, quizzes, moduleId, lessonId]); // Add quizzes to dependency array


  // After course is loaded and moduleId is available, expand the selected module in the sidebar
  useEffect(() => {
    if (course && moduleId) {
      setExpandedSections({ [moduleId]: true });
    }
  }, [course, moduleId]);

  // Load video when lesson changes - REMOVED: No longer needed with Cloudflare Player embed
  // The videoUrl is already set correctly in courseTransformations.ts
  // useEffect(() => {
  //   if (currentLessonData && currentLessonData.type === 'video') {
  //     // Old logic removed - we now use Cloudflare Player embed URLs directly
  //   }
  // }, [currentLessonData, course, moduleId, courseId]);

  // Add event listener to prevent video downloading
  useEffect(() => {
    const preventDownload = (e: KeyboardEvent) => {
      // Prevent Ctrl+S, Cmd+S, and other download shortcuts
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', preventDownload);

    return () => {
      window.removeEventListener('keydown', preventDownload);
    };
  }, []);

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      // Close mobile sidebar when screen becomes larger
      if (window.innerWidth >= 768) { // md breakpoint
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle body scroll lock when mobile sidebar is open
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileSidebarOpen]);

  // Handle escape key to close mobile sidebar
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

  // Check if user has access to the course
  const hasAccess = Boolean(user && course?.enrollmentStatus === 'approved');

  const navigateToLesson = (
    sectionId: string,
    lessonId: string,
    options?: { contentType?: 'video' | 'quiz' }
  ) => {
    console.log('navigateToLesson called with:', { sectionId, lessonId });
    if (!hasAccess) {
      setIsModalOpen(true);
      return;
    }

    // Find the lesson in the course data
    const section = course?.sections.find(section => section.id === sectionId);
    if (section) {
      console.log('Found section:', section.title, 'with lessons:', section.lessons.map(l => ({ id: l.id, title: l.title, type: l.type, hasVideo: !!l.videoUrl })));
      const lesson = section.lessons.find(lesson => lesson.id === lessonId);
      if (lesson) {
        console.log('Found lesson:', {
          id: lesson.id,
          title: lesson.title,
          type: lesson.type,
          videoUrl: lesson.videoUrl,
          hasVideo: !!lesson.videoUrl,
        });
        console.log('🔍 DEBUG: navigateToLesson - lesson videoSource:', {
          title: lesson.title,
          videoSource: lesson.videoSource,
          hasVideoSource: !!lesson.videoSource
        });
        // If we're changing lessons and the current lesson has a video blob, 
        // we need to revoke the object URL to prevent memory leaks
        if (currentLessonData?.id !== lesson.id &&
          currentLessonData?.type === 'video') {
          // No longer needed with Cloudflare Player embed
        }


        // Clear any video errors for the new lesson
        setVideoErrors(prev => {
          const newErrors = { ...prev };
          if (newErrors[lesson.id]) {
            delete newErrors[lesson.id];
          }
          return newErrors;
        });

        console.log('Setting new lesson data:', lesson.id);
        // First update the URL without full navigation
        window.history.pushState(
          { moduleId: sectionId, lessonId },
          '',
          `/courses/${courseId}/learn/${sectionId}/${lessonId}`
        );
        // Then set the current lesson data to trigger the useEffect
        setCurrentLessonData(lesson);
        setPreferredContentType(options?.contentType ?? null);
        console.log('URL updated, currentLessonData has been set to:', lesson.id);

        // Close mobile sidebar when lesson is selected
        setIsMobileSidebarOpen(false);
      }
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const navigateToQuiz = (sectionId: string, lessonId: string) => {
    if (!hasAccess) {
      setIsModalOpen(true);
      return;
    }
    // Close mobile sidebar when navigating to quiz
    setIsMobileSidebarOpen(false);
    navigateToLesson(sectionId, lessonId, { contentType: 'quiz' });
  };




  // Function to open PDF in new tab with security protections
  const openPDFInNewTab = (lesson: Lesson, attachmentIndex: number = 0) => {
    console.log('🔄 PDF SIDEBAR - Opening PDF in protected viewer for lesson:', {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      hasPdfUrl: !!lesson.pdfUrl,
      hasAttachments: lesson.attachments && lesson.attachments.length > 0
    });

    // Use pdfUrl if available, otherwise fall back to attachments
    let pdfUrl: string | undefined;
    let filename: string;

    if (lesson.pdfUrl) {
      pdfUrl = lesson.pdfUrl;
      filename = lesson.ebookName || `${lesson.title}.pdf`;
    } else if (lesson.attachments && lesson.attachments.length > 0) {
      const attachment = lesson.attachments[attachmentIndex];
      if (!attachment) {
        console.log('🔄 PDF SIDEBAR - Attachment index out of range');
        return;
      }
      pdfUrl = typeof attachment === 'string' ? attachment : attachment.path;
      filename = typeof attachment === 'string' ? 'Attachment.pdf' : attachment.filename || `${lesson.title}.pdf`;
    } else {
      console.log('🔄 PDF SIDEBAR - No PDF URL or attachments to open');
      return;
    }

    if (!pdfUrl || !pdfUrl.startsWith('https://')) {
      console.error('❌ PDF SIDEBAR - Invalid PDF URL:', pdfUrl);
      return;
    }

    try {
      // Open PDF in new tab with protected viewer
      console.log('📄 PDF SIDEBAR - Opening PDF in protected viewer (new tab):', pdfUrl);

      // Encode URL and title for query parameters
      const encodedUrl = encodeURIComponent(pdfUrl);
      const encodedTitle = encodeURIComponent(filename);

      // Open in new tab with enhanced PDF viewer that has full features
      const viewerUrl = `${window.location.origin}/pdf-enhanced?url=${encodedUrl}&title=${encodedTitle}`;
      const newWindow = window.open(viewerUrl, '_blank');

      if (!newWindow) {
        throw new Error('Failed to open new tab. Please allow popups for this site.');
      }

      console.log('✅ PDF SIDEBAR - PDF opened in protected viewer (new tab) successfully');

    } catch (error) {
      console.error('❌ PDF SIDEBAR - Error opening PDF in protected viewer:', error);
    }
  };


  // Calculate overall progress
  const totalLessons = course?.sections.reduce((acc, section) => acc + section.totalLessons, 0) || 0;
  const completedLessons = course?.sections.reduce((acc, section) => acc + section.completedLessons, 0) || 0;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  if (isLoading || !course) {
    return (
      <div className="h-screen bg-white flex flex-col">
        <MedicMenu />
        <div className="flex justify-center items-center flex-1">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-white flex flex-col">
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
    <div className="h-screen bg-white flex flex-col">
      <MedicMenu />

      {/* Top navigation bar */}
      <div className="bg-neutral-900 text-white py-3 px-4 flex items-center justify-between">
        <div className="flex items-center">
          {/* Mobile sidebar toggle button */}
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="mr-4 hover:text-gray-300 md:hidden"
            aria-label="Toggle course menu"
          >
            <FontAwesomeIcon icon={isMobileSidebarOpen ? faTimes : faBars} />
          </button>

          <button
            onClick={() => navigate(`/student/courses`)}
            className="mr-4 hover:text-gray-300"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <div className="flex items-center">
            <span
              className="cursor-pointer hover:text-gray-300"
              onClick={() => navigate('/student/courses')}
            >
              Courses
            </span>
            <span className="mx-2">/</span>
            <span
              className="cursor-pointer hover:text-gray-300 truncate max-w-xs"
              onClick={() => navigate(`/courses/${courseId}`)}
            >
              {course.title}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Course Sidebar */}
        <div className={`
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          transform transition-transform duration-300 ease-in-out
          fixed md:relative
          z-50 md:z-auto
          h-full
          w-full sm:w-80 md:w-60 lg:w-64
        `}>
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
            openPDFInNewTab={openPDFInNewTab}
            onMobileClose={() => setIsMobileSidebarOpen(false)}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-white min-w-0 flex flex-col">
          <LessonContent
            lesson={currentLessonData}
            videoErrors={videoErrors}
            preferredContentType={preferredContentType}
            onPreferredContentTypeHandled={() => setPreferredContentType(null)}
          />
        </div>
      </div>

      {/* Enrollment Modal */}
      <EnrollmentModal
        isOpen={isModalOpen}
        courseId={courseId || ''}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Course AI Bot - Only show for enrolled students
      {hasAccess && <CourseAIBot />} */}
    </div>
  );
};