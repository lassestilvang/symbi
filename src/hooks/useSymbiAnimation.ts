/**
 * useSymbiAnimation Hook
 *
 * Manages all animation logic for the Symbi ghost including:
 * - Idle floating animation
 * - Poke interaction (bounce/squish)
 * - AppState-aware animation pausing for battery efficiency
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { Animated, AppState, AppStateStatus } from 'react-native';

// Animation timing constants
const FLOAT_DURATION = 2500;
const FLOAT_DISTANCE = -15;
const ROTATE_DURATION = 3000;
const POKE_DURATION = 100;
const POKE_SCALE_DOWN = 0.9;
const POKE_SCALE_UP = 1.1;
const POKE_FRICTION = 3;
const POKE_TENSION = 40;

interface UseSymbiAnimationOptions {
  /** Callback fired when ghost is poked */
  onPoke?: () => void;
  /** Whether to enable floating animation (default: true) */
  enableFloating?: boolean;
}

interface UseSymbiAnimationReturn {
  /** Vertical bounce animation value */
  bounceAnim: Animated.Value;
  /** Horizontal squish animation value */
  squishAnim: Animated.Value;
  /** Floating animation value */
  floatAnim: Animated.Value;
  /** Rotation animation value for gentle sway */
  rotateAnim: Animated.Value;
  /** Handler for poke interaction */
  handlePoke: () => void;
  /** Whether currently being poked */
  isPoking: boolean;
}

export const useSymbiAnimation = (
  options: UseSymbiAnimationOptions = {}
): UseSymbiAnimationReturn => {
  const { onPoke, enableFloating = true } = options;

  const [isPoking, setIsPoking] = useState(false);

  // Animation values
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const squishAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Track active animations for cleanup
  const floatAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const rotateAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const pokeAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  /**
   * Start floating animation (up/down movement)
   */
  const startFloating = useCallback(() => {
    if (!enableFloating) return;

    floatAnimationRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: FLOAT_DISTANCE,
          duration: FLOAT_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: FLOAT_DURATION,
          useNativeDriver: true,
        }),
      ])
    );
    floatAnimationRef.current.start();
  }, [floatAnim, enableFloating]);

  /**
   * Start rotation animation (side-to-side sway)
   */
  const startRotating = useCallback(() => {
    if (!enableFloating) return;

    rotateAnimationRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: ROTATE_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: ROTATE_DURATION,
          useNativeDriver: true,
        }),
      ])
    );
    rotateAnimationRef.current.start();
  }, [rotateAnim, enableFloating]);

  /**
   * Stop floating animation
   */
  const stopFloating = useCallback(() => {
    floatAnimationRef.current?.stop();
    floatAnimationRef.current = null;
  }, []);

  /**
   * Stop rotation animation
   */
  const stopRotating = useCallback(() => {
    rotateAnimationRef.current?.stop();
    rotateAnimationRef.current = null;
  }, []);

  /**
   * Handle poke/tap interaction with bounce and squish
   */
  const handlePoke = useCallback(() => {
    // Prevent multiple simultaneous pokes
    if (isPoking) return;

    setIsPoking(true);

    // Stop any existing poke animation
    pokeAnimationRef.current?.stop();

    // Bounce and squish animation
    pokeAnimationRef.current = Animated.sequence([
      // Squish down
      Animated.parallel([
        Animated.timing(bounceAnim, {
          toValue: POKE_SCALE_DOWN,
          duration: POKE_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(squishAnim, {
          toValue: POKE_SCALE_UP,
          duration: POKE_DURATION,
          useNativeDriver: true,
        }),
      ]),
      // Spring back
      Animated.parallel([
        Animated.spring(bounceAnim, {
          toValue: 1,
          friction: POKE_FRICTION,
          tension: POKE_TENSION,
          useNativeDriver: true,
        }),
        Animated.spring(squishAnim, {
          toValue: 1,
          friction: POKE_FRICTION,
          tension: POKE_TENSION,
          useNativeDriver: true,
        }),
      ]),
    ]);

    pokeAnimationRef.current.start(({ finished }) => {
      if (finished) {
        setIsPoking(false);
        onPoke?.();
      }
    });
  }, [bounceAnim, squishAnim, isPoking, onPoke]);

  /**
   * Handle app state changes for battery efficiency
   * Pause animations when app is backgrounded
   */
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        stopFloating();
        stopRotating();
      } else if (nextAppState === 'active') {
        startFloating();
        startRotating();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Start animations on mount if app is active
    if (AppState.currentState === 'active') {
      startFloating();
      startRotating();
    }

    return () => {
      subscription.remove();
      stopFloating();
      stopRotating();
      pokeAnimationRef.current?.stop();
    };
  }, [startFloating, stopFloating, startRotating, stopRotating]);

  return {
    bounceAnim,
    squishAnim,
    floatAnim,
    rotateAnim,
    handlePoke,
    isPoking,
  };
};
