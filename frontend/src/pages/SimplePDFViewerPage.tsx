import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle, faSearchPlus, faSearchMinus } from '@fortawesome/free-solid-svg-icons';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, RenderParameters } from 'pdfjs-dist/types/src/display/api';
// IMPORTANT: load worker via Vite asset pipeline so CDN is not used
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite `?url` import returns string
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min?url';

// Set up PDF.js worker using locally bundled asset (avoids CDN 404s / CORS)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export const SimplePDFViewerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const containerRef = useRef<HTMLDivElement>(null);
  const pagesContainerRef = useRef<HTMLDivElement>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderingPage, setRenderingPage] = useState(0);
  
  const pdfUrl = searchParams.get('url');
  const pdfTitle = searchParams.get('title') || 'PDF Document';

  // Comprehensive security measures
  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Disable keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable Ctrl+S (Save), Ctrl+P (Print), Ctrl+A (Select All), etc.
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (['s', 'p', 'a', 'c', 'x', 'v', 'f', 'g', 'u', 'i', 'j', 'k', 'o', 'n'].includes(key)) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
      
      // Disable F12 (DevTools), Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) ||
        (e.ctrlKey && e.shiftKey && e.key === 'I')
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Disable Print Screen
      if (e.key === 'PrintScreen' || (e.shiftKey && e.key === 'F13')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      const scrollContainer = () => {
        if (!containerRef.current) return null;
        return containerRef.current;
      };

      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const container = scrollContainer();
        if (!container) {
          return;
        }

        const viewportHeight = window.innerHeight || 600;
        let delta = 0;

        switch (e.key) {
          case 'ArrowUp':
          case 'ArrowLeft':
            delta = -viewportHeight * 0.5;
            break;
          case 'ArrowDown':
          case 'ArrowRight':
            delta = viewportHeight * 0.5;
            break;
          case 'PageUp':
            delta = -viewportHeight;
            break;
          case 'PageDown':
            delta = viewportHeight;
            break;
          case 'Home':
            container.scrollTo({ top: 0, behavior: 'smooth' });
            e.preventDefault();
            e.stopPropagation();
            return;
          case 'End':
            container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
            e.preventDefault();
            e.stopPropagation();
            return;
          default:
            return;
        }

        container.scrollBy({ top: delta, behavior: 'smooth' });
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    };

    // Disable drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable copy
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable print
    const handleBeforePrint = (e: Event) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('drop', handleDrop);
    document.addEventListener('copy', handleCopy);
    window.addEventListener('beforeprint', handleBeforePrint);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('drop', handleDrop);
      document.removeEventListener('copy', handleCopy);
      window.removeEventListener('beforeprint', handleBeforePrint);
    };
  }, []);

  // Additional CSS to prevent downloads and selection
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Prevent text selection */
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      
      /* Hide any download buttons or links */
      a[download],
      button[download],
      .download,
      #download,
      .print,
      #print {
        display: none !important;
      }
      
      /* Prevent image dragging */
      img, canvas {
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
        pointer-events: none !important;
      }
      
      /* Disable context menu on canvas */
      canvas {
        -webkit-touch-callout: none !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Load PDF using PDF.js
  useEffect(() => {
    if (!pdfUrl) {
      setError('No PDF URL provided');
      setIsLoading(false);
      return;
    }

    document.title = pdfTitle;
    loadPDF(pdfUrl);
  }, [pdfUrl, pdfTitle]);

  const loadPDF = async (url: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setIsDownloading(true);
      setDownloadProgress(0);

      const proxyUrl = `/api/course-content/proxy-pdf?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch PDF (status ${response.status})`);
      }

      const contentLengthHeader = response.headers.get('content-length');
      const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;
      const reader = response.body?.getReader();

      if (!reader) {
        throw new Error('Unable to read PDF stream');
      }

      const chunks: Uint8Array[] = [];
      let receivedBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          receivedBytes += value.length;
          if (totalBytes > 0) {
            setDownloadProgress(Math.round((receivedBytes / totalBytes) * 100));
          }
        }
      }

      const pdfData = new Uint8Array(receivedBytes);
      let position = 0;
      for (const chunk of chunks) {
        pdfData.set(chunk, position);
        position += chunk.length;
      }

      const loadingTask = pdfjsLib.getDocument({ data: pdfData });
      const pdf = await loadingTask.promise;
      setPdfDocument(pdf);
      setTotalPages(pdf.numPages);
    } catch (err) {
      console.error('Error loading PDF:', err);
      const message = err instanceof Error ? err.message : 'Failed to load PDF. Please check the URL.';
      setError(message);
      setIsLoading(false);
    } finally {
      setIsDownloading(false);
    }
  };

  const renderPagesStreaming = useCallback(async () => {
    if (!pdfDocument || !pagesContainerRef.current) return;

    const container = pagesContainerRef.current;
    container.innerHTML = '';

    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      try {
        setRenderingPage(pageNum);
        const page = await pdfDocument.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.className = 'pdf-page-canvas mb-6 mx-auto shadow-lg rounded';
        canvas.style.display = 'block';
        canvas.style.userSelect = 'none';
        canvas.style.pointerEvents = 'none';

        const context = canvas.getContext('2d', { willReadFrequently: false });
        if (!context) {
          throw new Error('Could not get canvas context');
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext: RenderParameters = {
          canvasContext: context,
          canvas,
          viewport,
        };

        await page.render(renderContext).promise;

        const wrapper = document.createElement('div');
        wrapper.setAttribute('data-page', pageNum.toString());
        wrapper.className = 'pdf-page-wrapper flex flex-col items-center';

        const pageLabel = document.createElement('p');
        pageLabel.className = 'text-xs text-gray-300 mb-2 tracking-wide';
        pageLabel.textContent = `Page ${pageNum} of ${pdfDocument.numPages}`;

        wrapper.appendChild(pageLabel);
        wrapper.appendChild(canvas);
        container.appendChild(wrapper);
      } catch (err) {
        console.error(`Error rendering page ${pageNum}:`, err);
      }

      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }, [pdfDocument, scale]);

  useEffect(() => {
    if (!pdfDocument) return;

    const render = async () => {
      try {
        setIsRendering(true);
        setIsLoading(true);
        await renderPagesStreaming();
      } finally {
        setIsRendering(false);
        setIsLoading(false);
      }
    };

    render();
  }, [pdfDocument, renderPagesStreaming, scale]);

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  if (error) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-6xl text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">PDF Load Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col" style={{ userSelect: 'none' }}>
      {/* Header with controls */}
      <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between border-b border-gray-700 sticky top-0 z-50">
        <h1 className="text-sm font-medium truncate max-w-md">{pdfTitle}</h1>
        
        <div className="flex items-center space-x-4 text-xs text-gray-200">
          <span className="hidden md:inline">Scroll up / down or use arrow keys to navigate.</span>
          <span className="md:hidden">Swipe vertically to navigate.</span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Zoom controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={zoomOut}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="Zoom Out"
            >
              <FontAwesomeIcon icon={faSearchMinus} />
            </button>
            <span className="text-xs w-12 text-center">{Math.round(scale * 100)}%</span>
            <button
              onClick={zoomIn}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="Zoom In"
            >
              <FontAwesomeIcon icon={faSearchPlus} />
            </button>
          </div>

          {isLoading && (
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-sm" />
              <span className="text-xs">Loading...</span>
            </div>
          )}
        </div>
      </div>
      
      {/* PDF Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-gray-700 p-4 relative"
        tabIndex={0}
        style={{ 
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 z-10">
            <div className="text-center">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-white mb-4" />
              <p className="text-white text-sm">
                {isDownloading && downloadProgress > 0
                  ? `Downloading PDF... ${downloadProgress}%`
                  : isRendering && renderingPage > 0
                    ? `Rendering page ${renderingPage} of ${totalPages || '?'}...`
                    : 'Preparing PDF...'}
              </p>
            </div>
          </div>
        )}

        <div ref={pagesContainerRef} className="relative z-0" />
      </div>
    </div>
  );
};
