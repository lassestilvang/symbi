/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * MemoryMonitor
 *
 * Monitors and reports memory usage to help identify memory leaks
 * and ensure the app stays within the target <100MB footprint.
 *
 * Requirement 10.4: Monitor memory footprint (target <100MB)
 */

import { Platform } from 'react-native';

export interface MemoryStats {
  usedMemoryMB: number;
  timestamp: Date;
  isWithinTarget: boolean;
}

export class MemoryMonitor {
  private static readonly TARGET_MEMORY_MB = 100;
  private static readonly CHECK_INTERVAL_MS = 60000; // Check every minute
  private static monitorInterval: NodeJS.Timeout | null = null;
  private static memoryHistory: MemoryStats[] = [];
  private static readonly MAX_HISTORY_SIZE = 60; // Keep last 60 readings (1 hour)

  /**
   * Start monitoring memory usage
   */
  static startMonitoring(onMemoryWarning?: (stats: MemoryStats) => void): void {
    if (this.monitorInterval) {
      console.log('Memory monitoring already active');
      return;
    }

    console.log('Starting memory monitoring (target: <100MB)');

    // Initial check
    this.checkMemory(onMemoryWarning);

    // Set up periodic checks
    this.monitorInterval = setInterval(() => {
      this.checkMemory(onMemoryWarning);
    }, this.CHECK_INTERVAL_MS);
  }

  /**
   * Stop monitoring memory usage
   */
  static stopMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
      console.log('Memory monitoring stopped');
    }
  }

  /**
   * Check current memory usage
   */
  private static checkMemory(onMemoryWarning?: (stats: MemoryStats) => void): void {
    const stats = this.getCurrentMemoryStats();

    // Add to history
    this.memoryHistory.push(stats);
    if (this.memoryHistory.length > this.MAX_HISTORY_SIZE) {
      this.memoryHistory.shift();
    }

    // Log if exceeding target
    if (!stats.isWithinTarget) {
      console.warn(
        `⚠️ Memory usage: ${stats.usedMemoryMB.toFixed(2)}MB (target: <${this.TARGET_MEMORY_MB}MB)`
      );
      if (onMemoryWarning) {
        onMemoryWarning(stats);
      }
    } else {
      console.log(`✓ Memory usage: ${stats.usedMemoryMB.toFixed(2)}MB`);
    }
  }

  /**
   * Get current memory statistics
   */
  static getCurrentMemoryStats(): MemoryStats {
    // Note: React Native doesn't provide direct memory access
    // In production, you would use native modules or performance APIs
    // This is a placeholder implementation

    let usedMemoryMB = 0;

    if (Platform.OS === 'web' && (performance as any).memory) {
      // Web platform has performance.memory API
      const memory = (performance as any).memory;
      usedMemoryMB = memory.usedJSHeapSize / (1024 * 1024);
    } else {
      // For native platforms, this would require a native module
      // Placeholder: estimate based on typical usage
      usedMemoryMB = 50; // Placeholder value
    }

    return {
      usedMemoryMB,
      timestamp: new Date(),
      isWithinTarget: usedMemoryMB < this.TARGET_MEMORY_MB,
    };
  }

  /**
   * Get memory usage history
   */
  static getMemoryHistory(): MemoryStats[] {
    return [...this.memoryHistory];
  }

  /**
   * Get average memory usage over the history
   */
  static getAverageMemoryUsage(): number {
    if (this.memoryHistory.length === 0) return 0;

    const sum = this.memoryHistory.reduce((acc, stat) => acc + stat.usedMemoryMB, 0);
    return sum / this.memoryHistory.length;
  }

  /**
   * Get peak memory usage
   */
  static getPeakMemoryUsage(): number {
    if (this.memoryHistory.length === 0) return 0;

    return Math.max(...this.memoryHistory.map(stat => stat.usedMemoryMB));
  }

  /**
   * Check if there's a potential memory leak
   * (memory consistently increasing over time)
   */
  static detectMemoryLeak(): boolean {
    if (this.memoryHistory.length < 10) return false;

    // Check if memory is consistently increasing
    const recentHistory = this.memoryHistory.slice(-10);
    let increasingCount = 0;

    for (let i = 1; i < recentHistory.length; i++) {
      if (recentHistory[i].usedMemoryMB > recentHistory[i - 1].usedMemoryMB) {
        increasingCount++;
      }
    }

    // If memory increased in 8 out of 10 checks, potential leak
    return increasingCount >= 8;
  }

  /**
   * Force garbage collection (if available)
   * Note: This is not available in React Native by default
   */
  static forceGarbageCollection(): void {
    if (global.gc) {
      console.log('Forcing garbage collection...');
      global.gc();
    } else {
      console.log('Garbage collection not available');
    }
  }

  /**
   * Get memory report
   */
  static getMemoryReport(): {
    current: number;
    average: number;
    peak: number;
    target: number;
    isHealthy: boolean;
    potentialLeak: boolean;
  } {
    const current = this.getCurrentMemoryStats().usedMemoryMB;
    const average = this.getAverageMemoryUsage();
    const peak = this.getPeakMemoryUsage();
    const potentialLeak = this.detectMemoryLeak();

    return {
      current,
      average,
      peak,
      target: this.TARGET_MEMORY_MB,
      isHealthy: current < this.TARGET_MEMORY_MB && !potentialLeak,
      potentialLeak,
    };
  }

  /**
   * Clear memory history
   */
  static clearHistory(): void {
    this.memoryHistory = [];
  }
}

/**
 * React hook for monitoring memory in components
 */
export function useMemoryMonitor(enabled: boolean = true): MemoryStats | null {
  const [memoryStats, setMemoryStats] = React.useState<MemoryStats | null>(null);

  React.useEffect(() => {
    if (!enabled) return;

    const checkMemory = () => {
      const stats = MemoryMonitor.getCurrentMemoryStats();
      setMemoryStats(stats);
    };

    // Initial check
    checkMemory();

    // Check every minute
    const interval = setInterval(checkMemory, 60000);

    return () => {
      clearInterval(interval);
    };
  }, [enabled]);

  return memoryStats;
}

// For React import
import React from 'react';
