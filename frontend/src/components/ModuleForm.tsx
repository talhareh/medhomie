import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../utils/axios';
import { Module } from '../types/course';

interface ModuleFormProps {
  courseId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Module;
}

const initialModuleData: Omit<Module, '_id'> = {
  title: '',
  description: '',
  order: 0,
  lessons: []
};

export const ModuleForm: React.FC<ModuleFormProps> = ({
  courseId,
  onSuccess,
  onCancel,
  initialData
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Omit<Module, '_id'>>(
    initialData || initialModuleData
  );

  const moduleMutation = useMutation({
    mutationFn: async (data: Omit<Module, '_id'>) => {
      // Clean the data to remove Mongoose-specific properties
      const cleanData = {
        title: data.title,
        description: data.description,
        order: data.order,
        lessons: data.lessons.map(lesson => ({
          title: lesson.title,
          description: lesson.description,
          order: lesson.order,
          duration: lesson.duration,
          video: lesson.video,
          attachments: lesson.attachments,
          isPreview: lesson.isPreview
        }))
      };

      if (initialData?._id) {
        // Update existing module
        const response = await api.put(`/courses/${courseId}/modules/${initialData._id}`, cleanData);
        return response.data;
      } else {
        // Create new module
        const response = await api.post(`/courses/${courseId}/modules`, cleanData);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      toast.success(initialData ? 'Module updated successfully' : 'Module added successfully');
      if (onSuccess) onSuccess();
      if (!initialData) setFormData(initialModuleData);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error saving module');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    moduleMutation.mutate(formData);
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

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={moduleMutation.isPending}
        >
          {moduleMutation.isPending ? 'Saving...' : initialData ? 'Update Module' : 'Add Module'}
        </button>
      </div>
    </form>
  );
};
