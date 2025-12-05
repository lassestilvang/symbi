/**
 * AchievementTimeline Component
 *
 * Displays a timeline view of earned achievements with dates.
 * Shows achievements in chronological order.
 *
 * Requirements: 7.2
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import type { Achievement, RarityTier } from '../types';
import { HALLOWEEN_COLORS, LAYOUT } from '../constants/theme';

interface AchievementTimelineProps {
  /** All achievements (will filter to earned only) */
  achievements: Achievement[];
  /** Maximum number of items to show */
  maxItems?: number;
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

/**
 * Format date for display
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

export const AchievementTimeline: React.FC<AchievementTimelineProps> = ({
  achievements,
  maxItems = 20,
  style,
}) => {
  // Filter to earned achievements and sort by date (newest first)
  const earnedAchievements = useMemo(() => {
    return achievements
      .filter(a => a.unlockedAt !== undefined)
      .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
      .slice(0, maxItems);
  }, [achievements, maxItems]);

  if (earnedAchievements.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer, style]}>
        <Text style={styles.emptyIcon}>📅</Text>
        <Text style={styles.emptyText}>No achievements yet</Text>
        <Text style={styles.emptySubtext}>
          Complete milestones to see your achievement timeline!
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Achievement History</Text>

      {earnedAchievements.map((achievement, index) => {
        const rarityColor = RARITY_COLORS[achievement.rarity];
        const isLast = index === earnedAchievements.length - 1;

        return (
          <View key={achievement.id} style={styles.timelineItem}>
            {/* Timeline connector */}
            <View style={styles.timelineConnector}>
              <View style={[styles.timelineDot, { backgroundColor: rarityColor }]} />
              {!isLast && <View style={styles.timelineLine} />}
            </View>

            {/* Achievement content */}
            <View style={styles.timelineContent}>
              <View style={styles.achievementHeader}>
                <Text style={styles.achievementIcon}>{getCategoryIcon(achievement.category)}</Text>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementName}>{achievement.name}</Text>
                  <Text style={styles.achievementDescription} numberOfLines={1}>
                    {achievement.description}
                  </Text>
                </View>
                <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
                  <Text style={styles.rarityText}>{achievement.rarity.toUpperCase()}</Text>
                </View>
              </View>

              <Text style={styles.achievementDate}>
                {achievement.unlockedAt ? formatDate(achievement.unlockedAt) : 'Unknown'}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: LAYOUT.horizontalPadding,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: HALLOWEEN_COLORS.ghostWhite,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.ghostWhite,
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineConnector: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#374151',
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: HALLOWEEN_COLORS.cardBg,
    borderRadius: LAYOUT.cardBorderRadius,
    padding: 12,
    marginLeft: 8,
    marginBottom: 12,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '600',
    color: HALLOWEEN_COLORS.ghostWhite,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  rarityText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  achievementDate: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 8,
  },
});
