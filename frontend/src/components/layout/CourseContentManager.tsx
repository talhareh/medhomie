import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { MainLayout } from './MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/axios';

interface Module {
  _id: string;
  title: string;
  description: string;
  order: number;
  lessons: {
    _id: string;
    title: string;
    description: string;
    video: string;
    attachments: string[];
  }[];
}

interface Course {
  _id: string;
  title: string;
  modules: Module[];
  noticeBoard: string[];
}

export const CourseContentManager: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newModule, setNewModule] = useState({ title: '', description: '' });
  const [newNotice, setNewNotice] = useState('');

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const response = await api.get<Course>(`/courses/${courseId}`);
      return response.data;
    },
  });

  const addModuleMutation = useMutation({
    mutationFn: async (moduleData: { title: string; description: string }) => {
      const response = await api.post(`/courses/${courseId}/modules`, moduleData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      setNewModule({ title: '', description: '' });
      toast.success('Module added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error adding module');
    },
  });

  const deleteModuleMutation = useMutation({
    mutationFn: async (moduleId: string) => {
      const response = await api.delete(`/courses/${courseId}/modules/${moduleId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      toast.success('Module deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error deleting module');
    },
  });

  const addNoticeMutation = useMutation({
    mutationFn: async (notice: string) => {
      const response = await api.post(`/courses/${courseId}/notices`, { notice });
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

  const removeNoticeMutation = useMutation({
    mutationFn: async (noticeId: string) => {
      const response = await api.delete(`/courses/${courseId}/notices/${noticeId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      toast.success('Notice removed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error removing notice');
    },
  });

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModule.title.trim()) return;
    addModuleMutation.mutate(newModule);
  };

  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.trim()) {
      toast.error('Notice cannot be empty');
      return;
    }
    addNoticeMutation.mutate(newNotice);
  };

  const handleRemoveNotice = (noticeId: string) => {
    if (window.confirm('Are you sure you want to remove this notice?')) {
      removeNoticeMutation.mutate(noticeId);
    }
  };

  const handleDeleteModule = (moduleId: string) => {
    if (window.confirm('Are you sure you want to delete this module? All lessons in this module will also be deleted.')) {
      deleteModuleMutation.mutate(moduleId);
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
          <h1 className="text-2xl font-bold">Course Content Manager</h1>
          <div className="space-x-4">
            <button
              onClick={() => navigate(`/admin/courses/${courseId}`)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Back to Course
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add Module Form */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Add New Module</h2>
                  <form onSubmit={handleAddModule} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={newModule.title}
                        onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={newModule.description}
                        onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                      disabled={addModuleMutation.status === 'pending'}
                    >
                      {addModuleMutation.status === 'pending' ? 'Adding...' : 'Add Module'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Modules List */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Course Modules</h2>
                  {course?.modules && course.modules.length > 0 ? (
                    <div className="space-y-4">
                      {course.modules.map((module) => (
                        <div key={module._id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{module.title}</h3>
                              <p className="text-gray-600">{module.description}</p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => navigate(`/admin/courses/${courseId}/modules/${module._id}/lessons`)}
                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                              >
                                Manage Lessons
                              </button>
                              <button
                                onClick={() => handleDeleteModule(module._id)}
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                disabled={deleteModuleMutation.status === 'pending'}
                              >
                                {deleteModuleMutation.status === 'pending' ? 'Deleting...' : 'Delete'}
                              </button>
                            </div>
                          </div>
                          {module.lessons && module.lessons.length > 0 && (
                            <div className="mt-3">
                              <h4 className="font-medium text-sm text-gray-700 mb-2">Lessons:</h4>
                              <ul className="list-disc list-inside text-sm text-gray-600">
                                {module.lessons.map((lesson) => (
                                  <li key={lesson._id}>{lesson.title}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No modules added yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Notice Board Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Notice Board</h2>
              <div className="space-y-6">
                {/* Add Notice Form */}
                <form onSubmit={handleAddNotice} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Notice
                    </label>
                    <textarea
                      value={newNotice}
                      onChange={(e) => setNewNotice(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Enter notice content..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                    disabled={addNoticeMutation.status === 'pending'}
                  >
                    {addNoticeMutation.status === 'pending' ? 'Adding...' : 'Add Notice'}
                  </button>
                </form>

                {/* Notices List */}
                <div className="space-y-4">
                  {course?.noticeBoard && course.noticeBoard.length > 0 ? (
                    course.noticeBoard.map((notice, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 flex justify-between items-start"
                      >
                        <p className="text-gray-700">{notice}</p>
                        <button
                          onClick={() => handleRemoveNotice(index.toString())}
                          className="ml-4 text-red-500 hover:text-red-600"
                          disabled={removeNoticeMutation.status === 'pending'}
                        >
                          {removeNoticeMutation.status === 'pending' ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No notices posted yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
