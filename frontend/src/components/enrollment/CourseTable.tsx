import React, { useState } from 'react';
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-64 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
        />
      </div>

      <div className="overflow-x-auto">
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
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No courses found
                </td>
              </tr>
            ) : (
              courses.map((course) => (
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
