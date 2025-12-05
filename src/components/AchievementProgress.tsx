/**
 * AchievementProgress Component
 *
 * Displays progress bars for incomplete achievements.
 * Shows current progress, target, and percentage.
 *
 * Requirements: 1.4, 7.2
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import type { AchievementProgress as AchievementProgressType } from '../types';
import { HALLOWEEN_COLORS, LAYOUT } from '../constants/theme';

interface AchievementProgressProps {
  /** Progress data */
  progress: AchievementProgressType;
  /** Whether to show the text label */
  showLabel?: boolean;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Optional custom styles */
  style?: ViewStyle;
}

/**
 * Size configurations
 */
const SIZE_CONFIG = {
  small: { height: 4, fontSize: 10, padding: 4 },
  medium: { height: 6, fontSize: 11, padding: 6 },
  large: { height: 8, fontSize: 12, padding: 8 },
};

/**
 * Get progress bar color based on percentage
 */
const getProgressColor = (percentage: number): string => {
  if (percentage >= 75) return HALLOWEEN_COLORS.green;
  if (percentage >= 50) return '#F59E0B';
  if (percentage >= 25) return HALLOWEEN_COLORS.orange;
  return HALLOWEEN_COLORS.primary;
};

export const AchievementProgress: React.FC<AchievementProgressProps> = ({
  progress,
  showLabel = true,
  size = 'small',
  style,
}) => {
  const sizeConfig = SIZE_CONFIG[size];
  const progressColor = getProgressColor(progress.percentage);
  const progressWidth = `${Math.min(100, Math.max(0, progress.percentage))}%`;

  return (
    <View style={[styles.container, { padding: sizeConfig.padding }, style]}>
      {/* Progress bar */}
      <View style={[styles.progressBarContainer, { height: sizeConfig.height }]}>
        <View
          style={[
            styles.progressBar,
            {
              width: progressWidth,
              backgroundColor: progressColor,
              height: sizeConfig.height,
            },
          ]}
        />
      </View>

      {/* Label */}
      {showLabel && (
        <Text style={[styles.label, { fontSize: sizeConfig.fontSize }]}>
          {progress.current}/{progress.target} ({progress.percentage}%)
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  progressBarContainer: {
    width: '100%',
    backgroundColor: '#374151',
    borderRadius: LAYOUT.progressBarRadius,
    overflow: 'hidden',
  },
  progressBar: {
    borderRadius: LAYOUT.progressBarRadius,
  },
  label: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
});
