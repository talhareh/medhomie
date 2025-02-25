import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/axios';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  thumbnail?: string;
  banner?: string;
  modules: {
    _id: string;
    title: string;
    description: string;
    lessons: {
      _id: string;
      title: string;
      description: string;
      video: string;
      attachments: string[];
    }[];
  }[];
  content: {
    _id: string;
    title: string;
    description: string;
    video: string;
    attachments: string[];
  }[];
  noticeBoard: string[];
  state: string;
  enrollmentCount: number;
  createdAt: string;
  updatedAt: string;
}

export const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newNotice, setNewNotice] = useState('');

  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      try {
        const response = await api.get<Course>(`/courses/${courseId}`);
        return response.data;
      } catch (error: any) {
        console.error('Error fetching course:', error.response?.data || error);
        throw error;
      }
    },
  });

  const addNoticeMutation = useMutation({
    mutationFn: async (notice: string) => {
      const response = await api.post(`/courses/${courseId}/notice`, { notice });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['course', courseId]);
      setNewNotice('');
      toast.success('Notice added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error adding notice');
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: async (contentId: string) => {
      await api.delete(`/courses/${courseId}/content/${contentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['course', courseId]);
      toast.success('Content deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error deleting content');
    },
  });

  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.trim()) {
      toast.error('Notice cannot be empty');
      return;
    }
    addNoticeMutation.mutate(newNotice);
  };

  const handleDeleteContent = (contentId: string) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      deleteContentMutation.mutate(contentId);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !course) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">Failed to load course details.</p>
            <button
              onClick={() => navigate('/admin/courses')}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <div className="space-x-4">
            <button
              onClick={() => navigate(`/admin/courses/${courseId}/edit`)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Edit Course
            </button>
            <button
              onClick={() => navigate(`/admin/courses/${courseId}/content`)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Manage Content
            </button>
            <button
              onClick={() => navigate('/admin/courses')}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Back to Courses
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Details */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              {course.banner && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Course Banner</h3>
                  <img
                    src={course.banner.replace('uploads/', '/api/uploads/')}
                    alt={`${course.title} banner`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              {course.thumbnail && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Course Thumbnail</h3>
                  <img
                    src={course.thumbnail.replace('uploads/', '/api/uploads/')}
                    alt={`${course.title} thumbnail`}
                    className="w-64 h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              <p className="text-gray-600 mb-4">{course.description}</p>
              <p className="text-lg font-bold">Price: ${course.price}</p>
              <p className="text-sm text-gray-500 mt-2">State: {course.state}</p>
              <p className="text-sm text-gray-500">Enrollments: {course.enrollmentCount}</p>
            </div>

            {/* Course Modules */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Course Modules</h2>
              {!course.modules || course.modules.length === 0 ? (
                <p className="text-gray-500">No modules added yet.</p>
              ) : (
                <div className="space-y-4">
                  {course.modules.map((module) => (
                    <div key={module._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{module.title}</h3>
                          <p className="text-gray-600">{module.description}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {module.lessons?.length || 0} Lessons
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Course Content */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Course Content</h2>
              {!course.content || course.content.length === 0 ? (
                <p className="text-gray-500">No content added yet.</p>
              ) : (
                <div className="space-y-4">
                  {course.content.map((item) => (
                    <div key={item._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-gray-600">{item.description}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteContent(item._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                      {item.attachments.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Attachments:</p>
                          <ul className="list-disc list-inside text-sm text-blue-500">
                            {item.attachments.map((attachment, index) => (
                              <li key={index}>
                                <a 
                                  href={`/api/${attachment}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {attachment.split('/').pop()}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notice Board */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Notice Board</h2>
              
              <form onSubmit={handleAddNotice} className="mb-6">
                <textarea
                  value={newNotice}
                  onChange={(e) => setNewNotice(e.target.value)}
                  className="w-full p-2 border rounded-lg mb-2"
                  rows={3}
                  placeholder="Add a new notice..."
                />
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add Notice
                </button>
              </form>

              {course.noticeBoard.length === 0 ? (
                <p className="text-gray-500">No notices yet.</p>
              ) : (
                <div className="space-y-4">
                  {course.noticeBoard.map((notice, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <p className="text-gray-600">{notice}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
