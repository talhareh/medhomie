import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/axios';
import { Course, CourseState } from '../../types/course';

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
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error deleting course');
    },
  });

  const cloneMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const response = await api.post(`/courses/${courseId}/clone`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course cloned successfully');
      // Navigate to the cloned course edit page
      navigate(`/admin/courses/${data.course._id}/edit`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error cloning course');
    },
  });

  const handleDelete = (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      deleteMutation.mutate(courseId);
    }
  };

  const handleClone = (courseId: string) => {
    if (window.confirm('Are you sure you want to clone this course? This will create a copy with all modules and lessons.')) {
      cloneMutation.mutate(courseId);
    }
  };

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  const getStateColor = (state: CourseState) => {
    switch (state) {
      case CourseState.ACTIVE:
        return 'bg-green-100 text-green-800';
      case CourseState.DRAFT:
        return 'bg-yellow-100 text-yellow-800';
      case CourseState.INACTIVE:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
                {course.thumbnail && (
                  <img
                    src={course.thumbnail.replace('uploads/', '/api/uploads/')}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/placeholder-image.png';
                    }}
                  />
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold">{course.title}</h2>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(course.state)}`}>
                      {course.state}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold">${course.price}</span>
                    <span className="text-sm text-gray-500">
                      {course.enrollmentCount} enrolled
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/admin/courses/${course._id}/edit`)}
                      className="flex-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => navigate(`/admin/courses/${course._id}`)}
                      className="flex-1 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
                    >
                      Content
                    </button>
                    <button
                      onClick={() => handleClone(course._id)}
                      className="flex-1 bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600"
                      disabled={cloneMutation.isPending}
                    >
                      {cloneMutation.isPending ? 'Cloning...' : 'Clone'}
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
