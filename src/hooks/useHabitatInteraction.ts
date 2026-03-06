/**
 * useHabitatInteraction Hook
 *
 * Manages interaction effects for the habitat system including:
 * - Click/tap particle burst effects at interaction points
 * - Ripple effects for Symbi poke interactions
 * - Effect lifecycle management (complete within 1 second)
 *
 * Requirements: 7.1, 7.3, 7.4
 * - WHEN the user clicks or taps on the habitat background THEN trigger a localized particle burst
 * - WHEN the user pokes the Symbi THEN trigger a ripple effect through nearby ambient elements
 * - WHEN interaction effects play THEN complete them within 1 second
 *
 * @example
 * ```tsx
 * const { effects, triggerBurst, triggerRipple, clearEffects } = useHabitatInteraction();
 *
 * // On background tap
 * <Pressable onPress={(e) => triggerBurst({ x: e.nativeEvent.locationX, y: e.nativeEvent.locationY })}>
 *   <HabitatBackground />
 * </Pressable>
 *
 * // On Symbi poke
 * <Pressable onPress={(e) => triggerRipple({ x: symbiX, y: symbiY })}>
 *   <Symbi />
 * </Pressable>
 * ```
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { InteractionEffect, InteractionEffectType, Position } from '../types/habitat';

/**
 * Effect duration constant - all effects must complete within 1 second
 * Requirement: 7.4
 */
const EFFECT_DURATION_MS = 1000;

/**
 * Configuration for different effect types
 */
interface EffectConfig {
  /** Duration in milliseconds */
  duration: number;
  /** Number of particles for burst effects */
  particleCount?: number;
  /** Maximum radius for ripple effects */
  maxRadius?: number;
}

const EFFECT_CONFIGS: Record<InteractionEffectType, EffectConfig> = {
  burst: {
    duration: EFFECT_DURATION_MS * 1.5, // Longer duration for bigger effect
    particleCount: 16, // More particles
  },
  ripple: {
    duration: EFFECT_DURATION_MS,
    maxRadius: 200, // Bigger ripple
  },
  glow: {
    duration: EFFECT_DURATION_MS,
  },
};

/**
 * Extended interaction effect with additional animation properties
 */
export interface AnimatedInteractionEffect extends InteractionEffect {
  /** Progress of the effect animation (0-1) */
  progress: number;
  /** Configuration for this effect type */
  config: EffectConfig;
}

/**
 * Options for the useHabitatInteraction hook
 */
export interface UseHabitatInteractionOptions {
  /** Maximum number of concurrent effects */
  maxConcurrentEffects?: number;
  /** Whether effects are enabled */
  enabled?: boolean;
  /** Callback when an effect completes */
  onEffectComplete?: (effect: InteractionEffect) => void;
}

/**
 * Return type for the useHabitatInteraction hook
 */
export interface UseHabitatInteractionResult {
  /** Currently active interaction effects */
  effects: AnimatedInteractionEffect[];
  /** Trigger a particle burst effect at the given position */
  triggerBurst: (position: Position) => string;
  /** Trigger a ripple effect at the given position (for Symbi poke) */
  triggerRipple: (position: Position) => string;
  /** Trigger a glow effect at the given position */
  triggerGlow: (position: Position) => string;
  /** Clear all active effects */
  clearEffects: () => void;
  /** Clear a specific effect by ID */
  clearEffect: (id: string) => void;
  /** Check if any effects are currently active */
  hasActiveEffects: boolean;
}

/**
 * Generate a unique effect ID
 */
let effectIdCounter = 0;
const generateEffectId = (type: InteractionEffectType): string => {
  effectIdCounter += 1;
  return `effect-${type}-${effectIdCounter}-${Date.now()}`;
};

/**
 * useHabitatInteraction manages interaction effects for the habitat.
 *
 * This hook handles:
 * - Creating and tracking interaction effects
 * - Automatic cleanup of completed effects
 * - Animation progress updates via requestAnimationFrame
 * - Effect lifecycle management (all effects complete within 1 second)
 *
 * @param options - Configuration options for the hook
 * @returns Object containing effects array and trigger functions
 */
export const useHabitatInteraction = (
  options: UseHabitatInteractionOptions = {}
): UseHabitatInteractionResult => {
  const { maxConcurrentEffects = 10, enabled = true, onEffectComplete } = options;

  const [effects, setEffects] = useState<AnimatedInteractionEffect[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const effectsRef = useRef<AnimatedInteractionEffect[]>([]);

  // Keep ref in sync with state for animation loop
  useEffect(() => {
    effectsRef.current = effects;
  }, [effects]);

  /**
   * Create a new interaction effect
   * Requirement: 7.1 - Effect position matches interaction point
   */
  const createEffect = useCallback(
    (type: InteractionEffectType, position: Position): AnimatedInteractionEffect => {
      const config = EFFECT_CONFIGS[type];
      const now = Date.now();

      return {
        id: generateEffectId(type),
        type,
        position: { x: position.x, y: position.y }, // Ensure position matches exactly
        startTime: now,
        duration: config.duration,
        progress: 0,
        config,
      };
    },
    []
  );

  /**
   * Add a new effect to the active effects list
   */
  const addEffect = useCallback(
    (effect: AnimatedInteractionEffect): void => {
      setEffects(prev => {
        // Remove oldest effects if we exceed max concurrent
        let newEffects = [...prev, effect];
        if (newEffects.length > maxConcurrentEffects) {
          newEffects = newEffects.slice(-maxConcurrentEffects);
        }
        return newEffects;
      });
    },
    [maxConcurrentEffects]
  );

  /**
   * Trigger a particle burst effect at the given position
   * Requirement: 7.1 - Click/tap triggers localized particle burst
   */
  const triggerBurst = useCallback(
    (position: Position): string => {
      if (!enabled) return '';

      const effect = createEffect('burst', position);
      addEffect(effect);
      return effect.id;
    },
    [enabled, createEffect, addEffect]
  );

  /**
   * Trigger a ripple effect at the given position (for Symbi poke)
   * Requirement: 7.3 - Symbi poke triggers ripple effect
   */
  const triggerRipple = useCallback(
    (position: Position): string => {
      if (!enabled) return '';

      const effect = createEffect('ripple', position);
      addEffect(effect);
      return effect.id;
    },
    [enabled, createEffect, addEffect]
  );

  /**
   * Trigger a glow effect at the given position
   */
  const triggerGlow = useCallback(
    (position: Position): string => {
      if (!enabled) return '';

      const effect = createEffect('glow', position);
      addEffect(effect);
      return effect.id;
    },
    [enabled, createEffect, addEffect]
  );

  /**
   * Clear all active effects
   */
  const clearEffects = useCallback((): void => {
    setEffects([]);
  }, []);

  /**
   * Clear a specific effect by ID
   */
  const clearEffect = useCallback((id: string): void => {
    setEffects(prev => prev.filter(effect => effect.id !== id));
  }, []);

  /**
   * Animation loop to update effect progress and cleanup completed effects
   * Requirement: 7.4 - Effects complete within 1 second
   */
  useEffect(() => {
    if (!enabled || effects.length === 0) {
      return;
    }

    const animate = () => {
      const now = Date.now();
      let hasChanges = false;
      const completedEffects: InteractionEffect[] = [];

      const updatedEffects = effectsRef.current
        .map(effect => {
          const elapsed = now - effect.startTime;
          const progress = Math.min(1, elapsed / effect.duration);

          if (progress !== effect.progress) {
            hasChanges = true;
          }

          if (progress >= 1) {
            completedEffects.push(effect);
            return null;
          }

          return { ...effect, progress };
        })
        .filter((effect): effect is AnimatedInteractionEffect => effect !== null);

      if (hasChanges || completedEffects.length > 0) {
        setEffects(updatedEffects);

        // Notify about completed effects
        completedEffects.forEach(effect => {
          onEffectComplete?.(effect);
        });
      }

      if (updatedEffects.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, effects.length, onEffectComplete]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    effects,
    triggerBurst,
    triggerRipple,
    triggerGlow,
    clearEffects,
    clearEffect,
    hasActiveEffects: effects.length > 0,
  };
};

export default useHabitatInteraction;
