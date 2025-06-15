
interface VideoCache {
  [url: string]: {
    loaded: boolean;
    element?: HTMLVideoElement;
    timestamp: number;
  };
}

class VideoManager {
  private cache: VideoCache = {};
  private maxCacheSize = 50; // Limit cache size for memory management
  
  isVideoLoaded(url: string): boolean {
    return this.cache[url]?.loaded || false;
  }
  
  markVideoAsLoaded(url: string, element?: HTMLVideoElement) {
    // Clean cache if it's getting too large
    if (Object.keys(this.cache).length >= this.maxCacheSize) {
      this.cleanOldCache();
    }
    
    this.cache[url] = {
      loaded: true,
      element,
      timestamp: Date.now()
    };
  }
  
  getVideoElement(url: string): HTMLVideoElement | undefined {
    return this.cache[url]?.element;
  }
  
  private cleanOldCache() {
    // Remove oldest 20% of cache entries
    const entries = Object.entries(this.cache);
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = Math.floor(entries.length * 0.2);
    
    for (let i = 0; i < toRemove; i++) {
      delete this.cache[entries[i][0]];
    }
  }
  
  clearCache() {
    this.cache = {};
  }
}

export const videoManager = new VideoManager();
