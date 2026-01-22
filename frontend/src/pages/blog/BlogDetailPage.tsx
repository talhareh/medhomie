import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBlogBySlug } from '../../services/blogService';
import MedicMenu from '../medicMaterial/MedicMenu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCalendarAlt, faClock, faUser, faTag, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import { getImageUrl } from '../../utils/imageUtils';
import { createReactEditorJS } from 'react-editor-js';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import Image from '@editorjs/image';
import Code from '@editorjs/code';
import InlineCode from '@editorjs/inline-code';
import Delimiter from '@editorjs/delimiter';
import Marker from '@editorjs/marker';
import Underline from '@editorjs/underline';
import Paragraph from '@editorjs/paragraph';

// Create ReactEditorJS component for read-only rendering
const ReactEditorJS = createReactEditorJS();

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

  // Parse blog content - handle both JSON string and object
  const blogContent = useMemo(() => {
    if (!blog.content) {
      return null;
    }
    
    try {
      // If it's already an object, return it
      if (typeof blog.content === 'object') {
        return blog.content;
      }
      
      // If it's a string, try to parse it
      if (typeof blog.content === 'string') {
        // Check if it's HTML (old format) - if so, return null to show empty
        if (blog.content.trim().startsWith('<')) {
          return null;
        }
        const parsed = JSON.parse(blog.content);
        return parsed;
      }
      
      return null;
    } catch (error) {
      // If parsing fails, it might be old HTML format
      console.warn('Failed to parse blog content:', error);
      return null;
    }
  }, [blog.content]);

  // Editor.js tools for rendering (read-only)
  const readOnlyTools = {
    paragraph: Paragraph,
    header: Header,
    list: List,
    quote: Quote,
    image: Image,
    code: Code,
    inlineCode: InlineCode,
    delimiter: Delimiter,
    marker: Marker,
    underline: Underline,
  };

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
                src={getImageUrl(blog.featuredImage)} 
                alt={blog.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.style.display = 'none';
                }}
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

            {blogContent ? (
              <div className="prose prose-lg max-w-none">
                <ReactEditorJS
                  tools={readOnlyTools}
                  defaultValue={blogContent}
                  readOnly={true}
                />
              </div>
            ) : (
              <div className="prose prose-lg max-w-none text-gray-500 italic">
                No content available.
              </div>
            )}
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
