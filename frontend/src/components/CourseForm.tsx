import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../utils/axios';
import { useInstructors } from '../hooks/useInstructors';
import { UserRole } from '../types/auth';
import { CategorySelect } from './forms/CategorySelect';
import { TagSelect } from './forms/TagSelect';

interface CourseFormData {
  title: string;
  description: string;
  price: number;
  instructor: string;
  categories: string[];
  tags: string[];
}

const initialFormData: CourseFormData = {
  title: '',
  description: '',
  price: 0,
  instructor: '',
  categories: [],
  tags: []
};

export const CourseForm: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: instructors, isLoading: isLoadingInstructors } = useInstructors();
  const [formData, setFormData] = useState<CourseFormData>({
    ...initialFormData,
    instructor: user?.role === UserRole.INSTRUCTOR ? user._id : ''
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data: CourseFormData) => {
      try {
        // Validate required fields
        if (!data.title || !data.description || data.price <= 0 || !data.instructor) {
          throw new Error('Please fill in all required fields (title, description, price, and instructor)');
        }

        const response = await api.post('/courses', {
          title: data.title.trim(),
          description: data.description.trim(),
          price: data.price,
          instructor: data.instructor,
          categories: data.categories,
          tags: data.tags
        });

        return response.data;
      } catch (error: any) {
        console.error('Error creating course:', error.response?.data || error);
        throw error.response?.data || error;
      }
    },
    onSuccess: (data) => {
      console.log('Course created successfully:', data);
      queryClient.invalidateQueries(['courses']);
      toast.success(user?.role === UserRole.ADMIN 
        ? 'Course created successfully!' 
        : 'Course created successfully! Waiting for admin approval.'
      );
      setFormData({
        ...initialFormData,
        instructor: user?.role === UserRole.INSTRUCTOR ? user._id : ''
      });
    },
    onError: (error: any) => {
      console.error('Error in createCourseMutation:', error);
      toast.error(
        error.message || 
        error.error?.message || 
        'Error creating course. Please check all required fields.'
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.title || !formData.description || formData.price <= 0 || !formData.instructor) {
      toast.error('Please fill in all required fields (title, description, price, and instructor)');
      return;
    }
    
    createCourseMutation.mutate(formData);
  };

  if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.INSTRUCTOR)) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={e => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categories
          </label>
          <CategorySelect
            selectedCategories={formData.categories}
            onChange={(categories) => setFormData(prev => ({ ...prev, categories }))}
            className="mb-2"
          />
          <p className="text-sm text-gray-500">Hold Ctrl (or Cmd) to select multiple categories</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <TagSelect
            selectedTags={formData.tags}
            onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
            className="mb-2"
          />
          <p className="text-sm text-gray-500">Hold Ctrl (or Cmd) to select multiple tags</p>
        </div>

        {user.role === UserRole.ADMIN && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructor
            </label>
            <select
              value={formData.instructor}
              onChange={e => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isLoadingInstructors}
            >
              <option value="">Select an instructor</option>
              {instructors?.map(instructor => (
                <option key={instructor._id} value={instructor._id}>
                  {instructor.fullName} ({instructor.email})
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={createCourseMutation.isLoading}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
        >
          {createCourseMutation.isLoading ? 'Creating...' : 'Create Course'}
        </button>
      </div>
    </form>
  );
};
