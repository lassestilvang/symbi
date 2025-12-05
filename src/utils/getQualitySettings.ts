/**
 * Quality Settings Utility for Interactive Symbi Habitat
 *
 * Provides quality level constraints for performance optimization.
 * Requirements: 6.1, 6.3, 6.4
 *
 * Property 6: Quality Settings Constraints
 * - 'low' quality: particleMultiplier = 0.5, parallaxLayers <= 2, enableBlur = false
 * - 'medium' quality: particleMultiplier = 0.75, parallaxLayers = 3, enableBlur = true
 * - 'high' quality: particleMultiplier = 1.0, parallaxLayers >= 3, enableBlur = true
 * - When reducedMotion is true: particleMultiplier = 0, regardless of quality level
 */

import type { QualityLevel, QualitySettings } from '../types/habitat';

/**
 * Quality settings configuration for each quality level
 */
const QUALITY_PRESETS: Record<QualityLevel, QualitySettings> = {
  low: {
    particleMultiplier: 0.5,
    parallaxLayers: 2,
    ambientElementCount: 3,
    enableBlur: false,
    enableShadows: false,
  },
  medium: {
    particleMultiplier: 0.75,
    parallaxLayers: 3,
    ambientElementCount: 5,
    enableBlur: true,
    enableShadows: true,
  },
  high: {
    particleMultiplier: 1.0,
    parallaxLayers: 3,
    ambientElementCount: 8,
    enableBlur: true,
    enableShadows: true,
  },
};

/**
 * Options for getQualitySettings function
 */
export interface GetQualitySettingsOptions {
  quality: QualityLevel;
  reducedMotion?: boolean;
}

/**
 * Returns quality settings based on quality level and reduced motion preference.
 *
 * When reducedMotion is true, particleMultiplier is set to 0 regardless of quality level.
 *
 * @param options - Quality level and reduced motion preference
 * @returns QualitySettings object with appropriate constraints
 *
 * @example
 * ```typescript
 * const settings = getQualitySettings({ quality: 'high', reducedMotion: false });
 * // { particleMultiplier: 1.0, parallaxLayers: 3, ... }
 *
 * const reducedSettings = getQualitySettings({ quality: 'high', reducedMotion: true });
 * // { particleMultiplier: 0, parallaxLayers: 3, ... }
 * ```
 */
export function getQualitySettings(options: GetQualitySettingsOptions): QualitySettings {
  const { quality, reducedMotion = false } = options;

  const baseSettings = QUALITY_PRESETS[quality];

  if (reducedMotion) {
    return {
      ...baseSettings,
      particleMultiplier: 0,
    };
  }

  return { ...baseSettings };
}

/**
 * Detects if the user prefers reduced motion based on system preferences.
 * This is useful for accessibility compliance.
 *
 * @returns true if the user prefers reduced motion
 */
export function detectReducedMotion(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  return mediaQuery?.matches ?? false;
}

/**
 * Determines the appropriate quality level based on device capabilities.
 * This is a simple heuristic based on available information.
 *
 * @returns Recommended quality level for the device
 */
export function detectQualityLevel(): QualityLevel {
  if (typeof window === 'undefined') {
    return 'medium';
  }

  // Check for low-end device indicators
  const hardwareConcurrency = navigator.hardwareConcurrency ?? 4;
  const deviceMemory = (navigator as { deviceMemory?: number }).deviceMemory ?? 4;

  // Low-end device: fewer cores or less memory
  if (hardwareConcurrency <= 2 || deviceMemory <= 2) {
    return 'low';
  }

  // High-end device: many cores and plenty of memory
  if (hardwareConcurrency >= 8 && deviceMemory >= 8) {
    return 'high';
  }

  return 'medium';
}
