
import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { isYouTubeUrl, getYouTubeEmbedUrl, extractYouTubeId } from '@/lib/postUtils';
import { useYouTubeThumbnail } from '@/lib/hooks/useYoutubeThumbnail';
import { Keys } from '@/data/data';
import CustomVideoPlayer from './CustomVideoPlayer';

interface LazyVideoProps {
  src: string;
  className?: string;
  placeholder?: boolean;
}

let currentPlayingVideo: HTMLVideoElement | null = null;

const LazyVideo = ({ src, className, placeholder = true }: LazyVideoProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoId = extractYouTubeId(src);
  const thumbnail = useYouTubeThumbnail(videoId || '', Keys.YOUTUBE_API_KEY);

  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.5,
  });

  const handleLoad = () => setLoaded(true);
  const handleError = () => {
    setError(true);
    setLoaded(true);
  };

  useEffect(() => {
    // For YouTube videos, we don't need the auto-play logic
    if (isYouTubeUrl(src)) return;

    const videoEl = videoRef.current;
    if (!videoEl || !inView) return;

    // Pause any currently playing video
    if (currentPlayingVideo && currentPlayingVideo !== videoEl) {
      currentPlayingVideo.pause();
    }

    // Play this one
    if (videoEl.paused) {
      videoEl.play().catch(() => {});
    }

    currentPlayingVideo = videoEl;
    setIsPlaying(true);

    return () => {
      if (videoEl) {
        videoEl.pause();
        setIsPlaying(false);
      }
    };
  }, [inView, src]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {placeholder && !loaded && (
        <div className="absolute inset-0 w-full h-full bg-gray-200 dark:bg-gray-800 overflow-hidden z-0">
          {thumbnail ? (
            <img src={thumbnail} alt="Video thumbnail" className="w-full h-full object-cover" />
          ) : (
            <div className="animate-pulse w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700" />
          )}

          <div className="absolute inset-0 bg-black/40 dark:bg-black/50 z-10" />

          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-white/30 border-t-purple-600 dark:border-white/20 dark:border-t-white/70 animate-spin" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-white/80 dark:text-white/50 drop-shadow-lg"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {inView && !error && (
        isYouTubeUrl(src) ? (
          <iframe
            src={getYouTubeEmbedUrl(src)}
            className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="YouTube video"
            onLoad={handleLoad}
            onError={handleError}
            loading="lazy"
          />
        ) : (
          <CustomVideoPlayer
            ref={(el) => {
              videoRef.current = el?.querySelector('video') || null;
            }}
            src={src}
            className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            onLoadedData={handleLoad}
            onError={handleError}
            autoPlay={inView}
            muted={true}
          />
        )
      )}

      {error && (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 transition-opacity duration-300">
          Failed to load video
        </div>
      )}
    </div>
  );
};

export default LazyVideo;
