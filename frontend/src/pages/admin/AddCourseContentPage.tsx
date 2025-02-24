import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/axios';

export const AddCourseContentPage: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const addContentMutation = useMutation({
    mutationFn: async () => {
      if (!videoFile) {
        throw new Error('Video file is required');
      }

      setIsUploading(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('video', videoFile);
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await api.post(`/courses/${courseId}/content`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['course', courseId]);
      toast.success('Course content added successfully');
      navigate(`/admin/courses/${courseId}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error adding course content');
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate video file type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid video file (MP4, WebM, or OGG)');
      return;
    }

    // Validate file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video file size should be less than 100MB');
      return;
    }

    setVideoFile(file);
  };

  const handleAttachmentsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate each attachment
    const validFiles = files.filter(file => {
      // Validate file type
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ];
      
      if (!validTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}`);
        return false;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File too large: ${file.name}`);
        return false;
      }

      return true;
    });

    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!videoFile) {
      toast.error('Video file is required');
      return;
    }
    addContentMutation.mutate();
  };

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Add Course Content</h1>
        
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video
            </label>
            <input
              type="file"
              onChange={handleVideoChange}
              accept="video/mp4,video/webm,video/ogg"
              className="w-full"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Supported formats: MP4, WebM, OGG (max 100MB)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments
            </label>
            <input
              type="file"
              onChange={handleAttachmentsChange}
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              multiple
              className="w-full"
            />
            <p className="mt-1 text-sm text-gray-500">
              Supported formats: PDF, DOC, DOCX, PPT, PPTX (max 10MB each)
            </p>
            
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm text-gray-600">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isUploading || addContentMutation.isLoading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
            >
              {isUploading ? 'Uploading...' : 'Add Content'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};
