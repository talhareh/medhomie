import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { Course, Category } from '../types/course';
import { getAllCategories } from '../services/categoryService';
import Modal from 'react-modal';
import MedicMenu from './medicMaterial/MedicMenu';
import MedicFooter from './medicMaterial/MedicFooter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faSearch, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { EnrollmentModal } from '../components/common/EnrollmentModal';

const COURSES_PER_PAGE = 8;



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
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch categories from database
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories
  });

  // Fetch courses with category filter
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['public-courses', selectedCategory],
    queryFn: async () => {
      const params = selectedCategory ? { category: selectedCategory } : {};
      const response = await api.get<PublicCourse[]>('/public/courses', { params });
      return response.data;
    },
  });

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // Calculate pagination values
  const totalPages = Math.ceil(courses.length / COURSES_PER_PAGE);
  const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
  const endIndex = startIndex + COURSES_PER_PAGE;
  const currentCourses = courses.slice(startIndex, endIndex);

  // Calculate display range
  const startDisplay = courses.length > 0 ? startIndex + 1 : 0;
  const endDisplay = Math.min(endIndex, courses.length);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

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

  if (isLoadingCourses || isLoadingCategories) {
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
              onClick={() => {
                setSelectedCategory('');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === '' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Categories
            </button>
            {categories.map((category: Category) => (
              <button
                key={category._id}
                onClick={() => {
                  setSelectedCategory(category._id);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category._id 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Available Courses Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Available Courses</h2>
            {courses.length > 0 && (
              <p className="text-sm text-gray-600">
                Showing {startDisplay}-{endDisplay} of {courses.length} courses
              </p>
            )}
          </div>
          
          {/* Course Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentCourses.length > 0 ? (
              currentCourses.map((course) => (
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-center mt-12 gap-4">
            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((page, index) => {
                if (page === '...') {
                  return (
                    <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page as number)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          </div>
        )}
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
