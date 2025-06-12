import React, { useState, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: boolean;
}

const LazyImage = ({ src, alt, className, placeholder = true }: LazyImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setLoaded(true);
  };

  return (
    <div ref={ref} className={className}>
      {placeholder && !loaded && (
        <Skeleton className="w-full h-full absolute inset-0" />
      )}
      
      {inView && (
        <img
          src={src}
          alt={alt}
          className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
        />
      )}
      
      {error && (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400">
          Failed to load image
        </div>
      )}
    </div>
  );
};

export default LazyImage;