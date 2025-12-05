/**
 * AmbientElement Component
 *
 * Renders animated decorative elements within the habitat scene.
 * Supports various element types (trees, tombstones, bats, etc.) with
 * emotional state modifiers for animation speed.
 *
 * Requirements: 1.4, 2.2, 2.3, 2.4
 * - Display scene-appropriate ambient elements (minimum 5 per scene)
 * - SAD state: slower ambient animations
 * - ACTIVE/VIBRANT: more energetic effects
 * - CALM/RESTED: gentle floating particles
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, Easing, ViewStyle, Platform } from 'react-native';
import type { AmbientElementType, AnimationConfig, SceneModifiers } from '../../types/habitat';
import { EmotionalState } from '../../types';
import { getSceneModifiers } from '../../utils/getSceneModifiers';
import { HALLOWEEN_COLORS } from '../../constants/theme';

/**
 * Props for the AmbientElement component
 */
interface AmbientElementComponentProps {
  /** Type of ambient element to render */
  type: AmbientElementType;
  /** Position as percentage of container (0-100) */
  position: { x: number; y: number };
  /** Scale multiplier (default: 1) */
  scale?: number;
  /** Animation delay in ms */
  animationDelay?: number;
  /** Animation configuration */
  animation?: AnimationConfig;
  /** Current emotional state for modifiers */
  emotionalState?: EmotionalState;
  /** Container dimensions */
  containerSize?: { width: number; height: number };
  /** Additional styles */
  style?: ViewStyle;
}

/**
 * Element visual configurations
 * Sizes significantly increased for better visibility against background images
 */
const ELEMENT_CONFIGS: Record<
  AmbientElementType,
  {
    emoji: string;
    baseSize: number;
    color?: string;
    glowColor?: string;
  }
> = {
  tree: { emoji: '🌲', baseSize: 100, glowColor: '#2d5a27' },
  tombstone: { emoji: '🪦', baseSize: 70, glowColor: '#4a4a6a' },
  fence: { emoji: '⬛', baseSize: 50, glowColor: '#333' },
  mansion: { emoji: '🏚️', baseSize: 140, glowColor: '#4a3a6a' },
  bat: { emoji: '🦇', baseSize: 50, glowColor: '#1a1a2e' },
  owl: { emoji: '🦉', baseSize: 55, glowColor: '#5a4a3a' },
  wisp: { emoji: '👻', baseSize: 45, color: HALLOWEEN_COLORS.primaryLight, glowColor: '#a78bfa' },
  firefly: { emoji: '✨', baseSize: 35, color: '#FFD700', glowColor: '#FFD700' },
  leaf: { emoji: '🍂', baseSize: 35, glowColor: '#8B4513' },
  candle: { emoji: '🕯️', baseSize: 40, glowColor: '#FFA500' },
  moon: { emoji: '🌙', baseSize: 90, glowColor: '#FFE4B5' },
  star: { emoji: '⭐', baseSize: 35, glowColor: '#FFD700' },
};

/**
 * Default animation configurations by type
 * Longer durations for smoother, more graceful movement
 */
const DEFAULT_ANIMATIONS: Record<AmbientElementType, AnimationConfig> = {
  tree: { type: 'sway', duration: 5000 },
  tombstone: { type: 'sway', duration: 6000 },
  fence: { type: 'sway', duration: 8000 },
  mansion: { type: 'sway', duration: 10000 },
  bat: { type: 'float', duration: 4000 },
  owl: { type: 'float', duration: 5000 },
  wisp: { type: 'float', duration: 6000 },
  firefly: { type: 'pulse', duration: 2500 },
  leaf: { type: 'float', duration: 5500 },
  candle: { type: 'flicker', duration: 500 },
  moon: { type: 'pulse', duration: 8000 },
  star: { type: 'pulse', duration: 3000 },
};

/**
 * AmbientElement renders an animated decorative element.
 *
 * Animation types:
 * - float: Gentle up/down bobbing motion
 * - sway: Side-to-side swaying motion
 * - pulse: Opacity/scale pulsing
 * - flicker: Rapid opacity changes (for candles)
 */
export const AmbientElement: React.FC<AmbientElementComponentProps> = ({
  type,
  position,
  scale = 1,
  animationDelay = 0,
  animation,
  emotionalState = EmotionalState.RESTING,
  containerSize = { width: 100, height: 100 },
  style,
}) => {
  // Animation values
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  // Get element configuration
  const elementConfig = ELEMENT_CONFIGS[type];
  const animConfig = animation || DEFAULT_ANIMATIONS[type];

  // Get emotional state modifiers
  const modifiers: SceneModifiers = useMemo(
    () => getSceneModifiers(emotionalState),
    [emotionalState]
  );

  // Calculate adjusted animation duration based on emotional state
  const adjustedDuration = useMemo(() => {
    const baseDuration = animConfig.duration;
    // Slower particle speed = longer duration
    return baseDuration / modifiers.particleSpeed;
  }, [animConfig.duration, modifiers.particleSpeed]);

  // Start animation on mount
  useEffect(() => {
    const startAnimation = () => {
      switch (animConfig.type) {
        case 'float':
          runFloatAnimation();
          break;
        case 'sway':
          runSwayAnimation();
          break;
        case 'pulse':
          runPulseAnimation();
          break;
        case 'flicker':
          runFlickerAnimation();
          break;
      }
    };

    // Apply animation delay
    const timeoutId = setTimeout(startAnimation, animationDelay);

    return () => {
      clearTimeout(timeoutId);
      translateY.stopAnimation();
      translateX.stopAnimation();
      opacity.stopAnimation();
      scaleAnim.stopAnimation();
      rotation.stopAnimation();
    };
  }, [adjustedDuration, animConfig.type, animationDelay]);

  /**
   * Float animation - smooth continuous floating motion
   * Uses 4-step sequences that pass through center for seamless loops
   */
  const runFloatAnimation = () => {
    const amplitude = 30 * modifiers.ambientIntensity;
    const rotationAmount = 0.08;
    const horizontalDrift = amplitude * 0.5;
    const quarterDuration = adjustedDuration / 4;

    Animated.loop(
      Animated.parallel([
        // Vertical bobbing - smooth 4-step cycle: 0 → up → 0 → down → 0
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -amplitude,
            duration: quarterDuration,
            easing: Easing.out(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: quarterDuration,
            easing: Easing.in(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: amplitude,
            duration: quarterDuration,
            easing: Easing.out(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: quarterDuration,
            easing: Easing.in(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        // Rotation - gentle tilt following vertical motion
        Animated.sequence([
          Animated.timing(rotation, {
            toValue: rotationAmount,
            duration: quarterDuration,
            easing: Easing.out(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(rotation, {
            toValue: 0,
            duration: quarterDuration,
            easing: Easing.in(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(rotation, {
            toValue: -rotationAmount,
            duration: quarterDuration,
            easing: Easing.out(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(rotation, {
            toValue: 0,
            duration: quarterDuration,
            easing: Easing.in(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        // Horizontal drift - slower, offset cycle for organic feel
        Animated.sequence([
          Animated.timing(translateX, {
            toValue: horizontalDrift,
            duration: adjustedDuration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: -horizontalDrift,
            duration: adjustedDuration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        // Scale breathing - subtle and slow
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.06,
            duration: adjustedDuration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.97,
            duration: adjustedDuration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  };

  /**
   * Sway animation - smooth side-to-side motion passing through center
   */
  const runSwayAnimation = () => {
    const amplitude = 12 * modifiers.ambientIntensity;
    const quarterDuration = adjustedDuration / 4;

    Animated.loop(
      Animated.parallel([
        // Horizontal sway - 4-step: 0 → left → 0 → right → 0
        Animated.sequence([
          Animated.timing(translateX, {
            toValue: -amplitude,
            duration: quarterDuration,
            easing: Easing.out(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: 0,
            duration: quarterDuration,
            easing: Easing.in(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: amplitude,
            duration: quarterDuration,
            easing: Easing.out(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: 0,
            duration: quarterDuration,
            easing: Easing.in(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        // Gentle vertical bob for organic feel
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -4,
            duration: adjustedDuration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 4,
            duration: adjustedDuration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        // Subtle scale breathing
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.03,
            duration: adjustedDuration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.98,
            duration: adjustedDuration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  };

  /**
   * Pulse animation - smooth glow effect with gentle floating
   */
  const runPulseAnimation = () => {
    const minOpacity = 0.7;
    const maxOpacity = 1.0;
    const minScale = 0.92;
    const maxScale = 1.1 * modifiers.ambientIntensity;
    const quarterDuration = adjustedDuration / 4;

    Animated.loop(
      Animated.parallel([
        // Opacity pulse - 4-step for smoothness
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: minOpacity,
            duration: quarterDuration,
            easing: Easing.out(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: (minOpacity + maxOpacity) / 2,
            duration: quarterDuration,
            easing: Easing.in(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: maxOpacity,
            duration: quarterDuration,
            easing: Easing.out(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: (minOpacity + maxOpacity) / 2,
            duration: quarterDuration,
            easing: Easing.in(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        // Scale pulse - synchronized with opacity
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: minScale,
            duration: quarterDuration,
            easing: Easing.out(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: quarterDuration,
            easing: Easing.in(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: maxScale,
            duration: quarterDuration,
            easing: Easing.out(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: quarterDuration,
            easing: Easing.in(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        // Gentle float for pulsing elements
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -8,
            duration: adjustedDuration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 8,
            duration: adjustedDuration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  };

  /**
   * Flicker animation - rapid opacity changes for candles
   */
  const runFlickerAnimation = () => {
    const flicker = () => {
      const randomOpacity = 0.4 + Math.random() * 0.6;
      const randomScale = 0.9 + Math.random() * 0.2;
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: randomOpacity,
          duration: adjustedDuration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: randomScale,
          duration: adjustedDuration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start(() => flicker());
    };
    flicker();
  };

  // Calculate position in pixels
  const positionStyle = useMemo(
    () => ({
      left: (position.x / 100) * containerSize.width,
      top: (position.y / 100) * containerSize.height,
    }),
    [position.x, position.y, containerSize.width, containerSize.height]
  );

  // Calculate size with scale
  const size = elementConfig.baseSize * scale;

  // Full opacity - no transparency for better visibility
  const brightnessOpacity = 1;

  // Rotation interpolation
  const rotateInterpolate = rotation.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-15deg', '15deg'],
  });

  // Text shadow style for glow effect (web only, gracefully degrades on native)
  const glowStyle = Platform.select({
    web: {
      textShadowColor: elementConfig.glowColor || 'rgba(255,255,255,0.9)',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 20,
    },
    default: {},
  });

  return (
    <Animated.View
      style={[
        styles.element,
        positionStyle,
        {
          width: size,
          height: size,
          opacity: Animated.multiply(opacity, brightnessOpacity),
          transform: [
            { translateX },
            { translateY },
            { scale: scaleAnim },
            { rotate: rotateInterpolate },
          ],
        },
        style,
      ]}>
      <View style={[styles.emojiContainer, styles.glowContainer]}>
        <Animated.Text
          style={[
            styles.emoji,
            glowStyle,
            {
              fontSize: size * 0.85,
              color: elementConfig.color,
            },
          ]}>
          {elementConfig.emoji}
        </Animated.Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  element: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowContainer: {
    // Solid background for better visibility - no transparency
    backgroundColor: 'rgba(20, 10, 30, 0.95)',
    borderRadius: 100,
    padding: 10,
    // Solid border for extra pop
    borderWidth: 2,
    borderColor: 'rgba(167, 139, 250, 0.8)',
  },
  emoji: {
    textAlign: 'center',
  },
});

export default AmbientElement;
