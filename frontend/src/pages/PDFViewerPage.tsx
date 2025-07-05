import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { PDFViewer } from '../components/course/PDFViewer';

export const PDFViewerPage: React.FC = () => {
  const { courseId, moduleId, lessonId, attachmentIndex } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState<boolean>(false);
  
  // Construct the PDF source URL to match the backend route
  // Important: The courseId from the URL parameter might be a module ID
  // We need to ensure we're using the correct course ID
  // For now, we'll use the URL parameter as-is, but this should be fixed in the data fetching layer
  
  // Check if we're in development or production
  const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
  
  // Construct the PDF URL based on environment
  const pdfSrc = isDevelopment
    ? `/course-content/public/${courseId}/modules/${moduleId}/lessons/${lessonId}/attachments/${attachmentIndex || 0}`
    : `/api/course-content/public/${courseId}/modules/${moduleId}/lessons/${lessonId}/attachments/${attachmentIndex || 0}`;
  
  // Function to handle PDF load errors
  const handlePdfError = () => {
    setError('Unable to load the PDF. The course or attachment may not exist.');
    setShowFallback(true);
  };
  
  // Add an effect to check if the PDF loads within a timeout period
  useEffect(() => {
    // Set a timeout to check if the PDF has loaded
    const timeoutId = setTimeout(() => {
      // If we're still on this page after 5 seconds, check the console for errors
      fetch(`/api/course-content/public/${courseId}/modules/${moduleId}/lessons/${lessonId}/attachments/${attachmentIndex || 0}`, { method: 'HEAD' })
        .then(response => {
          if (!response.ok) {
            handlePdfError();
          }
        })
        .catch(() => {
          handlePdfError();
        });
    }, 5000);
    
    return () => clearTimeout(timeoutId);
  }, [courseId, moduleId, lessonId, attachmentIndex]);
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-primary hover:text-primary-dark"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Lesson
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold">Lecture Document</h1>
          </div>
          
          <div className="h-[80vh]">
            {error && showFallback ? (
              <div className="p-6 bg-red-50 rounded-md">
                <div className="flex items-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h2 className="text-lg font-semibold text-red-700">{error}</h2>
                </div>
                
                <p className="mb-4 text-gray-700">
                  The PDF could not be loaded. This might be because the course or lesson doesn't exist in the database.
                </p>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                  >
                    Go Back
                  </button>
                  

                </div>
              </div>
            ) : (
              <PDFViewer 
                src={pdfSrc} 
                title="Lecture Document" 
                onError={handlePdfError}
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
