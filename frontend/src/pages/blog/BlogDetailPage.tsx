import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBlogBySlug } from '../../services/blogService';
import MedicMenu from '../medicMaterial/MedicMenu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCalendarAlt, faClock, faUser, faTag, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';

const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['blog', slug],
    queryFn: () => getBlogBySlug(slug || ''),
    enabled: !!slug
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-blue-600" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> Failed to load blog post. Please try again later.</span>
          <div className="mt-3">
            <button
              onClick={() => navigate('/blogs')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Back to Blogs
            </button>
          </div>
        </div>
      </div>
    );
  }

  const blog = data.data;
  const formattedDate = format(new Date(blog.createdAt), 'MMMM d, yyyy');

  return (
    <div className="bg-gray-50 min-h-screen">
      <MedicMenu />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            to="/blogs"
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to All Articles
          </Link>
        </div>

        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          {blog.featuredImage && (
            <div className="w-full h-96 overflow-hidden">
              <img 
                src={blog.featuredImage} 
                alt={blog.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center text-sm text-gray-600 mb-6">
              <div className="flex items-center mr-6 mb-2">
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                <span>{blog.author.fullName}</span>
              </div>
              <div className="flex items-center mr-6 mb-2">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faClock} className="mr-2" />
                <span>{blog.readTime} min read</span>
              </div>
            </div>

            {blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {blog.tags.map((tag, index) => (
                  <Link 
                    key={index}
                    to={`/blogs?tag=${tag}`}
                    className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full hover:bg-blue-200"
                  >
                    <FontAwesomeIcon icon={faTag} className="mr-1" />
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {blog.excerpt && (
              <div className="text-lg text-gray-700 italic border-l-4 border-blue-500 pl-4 mb-8">
                {blog.excerpt}
              </div>
            )}

            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>
        </article>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Continue Reading</h3>
          <Link 
            to="/blogs"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md"
          >
            Explore More Articles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;
