import React from 'react';
import { Link } from 'react-router-dom';
import MedicMenu from './medicMaterial/MedicMenu';
import MedicFooter from './medicMaterial/MedicFooter';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MedicMenu />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <p className="text-8xl font-extrabold text-primary mb-4">404</p>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Page Not Found</h1>
        <p className="text-gray-500 max-w-md mb-8">
          The page you're looking for doesn't exist or may have been moved. Please check the URL or return to the homepage.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/"
            className="bg-primary text-white font-semibold px-6 py-3 rounded-md hover:bg-primary-dark transition-colors"
          >
            Go to Homepage
          </Link>
          <Link
            to="/courses"
            className="border border-primary text-primary font-semibold px-6 py-3 rounded-md hover:bg-primary hover:text-white transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      </div>
      <MedicFooter />
    </div>
  );
};

export default NotFoundPage;
