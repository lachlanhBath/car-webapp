const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CacheItem<T> {
  value: T;
  timestamp: number;
}

export const cacheManager = {
  setItem: <T>(key: string, value: T): void => {
    const item: CacheItem<T> = {
      value,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(item));
  },
  
  getItem: <T>(key: string): T | null => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    
    const item: CacheItem<T> = JSON.parse(itemStr);
    const now = Date.now();
    
    // Return null if expired
    if (now - item.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(key);
      return null;
    }
    
    return item.value;
  },
  
  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },
  
  clear: (): void => {
    localStorage.clear();
  }
}; 