// CustomVideoPlayer.tsx - Custom video player with controls
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlay, 
  faPause,
  faForward,
  faBackward,
  faVolumeUp,
  faVolumeMute,
  faExpand,
  faExclamationTriangle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

interface CustomVideoPlayerProps {
  src: string;
  isLoading?: boolean;
  error?: string;
  title?: string;
}

export const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({ 
  src, 
  isLoading, 
  error, 
  title 
}) => {
  // Debug props
  console.log('CustomVideoPlayer received props:', {
    src,
    isLoading,
    error,
    title,
    hasSrc: !!src
  });
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [isMuted, setIsMuted] = React.useState(false);
  const [playbackRate, setPlaybackRate] = React.useState(1);
  const [showControls, setShowControls] = React.useState(true);
  const [buffering, setBuffering] = React.useState(false);
  
  // Hide controls after inactivity
  React.useEffect(() => {
    // Skip effect if we're not showing the actual video player
    if (isLoading || error || !src) return;
    
    let timeout: NodeJS.Timeout;
    
    const resetTimeout = () => {
      clearTimeout(timeout);
      setShowControls(true);
      
      timeout = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };
    
    const handleMouseMove = () => resetTimeout();
    
    document.addEventListener('mousemove', handleMouseMove);
    resetTimeout();
    
    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isPlaying, isLoading, error, src]);
  
  // Update time and duration
  React.useEffect(() => {
    // Skip effect if we're not showing the actual video player
    if (isLoading || error || !src) return;
    
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    
    const handleDurationChange = () => {
      setDuration(video.duration);
    };
    
    const handlePlay = () => {
      setIsPlaying(true);
      setBuffering(false);
    };
    
    const handlePause = () => {
      setIsPlaying(false);
    };
    
    const handleWaiting = () => {
      setBuffering(true);
    };
    
    const handlePlaying = () => {
      setBuffering(false);
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
    };
  }, [isLoading, error, src]);
  
  // Update video element when src changes
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    
    // Reset state when src changes
    setCurrentTime(0);
    setIsPlaying(false);
    setPlaybackRate(1);
    
    // Load the new source
    video.load();
    
    // Optionally autoplay
    // video.play().catch(e => console.error('Error auto-playing video:', e));
  }, [src]);
  
  // Play/Pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };
  
  // Fast forward 20 seconds
  const fastForward = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = Math.min(video.currentTime + 10, video.duration);
  };
  
  // Rewind 20 seconds
  const rewind = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = Math.max(video.currentTime - 10, 0);
  };
  
  // Toggle mute
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };
  
  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    video.volume = newVolume;
    
    // If volume is set to 0, mute the video
    // If volume was 0 and is now increased, unmute
    if (newVolume === 0 && !isMuted) {
      video.muted = true;
      setIsMuted(true);
    } else if (newVolume > 0 && isMuted) {
      video.muted = false;
      setIsMuted(false);
    }
  };
  
  // Change playback rate
  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.playbackRate = rate;
    setPlaybackRate(rate);
  };
  
  // Format time (seconds to MM:SS)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    const videoContainer = document.querySelector('.video-container');
    if (!videoContainer) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoContainer.requestFullscreen();
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-black h-[80vh] flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-black h-[80vh] flex items-center justify-center">
        <div className="text-white text-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-6xl mb-4" />
          <p className="text-xl">Error loading video</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }
  
  if (!src) {
    return (
      <div className="bg-black h-[80vh] flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl">Video Player Placeholder</p>
          {title && <p className="text-sm mt-2">Currently playing: {title}</p>}
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="video-container relative w-full h-[80vh] bg-black"
      onMouseEnter={() => setShowControls(true)}
    >
      {/* Buffering Spinner Overlay */}
      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <FontAwesomeIcon icon={faSpinner} spin className="text-primary text-5xl opacity-80" />
        </div>
      )}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain select-none"
        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        onContextMenu={(e) => e.preventDefault()}
        onClick={togglePlay}
        onError={(e) => {
          console.error('Video element error:', e);
          console.error('Video element error details:', e.currentTarget.error);
        }}
        onLoadStart={() => console.log('Video load started')}
        onLoadedMetadata={() => console.log('Video metadata loaded')}
        onLoadedData={() => console.log('Video data loaded')}
        onCanPlay={() => console.log('Video can play')}
      />
      
      {/* Custom Controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Progress Bar */}
        <div 
          className="w-full h-2 bg-gray-600 rounded-full mb-4 cursor-pointer"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-primary rounded-full"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Play/Pause */}
            <button 
              className="text-white text-xl focus:outline-none"
              onClick={togglePlay}
            >
              <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
            </button>
            
            {/* Rewind */}
            <button 
              className="text-white text-xl focus:outline-none px-2"
              onClick={rewind}
            >
              <FontAwesomeIcon icon={faBackward} />
              <span className="text-xs ml-1">20s</span>
            </button>
            
            {/* Fast Forward */}
            <button 
              className="text-white text-xl focus:outline-none px-2"
              onClick={fastForward}
            >
              <FontAwesomeIcon icon={faForward} />
              <span className="text-xs ml-1">20s</span>
            </button>
            
            {/* Volume */}
            <div className="flex items-center space-x-2">
              <button 
                className="text-white text-xl focus:outline-none"
                onClick={toggleMute}
              >
                <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeUp} />
              </button>
              <div className="relative group w-24">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3390CE 0%, #3390CE ${volume * 100}%, #4B5563 ${volume * 100}%, #4B5563 100%)`
                  }}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Playback Rate */}
            <div className="relative group">
              <button className="text-white text-sm px-2 py-1 rounded bg-gray-700 hover:bg-gray-600">
                {playbackRate}x
              </button>
              <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-gray-800 rounded p-1">
                {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                  <button
                    key={rate}
                    className={`block w-full text-white text-sm px-2 py-1 text-left hover:bg-gray-700 ${playbackRate === rate ? 'bg-primary' : ''}`}
                    onClick={() => changePlaybackRate(rate)}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
            
            {/* Fullscreen */}
            <button 
              className="text-white text-xl focus:outline-none"
              onClick={toggleFullscreen}
            >
              <FontAwesomeIcon icon={faExpand} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
