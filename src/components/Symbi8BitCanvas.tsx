import React, { useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ViewStyle, Animated, Pressable, Dimensions } from 'react-native';
import { EmotionalState } from '../types';
import { useSymbiAnimation } from '../hooks/useSymbiAnimation';
import { ghostBodyPixels, blushPixels } from './symbi/pixelData';
import {
  getStateColors,
  getEyePixels,
  getMouthPixels,
  shouldShowBlush,
  GHOST_SIZE_RATIO,
  MAX_GHOST_SIZE,
  PIXEL_GRID_SIZE,
} from './symbi/ghostRenderer';

/**
 * Symbi8BitCanvas Component
 *
 * Renders an 8-bit style Symbi ghost using React Native Views as pixels.
 * Changes appearance based on emotional state and animates when poked.
 *
 * This implementation uses native Views for cross-platform compatibility.
 *
 * Requirements: 4.4, 4.5, 9.4
 */

interface Symbi8BitCanvasProps {
  /** Current emotional state determining ghost appearance */
  emotionalState: EmotionalState;
  /** Optional custom styles */
  style?: ViewStyle;
  /** Size in pixels (default: 70% of screen width, max 300px) */
  size?: number;
  /** Callback fired when ghost is tapped/poked */
  onPoke?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_SIZE = Math.min(SCREEN_WIDTH * GHOST_SIZE_RATIO, MAX_GHOST_SIZE);

export const Symbi8BitCanvas: React.FC<Symbi8BitCanvasProps> = ({
  emotionalState,
  style,
  size = DEFAULT_SIZE,
  onPoke,
}) => {
  // Use custom animation hook with AppState handling
  const { bounceAnim, squishAnim, floatAnim, rotateAnim, handlePoke } = useSymbiAnimation({
    onPoke,
    enableFloating: true,
  });

  // Interpolate rotation for gentle sway
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-3deg', '3deg'],
  });

  // Memoize colors and pixels based on emotional state
  const colors = useMemo(() => getStateColors(emotionalState), [emotionalState]);
  const eyePixels = useMemo(() => getEyePixels(emotionalState), [emotionalState]);
  const mouthPixels = useMemo(() => getMouthPixels(emotionalState), [emotionalState]);
  const showBlush = useMemo(() => shouldShowBlush(emotionalState), [emotionalState]);

  // Calculate pixel size
  const pixelSize = useMemo(() => size / PIXEL_GRID_SIZE, [size]);

  /**
   * Render individual pixel with spacing for pixelated effect
   */
  const renderPixel = useCallback(
    (x: number, y: number, color: string, key: string) => {
      // Add 7% spacing between pixels for a more pixelated look
      const pixelGap = pixelSize * 0.07;
      const adjustedPixelSize = pixelSize - pixelGap;

      return (
        <View
          key={key}
          style={[
            styles.pixel,
            {
              width: adjustedPixelSize,
              height: adjustedPixelSize,
              left: x * pixelSize + pixelGap / 2,
              top: y * pixelSize + pixelGap / 2,
              backgroundColor: color,
            },
          ]}
        />
      );
    },
    [pixelSize]
  );

  /**
   * Filter out body pixels where eyes, mouth, and blush will be drawn
   * to prevent overlapping
   */
  const filteredBodyPixels = useMemo(() => {
    return ghostBodyPixels.filter(([x, y]) => {
      const isEye = eyePixels.some(([ex, ey]) => ex === x && ey === y);
      const isMouth = mouthPixels.some(([mx, my]) => mx === x && my === y);
      const isBlush = showBlush && blushPixels.some(([bx, by]) => bx === x && by === y);
      return !isEye && !isMouth && !isBlush;
    });
  }, [eyePixels, mouthPixels, showBlush]);

  // Debug logging for state changes
  useEffect(() => {
    if (__DEV__) {
      console.log('[Symbi8BitCanvas] Emotional state:', emotionalState);
      console.log('[Symbi8BitCanvas] Eye pixels:', eyePixels.length);
      console.log('[Symbi8BitCanvas] Mouth pixels:', mouthPixels.length);
    }
  }, [emotionalState, eyePixels.length, mouthPixels.length]);

  return (
    <Pressable onPress={handlePoke} style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.ghostWrapper,
          {
            width: size,
            height: size,
            transform: [
              { translateY: floatAnim },
              { rotate },
              { scaleY: bounceAnim },
              { scaleX: squishAnim },
            ],
          },
        ]}>
        <View style={styles.pixelContainer}>
          {/* Ghost body (with cutouts for facial features) */}
          {filteredBodyPixels.map(([x, y], i) => renderPixel(x, y, colors.body, `body-${i}`))}

          {/* Eyes */}
          {eyePixels.map(([x, y], i) => renderPixel(x, y, colors.eyes, `eye-${i}`))}

          {/* Mouth */}
          {mouthPixels.map(([x, y], i) => renderPixel(x, y, colors.mouth, `mouth-${i}`))}

          {/* Blush */}
          {showBlush &&
            blushPixels.map(([x, y], i) => renderPixel(x, y, colors.blush, `blush-${i}`))}
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ghostWrapper: {
    position: 'relative',
  },
  pixelContainer: {
    width: '100%',
    height: '100%',
  },
  pixel: {
    position: 'absolute',
  },
});
