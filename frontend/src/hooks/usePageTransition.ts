import { useLocation } from 'react-router-dom';

export const usePageTransition = () => {
  const location = useLocation();

  // You can add logic here to determine different transition types based on routes
  const getTransitionType = () => {
    // Use slide transition for smooth navigation
    return 'slide';
  };

  return {
    currentPath: location.pathname,
    transitionType: getTransitionType(),
    isAdminPage: location.pathname.startsWith('/admin'),
    isMedicPage: location.pathname.startsWith('/medic'),
    isCoursePage: location.pathname.startsWith('/courses')
  };
}; 