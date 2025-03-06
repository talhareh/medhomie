// CourseContentPage.tsx - Main page for viewing course content
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { Header } from '../components/common/Header';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';
import { useQuery } from '@tanstack/react-query';
import { ApiCourse, Lesson, MedicalCourse } from '../types/courseTypes';
import { transformCourse, findModuleIdForLesson } from '../utils/courseTransformations';
import { CourseSidebar } from '../components/course/CourseSidebar';
import { LessonContent } from '../components/course/LessonContent';
import { EnrollmentModal } from '../components/course/EnrollmentModal';

export const CourseContentPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [currentLessonData, setCurrentLessonData] = useState<Lesson | null>(null);
  const [videoBlobs, setVideoBlobs] = useState<Record<string, string>>({});
  const [videoLoading, setVideoLoading] = useState<Record<string, boolean>>({});
  const [videoErrors, setVideoErrors] = useState<Record<string, string>>({});
  const [selectedAttachment, setSelectedAttachment] = useState<{index: number, url: string, filename?: string} | null>(null);
  
  // Debug selectedAttachment changes
  React.useEffect(() => {
    if (selectedAttachment) {
      console.log('ATTACHMENT STATE - Selected attachment:', selectedAttachment);
    }
  }, [selectedAttachment]);
  
  // Debug currentLessonData changes to inspect attachments
  React.useEffect(() => {
    if (currentLessonData && currentLessonData.attachments && currentLessonData.attachments.length > 0) {
      console.log('ATTACHMENT DEBUG - Current lesson attachments:', currentLessonData.attachments);
    }
  }, [currentLessonData]);
  
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

  // Create a derived state for the transformed course
  const [course, setCourse] = useState<MedicalCourse | null>(null);

  // Update the course when API data changes
  useEffect(() => {
    if (apiCourse) {
      const transformedCourse = transformCourse(apiCourse);
      setCourse(transformedCourse);
      
      // Find the current lesson if moduleId and lessonId are provided
      if (moduleId && lessonId) {
        const module = transformedCourse.sections.find(section => section.id === moduleId);
        if (module) {
          const lesson = module.lessons.find(lesson => lesson.id === lessonId);
          if (lesson) {
            setCurrentLessonData(lesson);
           
          }
        }
      } else if (transformedCourse.sections.length > 0 && transformedCourse.sections[0].lessons.length > 0) {
        // Default to the first lesson of the first section
        setCurrentLessonData(transformedCourse.sections[0].lessons[0]);
        
      }
    }
  }, [apiCourse, moduleId, lessonId]);

  // Fetch video blob when lesson changes
  useEffect(() => {
    if (currentLessonData?.type === 'video' && currentLessonData?.videoUrl) {
      // Check if we already have this video blob
      if (!videoBlobs[currentLessonData.id]) {
        
        
        // Set loading state
        setVideoLoading(prev => ({
          ...prev,
          [currentLessonData.id]: true
        }));
        
        // Clear any previous errors
        setVideoErrors(prev => {
          const newErrors = { ...prev };
          if (newErrors[currentLessonData.id]) {
            delete newErrors[currentLessonData.id];
          }
          return newErrors;
        });
        
        // Create a function to fetch the video
        const fetchVideo = async () => {
          try {
            const currentModuleId = moduleId || (course && findModuleIdForLesson(course.sections, currentLessonData.id));
            
            if (!currentModuleId) {
              throw new Error('Could not determine module ID for this lesson');
            }
            
            const response = await api.get(
              `/stream/${courseId}/modules/${currentModuleId}/lessons/${currentLessonData.id}/stream`,
              { responseType: 'blob' }
            );
            
            // Create a blob URL from the response
            const blob = new Blob([response.data], { type: 'video/mp4' });
            const blobUrl = URL.createObjectURL(blob);
            
            // Store the blob URL
            setVideoBlobs(prev => ({
              ...prev,
              [currentLessonData.id]: blobUrl
            }));
            
            
          } catch (error) {
            console.error('Error fetching video:', error);
            setVideoErrors(prev => ({
              ...prev,
              [currentLessonData.id]: error instanceof Error ? error.message : 'Failed to load video'
            }));
          } finally {
            setVideoLoading(prev => ({
              ...prev,
              [currentLessonData.id]: false
            }));
          }
        };
        
        fetchVideo();
      }
    }
    
    // Cleanup function to revoke blob URLs when component unmounts
    return () => {
      // We don't revoke URLs here because we want to keep them in cache
      // They will be revoked when navigating to a different lesson
    };
  }, [currentLessonData, courseId, moduleId, course]);

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

  // Check if user has access to the course
  const hasAccess = user && course?.enrollmentStatus === 'approved';

  const navigateToLesson = (sectionId: string, lessonId: string) => {
    if (!hasAccess) {
      setIsModalOpen(true);
      return;
    }

    // Find the lesson in the course data
    const section = course?.sections.find(section => section.id === sectionId);
    if (section) {
      const lesson = section.lessons.find(lesson => lesson.id === lessonId);
      if (lesson) {
        // If we're changing lessons and the current lesson has a video blob, 
        // we need to revoke the object URL to prevent memory leaks
        if (currentLessonData?.id !== lesson.id && 
            currentLessonData?.type === 'video' && 
            videoBlobs[currentLessonData.id]) {
          // Revoke the previous blob URL
          URL.revokeObjectURL(videoBlobs[currentLessonData.id]);
          
          // Remove the blob from state
          setVideoBlobs(prev => {
            const newBlobs = { ...prev };
            delete newBlobs[currentLessonData.id];
            return newBlobs;
          });
        }
        
        // Reset any selected attachment when changing lessons
        setSelectedAttachment(null);
        
        setCurrentLessonData(lesson);
        // Update the URL without full navigation
        window.history.pushState(
          { moduleId: sectionId, lessonId },
          '',
          `/courses/${courseId}/learn/${sectionId}/${lessonId}`
        );
      }
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Function to fetch the actual filename from the backend
  const fetchAttachmentFilename = async (attachmentUrl: string) => {
    try {
      // Make a HEAD request to get the Content-Disposition header
      const response = await api.head(attachmentUrl);
      const contentDisposition = response.headers['content-disposition'];
      
      if (contentDisposition) {
        // Extract filename from Content-Disposition header
        const filenameMatch = contentDisposition.match(/filename="(.+?)"/i);
        if (filenameMatch && filenameMatch[1]) {
          return filenameMatch[1];
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching attachment filename:', error);
      return null;
    }
  };
  
  // Function to handle attachment selection
  const handleAttachmentClick = (index: number) => {
    if (!currentLessonData || !courseId) return;
    
    // Get the current module ID
    const currentModuleId = moduleId || (course && findModuleIdForLesson(course.sections, currentLessonData.id));
    
    if (!currentModuleId) {
      console.error('Could not determine module ID for this lesson');
      return;
    }
    
    // Construct the URL for the public PDF attachment endpoint
    // Note: We're using /course-content/public/... format to match the backend route
    // The /api prefix will be added by the axios instance
    const attachmentUrl = `/course-content/public/${courseId}/modules/${currentModuleId}/lessons/${currentLessonData.id}/attachments/${index}`;
    
    console.log('Setting attachment URL:', attachmentUrl);
    
    // Update the selected attachment state
    setSelectedAttachment({
      index,
      url: attachmentUrl,
      filename: currentLessonData.attachments?.[index]?.filename || `Attachment ${index + 1}`
    });
  };

  // Calculate overall progress
  const totalLessons = course?.sections.reduce((acc, section) => acc + section.totalLessons, 0) || 0;
  const completedLessons = course?.sections.reduce((acc, section) => acc + section.completedLessons, 0) || 0;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  if (isLoading || !course) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex justify-center items-center flex-1">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
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
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      {/* Top navigation bar */}
      <div className="bg-neutral-900 text-white py-3 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(`/courses`)}
            className="mr-4 hover:text-gray-300"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <div className="flex items-center">
            <span 
              className="cursor-pointer hover:text-gray-300"
              onClick={() => navigate('/courses')}
            >
              Courses
            </span>
            <span className="mx-2">/</span>
            <span 
              className="cursor-pointer hover:text-gray-300"
              onClick={() => navigate(`/courses/${courseId}`)}
            >
              {course.title}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Course Sidebar */}
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
        />
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-white">
          <LessonContent 
            lesson={currentLessonData}
            videoBlobs={videoBlobs}
            videoLoading={videoLoading}
            videoErrors={videoErrors}
            selectedAttachment={selectedAttachment}
            handleAttachmentClick={handleAttachmentClick}
          />
        </div>
      </div>

      {/* Enrollment Modal */}
      <EnrollmentModal 
        isOpen={isModalOpen}
        courseId={courseId || ''}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};