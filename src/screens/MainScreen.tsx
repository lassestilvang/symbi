import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { SymbiAnimation } from '../components/SymbiAnimation';
import { useHealthDataStore } from '../stores/healthDataStore';
import { useSymbiStateStore } from '../stores/symbiStateStore';
import { useUserPreferencesStore } from '../stores/userPreferencesStore';
import { HealthDataUpdateService } from '../services/HealthDataUpdateService';
import { getBackgroundSyncService } from '../services/BackgroundSyncService';
import { EmotionalState, HealthDataType } from '../types';

/**
 * MainScreen Component
 * 
 * The primary screen showing the Symbi creature, health metrics, and emotional state.
 * Displays step count, progress bar, and provides access to threshold configuration.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

interface MainScreenProps {
  navigation: any;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const MainScreen: React.FC<MainScreenProps> = ({ navigation }) => {
  const { 
    emotionalState, 
    healthMetrics, 
    lastUpdated, 
    isLoading, 
    error,
    setLoading,
    setError,
    clearError,
  } = useHealthDataStore();
  const { profile } = useUserPreferencesStore();
  const symbiState = useSymbiStateStore();
  const [refreshing, setRefreshing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [stateChangeNotification, setStateChangeNotification] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [hasNoData, setHasNoData] = useState(false);
  
  // Animation for state change notification
  const notificationOpacity = useRef(new Animated.Value(0)).current;
  const previousStateRef = useRef<EmotionalState>(emotionalState);

  // Get thresholds for progress calculation
  const thresholds = profile?.thresholds || {
    sadThreshold: 2000,
    activeThreshold: 8000,
  };

  /**
   * Initialize and fetch health data on component mount
   */
  useEffect(() => {
    initializeHealthData();
    startBackgroundSync();
    setupNetworkListener();

    // Cleanup on unmount
    return () => {
      stopBackgroundSync();
    };
  }, []);

  /**
   * Monitor emotional state changes and show notification
   */
  useEffect(() => {
    if (previousStateRef.current !== emotionalState && !isInitializing) {
      showStateChangeNotification(previousStateRef.current, emotionalState);
      previousStateRef.current = emotionalState;
    }
  }, [emotionalState, isInitializing]);

  /**
   * Initialize health data service and fetch today's data
   */
  const initializeHealthData = async () => {
    try {
      setIsInitializing(true);
      setLoading(true);
      clearError();
      setHasNoData(false);

      // Initialize the health data update service
      await HealthDataUpdateService.initialize();

      // Fetch today's health data
      await HealthDataUpdateService.updateDailyHealthData();

      // Check if we have any data
      if (healthMetrics.steps === 0 && !lastUpdated) {
        setHasNoData(true);
      }

      setIsInitializing(false);
      setLoading(false);
    } catch (err: any) {
      console.error('Error initializing health data:', err);
      setIsInitializing(false);
      setLoading(false);
      
      // Try to load cached data as fallback
      const cachedData = await HealthDataUpdateService.getTodayHealthData();
      if (cachedData) {
        setError('Using cached data from previous update');
        setHasNoData(false);
      } else {
        // Determine error type and show appropriate message
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        setHasNoData(true);
      }
    }
  };

  /**
   * Get user-friendly error message based on error type
   */
  const getErrorMessage = (err: any): string => {
    const errorString = err?.message || err?.toString() || '';
    
    // Permission errors
    if (errorString.includes('permission') || errorString.includes('authorized')) {
      return 'Health data permissions not granted. Please enable in Settings.';
    }
    
    // No data available
    if (errorString.includes('no data') || errorString.includes('not available')) {
      return 'No health data available yet. Try walking a bit!';
    }
    
    // Network errors
    if (errorString.includes('network') || errorString.includes('connection')) {
      return 'Network error. Using cached data if available.';
    }
    
    // Generic error
    return 'Unable to load health data. Please try again.';
  };

  /**
   * Setup network connectivity listener
   */
  const setupNetworkListener = () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
      
      // If we come back online, try to refresh data
      if (state.isConnected && !isInitializing) {
        console.log('Network restored, refreshing data...');
        HealthDataUpdateService.refreshHealthData().catch(err => {
          console.error('Error refreshing after network restore:', err);
        });
      }
    });

    return unsubscribe;
  };

  /**
   * Start background sync for health data updates
   * Listens for health data changes and updates emotional state
   */
  const startBackgroundSync = async () => {
    try {
      const backgroundSync = getBackgroundSyncService();
      
      // Start syncing step count data
      await backgroundSync.startBackgroundSync(
        [HealthDataType.STEPS],
        async (dataType, data) => {
          console.log('Background update received:', dataType, data);
          
          // Update health data when new data arrives
          await HealthDataUpdateService.updateDailyHealthData();
        }
      );
      
      console.log('Background sync started');
    } catch (err) {
      console.error('Error starting background sync:', err);
    }
  };

  /**
   * Stop background sync
   */
  const stopBackgroundSync = () => {
    try {
      const backgroundSync = getBackgroundSyncService();
      backgroundSync.stopBackgroundSync();
      console.log('Background sync stopped');
    } catch (err) {
      console.error('Error stopping background sync:', err);
    }
  };

  /**
   * Show subtle notification when emotional state changes
   */
  const showStateChangeNotification = (oldState: EmotionalState, newState: EmotionalState) => {
    const oldName = oldState.charAt(0).toUpperCase() + oldState.slice(1);
    const newName = newState.charAt(0).toUpperCase() + newState.slice(1);
    
    setStateChangeNotification(`${oldName} → ${newName}`);
    
    // Fade in
    Animated.sequence([
      Animated.timing(notificationOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Hold
      Animated.delay(2000),
      // Fade out
      Animated.timing(notificationOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStateChangeNotification(null);
    });
  };

  /**
   * Calculate progress percentage based on step count and thresholds
   */
  const calculateProgress = (): number => {
    const steps = healthMetrics.steps;
    
    if (steps >= thresholds.activeThreshold) {
      return 100;
    }
    
    if (steps <= 0) {
      return 0;
    }
    
    // Calculate progress between 0 and activeThreshold
    return Math.min(100, (steps / thresholds.activeThreshold) * 100);
  };

  /**
   * Get color for progress bar based on emotional state
   */
  const getProgressColor = (): string => {
    switch (emotionalState) {
      case EmotionalState.SAD:
        return '#5B21B6'; // Dark purple
      case EmotionalState.RESTING:
        return '#7C3AED'; // Medium purple
      case EmotionalState.ACTIVE:
        return '#9333EA'; // Bright purple
      default:
        return '#7C3AED';
    }
  };

  /**
   * Get emoji for emotional state
   */
  const getStateEmoji = (): string => {
    switch (emotionalState) {
      case EmotionalState.SAD:
        return '😢';
      case EmotionalState.RESTING:
        return '😌';
      case EmotionalState.ACTIVE:
        return '🎉';
      case EmotionalState.VIBRANT:
        return '✨';
      case EmotionalState.CALM:
        return '🧘';
      case EmotionalState.TIRED:
        return '😴';
      case EmotionalState.STRESSED:
        return '😰';
      case EmotionalState.ANXIOUS:
        return '😟';
      case EmotionalState.RESTED:
        return '😊';
      default:
        return '👻';
    }
  };

  /**
   * Get display name for emotional state
   */
  const getStateName = (): string => {
    return emotionalState.charAt(0).toUpperCase() + emotionalState.slice(1);
  };

  /**
   * Handle pull-to-refresh
   * Manually refreshes health data from the health data provider
   */
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      clearError();

      // Refresh health data
      await HealthDataUpdateService.refreshHealthData();

      setRefreshing(false);
    } catch (err) {
      console.error('Error refreshing health data:', err);
      setRefreshing(false);
      setError('Failed to refresh health data');
    }
  };

  /**
   * Navigate to threshold configuration
   */
  const handleConfigureThresholds = () => {
    navigation.navigate('Thresholds');
  };

  /**
   * Navigate to settings
   */
  const handleOpenSettings = () => {
    navigation.navigate('Settings');
  };

  /**
   * Format last updated time
   */
  const formatLastUpdated = (): string => {
    if (!lastUpdated) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const progress = calculateProgress();
  const progressColor = getProgressColor();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#9333EA"
          colors={['#9333EA']}
        />
      }
    >
      {/* Header with settings button */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Symbi</Text>
          {isOffline && (
            <View style={styles.offlineIndicator}>
              <Text style={styles.offlineText}>📡 Offline</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handleOpenSettings}
          accessibilityLabel="Open settings"
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* State change notification */}
      {stateChangeNotification && (
        <Animated.View
          style={[
            styles.notificationContainer,
            { opacity: notificationOpacity },
          ]}
        >
          <Text style={styles.notificationText}>
            ✨ {stateChangeNotification}
          </Text>
        </Animated.View>
      )}

      {/* Symbi Animation */}
      <View style={styles.symbiContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9333EA" />
            <Text style={styles.loadingText}>Loading Symbi...</Text>
          </View>
        ) : hasNoData ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataEmoji}>👻</Text>
            <Text style={styles.noDataText}>Waiting for today's data...</Text>
            <Text style={styles.noDataSubtext}>
              {profile?.preferences.dataSource === 'manual'
                ? 'Tap "Enter Steps" to add your activity'
                : 'Start moving to see your Symbi come alive!'}
            </Text>
            {profile?.preferences.dataSource === 'manual' && (
              <TouchableOpacity
                style={styles.manualEntryButton}
                onPress={() => navigation.navigate('ManualEntry')}
              >
                <Text style={styles.manualEntryButtonText}>Enter Steps</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <SymbiAnimation
            emotionalState={symbiState.emotionalState || emotionalState}
            evolutionLevel={symbiState.evolutionLevel}
            customAppearance={symbiState.customAppearanceUrl}
            style={styles.animation}
          />
        )}
      </View>

      {/* Emotional State Label */}
      <View style={styles.stateContainer}>
        <Text style={styles.stateEmoji}>{getStateEmoji()}</Text>
        <Text style={styles.stateName}>{getStateName()}</Text>
      </View>

      {/* Step Count Display */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Steps Today</Text>
          <Text style={styles.metricValue}>
            {healthMetrics.steps.toLocaleString()}
          </Text>
          <Text style={styles.metricSubtext}>
            Goal: {thresholds.activeThreshold.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progress}%`,
                backgroundColor: progressColor,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>

      {/* Threshold Indicators */}
      <View style={styles.thresholdsContainer}>
        <View style={styles.thresholdItem}>
          <Text style={styles.thresholdLabel}>Sad</Text>
          <Text style={styles.thresholdValue}>
            &lt; {thresholds.sadThreshold.toLocaleString()}
          </Text>
        </View>
        <View style={styles.thresholdItem}>
          <Text style={styles.thresholdLabel}>Resting</Text>
          <Text style={styles.thresholdValue}>
            {thresholds.sadThreshold.toLocaleString()} - {thresholds.activeThreshold.toLocaleString()}
          </Text>
        </View>
        <View style={styles.thresholdItem}>
          <Text style={styles.thresholdLabel}>Active</Text>
          <Text style={styles.thresholdValue}>
            &gt; {thresholds.activeThreshold.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Configure Thresholds Button */}
      <TouchableOpacity
        style={styles.configureButton}
        onPress={handleConfigureThresholds}
        accessibilityLabel="Configure thresholds"
      >
        <Text style={styles.configureButtonText}>⚡ Configure Thresholds</Text>
      </TouchableOpacity>

      {/* Last Updated */}
      <Text style={styles.lastUpdated}>
        Last updated: {formatLastUpdated()}
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#9333EA',
  },
  offlineIndicator: {
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  offlineText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
  },
  errorContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 12,
    backgroundColor: '#7F1D1D',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 14,
    textAlign: 'center',
  },
  notificationContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 12,
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9333EA',
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  notificationText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  symbiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
    minHeight: 300,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#a78bfa',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    paddingHorizontal: 40,
  },
  noDataEmoji: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  noDataText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9333EA',
    marginBottom: 8,
    textAlign: 'center',
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  manualEntryButton: {
    marginTop: 20,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  manualEntryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  animation: {
    width: Math.min(SCREEN_WIDTH * 0.8, 350),
    height: Math.min(SCREEN_WIDTH * 0.8, 350),
  },
  stateContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  stateEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  stateName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#9333EA',
    textTransform: 'capitalize',
  },
  metricsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  metricLabel: {
    fontSize: 14,
    color: '#a78bfa',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  metricValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#9333EA',
    marginBottom: 4,
  },
  metricSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBarBackground: {
    height: 24,
    backgroundColor: '#16213e',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#374151',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 10,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#a78bfa',
  },
  thresholdsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  thresholdItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  thresholdLabel: {
    fontSize: 12,
    color: '#9333EA',
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  thresholdValue: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
  configureButton: {
    marginHorizontal: 20,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  configureButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  lastUpdated: {
    textAlign: 'center',
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 20,
  },
});
