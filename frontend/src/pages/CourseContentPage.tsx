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
      console.log('API Course data received:', apiCourse);
      const transformedCourse = transformCourse(apiCourse);
      console.log('Transformed course data:', transformedCourse);
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
    console.log('useEffect for video fetching triggered with currentLessonData:', currentLessonData?.id);
    console.log('Current lesson data details:', {
      type: currentLessonData?.type,
      videoUrl: currentLessonData?.videoUrl,
      hasVideo: !!currentLessonData?.videoUrl
    });
    
    // Check if the current lesson is a video type and has a videoUrl
    if (currentLessonData?.type === 'video' && currentLessonData?.videoUrl) {
      // Set loading state to true immediately
      setVideoLoading(prev => {
        const newLoading = {
          ...prev,
          [currentLessonData.id]: true
        };
        console.log('Setting loading state to true for lesson:', currentLessonData.id, newLoading);
        return newLoading;
      });
      console.log('Current lesson is a video with URL:', currentLessonData.videoUrl);
      // Check if we already have this video blob
      if (!videoBlobs[currentLessonData.id]) {
        console.log('Video blob not found in cache, will fetch from server');
        
        
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
          console.log('fetchVideo function called');
          try {
            const currentModuleId = moduleId || (course && findModuleIdForLesson(course.sections, currentLessonData.id));
            console.log('Determined moduleId for video fetch:', currentModuleId);
            
            if (!currentModuleId) {
              throw new Error('Could not determine module ID for this lesson');
            }
            
            console.log('Making API request to:', `/stream/${courseId}/modules/${currentModuleId}/lessons/${currentLessonData.id}/stream`);
            // Use the videoUrl directly from the lesson data
            // Remove any /api prefix if it exists since axios already adds it
            let videoUrl = currentLessonData.videoUrl;
            if (videoUrl.startsWith('/api/')) {
              videoUrl = videoUrl.substring(4);
            }
            
            console.log('Making API request using videoUrl:', videoUrl);
            
            const response = await api.get(
              videoUrl,
              { responseType: 'blob' }
            );
            console.log('API response received:', response.status);
            
            // Create a blob URL from the response
            console.log('Creating blob from response data, size:', response.data.size);
            console.log('Response headers:', response.headers);
            
            // Get content type from response headers or default to video/mp4
            const contentType = response.headers['content-type'] || 'video/mp4';
            console.log('Using content type for blob:', contentType);
            
            const blob = new Blob([response.data], { type: contentType });
            console.log('Blob created:', blob.size, 'bytes, type:', blob.type);
            const blobUrl = URL.createObjectURL(blob);
            console.log('Blob URL created:', blobUrl);
            
            // Store the blob URL
            console.log('Storing blob URL for lesson:', currentLessonData.id);
            setVideoBlobs(prev => {
              const newBlobs = {
                ...prev,
                [currentLessonData.id]: blobUrl
              };
              console.log('Updated videoBlobs state:', newBlobs);
              return newBlobs;
            });
            
            // Set loading state to false after successful fetch
            setVideoLoading(prev => {
              const newLoading = {
                ...prev,
                [currentLessonData.id]: false
              };
              console.log('Setting loading state to false for lesson:', currentLessonData.id, newLoading);
              return newLoading;
            });
            
          } catch (error) {
            console.error('Error fetching video:', error);
            setVideoErrors(prev => ({
              ...prev,
              [currentLessonData.id]: error instanceof Error ? error.message : 'Failed to load video'
            }));
          } finally {
            setVideoLoading(prev => {
              const newLoading = {
                ...prev,
                [currentLessonData.id]: false
              };
              console.log('Setting loading state to false in finally block for lesson:', currentLessonData.id, newLoading);
              return newLoading;
            });
          }
        };
        
        fetchVideo();
      } else {
        console.log('Video blob already exists in cache for lesson:', currentLessonData.id);
      }
    }
    
    // Cleanup function to revoke blob URLs when component unmounts
    return () => {
      // We don't revoke URLs here because we want to keep them in cache
      // They will be revoked when navigating to a different lesson
    };
  }, [currentLessonData?.id, courseId, moduleId, course]);

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
          hasVideo: !!lesson.videoUrl
        });
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
        console.log('URL updated, currentLessonData has been set to:', lesson.id);
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