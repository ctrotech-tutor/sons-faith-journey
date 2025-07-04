import { useEffect, useRef, useCallback } from 'react';
import throttle from 'lodash.throttle';
import debounce from 'lodash.debounce';

interface PerformanceOptimizerProps {
  onViewportChange?: (isVisible: boolean) => void;
  onScrollEnd?: () => void;
  throttleMs?: number;
  debounceMs?: number;
}

export const useCommunityPerformanceOptimizer = ({
  onViewportChange,
  onScrollEnd,
  throttleMs = 100,
  debounceMs = 300
}: PerformanceOptimizerProps = {}) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Throttled scroll handler
  const handleScroll = useCallback(
    throttle(() => {
      // Clear previous timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set new timeout for scroll end detection
      scrollTimeoutRef.current = setTimeout(() => {
        onScrollEnd?.();
      }, debounceMs);
    }, throttleMs),
    [onScrollEnd, throttleMs, debounceMs]
  );

  // Intersection observer for viewport visibility
  const setupViewportObserver = useCallback((element: HTMLElement) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      debounce((entries) => {
        entries.forEach((entry) => {
          onViewportChange?.(entry.isIntersecting);
        });
      }, debounceMs),
      {
        threshold: [0, 0.1, 0.5, 1],
        rootMargin: '50px'
      }
    );

    observerRef.current.observe(element);
  }, [onViewportChange, debounceMs]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    handleScroll,
    setupViewportObserver
  };
};

// Memory optimization utilities
export class CommunityMemoryManager {
  private static imageCache = new Map<string, HTMLImageElement>();
  private static maxCacheSize = 50;

  static preloadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      if (this.imageCache.has(src)) {
        resolve(this.imageCache.get(src)!);
        return;
      }

      const img = new Image();
      img.onload = () => {
        // Manage cache size
        if (this.imageCache.size >= this.maxCacheSize) {
          const firstKey = this.imageCache.keys().next().value;
          this.imageCache.delete(firstKey);
        }
        
        this.imageCache.set(src, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  static getCachedImage(src: string): HTMLImageElement | undefined {
    return this.imageCache.get(src);
  }

  static clearCache(): void {
    this.imageCache.clear();
  }

  static getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.imageCache.size,
      maxSize: this.maxCacheSize
    };
  }
}

// Performance monitoring
export class CommunityPerformanceMonitor {
  private static metrics = new Map<string, number[]>();

  static recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  static getAverageMetric(name: string): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;
    
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  static getMetricStats(name: string): { 
    average: number; 
    min: number; 
    max: number; 
    count: number 
  } {
    const values = this.metrics.get(name) || [];
    
    return {
      average: this.getAverageMetric(name),
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length
    };
  }

  static clearMetrics(): void {
    this.metrics.clear();
  }
}

export default {
  useCommunityPerformanceOptimizer,
  CommunityMemoryManager,
  CommunityPerformanceMonitor
};
