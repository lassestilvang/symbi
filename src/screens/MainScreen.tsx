import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
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
  Pressable,
  GestureResponderEvent,
  Image,
} from 'react-native';
import { CosmeticRenderer } from '../components/CosmeticRenderer';
import { BreathingExercise } from '../components/BreathingExercise';
import { EvolutionCelebration } from '../components/EvolutionCelebration';
import { StreakDisplay } from '../components/StreakDisplay';
import { HabitatManager, HabitatManagerHandle } from '../components/habitat';
import { useHealthDataStore } from '../stores/healthDataStore';
import { useUserPreferencesStore } from '../stores/userPreferencesStore';
import { useStreakStore } from '../stores/streakStore';
import { useCosmeticStore } from '../stores/cosmeticStore';
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
// Import app logo
// eslint-disable-next-line @typescript-eslint/no-require-imports
const appLogo = require('../../assets/icon.png');

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

  // Gamification store hooks (Requirements: 2.4, 5.5)
  const { currentStreak, longestStreak, initialize: initializeStreak } = useStreakStore();
  const { initialize: initializeCosmetics } = useCosmeticStore();

  // Initialize gamification stores on mount
  useEffect(() => {
    initializeStreak();
    initializeCosmetics();
  }, [initializeStreak, initializeCosmetics]);

  // Custom hooks for extracted logic
  const { isInitializing, refreshing, handleRefresh } = useHealthDataInitialization();
  const { isOffline } = useNetworkStatus({ autoRefreshOnReconnect: true });
  // State change notification hook - kept for potential future use
  useStateChangeNotification(emotionalState, { isInitializing });

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

  // Habitat ref for triggering effects
  const habitatRef = useRef<HabitatManagerHandle>(null);

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
  const handleOpenSettings = useCallback(() => navigation.navigate('Settings'), [navigation]);
  const handleNavigateToManualEntry = useCallback(
    () => navigation.navigate('ManualEntry'),
    [navigation]
  );
  const handleNavigateToEvolutionHistory = useCallback(
    () => navigation.navigate('EvolutionHistory'),
    [navigation]
  );
  // Gamification navigation handlers (Requirements: 1.3, 5.1)
  const handleNavigateToAchievements = useCallback(
    () => navigation.navigate('Achievements'),
    [navigation]
  );
  const handleNavigateToCustomization = useCallback(
    () => navigation.navigate('CustomizationStudio'),
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

  /**
   * Handle habitat background interaction
   * Requirement: 7.1 - Click/tap triggers localized particle burst
   */
  const handleHabitatInteraction = useCallback((point: { x: number; y: number }) => {
    if (__DEV__) {
      console.log('Habitat interaction at:', point);
    }
  }, []);

  /**
   * Handle screen tap for habitat particle effects
   * Triggers burst effect at tap location
   */
  const handleScreenTap = useCallback((event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;
    habitatRef.current?.triggerBackgroundTap({ x: locationX, y: locationY });
  }, []);

  return (
    <View style={styles.screenContainer}>
      {/* Habitat Background - positioned behind all content */}
      {/* Requirements: 1.1, 7.3 - Render animated background, handle interactions */}
      <HabitatManager
        ref={habitatRef}
        emotionalState={emotionalState}
        isVisible={true}
        onInteraction={handleHabitatInteraction}
        reducedMotion={false}
      />

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
            <Image source={appLogo} style={styles.headerLogo} />
            <View style={styles.titleTextContainer}>
              <Text style={styles.title}>Symbi</Text>
              <Text style={styles.tagline}>Your Biometric Tamagotchi</Text>
            </View>
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

        {/* Symbi Ghost with Tamagotchi Frame - Now with Cosmetics (Requirement 5.5) */}
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
                  <CosmeticRenderer
                    key={`ghost-${emotionalState}`}
                    emotionalState={emotionalState}
                    size={Math.min(SCREEN_WIDTH * 0.5, 220)}
                    onPoke={handleSymbiPoke}
                    showCosmetics={true}
                  />
                </View>
              </ImageBackground>
            </View>
          )}
        </View>



        {/* Manual Entry Button */}
        {profile?.preferences.dataSource === 'manual' && (
          <View style={styles.manualEntryContainer}>
            <TouchableOpacity
              style={styles.manualEntryButton}
              onPress={handleNavigateToManualEntry}>
              <Text style={styles.manualEntryButtonText}>📝 Enter Steps Manually</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Health Metrics Display */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Steps Today</Text>
            <Text style={styles.metricValue}>{healthMetrics.steps.toLocaleString()}</Text>
            <Text style={styles.metricSubtext}>
              Goal: {thresholds.activeThreshold.toLocaleString()}
            </Text>
            {/* Progress Bar - inside card */}
            <View style={styles.inCardProgressContainer}>
              <View style={styles.inCardProgressBarBackground}>
                <View
                  style={[
                    styles.inCardProgressBarFill,
                    {
                      width: `${progress}%`,
                      backgroundColor: progressColor,
                    },
                  ]}
                />
              </View>
              <Text style={styles.inCardProgressText}>{Math.round(progress)}%</Text>
            </View>

            {/* Step Thresholds - inline display */}
            <View style={styles.inlineThresholdsContainer}>
              <View style={styles.inlineThresholdItem}>
                <Text style={styles.inlineThresholdValue}>
                  &lt; {thresholds.sadThreshold.toLocaleString()}
                </Text>
                <Text style={styles.inlineThresholdLabel}>Sad</Text>
              </View>
              <View style={styles.inlineThresholdDivider} />
              <View style={styles.inlineThresholdItem}>
                <Text style={styles.inlineThresholdValue}>
                  {thresholds.sadThreshold.toLocaleString()} - {thresholds.activeThreshold.toLocaleString()}
                </Text>
                <Text style={styles.inlineThresholdLabel}>Resting</Text>
              </View>
              <View style={styles.inlineThresholdDivider} />
              <View style={styles.inlineThresholdItem}>
                <Text style={styles.inlineThresholdValue}>
                  &gt; {thresholds.activeThreshold.toLocaleString()}
                </Text>
                <Text style={styles.inlineThresholdLabel}>Active</Text>
              </View>
            </View>
          </View>

          {/* Phase 2: Sleep and HRV metrics */}
          {(healthMetrics.sleepHours !== undefined || healthMetrics.hrv !== undefined) && (
            <View style={styles.additionalMetricsRow}>
              {healthMetrics.sleepHours !== undefined && (
                <View style={styles.smallMetricCard}>
                  <Text style={styles.smallMetricIcon}>😴</Text>
                  <Text style={styles.smallMetricLabel}>Sleep</Text>
                  <Text style={styles.smallMetricValue}>
                    {healthMetrics.sleepHours.toFixed(1)}h
                  </Text>
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

        {/* Streak Display (Requirement 2.4) */}
        <View style={styles.streakContainer}>
          <StreakDisplay
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            style={styles.streakCard}
          />
        </View>

        {/* Quick Access Buttons for Achievements & Customization (Requirements 1.3, 5.1) */}
        <View style={styles.quickAccessContainer}>
          <TouchableOpacity
            style={styles.quickAccessButton}
            onPress={handleNavigateToAchievements}
            accessibilityLabel="View achievements">
            <Text style={styles.quickAccessIcon}>🏆</Text>
            <Text style={styles.quickAccessText}>Achievements</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAccessButton}
            onPress={handleNavigateToCustomization}
            accessibilityLabel="Customize Symbi">
            <Text style={styles.quickAccessIcon}>🎨</Text>
            <Text style={styles.quickAccessText}>Customize</Text>
          </TouchableOpacity>
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

      {/* Floating Action Button for Habitat Interaction */}
      <Pressable
        style={styles.fab}
        onPress={() => {
          // Trigger burst at random position in upper half of screen
          const x = Math.random() * SCREEN_WIDTH;
          const y = 100 + Math.random() * 300;
          if (__DEV__) {
            console.log('[MainScreen] FAB pressed, triggering burst at:', { x, y });
          }
          habitatRef.current?.triggerBackgroundTap({ x, y });
        }}
        accessibilityLabel="Trigger habitat effect">
        <Text style={styles.fabText}>✨</Text>
      </Pressable>

      {/* Debug Panel (DEV only) - Fixed to right side */}
      {__DEV__ && (
        <DebugPanel
          emotionalState={emotionalState}
          steps={healthMetrics.steps}
          lastUpdated={formattedLastUpdated}
        />
      )}
    </View>
  );
};

/**
 * Debug Panel Component (DEV only)
 * Fixed panel on right side with state controls and debug info
 */
interface DebugPanelProps {
  emotionalState: EmotionalState;
  steps: number;
  lastUpdated: string;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ emotionalState, steps, lastUpdated }) => {
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
    <View style={styles.debugPanel}>
      <Text style={styles.debugPanelTitle}>🛠 Debug</Text>
      <Text style={styles.debugPanelText}>State: {emotionalState}</Text>
      <Text style={styles.debugPanelText}>Steps: {steps}</Text>
      <Text style={styles.debugPanelText}>Updated: {lastUpdated}</Text>
      <View style={styles.debugPanelDivider} />
      <TouchableOpacity style={[styles.debugButton, styles.debugButtonSad]} onPress={handleSetSad}>
        <Text style={styles.debugButtonText}>😢</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.debugButton, styles.debugButtonResting]}
        onPress={handleSetResting}>
        <Text style={styles.debugButtonText}>😌</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.debugButton, styles.debugButtonActive]}
        onPress={handleSetActive}>
        <Text style={styles.debugButtonText}>🎉</Text>
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
  screenContainer: {
    flex: 1,
    backgroundColor: HALLOWEEN_COLORS.darkBg,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Allow habitat to show through
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: LAYOUT.horizontalPadding,
    marginTop: LAYOUT.horizontalPadding,
    marginBottom: 10,
    backgroundColor: 'rgba(22, 33, 62, 0.9)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: HALLOWEEN_COLORS.primary,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  titleTextContainer: {
    flexDirection: 'column',
  },
  title: {
    fontSize: TYPOGRAPHY.headingSize,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.primaryLight,
    lineHeight: TYPOGRAPHY.headingSize + 2,
  },
  tagline: {
    fontSize: 11,
    color: TEXT_COLORS.secondary,
    marginTop: -2,
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
  _unusedDebugText: {
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
  debugPanel: {
    position: 'absolute',
    right: 8,
    top: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: HALLOWEEN_COLORS.primary,
    zIndex: 1001,
    minWidth: 80,
  },
  debugPanelTitle: {
    color: HALLOWEEN_COLORS.primaryLight,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  debugPanelText: {
    color: TEXT_COLORS.muted,
    fontSize: 9,
    marginBottom: 2,
  },
  debugPanelDivider: {
    height: 1,
    backgroundColor: BORDER_COLORS.secondary,
    marginVertical: 6,
  },
  debugButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 4,
  },
  debugButtonSad: {
    backgroundColor: STATE_COLORS.sad,
  },
  debugButtonResting: {
    backgroundColor: HALLOWEEN_COLORS.primary,
  },
  debugButtonActive: {
    backgroundColor: STATE_COLORS.active,
  },
  debugButtonText: {
    fontSize: 14,
  },
  metricsContainer: {
    paddingHorizontal: LAYOUT.horizontalPadding,
    marginBottom: LAYOUT.horizontalPadding,
  },
  metricCard: {
    backgroundColor: 'rgba(22, 33, 62, 0.9)',
    borderRadius: 16,
    padding: LAYOUT.horizontalPadding,
    alignItems: 'center',
    borderWidth: 1,
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
  inCardProgressContainer: {
    width: '100%',
    marginTop: 16,
    marginBottom: 8,
  },
  inCardProgressBarBackground: {
    height: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.5)',
  },
  inCardProgressBarFill: {
    height: '100%',
    borderRadius: 10,
  },
  inCardProgressText: {
    textAlign: 'center',
    marginTop: 6,
    fontSize: TYPOGRAPHY.headingSize,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.ghostWhite,
  },
  inlineThresholdsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLORS.secondary,
    width: '100%',
  },
  inlineThresholdItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  inlineThresholdValue: {
    fontSize: 12,
    fontWeight: '600',
    color: HALLOWEEN_COLORS.primaryLight,
    textAlign: 'center',
  },
  inlineThresholdLabel: {
    fontSize: 10,
    color: TEXT_COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  inlineThresholdDivider: {
    width: 1,
    height: 24,
    backgroundColor: BORDER_COLORS.secondary,
  },
  additionalMetricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  smallMetricCard: {
    flex: 1,
    backgroundColor: 'rgba(22, 33, 62, 0.9)',
    borderRadius: LAYOUT.cardBorderRadius,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: HALLOWEEN_COLORS.primary,
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

  streakContainer: {
    paddingHorizontal: LAYOUT.horizontalPadding,
    marginBottom: LAYOUT.horizontalPadding,
  },
  streakCard: {
    borderWidth: 2,
    borderColor: HALLOWEEN_COLORS.primary,
  },
  quickAccessContainer: {
    flexDirection: 'row',
    paddingHorizontal: LAYOUT.horizontalPadding,
    marginBottom: LAYOUT.horizontalPadding,
    gap: 12,
  },
  quickAccessButton: {
    flex: 1,
    backgroundColor: 'rgba(22, 33, 62, 0.9)',
    borderRadius: LAYOUT.cardBorderRadius,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: HALLOWEEN_COLORS.primary,
  },
  quickAccessIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  quickAccessText: {
    fontSize: TYPOGRAPHY.smallSize,
    fontWeight: '600',
    color: HALLOWEEN_COLORS.primaryLight,
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
    backgroundColor: 'rgba(22, 33, 62, 0.9)',
    borderRadius: LAYOUT.cardBorderRadius,
    padding: 16,
    borderWidth: 1,
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
  lastUpdated: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.captionSize,
    color: TEXT_COLORS.muted,
    marginBottom: LAYOUT.horizontalPadding,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: HALLOWEEN_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.card,
    zIndex: 1000,
  },
  fabText: {
    fontSize: 24,
  },
});
