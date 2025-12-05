/**
 * NotificationToast Component
 *
 * Displays achievement, streak milestone, and cosmetic unlock notifications.
 * Features toast notifications with badge icons, celebration animations,
 * and special unlock effects for rare cosmetics.
 *
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { HALLOWEEN_COLORS, LAYOUT, SHADOWS } from '../constants/theme';
import type { RarityTier } from '../types';
import {
  getAchievementNotificationService,
  type AchievementNotification,
  type NotificationType,
} from '../services/AchievementNotificationService';

// ============================================================================
// Types
// ============================================================================

interface NotificationToastProps {
  /** Optional custom styles */
  style?: ViewStyle;
}

interface ConfettiParticle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  scale: Animated.Value;
  color: string;
}

// ============================================================================
// Constants
// ============================================================================

const SCREEN_WIDTH = Dimensions.get('window').width;
const TOAST_WIDTH = Math.min(SCREEN_WIDTH - 40, 360);
const ANIMATION_DURATION = 300;
const CONFETTI_COUNT = 20;

/**
 * Rarity color mapping for notification styling
 */
const RARITY_COLORS: Record<RarityTier, string> = {
  common: '#9CA3AF',
  rare: '#3B82F6',
  epic: '#9333EA',
  legendary: '#F59E0B',
};

/**
 * Rarity glow colors for background effects
 */
const RARITY_GLOW: Record<RarityTier, string> = {
  common: 'rgba(156, 163, 175, 0.15)',
  rare: 'rgba(59, 130, 246, 0.2)',
  epic: 'rgba(147, 51, 234, 0.25)',
  legendary: 'rgba(245, 158, 11, 0.3)',
};

/**
 * Notification type icons
 */
const TYPE_ICONS: Record<NotificationType, string> = {
  achievement: '🏆',
  streak_milestone: '🔥',
  cosmetic_unlock: '✨',
};

/**
 * Confetti colors for celebration effects
 */
const CONFETTI_COLORS = [
  '#F59E0B', // Gold
  '#9333EA', // Purple
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F97316', // Orange
  '#EC4899', // Pink
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get category icon for achievements
 */
const getCategoryIcon = (category?: string): string => {
  switch (category) {
    case 'health_milestones':
      return '❤️';
    case 'streak_rewards':
      return '🔥';
    case 'challenge_completion':
      return '⚡';
    case 'exploration':
      return '🔍';
    case 'special_events':
      return '🎃';
    default:
      return '🏆';
  }
};

/**
 * Get display icon based on notification type and data
 */
const getNotificationIcon = (notification: AchievementNotification): string => {
  if (notification.type === 'achievement' && notification.data?.achievement) {
    return getCategoryIcon(notification.data.achievement.category);
  }
  return TYPE_ICONS[notification.type];
};

// ============================================================================
// Confetti Component
// ============================================================================

interface ConfettiProps {
  particles: ConfettiParticle[];
}

const Confetti: React.FC<ConfettiProps> = ({ particles }) => {
  return (
    <View style={styles.confettiContainer} pointerEvents="none">
      {particles.map(particle => (
        <Animated.View
          key={particle.id}
          style={[
            styles.confettiParticle,
            {
              backgroundColor: particle.color,
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                {
                  rotate: particle.rotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
                { scale: particle.scale },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

// ============================================================================
// NotificationToast Component
// ============================================================================

export const NotificationToast: React.FC<NotificationToastProps> = ({ style }) => {
  const [currentNotification, setCurrentNotification] = useState<AchievementNotification | null>(
    null
  );
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState<ConfettiParticle[]>([]);

  // Animation values
  const slideAnim = useRef(new Animated.Value(-150)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  /**
   * Create confetti particles for celebration effect
   */
  const createConfettiParticles = useCallback((): ConfettiParticle[] => {
    return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
      id: i,
      x: new Animated.Value(TOAST_WIDTH / 2),
      y: new Animated.Value(0),
      rotation: new Animated.Value(0),
      scale: new Animated.Value(1),
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    }));
  }, []);

  /**
   * Animate confetti particles
   */
  const animateConfetti = useCallback((particles: ConfettiParticle[]) => {
    const animations = particles.map(particle => {
      const randomX = (Math.random() - 0.5) * TOAST_WIDTH * 1.5;
      const randomY = Math.random() * 200 + 100;
      const randomRotation = Math.random() * 4;

      return Animated.parallel([
        Animated.timing(particle.x, {
          toValue: randomX,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(particle.y, {
          toValue: randomY,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(particle.rotation, {
          toValue: randomRotation,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(particle.scale, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(particle.scale, {
            toValue: 0,
            duration: 1300,
            useNativeDriver: true,
          }),
        ]),
      ]);
    });

    Animated.parallel(animations).start(() => {
      setShowConfetti(false);
    });
  }, []);

  /**
   * Show notification with entrance animation
   */
  const showNotification = useCallback(
    (notification: AchievementNotification) => {
      setCurrentNotification(notification);

      // Check if we should show confetti
      const shouldShowConfetti =
        notification.rarity === 'epic' ||
        notification.rarity === 'legendary' ||
        (notification.type === 'streak_milestone' &&
          notification.data?.milestone &&
          notification.data.milestone.days >= 30);

      if (shouldShowConfetti) {
        const particles = createConfettiParticles();
        setConfettiParticles(particles);
        setShowConfetti(true);
        // Delay confetti animation slightly
        setTimeout(() => animateConfetti(particles), 100);
      }

      // Reset animation values
      slideAnim.setValue(-150);
      opacityAnim.setValue(0);
      scaleAnim.setValue(0.8);
      glowAnim.setValue(0);

      // Entrance animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();

      // Glow animation for rare items
      if (notification.rarity === 'epic' || notification.rarity === 'legendary') {
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0.5,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    },
    [slideAnim, opacityAnim, scaleAnim, glowAnim, createConfettiParticles, animateConfetti]
  );

  /**
   * Hide notification with exit animation
   */
  const hideNotification = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -150,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentNotification(null);
      glowAnim.stopAnimation();
      glowAnim.setValue(0);
    });
  }, [slideAnim, opacityAnim, glowAnim]);

  /**
   * Handle manual dismiss
   */
  const handleDismiss = useCallback(() => {
    const service = getAchievementNotificationService();
    service.dismissCurrentNotification();
  }, []);

  /**
   * Subscribe to notification service
   */
  useEffect(() => {
    const service = getAchievementNotificationService();

    const unsubscribeNotification = service.addListener(notification => {
      showNotification(notification);
    });

    const unsubscribeDismiss = service.addDismissListener(() => {
      hideNotification();
    });

    return () => {
      unsubscribeNotification();
      unsubscribeDismiss();
    };
  }, [showNotification, hideNotification]);

  // Don't render if no notification
  if (!currentNotification) {
    return null;
  }

  const rarityColor = currentNotification.rarity
    ? RARITY_COLORS[currentNotification.rarity]
    : HALLOWEEN_COLORS.primary;
  const rarityGlow = currentNotification.rarity
    ? RARITY_GLOW[currentNotification.rarity]
    : 'transparent';
  const icon = getNotificationIcon(currentNotification);

  return (
    <View style={[styles.container, style]} pointerEvents="box-none">
      {showConfetti && <Confetti particles={confettiParticles} />}

      <Animated.View
        style={[
          styles.toast,
          {
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            opacity: opacityAnim,
            borderColor: rarityColor,
          },
        ]}>
        {/* Glow effect for rare notifications */}
        {(currentNotification.rarity === 'epic' || currentNotification.rarity === 'legendary') && (
          <Animated.View
            style={[styles.glowOverlay, { backgroundColor: rarityGlow, opacity: glowAnim }]}
          />
        )}

        <TouchableOpacity
          style={styles.toastContent}
          onPress={handleDismiss}
          activeOpacity={0.9}
          accessibilityRole="alert"
          accessibilityLabel={`${currentNotification.title}: ${currentNotification.message}`}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: rarityGlow }]}>
            <Text style={styles.icon}>{icon}</Text>
          </View>

          {/* Text content */}
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: rarityColor }]}>{currentNotification.title}</Text>
            <Text style={styles.message} numberOfLines={2}>
              {currentNotification.message}
            </Text>
          </View>

          {/* Rarity indicator */}
          {currentNotification.rarity && (
            <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
              <Text style={styles.rarityText}>
                {currentNotification.rarity.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Streak milestone celebration bar */}
        {currentNotification.type === 'streak_milestone' && (
          <View style={styles.celebrationBar}>
            <Text style={styles.celebrationText}>🎉 Keep up the great work! 🎉</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    width: TOAST_WIDTH,
    backgroundColor: HALLOWEEN_COLORS.cardBg,
    borderRadius: LAYOUT.cardBorderRadius,
    borderWidth: 2,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: LAYOUT.cardBorderRadius - 2,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: HALLOWEEN_COLORS.ghostWhite,
  },
  rarityBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  rarityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  celebrationBar: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingVertical: 6,
    alignItems: 'center',
  },
  celebrationText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    alignItems: 'center',
    overflow: 'visible',
  },
  confettiParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 2,
  },
});
