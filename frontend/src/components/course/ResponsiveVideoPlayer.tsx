// ResponsiveVideoPlayer.tsx - Modern HTML5 video player with HLS support for Bunny.net
import React, { useRef, useEffect, useState, useMemo } from 'react';
import Hls from 'hls.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faPause,
  faSpinner,
  faExclamationTriangle,
  faVolumeHigh,
  faVolumeXmark,
  faExpand,
  faCompress,
  faGaugeSimpleHigh
} from '@fortawesome/free-solid-svg-icons';
import rewindIcon from '../../assets/rewind-10.png';
import forwardIcon from '../../assets/forward-10.png';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const lastTapRef = useRef<{ time: number; side: 'left' | 'right' | null }>({ time: 0, side: null });
  const cancelNextClickRef = useRef(false);
  const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [qualityLevels, setQualityLevels] = useState<Array<{ label: string; level: number; height?: number; bitrate?: number }>>([]);
  const [selectedQuality, setSelectedQuality] = useState<string>('auto');
  const [show720pWarning, setShow720pWarning] = useState(false);
  const resumeStorageKey = useMemo(() => `medhome-video-resume:${src}`, [src]);
  const [resumeRestored, setResumeRestored] = useState(false);
  const useCustomControls = controls !== false;
  const hasDuration = Number.isFinite(duration) && duration > 0;
  const [controlsVisible, setControlsVisible] = useState(true);
  const sliderMax = hasDuration ? duration : 0;
  const sliderValue = hasDuration ? Math.min(progress, duration) : 0;
  const remainingTime = hasDuration ? Math.max(duration - sliderValue, 0) : 0;
  const qualityLabel = selectedQuality === 'auto'
    ? 'Auto Quality'
    : `Quality: ${qualityLevels.find((level) => level.level.toString() === selectedQuality)?.label || 'Custom'}`;

  const formatTime = (timeInSeconds: number) => {
    if (!Number.isFinite(timeInSeconds)) return '00:00';
    const totalSeconds = Math.max(0, Math.floor(timeInSeconds));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const activeElement = document.fullscreenElement;
      const isFull = !!activeElement && containerRef.current ? activeElement === containerRef.current : false;
      setIsFullscreen(isFull);

      const orientationApi = (screen as Screen & { orientation?: ScreenOrientation }).orientation;
      if (!isFull && orientationApi?.unlock) {
        try {
          orientationApi.unlock();
        } catch {
          // Ignore failures (not all browsers support unlock)
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Keyboard controls for arrow keys (desktop only)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      // Only handle arrow keys
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        skip(-10);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        skip(10);
      }
    };

    // Add event listener to window
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!src || !videoRef.current) return;

    const video = videoRef.current;
    setIsLoading(true);
    setError(null);
    onLoadStart?.();
    setQualityLevels([]);
    setSelectedQuality('auto');
    setShow720pWarning(false);

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

          const mappedLevels = hls.levels.map((level, index) => ({
            label: level.height ? `${level.height}p` : `${Math.round(level.bitrate / 1000)} kbps`,
            level: index,
            height: level.height,
            bitrate: level.bitrate
          }));
          setQualityLevels(mappedLevels);

          // Force 720p quality if available
          const level720p = mappedLevels.find(level => level.height === 720);
          if (level720p) {
            // Setting currentLevel to a specific value automatically disables auto mode
            hls.currentLevel = level720p.level;
            setSelectedQuality(level720p.level.toString());
            setShow720pWarning(false);
            console.log('Forced 720p quality:', level720p);
          } else {
            // Fallback to auto if 720p is not available
            setSelectedQuality('auto');
            setShow720pWarning(true);
            console.log('720p not available, using auto quality');
          }

          if (autoplay) {
            video.play().catch(err => {
              console.warn('Autoplay failed:', err);
              setShowPlayButton(true);
            });
          }
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
          if (!hlsRef.current) return;
          // Check if auto mode is enabled (currentLevel === -1 means auto)
          if (hlsRef.current.currentLevel === -1) {
            setSelectedQuality('auto');
          } else {
            setSelectedQuality(data.level.toString());
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
    };

    const handlePause = () => {
      setIsPlaying(false);
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

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      setProgress(current);

      if (current > 1) {
        try {
          localStorage.setItem(resumeStorageKey, current.toString());
        } catch (storageError) {
          console.warn('Unable to persist resume state', storageError);
        }
      }
    };

    const handleDurationChange = () => {
      if (Number.isFinite(video.duration)) {
        setDuration(video.duration);
      }
    };

    const handleEnded = () => {
      try {
        localStorage.removeItem(resumeStorageKey);
      } catch {
        // Ignore cleanup failures
      }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('ended', handleEnded);

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, autoplay, onError, onLoadStart, onCanPlay]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || resumeRestored) return;

    const saved = localStorage.getItem(resumeStorageKey);
    if (!saved) {
      setResumeRestored(true);
      return;
    }

    const resumeTime = parseFloat(saved);
    if (!Number.isFinite(resumeTime) || resumeTime <= 0) {
      setResumeRestored(true);
      return;
    }

    const applyResume = () => {
      video.currentTime = Math.min(resumeTime, video.duration || resumeTime);
      setResumeRestored(true);
    };

    if (video.readyState >= 1) {
      applyResume();
    } else {
      const handleLoadedMetadata = () => {
        applyResume();
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    }
  }, [resumeStorageKey, resumeRestored]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

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

  const handleSeek = (newTime: number) => {
    if (!videoRef.current || !Number.isFinite(duration)) return;
    videoRef.current.currentTime = newTime;
    setProgress(newTime);
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
    if (!isMuted && volume === 0) {
      setVolume(0.5);
    }
  };

  const toggleFullscreen = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current as HTMLVideoElement & {
      webkitEnterFullscreen?: () => void;
      webkitExitFullscreen?: () => void;
      webkitDisplayingFullscreen?: boolean;
    };

    // Check if iOS Safari (supports webkit fullscreen on video element)
    const isIOSSafari = typeof video.webkitEnterFullscreen === 'function';

    if (isIOSSafari) {
      // iOS Safari: Use webkit fullscreen on video element
      try {
        if (video.webkitDisplayingFullscreen) {
          video.webkitExitFullscreen?.();
        } else {
          video.webkitEnterFullscreen?.();
        }
      } catch (error) {
        console.warn('iOS fullscreen failed', error);
      }
    } else {
      // Desktop/Android: Use standard fullscreen API on container
      if (!containerRef.current) return;

      if (!document.fullscreenElement) {
        try {
          await containerRef.current.requestFullscreen();

          const orientationApi = (screen as Screen & { orientation?: ScreenOrientation }).orientation;
          if (window.matchMedia && window.matchMedia('(max-width: 768px)').matches && orientationApi?.lock) {
            await orientationApi.lock('landscape').catch(() => {
              // Orientation lock may fail on some devices or when rotation lock is enabled.
            });
          }
        } catch (fsError) {
          console.warn('Fullscreen request failed', fsError);
        }
      } else {
        await document.exitFullscreen().catch(() => { });
      }
    }
  };

  const handleQualityChange = (value: string) => {
    setSelectedQuality(value);

    if (!hlsRef.current) return;

    if (value === 'auto') {
      // Setting currentLevel to -1 enables auto mode
      hlsRef.current.currentLevel = -1;
      return;
    }

    const parsed = parseInt(value, 10);
    if (!Number.isNaN(parsed)) {
      // Setting currentLevel to a specific value automatically disables auto mode
      hlsRef.current.currentLevel = parsed;
    }
  };

  const handleDesktopDoubleClick = (event: React.MouseEvent<HTMLVideoElement>) => {
    if (!useCustomControls || !videoRef.current) return;
    const rect = videoRef.current.getBoundingClientRect();
    const side = event.clientX - rect.left < rect.width / 2 ? 'left' : 'right';
    skip(side === 'left' ? -20 : 20);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLVideoElement>) => {
    if (!useCustomControls || !videoRef.current) return;
    const touch = event.changedTouches[0];
    if (!touch) return;
    const rect = videoRef.current.getBoundingClientRect();
    const side = touch.clientX - rect.left < rect.width / 2 ? 'left' : 'right';
    const now = Date.now();

    if (lastTapRef.current.side === side && now - lastTapRef.current.time < 350) {
      skip(side === 'left' ? -20 : 20);
      cancelNextClickRef.current = true;
      event.preventDefault();
    }

    lastTapRef.current = { time: now, side };
  };

  const clearHideControlsTimeout = () => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
      hideControlsTimeoutRef.current = null;
    }
  };

  const scheduleHideControls = () => {
    clearHideControlsTimeout();
    if (!isPlaying) {
      return;
    }
    hideControlsTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  };

  const handleUserInteraction = () => {
    if (!useCustomControls) return;
    setControlsVisible(true);
    scheduleHideControls();
  };

  useEffect(() => {
    if (!useCustomControls) return;
    if (!isPlaying) {
      setControlsVisible(true);
      clearHideControlsTimeout();
      return;
    }
    scheduleHideControls();
    return () => {
      clearHideControlsTimeout();
    };
  }, [isPlaying, useCustomControls]);

  useEffect(() => {
    return () => clearHideControlsTimeout();
  }, []);

  if (error) {
    return (
      <div className={`relative w-full bg-black rounded-lg overflow-hidden ${className}`} style={{ backgroundColor: '#000000' }}>
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
    <div className={`relative w-full bg-black rounded-lg ${className}`} style={{ backgroundColor: '#000000' }}>
      <div
        ref={containerRef}
        className="aspect-video relative bg-black"
        onMouseMove={handleUserInteraction}
        onTouchStart={handleUserInteraction}
        onTouchMove={handleUserInteraction}
        onClickCapture={handleUserInteraction}
        onKeyDownCapture={handleUserInteraction}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          controls={!useCustomControls}
          muted={muted || isMuted}
          playsInline
          poster={poster}
          title={title}
          preload="metadata"
          onClick={
            useCustomControls
              ? undefined  // Let the overlay handle clicks for custom controls
              : undefined
          }
          onDoubleClick={useCustomControls ? handleDesktopDoubleClick : undefined}
          onTouchEnd={useCustomControls ? handleTouchEnd : undefined}
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

        {/* Clickable overlay for middle 80% area */}
        {useCustomControls && !isLoading && !error && (
          <div
            className="absolute inset-x-0 top-[10%] bottom-[10%] cursor-pointer"
            onClick={(event) => {
              // Don't trigger on double-clicks (let video handle them for skipping)
              if (event.detail > 1) {
                return;
              }
              // Don't trigger if clicking on controls or control elements
              const target = event.target as HTMLElement;
              if (target.closest('button') || target.closest('input') || target.closest('select')) {
                return;
              }
              event.stopPropagation();
              handleUserInteraction();
              togglePlayPause();
            }}
            style={{
              zIndex: 30,
              pointerEvents: 'auto'
            }}
          />
        )}

        {/* Desktop Controls - Overlaid (hidden on mobile) */}
        {useCustomControls && (
          <div
            className={`hidden md:block absolute inset-0 z-40 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
          >
            {/* Central Play/Pause Button */}
            {!isLoading && !error && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="bg-black/80 rounded-full p-4 md:p-6 hover:bg-black/90 transition-all duration-300 transform hover:scale-105 cursor-pointer pointer-events-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUserInteraction();
                    togglePlayPause();
                  }}
                >
                  <FontAwesomeIcon
                    icon={isPlaying ? faPause : faPlay}
                    className="text-white text-3xl md:text-5xl ml-1"
                  />
                </div>
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 pointer-events-none">
              <div className="w-full bg-gradient-to-t from-black/5 via-black/5 to-transparent px-4 pt-6 pb-4 space-y-3 pointer-events-auto">
                {(title || selectedQuality) && (
                  <div className="flex items-center justify-between text-white text-xs md:text-sm">
                    <p className="font-medium truncate pr-4">{title || 'Lesson Video'}</p>
                    <div className="flex items-center gap-2 text-gray-200">
                      <FontAwesomeIcon icon={faGaugeSimpleHigh} className="text-[10px] text-primary" />
                      <span>{qualityLabel}</span>
                    </div>
                  </div>
                )}

                {show720pWarning && (
                  <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 rounded px-3 py-2 text-amber-200 text-xs">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-400 flex-shrink-0" />
                    <span>High quality video (720p) is not available for this video.</span>
                  </div>
                )}

                <div className="relative">
                  <input
                    type="range"
                    min={0}
                    max={sliderMax}
                    value={sliderValue}
                    step="0.1"
                    onChange={(e) => {
                      e.stopPropagation();
                      handleUserInteraction();
                      handleSeek(parseFloat(e.target.value));
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-white text-xs mt-1">
                    <span>{formatTime(sliderValue)}</span>
                    <span>-{formatTime(remainingTime)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-white">
                  <button
                    type="button"
                    className="bg-white/10 hover:bg-white/20 rounded-full h-10 w-10 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUserInteraction();
                      togglePlayPause();
                    }}
                  >
                    <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className="text-primary text-xl" />
                  </button>

                  <button
                    type="button"
                    aria-label="Rewind 10 seconds"
                    className="bg-white/10 hover:bg-white/20 rounded-full h-10 w-10 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUserInteraction();
                      skip(-10);
                    }}
                  >
                    <img src={rewindIcon} alt="Rewind 10s" className="w-9 h-9" />
                  </button>

                  <button
                    type="button"
                    aria-label="Forward 10 seconds"
                    className="bg-white/10 hover:bg-white/20 rounded-full h-10 w-10 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUserInteraction();
                      skip(10);
                    }}
                  >
                    <img src={forwardIcon} alt="Forward 10s" className="w-9 h-9" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUserInteraction();
                        toggleMute();
                      }}
                    >
                      <FontAwesomeIcon icon={isMuted || volume === 0 ? faVolumeXmark : faVolumeHigh} className="text-primary text-xl" />
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleUserInteraction();
                        const value = parseFloat(e.target.value);
                        setVolume(value);
                        if (value > 0 && isMuted) {
                          setIsMuted(false);
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-24 accent-emerald-400 cursor-pointer"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs uppercase tracking-wide">
                    Speed
                    <select
                      value={playbackRate}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleUserInteraction();
                        setPlaybackRate(parseFloat(e.target.value));
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-black/60 border border-white/20 rounded px-2 py-1 text-white text-sm"
                    >
                      {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                        <option key={rate} value={rate}>{rate}x</option>
                      ))}
                    </select>
                  </label>

                  {qualityLevels.length > 0 && (
                    <label className="flex items-center gap-2 text-xs uppercase tracking-wide">
                      Quality
                      <select
                        value={selectedQuality}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleUserInteraction();
                          handleQualityChange(e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-black/60 border border-white/20 rounded px-2 py-1 text-white text-sm"
                      >
                        <option value="auto">Auto (network)</option>
                        {qualityLevels.map(level => (
                          <option key={level.level} value={level.level}>
                            {level.label} {level.bitrate ? `(${Math.round(level.bitrate / 1000)} kbps)` : ''}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  <button
                    type="button"
                    className="ml-auto bg-white/10 hover:bg-white/20 rounded-full h-10 w-10 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUserInteraction();
                      toggleFullscreen();
                    }}
                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  >
                    <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} className="text-primary text-xl" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Controls - Below Video (visible only on mobile) */}
      {useCustomControls && (
        <div className="md:hidden bg-black px-4 py-3 space-y-3 rounded-b-lg">
          {(title || selectedQuality) && (
            <div className="flex items-center justify-between text-white text-xs">
              <p className="font-medium truncate pr-4">{title || 'Lesson Video'}</p>
              <div className="flex items-center gap-2 text-gray-200">
                <FontAwesomeIcon icon={faGaugeSimpleHigh} className="text-[10px] text-primary" />
                <span>{qualityLabel}</span>
              </div>
            </div>
          )}

          {show720pWarning && (
            <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 rounded px-3 py-2 text-amber-200 text-xs">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-400 flex-shrink-0" />
              <span>High quality video (720p) is not available for this video.</span>
            </div>
          )}

          <div className="relative">
            <input
              type="range"
              min={0}
              max={sliderMax}
              value={sliderValue}
              step="0.1"
              onChange={(e) => {
                handleSeek(parseFloat(e.target.value));
              }}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex items-center justify-between text-white text-xs mt-1">
              <span>{formatTime(sliderValue)}</span>
              <span>-{formatTime(remainingTime)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-white">
            <button
              type="button"
              className="bg-white/10 hover:bg-white/20 rounded-full h-10 w-10 flex items-center justify-center"
              onClick={() => togglePlayPause()}
            >
              <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className="text-primary text-xl" />
            </button>

            <button
              type="button"
              aria-label="Rewind 10 seconds"
              className="bg-white/10 hover:bg-white/20 rounded-full h-10 w-10 flex items-center justify-center"
              onClick={() => skip(-10)}
            >
              <img src={rewindIcon} alt="Rewind 10s" className="w-9 h-9" />
            </button>

            <button
              type="button"
              aria-label="Forward 10 seconds"
              className="bg-white/10 hover:bg-white/20 rounded-full h-10 w-10 flex items-center justify-center"
              onClick={() => skip(10)}
            >
              <img src={forwardIcon} alt="Forward 10s" className="w-9 h-9" />
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                onClick={() => toggleMute()}
              >
                <FontAwesomeIcon icon={isMuted || volume === 0 ? faVolumeXmark : faVolumeHigh} className="text-primary text-xl" />
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setVolume(value);
                  if (value > 0 && isMuted) {
                    setIsMuted(false);
                  }
                }}
                className="w-24 accent-emerald-400 cursor-pointer"
              />
            </div>

            <label className="flex items-center gap-2 text-xs uppercase tracking-wide">
              Speed
              <select
                value={playbackRate}
                onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                className="bg-black/60 border border-white/20 rounded px-2 py-1 text-white text-sm"
              >
                {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                  <option key={rate} value={rate}>{rate}x</option>
                ))}
              </select>
            </label>

            {qualityLevels.length > 0 && (
              <label className="flex items-center gap-2 text-xs uppercase tracking-wide">
                Quality
                <select
                  value={selectedQuality}
                  onChange={(e) => handleQualityChange(e.target.value)}
                  className="bg-black/60 border border-white/20 rounded px-2 py-1 text-white text-sm"
                >
                  <option value="auto">Auto (network)</option>
                  {qualityLevels.map(level => (
                    <option key={level.level} value={level.level}>
                      {level.label} {level.bitrate ? `(${Math.round(level.bitrate / 1000)} kbps)` : ''}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <button
              type="button"
              className="ml-auto bg-white/10 hover:bg-white/20 rounded-full h-10 w-10 flex items-center justify-center"
              onClick={() => toggleFullscreen()}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} className="text-primary text-xl" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
