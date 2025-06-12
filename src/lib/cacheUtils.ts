interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiryTime: number;
}

class IndexedDBCache {
  private dbName = 'sonhub-cache';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('posts')) {
          db.createObjectStore('posts', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('media')) {
          db.createObjectStore('media', { keyPath: 'url' });
        }
        if (!db.objectStoreNames.contains('user-data')) {
          db.createObjectStore('user-data', { keyPath: 'key' });
        }
      };
    });
  }

  async set<T>(storeName: string, key: string, data: T, ttlMs: number = 3600000): Promise<void> {
    if (!this.db) await this.init();
    
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiryTime: Date.now() + ttlMs
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put({ id: key, ...cacheItem });
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async get<T>(storeName: string, key: string): Promise<T | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }

        // Check if cache item has expired
        if (Date.now() > result.expiryTime) {
          this.delete(storeName, key);
          resolve(null);
          return;
        }

        resolve(result.data);
      };
    });
  }

  async delete(storeName: string, key: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(storeName: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const cache = new IndexedDBCache();

// Utility functions for common cache operations
export const cachePost = async (post: any) => {
  await cache.set('posts', post.id, post, 1800000); // 30 minutes
};

export const getCachedPost = async (postId: string) => {
  return await cache.get('posts', postId);
};

export const cacheMedia = async (url: string, blob: Blob) => {
  await cache.set('media', url, blob, 3600000); // 1 hour
};

export const getCachedMedia = async (url: string) => {
  return await cache.get('media', url);
};
