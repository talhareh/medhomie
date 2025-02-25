import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../utils/axios';
import { ILessonData } from '../types/course';

interface LessonFormProps {
  courseId: string;
  moduleId: string;
  onSuccess?: () => void;
  initialData?: ILessonData;
}

const initialLessonData: Omit<ILessonData, '_id'> = {
  title: '',
  description: '',
  order: 0,
  duration: 0,
  attachments: [],
  isPreview: false
};

export const LessonForm: React.FC<LessonFormProps> = ({
  courseId,
  moduleId,
  onSuccess,
  initialData
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Omit<ILessonData, '_id'>>(
    initialData || initialLessonData
  );
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);

  const lessonMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (initialData?._id) {
        // Update existing lesson
        const response = await api.put(
          `/courses/${courseId}/modules/${moduleId}/lessons/${initialData._id}`,
          data,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        return response.data;
      } else {
        // Create new lesson
        const response = await api.post(
          `/courses/${courseId}/modules/${moduleId}/lessons`,
          data,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['course', courseId]);
      toast.success(initialData ? 'Lesson updated successfully' : 'Lesson added successfully');
      if (onSuccess) onSuccess();
      if (!initialData) {
        setFormData(initialLessonData);
        setVideoFile(null);
        setAttachmentFiles([]);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error saving lesson');
    }
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

    setAttachmentFiles(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachmentFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('order', formData.order.toString());
    formDataToSend.append('duration', (formData.duration || 0).toString());
    formDataToSend.append('isPreview', formData.isPreview.toString());

    if (videoFile) {
      formDataToSend.append('video', videoFile);
    }

    attachmentFiles.forEach(file => {
      formDataToSend.append('attachments', file);
    });
    
    lessonMutation.mutate(formDataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order
          </label>
          <input
            type="number"
            value={formData.order}
            onChange={e => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            min="0"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration (minutes)
          </label>
          <input
            type="number"
            value={formData.duration || 0}
            onChange={e => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            min="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Video
        </label>
        <input
          type="file"
          onChange={handleVideoChange}
          accept="video/mp4,video/webm,video/ogg"
          className="w-full"
        />
        <p className="mt-1 text-sm text-gray-500">
          Supported formats: MP4, WebM, OGG (max 100MB)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
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
        
        {attachmentFiles.length > 0 && (
          <div className="mt-2 space-y-2">
            {attachmentFiles.map((file, index) => (
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

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPreview"
          checked={formData.isPreview}
          onChange={e => setFormData(prev => ({ ...prev, isPreview: e.target.checked }))}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isPreview" className="ml-2 block text-sm text-gray-900">
          Make this lesson available for preview
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={lessonMutation.isLoading}
        >
          {lessonMutation.isLoading ? 'Saving...' : initialData ? 'Update Lesson' : 'Add Lesson'}
        </button>
      </div>
    </form>
  );
};
