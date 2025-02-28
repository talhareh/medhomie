// CourseContentPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronDown, 
  faChevronRight, 
  faPlay, 
  faFile, 
  faLock, 
  faCheck, 
  faClock,
  faArrowLeft,
  faEllipsisV
} from '@fortawesome/free-solid-svg-icons';
import { Header } from '../components/common/Header';
import { useAuth } from '../contexts/AuthContext';
import { EnrollmentStatus } from './PublicCoursesPage';
import api from '../utils/axios';
import { useQuery } from '@tanstack/react-query';
import Modal from 'react-modal';

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

// Define interfaces for the course content
interface ApiLesson {
  _id: string;
  title: string;
  description: string;
  order: number;
  duration?: number;
  video?: string;
  attachments: string[];
  isPreview: boolean;
}

interface ApiModule {
  _id: string;
  title: string;
  description: string;
  order: number;
  lessons: ApiLesson[];
}

interface ApiCourse {
  _id: string;
  title: string;
  description: string;
  price: number;
  thumbnail?: string;
  banner?: string;
  enrollmentCount: number;
  modules: ApiModule[];
  enrollmentStatus?: string | null;
  noticeBoard: string[];
}

// Internal interfaces for the UI
interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  type: 'video' | 'file' | 'quiz';
  content?: string;
  videoUrl?: string;
  description: string;
  isPreview: boolean;
}

interface Section {
  id: string;
  title: string;
  duration: string;
  completedLessons: number;
  totalLessons: number;
  expanded: boolean;
  lessons: Lesson[];
  description: string;
}

interface MedicalCourse {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  rating: number;
  ratingCount: number;
  lastUpdated: string;
  totalHours: number;
  studentsCount: number;
  sections: Section[];
  enrollmentStatus?: string | null;
}

export const CourseContentPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [currentLessonData, setCurrentLessonData] = useState<Lesson | null>(null);
  
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

  // Transform API course data to our internal format
  const transformCourse = (apiCourse: ApiCourse): MedicalCourse => {
    // Calculate total duration in hours
    const totalMinutes = apiCourse.modules.reduce((acc, module) => {
      return acc + module.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);
    }, 0);
    
    const totalHours = Math.floor(totalMinutes / 60);
    
    // Transform modules to sections
    const sections = apiCourse.modules
      .sort((a, b) => a.order - b.order)
      .map(module => {
        const lessons = module.lessons
          .sort((a, b) => a.order - b.order)
          .map(lesson => ({
            id: lesson._id,
            title: lesson.title,
            duration: `${lesson.duration || 0}min`,
            completed: false, // We'll need to fetch this from user progress
            type: lesson.video ? 'video' : 'file',
            content: lesson.description,
            videoUrl: lesson.video,
            description: lesson.description,
            isPreview: lesson.isPreview
          }));
        
        return {
          id: module._id,
          title: module.title,
          description: module.description,
          duration: `${module.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0)}min`,
          completedLessons: 0, // We'll need to fetch this from user progress
          totalLessons: lessons.length,
          expanded: module._id === moduleId, // Expand the module if it's the one from the navigation
          lessons
        };
      });
    
    return {
      _id: apiCourse._id,
      title: apiCourse.title,
      description: apiCourse.description,
      instructor: 'Course Instructor', // This would come from the API
      rating: 0, // This would come from the API
      ratingCount: 0, // This would come from the API
      lastUpdated: new Date().toLocaleDateString(),
      totalHours,
      studentsCount: apiCourse.enrollmentCount,
      sections,
      enrollmentStatus: apiCourse.enrollmentStatus
    };
  };

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

  // Check if user has access to the course
  const hasAccess = user && course?.enrollmentStatus === 'approved';

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

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

  const closeModal = () => {
    setIsModalOpen(false);
  };

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

  // Calculate overall progress
  const totalLessons = course.sections.reduce((acc, section) => acc + section.totalLessons, 0);
  const completedLessons = course.sections.reduce((acc, section) => acc + section.completedLessons, 0);
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      {/* Top navigation bar */}
      <div className="bg-neutral-900 text-white py-3 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(`/courses/${courseId}`)}
            className="mr-4 hover:text-gray-300"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h1 className="text-lg font-medium truncate max-w-md">{course.title}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm">Your progress</span>
          <div className="w-32 h-2 bg-gray-700 rounded-full">
            <div 
              className="h-full bg-primary rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <button className="px-3 py-1 border border-white rounded hover:bg-white hover:text-black transition-colors">
            Share
          </button>
          <button className="text-lg">
            <FontAwesomeIcon icon={faEllipsisV} />
          </button>
        </div>
      </div>
      
      <div className="flex flex-1">
        {/* Sidebar - Course Content */}
        <div className="w-80 border-r border-gray-200 bg-white overflow-auto">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-bold text-lg">Course content</h2>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <span>{totalLessons} lessons</span>
              <span className="mx-2">•</span>
              <span>{course.totalHours} hours total</span>
            </div>
          </div>
          
          {/* Sections and Lessons */}
          <div className="divide-y divide-gray-200">
            {course.sections.map(section => (
              <div key={section.id} className="bg-white">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <FontAwesomeIcon 
                      icon={expandedSections[section.id] || section.expanded ? faChevronDown : faChevronRight} 
                      className="text-gray-500 mr-3"
                    />
                    <div className="text-left">
                      <h3 className="font-medium">Section {section.id.slice(-4)}: {section.title}</h3>
                      <div className="text-xs text-gray-500 mt-1">
                        <span>{section.completedLessons}/{section.totalLessons} | {section.duration}</span>
                      </div>
                    </div>
                  </div>
                </button>
                
                {(expandedSections[section.id] || section.expanded) && (
                  <div className="bg-gray-50">
                    {section.lessons.map(lesson => (
                      <button
                        key={lesson.id}
                        onClick={() => navigateToLesson(section.id, lesson.id)}
                        className={`w-full px-4 py-3 flex items-center hover:bg-gray-100 ${
                          currentLessonData?.id === lesson.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="w-8 flex-shrink-0">
                          {!hasAccess && !lesson.isPreview ? (
                            <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                          ) : lesson.completed ? (
                            <FontAwesomeIcon icon={faCheck} className="text-green-500" />
                          ) : (
                            <FontAwesomeIcon 
                              icon={lesson.type === 'video' ? faPlay : faFile} 
                              className={lesson.isPreview ? 'text-primary' : 'text-gray-400'}
                            />
                          )}
                        </div>
                        <div className="flex-grow text-left">
                          <p className={`${lesson.completed ? 'text-green-500' : ''}`}>
                            {lesson.title}
                          </p>
                          {lesson.isPreview && (
                            <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                              Preview
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <FontAwesomeIcon icon={faClock} className="mr-1" />
                          <span>{lesson.duration}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {currentLessonData && (
            <>
              {/* Video Player */}
              {currentLessonData.type === 'video' && (
                <div className="bg-black aspect-video flex items-center justify-center">
                  {currentLessonData.videoUrl ? (
                    <video 
                      controls 
                      className="w-full h-full"
                      src={currentLessonData.videoUrl.replace('uploads/', '/api/uploads/')}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="text-white text-center">
                      <FontAwesomeIcon icon={faPlay} className="text-6xl mb-4" />
                      <p className="text-xl">Video Player Placeholder</p>
                      <p className="text-sm mt-2">Currently playing: {currentLessonData.title}</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Lesson Content */}
              <div className="p-6 flex-1">
                <h2 className="text-2xl font-bold mb-4">{currentLessonData.title}</h2>
                <div className="flex items-center text-sm text-gray-600 mb-6">
                  <FontAwesomeIcon icon={faClock} className="mr-1" />
                  <span>{currentLessonData.duration}</span>
                </div>
                
                <div className="prose max-w-none">
                  <p>{currentLessonData.content || currentLessonData.description}</p>
                </div>
              </div>
            </>
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
