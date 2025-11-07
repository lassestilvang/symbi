/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * RequestDeduplicator
 *
 * Prevents duplicate API requests from being sent simultaneously.
 * If multiple components request the same data, only one request is made
 * and all callers receive the same response.
 *
 * Requirement 6.3: Implement request deduplication for Gemini API
 */

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

export class RequestDeduplicator {
  private static pendingRequests: Map<string, PendingRequest<any>> = new Map();
  private static readonly REQUEST_TIMEOUT_MS = 30000; // 30 seconds

  /**
   * Execute a request with deduplication
   * If the same request is already in progress, return the existing promise
   */
  static async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Check if request is already pending
    const pending = this.pendingRequests.get(key);

    if (pending) {
      const age = Date.now() - pending.timestamp;

      // If request is still fresh, return existing promise
      if (age < this.REQUEST_TIMEOUT_MS) {
        console.log(`Deduplicating request: ${key}`);
        return pending.promise;
      } else {
        // Request timed out, remove it
        console.log(`Request timeout, removing: ${key}`);
        this.pendingRequests.delete(key);
      }
    }

    // Create new request
    console.log(`Creating new request: ${key}`);
    const promise = requestFn()
      .then(result => {
        // Remove from pending after completion
        this.pendingRequests.delete(key);
        return result;
      })
      .catch(error => {
        // Remove from pending after error
        this.pendingRequests.delete(key);
        throw error;
      });

    // Store pending request
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now(),
    });

    return promise;
  }

  /**
   * Generate a cache key from request parameters
   */
  static generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${JSON.stringify(params[key])}`)
      .join('&');

    return `${prefix}:${sortedParams}`;
  }

  /**
   * Clear all pending requests
   */
  static clear(): void {
    this.pendingRequests.clear();
  }

  /**
   * Get number of pending requests
   */
  static getPendingCount(): number {
    return this.pendingRequests.size;
  }

  /**
   * Clean up old pending requests
   */
  static cleanup(): void {
    const now = Date.now();
    const keysToRemove: string[] = [];

    this.pendingRequests.forEach((request, key) => {
      const age = now - request.timestamp;
      if (age > this.REQUEST_TIMEOUT_MS) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach(key => {
      console.log(`Cleaning up stale request: ${key}`);
      this.pendingRequests.delete(key);
    });

    if (keysToRemove.length > 0) {
      console.log(`Cleaned up ${keysToRemove.length} stale requests`);
    }
  }
}
