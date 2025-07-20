// PDFViewer.tsx - Component for viewing PDF attachments
import React, { useState, useEffect } from 'react';

interface PDFViewerProps {
  src: string;
  title?: string; // Make title optional since we're not using it currently
  onError?: () => void; // Callback for error handling
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ src, onError }) => {
  console.log('PDF VIEWER - Source URL:', src);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [directPdfUrl, setDirectPdfUrl] = useState<string>('');
  
  useEffect(() => {
    try {
      // Process the source URL to create a direct URL for the iframe
      let directUrl = src;
      
      // Make sure the URL starts with a slash
      if (!directUrl.startsWith('/')) {
        directUrl = '/' + directUrl;
      }
      
      // Make sure the URL has the correct structure for the backend API
      // The backend expects: /api/course-content/public/:courseId/...
      
      // First, ensure we have the API prefix
      if (!directUrl.startsWith('/api/')) {
        directUrl = '/api' + directUrl;
      }
      
      // Prevent double /api/ prefix
      while (directUrl.includes('/api/api/')) {
        directUrl = directUrl.replace('/api/api/', '/api/');
      }
      
      // Make sure we're not adding course-content twice
      if (!directUrl.includes('/course-content/')) {
        // Insert course-content after /api/ if it's not there
        directUrl = directUrl.replace('/api/', '/api/course-content/');
      }
      
      // Prevent double /api/ prefix
      while (directUrl.includes('/api/api/')) {
        directUrl = directUrl.replace('/api/api/', '/api/');
      }
      
      console.log('Direct PDF URL for iframe:', directUrl);
      setDirectPdfUrl(directUrl);
      setLoading(false);
    } catch (err) {
      console.error('Error processing PDF URL:', err);
      setError('Failed to process PDF URL. Please try again later.');
      setLoading(false);
      // Call the onError callback if provided
      if (onError) {
        onError();
      }
    }
  }, [src, onError]);
  
  return (
    <div 
      className="bg-neutral-900 relative"
      onContextMenu={(e) => {
        e.preventDefault();
        return false;
      }}
    >
      
      <div className="aspect-video flex items-center justify-center bg-neutral-800" style={{ minHeight: '500px' }}>
        {loading && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-white">Loading PDF...</p>
          </div>
        )}
        
        {error && (
          <div className="text-red-500 p-4 bg-red-100 rounded">
            <p>{error}</p>
          </div>
        )}
        
        {directPdfUrl && !loading && !error && (
          <>
            {/* Try multiple approaches for PDF rendering */}
            <div 
              className="w-full h-full" 
              style={{ minHeight: '500px' }}
              onContextMenu={(e) => {
                e.preventDefault();
                return false;
              }}
            >
              {/* Add custom CSS to hide PDF viewer controls */}
              <style>{`
                /* Hide PDF viewer controls */
                .pdf-toolbar { display: none !important; }
                #toolbarContainer { display: none !important; }
                .toolbar { display: none !important; }
                #download { display: none !important; }
                #print { display: none !important; }
                #viewBookmark { display: none !important; }
                #secondaryToolbar { display: none !important; }
              `}</style>
              {/* Approach 1: Object tag */}
              <object
                data={`${directPdfUrl}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&download=0`}
                type="application/pdf"
                className="w-full h-full"
                style={{ minHeight: '500px' }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  return false;
                }}
              >
                {/* Approach 2: Embed tag as fallback */}
                <embed 
                  src={`${directPdfUrl}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&download=0`} 
                  type="application/pdf" 
                  className="w-full h-full"
                  style={{ minHeight: '500px' }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    return false;
                  }}
                />
                
                <p>It appears your browser doesn't support embedded PDFs. You can 
                  <a href={directPdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline"> click here to download the PDF</a>.
                </p>
              </object>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
