import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { MainLayout } from '../../components/layout/MainLayout';
import api from '../../utils/axios';
import { Course, CourseState } from '../../types/course';

export const EditCoursePage: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [state, setState] = useState<CourseState>(CourseState.DRAFT);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [bannerPreview, setBannerPreview] = useState<string>('');

  // Fetch course details
  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const response = await api.get<Course>(`/courses/${courseId}`);
      return response.data;
    },
  });

  // Update form data when course data is loaded
  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description);
      setPrice(course.price.toString());
      setState(course.state);
      if (course.thumbnail) {
        setThumbnailPreview(course.thumbnail.startsWith('uploads/') ? `/api/${course.thumbnail}` : course.thumbnail);
      }
      if (course.banner) {
        setBannerPreview(course.banner.startsWith('uploads/') ? `/api/${course.banner}` : course.banner);
      }
    }
  }, [course]);

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

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'thumbnail') {
        setThumbnail(file);
        setThumbnailPreview(reader.result as string);
      } else {
        setBanner(file);
        setBannerPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('price', price);
      formData.append('state', state);

      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }
      if (banner) {
        formData.append('banner', banner);
      }

      const response = await api.put(`/courses/${courseId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['course', courseId]);
      toast.success('Course updated successfully');
      navigate(`/admin/courses/${courseId}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error updating course');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !price.trim()) {
      toast.error('All fields are required');
      return;
    }

    const priceNumber = parseFloat(price);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    updateCourseMutation.mutate();
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Course</h1>
        
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
              Status
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value as CourseState)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={CourseState.DRAFT}>Draft</option>
              <option value={CourseState.ACTIVE}>Active</option>
              <option value={CourseState.INACTIVE}>Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Thumbnail
            </label>
            <input
              type="file"
              onChange={(e) => handleImageChange(e, 'thumbnail')}
              accept="image/jpeg,image/jpg,image/png"
              className="w-full"
            />
            {thumbnailPreview && (
              <div className="mt-2">
                <img
                  src={thumbnailPreview.startsWith('data:') ? thumbnailPreview : thumbnailPreview}
                  alt="Thumbnail preview"
                  className="h-32 w-auto object-cover rounded"
                />
              </div>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Recommended size: 800x600 pixels. Max 5MB.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Banner
            </label>
            <input
              type="file"
              onChange={(e) => handleImageChange(e, 'banner')}
              accept="image/jpeg,image/jpg,image/png"
              className="w-full"
            />
            {bannerPreview && (
              <div className="mt-2">
                <img
                  src={bannerPreview.startsWith('data:') ? bannerPreview : bannerPreview}
                  alt="Banner preview"
                  className="h-32 w-full object-cover rounded"
                />
              </div>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Recommended size: 1920x480 pixels. Max 5MB.
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={updateCourseMutation.isLoading}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
            >
              {updateCourseMutation.isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/admin/courses/${courseId}`)}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};
