/**
 * ParallaxLayer Component
 *
 * Renders a depth-based parallax layer for the habitat background.
 * Supports animated offset values for smooth scrolling effects.
 *
 * Requirements: 1.2
 * - Habitat SHALL include at least three parallax layers creating depth perception
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Animated, StyleProp, ViewStyle } from 'react-native';
import type { ParallaxLayerProps } from '../../types/habitat';

/**
 * Extended props for the ParallaxLayer component
 */
interface ParallaxLayerComponentProps extends ParallaxLayerProps {
  /** Width of the layer container */
  width?: number;
  /** Height of the layer container */
  height?: number;
  /** Additional styles for the layer */
  style?: StyleProp<ViewStyle>;
  /** Z-index for layer ordering */
  zIndex?: number;
}

/**
 * ParallaxLayer creates a depth-based scrolling layer.
 *
 * The depth value (0-1) determines how much the layer moves relative to
 * the base scroll position:
 * - depth = 0: Background layer, moves slowest (10% of offset)
 * - depth = 0.5: Mid-ground layer, moves at half speed
 * - depth = 1: Foreground layer, moves at full speed
 *
 * @example
 * ```tsx
 * <ParallaxLayer depth={0.3} offsetX={scrollX} offsetY={0}>
 *   <BackgroundGradient />
 * </ParallaxLayer>
 * ```
 */
export const ParallaxLayer: React.FC<ParallaxLayerComponentProps> = ({
  depth,
  children,
  offsetX = 0,
  offsetY = 0,
  width,
  height,
  style,
  zIndex = 0,
}) => {
  // Calculate parallax multiplier based on depth
  // Deeper layers (lower depth) move slower
  const parallaxMultiplier = useMemo(() => {
    // Clamp depth between 0 and 1
    const clampedDepth = Math.max(0, Math.min(1, depth));
    // Minimum movement is 10% for background layers
    return 0.1 + clampedDepth * 0.9;
  }, [depth]);

  // Calculate transformed offsets
  const transformedOffsetX = useMemo(() => {
    if (typeof offsetX === 'number') {
      return offsetX * parallaxMultiplier;
    }
    return 0;
  }, [offsetX, parallaxMultiplier]);

  const transformedOffsetY = useMemo(() => {
    if (typeof offsetY === 'number') {
      return offsetY * parallaxMultiplier;
    }
    return 0;
  }, [offsetY, parallaxMultiplier]);

  // Build container style with transforms
  const containerStyle = useMemo((): StyleProp<ViewStyle> => {
    const baseStyle: ViewStyle = {
      ...styles.layer,
      zIndex,
    };

    if (width !== undefined) {
      baseStyle.width = width;
    }
    if (height !== undefined) {
      baseStyle.height = height;
    }

    // Only add transform if there are offsets
    if (transformedOffsetX !== 0 || transformedOffsetY !== 0) {
      baseStyle.transform = [
        { translateX: transformedOffsetX },
        { translateY: transformedOffsetY },
      ];
    }

    return [baseStyle, style];
  }, [zIndex, width, height, transformedOffsetX, transformedOffsetY, style]);

  return <View style={containerStyle}>{children}</View>;
};

/**
 * AnimatedParallaxLayer - Version with Animated.Value support
 *
 * Use this when you need smooth animated transitions for the offset values.
 */
interface AnimatedParallaxLayerProps {
  depth: number;
  children: React.ReactNode;
  offsetX?: Animated.Value;
  offsetY?: Animated.Value;
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  zIndex?: number;
}

export const AnimatedParallaxLayer: React.FC<AnimatedParallaxLayerProps> = ({
  depth,
  children,
  offsetX,
  offsetY,
  width,
  height,
  style,
  zIndex = 0,
}) => {
  // Calculate parallax multiplier based on depth
  const parallaxMultiplier = useMemo(() => {
    const clampedDepth = Math.max(0, Math.min(1, depth));
    return 0.1 + clampedDepth * 0.9;
  }, [depth]);

  // Build base style
  const baseStyle = useMemo((): ViewStyle => {
    const result: ViewStyle = {
      ...styles.layer,
      zIndex,
    };

    if (width !== undefined) {
      result.width = width;
    }
    if (height !== undefined) {
      result.height = height;
    }

    return result;
  }, [zIndex, width, height]);

  // Build animated style with transforms
  const animatedStyle = useMemo(() => {
    if (!offsetX && !offsetY) {
      return {};
    }

    // Use Animated.multiply for parallax effect
    const transform = [];

    if (offsetX) {
      transform.push({
        translateX: Animated.multiply(offsetX, parallaxMultiplier),
      });
    }
    if (offsetY) {
      transform.push({
        translateY: Animated.multiply(offsetY, parallaxMultiplier),
      });
    }

    return { transform };
  }, [offsetX, offsetY, parallaxMultiplier]);

  return <Animated.View style={[baseStyle, animatedStyle, style]}>{children}</Animated.View>;
};

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default ParallaxLayer;
