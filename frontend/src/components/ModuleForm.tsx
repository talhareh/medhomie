import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../utils/axios';
import { IModuleData } from '../types/course';

interface ModuleFormProps {
  courseId: string;
  onSuccess?: () => void;
  initialData?: IModuleData;
}

const initialModuleData: Omit<IModuleData, '_id'> = {
  title: '',
  description: '',
  order: 0,
  lessons: []
};

export const ModuleForm: React.FC<ModuleFormProps> = ({
  courseId,
  onSuccess,
  initialData
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Omit<IModuleData, '_id'>>(
    initialData || initialModuleData
  );

  const moduleMutation = useMutation({
    mutationFn: async (data: Omit<IModuleData, '_id'>) => {
      if (initialData?._id) {
        // Update existing module
        const response = await api.put(`/courses/${courseId}/modules/${initialData._id}`, data);
        return response.data;
      } else {
        // Create new module
        const response = await api.post(`/courses/${courseId}/modules`, data);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['course', courseId]);
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

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={moduleMutation.isLoading}
        >
          {moduleMutation.isLoading ? 'Saving...' : initialData ? 'Update Module' : 'Add Module'}
        </button>
      </div>
    </form>
  );
};
