import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScaledSize,
  AccessibilityInfo,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  HistoricalDataPoint,
  HistoryStatistics,
  EvolutionRecord,
  HealthDataCache,
  EmotionalState,
} from '../types';
import { StorageService } from '../services/StorageService';
import { StatisticsCard } from '../components/StatisticsCard';
import { HealthMetricsChart } from '../components/HealthMetricsChart';
import { EmotionalStateTimeline } from '../components/EmotionalStateTimeline';
import { EvolutionMilestoneCard } from '../components/EvolutionMilestoneCard';
import { HealthDataTable } from '../components/HealthDataTable';

// Debounce utility for performance optimization
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

interface EvolutionHistoryScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}

type TimeRange = '7d' | '30d' | '90d' | 'all';

const HALLOWEEN_COLORS = {
  primary: '#7C3AED',
  primaryDark: '#5B21B6',
  primaryLight: '#9333EA',
  orange: '#F97316',
  green: '#10B981',
  darkBg: '#1a1a2e',
  cardBg: '#16213e',
  ghostWhite: '#F3F4F6',
};

const TIME_RANGE_STORAGE_KEY = '@symbi:history_time_range';

// Layout constants
const CARD_GAP = 12;
const HORIZONTAL_PADDING = 32;
const LANDSCAPE_COLUMNS = 4;
const PORTRAIT_COLUMNS = 2;
const SCROLL_RESTORE_DELAY = 100;

// Time range constants
const TIME_RANGES = {
  SEVEN_DAYS: 7,
  THIRTY_DAYS: 30,
  NINETY_DAYS: 90,
  ALL_TIME_LIMIT: 90, // Limit "All Time" view to 90 days for performance
} as const;

// Debounce delay for chart updates (ms)
const CHART_UPDATE_DEBOUNCE = 300;

/**
 * Get human-readable label for time range
 */
const getTimeRangeLabel = (range: TimeRange): string => {
  switch (range) {
    case '7d':
      return '7 days';
    case '30d':
      return '30 days';
    case '90d':
      return '90 days';
    case 'all':
      return 'all time';
    default:
      return 'unknown';
  }
};

/**
 * Get badge icon for evolution milestone
 */
const getEvolutionBadgeIcon = (
  index: number
): 'tombstone' | 'jack-o-lantern' | 'crystal-ball' | 'cauldron' => {
  const badges: Array<'tombstone' | 'jack-o-lantern' | 'crystal-ball' | 'cauldron'> = [
    'tombstone',
    'jack-o-lantern',
    'crystal-ball',
    'cauldron',
  ];
  return badges[index % badges.length];
};

/**
 * Capitalize first letter of string
 */
const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Transform HealthDataCache to HistoricalDataPoint[]
 */
const transformCacheToDataPoints = (
  cache: Record<string, HealthDataCache>
): HistoricalDataPoint[] => {
  return Object.entries(cache)
    .map(([date, data]) => ({
      date,
      steps: data.steps,
      sleepHours: data.sleepHours,
      hrv: data.hrv,
      emotionalState: data.emotionalState,
      calculationMethod: data.calculationMethod,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Filter data by time range with pagination for "All Time" view
 */
const filterDataByTimeRange = (
  data: HistoricalDataPoint[],
  range: TimeRange
): HistoricalDataPoint[] => {
  const now = new Date();
  let days: number;

  if (range === 'all') {
    // Limit "All Time" to 90 days for performance (pagination)
    days = TIME_RANGES.ALL_TIME_LIMIT;
  } else {
    days =
      range === '7d'
        ? TIME_RANGES.SEVEN_DAYS
        : range === '30d'
          ? TIME_RANGES.THIRTY_DAYS
          : TIME_RANGES.NINETY_DAYS;
  }

  const cutoffDate = new Date(now);
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return data.filter(point => {
    const pointDate = new Date(point.date);
    return pointDate >= cutoffDate;
  });
};

/**
 * Calculate statistics for the given data
 */
const calculateStatistics = (
  data: HistoricalDataPoint[],
  evolutionRecords: EvolutionRecord[]
): HistoryStatistics => {
  if (data.length === 0) {
    return {
      averageSteps: 0,
      averageSleep: null,
      averageHRV: null,
      mostFrequentState: EmotionalState.RESTING,
      totalEvolutions: evolutionRecords.length,
      daysSinceLastEvolution: 0,
    };
  }

  // Calculate average steps
  const averageSteps = data.reduce((sum, d) => sum + d.steps, 0) / data.length;

  // Calculate average sleep
  const sleepData = data.filter(d => d.sleepHours !== undefined);
  const averageSleep =
    sleepData.length > 0
      ? sleepData.reduce((sum, d) => sum + (d.sleepHours || 0), 0) / sleepData.length
      : null;

  // Calculate average HRV
  const hrvData = data.filter(d => d.hrv !== undefined);
  const averageHRV =
    hrvData.length > 0 ? hrvData.reduce((sum, d) => sum + (d.hrv || 0), 0) / hrvData.length : null;

  // Find most frequent state
  const stateCounts = new Map<EmotionalState, number>();
  data.forEach(d => {
    const state = d.emotionalState;
    stateCounts.set(state, (stateCounts.get(state) || 0) + 1);
  });
  const mostFrequentState =
    Array.from(stateCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || EmotionalState.RESTING;

  // Evolution stats
  const totalEvolutions = evolutionRecords.length;
  const lastEvolution = evolutionRecords[0]; // Assuming sorted newest first
  const daysSinceLastEvolution = lastEvolution
    ? Math.floor((Date.now() - new Date(lastEvolution.timestamp).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    averageSteps: Math.round(averageSteps),
    averageSleep,
    averageHRV,
    mostFrequentState,
    totalEvolutions,
    daysSinceLastEvolution,
  };
};

export const EvolutionHistoryScreen: React.FC<EvolutionHistoryScreenProps> = ({ navigation }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [allData, setAllData] = useState<HistoricalDataPoint[]>([]);
  const [evolutionRecords, setEvolutionRecords] = useState<EvolutionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollPositionRef = useRef<number>(0);

  useEffect(() => {
    loadData();
    loadSavedTimeRange();

    // Listen for orientation changes
    const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  /**
   * Handle dimension changes (orientation)
   */
  const handleDimensionsChange = useCallback(({ window }: { window: ScaledSize }) => {
    setDimensions(window);

    // Restore scroll position after layout update
    setTimeout(() => {
      if (scrollViewRef.current && scrollPositionRef.current > 0) {
        scrollViewRef.current.scrollTo({
          y: scrollPositionRef.current,
          animated: false,
        });
      }
    }, SCROLL_RESTORE_DELAY);
  }, []);

  // Memoize filtered data to avoid recalculation on every render
  const filteredData = useMemo(() => {
    return filterDataByTimeRange(allData, timeRange);
  }, [allData, timeRange]);

  // Memoize statistics calculation
  const statistics = useMemo(() => {
    return calculateStatistics(filteredData, evolutionRecords);
  }, [filteredData, evolutionRecords]);

  /**
   * Load saved time range preference
   */
  const loadSavedTimeRange = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(TIME_RANGE_STORAGE_KEY);
      if (saved && ['7d', '30d', '90d', 'all'].includes(saved)) {
        setTimeRange(saved as TimeRange);
      }
    } catch (err) {
      console.error('Error loading saved time range:', err);
    }
  }, []);

  /**
   * Load historical data from StorageService
   */
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load health data cache
      const cache = await StorageService.getHealthDataCache();
      if (!cache || Object.keys(cache).length === 0) {
        setAllData([]);
        setEvolutionRecords([]);
        setIsLoading(false);
        return;
      }

      // Transform cache to data points
      const dataPoints = transformCacheToDataPoints(cache);
      setAllData(dataPoints);

      // Load evolution records
      const records = await StorageService.getEvolutionRecords();
      setEvolutionRecords(
        records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      );

      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[EvolutionHistoryScreen] Error loading historical data:', errorMessage, err);
      setError('Failed to load history. Please try again.');
      setIsLoading(false);
      // Fallback to empty state
      setAllData([]);
      setEvolutionRecords([]);
    }
  }, []);

  /**
   * Persist time range and announce to screen readers
   */
  const persistTimeRange = useCallback(async (range: TimeRange) => {
    // Persist selection
    try {
      await AsyncStorage.setItem(TIME_RANGE_STORAGE_KEY, range);
    } catch (err) {
      console.error('Error saving time range:', err);
    }

    // Announce time range change to screen readers
    const rangeLabel = getTimeRangeLabel(range);
    AccessibilityInfo.announceForAccessibility(`Showing data for ${rangeLabel}`);
  }, []);

  /**
   * Debounced time range persistence for better performance
   */
  const debouncedTimeRangeChange = useMemo(
    () => debounce(persistTimeRange, CHART_UPDATE_DEBOUNCE),
    [persistTimeRange]
  );

  /**
   * Handle time range change with debounced updates
   */
  const handleTimeRangeChange = useCallback(
    (range: TimeRange) => {
      setTimeRange(range);
      debouncedTimeRangeChange(range);
    },
    [debouncedTimeRangeChange]
  );

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  /**
   * Handle scroll position tracking
   */
  const handleScroll = useCallback((event: { nativeEvent: { contentOffset: { y: number } } }) => {
    scrollPositionRef.current = event.nativeEvent.contentOffset.y;
  }, []);

  // Memoize layout calculations
  const { isLandscape, cardWidth } = useMemo(() => {
    const isLandscape = dimensions.width > dimensions.height;
    const availableWidth = dimensions.width - HORIZONTAL_PADDING;
    const columns = isLandscape ? LANDSCAPE_COLUMNS : PORTRAIT_COLUMNS;
    const cardWidth = (availableWidth - CARD_GAP * (columns - 1)) / columns;

    return { isLandscape, cardWidth };
  }, [dimensions]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={HALLOWEEN_COLORS.primary}
          accessibilityLabel="Loading evolution history"
        />
        <Text style={styles.loadingText} accessibilityLiveRegion="polite">
          Loading history...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji} accessibilityElementsHidden={true}>
          👻
        </Text>
        <Text style={styles.errorText} accessibilityRole="alert">
          {error}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadData}
          accessibilityLabel="Retry loading history"
          accessibilityRole="button"
          accessibilityHint="Attempts to reload the evolution history data">
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
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
            onPress={handleBackPress}
            accessibilityLabel="Go back to main screen"
            accessibilityRole="button"
            accessibilityHint="Returns to the main screen">
            <Text style={styles.backButtonText} accessibilityElementsHidden={true}>
              ←
            </Text>
          </TouchableOpacity>
          <Text
            style={styles.title}
            accessibilityRole="header"
            accessibilityLabel="Evolution History">
            Evolution History 🦇
          </Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      {/* Time Range Filter */}
      <View style={styles.filterContainerOuter}>
        <View
          style={styles.filterContainer}
          accessibilityRole="radiogroup"
          accessibilityLabel="Time range filter">
          <TouchableOpacity
            style={[styles.filterButton, timeRange === '7d' && styles.filterButtonActive]}
            onPress={() => handleTimeRangeChange('7d')}
            accessibilityLabel="Show last 7 days"
            accessibilityRole="radio"
            accessibilityState={{ selected: timeRange === '7d' }}
            accessibilityHint="Filter data to show the last 7 days">
            <Text
              style={[styles.filterButtonText, timeRange === '7d' && styles.filterButtonTextActive]}
              accessibilityElementsHidden={true}>
              7D
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, timeRange === '30d' && styles.filterButtonActive]}
            onPress={() => handleTimeRangeChange('30d')}
            accessibilityLabel="Show last 30 days"
            accessibilityRole="radio"
            accessibilityState={{ selected: timeRange === '30d' }}
            accessibilityHint="Filter data to show the last 30 days">
            <Text
              style={[
                styles.filterButtonText,
                timeRange === '30d' && styles.filterButtonTextActive,
              ]}
              accessibilityElementsHidden={true}>
              30D
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, timeRange === '90d' && styles.filterButtonActive]}
            onPress={() => handleTimeRangeChange('90d')}
            accessibilityLabel="Show last 90 days"
            accessibilityRole="radio"
            accessibilityState={{ selected: timeRange === '90d' }}
            accessibilityHint="Filter data to show the last 90 days">
            <Text
              style={[
                styles.filterButtonText,
                timeRange === '90d' && styles.filterButtonTextActive,
              ]}
              accessibilityElementsHidden={true}>
              90D
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, timeRange === 'all' && styles.filterButtonActive]}
            onPress={() => handleTimeRangeChange('all')}
            accessibilityLabel="Show all time, limited to 90 days"
            accessibilityRole="radio"
            accessibilityState={{ selected: timeRange === 'all' }}
            accessibilityHint="Filter data to show up to 90 days of history">
            <Text
              style={[
                styles.filterButtonText,
                timeRange === 'all' && styles.filterButtonTextActive,
              ]}
              accessibilityElementsHidden={true}>
              All
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        <View style={styles.contentWrapper}>
          {filteredData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji} accessibilityElementsHidden={true}>
                👻
              </Text>
              <Text style={styles.emptyText} accessibilityRole="header">
                No history yet
              </Text>
              <Text style={styles.emptySubtext}>
                Keep tracking your health to see your journey!
              </Text>
            </View>
          ) : (
            <>
              {/* Summary Statistics Cards */}
              {statistics && (
                <View style={styles.statisticsSection}>
                  <Text
                    style={styles.sectionTitle}
                    accessibilityRole="header"
                    accessibilityLabel="Summary Statistics">
                    📊 Summary Statistics
                  </Text>
                  <View
                    style={[styles.statisticsGrid, isLandscape && styles.statisticsGridLandscape]}
                    accessibilityRole="list">
                    <StatisticsCard
                      icon="👣"
                      label="Avg Steps"
                      value={statistics.averageSteps.toLocaleString()}
                      halloweenDecoration="ghost"
                      width={cardWidth}
                    />
                    {statistics.averageSleep !== null && (
                      <StatisticsCard
                        icon="😴"
                        label="Avg Sleep"
                        value={`${statistics.averageSleep.toFixed(1)}h`}
                        halloweenDecoration="pumpkin"
                        width={cardWidth}
                      />
                    )}
                    {statistics.averageHRV !== null && (
                      <StatisticsCard
                        icon="❤️"
                        label="Avg HRV"
                        value={`${Math.round(statistics.averageHRV)}ms`}
                        halloweenDecoration="bat"
                        width={cardWidth}
                      />
                    )}
                    <StatisticsCard
                      icon="🎭"
                      label="Most Frequent"
                      value={capitalizeFirst(statistics.mostFrequentState)}
                      subtitle={`${statistics.totalEvolutions} evolutions`}
                      halloweenDecoration="tombstone"
                      width={cardWidth}
                    />
                  </View>
                </View>
              )}

              {/* Health Metrics Charts */}
              <View style={styles.chartsSection}>
                <Text
                  style={styles.sectionTitle}
                  accessibilityRole="header"
                  accessibilityLabel="Health Trends">
                  📈 Health Trends
                </Text>
                <HealthMetricsChart
                  data={filteredData}
                  metricType="steps"
                  color={HALLOWEEN_COLORS.primary}
                />
                {filteredData.some(d => d.sleepHours !== undefined) && (
                  <HealthMetricsChart
                    data={filteredData}
                    metricType="sleep"
                    color={HALLOWEEN_COLORS.orange}
                  />
                )}
                {filteredData.some(d => d.hrv !== undefined) && (
                  <HealthMetricsChart
                    data={filteredData}
                    metricType="hrv"
                    color={HALLOWEEN_COLORS.green}
                  />
                )}
              </View>

              {/* Emotional State Timeline */}
              <View style={styles.timelineSection}>
                <EmotionalStateTimeline
                  data={[...filteredData].reverse()}
                  onItemPress={item => {
                    console.log('Timeline item pressed:', item);
                  }}
                />
              </View>

              {/* Evolution Milestones */}
              {evolutionRecords.length > 0 && (
                <View style={styles.milestonesSection}>
                  <Text
                    style={styles.sectionTitle}
                    accessibilityRole="header"
                    accessibilityLabel="Evolution Milestones">
                    ✨ Evolution Milestones
                  </Text>
                  <View accessibilityRole="list">
                    {evolutionRecords.map((record, index) => (
                      <EvolutionMilestoneCard
                        key={record.id}
                        record={record}
                        badgeIcon={getEvolutionBadgeIcon(index)}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* Data Table */}
              <View style={styles.tableSection}>
                <HealthDataTable data={[...filteredData].reverse()} maxHeight={400} />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HALLOWEEN_COLORS.darkBg,
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: HALLOWEEN_COLORS.cardBg,
    borderBottomWidth: 2,
    borderBottomColor: HALLOWEEN_COLORS.primary,
    shadowColor: HALLOWEEN_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    width: '100%',
    maxWidth: 800,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 44, // Accessibility touch target
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
  },
  backButtonText: {
    fontSize: 28,
    color: HALLOWEEN_COLORS.primaryLight,
    fontWeight: 'bold',
    textShadowColor: HALLOWEEN_COLORS.primary,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.primaryLight,
    flexShrink: 1,
    textShadowColor: HALLOWEEN_COLORS.primary,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 800,
    paddingBottom: 40,
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
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: HALLOWEEN_COLORS.darkBg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: HALLOWEEN_COLORS.ghostWhite,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  retryButton: {
    backgroundColor: HALLOWEEN_COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minHeight: 44, // Accessibility touch target
    // Purple glow on retry button
    shadowColor: HALLOWEEN_COLORS.primaryLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: HALLOWEEN_COLORS.primaryLight,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.ghostWhite,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  filterContainerOuter: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: HALLOWEEN_COLORS.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: HALLOWEEN_COLORS.primaryDark,
  },
  filterContainer: {
    width: '100%',
    maxWidth: 800,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    flexWrap: 'wrap',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: HALLOWEEN_COLORS.darkBg,
    borderWidth: 2,
    borderColor: HALLOWEEN_COLORS.primaryDark,
    alignItems: 'center',
    minHeight: 44, // Accessibility touch target
  },
  filterButtonActive: {
    backgroundColor: HALLOWEEN_COLORS.primary,
    borderColor: HALLOWEEN_COLORS.primaryLight,
    // Purple glow on active button
    shadowColor: HALLOWEEN_COLORS.primaryLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.ghostWhite,
    opacity: 0.6,
    letterSpacing: 1,
  },
  filterButtonTextActive: {
    color: HALLOWEEN_COLORS.ghostWhite,
    opacity: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.ghostWhite,
    marginBottom: 8,
    textShadowColor: HALLOWEEN_COLORS.primary,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  emptySubtext: {
    fontSize: 16,
    color: HALLOWEEN_COLORS.ghostWhite,
    opacity: 0.7,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.primaryLight,
    marginBottom: 16,
    marginLeft: 16,
    flexShrink: 1,
    textShadowColor: HALLOWEEN_COLORS.primary,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  statisticsSection: {
    marginTop: 16,
    marginBottom: 24,
  },
  statisticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    justifyContent: 'space-between',
  },
  statisticsGridLandscape: {
    justifyContent: 'flex-start',
  },
  chartsSection: {
    marginBottom: 24,
  },
  timelineSection: {
    marginBottom: 24,
  },
  milestonesSection: {
    marginBottom: 24,
  },
  tableSection: {
    marginBottom: 24,
  },
});
