// UnifiedVideoPlayer.tsx - Responsive Bunny CDN video player with iframe embed
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { validateConfig, VIDEO_CDN_CONFIG } from '../../config/videoCDN';

interface UnifiedVideoPlayerProps {
  videoId: string; // Video ID from Bunny CDN
  isLoading?: boolean;
  error?: string;
  title?: string;
  autoplay?: boolean;
}

export const UnifiedVideoPlayer: React.FC<UnifiedVideoPlayerProps> = ({ 
  videoId,
  isLoading = false,
  error: propError,
  title,
  autoplay = false
}) => {
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [configValidation, setConfigValidation] = useState({ bunnycdn: true });

  // Validate CDN configuration on mount
  useEffect(() => {
    const validation = validateConfig();
    setConfigValidation(validation);
    
    if (!validation.bunnycdn) {
      console.warn('⚠️ Bunny CDN configuration is incomplete. Please update videoCDN.ts with your Bunny CDN credentials.');
    }
  }, []);

  // Validate video ID
  useEffect(() => {
    // Validate that we have a video ID (not a full URL)
    if (!videoId || videoId.includes('/') || videoId.includes('.')) {
      console.error('UnifiedVideoPlayer: Video ID required, full URLs not supported');
      setVideoError('Invalid video ID format. Please use only the video ID from your Bunny CDN dashboard.');
      return;
    }

    // Check if provider configuration is valid
    if (!configValidation.bunnycdn) {
      setVideoError('Bunny CDN is not configured. Please update videoCDN.ts with your credentials.');
      return;
    }

    console.log(`📹 Loading Bunny CDN video:`, videoId);
    setVideoError(null);
  }, [videoId, configValidation]);

  // Generate Bunny CDN iframe URL
  const getIframeUrl = (): string => {
    if (!VIDEO_CDN_CONFIG.bunnycdn.libraryId || !videoId) {
      return '';
    }
    
    // Build URL with autoplay parameter if needed
    let baseUrl = VIDEO_CDN_CONFIG.bunnycdn.getIframeUrl(videoId);
    
    // Add query parameters
    const params = new URLSearchParams();
    if (autoplay) {
      params.set('autoplay', 'true');
    }
    // Controls are enabled by default in Bunny CDN player
    // Keyboard controls work automatically with Bunny's player
    
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  // Handle iframe load
  const handleIframeLoad = () => {
    setIsPlayerReady(true);
    console.log('📹 Bunny CDN video player ready');
  };

  // Handle iframe error
  const handleIframeError = () => {
    const errorMessage = 'Failed to load video player';
    setVideoError(errorMessage);
    setIsPlayerReady(false);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full bg-black rounded-lg overflow-hidden">
        <div className="aspect-video flex items-center justify-center">
          <div className="text-white text-center">
            <FontAwesomeIcon icon={faSpinner} spin className="text-4xl md:text-6xl mb-4" />
            <p className="text-lg md:text-xl">Loading video...</p>
            <p className="text-sm mt-2 text-gray-400">Bunny CDN</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (propError || videoError) {
    return (
      <div className="w-full bg-black rounded-lg overflow-hidden">
        <div className="aspect-video flex items-center justify-center">
          <div className="text-white text-center px-4">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl md:text-6xl mb-4 text-red-500" />
            <p className="text-lg md:text-xl mb-2">Error loading video</p>
            <p className="text-sm text-gray-300">{propError || videoError}</p>
            {!configValidation.bunnycdn && (
              <div className="mt-4 p-4 bg-yellow-900 bg-opacity-30 rounded border border-yellow-600 text-left text-xs max-w-md">
                <p className="font-bold mb-2">Configuration Required:</p>
                <p>To use Bunny CDN, update <code className="bg-black bg-opacity-50 px-1">frontend/src/config/videoCDN.ts</code> with:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Your Bunny CDN storage zone name</li>
                  <li>Your Bunny Stream library ID</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Show placeholder if no source
  if (!videoId) {
    return (
      <div className="w-full bg-black rounded-lg overflow-hidden">
        <div className="aspect-video flex items-center justify-center">
          <div className="text-white text-center">
            <p className="text-lg md:text-xl">No video available</p>
            {title && <p className="text-sm mt-2 text-gray-400">{title}</p>}
          </div>
        </div>
      </div>
    );
  }

  const iframeUrl = getIframeUrl();
  console.log(`📹 Rendering Bunny CDN iframe player:`, iframeUrl);

  return (
    <div className="w-full">
      {/* Responsive Video Container */}
      <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg">
        {/* Aspect ratio container for responsive design */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}> {/* 16:9 aspect ratio */}
          {/* Loading overlay */}
          {!isPlayerReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
              <div className="text-white text-center">
                <FontAwesomeIcon icon={faSpinner} spin className="text-4xl md:text-6xl mb-4" />
                <p className="text-sm md:text-lg">Loading video player...</p>
              </div>
            </div>
          )}
          
          {/* Bunny CDN iframe player */}
          <iframe
            src={iframeUrl}
            className="absolute top-0 left-0 w-full h-full border-0"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            title={title || 'Video player'}
            loading="lazy"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            // Security: Sandbox with necessary permissions
            sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
            // Accessibility: Enable keyboard controls
            tabIndex={0}
            // Responsive attributes
            style={{
              width: '100%',
              height: '100%',
              minHeight: '315px' // Minimum height for mobile devices
            }}
          />
        </div>
      </div>
      
      {/* Provider Badge */}
      <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
        <span className="flex items-center">
          <span className="inline-block w-2 h-2 rounded-full mr-2 bg-green-500"></span>
          Bunny CDN
        </span>
        {title && <span className="truncate ml-4">{title}</span>}
      </div>
    </div>
  );
};
