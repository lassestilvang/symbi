/**
 * AchievementBadge Component
 *
 * Displays an individual achievement badge with rarity indicators.
 * Shows locked state with silhouette for unearned achievements.
 *
 * Requirements: 1.3, 7.2
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import type { Achievement, RarityTier } from '../types';
import { HALLOWEEN_COLORS } from '../constants/theme';

interface AchievementBadgeProps {
  /** The achievement to display */
  achievement: Achievement;
  /** Whether the achievement is earned/unlocked */
  isEarned: boolean;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Optional custom styles */
  style?: ViewStyle;
}

/**
 * Rarity color mapping
 */
const RARITY_COLORS: Record<RarityTier, string> = {
  common: '#9CA3AF',
  rare: '#3B82F6',
  epic: '#9333EA',
  legendary: '#F59E0B',
};

/**
 * Rarity glow colors
 */
const RARITY_GLOW: Record<RarityTier, string> = {
  common: 'rgba(156, 163, 175, 0.2)',
  rare: 'rgba(59, 130, 246, 0.3)',
  epic: 'rgba(147, 51, 234, 0.4)',
  legendary: 'rgba(245, 158, 11, 0.5)',
};

/**
 * Size configurations
 */
const SIZE_CONFIG = {
  small: { container: 60, icon: 24, name: 10, badge: 6 },
  medium: { container: 80, icon: 32, name: 11, badge: 8 },
  large: { container: 100, icon: 40, name: 13, badge: 10 },
};

/**
 * Get category icon for achievement
 */
const getCategoryIcon = (category: string): string => {
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

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  isEarned,
  size = 'medium',
  style,
}) => {
  const rarityColor = RARITY_COLORS[achievement.rarity];
  const rarityGlow = RARITY_GLOW[achievement.rarity];
  const sizeConfig = SIZE_CONFIG[size];

  const containerStyle = useMemo(() => {
    const baseStyle: ViewStyle[] = [
      styles.container,
      {
        width: sizeConfig.container,
        height: sizeConfig.container + 24,
        borderColor: isEarned ? rarityColor : '#374151',
      },
    ];

    if (!isEarned) {
      baseStyle.push(styles.locked);
    }

    return baseStyle;
  }, [isEarned, rarityColor, sizeConfig.container]);

  return (
    <View style={[...containerStyle, style]}>
      {/* Glow effect for earned badges */}
      {isEarned && (
        <View
          style={[
            styles.glowEffect,
            {
              backgroundColor: rarityGlow,
              width: sizeConfig.container - 4,
              height: sizeConfig.container - 4,
            },
          ]}
        />
      )}

      {/* Badge icon */}
      <View
        style={[
          styles.iconContainer,
          {
            width: sizeConfig.container - 16,
            height: sizeConfig.container - 16,
          },
          !isEarned && styles.lockedIcon,
        ]}>
        <Text style={[styles.icon, { fontSize: sizeConfig.icon }]}>
          {isEarned ? getCategoryIcon(achievement.category) : '🔒'}
        </Text>
      </View>

      {/* Achievement name */}
      <Text
        style={[styles.name, { fontSize: sizeConfig.name }, !isEarned && styles.lockedText]}
        numberOfLines={2}
        ellipsizeMode="tail">
        {isEarned ? achievement.name : '???'}
      </Text>

      {/* Rarity badge */}
      <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
        <Text style={[styles.rarityText, { fontSize: sizeConfig.badge }]}>
          {achievement.rarity.charAt(0).toUpperCase()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: HALLOWEEN_COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 2,
    padding: 8,
    position: 'relative',
  },
  locked: {
    opacity: 0.6,
  },
  glowEffect: {
    position: 'absolute',
    top: 2,
    borderRadius: 10,
  },
  iconContainer: {
    borderRadius: 999,
    backgroundColor: HALLOWEEN_COLORS.darkBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  lockedIcon: {
    backgroundColor: '#374151',
  },
  icon: {
    textAlign: 'center',
  },
  name: {
    fontWeight: '600',
    color: HALLOWEEN_COLORS.ghostWhite,
    textAlign: 'center',
    lineHeight: 14,
  },
  lockedText: {
    color: '#6B7280',
  },
  rarityBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rarityText: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
