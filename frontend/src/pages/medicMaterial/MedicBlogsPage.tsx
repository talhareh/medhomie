import React from 'react';
import MedicMenu from './MedicMenu';
import MedicFooter from './MedicFooter';
import BlogListingPage from '../blog/BlogListingPage';

/**
 * MedicBlogsPage component - Blogs page for MedHome
 * Integrates the BlogListingPage component with MedicMenu and MedicFooter
 */
const MedicBlogsPage: React.FC = () => {
  return (
    <div className="bg-background min-h-screen">
      {/* Header/Navigation */}
      <MedicMenu />
      
      {/* Blog Listing Component */}
      <BlogListingPage />
      
      {/* Footer */}
      <MedicFooter />
    </div>
  );
};

export default MedicBlogsPage;
