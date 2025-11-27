import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { MainLayout } from './MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/axios';

// Cloudinary widget type
declare global {
  interface Window {
  }
}

interface Lesson {
  _id: string;
  title: string;
  video: string;
  attachments: string[];
  pdfUrl?: string;
  ebookName?: string;
  videoSource?: 'bunnycdn';
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
    video: null as File | null,
    attachments: [] as File[]
  });
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const cancelTokenRef = useRef<AbortController | null>(null);
  const VIDEO_SOURCE: 'bunnycdn' = 'bunnycdn';
  const [manualPdfUrl, setManualPdfUrl] = useState<string>("");
  const [bunnyVideoId, setBunnyVideoId] = useState<string>("");
  const [ebookName, setEbookName] = useState<string>("");

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
      // Remove FormData.entries() usage for compatibility
      // for (const [key, value] of formData.entries()) {
      //   console.log(key, ':', value);
      // }
      
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['module', moduleId] });
      setNewLesson({ title: '', video: null, attachments: [] });
      setUploadProgress(0);
      setBunnyVideoId('');
      setManualPdfUrl('');
      setEbookName('');
      toast.success('Lesson added successfully');
      console.log('Lesson saved in database:', data);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error adding lesson');
      // Clear files on error
      setNewLesson({ ...newLesson, video: null, attachments: [] });
      setUploadProgress(0);
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
      queryClient.invalidateQueries({ queryKey: ['module', moduleId] });
      setEditingLesson(null);
      setNewLesson({ title: '', video: null, attachments: [] });
      setUploadProgress(0);
      setBunnyVideoId('');
      setManualPdfUrl('');
      setEbookName('');
      toast.success('Lesson updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error updating lesson');
      // Clear files on error
      setEditingLesson(null);
      setNewLesson({ title: '', video: null, attachments: [] });
      setUploadProgress(0);
      setBunnyVideoId('');
      setManualPdfUrl('');
      setEbookName('');
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      const url = `/course-content/${courseId}/modules/${moduleId}/lessons/${lessonId}`;
      console.log('Sending delete request to:', url);
      await api.delete(url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module', moduleId] });
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

    const hasVideoContent = bunnyVideoId.trim().length > 0;
    if (!hasVideoContent && !manualPdfUrl.trim()) {
      toast.error('Either video content or PDF URL is required');
      return;
    }

    const formData = new FormData();
    formData.append('title', newLesson.title);
    
    if (hasVideoContent) {
      formData.append('videoSource', VIDEO_SOURCE);
      formData.append('video', bunnyVideoId.trim());
    }
    
    if (manualPdfUrl.trim()) {
      formData.append('pdfUrl', manualPdfUrl.trim());
    }

    if (ebookName.trim()) {
      formData.append('ebookName', ebookName.trim());
    }

    addLessonMutation.mutate(formData);
  };

  const handleUpdateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson) return;

    const hasVideoContent = bunnyVideoId.trim().length > 0;

    const formData = new FormData();
    formData.append('title', editingLesson.title);
    
    if (hasVideoContent) {
      formData.append('videoSource', VIDEO_SOURCE);
      formData.append('video', bunnyVideoId.trim());
    }
    
    if (manualPdfUrl.trim()) {
      formData.append('pdfUrl', manualPdfUrl.trim());
    }

    if (ebookName.trim()) {
      formData.append('ebookName', ebookName.trim());
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

  const handleCancelEdit = () => {
    setEditingLesson(null);
    setNewLesson({ title: '', video: null, attachments: [] });
    setUploadProgress(0);
    setManualPdfUrl('');
    setBunnyVideoId('');
    setEbookName('');
  };

  const handleEditLesson = (lesson: Lesson) => {
    // Create a clean copy of the lesson object to avoid Mongoose properties
    const cleanLesson = {
      _id: lesson._id,
      title: lesson.title,
      video: lesson.video,
      attachments: lesson.attachments,
      pdfUrl: lesson.pdfUrl,
      ebookName: lesson.ebookName,
      videoSource: lesson.videoSource
    };
    setEditingLesson(cleanLesson);
    
    // Populate form with existing lesson data
    setNewLesson({ 
      title: lesson.title, 
      video: null, 
      attachments: [] 
    });
    setUploadProgress(0);
    setManualPdfUrl(lesson.pdfUrl || '');
    setBunnyVideoId(lesson.videoSource === 'bunnycdn' ? lesson.video : '');
    setEbookName(lesson.ebookName || '');
  };

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  const canAddLesson = bunnyVideoId.trim().length > 0 || manualPdfUrl.trim().length > 0;

  // For edit mode, we can always update (even with no new content)
  const canUpdateLesson = true;

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
              <h2 className={`text-xl font-semibold mb-4 ${editingLesson ? 'text-green-700' : 'text-gray-800'}`}>
                {editingLesson ? `Edit Lesson: ${editingLesson.title}` : 'Add New Lesson'}
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

                {/* Current Lesson Content Display (only when editing) */}
                {editingLesson && (
                  <div className="bg-gray-50 p-4 rounded-md border">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Current Lesson Content:</h3>
                    <div className="space-y-2">
                      {editingLesson.video && (
                        <div className="flex items-center text-sm">
                          <span className="font-medium text-gray-600">Video:</span>
                          <span className="ml-2 text-blue-600">
                            BunnyCDN Video ({editingLesson.video.split('/').pop()})
                          </span>
                        </div>
                      )}
                      {editingLesson.pdfUrl && (
                        <div className="flex items-center text-sm">
                          <span className="font-medium text-gray-600">PDF:</span>
                          <span className="ml-2 text-green-600">
                            {editingLesson.ebookName || (editingLesson.pdfUrl.length > 50 ? 
                              `${editingLesson.pdfUrl.substring(0, 50)}...` : 
                              editingLesson.pdfUrl)}
                          </span>
                        </div>
                      )}
                      {(!editingLesson.video && !editingLesson.pdfUrl) && (
                        <div className="text-sm text-gray-500 italic">
                          No video or PDF currently assigned to this lesson.
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Use the fields below to update the lesson content. Leave fields empty to keep current content.
                    </p>
                  </div>
                )}
                
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
                
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    BunnyCDN Video ID
                  </label>
                  <input
                    type="text"
                    value={bunnyVideoId}
                    onChange={e => setBunnyVideoId(e.target.value)}
                    placeholder="9b7d3c2a-4e5f-6a7b-8c9d-0e1f2a3b4c5d"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Paste the BunnyCDN video ID from your Bunny Stream dashboard. Leave empty if this lesson only provides a PDF.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    BunnyCDN PDF URL
                  </label>
                  <input
                    type="text"
                    value={manualPdfUrl}
                    onChange={e => setManualPdfUrl(e.target.value)}
                    placeholder="https://medhome.b-cdn.net/your-file.pdf"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Paste the BunnyCDN (b-cdn.net) URL for this lesson's PDF. This provides optimized global delivery.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ebook Name
                  </label>
                  <input
                    type="text"
                    value={ebookName}
                    onChange={e => setEbookName(e.target.value)}
                    placeholder="e.g., Introduction to Medicine"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a custom name for the ebook. This name will be displayed to students instead of the filename from the URL.
                  </p>
                </div>
                
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
                    disabled={editingLesson ? (isUploading || updateLessonMutation.status === 'pending') : (!canAddLesson || isUploading || addLessonMutation.status === 'pending')}
                    className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      ${editingLesson 
                        ? (isUploading || updateLessonMutation.status === 'pending' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600')
                        : (!canAddLesson || isUploading || addLessonMutation.status === 'pending' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600')
                      }`}
                    style={{ pointerEvents: editingLesson ? (isUploading || updateLessonMutation.status === 'pending' ? 'auto' : undefined) : (!canAddLesson || isUploading || addLessonMutation.status === 'pending' ? 'auto' : undefined) }}
                  >
                    {editingLesson 
                      ? (isUploading || updateLessonMutation.status === 'pending' ? 'Updating...' : 'Update Lesson')
                      : (isUploading || addLessonMutation.status === 'pending' ? 'Uploading...' : 'Add Lesson')
                    }
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
                          onClick={handleCancelEdit}
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
                    <div key={lesson._id} className={`border rounded-lg p-4 ${editingLesson?._id === lesson._id ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{lesson.title}</h3>
                          {lesson.video && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">Video:</p>
                              <p className="text-sm text-blue-500">
                                {lesson.video.split('/').pop()}
                              </p>
                            </div>
                          )}
                          {lesson.pdfUrl && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">PDF:</p>
                              <p className="text-sm text-green-600">
                                ✅ {lesson.ebookName || (lesson.pdfUrl.length > 50 ? 
                                  `${lesson.pdfUrl.substring(0, 50)}...` : 
                                  lesson.pdfUrl)}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditLesson(lesson)}
                            className={editingLesson?._id === lesson._id ? "text-green-600 hover:text-green-800 font-medium" : "text-blue-500 hover:text-blue-700"}
                            disabled={editingLesson?._id === lesson._id}
                          >
                            {editingLesson?._id === lesson._id ? 'Editing...' : 'Edit'}
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
