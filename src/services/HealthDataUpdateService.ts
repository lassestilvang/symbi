import { createHealthDataService, HealthDataService } from './HealthDataService';
import { EmotionalStateCalculator } from './EmotionalStateCalculator';
import { StorageService } from './StorageService';
import { useSymbiStateStore } from '../stores/symbiStateStore';
import { useUserPreferencesStore } from '../stores/userPreferencesStore';
import { useHealthDataStore } from '../stores/healthDataStore';
import { useAchievementStore } from '../stores/achievementStore';
import { useStreakStore } from '../stores/streakStore';
import { HealthDataCache, HealthDataType, HealthMetrics, EmotionalState } from '../types';
import { getAchievementService } from './AchievementService';
import { getStreakService } from './StreakService';
import { getChallengeService } from './ChallengeService';
import { EvolutionSystem } from './EvolutionSystem';

/**
 * HealthDataUpdateService
 *
 * Manages the daily health data fetch cycle and emotional state updates.
 * Coordinates between health data services, emotional state calculator,
 * and state stores.
 *
 * Also integrates with the gamification system:
 * - Triggers achievement checks on health data updates
 * - Connects emotional state results to streak tracking
 * - Updates challenge progress in real-time
 * - Tracks daily state for evolution system
 *
 * Requirements: 1.1, 1.5, 2.1, 3.5, 4.1, 4.2, 4.3, 14.1, 14.3
 */
export class HealthDataUpdateService {
  private static healthDataService: HealthDataService | null = null;
  private static isInitialized = false;
  private static gamificationInitialized = false;

  /**
   * Initialize the health data service based on user preferences
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const profile = useUserPreferencesStore.getState().profile;
    const dataSource = profile?.preferences.dataSource || 'manual';

    this.healthDataService = createHealthDataService(dataSource);
    this.isInitialized = true;

    // Subscribe to background updates
    this.subscribeToHealthDataUpdates();

    // Load cached data first to show something immediately
    await this.loadCachedHealthData();

    // Initialize gamification services
    await this.initializeGamification();
  }

  /**
   * Initialize gamification services (achievements, streaks, challenges)
   * Requirements: 1.1, 2.1, 3.5
   */
  private static async initializeGamification(): Promise<void> {
    if (this.gamificationInitialized) return;

    try {
      // Initialize achievement service
      const achievementService = getAchievementService();
      await achievementService.initialize();

      // Initialize streak service
      const streakService = getStreakService();
      await streakService.initialize();

      // Initialize challenge service
      const challengeService = getChallengeService();
      await challengeService.initialize();

      // Initialize stores
      await useAchievementStore.getState().initialize();
      await useStreakStore.getState().initialize();

      this.gamificationInitialized = true;
      console.log('[HealthDataUpdateService] Gamification services initialized');
    } catch (error) {
      console.error('[HealthDataUpdateService] Error initializing gamification:', error);
    }
  }

  /**
   * Fetch today's health data and update emotional state
   * Called on app launch and periodically throughout the day
   */
  static async updateDailyHealthData(): Promise<void> {
    try {
      await this.initialize();

      if (!this.healthDataService) {
        console.error('Health data service not initialized');
        throw new Error('Health data service not initialized');
      }

      // Set loading state
      const healthStore = useHealthDataStore.getState();
      healthStore.setLoading(true);

      // Get today's date range
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      console.log(
        `[HealthDataUpdateService] Fetching data for: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`
      );
      console.log(
        `[HealthDataUpdateService] Date keys: start=${startOfDay.toISOString().split('T')[0]}, end=${endOfDay.toISOString().split('T')[0]}`
      );

      // Fetch step count
      const steps = await this.healthDataService.getStepCount(startOfDay, endOfDay);

      // Fetch additional metrics if available (Phase 2+)
      let sleepHours: number | undefined;
      let hrv: number | undefined;

      try {
        sleepHours = await this.healthDataService.getSleepDuration(startOfDay, endOfDay);
        if (sleepHours === 0) sleepHours = undefined;
      } catch {
        // Sleep data not available, continue without it
        console.log('Sleep data not available');
      }

      try {
        hrv = await this.healthDataService.getHeartRateVariability(startOfDay, endOfDay);
        if (hrv === 0) hrv = undefined;
      } catch {
        // HRV data not available, continue without it
        console.log('HRV data not available');
      }

      // Get user thresholds
      const profile = useUserPreferencesStore.getState().profile;
      const thresholds = profile?.thresholds || {
        sadThreshold: 2000,
        activeThreshold: 8000,
      };

      // Calculate emotional state
      const emotionalState = EmotionalStateCalculator.calculateStateFromSteps(steps, thresholds);

      // Create health metrics
      const metrics: HealthMetrics = { steps, sleepHours, hrv };

      // Update health data store
      await healthStore.updateHealthData(metrics, emotionalState, 'rule-based');

      // Update Symbi state store with transition animation
      const symbiStore = useSymbiStateStore.getState();
      await symbiStore.transitionToState(emotionalState);

      // Clear loading state
      healthStore.setLoading(false);

      console.log(`Health data updated: ${steps} steps → ${emotionalState} state`);

      // Trigger gamification updates (Requirements: 1.1, 2.1, 3.5)
      await this.updateGamificationSystems(metrics, emotionalState);
    } catch (error) {
      console.error('Error updating daily health data:', error);

      // Set error state
      const healthStore = useHealthDataStore.getState();
      healthStore.setLoading(false);

      // Fallback to cached data
      await this.loadCachedHealthData();

      throw error;
    }
  }

  /**
   * Update gamification systems with new health data
   * Requirements: 1.1, 2.1, 3.5
   *
   * @param metrics - Current health metrics
   * @param emotionalState - Calculated emotional state
   */
  private static async updateGamificationSystems(
    metrics: HealthMetrics,
    emotionalState: EmotionalState
  ): Promise<void> {
    try {
      await this.initializeGamification();

      const today = this.getDateKey(new Date());

      // 1. Check for achievement milestones (Requirement 1.1)
      await this.checkAchievementMilestones(metrics);

      // 2. Update streak tracking based on emotional state (Requirement 2.1)
      await this.updateStreakTracking(today, emotionalState);

      // 3. Update challenge progress (Requirement 3.5)
      await this.updateChallengeProgress(metrics);

      // 4. Track daily state for evolution system
      await this.trackEvolutionProgress(emotionalState);

      console.log('[HealthDataUpdateService] Gamification systems updated');
    } catch (error) {
      console.error('[HealthDataUpdateService] Error updating gamification:', error);
      // Don't throw - gamification errors shouldn't break health data flow
    }
  }

  /**
   * Check for achievement milestones based on health metrics
   * Requirement 1.1: WHEN a user reaches a defined milestone THEN record achievement
   */
  private static async checkAchievementMilestones(metrics: HealthMetrics): Promise<void> {
    try {
      const achievementService = getAchievementService();
      const newAchievements = await achievementService.checkMilestone(metrics);

      if (newAchievements.length > 0) {
        // Refresh achievement store to reflect new unlocks
        useAchievementStore.getState().refreshAchievements();
        console.log(
          `[HealthDataUpdateService] Unlocked ${newAchievements.length} achievement(s):`,
          newAchievements.map(a => a.name)
        );
      }
    } catch (error) {
      console.error('[HealthDataUpdateService] Error checking achievements:', error);
    }
  }

  /**
   * Update streak tracking based on emotional state
   * Requirement 2.1: WHEN user meets daily health criteria THEN increment streak
   *
   * Criteria: User is in Active or Vibrant state (positive states)
   */
  private static async updateStreakTracking(
    date: string,
    emotionalState: EmotionalState
  ): Promise<void> {
    try {
      const streakService = getStreakService();

      // Determine if user met daily criteria (Active or Vibrant states)
      const positiveStates = [EmotionalState.ACTIVE, EmotionalState.VIBRANT];
      const metCriteria = positiveStates.includes(emotionalState);

      const update = await streakService.recordDailyProgress(date, metCriteria);

      // Refresh streak store
      useStreakStore.getState().refreshStreak();

      if (update.milestoneReached) {
        console.log(
          `[HealthDataUpdateService] Streak milestone reached: ${update.milestoneReached.days} days`
        );
      }

      if (update.wasReset) {
        console.log('[HealthDataUpdateService] Streak was reset');
      }
    } catch (error) {
      console.error('[HealthDataUpdateService] Error updating streak:', error);
    }
  }

  /**
   * Update challenge progress with current health data
   * Requirement 3.5: WHILE challenge is active THEN track progress in real-time
   */
  private static async updateChallengeProgress(metrics: HealthMetrics): Promise<void> {
    try {
      const challengeService = getChallengeService();
      await challengeService.initialize();

      // Get weekly health data for challenge calculations
      const weeklyData = await this.getWeeklyHealthData();

      // Create current day's cache entry
      const today = this.getDateKey(new Date());
      const currentData: HealthDataCache = {
        date: today,
        steps: metrics.steps,
        sleepHours: metrics.sleepHours,
        hrv: metrics.hrv,
        emotionalState: EmotionalState.RESTING, // Will be overwritten
        calculationMethod: 'rule-based',
        lastUpdated: new Date(),
      };

      // Update all challenge progress
      await challengeService.updateAllChallengeProgress(currentData, weeklyData);
    } catch (error) {
      console.error('[HealthDataUpdateService] Error updating challenges:', error);
    }
  }

  /**
   * Track daily emotional state for evolution system
   */
  private static async trackEvolutionProgress(emotionalState: EmotionalState): Promise<void> {
    try {
      await EvolutionSystem.trackDailyState(emotionalState);
    } catch (error) {
      console.error('[HealthDataUpdateService] Error tracking evolution:', error);
    }
  }

  /**
   * Get health data for the current week
   */
  private static async getWeeklyHealthData(): Promise<HealthDataCache[]> {
    try {
      const cache = await StorageService.getHealthDataCache();
      if (!cache) return [];

      // Get start of current week (Monday)
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(today.setDate(diff));
      weekStart.setHours(0, 0, 0, 0);

      const weekStartKey = this.getDateKey(weekStart);

      // Filter cache entries for current week
      return Object.values(cache).filter(entry => entry.date >= weekStartKey);
    } catch (error) {
      console.error('[HealthDataUpdateService] Error getting weekly data:', error);
      return [];
    }
  }

  /**
   * Load cached health data when fresh data is unavailable
   */
  private static async loadCachedHealthData(): Promise<void> {
    try {
      const cache = await StorageService.getHealthDataCache();
      if (!cache) {
        console.log('[HealthDataUpdateService] No cached health data available');
        return;
      }

      console.log(
        `[HealthDataUpdateService] Found ${Object.keys(cache).length} cached entries:`,
        Object.keys(cache)
      );

      // Get today's or most recent cached data
      const today = this.getDateKey(new Date());
      let cacheEntry = cache[today];

      if (!cacheEntry) {
        // Find most recent entry
        const sortedDates = Object.keys(cache).sort().reverse();
        if (sortedDates.length > 0) {
          console.log(
            `[HealthDataUpdateService] No data for today (${today}), using most recent: ${sortedDates[0]}`
          );
          cacheEntry = cache[sortedDates[0]];
        }
      } else {
        console.log(`[HealthDataUpdateService] Found data for today (${today})`);
      }

      if (cacheEntry) {
        // Update health data store with cached data
        const healthStore = useHealthDataStore.getState();
        const metrics: HealthMetrics = {
          steps: cacheEntry.steps,
          sleepHours: cacheEntry.sleepHours,
          hrv: cacheEntry.hrv,
        };

        healthStore.setHealthMetrics(metrics);
        healthStore.setEmotionalState(cacheEntry.emotionalState, cacheEntry.calculationMethod);

        // Update Symbi state store
        const symbiStore = useSymbiStateStore.getState();
        symbiStore.setEmotionalState(cacheEntry.emotionalState);

        console.log(
          `[HealthDataUpdateService] Loaded cached health data: ${cacheEntry.steps} steps → ${cacheEntry.emotionalState} state`
        );
      }
    } catch (error) {
      console.error('Error loading cached health data:', error);
    }
  }

  /**
   * Subscribe to background health data updates
   * Updates emotional state when new data arrives
   */
  private static subscribeToHealthDataUpdates(): void {
    if (!this.healthDataService) return;

    this.healthDataService.subscribeToUpdates(HealthDataType.STEPS, async data => {
      console.log('Received background health data update:', data);
      await this.updateDailyHealthData();
    });
  }

  /**
   * Manually refresh health data
   * Can be called by user pull-to-refresh or button press
   */
  static async refreshHealthData(): Promise<void> {
    await this.updateDailyHealthData();
  }

  /**
   * Get today's cached health data
   */
  static async getTodayHealthData(): Promise<HealthDataCache | null> {
    try {
      const cache = await StorageService.getHealthDataCache();
      if (!cache) return null;

      const today = this.getDateKey(new Date());
      return cache[today] || null;
    } catch (error) {
      console.error('Error getting today health data:', error);
      return null;
    }
  }

  /**
   * Get health data for a specific date
   */
  static async getHealthDataForDate(date: Date): Promise<HealthDataCache | null> {
    try {
      const cache = await StorageService.getHealthDataCache();
      if (!cache) return null;

      const dateKey = this.getDateKey(date);
      return cache[dateKey] || null;
    } catch (error) {
      console.error('Error getting health data for date:', error);
      return null;
    }
  }

  /**
   * Get date key in YYYY-MM-DD format
   */
  private static getDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Reset the service (for testing or logout)
   */
  static reset(): void {
    if (this.healthDataService) {
      this.healthDataService.unsubscribeFromUpdates(HealthDataType.STEPS);
    }
    this.healthDataService = null;
    this.isInitialized = false;
    this.gamificationInitialized = false;
  }
}
