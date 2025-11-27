import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getBlogBySlug, updateBlog, BlogFormData } from '../../../services/blogService';
import BlogEditor from '../../../components/blog/BlogEditor';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { MainLayout } from '../../../components/layout/MainLayout';

const EditBlogPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['blog', id],
    queryFn: () => getBlogBySlug(id || ''),
    enabled: !!id,
    retry: 1
  });

  const mutation = useMutation({
    mutationFn: (formData: BlogFormData) => updateBlog(id || '', formData),
    onSuccess: () => {
      toast.success('Blog post updated successfully!');
      navigate('/admin/blogs');
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 
        typeof error === 'object' && error !== null && 'response' in error && 
        typeof error.response === 'object' && error.response !== null && 
        'data' in error.response && typeof error.response.data === 'object' && 
        error.response.data !== null && 'message' in error.response.data ? 
        String(error.response.data.message) : 'Failed to update blog post';
      toast.error(errorMessage);
    }
  });

  const handleSubmit = async (formData: BlogFormData) => {
    mutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-blue-600" />
      </div>
    );
  }

  if (isError || !data?.data) {
    const errorMessage = error instanceof Error ? error.message : 
      typeof error === 'object' && error !== null && 'response' in error && 
      typeof error.response === 'object' && error.response !== null && 
      'data' in error.response && typeof error.response.data === 'object' && 
      error.response.data !== null && 'message' in error.response.data ? 
      String(error.response.data.message) : 'Failed to load blog post. Please try again later.';
    
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline mt-2">{errorMessage}</span>
            <div className="mt-3">
              <button
                onClick={() => navigate('/admin/blogs')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Back to Blogs
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const blog = data.data;

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
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Blog Post</h1>
        
        <BlogEditor 
          initialData={{
            title: blog.title,
            content: blog.content,
            excerpt: blog.excerpt,
            featuredImage: blog.featuredImage,
            status: blog.status,
            tags: blog.tags,
            readTime: blog.readTime
          }}
          onSubmit={handleSubmit}
          isSubmitting={mutation.isPending}
        />
      </div>
      </div>
    </MainLayout>
  );
};

export default EditBlogPage;
