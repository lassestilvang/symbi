/**
 * ChallengeCard Component
 *
 * Displays an individual challenge with objective, progress,
 * reward preview, and time remaining.
 *
 * Requirements: 3.4
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import type { Challenge } from '../types';
import { HALLOWEEN_COLORS, LAYOUT } from '../constants/theme';

interface ChallengeCardProps {
  /** The challenge to display */
  challenge: Challenge;
  /** Optional custom styles */
  style?: ViewStyle;
}

/**
 * Get objective type icon
 */
const getObjectiveIcon = (type: string): string => {
  switch (type) {
    case 'steps':
      return '👟';
    case 'sleep':
      return '😴';
    case 'hrv':
      return '💓';
    case 'streak':
      return '🔥';
    case 'combined':
      return '⚡';
    default:
      return '🎯';
  }
};

/**
 * Get reward icon
 */
const getRewardIcon = (reward: Challenge['reward']): string => {
  if (reward.cosmeticId) return '🎁';
  if (reward.achievementId) return '🏆';
  if (reward.bonusXP) return '✨';
  return '🎯';
};

/**
 * Format time remaining
 */
const formatTimeRemaining = (endDate: string): string => {
  const end = new Date(endDate + 'T23:59:59.999Z');
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();

  if (diffMs <= 0) return 'Expired';

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h left`;
  return 'Less than 1h left';
};

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, style }) => {
  const progressPercentage = Math.min(
    100,
    Math.max(0, (challenge.progress / challenge.objective.target) * 100)
  );
  const isCompleted = challenge.completed;
  const objectiveIcon = getObjectiveIcon(challenge.objective.type);
  const rewardIcon = getRewardIcon(challenge.reward);
  const timeRemaining = formatTimeRemaining(challenge.endDate);

  return (
    <View style={[styles.container, isCompleted && styles.completedContainer, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.objectiveIcon}>{objectiveIcon}</Text>
        <View style={styles.headerInfo}>
          <Text style={[styles.title, isCompleted && styles.completedText]}>{challenge.title}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {challenge.description}
          </Text>
        </View>
        {isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>✓</Text>
          </View>
        )}
      </View>

      {/* Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${progressPercentage}%`,
                backgroundColor: isCompleted ? HALLOWEEN_COLORS.green : HALLOWEEN_COLORS.primary,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {challenge.progress} / {challenge.objective.target} {challenge.objective.unit}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {/* Reward */}
        <View style={styles.rewardContainer}>
          <Text style={styles.rewardIcon}>{rewardIcon}</Text>
          <Text style={styles.rewardText}>
            {challenge.reward.bonusXP ? `+${challenge.reward.bonusXP} XP` : 'Reward'}
          </Text>
        </View>

        {/* Time remaining */}
        <Text style={[styles.timeRemaining, isCompleted && styles.completedTimeText]}>
          {isCompleted ? 'Completed!' : timeRemaining}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: HALLOWEEN_COLORS.cardBg,
    borderRadius: LAYOUT.cardBorderRadius,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  completedContainer: {
    borderColor: HALLOWEEN_COLORS.green,
    opacity: 0.9,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  objectiveIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: HALLOWEEN_COLORS.ghostWhite,
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  description: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: HALLOWEEN_COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  completedBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: LAYOUT.progressBarRadius,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: '100%',
    borderRadius: LAYOUT.progressBarRadius,
  },
  progressText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HALLOWEEN_COLORS.darkBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  rewardIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '600',
    color: HALLOWEEN_COLORS.primaryLight,
  },
  timeRemaining: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  completedTimeText: {
    color: HALLOWEEN_COLORS.green,
    fontWeight: '600',
  },
});
