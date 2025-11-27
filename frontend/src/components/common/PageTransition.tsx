import React from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  transitionType?: 'fade' | 'slide' | 'scale' | 'slideUp';
  autoDetect?: boolean;
}

const PageTransition: React.FC<PageTransitionProps> = ({ 
  children
}) => {
  // Render children directly without any animation
  return <>{children}</>;
};

export default PageTransition; 