import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/axios';

interface CourseData {
  title: string;
  description: string;
  price: number;
  thumbnail?: File;
  banner?: File;
}

export const AddCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);

  const addCourseMutation = useMutation({
    mutationFn: async (courseData: CourseData) => {
      const formData = new FormData();
      formData.append('title', courseData.title.trim());
      formData.append('description', courseData.description.trim());
      formData.append('price', courseData.price.toString());
      if (courseData.thumbnail) {
        formData.append('thumbnail', courseData.thumbnail);
      }
      if (courseData.banner) {
        formData.append('banner', courseData.banner);
      }

      const response = await api.post('/courses', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Course created successfully');
      navigate('/admin/courses');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error creating course');
    },
  });

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'thumbnail' | 'banner'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, JPG, or PNG)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file size should be less than 5MB');
      return;
    }

    if (type === 'thumbnail') {
      setThumbnail(file);
    } else {
      setBanner(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !price.trim()) {
      toast.error('All fields are required');
      return;
    }

    if (!thumbnail) {
      toast.error('Course thumbnail is required');
      return;
    }

    const priceNumber = parseFloat(price);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    addCourseMutation.mutate({
      title,
      description,
      price: priceNumber,
      thumbnail,
      banner: banner || undefined,
    });
  };

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Add New Course</h1>

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
              Price ($)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Thumbnail (Required)
            </label>
            <input
              type="file"
              onChange={(e) => handleImageChange(e, 'thumbnail')}
              accept="image/jpeg,image/jpg,image/png"
              className="w-full"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Recommended size: 800x600 pixels. Max 5MB.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Banner (Optional)
            </label>
            <input
              type="file"
              onChange={(e) => handleImageChange(e, 'banner')}
              accept="image/jpeg,image/jpg,image/png"
              className="w-full"
            />
            <p className="mt-1 text-sm text-gray-500">
              Recommended size: 1920x480 pixels. Max 5MB.
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={addCourseMutation.isLoading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
            >
              {addCourseMutation.isLoading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};
