import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from 'react-native';

/**
 * EvolutionCelebration Component
 * 
 * Displays a celebratory modal when the Symbi evolves.
 * Shows the new evolved appearance with animations and confetti effects.
 * 
 * Requirements: 8.2, 8.3, 8.4
 */

interface EvolutionCelebrationProps {
  visible: boolean;
  evolutionLevel: number;
  appearanceUrl: string;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const EvolutionCelebration: React.FC<EvolutionCelebrationProps> = ({
  visible,
  evolutionLevel,
  appearanceUrl,
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Start celebration animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(sparkleAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(sparkleAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      sparkleAnim.setValue(0);
    }
  }, [visible]);

  const sparkleOpacity = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Sparkle effects */}
          <Animated.View style={[styles.sparkle, styles.sparkle1, { opacity: sparkleOpacity }]}>
            <Text style={styles.sparkleText}>✨</Text>
          </Animated.View>
          <Animated.View style={[styles.sparkle, styles.sparkle2, { opacity: sparkleOpacity }]}>
            <Text style={styles.sparkleText}>✨</Text>
          </Animated.View>
          <Animated.View style={[styles.sparkle, styles.sparkle3, { opacity: sparkleOpacity }]}>
            <Text style={styles.sparkleText}>✨</Text>
          </Animated.View>
          <Animated.View style={[styles.sparkle, styles.sparkle4, { opacity: sparkleOpacity }]}>
            <Text style={styles.sparkleText}>✨</Text>
          </Animated.View>

          {/* Title */}
          <Text style={styles.title}>🎉 Evolution Complete! 🎉</Text>

          {/* Evolution level badge */}
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Level {evolutionLevel}</Text>
          </View>

          {/* Evolved appearance */}
          <View style={styles.imageContainer}>
            {appearanceUrl ? (
              <Image
                source={{ uri: appearanceUrl }}
                style={styles.image}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderEmoji}>👻</Text>
              </View>
            )}
          </View>

          {/* Message */}
          <Text style={styles.message}>
            Your Symbi has evolved into a more powerful form!
          </Text>
          <Text style={styles.submessage}>
            Keep up the healthy habits to unlock the next evolution.
          </Text>

          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityLabel="Close evolution celebration"
          >
            <Text style={styles.closeButtonText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 400,
    backgroundColor: '#16213e',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#9333EA',
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 16,
  },
  sparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: 20,
    left: 20,
  },
  sparkle2: {
    top: 20,
    right: 20,
  },
  sparkle3: {
    bottom: 100,
    left: 30,
  },
  sparkle4: {
    bottom: 100,
    right: 30,
  },
  sparkleText: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9333EA',
    textAlign: 'center',
    marginBottom: 16,
  },
  levelBadge: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  imageContainer: {
    width: 250,
    height: 250,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 120,
    opacity: 0.5,
  },
  message: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#a78bfa',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  submessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: '#9333EA',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
