/**
 * StreakDisplay Component
 *
 * Displays current streak and longest streak information.
 * Shows streak count with visual fire indicator.
 *
 * Requirements: 2.4
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { HALLOWEEN_COLORS, LAYOUT } from '../constants/theme';

interface StreakDisplayProps {
  /** Current streak count */
  currentStreak: number;
  /** Longest streak ever achieved */
  longestStreak: number;
  /** Optional custom styles */
  style?: ViewStyle;
}

/**
 * Get fire intensity based on streak length
 */
const getFireEmoji = (streak: number): string => {
  if (streak >= 90) return '🔥🔥🔥';
  if (streak >= 30) return '🔥🔥';
  if (streak >= 7) return '🔥';
  if (streak > 0) return '✨';
  return '💤';
};

/**
 * Get streak status text
 */
const getStreakStatus = (streak: number): string => {
  if (streak >= 90) return 'Legendary!';
  if (streak >= 60) return 'Amazing!';
  if (streak >= 30) return 'On Fire!';
  if (streak >= 14) return 'Great!';
  if (streak >= 7) return 'Nice!';
  if (streak > 0) return 'Keep going!';
  return 'Start your streak!';
};

/**
 * Get streak color based on length
 */
const getStreakColor = (streak: number): string => {
  if (streak >= 90) return '#F59E0B';
  if (streak >= 30) return HALLOWEEN_COLORS.orange;
  if (streak >= 7) return HALLOWEEN_COLORS.green;
  if (streak > 0) return HALLOWEEN_COLORS.primary;
  return '#6B7280';
};

export const StreakDisplay: React.FC<StreakDisplayProps> = ({
  currentStreak,
  longestStreak,
  style,
}) => {
  const fireEmoji = getFireEmoji(currentStreak);
  const streakStatus = getStreakStatus(currentStreak);
  const streakColor = getStreakColor(currentStreak);

  return (
    <View style={[styles.container, style]}>
      {/* Current Streak */}
      <View style={styles.currentStreakContainer}>
        <Text style={styles.fireEmoji}>{fireEmoji}</Text>
        <View style={styles.streakInfo}>
          <Text style={[styles.streakCount, { color: streakColor }]}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>day streak</Text>
        </View>
        <Text style={[styles.streakStatus, { color: streakColor }]}>{streakStatus}</Text>
      </View>

      {/* Longest Streak */}
      <View style={styles.longestStreakContainer}>
        <Text style={styles.longestLabel}>🏆 Personal Best</Text>
        <Text style={styles.longestValue}>{longestStreak} days</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(22, 33, 62, 0.9)',
    borderRadius: LAYOUT.cardBorderRadius,
    padding: 16,
  },
  currentStreakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fireEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  streakInfo: {
    flex: 1,
  },
  streakCount: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  streakLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: -4,
  },
  streakStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  longestStreakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  longestLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  longestValue: {
    fontSize: 16,
    fontWeight: '600',
    color: HALLOWEEN_COLORS.ghostWhite,
  },
});
