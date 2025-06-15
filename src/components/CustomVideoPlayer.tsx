
import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

interface CustomVideoPlayerProps {
  src: string;
  className?: string;
  onLoadedData?: () => void;
  onError?: () => void;
  autoPlay?: boolean;
  muted?: boolean;
}

const CustomVideoPlayer = forwardRef<HTMLVideoElement, CustomVideoPlayerProps>(
  ({ src, className, onLoadedData, onError, autoPlay = false, muted = false }, ref) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(muted);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [showControls, setShowControls] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout>();

    // Forward ref
    useEffect(() => {
      if (typeof ref === 'function') {
        ref(videoRef.current);
      } else if (ref) {
        ref.current = videoRef.current;
      }
    }, [ref]);

    const showControlsTemporarily = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    const togglePlay = async () => {
      if (videoRef.current) {
        try {
          if (isPlaying) {
            videoRef.current.pause();
          } else {
            await videoRef.current.play();
          }
        } catch (error) {
          console.log('Video play/pause error:', error);
        }
      }
    };

    const toggleMute = () => {
      if (videoRef.current) {
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
      }
    };

    const toggleFullscreen = () => {
      if (videoRef.current) {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          videoRef.current.requestFullscreen();
        }
      }
    };

    const handleTimeUpdate = () => {
      if (videoRef.current) {
        const current = videoRef.current.currentTime;
        const total = videoRef.current.duration;
        setCurrentTime(current);
        if (total) {
          setProgress((current / total) * 100);
        }
      }
    };

    const handleLoadedMetadata = () => {
      if (videoRef.current) {
        setDuration(videoRef.current.duration);
      }
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (videoRef.current) {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = clickX / width;
        videoRef.current.currentTime = percentage * videoRef.current.duration;
      }
    };

    const formatTime = (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const handleWaiting = () => setIsBuffering(true);
      const handleCanPlay = () => setIsBuffering(false);
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      video.addEventListener('waiting', handleWaiting);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);

      return () => {
        video.removeEventListener('waiting', handleWaiting);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
      };
    }, []);

    return (
      <div 
        className={`relative group ${className}`}
        onMouseEnter={showControlsTemporarily}
        onMouseMove={showControlsTemporarily}
        onMouseLeave={() => setShowControls(false)}
        onClick={showControlsTemporarily}
      >
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-cover"
          onLoadedData={onLoadedData}
          onLoadedMetadata={handleLoadedMetadata}
          onError={onError}
          onTimeUpdate={handleTimeUpdate}
          autoPlay={autoPlay}
          muted={muted}
          playsInline
          preload="metadata"
        />

        {/* Buffering indicator */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Custom Controls Overlay */}
        <div className={`absolute inset-0 transition-opacity duration-200 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          {/* Center Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </button>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
            {/* Progress Bar */}
            <div 
              className="w-full h-1 bg-white/30 rounded-full cursor-pointer mb-3 group"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-purple-500 rounded-full transition-all duration-100 relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-purple-400 transition-colors"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-purple-400 transition-colors"
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>

                <div className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-purple-400 transition-colors"
              >
                <Maximize size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CustomVideoPlayer.displayName = 'CustomVideoPlayer';

export default CustomVideoPlayer;
