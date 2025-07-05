import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faNewspaper } from '@fortawesome/free-solid-svg-icons';

const BlogHeader: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <Link to="/" className="text-blue-600 font-semibold text-xl flex items-center">
              <span className="mr-2">MedHome</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link 
              to="/" 
              className={`flex items-center text-sm font-medium ${isActive('/') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            >
              <FontAwesomeIcon icon={faHome} className="mr-2" />
              Home
            </Link>
            <Link 
              to="/blogs" 
              className={`flex items-center text-sm font-medium ${isActive('/blogs') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            >
              <FontAwesomeIcon icon={faNewspaper} className="mr-2" />
              Blog
            </Link>
            <Link 
              to="/courses" 
              className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600"
            >
              Courses
            </Link>
            <Link 
              to="/auth" 
              className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign In
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default BlogHeader;
