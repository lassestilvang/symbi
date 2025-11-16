import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ViewStyle, Animated, Pressable, Dimensions } from 'react-native';
import { EmotionalState } from '../types';

/**
 * Symbi8BitCanvas Component
 *
 * Renders an 8-bit style Symbi ghost using React Native Views as pixels.
 * Changes appearance based on emotional state and animates when poked.
 *
 * Requirements: 4.4, 4.5, 9.4
 */

interface Symbi8BitCanvasProps {
  emotionalState: EmotionalState;
  style?: ViewStyle;
  size?: number;
  onPoke?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_SIZE = Math.min(SCREEN_WIDTH * 0.7, 300);

export const Symbi8BitCanvas: React.FC<Symbi8BitCanvasProps> = ({
  emotionalState,
  style,
  size = DEFAULT_SIZE,
  onPoke,
}) => {
  // Force re-render when emotional state changes
  const [renderKey, setRenderKey] = useState(0);

  // Animation values
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const squishAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Force re-render when emotional state changes
  useEffect(() => {
    setRenderKey(prev => prev + 1);
  }, [emotionalState]);

  // Idle floating animation with gentle sway
  useEffect(() => {
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -15,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    );

    const rotateAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    floatAnimation.start();
    rotateAnimation.start();

    return () => {
      floatAnimation.stop();
      rotateAnimation.stop();
    };
  }, []);

  /**
   * Handle poke/tap interaction
   */
  const handlePoke = () => {
    // Bounce and squish animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(bounceAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(squishAnim, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(bounceAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(squishAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    onPoke?.();
  };

  // Get colors and pixels based on emotional state
  const colors = getStateColors(emotionalState);
  const eyePixels = getEyePixels(emotionalState);
  const mouthPixels = getMouthPixels(emotionalState);
  const showBlush = shouldShowBlush(emotionalState);

  // Debug: log state changes
  useEffect(() => {
    console.log('Ghost emotional state:', emotionalState);
    console.log('Eye pixels count:', eyePixels.length);
    console.log('Mouth pixels count:', mouthPixels.length);
  }, [emotionalState]);

  // Calculate pixel size
  const pixelSize = size / 32;

  // Render individual pixel
  const renderPixel = (x: number, y: number, color: string, key: string) => (
    <View
      key={key}
      style={[
        styles.pixel,
        {
          width: pixelSize,
          height: pixelSize,
          left: x * pixelSize,
          top: y * pixelSize,
          backgroundColor: color,
        },
      ]}
    />
  );

  // Filter out body pixels where eyes and mouth will be drawn
  const filteredBodyPixels = ghostBodyPixels.filter(([x, y]) => {
    // Check if this pixel overlaps with eyes
    const isEye = eyePixels.some(([ex, ey]) => ex === x && ey === y);
    // Check if this pixel overlaps with mouth
    const isMouth = mouthPixels.some(([mx, my]) => mx === x && my === y);
    // Check if this pixel overlaps with blush
    const isBlush = showBlush && blushPixels.some(([bx, by]) => bx === x && by === y);

    return !isEye && !isMouth && !isBlush;
  });

  // Interpolate rotation for gentle sway
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-3deg', '3deg'],
  });

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
        <View key={`ghost-pixels-${renderKey}`} style={{ width: '100%', height: '100%' }}>
          {/* Ghost body (with cutouts for facial features) */}
          {filteredBodyPixels.map(([x, y], i) =>
            renderPixel(x, y, colors.body, `${emotionalState}-body-${i}`)
          )}

          {/* Eyes */}
          {eyePixels.map(([x, y], i) =>
            renderPixel(x, y, colors.eyes, `${emotionalState}-eye-${i}`)
          )}

          {/* Mouth */}
          {mouthPixels.map(([x, y], i) =>
            renderPixel(x, y, colors.mouth, `${emotionalState}-mouth-${i}`)
          )}

          {/* Blush */}
          {showBlush &&
            blushPixels.map(([x, y], i) =>
              renderPixel(x, y, colors.blush, `${emotionalState}-blush-${i}`)
            )}
        </View>
      </Animated.View>
    </Pressable>
  );
};

/**
 * Get colors based on emotional state
 */
const getStateColors = (state: EmotionalState) => {
  const baseColors = {
    body: '#F5F5F0', // Cream white
    eyes: '#000000', // Black
    mouth: '#000000', // Black
    blush: '#FFB6C1', // Light pink
  };

  switch (state) {
    case EmotionalState.SAD:
    case EmotionalState.TIRED:
      return {
        ...baseColors,
        body: '#E8E8E0', // Slightly darker/duller
      };
    case EmotionalState.ACTIVE:
    case EmotionalState.VIBRANT:
      return {
        ...baseColors,
        body: '#FFFFFF', // Brighter white
        blush: '#FF69B4', // Hot pink
      };
    case EmotionalState.STRESSED:
    case EmotionalState.ANXIOUS:
      return {
        ...baseColors,
        body: '#F0F0E8',
        blush: '#FFA07A', // Light salmon (worried)
      };
    default:
      return baseColors;
  }
};

/**
 * Ghost body pixel coordinates (8-bit style) - Taller version
 */
const ghostBodyPixels: number[][] = [
  // Top rounded part
  [12, 6],
  [13, 6],
  [14, 6],
  [15, 6],
  [16, 6],
  [17, 6],
  [18, 6],
  [19, 6],
  [10, 7],
  [11, 7],
  [12, 7],
  [13, 7],
  [14, 7],
  [15, 7],
  [16, 7],
  [17, 7],
  [18, 7],
  [19, 7],
  [20, 7],
  [21, 7],
  [9, 8],
  [10, 8],
  [11, 8],
  [12, 8],
  [13, 8],
  [14, 8],
  [15, 8],
  [16, 8],
  [17, 8],
  [18, 8],
  [19, 8],
  [20, 8],
  [21, 8],
  [22, 8],
  // Upper body
  [8, 9],
  [9, 9],
  [10, 9],
  [11, 9],
  [12, 9],
  [13, 9],
  [14, 9],
  [15, 9],
  [16, 9],
  [17, 9],
  [18, 9],
  [19, 9],
  [20, 9],
  [21, 9],
  [22, 9],
  [23, 9],
  [8, 10],
  [9, 10],
  [10, 10],
  [11, 10],
  [12, 10],
  [13, 10],
  [14, 10],
  [15, 10],
  [16, 10],
  [17, 10],
  [18, 10],
  [19, 10],
  [20, 10],
  [21, 10],
  [22, 10],
  [23, 10],
  // Middle section (eyes area)
  [8, 11],
  [9, 11],
  [10, 11],
  [11, 11],
  [12, 11],
  [13, 11],
  [14, 11],
  [15, 11],
  [16, 11],
  [17, 11],
  [18, 11],
  [19, 11],
  [20, 11],
  [21, 11],
  [22, 11],
  [23, 11],
  [8, 12],
  [9, 12],
  [10, 12],
  [11, 12],
  [12, 12],
  [13, 12],
  [14, 12],
  [15, 12],
  [16, 12],
  [17, 12],
  [18, 12],
  [19, 12],
  [20, 12],
  [21, 12],
  [22, 12],
  [23, 12],
  [8, 13],
  [9, 13],
  [10, 13],
  [11, 13],
  [12, 13],
  [13, 13],
  [14, 13],
  [15, 13],
  [16, 13],
  [17, 13],
  [18, 13],
  [19, 13],
  [20, 13],
  [21, 13],
  [22, 13],
  [23, 13],
  [8, 14],
  [9, 14],
  [10, 14],
  [11, 14],
  [12, 14],
  [13, 14],
  [14, 14],
  [15, 14],
  [16, 14],
  [17, 14],
  [18, 14],
  [19, 14],
  [20, 14],
  [21, 14],
  [22, 14],
  [23, 14],
  // Lower body
  [8, 15],
  [9, 15],
  [10, 15],
  [11, 15],
  [12, 15],
  [13, 15],
  [14, 15],
  [15, 15],
  [16, 15],
  [17, 15],
  [18, 15],
  [19, 15],
  [20, 15],
  [21, 15],
  [22, 15],
  [23, 15],
  [8, 16],
  [9, 16],
  [10, 16],
  [11, 16],
  [12, 16],
  [13, 16],
  [14, 16],
  [15, 16],
  [16, 16],
  [17, 16],
  [18, 16],
  [19, 16],
  [20, 16],
  [21, 16],
  [22, 16],
  [23, 16],
  [8, 17],
  [9, 17],
  [10, 17],
  [11, 17],
  [12, 17],
  [13, 17],
  [14, 17],
  [15, 17],
  [16, 17],
  [17, 17],
  [18, 17],
  [19, 17],
  [20, 17],
  [21, 17],
  [22, 17],
  [23, 17],
  [8, 18],
  [9, 18],
  [10, 18],
  [11, 18],
  [12, 18],
  [13, 18],
  [14, 18],
  [15, 18],
  [16, 18],
  [17, 18],
  [18, 18],
  [19, 18],
  [20, 18],
  [21, 18],
  [22, 18],
  [23, 18],
  [8, 19],
  [9, 19],
  [10, 19],
  [11, 19],
  [12, 19],
  [13, 19],
  [14, 19],
  [15, 19],
  [16, 19],
  [17, 19],
  [18, 19],
  [19, 19],
  [20, 19],
  [21, 19],
  [22, 19],
  [23, 19],
  [8, 20],
  [9, 20],
  [10, 20],
  [11, 20],
  [12, 20],
  [13, 20],
  [14, 20],
  [15, 20],
  [16, 20],
  [17, 20],
  [18, 20],
  [19, 20],
  [20, 20],
  [21, 20],
  [22, 20],
  [23, 20],
  [8, 21],
  [9, 21],
  [10, 21],
  [11, 21],
  [12, 21],
  [13, 21],
  [14, 21],
  [15, 21],
  [16, 21],
  [17, 21],
  [18, 21],
  [19, 21],
  [20, 21],
  [21, 21],
  [22, 21],
  [23, 21],
  // Wavy bottom
  [8, 22],
  [9, 22],
  [10, 22],
  [11, 22],
  [12, 22],
  [13, 22],
  [14, 22],
  [15, 22],
  [16, 22],
  [17, 22],
  [18, 22],
  [19, 22],
  [20, 22],
  [21, 22],
  [22, 22],
  [23, 22],
  [9, 23],
  [10, 23],
  [11, 23],
  [13, 23],
  [14, 23],
  [15, 23],
  [17, 23],
  [18, 23],
  [19, 23],
  [21, 23],
  [22, 23],
  [10, 24],
  [11, 24],
  [14, 24],
  [15, 24],
  [18, 24],
  [19, 24],
  [22, 24],
  [11, 25],
  [15, 25],
  [19, 25],
];

/**
 * Get eye pixels based on emotional state
 */
const getEyePixels = (state: EmotionalState): number[][] => {
  // Normal oval eyes (positioned higher for taller ghost)
  const normalEyes = [
    // Left eye
    [12, 11],
    [13, 11],
    [12, 12],
    [13, 12],
    // Right eye
    [18, 11],
    [19, 11],
    [18, 12],
    [19, 12],
  ];

  // Sad/tired eyes (smaller, droopy, positioned lower)
  const sadEyes = [
    // Left eye (droopy)
    [12, 12],
    [13, 12],
    [12, 13],
    [13, 13],
    // Right eye (droopy)
    [18, 12],
    [19, 12],
    [18, 13],
    [19, 13],
  ];

  // Happy/active eyes (larger, bright)
  const happyEyes = [
    [12, 10],
    [13, 10],
    [12, 11],
    [13, 11],
    [12, 12],
    [13, 12],
    [18, 10],
    [19, 10],
    [18, 11],
    [19, 11],
    [18, 12],
    [19, 12],
  ];

  // Stressed eyes (wide)
  const stressedEyes = [
    [11, 10],
    [12, 10],
    [13, 10],
    [14, 10],
    [11, 11],
    [12, 11],
    [13, 11],
    [14, 11],
    [11, 12],
    [12, 12],
    [13, 12],
    [14, 12],
    [17, 10],
    [18, 10],
    [19, 10],
    [20, 10],
    [17, 11],
    [18, 11],
    [19, 11],
    [20, 11],
    [17, 12],
    [18, 12],
    [19, 12],
    [20, 12],
  ];

  switch (state) {
    case EmotionalState.SAD:
    case EmotionalState.TIRED:
      return sadEyes;
    case EmotionalState.ACTIVE:
    case EmotionalState.VIBRANT:
    case EmotionalState.RESTED:
      return happyEyes;
    case EmotionalState.STRESSED:
    case EmotionalState.ANXIOUS:
      return stressedEyes;
    default:
      return normalEyes;
  }
};

/**
 * Get mouth pixels based on emotional state
 */
const getMouthPixels = (state: EmotionalState): number[][] => {
  // Happy smile (positioned lower for taller ghost)
  const smile = [
    [13, 16],
    [14, 16],
    [15, 16],
    [16, 16],
    [17, 16],
    [12, 15],
    [18, 15],
  ];

  // Sad frown (inverted smile - corners down)
  const frown = [
    [13, 17],
    [14, 17],
    [15, 17],
    [16, 17],
    [17, 17],
    [12, 18],
    [18, 18],
  ];

  // Neutral line
  const neutral = [
    [13, 16],
    [14, 16],
    [15, 16],
    [16, 16],
    [17, 16],
  ];

  // Worried/stressed
  const worried = [
    [13, 16],
    [14, 16],
    [15, 16],
    [16, 16],
    [17, 16],
    [13, 17],
    [17, 17],
  ];

  switch (state) {
    case EmotionalState.SAD:
    case EmotionalState.TIRED:
      return frown;
    case EmotionalState.ACTIVE:
    case EmotionalState.VIBRANT:
    case EmotionalState.RESTED:
      return smile;
    case EmotionalState.STRESSED:
    case EmotionalState.ANXIOUS:
      return worried;
    default:
      return neutral;
  }
};

/**
 * Blush pixels (cheeks) - adjusted for taller ghost
 */
const blushPixels: number[][] = [
  // Left cheek
  [10, 13],
  [11, 13],
  [10, 14],
  [11, 14],
  // Right cheek
  [20, 13],
  [21, 13],
  [20, 14],
  [21, 14],
];

/**
 * Determine if blush should be shown
 */
const shouldShowBlush = (state: EmotionalState): boolean => {
  return [EmotionalState.ACTIVE, EmotionalState.VIBRANT, EmotionalState.RESTED].includes(state);
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ghostWrapper: {
    position: 'relative',
  },
  pixel: {
    position: 'absolute',
  },
});
