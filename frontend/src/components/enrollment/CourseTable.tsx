import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CourseWithEnrollment } from '../../types/enrollment';
import { EnrollStudentsModal } from './EnrollStudentsModal';
import { RemoveStudentsModal } from './RemoveStudentsModal';
import { courseService } from '../../services/courseService';
import { enrollmentService } from '../../services/enrollmentService';
import { toast } from 'react-toastify';

interface Course {
  _id: string;
  title: string;
  instructor: {
    _id: string;
    fullName: string;
  };
  status: string;
  enrolledCount: number;
}

export const CourseTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);

  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ['courses', searchTerm],
    queryFn: () => courseService.getAllCourses(searchTerm),
    keepPreviousData: true
  });

  const handleEnrollStudents = async (studentIds: string[]) => {
    try {
      if (!selectedCourse) return;
      await enrollmentService.bulkEnrollStudents(selectedCourse._id, studentIds);
      toast.success('Students enrolled successfully');
      setIsEnrollModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to enroll students');
    }
  };

  const handleRemoveStudents = async (studentIds: string[]) => {
    try {
      if (!selectedCourse) return;
      await enrollmentService.bulkRemoveStudents(selectedCourse._id, studentIds);
      toast.success('Students removed successfully');
      setIsRemoveModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove students');
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(courses.length / itemsPerPage);
  const indexOfLastCourse = currentPage * itemsPerPage;
  const indexOfFirstCourse = indexOfLastCourse - itemsPerPage;
  const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Instructor
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Enrolled Students
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentCourses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No courses found
                </td>
              </tr>
            ) : (
              currentCourses.map((course) => (
                <tr key={course._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {course.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.instructor.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      course.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.enrolledCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        setIsEnrollModalOpen(true);
                      }}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        setIsRemoveModalOpen(true);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
          </div>

          {/* Pagination */}
          {courses.length > 0 && (
            <div className="bg-white rounded-lg shadow px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstCourse + 1}</span> to{' '}
                <span className="font-medium">{Math.min(indexOfLastCourse, courses.length)}</span> of{' '}
                <span className="font-medium">{courses.length}</span> courses
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {selectedCourse && (
        <>
          <EnrollStudentsModal
            isOpen={isEnrollModalOpen}
            onClose={() => {
              setIsEnrollModalOpen(false);
              setSelectedCourse(null);
            }}
            courseId={selectedCourse._id}
            courseTitle={selectedCourse.title}
            onEnroll={handleEnrollStudents}
          />
          <RemoveStudentsModal
            isOpen={isRemoveModalOpen}
            onClose={() => {
              setIsRemoveModalOpen(false);
              setSelectedCourse(null);
            }}
            courseId={selectedCourse._id}
            courseTitle={selectedCourse.title}
            onRemove={handleRemoveStudents}
          />
        </>
      )}
    </div>
  );
};
