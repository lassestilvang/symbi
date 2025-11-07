import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ViewStyle, Animated, AppState, AppStateStatus } from 'react-native';
import LottieView from 'lottie-react-native';
import { EmotionalState } from '../types';

/**
 * SymbiAnimation Component
 * 
 * Renders the Symbi creature with Lottie animations based on emotional state.
 * Supports smooth transitions between states and preloads animations for performance.
 * 
 * Requirements: 4.4, 4.5, 9.4
 */

interface SymbiAnimationProps {
  emotionalState: EmotionalState;
  evolutionLevel?: number;
  customAppearance?: string | null;
  style?: ViewStyle;
  autoPlay?: boolean;
  loop?: boolean;
}

// Animation source mapping for Phase 1 states
const ANIMATION_SOURCES = {
  [EmotionalState.SAD]: require('../assets/animations/phase1/sad.json'),
  [EmotionalState.RESTING]: require('../assets/animations/phase1/resting.json'),
  [EmotionalState.ACTIVE]: require('../assets/animations/phase1/active.json'),
  // Phase 2 states will be added later
  [EmotionalState.VIBRANT]: require('../assets/animations/phase1/active.json'), // Fallback
  [EmotionalState.CALM]: require('../assets/animations/phase1/resting.json'), // Fallback
  [EmotionalState.TIRED]: require('../assets/animations/phase1/sad.json'), // Fallback
  [EmotionalState.STRESSED]: require('../assets/animations/phase1/sad.json'), // Fallback
  [EmotionalState.ANXIOUS]: require('../assets/animations/phase1/sad.json'), // Fallback
  [EmotionalState.RESTED]: require('../assets/animations/phase1/resting.json'), // Fallback
};

export const SymbiAnimation: React.FC<SymbiAnimationProps> = ({
  emotionalState,
  evolutionLevel = 0,
  customAppearance = null,
  style,
  autoPlay = true,
  loop = true,
}) => {
  const animationRef = useRef<LottieView>(null);
  const [currentAnimation, setCurrentAnimation] = useState(
    ANIMATION_SOURCES[emotionalState]
  );
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [speed, setSpeed] = useState(1.0);
  
  // Animated values for smooth transitions
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Cache for rendered frames (optimization)
  const frameCache = useRef<Map<EmotionalState, any>>(new Map());

  // Preload animations on component mount
  useEffect(() => {
    preloadAnimations();
  }, []);

  // Monitor app state for performance optimization
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, []);

  /**
   * Handle app state changes to optimize performance
   * Reduces frame rate when app is backgrounded to save battery
   */
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.match(/active/) && nextAppState === 'background') {
      // App moved to background - throttle to 10 FPS
      setSpeed(0.33); // 10 FPS = 30 FPS * 0.33
    } else if (appState.match(/inactive|background/) && nextAppState === 'active') {
      // App moved to foreground - restore normal speed
      setSpeed(1.0);
    }
    
    setAppState(nextAppState);
  };

  // Update animation when emotional state changes with smooth transition
  useEffect(() => {
    const newAnimation = ANIMATION_SOURCES[emotionalState];
    if (newAnimation !== currentAnimation) {
      transitionToState(emotionalState, 2000); // Default 2 second transition
    }
  }, [emotionalState]);

  /**
   * Preload all animations to improve performance
   * This ensures smooth transitions without loading delays
   * Also initializes frame cache for frequently used states
   */
  const preloadAnimations = () => {
    // In React Native, requiring the animations already loads them
    // Initialize cache for Phase 1 states (most frequently used)
    frameCache.current.set(EmotionalState.SAD, ANIMATION_SOURCES[EmotionalState.SAD]);
    frameCache.current.set(EmotionalState.RESTING, ANIMATION_SOURCES[EmotionalState.RESTING]);
    frameCache.current.set(EmotionalState.ACTIVE, ANIMATION_SOURCES[EmotionalState.ACTIVE]);
    
    setIsPreloaded(true);
  };

  /**
   * Transition to a new emotional state with smooth animation
   * Uses fade and scale effects to prevent flickering
   * 
   * @param newState - The target emotional state
   * @param duration - Transition duration in milliseconds (1000-3000ms)
   */
  const transitionToState = async (newState: EmotionalState, duration: number = 2000) => {
    // Clamp duration between 1-3 seconds as per requirements
    const clampedDuration = Math.max(1000, Math.min(3000, duration));
    const halfDuration = clampedDuration / 2;

    setIsTransitioning(true);

    // Fade out and scale down
    await new Promise<void>((resolve) => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: halfDuration,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: halfDuration,
          useNativeDriver: true,
        }),
      ]).start(() => resolve());
    });

    // Update animation source
    const newAnimation = ANIMATION_SOURCES[newState];
    setCurrentAnimation(newAnimation);

    // Reset and play new animation
    if (animationRef.current && autoPlay) {
      animationRef.current.reset();
      animationRef.current.play();
    }

    // Fade in and scale up
    await new Promise<void>((resolve) => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: halfDuration,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: halfDuration,
          useNativeDriver: true,
        }),
      ]).start(() => resolve());
    });

    setIsTransitioning(false);
  };

  /**
   * Get the animation source based on current state
   * Supports custom appearances for evolved Symbi (Phase 3)
   * Uses cache when available for better performance
   */
  const getAnimationSource = () => {
    // Phase 3: Use custom appearance if available
    if (customAppearance && evolutionLevel > 0) {
      return { uri: customAppearance };
    }

    // Check cache first for frequently used states
    const cached = frameCache.current.get(emotionalState);
    if (cached) {
      return cached;
    }

    // Use standard animation for current emotional state
    return currentAnimation;
  };

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.animationWrapper,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <LottieView
          ref={animationRef}
          source={getAnimationSource()}
          autoPlay={autoPlay}
          loop={loop}
          speed={speed}
          style={styles.animation}
          resizeMode="contain"
          hardwareAccelerationAndroid
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationWrapper: {
    width: '100%',
    height: '100%',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});
