import { createHealthDataService, HealthDataService } from './HealthDataService';
import { EmotionalStateCalculator } from './EmotionalStateCalculator';
import { StorageService } from './StorageService';
import { useSymbiStateStore } from '../stores/symbiStateStore';
import { useUserPreferencesStore } from '../stores/userPreferencesStore';
import { EmotionalState, HealthDataCache, HealthDataType } from '../types';

/**
 * HealthDataUpdateService
 * 
 * Manages the daily health data fetch cycle and emotional state updates.
 * Coordinates between health data services, emotional state calculator,
 * and state stores.
 * 
 * Requirements: 1.5, 4.1, 4.2, 4.3, 14.1, 14.3
 */
export class HealthDataUpdateService {
  private static healthDataService: HealthDataService | null = null;
  private static isInitialized = false;

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
        return;
      }

      // Get today's date range
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      // Fetch step count
      const steps = await this.healthDataService.getStepCount(startOfDay, endOfDay);

      // Get user thresholds
      const profile = useUserPreferencesStore.getState().profile;
      const thresholds = profile?.thresholds || {
        sadThreshold: 2000,
        activeThreshold: 8000,
      };

      // Calculate emotional state
      const emotionalState = EmotionalStateCalculator.calculateStateFromSteps(
        steps,
        thresholds
      );

      // Update Zustand store
      const symbiStore = useSymbiStateStore.getState();
      await symbiStore.transitionToState(emotionalState);

      // Cache health data and emotional state
      await this.cacheHealthData(today, steps, emotionalState);

      console.log(`Health data updated: ${steps} steps → ${emotionalState} state`);
    } catch (error) {
      console.error('Error updating daily health data:', error);
      
      // Fallback to cached data
      await this.loadCachedHealthData();
    }
  }

  /**
   * Cache health data and emotional state to AsyncStorage
   */
  private static async cacheHealthData(
    date: Date,
    steps: number,
    emotionalState: EmotionalState
  ): Promise<void> {
    const dateKey = this.getDateKey(date);
    
    const cacheEntry: HealthDataCache = {
      date: dateKey,
      steps,
      emotionalState,
      calculationMethod: 'rule-based',
      lastUpdated: new Date(),
    };

    await StorageService.addHealthDataEntry(dateKey, cacheEntry);
  }

  /**
   * Load cached health data when fresh data is unavailable
   */
  private static async loadCachedHealthData(): Promise<void> {
    try {
      const cache = await StorageService.getHealthDataCache();
      if (!cache) return;

      // Get today's or most recent cached data
      const today = this.getDateKey(new Date());
      let cacheEntry = cache[today];

      if (!cacheEntry) {
        // Find most recent entry
        const sortedDates = Object.keys(cache).sort().reverse();
        if (sortedDates.length > 0) {
          cacheEntry = cache[sortedDates[0]];
        }
      }

      if (cacheEntry) {
        // Update store with cached state
        const symbiStore = useSymbiStateStore.getState();
        symbiStore.setEmotionalState(cacheEntry.emotionalState);
        
        console.log(`Loaded cached health data: ${cacheEntry.emotionalState} state`);
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

    this.healthDataService.subscribeToUpdates(
      HealthDataType.STEPS,
      async (data) => {
        console.log('Received background health data update:', data);
        await this.updateDailyHealthData();
      }
    );
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
  }
}
