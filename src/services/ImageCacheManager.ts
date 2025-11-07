/**
 * ImageCacheManager
 * 
 * Manages caching of evolved Symbi appearance images to optimize memory usage.
 * Implements LRU (Least Recently Used) cache eviction strategy.
 * 
 * Requirement 10.4: Optimize image caching for evolved appearances
 */

export interface CachedImage {
  uri: string;
  data: string; // Base64 or data URL
  size: number; // Size in bytes
  lastAccessed: Date;
  evolutionLevel: number;
}

export class ImageCacheManager {
  private static readonly MAX_CACHE_SIZE_MB = 20; // 20MB max for images
  private static readonly MAX_CACHE_SIZE_BYTES = ImageCacheManager.MAX_CACHE_SIZE_MB * 1024 * 1024;
  private static cache: Map<string, CachedImage> = new Map();
  private static currentCacheSize = 0;

  /**
   * Add an image to the cache
   */
  static async cacheImage(
    key: string,
    data: string,
    evolutionLevel: number
  ): Promise<void> {
    // Estimate size (base64 is ~1.33x the actual size)
    const size = Math.ceil((data.length * 3) / 4);

    // Check if we need to evict items
    while (this.currentCacheSize + size > ImageCacheManager.MAX_CACHE_SIZE_BYTES) {
      this.evictLRU();
    }

    // Add to cache
    const cachedImage: CachedImage = {
      uri: key,
      data,
      size,
      lastAccessed: new Date(),
      evolutionLevel,
    };

    this.cache.set(key, cachedImage);
    this.currentCacheSize += size;

    console.log(
      `Image cached: ${key} (${(size / 1024).toFixed(2)}KB) - ` +
      `Total cache: ${(this.currentCacheSize / 1024 / 1024).toFixed(2)}MB`
    );
  }

  /**
   * Get an image from the cache
   */
  static getCachedImage(key: string): string | null {
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // Update last accessed time
    cached.lastAccessed = new Date();

    return cached.data;
  }

  /**
   * Check if an image is cached
   */
  static isCached(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Remove an image from the cache
   */
  static removeFromCache(key: string): void {
    const cached = this.cache.get(key);

    if (cached) {
      this.cache.delete(key);
      this.currentCacheSize -= cached.size;
      console.log(`Image removed from cache: ${key}`);
    }
  }

  /**
   * Evict the least recently used image
   */
  private static evictLRU(): void {
    if (this.cache.size === 0) return;

    let oldestKey: string | null = null;
    let oldestTime = new Date();

    // Find the least recently used item
    this.cache.forEach((value, key) => {
      if (value.lastAccessed < oldestTime) {
        oldestTime = value.lastAccessed;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      console.log(`Evicting LRU image: ${oldestKey}`);
      this.removeFromCache(oldestKey);
    }
  }

  /**
   * Clear all cached images
   */
  static clearCache(): void {
    this.cache.clear();
    this.currentCacheSize = 0;
    console.log('Image cache cleared');
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    itemCount: number;
    totalSizeMB: number;
    maxSizeMB: number;
    utilizationPercent: number;
  } {
    return {
      itemCount: this.cache.size,
      totalSizeMB: this.currentCacheSize / 1024 / 1024,
      maxSizeMB: ImageCacheManager.MAX_CACHE_SIZE_MB,
      utilizationPercent: (this.currentCacheSize / ImageCacheManager.MAX_CACHE_SIZE_BYTES) * 100,
    };
  }

  /**
   * Preload images for specific evolution levels
   */
  static async preloadEvolutionImages(evolutionLevels: number[]): Promise<void> {
    console.log(`Preloading images for evolution levels: ${evolutionLevels.join(', ')}`);
    
    // This would load images from storage
    // Implementation depends on how evolution images are stored
    // Placeholder for now
  }

  /**
   * Get all cached evolution levels
   */
  static getCachedEvolutionLevels(): number[] {
    const levels = new Set<number>();
    
    this.cache.forEach((value) => {
      levels.add(value.evolutionLevel);
    });

    return Array.from(levels).sort((a, b) => a - b);
  }

  /**
   * Remove images for a specific evolution level
   */
  static removeEvolutionLevel(level: number): void {
    const keysToRemove: string[] = [];

    this.cache.forEach((value, key) => {
      if (value.evolutionLevel === level) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach(key => this.removeFromCache(key));
    console.log(`Removed ${keysToRemove.length} images for evolution level ${level}`);
  }

  /**
   * Optimize cache by removing old or unused images
   */
  static optimizeCache(maxAgeHours: number = 24): void {
    const now = new Date();
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
    const keysToRemove: string[] = [];

    this.cache.forEach((value, key) => {
      const age = now.getTime() - value.lastAccessed.getTime();
      if (age > maxAgeMs) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach(key => this.removeFromCache(key));
    
    if (keysToRemove.length > 0) {
      console.log(`Optimized cache: removed ${keysToRemove.length} old images`);
    }
  }
}
