/**
 * HabitatManager Component
 *
 * Central orchestrator for the Interactive Symbi Habitat feature.
 * Coordinates SceneRenderer, TimeManager, and PerformanceMonitor.
 *
 * Requirements: 1.1, 2.1, 3.1, 6.2, 6.3
 * - Render animated background behind Symbi character
 * - Transition scene atmosphere within 2 seconds on emotional state change
 * - Select appropriate time phase based on current time
 * - Pause animations when browser tab is not visible
 * - Handle reduced motion preferences
 *
 * @example
 * ```tsx
 * <HabitatManager
 *   emotionalState={emotionalState}
 *   isVisible={true}
 *   onInteraction={(point) => console.log('Interaction at', point)}
 *   reducedMotion={false}
 * />
 * ```
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import type {
  HabitatManagerProps,
  HabitatConfig,
  SceneType,
  TimePhase,
  QualityLevel,
  Position,
} from '../../types/habitat';
import { SceneRenderer } from './SceneRenderer';
import { InteractionEffects } from './InteractionEffects';
import { getCurrentTimePhase } from '../../utils/TimeManager';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import { useHabitatInteraction } from '../../hooks/useHabitatInteraction';
import { loadScenePreference, getDefaultScene } from '../../services/HabitatPreferencesService';

/**
 * Time phase update interval (check every minute)
 */
const TIME_PHASE_UPDATE_INTERVAL = 60000;

/**
 * Handle type for imperative methods exposed via ref
 */
export interface HabitatManagerHandle {
  triggerSymbiPoke: (position: Position) => void;
  triggerBackgroundTap: (position: Position) => void;
  reloadScenePreference: () => Promise<void>;
}

/**
 * HabitatManager orchestrates all habitat components and state.
 *
 * Responsibilities:
 * - Manages habitat configuration (scene, time phase, quality)
 * - Connects to emotional state from props
 * - Handles visibility changes to pause/resume animations
 * - Manages reduced motion preferences
 * - Coordinates interaction effects
 */
export const HabitatManager = forwardRef<HabitatManagerHandle, HabitatManagerProps>(
  ({ emotionalState, isVisible, onInteraction, reducedMotion = false }, ref) => {
    const { width, height } = useWindowDimensions();

    // Scene preference state
    const [currentScene, setCurrentScene] = useState<SceneType>(getDefaultScene());
    const [isSceneLoaded, setIsSceneLoaded] = useState(false);

    // Time phase state
    const [timePhase, setTimePhase] = useState<TimePhase>(getCurrentTimePhase());

    // Performance monitoring
    // Requirement: 6.2 - Pause animations when tab is not visible
    const {
      quality: autoQuality,
      shouldPauseAnimations,
      isVisible: tabIsVisible,
    } = usePerformanceMonitor({
      initialQuality: reducedMotion ? 'low' : 'medium',
      enabled: isVisible && !reducedMotion,
    });

    // Interaction effects
    // Requirement: 7.1, 7.3 - Handle user interactions
    const { effects, triggerBurst, triggerRipple, clearEffects } = useHabitatInteraction({
      enabled: isVisible && !shouldPauseAnimations,
    });

    /**
     * Determine effective quality level
     * Requirement: 6.3 - Handle reduced motion preferences
     */
    const effectiveQuality: QualityLevel = useMemo(() => {
      if (reducedMotion) {
        return 'low';
      }
      return autoQuality;
    }, [reducedMotion, autoQuality]);

    /**
     * Reload scene preference from storage
     * Can be called imperatively via ref or automatically
     */
    const reloadScenePreference = useCallback(async () => {
      try {
        const savedScene = await loadScenePreference();
        if (savedScene !== currentScene) {
          console.log(`[HabitatManager] Scene changed: ${currentScene} -> ${savedScene}`);
          setCurrentScene(savedScene);
        }
      } catch (error) {
        console.error('[HabitatManager] Error loading scene preference:', error);
      }
    }, [currentScene]);

    /**
     * Load scene preference on mount
     * Requirement: 8.2 - Restore previously selected scene preference
     */
    useEffect(() => {
      const loadPreference = async () => {
        try {
          const savedScene = await loadScenePreference();
          setCurrentScene(savedScene);
        } catch (error) {
          console.error('[HabitatManager] Error loading scene preference:', error);
          // Falls back to default scene (haunted-forest)
        } finally {
          setIsSceneLoaded(true);
        }
      };

      loadPreference();
    }, []);

    /**
     * Periodically check for scene preference changes
     * This handles the case when user changes scene in Settings
     */
    useEffect(() => {
      const intervalId = setInterval(() => {
        reloadScenePreference();
      }, 2000); // Check every 2 seconds

      return () => clearInterval(intervalId);
    }, [reloadScenePreference]);

    /**
     * Update time phase periodically
     * Requirement: 3.1 - Select appropriate time phase
     */
    useEffect(() => {
      // Initial update
      setTimePhase(getCurrentTimePhase());

      // Set up interval for periodic updates
      const intervalId = setInterval(() => {
        const newPhase = getCurrentTimePhase();
        setTimePhase(prevPhase => {
          if (prevPhase !== newPhase) {
            console.log(`[HabitatManager] Time phase changed: ${prevPhase} -> ${newPhase}`);
            return newPhase;
          }
          return prevPhase;
        });
      }, TIME_PHASE_UPDATE_INTERVAL);

      return () => clearInterval(intervalId);
    }, []);

    /**
     * Clear effects when visibility changes
     * Requirement: 6.2 - Pause animations when not visible
     */
    useEffect(() => {
      if (!isVisible || !tabIsVisible) {
        clearEffects();
      }
    }, [isVisible, tabIsVisible, clearEffects]);

    /**
     * Build habitat configuration
     */
    const habitatConfig: HabitatConfig = useMemo(
      () => ({
        scene: currentScene,
        timePhase,
        emotionalState,
        quality: effectiveQuality,
      }),
      [currentScene, timePhase, emotionalState, effectiveQuality]
    );

    /**
     * Handle Symbi poke for ripple effect
     * Requirement: 7.3 - Symbi poke triggers ripple effect
     */
    const handleSymbiPoke = useCallback(
      (position: Position) => {
        triggerRipple(position);
        onInteraction?.(position);
      },
      [triggerRipple, onInteraction]
    );

    /**
     * Handle background tap for particle burst effect
     * Requirement: 7.1 - Click/tap triggers localized particle burst
     */
    const handleBackgroundTap = useCallback(
      (position: Position) => {
        if (__DEV__) {
          console.log('[HabitatManager] Background tap at:', position);
        }
        triggerBurst(position);
        onInteraction?.(position);
      },
      [triggerBurst, onInteraction]
    );

    /**
     * Expose imperative methods via ref
     * Allows MainScreen to trigger Symbi poke effects, background taps, and reload scene
     */
    useImperativeHandle(
      ref,
      () => ({
        triggerSymbiPoke: handleSymbiPoke,
        triggerBackgroundTap: handleBackgroundTap,
        reloadScenePreference,
      }),
      [handleSymbiPoke, handleBackgroundTap, reloadScenePreference]
    );

    /**
     * Handle transition completion
     */
    const handleTransitionComplete = useCallback(() => {
      if (__DEV__) {
        console.log('[HabitatManager] Transition complete');
      }
    }, []);

    // Container dimensions
    const dimensions = useMemo(
      () => ({
        width,
        height,
      }),
      [width, height]
    );

    // Don't render until scene preference is loaded
    if (!isSceneLoaded) {
      return null;
    }

    // Don't render if not visible (performance optimization)
    // Requirement: 6.2 - Pause animations when not visible
    if (!isVisible) {
      return null;
    }

    return (
      <>
        {/* Background layer - behind all content */}
        <View style={styles.container}>
          <SceneRenderer
            config={habitatConfig}
            dimensions={dimensions}
            onTransitionComplete={handleTransitionComplete}
          />
        </View>

        {/* Interaction effects layer - above background, below content */}
        <InteractionEffects
          effects={effects}
          containerSize={dimensions}
          style={styles.effectsLayer}
        />
      </>
    );
  }
);

HabitatManager.displayName = 'HabitatManager';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  effectsLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    pointerEvents: 'none',
  },
});

export default HabitatManager;
