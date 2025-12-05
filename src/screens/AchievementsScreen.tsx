/**
 * AchievementsScreen
 *
 * Displays earned badges organized by category, achievement progress,
 * and statistics (total earned, completion percentage, rarest badge).
 *
 * Requirements: 1.3, 1.4, 7.1, 7.2
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import type { Achievement, AchievementCategory, RarityTier } from '../types';
import { useAchievementStore } from '../stores/achievementStore';
import { useStreakStore } from '../stores/streakStore';
import { AchievementBadge } from '../components/AchievementBadge';
import { AchievementProgress } from '../components/AchievementProgress';
import { AchievementTimeline } from '../components/AchievementTimeline';
import { StreakDisplay } from '../components/StreakDisplay';
import { StreakMilestoneProgress } from '../components/StreakMilestoneProgress';
import { WeeklyChallenges } from '../components/WeeklyChallenges';
import { HALLOWEEN_COLORS, LAYOUT } from '../constants/theme';

interface AchievementsScreenProps {
  navigation: {
    goBack: () => void;
  };
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Category tabs configuration
 */
const CATEGORY_TABS: { key: AchievementCategory | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: '🏆' },
  { key: 'health_milestones', label: 'Health', icon: '❤️' },
  { key: 'streak_rewards', label: 'Streaks', icon: '🔥' },
  { key: 'challenge_completion', label: 'Challenges', icon: '⚡' },
  { key: 'exploration', label: 'Explore', icon: '🔍' },
  { key: 'special_events', label: 'Special', icon: '🎃' },
];

/**
 * Filter options for status
 */
const STATUS_FILTERS: { key: 'all' | 'earned' | 'locked'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'earned', label: 'Earned' },
  { key: 'locked', label: 'Locked' },
];

/**
 * View mode options
 */
type ViewMode = 'badges' | 'timeline' | 'challenges';

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ navigation }) => {
  // Achievement store state
  const {
    achievements,
    statistics,
    isInitialized: achievementsInitialized,
    isLoading: achievementsLoading,
    initialize: initializeAchievements,
    filterAchievements,
  } = useAchievementStore();

  // Streak store state
  const {
    currentStreak,
    longestStreak,
    nextMilestone,
    daysUntilMilestone,
    isInitialized: streakInitialized,
    initialize: initializeStreak,
  } = useStreakStore();

  // Local state
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'earned' | 'locked'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('badges');

  // Initialize stores on mount
  useEffect(() => {
    if (!achievementsInitialized) {
      initializeAchievements();
    }
    if (!streakInitialized) {
      initializeStreak();
    }
  }, [achievementsInitialized, streakInitialized, initializeAchievements, initializeStreak]);

  // Filter achievements based on current filters
  const filteredAchievements = useMemo(() => {
    const options: {
      category?: AchievementCategory;
      status?: 'earned' | 'locked' | 'all';
      rarity?: RarityTier;
    } = {};

    if (activeCategory !== 'all') {
      options.category = activeCategory;
    }
    if (statusFilter !== 'all') {
      options.status = statusFilter;
    }

    return filterAchievements(options);
  }, [activeCategory, statusFilter, filterAchievements]);

  // Handle category tab press
  const handleCategoryPress = useCallback((category: AchievementCategory | 'all') => {
    setActiveCategory(category);
  }, []);

  // Handle status filter press
  const handleStatusFilterPress = useCallback((status: 'all' | 'earned' | 'locked') => {
    setStatusFilter(status);
  }, []);

  // Handle view mode change
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  const isLoading = !achievementsInitialized || !streakInitialized || achievementsLoading;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={HALLOWEEN_COLORS.primary} />
        <Text style={styles.loadingText}>Loading Achievements...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Achievements</Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Statistics Section */}
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{statistics.totalEarned}</Text>
              <Text style={styles.statLabel}>Earned</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{statistics.completionPercentage}%</Text>
              <Text style={styles.statLabel}>Complete</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{statistics.totalAvailable}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>

          {/* Rarest Badge */}
          {statistics.rarestBadge && (
            <View style={styles.rarestBadgeContainer}>
              <Text style={styles.rarestLabel}>🏅 Rarest Badge</Text>
              <View style={styles.rarestBadge}>
                <Text style={styles.rarestName}>{statistics.rarestBadge.name}</Text>
                <Text style={styles.rarestRarity}>
                  {statistics.rarestBadge.rarity.toUpperCase()}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Streak Section */}
        <View style={styles.streakSection}>
          <Text style={styles.sectionTitle}>🔥 Daily Streak</Text>
          <StreakDisplay currentStreak={currentStreak} longestStreak={longestStreak} />
          {nextMilestone && (
            <StreakMilestoneProgress
              currentStreak={currentStreak}
              nextMilestone={nextMilestone}
              daysUntilMilestone={daysUntilMilestone}
            />
          )}
        </View>

        {/* View Mode Tabs */}
        <View style={styles.viewModeTabs}>
          <TouchableOpacity
            style={[styles.viewModeTab, viewMode === 'badges' && styles.activeViewModeTab]}
            onPress={() => handleViewModeChange('badges')}>
            <Text
              style={[
                styles.viewModeTabText,
                viewMode === 'badges' && styles.activeViewModeTabText,
              ]}>
              🏆 Badges
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeTab, viewMode === 'timeline' && styles.activeViewModeTab]}
            onPress={() => handleViewModeChange('timeline')}>
            <Text
              style={[
                styles.viewModeTabText,
                viewMode === 'timeline' && styles.activeViewModeTabText,
              ]}>
              📅 Timeline
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeTab, viewMode === 'challenges' && styles.activeViewModeTab]}
            onPress={() => handleViewModeChange('challenges')}>
            <Text
              style={[
                styles.viewModeTabText,
                viewMode === 'challenges' && styles.activeViewModeTabText,
              ]}>
              ⚡ Challenges
            </Text>
          </TouchableOpacity>
        </View>

        {/* Badges View */}
        {viewMode === 'badges' && (
          <>
            {/* Category Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryTabsContainer}
              contentContainerStyle={styles.categoryTabsContent}>
              {CATEGORY_TABS.map(cat => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.categoryTab,
                    activeCategory === cat.key && styles.activeCategoryTab,
                  ]}
                  onPress={() => handleCategoryPress(cat.key)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: activeCategory === cat.key }}>
                  <Text style={styles.categoryTabIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.categoryTabLabel,
                      activeCategory === cat.key && styles.activeCategoryTabLabel,
                    ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Status Filter */}
            <View style={styles.statusFilterContainer}>
              {STATUS_FILTERS.map(filter => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.statusFilterButton,
                    statusFilter === filter.key && styles.activeStatusFilter,
                  ]}
                  onPress={() => handleStatusFilterPress(filter.key)}>
                  <Text
                    style={[
                      styles.statusFilterText,
                      statusFilter === filter.key && styles.activeStatusFilterText,
                    ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Achievement Grid */}
            <View style={styles.achievementGrid}>
              {filteredAchievements.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateIcon}>🎯</Text>
                  <Text style={styles.emptyStateText}>No achievements found</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Try changing your filters or keep working toward your goals!
                  </Text>
                </View>
              ) : (
                filteredAchievements.map(achievement => (
                  <View key={achievement.id} style={styles.achievementItem}>
                    <AchievementBadge
                      achievement={achievement}
                      isEarned={achievement.unlockedAt !== undefined}
                      size="medium"
                    />
                    {achievement.progress && achievement.progress.percentage < 100 && (
                      <AchievementProgress progress={achievement.progress} />
                    )}
                  </View>
                ))
              )}
            </View>
          </>
        )}

        {/* Timeline View */}
        {viewMode === 'timeline' && <AchievementTimeline achievements={achievements} />}

        {/* Challenges View */}
        {viewMode === 'challenges' && <WeeklyChallenges />}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HALLOWEEN_COLORS.darkBg,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: HALLOWEEN_COLORS.darkBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: HALLOWEEN_COLORS.ghostWhite,
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  header: {
    width: '100%',
    maxWidth: LAYOUT.maxContentWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.horizontalPadding,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 28,
    color: HALLOWEEN_COLORS.primaryLight,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.primaryLight,
  },
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  statsSection: {
    padding: LAYOUT.horizontalPadding,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: HALLOWEEN_COLORS.cardBg,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: LAYOUT.cardBorderRadius,
    minWidth: 90,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.primaryLight,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  rarestBadgeContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  rarestLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  rarestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HALLOWEEN_COLORS.cardBg,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  rarestName: {
    fontSize: 14,
    fontWeight: '600',
    color: HALLOWEEN_COLORS.ghostWhite,
    marginRight: 8,
  },
  rarestRarity: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  streakSection: {
    padding: LAYOUT.horizontalPadding,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.ghostWhite,
    marginBottom: 12,
  },
  viewModeTabs: {
    flexDirection: 'row',
    paddingHorizontal: LAYOUT.horizontalPadding,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  viewModeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: HALLOWEEN_COLORS.cardBg,
  },
  activeViewModeTab: {
    backgroundColor: HALLOWEEN_COLORS.primary,
  },
  viewModeTabText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  activeViewModeTabText: {
    color: HALLOWEEN_COLORS.ghostWhite,
    fontWeight: 'bold',
  },
  categoryTabsContainer: {
    maxHeight: 50,
  },
  categoryTabsContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: HALLOWEEN_COLORS.cardBg,
  },
  activeCategoryTab: {
    backgroundColor: HALLOWEEN_COLORS.primary,
  },
  categoryTabIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryTabLabel: {
    fontSize: 13,
    color: HALLOWEEN_COLORS.ghostWhite,
  },
  activeCategoryTabLabel: {
    fontWeight: 'bold',
  },
  statusFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: LAYOUT.horizontalPadding,
    paddingVertical: 8,
  },
  statusFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: HALLOWEEN_COLORS.cardBg,
    borderWidth: 1,
    borderColor: '#374151',
  },
  activeStatusFilter: {
    backgroundColor: HALLOWEEN_COLORS.primaryDark,
    borderColor: HALLOWEEN_COLORS.primary,
  },
  statusFilterText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  activeStatusFilterText: {
    color: HALLOWEEN_COLORS.ghostWhite,
    fontWeight: '600',
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: LAYOUT.horizontalPadding,
    justifyContent: 'flex-start',
  },
  achievementItem: {
    width: (SCREEN_WIDTH - LAYOUT.horizontalPadding * 2 - 24) / 3,
    marginRight: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: HALLOWEEN_COLORS.ghostWhite,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
