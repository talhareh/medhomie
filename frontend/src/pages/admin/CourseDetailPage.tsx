import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/axios';
import { useCourseQuizzes } from '../../hooks/useQuizzes';

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

  // Fetch course quizzes
  const { data: quizzesData } = useCourseQuizzes(courseId!);
  const quizzes = quizzesData?.data?.quizzes || [];

  const addNoticeMutation = useMutation({
    mutationFn: async (notice: string) => {
      const response = await api.post(`/courses/${courseId}/notice`, { notice });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
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
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      toast.success('Content deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error deleting content');
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

  const handleClone = () => {
    if (window.confirm('Are you sure you want to clone this course? This will create a copy with all modules and lessons.')) {
      cloneMutation.mutate(courseId!);
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
              onClick={handleClone}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              disabled={cloneMutation.isPending}
            >
              {cloneMutation.isPending ? 'Cloning...' : 'Clone Course'}
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

            {/* Course Quizzes */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Course Quizzes</h2>
                <button
                  onClick={() => navigate(`/admin/quizzes/new?courseId=${courseId}`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Quiz
                </button>
              </div>
              
              {quizzes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No quizzes created yet.</p>
                  <button
                    onClick={() => navigate(`/admin/quizzes/new?courseId=${courseId}`)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Create Your First Quiz
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {quizzes.map((quiz) => (
                    <div key={quiz._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold">{quiz.title}</h3>
                          {quiz.description && (
                            <p className="text-gray-600 text-sm mt-1">{quiz.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>{quiz.questions.length} Questions</span>
                            <span>{quiz.timeLimit ? `${quiz.timeLimit} min` : 'No time limit'}</span>
                            <span>{quiz.passingScore}% passing score</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              quiz.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {quiz.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => navigate(`/admin/quizzes/${quiz._id}`)}
                            className="text-blue-600 hover:text-blue-900 text-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() => navigate(`/admin/quizzes/${quiz._id}/edit`)}
                            className="text-green-600 hover:text-green-900 text-sm"
                          >
                            Edit
                          </button>
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
