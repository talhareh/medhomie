import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { createBlog, BlogFormData } from '../../services/blogService';
import BlogEditor from '../../components/blog/BlogEditor';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { MainLayout } from '../../components/layout/MainLayout';

const NewBlogPage: React.FC = () => {
  const navigate = useNavigate();
  
  const mutation = useMutation({
    mutationFn: (data: BlogFormData) => createBlog(data),
    onSuccess: () => {
      toast.success('Blog post created successfully!');
      navigate('/blogs');
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 
        typeof error === 'object' && error !== null && 'response' in error && 
        typeof error.response === 'object' && error.response !== null && 
        'data' in error.response && typeof error.response.data === 'object' && 
        error.response.data !== null && 'message' in error.response.data ? 
        String(error.response.data.message) : 'Failed to create blog post';
      toast.error(errorMessage);
    }
  });

  const handleSubmit = async (data: BlogFormData) => {
    mutation.mutate(data);
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button 
            onClick={() => navigate('/blogs')}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Blogs
          </button>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Blog Post</h1>
          <p className="text-gray-600">Fill in the details below to create a new blog post</p>
        </div>
        
        <BlogEditor 
          onSubmit={handleSubmit}
          isSubmitting={mutation.isPending}
        />
      </div>
    </MainLayout>
  );
};

export default NewBlogPage;
