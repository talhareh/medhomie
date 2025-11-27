import React from 'react';
import { Link } from 'react-router-dom';
import { BlogPost } from '../../services/blogService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faUser, faCalendarAlt, faTag } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import { getImageUrl } from '../../utils/imageUtils';

interface BlogCardProps {
  blog: BlogPost;
  isAdmin?: boolean;
}

const BlogCard: React.FC<BlogCardProps> = ({ blog, isAdmin = false }) => {
  const {
    _id,
    title,
    slug,
    excerpt,
    featuredImage,
    author,
    readTime,
    tags,
    createdAt,
    status
  } = blog;

  const formattedDate = format(new Date(createdAt), 'MMM d, yyyy');
  const statusColor = 
    status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 
    status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' : 
    'bg-gray-100 text-gray-800';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg">
      <Link to={isAdmin ? `/admin/blogs/${slug}` : `/blogs/${slug}`}>
        <div className="relative h-48 w-full overflow-hidden">
          {featuredImage ? (
            <img 
              src={getImageUrl(featuredImage)} 
              alt={title} 
              className="w-full h-full object-cover transition-transform hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
          
          {isAdmin && (
            <div className="absolute top-2 right-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                {status}
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index} 
              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              <FontAwesomeIcon icon={faTag} className="mr-1" />
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="text-xs text-gray-500">+{tags.length - 3} more</span>
          )}
        </div>

        <Link to={isAdmin ? `/admin/blogs/${slug}` : `/blogs/${slug}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
            {title}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {excerpt}
        </p>

        <div className="flex items-center text-xs text-gray-500 justify-between">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faUser} className="mr-1" />
            <span>{author.fullName}</span>
          </div>
          
          <div className="flex items-center">
            <div className="flex items-center mr-3">
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
              <span>{formattedDate}</span>
            </div>
            
            <div className="flex items-center">
              <FontAwesomeIcon icon={faClock} className="mr-1" />
              <span>{readTime} min read</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
