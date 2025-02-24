import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/axios';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  image?: string;
  enrollmentCount: number;
  createdAt: string;
}

export const CoursesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await api.get<Course[]>('/courses');
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (courseId: string) => {
      await api.delete(`/courses/${courseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['courses']);
      toast.success('Course deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error deleting course');
    },
  });

  const handleDelete = (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      deleteMutation.mutate(courseId);
    }
  };

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Courses</h1>
          <button
            onClick={() => navigate('/admin/courses/new')}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Add New Course
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No courses found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {course.image && (
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
                  <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold">${course.price}</span>
                    <span className="text-sm text-gray-500">
                      {course.enrollmentCount} enrolled
                    </span>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => navigate(`/admin/courses/${course._id}/edit`)}
                      className="flex-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => navigate(`/admin/courses/${course._id}/content/new`)}
                      className="flex-1 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
                    >
                      Add Content
                    </button>
                    <button
                      onClick={() => handleDelete(course._id)}
                      className="flex-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};
