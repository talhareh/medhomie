import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { Course } from '../types/course';
import Modal from 'react-modal';
import MedicMenu from './medicMaterial/MedicMenu';
import MedicFooter from './medicMaterial/MedicFooter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faSearch } from '@fortawesome/free-solid-svg-icons';
import { EnrollmentModal } from '../components/common/EnrollmentModal';



// Add enrollment status type
export enum EnrollmentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// Extend Course interface to include enrollment status
interface PublicCourse extends Course {
  isEnrolled?: boolean;
  enrollmentStatus?: EnrollmentStatus;
}

const customModalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    padding: '2rem',
    borderRadius: '0.5rem',
    overflow: 'auto',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    overflow: 'auto',
    paddingTop: '2rem',
    paddingBottom: '2rem',
  },
};



export const PublicCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<PublicCourse | null>(null);
  
  // New state for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Medical specialization categories for filtering
  const categories = [
    'MRCOG',
    'FCPS',
    'MCPS',
    'IMM',
    'GULF'
  ];

  // Fetch courses
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['public-courses'],
    queryFn: async () => {
      const response = await api.get<PublicCourse[]>('/public/courses');
      return response.data;
    },
  });

  const handleEnrollClick = (course: PublicCourse) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    // If already enrolled or pending, don't allow re-enrollment
    if (course.isEnrolled && course.enrollmentStatus !== EnrollmentStatus.REJECTED) {
      return;
    }

    setSelectedCourse(course);
    setIsEnrollModalOpen(true);
  };

  if (isLoadingCourses) {
    return (
      <div className="min-h-screen bg-background">
        <MedicMenu />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MedicMenu />
      
      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex gap-4 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <FontAwesomeIcon 
                icon={faSearch} 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
            <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
              Search
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === '' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Available Courses Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Available Courses</h2>
          
          {/* Course Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course._id.toString()} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Course Thumbnail */}
                  <div className="h-48 bg-gray-200 relative">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail.startsWith('http') ? course.thumbnail : course.thumbnail.replace('uploads/', '/api/uploads/')}
                        alt={course.title}
                        className="w-full h-full object-cover p-1 object-right-top"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/placeholder-course.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400">No image available</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Course Info */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3 text-sm">{course.description}</p>
                    
                    {/* Course Duration and Credits */}
                    <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                      <span>8 weeks</span>
                      <span>15 CME</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-primary">
                        {course.price > 0 ? `$${course.price.toFixed(2)}` : 'Free'}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/courses/${course._id}`)}
                          className="px-3 py-1 rounded text-white bg-gray-600 hover:bg-gray-700 text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEnrollClick(course)}
                          className={`px-3 py-1 rounded text-white text-sm ${
                            course.isEnrolled
                              ? course.enrollmentStatus === EnrollmentStatus.APPROVED
                                ? 'bg-green-500 cursor-default'
                                : course.enrollmentStatus === EnrollmentStatus.REJECTED
                                ? 'bg-red-500 cursor-default'
                                : 'bg-yellow-500 cursor-default'
                              : 'bg-primary hover:bg-primary-dark'
                          }`}
                          disabled={course.isEnrolled && course.enrollmentStatus !== EnrollmentStatus.REJECTED}
                        >
                          {course.isEnrolled
                            ? course.enrollmentStatus === EnrollmentStatus.APPROVED
                              ? 'Enrolled'
                              : course.enrollmentStatus === EnrollmentStatus.REJECTED
                              ? 'Rejected'
                              : 'Pending'
                            : 'Enroll'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-4 flex justify-center items-center py-16">
                <p className="text-gray-500 text-lg">No courses available at the moment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Previous Courses Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Previous Courses</h2>
          
          {/* Previous Course Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.slice(0, 4).map((course) => (
              <div key={`prev-${course._id.toString()}`} className="bg-white rounded-lg shadow-md overflow-hidden opacity-75">
                {/* Course Thumbnail */}
                <div className="h-48 bg-gray-200 relative">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail.startsWith('http') ? course.thumbnail : course.thumbnail.replace('uploads/', '/api/uploads/')}
                      alt={course.title}
                      className="w-full h-full object-cover p-1 object-right-top"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/placeholder-course.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                </div>
                
                {/* Course Info */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3 text-sm">{course.description}</p>
                  
                  {/* Course Duration and Credits */}
                  <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                    <span>6 weeks</span>
                    <span>12 CVF</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-500">
                      Completed
                    </span>
                    <button
                      onClick={() => navigate(`/courses/${course._id}`)}
                      className="px-3 py-1 rounded text-white bg-gray-600 hover:bg-gray-700 text-sm"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-12">
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  page === 1 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>

      <MedicFooter />

      {/* Login Prompt Modal */}
      <Modal
        isOpen={isLoginModalOpen}
        onRequestClose={() => setIsLoginModalOpen(false)}
        style={customModalStyles}
        contentLabel="Login Required"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to enroll in a course. Please login or create an account to continue.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                setIsLoginModalOpen(false);
                navigate('/auth?mode=login', { state: { from: '/courses' } });
              }}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLoginModalOpen(false);
                navigate('/auth?mode=register', { state: { from: '/courses' } });
              }}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Register
            </button>
          </div>
        </div>
      </Modal>

      {/* Enrollment Modal */}
      <EnrollmentModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        selectedCourse={selectedCourse}
      />
    </div>
  );
};
