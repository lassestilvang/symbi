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
  Modal,
  ImageBackground,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Symbi8BitCanvas } from '../components/Symbi8BitCanvas';
import { BreathingExercise } from '../components/BreathingExercise';
import { EvolutionCelebration } from '../components/EvolutionCelebration';
import { useHealthDataStore } from '../stores/healthDataStore';
import { useSymbiStateStore } from '../stores/symbiStateStore';
import { useUserPreferencesStore } from '../stores/userPreferencesStore';
import { HealthDataUpdateService } from '../services/HealthDataUpdateService';
import { getBackgroundSyncService } from '../services/BackgroundSyncService';
import {
  InteractiveSessionManager,
  SessionType,
  SessionResult,
  createHealthDataService,
  EvolutionSystem,
  EvolutionEligibility,
  EvolutionResult,
  AIBrainService,
} from '../services';
import { EmotionalState, HealthDataType } from '../types';

// Import tamagotchi frame image
// eslint-disable-next-line @typescript-eslint/no-require-imports
const tamagotchiFrameImage = require('../assets/images/tamagotchi-frame.png');

/**
 * MainScreen Component
 *
 * The primary screen showing the Symbi creature, health metrics, and emotional state.
 * Displays step count, progress bar, and provides access to threshold configuration.
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

interface MainScreenProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  // const symbiState = useSymbiStateStore(); // Not used in simplified version
  const [refreshing, setRefreshing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [stateChangeNotification, setStateChangeNotification] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  // const [hasNoData, setHasNoData] = useState(false); // Not used in simplified version
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);
  const [evolutionEligibility, setEvolutionEligibility] = useState<EvolutionEligibility | null>(
    null
  );
  const [showEvolutionNotification, setShowEvolutionNotification] = useState(false);
  const [isEvolutionInProgress, setIsEvolutionInProgress] = useState(false);
  const [showEvolutionCelebration, setShowEvolutionCelebration] = useState(false);
  const [evolutionResult, setEvolutionResult] = useState<EvolutionResult | null>(null);
  const [sessionManager] = useState(() => {
    const healthService = createHealthDataService(profile?.preferences.dataSource);
    return new InteractiveSessionManager(healthService);
  });

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
    checkEvolutionProgress();

    // Cleanup on unmount
    return () => {
      stopBackgroundSync();
    };
  }, []);

  /**
   * Track daily emotional state and check evolution progress
   */
  useEffect(() => {
    if (!isInitializing && emotionalState) {
      // Track today's emotional state
      EvolutionSystem.trackDailyState(emotionalState).catch(err => {
        console.error('Error tracking daily state:', err);
      });

      // Check evolution eligibility
      checkEvolutionProgress();
    }
  }, [emotionalState, isInitializing]);

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

      // Initialize the health data update service
      await HealthDataUpdateService.initialize();

      // Fetch today's health data
      await HealthDataUpdateService.updateDailyHealthData();

      setIsInitializing(false);
      setLoading(false);
    } catch (err) {
      console.error('Error initializing health data:', err);
      setIsInitializing(false);
      setLoading(false);

      // Try to load cached data as fallback
      const cachedData = await HealthDataUpdateService.getTodayHealthData();
      if (cachedData) {
        setError('Using cached data from previous update');
      } else {
        // Determine error type and show appropriate message
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
      }
    }
  };

  /**
   * Check evolution progress and eligibility
   * Requirements: 8.1
   */
  const checkEvolutionProgress = async () => {
    try {
      const eligibility = await EvolutionSystem.checkEvolutionEligibility();
      setEvolutionEligibility(eligibility);

      // Show notification if evolution is available
      if (eligibility.eligible && !showEvolutionNotification) {
        setShowEvolutionNotification(true);
      }
    } catch (error) {
      console.error('Error checking evolution progress:', error);
    }
  };

  /**
   * Trigger evolution event
   * Requirements: 8.2, 8.3, 8.4
   */
  const handleTriggerEvolution = async () => {
    try {
      setIsEvolutionInProgress(true);
      setError(null);

      // Get Gemini API key from environment or config
      // TODO: Replace with actual API key from secure storage
      const apiKey = (process.env.GEMINI_API_KEY as string) || 'YOUR_API_KEY_HERE';
      const aiService = new AIBrainService(apiKey);

      // Trigger evolution
      const result = await EvolutionSystem.triggerEvolution(aiService);

      if (result.success) {
        // Update Symbi state with new appearance
        useSymbiStateStore.getState().setEvolutionLevel(result.evolutionLevel);
        useSymbiStateStore.getState().setCustomAppearance(result.newAppearanceUrl);

        // Show celebration modal
        setEvolutionResult(result);
        setShowEvolutionCelebration(true);
        setShowEvolutionNotification(false);

        // Refresh evolution progress
        await checkEvolutionProgress();
      } else {
        setError('Evolution failed. Please try again later.');
      }

      setIsEvolutionInProgress(false);
    } catch (error) {
      console.error('Error triggering evolution:', error);
      setError('Failed to trigger evolution. Please try again.');
      setIsEvolutionInProgress(false);
    }
  };

  /**
   * Handle evolution celebration close
   */
  const handleEvolutionCelebrationClose = () => {
    setShowEvolutionCelebration(false);
    setEvolutionResult(null);
  };

  /**
   * Get user-friendly error message based on error type
   */
  const getErrorMessage = (err: unknown): string => {
    const error = err as Error;
    const errorString = error?.message || error?.toString() || '';

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
      await backgroundSync.startBackgroundSync([HealthDataType.STEPS], async (dataType, data) => {
        console.log('Background update received:', dataType, data);

        // Update health data when new data arrives
        await HealthDataUpdateService.updateDailyHealthData();
      });

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
   * Start breathing exercise session
   * Requirements: 7.1, 7.2
   */
  const handleStartBreathingExercise = async () => {
    try {
      await sessionManager.startSession(SessionType.BREATHING_EXERCISE, 5);
      setShowBreathingExercise(true);
    } catch (error) {
      console.error('Error starting breathing exercise:', error);
      setError('Failed to start breathing exercise');
    }
  };

  /**
   * Handle breathing exercise completion
   * Requirements: 7.3, 7.4, 7.5
   */
  const handleBreathingComplete = async (result: SessionResult) => {
    setShowBreathingExercise(false);

    if (result.success) {
      // Update emotional state to Calm (interactive session overrides AI/rule-based)
      useHealthDataStore.getState().setEmotionalState(EmotionalState.CALM, 'rule-based');

      // Show success notification
      showStateChangeNotification(emotionalState, EmotionalState.CALM);

      // Refresh health data to reflect the mindful minutes
      await HealthDataUpdateService.refreshHealthData();
    }
  };

  /**
   * Handle breathing exercise cancellation
   */
  const handleBreathingCancel = () => {
    setShowBreathingExercise(false);
  };

  /**
   * Handle Symbi poke/tap interaction
   */
  const handleSymbiPoke = () => {
    console.log('Symbi poked! Current state:', emotionalState);
    // Could add haptic feedback here in the future
  };

  /**
   * Check if "Calm your Symbi" button should be shown
   * Requirements: 7.1
   */
  const shouldShowCalmButton = (): boolean => {
    return emotionalState === EmotionalState.STRESSED || emotionalState === EmotionalState.ANXIOUS;
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
      }>
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
          accessibilityLabel="Open settings">
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
        <Animated.View style={[styles.notificationContainer, { opacity: notificationOpacity }]}>
          <Text style={styles.notificationText}>✨ {stateChangeNotification}</Text>
        </Animated.View>
      )}

      {/* Symbi Ghost with Tamagotchi Frame */}
      <View style={styles.symbiContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#9333EA" />
        ) : (
          <View style={styles.tamagotchiFrame}>
            <ImageBackground
              source={tamagotchiFrameImage}
              style={styles.frameImage}
              resizeMode="contain">
              <View style={styles.ghostScreenArea}>
                <Symbi8BitCanvas
                  key={`ghost-${emotionalState}`}
                  emotionalState={emotionalState}
                  size={Math.min(SCREEN_WIDTH * 0.5, 220)}
                  onPoke={() => {
                    console.log('👻 Ghost poked! Current state:', emotionalState);
                    handleSymbiPoke();
                  }}
                />
              </View>
            </ImageBackground>
          </View>
        )}
      </View>

      {/* Emotional State Label */}
      <View style={styles.stateContainer}>
        <Text style={styles.stateName}>{getStateName()}</Text>
        <Text style={styles.debugText}>
          Debug: {emotionalState} | Steps: {healthMetrics.steps}
        </Text>
      </View>

      {/* Manual Entry Button */}
      {profile?.preferences.dataSource === 'manual' && (
        <View style={styles.manualEntryContainer}>
          <TouchableOpacity
            style={styles.manualEntryButton}
            onPress={() => navigation.navigate('ManualEntry')}>
            <Text style={styles.manualEntryButtonText}>📝 Enter Steps Manually</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Test Buttons */}
      <View style={styles.testButtonsContainer}>
        <TouchableOpacity
          style={[styles.testButton, styles.testButtonSad]}
          onPress={() => {
            useHealthDataStore
              .getState()
              .updateHealthData({ steps: 500 }, EmotionalState.SAD, 'rule-based');
          }}>
          <Text style={styles.testButtonText}>😢 Sad</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.testButton, styles.testButtonResting]}
          onPress={() => {
            useHealthDataStore
              .getState()
              .updateHealthData({ steps: 5000 }, EmotionalState.RESTING, 'rule-based');
          }}>
          <Text style={styles.testButtonText}>😌 Rest</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.testButton, styles.testButtonActive]}
          onPress={() => {
            useHealthDataStore
              .getState()
              .updateHealthData({ steps: 10000 }, EmotionalState.ACTIVE, 'rule-based');
          }}>
          <Text style={styles.testButtonText}>🎉 Active</Text>
        </TouchableOpacity>
      </View>

      {/* Health Metrics Display */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Steps Today</Text>
          <Text style={styles.metricValue}>{healthMetrics.steps.toLocaleString()}</Text>
          <Text style={styles.metricSubtext}>
            Goal: {thresholds.activeThreshold.toLocaleString()}
          </Text>
        </View>

        {/* Phase 2: Sleep and HRV metrics */}
        {(healthMetrics.sleepHours !== undefined || healthMetrics.hrv !== undefined) && (
          <View style={styles.additionalMetricsRow}>
            {healthMetrics.sleepHours !== undefined && (
              <View style={styles.smallMetricCard}>
                <Text style={styles.smallMetricIcon}>😴</Text>
                <Text style={styles.smallMetricLabel}>Sleep</Text>
                <Text style={styles.smallMetricValue}>{healthMetrics.sleepHours.toFixed(1)}h</Text>
              </View>
            )}

            {healthMetrics.hrv !== undefined && (
              <View style={styles.smallMetricCard}>
                <Text style={styles.smallMetricIcon}>❤️</Text>
                <Text style={styles.smallMetricLabel}>HRV</Text>
                <Text style={styles.smallMetricValue}>{Math.round(healthMetrics.hrv)}ms</Text>
              </View>
            )}
          </View>
        )}
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
          <Text style={styles.thresholdValue}>&lt; {thresholds.sadThreshold.toLocaleString()}</Text>
        </View>
        <View style={styles.thresholdItem}>
          <Text style={styles.thresholdLabel}>Resting</Text>
          <Text style={styles.thresholdValue}>
            {thresholds.sadThreshold.toLocaleString()} -{' '}
            {thresholds.activeThreshold.toLocaleString()}
          </Text>
        </View>
        <View style={styles.thresholdItem}>
          <Text style={styles.thresholdLabel}>Active</Text>
          <Text style={styles.thresholdValue}>
            &gt; {thresholds.activeThreshold.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Evolution Progress Indicator (Phase 3) */}
      {evolutionEligibility && (
        <View style={styles.evolutionProgressContainer}>
          <View style={styles.evolutionProgressHeader}>
            <Text style={styles.evolutionProgressTitle}>✨ Evolution Progress</Text>
            {showEvolutionNotification && evolutionEligibility.eligible && (
              <View style={styles.evolutionReadyBadge}>
                <Text style={styles.evolutionReadyText}>Ready!</Text>
              </View>
            )}
          </View>

          <View style={styles.evolutionProgressBar}>
            <View
              style={[
                styles.evolutionProgressFill,
                {
                  width: `${Math.min(100, (evolutionEligibility.daysInPositiveState / evolutionEligibility.daysRequired) * 100)}%`,
                },
              ]}
            />
          </View>

          <Text style={styles.evolutionProgressText}>
            {evolutionEligibility.daysInPositiveState} / {evolutionEligibility.daysRequired} days
            {evolutionEligibility.eligible
              ? ' - Evolution available!'
              : ' in Active or Vibrant state'}
          </Text>

          {/* Evolution Trigger Button */}
          {evolutionEligibility.eligible && (
            <TouchableOpacity
              style={styles.evolutionButton}
              onPress={handleTriggerEvolution}
              disabled={isEvolutionInProgress}
              accessibilityLabel="Trigger evolution">
              {isEvolutionInProgress ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.evolutionButtonText}>🌟 Evolve Your Symbi!</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Calm your Symbi Button (Phase 3) */}
      {shouldShowCalmButton() && (
        <TouchableOpacity
          style={styles.calmButton}
          onPress={handleStartBreathingExercise}
          accessibilityLabel="Calm your Symbi">
          <Text style={styles.calmButtonText}>🧘 Calm your Symbi</Text>
        </TouchableOpacity>
      )}

      {/* Configure Thresholds Button */}
      <TouchableOpacity
        style={styles.configureButton}
        onPress={handleConfigureThresholds}
        accessibilityLabel="Configure thresholds">
        <Text style={styles.configureButtonText}>⚡ Configure Thresholds</Text>
      </TouchableOpacity>

      {/* Last Updated */}
      <Text style={styles.lastUpdated}>Last updated: {formatLastUpdated()}</Text>

      {/* Breathing Exercise Modal */}
      <Modal visible={showBreathingExercise} animationType="slide" presentationStyle="fullScreen">
        <BreathingExercise
          sessionManager={sessionManager}
          duration={5}
          onComplete={handleBreathingComplete}
          onCancel={handleBreathingCancel}
        />
      </Modal>

      {/* Evolution Celebration Modal */}
      {evolutionResult && (
        <EvolutionCelebration
          visible={showEvolutionCelebration}
          evolutionLevel={evolutionResult.evolutionLevel}
          appearanceUrl={evolutionResult.newAppearanceUrl}
          onClose={handleEvolutionCelebrationClose}
        />
      )}
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
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
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
    zIndex: 1000,
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
    marginBottom: 10,
  },
  tamagotchiFrame: {
    height: 500,
    width: 500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostScreenArea: {
    width: '60%',
    height: '60%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -50,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
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
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  animation: {
    width: Math.min(SCREEN_WIDTH * 0.8, 350),
    height: Math.min(SCREEN_WIDTH * 0.8, 350),
  },
  stateContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  stateName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#9333EA',
    textTransform: 'capitalize',
    letterSpacing: 1,
  },
  debugText: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  manualEntryContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  manualEntryButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  manualEntryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  testButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  testButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonSad: {
    backgroundColor: '#DC2626',
  },
  testButtonResting: {
    backgroundColor: '#7C3AED',
  },
  testButtonActive: {
    backgroundColor: '#10B981',
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
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
  additionalMetricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  smallMetricCard: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  smallMetricIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  smallMetricLabel: {
    fontSize: 11,
    color: '#a78bfa',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  smallMetricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9333EA',
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
  evolutionProgressContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  evolutionProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  evolutionProgressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9333EA',
  },
  evolutionReadyBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  evolutionReadyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  evolutionProgressBar: {
    height: 12,
    backgroundColor: '#1a1a2e',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  evolutionProgressFill: {
    height: '100%',
    backgroundColor: '#9333EA',
    borderRadius: 6,
  },
  evolutionProgressText: {
    fontSize: 13,
    color: '#a78bfa',
    textAlign: 'center',
  },
  evolutionButton: {
    marginTop: 12,
    backgroundColor: '#9333EA',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  evolutionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  calmButton: {
    marginHorizontal: 20,
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  calmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
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
