// ResponsiveVideoPlayer.tsx - Modern HTML5 video player with HLS support for Bunny.net
import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faSpinner, faExclamationTriangle, faForward, faBackward } from '@fortawesome/free-solid-svg-icons';

interface ResponsiveVideoPlayerProps {
  src: string; // HLS URL or direct video URL
  title?: string;
  poster?: string;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  onError?: (error: string) => void;
  onLoadStart?: () => void;
  onCanPlay?: () => void;
  className?: string;
}

export const ResponsiveVideoPlayer: React.FC<ResponsiveVideoPlayerProps> = ({
  src,
  title,
  poster,
  autoplay = false,
  muted = false,
  controls = true,
  onError,
  onLoadStart,
  onCanPlay,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(!autoplay);

  useEffect(() => {
    if (!src || !videoRef.current) return;

    const video = videoRef.current;
    setIsLoading(true);
    setError(null);
    onLoadStart?.();

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHLS = src.includes('.m3u8') || src.includes('manifest');

    if (isHLS) {
      // Use HLS.js for HLS streams
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
        });

        hlsRef.current = hls;

        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('HLS manifest parsed successfully');
          setIsLoading(false);
          onCanPlay?.();
          
          if (autoplay) {
            video.play().catch(err => {
              console.warn('Autoplay failed:', err);
              setShowPlayButton(true);
            });
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS error:', data);
          if (data.fatal) {
            const errorMessage = `Video playback error: ${data.details || 'Unknown HLS error'}`;
            setError(errorMessage);
            setIsLoading(false);
            onError?.(errorMessage);
          }
        });

      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = src;
        video.addEventListener('loadedmetadata', () => {
          console.log('Native HLS loaded');
          setIsLoading(false);
          onCanPlay?.();
        });
      } else {
        const errorMessage = 'HLS is not supported in this browser';
        setError(errorMessage);
        setIsLoading(false);
        onError?.(errorMessage);
      }
    } else {
      // Direct video URL
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        onCanPlay?.();
      });
    }

    // Video event listeners
    const handlePlay = () => {
      setIsPlaying(true);
      setShowPlayButton(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
      setShowPlayButton(true);
    };

    const handleError = () => {
      const errorMessage = 'Failed to load video';
      setError(errorMessage);
      setIsLoading(false);
      onError?.(errorMessage);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      onCanPlay?.();
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
      video.removeEventListener('canplay', handleCanPlay);
      
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, autoplay, onError, onLoadStart, onCanPlay]);

  const togglePlayPause = async () => {
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Play/pause error:', err);
    }
  };

  const skip = (deltaSeconds: number) => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const currentTime = video.currentTime;
    const duration = video.duration;
    
    if (!isFinite(duration)) return;
    
    const newTime = Math.max(0, Math.min(duration, currentTime + deltaSeconds));
    video.currentTime = newTime;
  };

  if (error) {
    return (
      <div className={`relative w-full bg-black rounded-lg overflow-hidden ${className}`}>
        <div className="aspect-video flex items-center justify-center">
          <div className="text-white text-center p-6">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl md:text-6xl mb-4" />
            <p className="text-lg md:text-xl font-medium mb-2">Video Error</p>
            <p className="text-sm md:text-base text-gray-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full bg-black rounded-lg ${controls ? 'overflow-visible' : 'overflow-hidden'} group ${className}`}>
      <div className="aspect-video relative">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          controls={controls}
          muted={muted}
          playsInline
          poster={poster}
          title={title}
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>

        {/* Loading Overlay (non-interactive) */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 pointer-events-none">
            <div className="text-white text-center">
              <FontAwesomeIcon icon={faSpinner} spin className="text-3xl md:text-5xl mb-4" />
              <p className="text-sm md:text-lg">Loading video...</p>
            </div>
          </div>
        )}

        {/* Custom Play Button Overlay */}
        {showPlayButton && !isLoading && !error && (
          <div 
            className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black bg-opacity-20 opacity-100 transition-opacity duration-300"
            onClick={togglePlayPause}
          >
            <div className="bg-black bg-opacity-70 rounded-full p-4 md:p-6 hover:bg-opacity-80 transition-all duration-300 transform hover:scale-105">
              <FontAwesomeIcon 
                icon={isPlaying ? faPause : faPlay} 
                className="text-white text-3xl md:text-5xl ml-1" 
              />
            </div>
          </div>
        )}

        {/* Skip Controls - Always visible on mobile/tablet, hover on desktop */}
        <div className="absolute inset-x-0 bottom-0 z-20 pointer-events-none">
          {/* Back 15 seconds button */}
          <button
            type="button"
            aria-label="Rewind 15 seconds"
            className="pointer-events-auto absolute left-3 md:left-4 lg:left-6 bottom-16 md:bottom-14 lg:bottom-16 bg-black/70 hover:bg-black/80 text-white rounded-full h-11 w-11 md:h-10 md:w-10 lg:h-12 lg:w-12 flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-white/70 active:scale-95 transition-all transform select-none opacity-90 md:opacity-0 md:group-hover:opacity-100 touch-manipulation"
            onClick={(e) => {
              e.stopPropagation();
              skip(-15);
            }}
          >
            <FontAwesomeIcon icon={faBackward} className="text-lg md:text-base lg:text-xl" />
          </button>

          {/* Forward 15 seconds button */}
          <button
            type="button"
            aria-label="Forward 15 seconds"
            className="pointer-events-auto absolute right-3 md:right-4 lg:right-6 bottom-16 md:bottom-14 lg:bottom-16 bg-black/70 hover:bg-black/80 text-white rounded-full h-11 w-11 md:h-10 md:w-10 lg:h-12 lg:w-12 flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-white/70 active:scale-95 transition-all transform select-none opacity-90 md:opacity-0 md:group-hover:opacity-100 touch-manipulation"
            onClick={(e) => {
              e.stopPropagation();
              skip(15);
            }}
          >
            <FontAwesomeIcon icon={faForward} className="text-lg md:text-base lg:text-xl" />
          </button>
        </div>
      </div>

      {/* Video Title (non-interactive so it doesn't steal hover) */}
      {title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <p className="text-white text-sm md:text-base font-medium truncate">{title}</p>
        </div>
      )}
    </div>
  );
};
