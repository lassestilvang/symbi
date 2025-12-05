import React, { useState, useMemo, useCallback } from 'react';
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
import { Symbi8BitCanvas } from '../components/Symbi8BitCanvas';
import { BreathingExercise } from '../components/BreathingExercise';
import { EvolutionCelebration } from '../components/EvolutionCelebration';
import { useHealthDataStore } from '../stores/healthDataStore';
import { useUserPreferencesStore } from '../stores/userPreferencesStore';
import {
  useHealthDataInitialization,
  useEvolutionProgress,
  useStateChangeNotification,
  useNetworkStatus,
  useBackgroundSync,
} from '../hooks';
import {
  InteractiveSessionManager,
  SessionType,
  SessionResult,
  createHealthDataService,
} from '../services';
import { EmotionalState } from '../types';
import {
  HALLOWEEN_COLORS,
  STATE_COLORS,
  LAYOUT,
  TYPOGRAPHY,
  SHADOWS,
  TEXT_COLORS,
  BORDER_COLORS,
} from '../constants/theme';

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
  // Store hooks
  const { emotionalState, healthMetrics, lastUpdated, isLoading, error, setError, clearError } =
    useHealthDataStore();
  const { profile } = useUserPreferencesStore();

  // Custom hooks for extracted logic
  const { isInitializing, refreshing, handleRefresh } = useHealthDataInitialization();
  const { isOffline } = useNetworkStatus({ autoRefreshOnReconnect: true });
  const { stateChangeNotification, notificationOpacity } = useStateChangeNotification(
    emotionalState,
    { isInitializing }
  );

  // Evolution progress hook
  const {
    evolutionEligibility,
    showEvolutionNotification,
    isEvolutionInProgress,
    showEvolutionCelebration,
    evolutionResult,
    handleTriggerEvolution,
    handleEvolutionCelebrationClose,
    checkEvolutionProgress,
  } = useEvolutionProgress({
    onError: setError,
  });

  // Background sync
  useBackgroundSync({ enabled: !isInitializing });

  // Local state
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);
  const [sessionManager] = useState(() => {
    const healthService = createHealthDataService(profile?.preferences.dataSource);
    return new InteractiveSessionManager(healthService);
  });

  // Get thresholds for progress calculation
  const thresholds = useMemo(
    () =>
      profile?.thresholds || {
        sadThreshold: 2000,
        activeThreshold: 8000,
      },
    [profile?.thresholds]
  );

  // Check evolution progress when emotional state changes
  React.useEffect(() => {
    if (!isInitializing && emotionalState) {
      checkEvolutionProgress();
    }
  }, [emotionalState, isInitializing, checkEvolutionProgress]);

  /**
   * Calculate progress percentage based on step count and thresholds
   */
  const progress = useMemo(() => {
    const steps = healthMetrics.steps;
    if (steps >= thresholds.activeThreshold) return 100;
    if (steps <= 0) return 0;
    return Math.min(100, (steps / thresholds.activeThreshold) * 100);
  }, [healthMetrics.steps, thresholds.activeThreshold]);

  /**
   * Get color for progress bar based on emotional state
   */
  const progressColor = useMemo(() => {
    switch (emotionalState) {
      case EmotionalState.SAD:
        return STATE_COLORS.sad;
      case EmotionalState.RESTING:
        return HALLOWEEN_COLORS.primary;
      case EmotionalState.ACTIVE:
        return STATE_COLORS.active;
      default:
        return HALLOWEEN_COLORS.primary;
    }
  }, [emotionalState]);

  /**
   * Get display name for emotional state
   */
  const stateName = useMemo(
    () => emotionalState.charAt(0).toUpperCase() + emotionalState.slice(1),
    [emotionalState]
  );

  /**
   * Format last updated time
   */
  const formattedLastUpdated = useMemo(() => {
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
  }, [lastUpdated]);

  /**
   * Check if "Calm your Symbi" button should be shown
   */
  const shouldShowCalmButton = useMemo(
    () => emotionalState === EmotionalState.STRESSED || emotionalState === EmotionalState.ANXIOUS,
    [emotionalState]
  );

  // Navigation handlers
  const handleConfigureThresholds = useCallback(
    () => navigation.navigate('Thresholds'),
    [navigation]
  );
  const handleOpenSettings = useCallback(() => navigation.navigate('Settings'), [navigation]);
  const handleNavigateToManualEntry = useCallback(
    () => navigation.navigate('ManualEntry'),
    [navigation]
  );
  const handleNavigateToEvolutionHistory = useCallback(
    () => navigation.navigate('EvolutionHistory'),
    [navigation]
  );

  /**
   * Start breathing exercise session
   */
  const handleStartBreathingExercise = useCallback(async () => {
    try {
      await sessionManager.startSession(SessionType.BREATHING_EXERCISE, 5);
      setShowBreathingExercise(true);
    } catch (err) {
      if (__DEV__) {
        console.error('Error starting breathing exercise:', err);
      }
      setError('Failed to start breathing exercise');
    }
  }, [sessionManager, setError]);

  /**
   * Handle breathing exercise completion
   */
  const handleBreathingComplete = useCallback(async (result: SessionResult) => {
    setShowBreathingExercise(false);

    if (result.success) {
      useHealthDataStore.getState().setEmotionalState(EmotionalState.CALM, 'rule-based');
    }
  }, []);

  const handleBreathingCancel = useCallback(() => {
    setShowBreathingExercise(false);
  }, []);

  /**
   * Handle Symbi poke/tap interaction
   */
  const handleSymbiPoke = useCallback(() => {
    if (__DEV__) {
      console.log('Symbi poked! Current state:', emotionalState);
    }
  }, [emotionalState]);

  /**
   * Handle pull-to-refresh with error clearing
   */
  const onRefresh = useCallback(async () => {
    clearError();
    await handleRefresh();
  }, [clearError, handleRefresh]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={HALLOWEEN_COLORS.primaryLight}
          colors={[HALLOWEEN_COLORS.primaryLight]}
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
          <ActivityIndicator size="large" color={HALLOWEEN_COLORS.primaryLight} />
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
                  onPoke={handleSymbiPoke}
                />
              </View>
            </ImageBackground>
          </View>
        )}
      </View>

      {/* Emotional State Label */}
      <View style={styles.stateContainer}>
        <Text style={styles.stateName}>{stateName}</Text>
        {__DEV__ && (
          <Text style={styles.debugText}>
            Debug: {emotionalState} | Steps: {healthMetrics.steps}
          </Text>
        )}
      </View>

      {/* Manual Entry Button */}
      {profile?.preferences.dataSource === 'manual' && (
        <View style={styles.manualEntryContainer}>
          <TouchableOpacity style={styles.manualEntryButton} onPress={handleNavigateToManualEntry}>
            <Text style={styles.manualEntryButtonText}>📝 Enter Steps Manually</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Test Buttons (DEV only) */}
      {__DEV__ && <TestButtons />}

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

      {/* Evolution Progress Indicator */}
      {evolutionEligibility && (
        <EvolutionProgressSection
          evolutionEligibility={evolutionEligibility}
          showEvolutionNotification={showEvolutionNotification}
          isEvolutionInProgress={isEvolutionInProgress}
          onTriggerEvolution={handleTriggerEvolution}
          onNavigateToHistory={handleNavigateToEvolutionHistory}
        />
      )}

      {/* Calm your Symbi Button */}
      {shouldShowCalmButton && (
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
      <Text style={styles.lastUpdated}>Last updated: {formattedLastUpdated}</Text>

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

/**
 * Test Buttons Component (DEV only)
 * Extracted to reduce MainScreen complexity
 */
const TestButtons: React.FC = () => {
  const handleSetSad = useCallback(() => {
    useHealthDataStore
      .getState()
      .updateHealthData({ steps: 500 }, EmotionalState.SAD, 'rule-based');
  }, []);

  const handleSetResting = useCallback(() => {
    useHealthDataStore
      .getState()
      .updateHealthData({ steps: 5000 }, EmotionalState.RESTING, 'rule-based');
  }, []);

  const handleSetActive = useCallback(() => {
    useHealthDataStore
      .getState()
      .updateHealthData({ steps: 10000 }, EmotionalState.ACTIVE, 'rule-based');
  }, []);

  return (
    <View style={styles.testButtonsContainer}>
      <TouchableOpacity style={[styles.testButton, styles.testButtonSad]} onPress={handleSetSad}>
        <Text style={styles.testButtonText}>😢 Sad</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.testButton, styles.testButtonResting]}
        onPress={handleSetResting}>
        <Text style={styles.testButtonText}>😌 Rest</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.testButton, styles.testButtonActive]}
        onPress={handleSetActive}>
        <Text style={styles.testButtonText}>🎉 Active</Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * Evolution Progress Section Component
 * Extracted to reduce MainScreen complexity
 */
interface EvolutionProgressSectionProps {
  evolutionEligibility: {
    eligible: boolean;
    daysInPositiveState: number;
    daysRequired: number;
  };
  showEvolutionNotification: boolean;
  isEvolutionInProgress: boolean;
  onTriggerEvolution: () => void;
  onNavigateToHistory: () => void;
}

const EvolutionProgressSection: React.FC<EvolutionProgressSectionProps> = ({
  evolutionEligibility,
  showEvolutionNotification,
  isEvolutionInProgress,
  onTriggerEvolution,
  onNavigateToHistory,
}) => {
  const progressPercentage = Math.min(
    100,
    (evolutionEligibility.daysInPositiveState / evolutionEligibility.daysRequired) * 100
  );

  return (
    <View style={styles.evolutionProgressContainer}>
      <View style={styles.evolutionProgressHeader}>
        <Text style={styles.evolutionProgressTitle}>✨ Evolution Progress</Text>
        <View style={styles.evolutionProgressHeaderRight}>
          {showEvolutionNotification && evolutionEligibility.eligible && (
            <View style={styles.evolutionReadyBadge}>
              <Text style={styles.evolutionReadyText}>Ready!</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={onNavigateToHistory}
            accessibilityLabel="View evolution history">
            <Text style={styles.viewHistoryLink}>📊 View History</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.evolutionProgressBar}>
        <View style={[styles.evolutionProgressFill, { width: `${progressPercentage}%` }]} />
      </View>

      <Text style={styles.evolutionProgressText}>
        {evolutionEligibility.daysInPositiveState} / {evolutionEligibility.daysRequired} days
        {evolutionEligibility.eligible ? ' - Evolution available!' : ' in Active or Vibrant state'}
      </Text>

      {evolutionEligibility.eligible && (
        <TouchableOpacity
          style={styles.evolutionButton}
          onPress={onTriggerEvolution}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HALLOWEEN_COLORS.darkBg,
  },
  contentContainer: {
    paddingBottom: 40,
    maxWidth: LAYOUT.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.horizontalPadding,
    paddingTop: LAYOUT.horizontalPadding,
    paddingBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: TYPOGRAPHY.titleSize,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.primaryLight,
  },
  offlineIndicator: {
    backgroundColor: BORDER_COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  offlineText: {
    fontSize: TYPOGRAPHY.captionSize,
    color: TEXT_COLORS.muted,
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
  },
  errorContainer: {
    marginHorizontal: LAYOUT.horizontalPadding,
    marginTop: 10,
    padding: 12,
    backgroundColor: '#7F1D1D',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER_COLORS.error,
  },
  errorText: {
    color: TEXT_COLORS.error,
    fontSize: TYPOGRAPHY.smallSize,
    textAlign: 'center',
  },
  notificationContainer: {
    position: 'absolute',
    top: 80,
    left: LAYOUT.horizontalPadding,
    right: LAYOUT.horizontalPadding,
    padding: 12,
    backgroundColor: HALLOWEEN_COLORS.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: HALLOWEEN_COLORS.primaryLight,
    ...SHADOWS.card,
    zIndex: 1000,
  },
  notificationText: {
    color: TEXT_COLORS.primary,
    fontSize: TYPOGRAPHY.smallSize,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  symbiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: LAYOUT.horizontalPadding,
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
  stateContainer: {
    alignItems: 'center',
    marginBottom: LAYOUT.horizontalPadding,
  },
  stateName: {
    fontSize: TYPOGRAPHY.titleSize,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.primaryLight,
    textTransform: 'capitalize',
    letterSpacing: 1,
  },
  debugText: {
    color: TEXT_COLORS.muted,
    fontSize: TYPOGRAPHY.captionSize,
    marginTop: 4,
  },
  manualEntryContainer: {
    paddingHorizontal: LAYOUT.horizontalPadding,
    marginBottom: LAYOUT.horizontalPadding,
  },
  manualEntryButton: {
    backgroundColor: HALLOWEEN_COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: LAYOUT.buttonBorderRadius,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  manualEntryButtonText: {
    color: TEXT_COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  testButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: LAYOUT.horizontalPadding,
    marginBottom: LAYOUT.horizontalPadding,
  },
  testButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonSad: {
    backgroundColor: STATE_COLORS.sad,
  },
  testButtonResting: {
    backgroundColor: HALLOWEEN_COLORS.primary,
  },
  testButtonActive: {
    backgroundColor: STATE_COLORS.active,
  },
  testButtonText: {
    color: TEXT_COLORS.primary,
    fontSize: TYPOGRAPHY.smallSize,
    fontWeight: 'bold',
  },
  metricsContainer: {
    paddingHorizontal: LAYOUT.horizontalPadding,
    marginBottom: LAYOUT.horizontalPadding,
  },
  metricCard: {
    backgroundColor: HALLOWEEN_COLORS.cardBg,
    borderRadius: 16,
    padding: LAYOUT.horizontalPadding,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: HALLOWEEN_COLORS.primary,
  },
  metricLabel: {
    fontSize: TYPOGRAPHY.smallSize,
    color: TEXT_COLORS.secondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  metricValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.primaryLight,
    marginBottom: 4,
  },
  metricSubtext: {
    fontSize: TYPOGRAPHY.smallSize,
    color: TEXT_COLORS.muted,
  },
  additionalMetricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  smallMetricCard: {
    flex: 1,
    backgroundColor: HALLOWEEN_COLORS.cardBg,
    borderRadius: LAYOUT.cardBorderRadius,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER_COLORS.secondary,
  },
  smallMetricIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  smallMetricLabel: {
    fontSize: 11,
    color: TEXT_COLORS.secondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  smallMetricValue: {
    fontSize: LAYOUT.horizontalPadding,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.primaryLight,
  },
  progressContainer: {
    paddingHorizontal: LAYOUT.horizontalPadding,
    marginBottom: LAYOUT.horizontalPadding,
  },
  progressBarBackground: {
    height: 24,
    backgroundColor: HALLOWEEN_COLORS.cardBg,
    borderRadius: LAYOUT.progressBarRadius,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: BORDER_COLORS.secondary,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 10,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: TYPOGRAPHY.bodySize,
    fontWeight: 'bold',
    color: TEXT_COLORS.secondary,
  },
  thresholdsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.horizontalPadding,
    marginBottom: 30,
  },
  thresholdItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  thresholdLabel: {
    fontSize: TYPOGRAPHY.captionSize,
    color: HALLOWEEN_COLORS.primaryLight,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  thresholdValue: {
    fontSize: 11,
    color: TEXT_COLORS.muted,
    textAlign: 'center',
  },
  evolutionProgressContainer: {
    marginHorizontal: LAYOUT.horizontalPadding,
    marginBottom: LAYOUT.horizontalPadding,
    backgroundColor: HALLOWEEN_COLORS.cardBg,
    borderRadius: LAYOUT.cardBorderRadius,
    padding: 16,
    borderWidth: 2,
    borderColor: HALLOWEEN_COLORS.primary,
  },
  evolutionProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  evolutionProgressTitle: {
    fontSize: TYPOGRAPHY.bodySize,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.primaryLight,
  },
  evolutionProgressHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  evolutionReadyBadge: {
    backgroundColor: STATE_COLORS.active,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  evolutionReadyText: {
    fontSize: TYPOGRAPHY.captionSize,
    fontWeight: 'bold',
    color: TEXT_COLORS.primary,
  },
  viewHistoryLink: {
    fontSize: TYPOGRAPHY.smallSize,
    color: HALLOWEEN_COLORS.primaryLight,
    fontWeight: 'bold',
  },
  evolutionProgressBar: {
    height: 12,
    backgroundColor: HALLOWEEN_COLORS.darkBg,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  evolutionProgressFill: {
    height: '100%',
    backgroundColor: HALLOWEEN_COLORS.primaryLight,
    borderRadius: 6,
  },
  evolutionProgressText: {
    fontSize: 13,
    color: TEXT_COLORS.secondary,
    textAlign: 'center',
  },
  evolutionButton: {
    marginTop: 12,
    backgroundColor: HALLOWEEN_COLORS.primaryLight,
    paddingVertical: 12,
    paddingHorizontal: LAYOUT.horizontalPadding,
    borderRadius: 8,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  evolutionButtonText: {
    fontSize: TYPOGRAPHY.bodySize,
    fontWeight: 'bold',
    color: TEXT_COLORS.primary,
  },
  calmButton: {
    marginHorizontal: LAYOUT.horizontalPadding,
    backgroundColor: STATE_COLORS.active,
    borderRadius: LAYOUT.buttonBorderRadius,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    ...SHADOWS.card,
  },
  calmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_COLORS.primary,
  },
  configureButton: {
    marginHorizontal: LAYOUT.horizontalPadding,
    backgroundColor: HALLOWEEN_COLORS.primary,
    borderRadius: LAYOUT.buttonBorderRadius,
    padding: 16,
    alignItems: 'center',
    marginBottom: LAYOUT.horizontalPadding,
    ...SHADOWS.card,
  },
  configureButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_COLORS.primary,
  },
  lastUpdated: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.captionSize,
    color: TEXT_COLORS.muted,
    marginBottom: LAYOUT.horizontalPadding,
  },
});
