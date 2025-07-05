import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { createBlog, BlogFormData } from '../../../services/blogService';
import BlogEditor from '../../../components/blog/BlogEditor';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { MainLayout } from '../../../components/layout/MainLayout';

const CreateBlogPage: React.FC = () => {
  const navigate = useNavigate();
  
  const mutation = useMutation({
    mutationFn: (data: BlogFormData) => createBlog(data),
    onSuccess: () => {
      toast.success('Blog post created successfully!');
      navigate('/admin/blogs');
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
      <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          onClick={() => navigate('/admin/blogs')}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to Blogs
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Blog Post</h1>
        
        <BlogEditor 
          onSubmit={handleSubmit}
          isSubmitting={mutation.isPending}
        />
      </div>
      </div>
    </MainLayout>
  );
};

export default CreateBlogPage;
