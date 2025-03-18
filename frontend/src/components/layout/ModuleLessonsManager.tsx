import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { MainLayout } from './MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/axios';

interface Lesson {
  _id: string;
  title: string;
  description: string;
  video: string;
  attachments: string[];
}

interface Module {
  _id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export const ModuleLessonsManager: React.FC = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    video: null as File | null,
    attachments: [] as File[]
  });
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const cancelTokenRef = useRef<AbortController | null>(null);

  const { data: module, isLoading } = useQuery({
    queryKey: ['module', moduleId],
    queryFn: async () => {
      const response = await api.get<Module>(`/courses/${courseId}/modules/${moduleId}`);
      return response.data;
    },
  });

  const cancelUpload = () => {
    if (cancelTokenRef.current && isUploading) {
      cancelTokenRef.current.abort();
      setIsUploading(false);
      setUploadProgress(0);
      toast.info('Upload cancelled');
    }
  };

  const addLessonMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const url = `/course-content/${courseId}/modules/${moduleId}/lessons`;
      console.log('Sending request to:', url);
      console.log('FormData contents:');
      for (const [key, value] of formData.entries()) {
        console.log(key, ':', value);
      }
      
      // Reset progress and set uploading state
      setUploadProgress(0);
      setIsUploading(true);
      
      // Create a new AbortController for this request
      cancelTokenRef.current = new AbortController();
      
      try {
        const response = await api.post(
          url,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
              setUploadProgress(percentCompleted);
            },
            signal: cancelTokenRef.current.signal
          }
        );
        return response.data;
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['module', moduleId]);
      setNewLesson({ title: '', description: '', video: null, attachments: [] });
      setUploadProgress(0);
      toast.success('Lesson added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error adding lesson');
    },
  });

  const updateLessonMutation = useMutation({
    mutationFn: async ({ lessonId, formData }: { lessonId: string; formData: FormData }) => {
      const url = `/course-content/${courseId}/modules/${moduleId}/lessons/${lessonId}`;
      console.log('Sending update request to:', url);
      
      // Reset progress and set uploading state
      setUploadProgress(0);
      setIsUploading(true);
      
      // Create a new AbortController for this request
      cancelTokenRef.current = new AbortController();
      
      try {
        const response = await api.put(
          url,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
              setUploadProgress(percentCompleted);
            },
            signal: cancelTokenRef.current.signal
          }
        );
        return response.data;
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['module', moduleId]);
      setEditingLesson(null);
      setUploadProgress(0);
      toast.success('Lesson updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error updating lesson');
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      const url = `/course-content/${courseId}/modules/${moduleId}/lessons/${lessonId}`;
      console.log('Sending delete request to:', url);
      await api.delete(url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['module', moduleId]);
      toast.success('Lesson deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error deleting lesson');
    },
  });

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLesson.title.trim()) {
      toast.error('Lesson title is required');
      return;
    }
    if (!newLesson.video) {
      toast.error('Video is required');
      return;
    }

    const formData = new FormData();
    formData.append('title', newLesson.title);
    formData.append('description', newLesson.description);
    formData.append('video', newLesson.video);
    newLesson.attachments.forEach((file) => {
      formData.append('attachments', file);
    });

    addLessonMutation.mutate(formData);
  };

  const handleUpdateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson) return;

    const formData = new FormData();
    formData.append('title', editingLesson.title);
    formData.append('description', editingLesson.description);
    
    // Check if we have a new video to upload
    if (newLesson.video) {
      console.log('Adding video to update request:', newLesson.video.name);
      formData.append('video', newLesson.video);
    }
    
    // Check if we have new attachments to upload
    if (newLesson.attachments.length > 0) {
      console.log(`Adding ${newLesson.attachments.length} attachments to update request`);
      newLesson.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }
    
    // Log FormData contents for debugging
    console.log('Update FormData contents:');
    for (const [key, value] of formData.entries()) {
      console.log(key, ':', value);
    }

    updateLessonMutation.mutate({
      lessonId: editingLesson._id,
      formData,
    });
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      deleteLessonMutation.mutate(lessonId);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate video file
    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a valid video file');
      return;
    }

    // 2GB limit
    if (file.size > 2 * 1024 * 1024 * 1024) {
      toast.error('Video file size should be less than 2GB');
      return;
    }

    setNewLesson((prev) => ({ ...prev, video: file }));
  };

  const handleAttachmentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate each attachment
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    setNewLesson((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles],
    }));
  };

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {module ? `Manage Lessons: ${module.title}` : 'Loading...'}
          </h1>
          <button
            onClick={() => navigate(`/admin/courses/${courseId}/content`)}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to Modules
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add/Edit Lesson Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
              </h2>
              <form onSubmit={editingLesson ? handleUpdateLesson : handleAddLesson} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editingLesson ? editingLesson.title : newLesson.title}
                    onChange={(e) =>
                      editingLesson
                        ? setEditingLesson({ ...editingLesson, title: e.target.value })
                        : setNewLesson({ ...newLesson, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editingLesson ? editingLesson.description : newLesson.description}
                    onChange={(e) =>
                      editingLesson
                        ? setEditingLesson({ ...editingLesson, description: e.target.value })
                        : setNewLesson({ ...newLesson, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                {/* Upload Progress Bar (shown for both new and editing) */}
                {isUploading && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Uploading video</span>
                      <span className="text-sm font-medium text-gray-700">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                {!editingLesson && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Video
                      </label>
                      <input
                        type="file"
                        onChange={handleVideoChange}
                        accept="video/*"
                        className="w-full"
                        required
                      />
                      <p className="mt-1 text-sm text-gray-500">Max size: 100MB</p>
                    </div>
                    
                    {/* Upload Progress Bar */}
                    {isUploading && newLesson.video && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Uploading {newLesson.video.name}</span>
                          <span className="text-sm font-medium text-gray-700">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Attachments
                      </label>
                      <input
                        type="file"
                        onChange={handleAttachmentsChange}
                        multiple
                        className="w-full"
                      />
                      <p className="mt-1 text-sm text-gray-500">Max size per file: 10MB</p>
                    </div>
                  </>
                )}
                <div className="flex space-x-3">
                  {isUploading && (
                    <button
                      type="button"
                      onClick={cancelUpload}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                    >
                      Cancel Upload
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                    disabled={addLessonMutation.isLoading || updateLessonMutation.isLoading}
                  >
                    {editingLesson
                      ? updateLessonMutation.isLoading
                        ? isUploading ? `Uploading (${uploadProgress}%)` : 'Updating...'
                        : 'Update Lesson'
                      : addLessonMutation.isLoading
                      ? isUploading ? `Uploading (${uploadProgress}%)` : 'Adding...'
                      : 'Add Lesson'}
                  </button>
                  {editingLesson && (
                    <>
                      {isUploading ? (
                        <button
                          type="button"
                          onClick={cancelUpload}
                          className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                        >
                          Cancel Upload
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingLesson(null)}
                          className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      )}
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Lessons List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Lessons</h2>
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : module?.lessons && module.lessons.length > 0 ? (
                <div className="space-y-4">
                  {module.lessons.map((lesson) => (
                    <div key={lesson._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{lesson.title}</h3>
                          <p className="text-gray-600">{lesson.description}</p>
                          {lesson.attachments.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">Attachments:</p>
                              <ul className="list-disc list-inside text-sm text-blue-500">
                                {lesson.attachments.map((attachment, index) => (
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
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingLesson(lesson)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteLesson(lesson._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No lessons added yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
