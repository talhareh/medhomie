import { ReactNode, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import MedicMenu from '../../pages/medicMaterial/MedicMenu';
import { Sidebar } from './Sidebar';
import MedicalAIBot from '../common/MedicalAIBot';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  
  // Only open by default on the main dashboard page
  const shouldOpenByDefault = location.pathname === '/dashboard';
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(shouldOpenByDefault);

  // Handle escape key and resize events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setIsMobileSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobileSidebarOpen]);

  // Auto-close sidebar after a delay on mobile, but only on dashboard page
  useEffect(() => {
    // Only auto-close on mobile screens, only on dashboard page, and only on initial load
    if (window.innerWidth < 768 && location.pathname === '/dashboard' && shouldOpenByDefault) {
      const timer = setTimeout(() => {
        setIsMobileSidebarOpen(false);
      }, 2000); // Show for 2 seconds then auto-close

      return () => clearTimeout(timer);
    }
  }, [location.pathname, shouldOpenByDefault]); // Re-run if route changes

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileSidebarOpen]);

  return (
    <div className="min-h-screen bg-background">
      <MedicMenu />
      
      {/* Mobile Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between md:hidden">
        <button 
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded transition-colors"
          aria-label="Open navigation menu"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
        <div className="w-8"></div> {/* Spacer for centering */}
      </div>

      <div className="flex relative">
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          transform transition-transform duration-300 ease-in-out
          fixed md:relative
          z-50 md:z-auto
          h-full md:h-auto
          w-64
          bg-white shadow-sm md:shadow-none
        `}>
          <Sidebar onMobileClose={() => setIsMobileSidebarOpen(false)} />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 w-full md:w-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
      
      {/* <MedicalAIBot /> */}
    </div>
  );
};
