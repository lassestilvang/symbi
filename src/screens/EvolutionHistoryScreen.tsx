import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScaledSize,
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
 * Filter data by time range
 */
const filterDataByTimeRange = (
  data: HistoricalDataPoint[],
  range: TimeRange
): HistoricalDataPoint[] => {
  if (range === 'all') {
    return data;
  }

  const now = new Date();
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
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
  const [filteredData, setFilteredData] = useState<HistoricalDataPoint[]>([]);
  const [statistics, setStatistics] = useState<HistoryStatistics | null>(null);
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
  const handleDimensionsChange = ({ window }: { window: ScaledSize }) => {
    setDimensions(window);

    // Restore scroll position after layout update
    setTimeout(() => {
      if (scrollViewRef.current && scrollPositionRef.current > 0) {
        scrollViewRef.current.scrollTo({
          y: scrollPositionRef.current,
          animated: false,
        });
      }
    }, 100);
  };

  useEffect(() => {
    // Update filtered data and statistics when time range changes
    const filtered = filterDataByTimeRange(allData, timeRange);
    setFilteredData(filtered);

    const stats = calculateStatistics(filtered, evolutionRecords);
    setStatistics(stats);
  }, [timeRange, allData, evolutionRecords]);

  /**
   * Load saved time range preference
   */
  const loadSavedTimeRange = async () => {
    try {
      const saved = await AsyncStorage.getItem(TIME_RANGE_STORAGE_KEY);
      if (saved && ['7d', '30d', '90d', 'all'].includes(saved)) {
        setTimeRange(saved as TimeRange);
      }
    } catch (err) {
      console.error('Error loading saved time range:', err);
    }
  };

  /**
   * Load historical data from StorageService
   */
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load health data cache
      const cache = await StorageService.getHealthDataCache();
      if (!cache || Object.keys(cache).length === 0) {
        setAllData([]);
        setFilteredData([]);
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
      console.error('Error loading historical data:', err);
      setError('Failed to load history. Please try again.');
      setIsLoading(false);
      // Fallback to empty state
      setAllData([]);
      setFilteredData([]);
      setEvolutionRecords([]);
    }
  };

  /**
   * Handle time range change
   */
  const handleTimeRangeChange = async (range: TimeRange) => {
    setTimeRange(range);
    // Persist selection
    try {
      await AsyncStorage.setItem(TIME_RANGE_STORAGE_KEY, range);
    } catch (err) {
      console.error('Error saving time range:', err);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  /**
   * Handle scroll position tracking
   */
  const handleScroll = (event: { nativeEvent: { contentOffset: { y: number } } }) => {
    scrollPositionRef.current = event.nativeEvent.contentOffset.y;
  };

  // Determine if device is in landscape mode
  const isLandscape = dimensions.width > dimensions.height;

  // Calculate card width for statistics grid
  const cardGap = 12;
  const horizontalPadding = 32; // 16px on each side
  const availableWidth = dimensions.width - horizontalPadding;
  const cardWidth = isLandscape
    ? (availableWidth - cardGap * 3) / 4 // 4 columns in landscape
    : (availableWidth - cardGap) / 2; // 2 columns in portrait

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={HALLOWEEN_COLORS.primary} />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>👻</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          accessibilityLabel="Go back">
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Evolution History</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Time Range Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, timeRange === '7d' && styles.filterButtonActive]}
          onPress={() => handleTimeRangeChange('7d')}
          accessibilityLabel="7 days filter">
          <Text
            style={[styles.filterButtonText, timeRange === '7d' && styles.filterButtonTextActive]}>
            7D
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, timeRange === '30d' && styles.filterButtonActive]}
          onPress={() => handleTimeRangeChange('30d')}
          accessibilityLabel="30 days filter">
          <Text
            style={[styles.filterButtonText, timeRange === '30d' && styles.filterButtonTextActive]}>
            30D
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, timeRange === '90d' && styles.filterButtonActive]}
          onPress={() => handleTimeRangeChange('90d')}
          accessibilityLabel="90 days filter">
          <Text
            style={[styles.filterButtonText, timeRange === '90d' && styles.filterButtonTextActive]}>
            90D
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, timeRange === 'all' && styles.filterButtonActive]}
          onPress={() => handleTimeRangeChange('all')}
          accessibilityLabel="All time filter">
          <Text
            style={[styles.filterButtonText, timeRange === 'all' && styles.filterButtonTextActive]}>
            All
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        {filteredData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>👻</Text>
            <Text style={styles.emptyText}>No history yet</Text>
            <Text style={styles.emptySubtext}>Keep tracking your health to see your journey!</Text>
          </View>
        ) : (
          <>
            {/* Summary Statistics Cards */}
            {statistics && (
              <View style={styles.statisticsSection}>
                <Text style={styles.sectionTitle}>📊 Summary Statistics</Text>
                <View
                  style={[styles.statisticsGrid, isLandscape && styles.statisticsGridLandscape]}>
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
                    value={
                      statistics.mostFrequentState.charAt(0).toUpperCase() +
                      statistics.mostFrequentState.slice(1)
                    }
                    subtitle={`${statistics.totalEvolutions} evolutions`}
                    halloweenDecoration="tombstone"
                    width={cardWidth}
                  />
                </View>
              </View>
            )}

            {/* Health Metrics Charts */}
            <View style={styles.chartsSection}>
              <Text style={styles.sectionTitle}>📈 Health Trends</Text>
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
                <Text style={styles.sectionTitle}>✨ Evolution Milestones</Text>
                {evolutionRecords.map((record, index) => {
                  const badges: Array<
                    'tombstone' | 'jack-o-lantern' | 'crystal-ball' | 'cauldron'
                  > = ['tombstone', 'jack-o-lantern', 'crystal-ball', 'cauldron'];
                  const badgeIcon = badges[index % badges.length];

                  return (
                    <EvolutionMilestoneCard key={record.id} record={record} badgeIcon={badgeIcon} />
                  );
                })}
              </View>
            )}

            {/* Data Table */}
            <View style={styles.tableSection}>
              <HealthDataTable data={[...filteredData].reverse()} maxHeight={400} />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HALLOWEEN_COLORS.darkBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: HALLOWEEN_COLORS.cardBg,
    borderBottomWidth: 2,
    borderBottomColor: HALLOWEEN_COLORS.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: HALLOWEEN_COLORS.primaryLight,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.primaryLight,
    flexShrink: 1,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
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
  },
  retryButton: {
    backgroundColor: HALLOWEEN_COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.ghostWhite,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: HALLOWEEN_COLORS.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: HALLOWEEN_COLORS.primaryDark,
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
  },
  filterButtonActive: {
    backgroundColor: HALLOWEEN_COLORS.primary,
    borderColor: HALLOWEEN_COLORS.primaryLight,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.ghostWhite,
    opacity: 0.6,
  },
  filterButtonTextActive: {
    color: HALLOWEEN_COLORS.ghostWhite,
    opacity: 1,
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
  },
  emptySubtext: {
    fontSize: 16,
    color: HALLOWEEN_COLORS.ghostWhite,
    opacity: 0.6,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.primaryLight,
    marginBottom: 16,
    marginLeft: 16,
    flexShrink: 1,
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
