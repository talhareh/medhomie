import React, { useState } from 'react';
// Import CSS only, we'll use a textarea as fallback
import 'react-quill/dist/quill.snow.css';
import { useForm } from 'react-hook-form';
import { BlogFormData, uploadBlogImage } from '../../services/blogService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faImage, faTags, faClock } from '@fortawesome/free-solid-svg-icons';

interface BlogEditorProps {
  initialData?: Partial<BlogFormData>;
  onSubmit: (data: BlogFormData) => Promise<void>;
  isSubmitting: boolean;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ initialData, onSubmit, isSubmitting }) => {
  const [imageUploading, setImageUploading] = useState(false);
  const { register, handleSubmit, setValue, watch } = useForm<BlogFormData>({
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      excerpt: initialData?.excerpt || '',
      featuredImage: initialData?.featuredImage || '',
      status: initialData?.status || 'DRAFT',
      tags: initialData?.tags || [],
      readTime: initialData?.readTime || 5
    }
  });

  const featuredImage = watch('featuredImage');
  const content = watch('content');
  const tagsString = watch('tags')?.join(', ') || '';

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsArray = e.target.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');
    setValue('tags', tagsArray);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue('content', e.target.value);
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      try {
        setImageUploading(true);
        const file = e.target.files[0];
        const response = await uploadBlogImage(file);
        // Use a consistent API URL
        const apiUrl = process.env.VITE_API_URL || 'http://localhost:5000';
        const imageUrl = `${apiUrl}${response.data.url}`;
        setValue('featuredImage', imageUrl);
      } catch (error) {
        console.error('Featured image upload failed:', error);
        alert('Failed to upload featured image. Please try again.');
      } finally {
        setImageUploading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          id="title"
          type="text"
          {...register('title', { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Enter blog title"
        />
      </div>

      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
          Excerpt
        </label>
        <textarea
          id="excerpt"
          rows={3}
          {...register('excerpt', { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Brief summary of the blog post"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <div className="mt-1">
          <textarea
            rows={10}
            value={content}
            onChange={handleContentChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Write your blog content here..."
          />
          <p className="mt-2 text-sm text-gray-500">
            Note: Rich text editor is temporarily unavailable. Basic HTML tags are supported.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Featured Image
          </label>
          <div className="mt-1 flex items-center">
            <input
              type="file"
              accept="image/*"
              id="featuredImage"
              onChange={handleFeaturedImageUpload}
              className="hidden"
            />
            <label
              htmlFor="featuredImage"
              className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              {imageUploading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faImage} />
              )}{' '}
              Upload Image
            </label>
            {featuredImage && (
              <div className="ml-3 h-12 w-12 overflow-hidden rounded-md">
                <img
                  src={featuredImage}
                  alt="Featured"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
            <FontAwesomeIcon icon={faTags} /> Tags (comma separated)
          </label>
          <input
            id="tags"
            type="text"
            value={tagsString}
            onChange={handleTagsChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="health, medicine, education"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            {...register('status')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div>
          <label htmlFor="readTime" className="block text-sm font-medium text-gray-700">
            <FontAwesomeIcon icon={faClock} /> Read Time (minutes)
          </label>
          <input
            id="readTime"
            type="number"
            min="1"
            {...register('readTime', { 
              required: true,
              valueAsNumber: true 
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || imageUploading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
              Saving...
            </>
          ) : (
            'Save Blog Post'
          )}
        </button>
      </div>
    </form>
  );
};

export default BlogEditor;
