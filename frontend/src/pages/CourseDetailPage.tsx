import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faClock, faCheck, faChevronRight, faChevronDown, faLock } from '@fortawesome/free-solid-svg-icons';
import { Header } from '../components/common/Header';
import api from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import { EnrollmentStatus } from './PublicCoursesPage';
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

interface Lesson {
  _id: string;
  title: string;
  description: string;
  order: number;
  duration?: number;
  isPreview: boolean;
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

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  // Check if user has access to the course
  const hasAccess = user && course?.enrollmentStatus === 'approved';

  const handleLessonClick = (moduleId: string, lessonId: string) => {
    if (hasAccess) {
      navigate(`/courses/${courseId}/learn`, { 
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
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
      <Header />
      
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
                <div>
                  <span>{course.enrollmentCount} students enrolled</span>
                </div>
              </div>

              {/* Enrollment Status */}
              {course.enrollmentStatus && (
                <span className={`inline-block mt-4 px-3 py-1 rounded-full text-sm ${
                  course.enrollmentStatus === 'approved' 
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
                    <button 
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                        bg-primary hover:bg-primary/90 text-white rounded-full w-16 h-16 flex items-center justify-center
                        transition-colors duration-200"
                    >
                      <FontAwesomeIcon icon={faPlay} size="lg" />
                    </button>
                  </div>
                )}
                <div className="p-6">
                  <div className="text-3xl font-bold mb-6">Rs. {course.price}</div>
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

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-neutral-800 mb-8">Course Content</h2>
        
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
                    onClick={() => toggleModule(module._id)}
                    className="w-full p-6 border-b border-neutral-200 flex justify-between items-center hover:bg-neutral-50 transition-colors"
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
                            className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors cursor-pointer"
                            onClick={() => handleLessonClick(module._id, lesson._id)}
                          >
                            <div className="flex items-center space-x-3">
                              {hasAccess || lesson.isPreview ? (
                                <FontAwesomeIcon 
                                  icon={faPlay} 
                                  className={lesson.isPreview ? 'text-primary' : 'text-neutral-400'} 
                                />
                              ) : (
                                <FontAwesomeIcon icon={faLock} className="text-neutral-400" />
                              )}
                              <div>
                                <h4 className={`font-medium ${hasAccess || lesson.isPreview ? 'text-neutral-800' : 'text-neutral-400'}`}>
                                  {lesson.title}
                                </h4>
                                {lesson.isPreview && (
                                  <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                                    Preview
                                  </span>
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
