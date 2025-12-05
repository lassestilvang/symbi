/**
 * StreakMilestoneProgress Component
 *
 * Displays progress toward the next streak milestone.
 * Shows days until milestone with visual progress bar.
 *
 * Requirements: 2.4
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import type { StreakMilestone } from '../types';
import { HALLOWEEN_COLORS, LAYOUT } from '../constants/theme';

interface StreakMilestoneProgressProps {
  /** Current streak count */
  currentStreak: number;
  /** Next milestone to reach */
  nextMilestone: StreakMilestone;
  /** Days until next milestone */
  daysUntilMilestone: number;
  /** Optional custom styles */
  style?: ViewStyle;
}

/**
 * Get milestone name based on days
 */
const getMilestoneName = (days: number): string => {
  switch (days) {
    case 7:
      return 'Week Warrior';
    case 14:
      return 'Fortnight Fighter';
    case 30:
      return 'Monthly Master';
    case 60:
      return 'Dedication Champion';
    case 90:
      return 'Legendary Dedication';
    default:
      return `${days}-Day Streak`;
  }
};

/**
 * Get milestone icon based on days
 */
const getMilestoneIcon = (days: number): string => {
  switch (days) {
    case 7:
      return '🌟';
    case 14:
      return '⭐';
    case 30:
      return '🏅';
    case 60:
      return '🎖️';
    case 90:
      return '👑';
    default:
      return '🎯';
  }
};

export const StreakMilestoneProgress: React.FC<StreakMilestoneProgressProps> = ({
  currentStreak,
  nextMilestone,
  daysUntilMilestone,
  style,
}) => {
  // Calculate progress percentage
  const previousMilestoneDay = getPreviousMilestoneDay(nextMilestone.days);
  const progressRange = nextMilestone.days - previousMilestoneDay;
  const currentProgress = currentStreak - previousMilestoneDay;
  const progressPercentage = Math.min(100, Math.max(0, (currentProgress / progressRange) * 100));

  const milestoneName = getMilestoneName(nextMilestone.days);
  const milestoneIcon = getMilestoneIcon(nextMilestone.days);

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>{milestoneIcon}</Text>
        <View style={styles.headerInfo}>
          <Text style={styles.milestoneName}>{milestoneName}</Text>
          <Text style={styles.milestoneTarget}>{nextMilestone.days} days</Text>
        </View>
        <View style={styles.daysRemaining}>
          <Text style={styles.daysRemainingValue}>{daysUntilMilestone}</Text>
          <Text style={styles.daysRemainingLabel}>days left</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
      </View>

      {/* Progress labels */}
      <View style={styles.progressLabels}>
        <Text style={styles.progressLabel}>{previousMilestoneDay} days</Text>
        <Text style={styles.progressLabel}>{nextMilestone.days} days</Text>
      </View>

      {/* Encouragement text */}
      <Text style={styles.encouragement}>{getEncouragementText(daysUntilMilestone)}</Text>
    </View>
  );
};

/**
 * Get the previous milestone day count
 */
function getPreviousMilestoneDay(nextMilestoneDays: number): number {
  const milestones = [0, 7, 14, 30, 60, 90];
  const index = milestones.indexOf(nextMilestoneDays);
  return index > 0 ? milestones[index - 1] : 0;
}

/**
 * Get encouragement text based on days remaining
 */
function getEncouragementText(daysRemaining: number): string {
  if (daysRemaining === 1) return 'Almost there! Just one more day! 🎉';
  if (daysRemaining <= 3) return 'So close! Keep pushing! 💪';
  if (daysRemaining <= 7) return "You're making great progress! 🌟";
  return "Stay consistent and you'll get there! ✨";
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: HALLOWEEN_COLORS.cardBg,
    borderRadius: LAYOUT.cardBorderRadius,
    padding: 16,
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  milestoneName: {
    fontSize: 16,
    fontWeight: '600',
    color: HALLOWEEN_COLORS.ghostWhite,
  },
  milestoneTarget: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  daysRemaining: {
    alignItems: 'center',
    backgroundColor: HALLOWEEN_COLORS.darkBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  daysRemainingValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.primaryLight,
  },
  daysRemainingLabel: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: LAYOUT.progressBarRadius,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: HALLOWEEN_COLORS.orange,
    borderRadius: LAYOUT.progressBarRadius,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  encouragement: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});
