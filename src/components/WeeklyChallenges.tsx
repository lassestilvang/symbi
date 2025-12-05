/**
 * WeeklyChallenges Component
 *
 * Displays the list of weekly challenges with progress and time remaining.
 * Shows empty state when no challenges are available.
 *
 * Requirements: 3.4
 */

import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import type { Challenge } from '../types';
import { ChallengeCard } from './ChallengeCard';
import { getChallengeService } from '../services/ChallengeService';
import { HALLOWEEN_COLORS, LAYOUT } from '../constants/theme';

interface WeeklyChallengesProps {
  /** Optional custom styles */
  style?: ViewStyle;
}

export const WeeklyChallenges: React.FC<WeeklyChallengesProps> = ({ style }) => {
  const [challenges, setChallenges] = React.useState<Challenge[]>([]);
  const [timeRemaining, setTimeRemaining] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(true);

  // Load challenges on mount
  useEffect(() => {
    const loadChallenges = async () => {
      try {
        const service = getChallengeService();
        await service.initialize();

        let activeChallenges = service.getActiveChallenges();

        // Generate new challenges if none exist
        if (activeChallenges.length === 0) {
          // Generate with empty history (will use defaults)
          activeChallenges = service.generateWeeklyChallenges([]);
        }

        setChallenges(activeChallenges);
        setTimeRemaining(service.getTimeRemainingFormatted());
      } catch (error) {
        console.error('[WeeklyChallenges] Error loading challenges:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChallenges();
  }, []);

  // Update time remaining periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const service = getChallengeService();
      setTimeRemaining(service.getTimeRemainingFormatted());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Calculate completion stats
  const stats = useMemo(() => {
    const total = challenges.length;
    const completed = challenges.filter(c => c.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }, [challenges]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <ActivityIndicator size="large" color={HALLOWEEN_COLORS.primary} />
        <Text style={styles.loadingText}>Loading challenges...</Text>
      </View>
    );
  }

  if (challenges.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer, style]}>
        <Text style={styles.emptyIcon}>⚡</Text>
        <Text style={styles.emptyText}>No challenges available</Text>
        <Text style={styles.emptySubtext}>Check back next week for new challenges!</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>⚡ Weekly Challenges</Text>
          <Text style={styles.timeRemaining}>{timeRemaining}</Text>
        </View>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {stats.completed}/{stats.total}
          </Text>
          <Text style={styles.statsLabel}>completed</Text>
        </View>
      </View>

      {/* Progress overview */}
      <View style={styles.overviewContainer}>
        <View style={styles.overviewProgressBar}>
          <View style={[styles.overviewProgress, { width: `${stats.percentage}%` }]} />
        </View>
        <Text style={styles.overviewText}>{stats.percentage}% complete</Text>
      </View>

      {/* Challenge list */}
      <View style={styles.challengeList}>
        {challenges.map(challenge => (
          <ChallengeCard key={challenge.id} challenge={challenge} style={styles.challengeCard} />
        ))}
      </View>

      {/* Bonus message */}
      {stats.completed === stats.total && stats.total > 0 && (
        <View style={styles.bonusContainer}>
          <Text style={styles.bonusIcon}>🎉</Text>
          <Text style={styles.bonusText}>
            All challenges completed! Bonus achievement unlocked!
          </Text>
        </View>
      )}

      {stats.completed < stats.total && stats.completed > 0 && (
        <View style={styles.encouragementContainer}>
          <Text style={styles.encouragementText}>
            Complete all challenges for a bonus achievement! 🏆
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: LAYOUT.horizontalPadding,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#9CA3AF',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.ghostWhite,
    marginBottom: 4,
  },
  timeRemaining: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  statsContainer: {
    alignItems: 'center',
    backgroundColor: HALLOWEEN_COLORS.cardBg,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.primaryLight,
  },
  statsLabel: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  overviewContainer: {
    marginBottom: 16,
  },
  overviewProgressBar: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: LAYOUT.progressBarRadius,
    overflow: 'hidden',
    marginBottom: 4,
  },
  overviewProgress: {
    height: '100%',
    backgroundColor: HALLOWEEN_COLORS.green,
    borderRadius: LAYOUT.progressBarRadius,
  },
  overviewText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  challengeList: {
    gap: 12,
  },
  challengeCard: {
    marginBottom: 12,
  },
  bonusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HALLOWEEN_COLORS.green + '20',
    borderRadius: LAYOUT.cardBorderRadius,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: HALLOWEEN_COLORS.green,
  },
  bonusIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  bonusText: {
    fontSize: 14,
    fontWeight: '600',
    color: HALLOWEEN_COLORS.green,
    flex: 1,
  },
  encouragementContainer: {
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: HALLOWEEN_COLORS.cardBg,
    borderRadius: LAYOUT.cardBorderRadius,
  },
  encouragementText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
