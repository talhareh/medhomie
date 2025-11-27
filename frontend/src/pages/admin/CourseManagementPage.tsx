import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { CourseForm } from '../../components/CourseForm';
import { MainLayout } from '../../components/layout/MainLayout';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  image?: string;
  content?: string[];
  noticeBoard?: string[];
}

export const CourseManagementPage: React.FC = () => {
  const { user } = useAuth();

  const { data: courses = [], isLoading, refetch } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await axios.get<Course[]>('/api/courses');
      return response.data;
    },
  });

  const handleCourseSubmit = async (courseData: Partial<Course>) => {
    try {
      if (courseData._id) {
        // Update existing course
        await axios.put(`/api/courses/${courseData._id}`, courseData);
        toast.success('Course updated successfully');
      } else {
        // Create new course
        await axios.post('/api/courses', courseData);
        toast.success('Course created successfully');
      }
      refetch(); // Refresh the courses list
    } catch (error) {
      toast.error('Failed to save course');
    }
  };

  const handleCourseDelete = async (courseId: string) => {
    try {
      await axios.delete(`/api/courses/${courseId}`);
      toast.success('Course deleted successfully');
      refetch(); // Refresh the courses list
    } catch (error) {
      toast.error('Failed to delete course');
    }
  };

  const handleCourseClone = async (courseId: string) => {
    try {
      const response = await axios.post(`/api/courses/${courseId}/clone`);
      toast.success('Course cloned successfully');
      refetch(); // Refresh the courses list
      // Optionally navigate to the cloned course
      // window.location.href = `/admin/courses/${response.data.course._id}/edit`;
    } catch (error) {
      toast.error('Failed to clone course');
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Course Management</h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Course</h2>
          <CourseForm />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Existing Courses</h2>
          {isLoading ? (
            <div>Loading courses...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course._id} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <p className="text-gray-800 mb-4">Price: ${course.price}</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCourseSubmit(course)}
                      className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleCourseClone(course._id)}
                      className="flex-1 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                    >
                      Clone
                    </button>
                    <button
                      onClick={() => handleCourseDelete(course._id)}
                      className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
