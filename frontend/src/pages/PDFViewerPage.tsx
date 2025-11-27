import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle, faArrowLeft, faTimes } from '@fortawesome/free-solid-svg-icons';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export const PDFViewerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [renderProgress, setRenderProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [scale, setScale] = useState(1.0);
  const [title, setTitle] = useState('PDF Document');
  const [renderedPages, setRenderedPages] = useState<HTMLCanvasElement[]>([]);
  const [renderedPagesCount, setRenderedPagesCount] = useState(0);
  const [isReadyToRender, setIsReadyToRender] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const pagesContainerRef = useRef<HTMLDivElement>(null);

  const pdfUrl = searchParams.get('url');
  const pdfTitle = searchParams.get('title') || 'PDF Document';

  // Debug state changes
  useEffect(() => {
    console.log('🔄 PDF Viewer State:', {
      isLoading,
      isDownloading,
      isLoadingDocument,
      isProcessing,
      downloadProgress,
      renderProgress,
      hasPdfDocument: !!pdfDocument,
      renderedPagesCount: renderedPagesCount,
      isReadyToRender
    });
  }, [isLoading, isDownloading, isLoadingDocument, isProcessing, downloadProgress, renderProgress, pdfDocument, renderedPagesCount, isReadyToRender]);

  // Effect to trigger rendering when component is ready
  useEffect(() => {
    if (isReadyToRender && pdfDocument && containerRef.current) {
      console.log('🔄 PDF Viewer: Component ready, starting rendering...');
      renderAllPages(pdfDocument);
    }
  }, [isReadyToRender, pdfDocument]);

  // Effect to set ready state when component mounts
  useEffect(() => {
    console.log('🔄 PDF Viewer: Component mounted, setting isReadyToRender=true');
    setIsReadyToRender(true);
  }, []);

  useEffect(() => {
    if (!pdfUrl) {
      setError('No PDF URL provided');
      setIsLoading(false);
      return;
    }

    setTitle(pdfTitle);
    loadPDF(pdfUrl);
  }, [pdfUrl, pdfTitle]);

  // Function to wait for container to be available
  const waitForContainer = async (maxRetries = 50, delay = 100) => {
    for (let i = 0; i < maxRetries; i++) {
      if (containerRef.current) {
        console.log(`📄 PDF Viewer: Container found after ${i + 1} attempts`);
        return true;
      }
      console.log(`📄 PDF Viewer: Waiting for container... attempt ${i + 1}/${maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    console.error('❌ PDF Viewer: Container not found after maximum retries');
    return false;
  };

  const loadPDF = async (url: string) => {
    try {
      setIsLoading(true);
      setIsDownloading(true);
      setDownloadProgress(0);
      setError(null);

      console.log('📄 PDF Viewer: Starting download from URL:', url);

      // First, download the PDF with progress tracking
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get content length for progress tracking
      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      
      console.log('📄 PDF Viewer: Content length:', total, 'bytes');

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let receivedLength = 0;

      // Read the stream with progress updates
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        receivedLength += value.length;
        
        // Update progress
        const progress = total > 0 ? Math.round((receivedLength / total) * 100) : 0;
        setDownloadProgress(progress);
        
        console.log(`📄 PDF Viewer: Download progress: ${progress}% (${receivedLength}/${total} bytes)`);
      }

      // Combine all chunks into a single Uint8Array
      const allChunks = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        allChunks.set(chunk, position);
        position += chunk.length;
      }

      // Create blob from the downloaded data
      const blob = new Blob([allChunks], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      
      console.log('✅ PDF Viewer: Download complete, blob size:', blob.size, 'bytes');
      console.log('🔄 PDF Viewer: Setting isDownloading=false, isLoadingDocument=true');
      setIsDownloading(false);
      setIsLoadingDocument(true);
      setRenderProgress(0);
      setRenderedPagesCount(0);

      // Now load the PDF from the blob URL
      console.log('📄 PDF Viewer: Loading PDF from blob URL');
      const loadingTask = pdfjsLib.getDocument({
        url: blobUrl,
        cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
        cMapPacked: true,
      });

      const pdf = await loadingTask.promise;
      setPdfDocument(pdf);

      console.log('✅ PDF Viewer: PDF loaded successfully, pages:', pdf.numPages);
      
      // Now start rendering
      console.log('🔄 PDF Viewer: Setting isLoadingDocument=false, isProcessing=true');
      setIsLoadingDocument(false);
      setIsProcessing(true);
      
      // Set ready to render - the useEffect will handle the actual rendering
      console.log('🔄 PDF Viewer: Setting isReadyToRender=true');
      setIsReadyToRender(true);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load PDF';
      console.error('❌ PDF Viewer Error:', errorMessage);
      setError(errorMessage);
      setIsLoading(false);
      setIsDownloading(false);
      setIsLoadingDocument(false);
      setIsProcessing(false);
    }
  };

  const renderAllPages = async (pdf: any) => {
    const pages: HTMLCanvasElement[] = [];
    const container = containerRef.current;
    
    if (!container) {
      console.error('❌ PDF Viewer: Container not found for rendering, waiting...');
      const containerAvailable = await waitForContainer();
      if (!containerAvailable) {
        console.error('❌ PDF Viewer: Container still not available after waiting');
        return;
      }
    }
    
    // Get the container again after waiting
    const finalContainer = containerRef.current;
    if (!finalContainer) {
      console.error('❌ PDF Viewer: Container still null after waiting');
      return;
    }

    console.log(`📄 PDF Viewer: Starting to render ${pdf.numPages} pages`);

    try {
      // Calculate scale to fit container width
      const containerWidth = finalContainer.clientWidth - 40; // 40px padding
      console.log(`📄 PDF Viewer: Container width: ${containerWidth}px`);
      
      const firstPage = await pdf.getPage(1);
      const pageWidth = firstPage.getViewport({ scale: 1 }).width;
      const calculatedScale = Math.min(containerWidth / pageWidth, 2.0); // Max 2x zoom
      setScale(calculatedScale);
      
      console.log(`📄 PDF Viewer: Calculated scale: ${calculatedScale}, page width: ${pageWidth}px`);

      // Render all pages with progress tracking
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        console.log(`📄 PDF Viewer: Starting to render page ${pageNum}/${pdf.numPages}`);
        
        try {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: calculatedScale });
          
          console.log(`📄 PDF Viewer: Page ${pageNum} viewport: ${viewport.width}x${viewport.height}`);
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) {
            console.error(`❌ PDF Viewer: Could not get 2D context for page ${pageNum}`);
            continue;
          }

          canvas.height = viewport.height;
          canvas.width = viewport.width;
          canvas.className = 'shadow-lg bg-white mb-4 mx-auto block';
          canvas.style.maxWidth = '100%';
          canvas.style.height = 'auto';
          canvas.style.userSelect = 'none';
          (canvas.style as any).webkitUserSelect = 'none';
          (canvas.style as any).MozUserSelect = 'none';
          (canvas.style as any).msUserSelect = 'none';

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };

          console.log(`📄 PDF Viewer: Rendering page ${pageNum}...`);
          const renderStartTime = Date.now();
          
          await page.render(renderContext).promise;
          
          const renderEndTime = Date.now();
          console.log(`📄 PDF Viewer: Page ${pageNum} rendered in ${renderEndTime - renderStartTime}ms`);
          
          pages.push(canvas);
          
          // Update render progress and page count
          const progress = Math.round((pageNum / pdf.numPages) * 100);
          
          // Update state immediately
          setRenderProgress(progress);
          setRenderedPagesCount(pageNum);
          
          console.log(`📄 PDF Viewer: Rendered page ${pageNum}/${pdf.numPages} (${progress}%)`);
          
          // Add small delay every 5 pages to ensure progress is visible and prevent blocking
          if (pageNum % 5 === 0) {
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        } catch (err) {
          console.error(`❌ PDF Viewer: Error rendering page ${pageNum}:`, err);
        }
      }

      console.log(`📄 PDF Viewer: All ${pages.length} pages rendered, updating DOM...`);
      setRenderedPages(pages);
      
      // Append canvas elements to the container
      const pagesContainer = pagesContainerRef.current;
      if (pagesContainer) {
        console.log(`📄 PDF Viewer: Appending ${pages.length} pages to DOM...`);
        pagesContainer.innerHTML = '';
        pages.forEach((canvas, index) => {
          const wrapper = document.createElement('div');
          wrapper.className = 'mb-4';
          wrapper.appendChild(canvas);
          pagesContainer.appendChild(wrapper);
          
          if (index % 10 === 0) {
            console.log(`📄 PDF Viewer: Appended ${index + 1}/${pages.length} pages to DOM`);
          }
        });
        
        // Force a reflow to ensure DOM is updated
        pagesContainer.offsetHeight;
        console.log('📄 PDF Viewer: DOM update complete');
      } else {
        console.error('❌ PDF Viewer: Pages container not found');
      }
      
      console.log('✅ PDF Viewer: All pages rendered and DOM updated');
      
      // Mark rendering as complete
      console.log('🔄 PDF Viewer: Setting isProcessing=false, isLoading=false');
      setIsProcessing(false);
      setIsLoading(false);
    } catch (err) {
      console.error('❌ PDF Viewer: Error in renderAllPages:', err);
      setIsProcessing(false);
      setIsLoading(false);
    }
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  // Re-render all pages when scale changes
  useEffect(() => {
    if (pdfDocument && renderedPages.length > 0) {
      renderAllPages(pdfDocument);
    }
  }, [scale]);

  // Disable right-click, text selection, and keyboard shortcuts
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleSelectStart = (e: Event) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable common shortcuts
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (['s', 'p', 'c', 'a', 'f', 'g'].includes(key)) {
          e.preventDefault();
        }
      }
      // Disable F12, Ctrl+Shift+I, etc.
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-blue-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {isDownloading ? 'Downloading PDF...' : isLoadingDocument ? 'Loading PDF Document...' : isProcessing ? 'Rendering PDF Pages...' : 'Loading PDF...'}
          </h2>
          <p className="text-gray-600 mb-4">{title}</p>
          
          {isDownloading && (
            <div className="w-full">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Downloading from Cloudflare</span>
                <span>{downloadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Please wait while the file downloads...
              </p>
            </div>
          )}

          {isLoadingDocument && (
            <div className="w-full">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-blue-500" />
                <span className="text-sm text-gray-600">Loading PDF document...</span>
              </div>
              <p className="text-xs text-gray-500">
                Preparing PDF for rendering...
              </p>
            </div>
          )}

          {isProcessing && (
            <div className="w-full">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Rendering PDF pages</span>
                <span>{renderProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${renderProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {pdfDocument ? `Rendering page ${renderedPagesCount} of ${pdfDocument.numPages}...` : 'Preparing PDF for display...'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-6xl text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">PDF Load Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Go Back
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors ml-2"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Go Back"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-800 truncate max-w-md">
              {title}
            </h1>
            <p className="text-sm text-gray-500">
              {pdfDocument ? `${pdfDocument.numPages} pages` : 'PDF Document'}
            </p>
            
            {/* Document Loading Overlay in Header */}
            {isLoadingDocument && (
              <div className="mt-2 flex items-center space-x-2">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-blue-500 text-sm" />
                <span className="text-sm text-blue-600 font-medium">
                  Loading PDF document...
                </span>
              </div>
            )}

            {/* Processing Overlay in Header */}
            {isProcessing && (
              <div className="mt-2 flex items-center space-x-2">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-blue-500 text-sm" />
                <span className="text-sm text-blue-600 font-medium">
                  Rendering page {renderedPagesCount} of {pdfDocument?.numPages || '?'}: {renderProgress}%
                </span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${renderProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={() => window.close()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Close"
        >
          <FontAwesomeIcon icon={faTimes} className="text-gray-600" />
        </button>
      </div>
          
      {/* PDF Controls */}
      <div className="bg-white border-b px-4 py-2 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <button
            onClick={zoomOut}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors"
          >
            Zoom Out
          </button>
          <span className="text-sm text-gray-600 min-w-16 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors"
          >
            Zoom In
          </button>
                  <button
            onClick={resetZoom}
            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm transition-colors"
                  >
            Reset
                  </button>
                </div>
              </div>

      {/* PDF Canvas Container - Scrollable */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-gray-100 p-4 relative"
        style={{ userSelect: 'none' }}
      >
        {/* Loading Overlay - Show during processing */}
        {isProcessing && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
            <div className="text-center max-w-md">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Rendering PDF Pages...</h3>
              <p className="text-gray-600 mb-4">{title}</p>
              
              <div className="w-full">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Rendering pages</span>
                  <span>{renderProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${renderProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {pdfDocument ? `Rendering page ${renderedPagesCount} of ${pdfDocument.numPages}...` : 'Preparing PDF for display...'}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="max-w-4xl mx-auto">
          <div ref={pagesContainerRef}></div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t px-4 py-2 text-center text-sm text-gray-500">
        <p>PDF Viewer - Content protected. Download and copy disabled.</p>
      </div>
    </div>
  );
};