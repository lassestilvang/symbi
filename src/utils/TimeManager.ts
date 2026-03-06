/**
 * TimeManager Utility for Interactive Symbi Habitat
 *
 * Manages time-based scene transitions and color configurations.
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

import type { TimePhase, TimePhaseColors, TimePhaseConfig } from '../types';
import { HALLOWEEN_COLORS } from '../constants/theme';

// ============================================================================
// Time Phase Boundaries
// ============================================================================

/**
 * Time phase boundary definitions
 * Dawn: 5-8am (hours 5-7)
 * Day: 8am-5pm (hours 8-16)
 * Dusk: 5-8pm (hours 17-19)
 * Night: 8pm-5am (hours 20-23, 0-4)
 */
const TIME_PHASE_BOUNDARIES = {
  dawn: { start: 5, end: 8 },
  day: { start: 8, end: 17 },
  dusk: { start: 17, end: 20 },
  night: { start: 20, end: 5 },
} as const;

// ============================================================================
// Time Phase Color Configurations
// ============================================================================

/**
 * Dawn colors: warm orange and pink gradient with morning mist
 * Requirements: 3.2
 */
const DAWN_COLORS: TimePhaseColors = {
  skyGradient: ['#FF9A8B', '#FF6B6B', '#4A1942', HALLOWEEN_COLORS.darkBg],
  ambientLight: '#FFB088',
  accentColor: '#FF7B54',
  particleColor: '#FFE4C4',
};

/**
 * Day colors: bright purple-tinted daylight
 * Requirements: 3.3
 */
const DAY_COLORS: TimePhaseColors = {
  skyGradient: ['#9333EA', '#7C3AED', '#5B21B6', HALLOWEEN_COLORS.darkBg],
  ambientLight: HALLOWEEN_COLORS.primaryLight,
  accentColor: HALLOWEEN_COLORS.primary,
  particleColor: '#E9D5FF',
};

/**
 * Dusk colors: deep purple and orange sunset with fireflies
 * Requirements: 3.4
 */
const DUSK_COLORS: TimePhaseColors = {
  skyGradient: ['#F97316', '#9333EA', '#5B21B6', HALLOWEEN_COLORS.darkBg],
  ambientLight: '#C084FC',
  accentColor: HALLOWEEN_COLORS.orange,
  particleColor: '#FCD34D',
};

/**
 * Night colors: dark blue atmosphere with glowing elements
 * Requirements: 3.5
 */
const NIGHT_COLORS: TimePhaseColors = {
  skyGradient: ['#1E1B4B', '#312E81', '#1a1a2e', HALLOWEEN_COLORS.darkBg],
  ambientLight: '#6366F1',
  accentColor: '#818CF8',
  particleColor: '#C7D2FE',
};

/**
 * Complete time phase configurations
 */
export const TIME_PHASE_CONFIGS: Record<TimePhase, TimePhaseConfig> = {
  dawn: {
    phase: 'dawn',
    startHour: TIME_PHASE_BOUNDARIES.dawn.start,
    endHour: TIME_PHASE_BOUNDARIES.dawn.end,
    colors: DAWN_COLORS,
  },
  day: {
    phase: 'day',
    startHour: TIME_PHASE_BOUNDARIES.day.start,
    endHour: TIME_PHASE_BOUNDARIES.day.end,
    colors: DAY_COLORS,
  },
  dusk: {
    phase: 'dusk',
    startHour: TIME_PHASE_BOUNDARIES.dusk.start,
    endHour: TIME_PHASE_BOUNDARIES.dusk.end,
    colors: DUSK_COLORS,
  },
  night: {
    phase: 'night',
    startHour: TIME_PHASE_BOUNDARIES.night.start,
    endHour: TIME_PHASE_BOUNDARIES.night.end,
    colors: NIGHT_COLORS,
  },
};

// ============================================================================
// Time Phase Functions
// ============================================================================

/**
 * Determines the current time phase based on hour of day
 *
 * @param hour - Hour of day (0-23)
 * @returns The corresponding TimePhase
 *
 * Time phase boundaries:
 * - Dawn: 5-7 (hours 5, 6, 7)
 * - Day: 8-16 (hours 8 through 16)
 * - Dusk: 17-19 (hours 17, 18, 19)
 * - Night: 20-4 (hours 20-23 and 0-4)
 *
 * Requirements: 3.1
 */
export function getTimePhase(hour: number): TimePhase {
  // Normalize hour to 0-23 range
  const normalizedHour = ((hour % 24) + 24) % 24;

  if (normalizedHour >= 5 && normalizedHour < 8) {
    return 'dawn';
  }

  if (normalizedHour >= 8 && normalizedHour < 17) {
    return 'day';
  }

  if (normalizedHour >= 17 && normalizedHour < 20) {
    return 'dusk';
  }

  // Night: 20-23 and 0-4
  return 'night';
}

/**
 * Gets the current time phase based on system time
 *
 * @returns The current TimePhase
 */
export function getCurrentTimePhase(): TimePhase {
  const currentHour = new Date().getHours();
  return getTimePhase(currentHour);
}

/**
 * Gets the color configuration for a given time phase
 *
 * @param phase - The time phase
 * @returns TimePhaseColors configuration
 *
 * Requirements: 3.2, 3.3, 3.4, 3.5
 */
export function getTimePhaseColors(phase: TimePhase): TimePhaseColors {
  return TIME_PHASE_CONFIGS[phase].colors;
}

/**
 * Gets the complete configuration for a given time phase
 *
 * @param phase - The time phase
 * @returns TimePhaseConfig with boundaries and colors
 */
export function getTimePhaseConfig(phase: TimePhase): TimePhaseConfig {
  return TIME_PHASE_CONFIGS[phase];
}

/**
 * Calculates the progress through the current time phase (0-1)
 *
 * @param hour - Current hour (0-23)
 * @param minute - Current minute (0-59)
 * @returns Progress through the phase (0-1)
 */
export function getTimePhaseProgress(hour: number, minute: number = 0): number {
  const phase = getTimePhase(hour);
  const config = TIME_PHASE_CONFIGS[phase];

  const currentTime = hour + minute / 60;
  let startTime = config.startHour;
  let endTime = config.endHour;

  // Handle night phase wrapping around midnight
  if (phase === 'night') {
    if (hour >= 20) {
      // Evening portion: 20-24
      startTime = 20;
      endTime = 24;
    } else {
      // Morning portion: 0-5
      startTime = 0;
      endTime = 5;
    }
  }

  const duration = endTime - startTime;
  const elapsed = currentTime - startTime;

  return Math.max(0, Math.min(1, elapsed / duration));
}

/**
 * Gets the next time phase after the given phase
 *
 * @param phase - Current time phase
 * @returns The next TimePhase in sequence
 */
export function getNextTimePhase(phase: TimePhase): TimePhase {
  const sequence: TimePhase[] = ['dawn', 'day', 'dusk', 'night'];
  const currentIndex = sequence.indexOf(phase);
  return sequence[(currentIndex + 1) % sequence.length];
}

/**
 * Calculates time until next phase transition in milliseconds
 *
 * @param currentHour - Current hour (0-23)
 * @param currentMinute - Current minute (0-59)
 * @returns Milliseconds until next phase transition
 */
export function getTimeUntilNextPhase(currentHour: number, currentMinute: number = 0): number {
  const phase = getTimePhase(currentHour);
  const config = TIME_PHASE_CONFIGS[phase];

  let targetHour = config.endHour;

  // Handle night phase ending at 5am
  if (phase === 'night' && currentHour >= 20) {
    // Calculate time until midnight, then add time until 5am
    const hoursUntilMidnight = 24 - currentHour;
    const minutesUntilMidnight = 60 - currentMinute;
    return (hoursUntilMidnight * 60 + minutesUntilMidnight + 5 * 60) * 60 * 1000;
  }

  const hoursUntil = targetHour - currentHour;
  const minutesUntil = 60 - currentMinute;

  return (hoursUntil * 60 + minutesUntil) * 60 * 1000;
}

// ============================================================================
// Default Export
// ============================================================================

export const TimeManager = {
  getTimePhase,
  getCurrentTimePhase,
  getTimePhaseColors,
  getTimePhaseConfig,
  getTimePhaseProgress,
  getNextTimePhase,
  getTimeUntilNextPhase,
  TIME_PHASE_CONFIGS,
};

export default TimeManager;
