import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/axios';
import { MainLayout } from '../../components/layout/MainLayout';
import { Course } from '../../types/course';
import { EnrollmentStatus } from '../../types/enrollment';
import { EnrollmentModal } from '../../components/common/EnrollmentModal';

// Extend Course interface to include enrollment status and instructor
interface StudentCourse extends Course {
  isEnrolled?: boolean;
  enrollmentStatus?: EnrollmentStatus;
  instructor?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

/**
 * StudentCoursesPage - Renders the courses page with the student sidebar
 * This component replicates the functionality of PublicCoursesPage but within the MainLayout
 */
export const StudentCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEnrollModalOpen, setIsEnrollModalOpen] = React.useState(false);
  const [selectedCourse, setSelectedCourse] = React.useState<StudentCourse | null>(null);

  // Fetch courses
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['public-courses'],
    queryFn: async () => {
      const response = await api.get<StudentCourse[]>('/public/courses');
      return response.data;
    },
  });

  const handleEnrollClick = (course: StudentCourse) => {
    // If already enrolled or pending, don't allow re-enrollment
    if (course.isEnrolled && course.enrollmentStatus !== EnrollmentStatus.REJECTED) {
      return;
    }

    setSelectedCourse(course);
    setIsEnrollModalOpen(true);
  };

  if (isLoadingCourses) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Available Courses</h1>
          <div className="text-sm text-gray-600">
            {courses.length} course{courses.length !== 1 ? 's' : ''} available
          </div>
        </div>
        
        {/* Course Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div key={course._id.toString()} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Course Thumbnail */}
                <div className="h-40 md:h-48 bg-gray-200 relative">
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
                      <span className="text-gray-400 text-sm">No image available</span>
                    </div>
                  )}
                </div>
                
                {/* Course Info */}
                <div className="p-4 md:p-6">
                  <h3
                    className="text-lg md:text-xl font-bold mb-2 text-gray-900 cursor-pointer hover:text-blue-600 transition-colors line-clamp-2"
                    onClick={() => navigate(`/courses/${course._id}`)}
                  >
                    {course.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {course.description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                    <div className="text-lg md:text-xl font-bold text-green-600">
                      ${course.price}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>{course.instructor?.firstName} {course.instructor?.lastName}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => navigate(`/courses/${course._id}`)}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-200 transition-colors"
                    >
                      View Details
                    </button>
                    
                    {course.isEnrolled && course.enrollmentStatus !== EnrollmentStatus.REJECTED ? (
                      <button
                        disabled
                        className="flex-1 bg-gray-400 text-white px-4 py-2 rounded text-sm cursor-not-allowed"
                      >
                        {course.enrollmentStatus === EnrollmentStatus.PENDING ? 'Pending' : 'Enrolled'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnrollClick(course)}
                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        Enroll Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No courses available at the moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* Enrollment Modal */}
      {selectedCourse && (
        <EnrollmentModal
          isOpen={isEnrollModalOpen}
          onClose={() => {
            setIsEnrollModalOpen(false);
            setSelectedCourse(null);
          }}
          selectedCourse={selectedCourse}
        />
      )}
    </MainLayout>
  );
};
