/**
 * Scene Modifiers Utility
 *
 * Calculates scene modifiers based on emotional state.
 * Requirements: 2.2, 2.3, 2.4, 2.5
 */

import type { SceneModifiers } from '../types/habitat';
import { EmotionalState } from '../types/index';

/**
 * Default scene modifiers for neutral state
 */
const DEFAULT_MODIFIERS: SceneModifiers = {
  colorShift: 0,
  brightness: 1.0,
  particleSpeed: 1.0,
  ambientIntensity: 1.0,
};

/**
 * Scene modifier configurations for each emotional state
 *
 * SAD: darker, slower (Requirements: 2.2)
 * ACTIVE/VIBRANT: brighter, faster (Requirements: 2.3)
 * CALM/RESTED: soft, gentle (Requirements: 2.4)
 * STRESSED/ANXIOUS: turbulent effects (Requirements: 2.5)
 */
const EMOTIONAL_STATE_MODIFIERS: Record<EmotionalState, SceneModifiers> = {
  // SAD: darker, more subdued color palette with slower ambient animations
  [EmotionalState.SAD]: {
    colorShift: -0.3,
    brightness: 0.6,
    particleSpeed: 0.5,
    ambientIntensity: 0.4,
  },

  // RESTING: neutral with slightly reduced activity
  [EmotionalState.RESTING]: {
    colorShift: 0,
    brightness: 0.9,
    particleSpeed: 0.7,
    ambientIntensity: 0.7,
  },

  // ACTIVE: brighter colors with more energetic particle effects
  [EmotionalState.ACTIVE]: {
    colorShift: 0.2,
    brightness: 1.2,
    particleSpeed: 1.3,
    ambientIntensity: 1.2,
  },

  // VIBRANT: brightest colors with most energetic effects
  [EmotionalState.VIBRANT]: {
    colorShift: 0.3,
    brightness: 1.4,
    particleSpeed: 1.5,
    ambientIntensity: 1.4,
  },

  // CALM: soft, warm lighting with gentle floating particles
  [EmotionalState.CALM]: {
    colorShift: 0.1,
    brightness: 0.95,
    particleSpeed: 0.7,
    ambientIntensity: 0.8,
  },

  // TIRED: subdued with slow movement
  [EmotionalState.TIRED]: {
    colorShift: -0.1,
    brightness: 0.75,
    particleSpeed: 0.5,
    ambientIntensity: 0.5,
  },

  // STRESSED: slightly turbulent ambient effects
  [EmotionalState.STRESSED]: {
    colorShift: 0.1,
    brightness: 1.0,
    particleSpeed: 1.2,
    ambientIntensity: 1.3,
  },

  // ANXIOUS: turbulent effects that calm down after breathing exercises
  [EmotionalState.ANXIOUS]: {
    colorShift: 0.15,
    brightness: 1.05,
    particleSpeed: 1.25,
    ambientIntensity: 1.35,
  },

  // RESTED: soft, warm lighting similar to calm
  [EmotionalState.RESTED]: {
    colorShift: 0.05,
    brightness: 0.9,
    particleSpeed: 0.8,
    ambientIntensity: 0.85,
  },
};

/**
 * Get scene modifiers for a given emotional state
 *
 * @param emotionalState - The current emotional state of the Symbi
 * @returns SceneModifiers object with appropriate values for the state
 *
 * Modifier constraints by state category:
 * - SAD: brightness < 0.7, particleSpeed < 0.8
 * - ACTIVE/VIBRANT: brightness > 1.0, particleSpeed > 1.2
 * - CALM/RESTED: brightness 0.8-1.0, particleSpeed 0.6-0.9
 * - STRESSED/ANXIOUS: ambientIntensity > 1.0
 */
export const getSceneModifiers = (emotionalState: EmotionalState): SceneModifiers => {
  const modifiers = EMOTIONAL_STATE_MODIFIERS[emotionalState];

  if (!modifiers) {
    return DEFAULT_MODIFIERS;
  }

  return modifiers;
};

/**
 * Interpolate between two modifier sets for smooth transitions
 *
 * @param from - Starting modifiers
 * @param to - Target modifiers
 * @param progress - Interpolation progress (0-1)
 * @returns Interpolated SceneModifiers
 */
export const interpolateModifiers = (
  from: SceneModifiers,
  to: SceneModifiers,
  progress: number
): SceneModifiers => {
  const clampedProgress = Math.max(0, Math.min(1, progress));

  return {
    colorShift: from.colorShift + (to.colorShift - from.colorShift) * clampedProgress,
    brightness: from.brightness + (to.brightness - from.brightness) * clampedProgress,
    particleSpeed: from.particleSpeed + (to.particleSpeed - from.particleSpeed) * clampedProgress,
    ambientIntensity:
      from.ambientIntensity + (to.ambientIntensity - from.ambientIntensity) * clampedProgress,
  };
};

/**
 * Check if an emotional state is in the "energetic" category
 * (ACTIVE or VIBRANT)
 */
export const isEnergeticState = (state: EmotionalState): boolean => {
  return state === EmotionalState.ACTIVE || state === EmotionalState.VIBRANT;
};

/**
 * Check if an emotional state is in the "calm" category
 * (CALM or RESTED)
 */
export const isCalmState = (state: EmotionalState): boolean => {
  return state === EmotionalState.CALM || state === EmotionalState.RESTED;
};

/**
 * Check if an emotional state is in the "turbulent" category
 * (STRESSED or ANXIOUS)
 */
export const isTurbulentState = (state: EmotionalState): boolean => {
  return state === EmotionalState.STRESSED || state === EmotionalState.ANXIOUS;
};

/**
 * Check if an emotional state is in the "subdued" category
 * (SAD or TIRED)
 */
export const isSubduedState = (state: EmotionalState): boolean => {
  return state === EmotionalState.SAD || state === EmotionalState.TIRED;
};
