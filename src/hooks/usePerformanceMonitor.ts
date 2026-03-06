/**
 * Performance Monitor Hook for Interactive Symbi Habitat
 *
 * Monitors FPS using requestAnimationFrame, detects low performance,
 * and handles browser visibility changes to pause animations.
 *
 * Requirements: 6.2, 6.5
 */

import { useState, useEffect, useRef, useCallback } from 'react';

import type { QualityLevel, PerformanceMetrics } from '../types/habitat';

/**
 * Configuration options for the performance monitor
 */
export interface UsePerformanceMonitorOptions {
  /** Initial quality level */
  initialQuality?: QualityLevel;
  /** FPS threshold below which quality should be reduced (default: 30) */
  lowFpsThreshold?: number;
  /** Number of consecutive low FPS readings before reducing quality (default: 5) */
  lowFpsConsecutiveCount?: number;
  /** Whether monitoring is enabled (default: true) */
  enabled?: boolean;
}

/**
 * Return type for the usePerformanceMonitor hook
 */
export interface UsePerformanceMonitorResult {
  /** Current performance metrics */
  metrics: PerformanceMetrics;
  /** Current quality level (may be auto-adjusted) */
  quality: QualityLevel;
  /** Whether the browser tab is visible */
  isVisible: boolean;
  /** Whether animations should be paused */
  shouldPauseAnimations: boolean;
  /** Manually set quality level */
  setQuality: (quality: QualityLevel) => void;
  /** Reset quality to initial level */
  resetQuality: () => void;
}

/**
 * Default FPS threshold for low performance detection
 */
const DEFAULT_LOW_FPS_THRESHOLD = 30;

/**
 * Default consecutive low FPS count before quality reduction
 */
const DEFAULT_LOW_FPS_CONSECUTIVE_COUNT = 5;

/**
 * Quality level progression for automatic reduction
 */
const QUALITY_LEVELS: QualityLevel[] = ['high', 'medium', 'low'];

/**
 * Hook that monitors performance and adjusts quality settings accordingly.
 *
 * Features:
 * - Monitors FPS using requestAnimationFrame
 * - Automatically reduces quality when FPS drops below threshold
 * - Pauses animations when browser tab is not visible
 * - Provides manual quality control
 *
 * @param options - Configuration options
 * @returns Performance metrics, quality level, and control functions
 *
 * @example
 * ```typescript
 * const { metrics, quality, shouldPauseAnimations } = usePerformanceMonitor({
 *   initialQuality: 'high',
 *   lowFpsThreshold: 30,
 * });
 *
 * if (shouldPauseAnimations) {
 *   // Skip animation frame
 * }
 * ```
 */
export function usePerformanceMonitor(
  options: UsePerformanceMonitorOptions = {}
): UsePerformanceMonitorResult {
  const {
    initialQuality = 'medium',
    lowFpsThreshold = DEFAULT_LOW_FPS_THRESHOLD,
    lowFpsConsecutiveCount = DEFAULT_LOW_FPS_CONSECUTIVE_COUNT,
    enabled = true,
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    particleCount: 0,
  });

  const [quality, setQualityState] = useState<QualityLevel>(initialQuality);
  const [isVisible, setIsVisible] = useState(true);

  // Refs for animation frame tracking
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const lowFpsCountRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  /**
   * Reduces quality to the next lower level if possible
   */
  const reduceQuality = useCallback(() => {
    setQualityState(currentQuality => {
      const currentIndex = QUALITY_LEVELS.indexOf(currentQuality);
      const nextIndex = Math.min(currentIndex + 1, QUALITY_LEVELS.length - 1);
      return QUALITY_LEVELS[nextIndex];
    });
  }, []);

  /**
   * Manually set quality level
   */
  const setQuality = useCallback((newQuality: QualityLevel) => {
    setQualityState(newQuality);
    lowFpsCountRef.current = 0;
  }, []);

  /**
   * Reset quality to initial level
   */
  const resetQuality = useCallback(() => {
    setQualityState(initialQuality);
    lowFpsCountRef.current = 0;
  }, [initialQuality]);

  /**
   * FPS monitoring loop using requestAnimationFrame
   */
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    const measureFps = (currentTime: number) => {
      frameCountRef.current++;

      const elapsed = currentTime - lastTimeRef.current;

      // Calculate FPS every second
      if (elapsed >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / elapsed);
        const frameTime = elapsed / frameCountRef.current;

        setMetrics(prev => ({
          ...prev,
          fps,
          frameTime,
        }));

        // Check for low FPS
        if (fps < lowFpsThreshold) {
          lowFpsCountRef.current++;

          // Reduce quality after consecutive low FPS readings
          if (lowFpsCountRef.current >= lowFpsConsecutiveCount) {
            reduceQuality();
            lowFpsCountRef.current = 0;
          }
        } else {
          // Reset counter if FPS is acceptable
          lowFpsCountRef.current = 0;
        }

        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      animationFrameRef.current = requestAnimationFrame(measureFps);
    };

    animationFrameRef.current = requestAnimationFrame(measureFps);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, lowFpsThreshold, lowFpsConsecutiveCount, reduceQuality]);

  /**
   * Visibility change handler to pause animations when tab is hidden
   */
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const handleVisibilityChange = () => {
      const visible = document.visibilityState === 'visible';
      setIsVisible(visible);

      // Reset FPS tracking when becoming visible again
      if (visible) {
        frameCountRef.current = 0;
        lastTimeRef.current = performance.now();
        lowFpsCountRef.current = 0;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Set initial visibility state
    setIsVisible(document.visibilityState === 'visible');

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const shouldPauseAnimations = !isVisible || !enabled;

  return {
    metrics,
    quality,
    isVisible,
    shouldPauseAnimations,
    setQuality,
    resetQuality,
  };
}

/**
 * Updates the particle count in performance metrics.
 * This is a utility function to be called from particle systems.
 *
 * @param setMetrics - State setter for metrics
 * @param count - Current particle count
 */
export function updateParticleCount(
  setMetrics: React.Dispatch<React.SetStateAction<PerformanceMetrics>>,
  count: number
): void {
  setMetrics(prev => ({
    ...prev,
    particleCount: count,
  }));
}
