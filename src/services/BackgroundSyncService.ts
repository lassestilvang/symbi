import { Platform, AppState, AppStateStatus } from 'react-native';
import { HealthDataType } from '../types';
import { createHealthDataService } from './HealthDataService';

/**
 * BackgroundSyncService manages background data synchronization
 * for health data updates across iOS and Android platforms.
 */
export class BackgroundSyncService {
  private static instance: BackgroundSyncService | null = null;
  private healthService = createHealthDataService();
  private syncInterval: NodeJS.Timeout | null = null;
  private appStateSubscription: any = null;
  private isActive = false;

  // Minimum interval between syncs (15 minutes in milliseconds)
  private static readonly MIN_SYNC_INTERVAL = 15 * 60 * 1000;

  private constructor() {
    this.setupAppStateListener();
  }

  static getInstance(): BackgroundSyncService {
    if (!BackgroundSyncService.instance) {
      BackgroundSyncService.instance = new BackgroundSyncService();
    }
    return BackgroundSyncService.instance;
  }

  /**
   * Start background sync for health data
   */
  async startBackgroundSync(
    dataTypes: HealthDataType[],
    onUpdate: (dataType: HealthDataType, data: any) => void
  ): Promise<void> {
    if (this.isActive) {
      console.log('Background sync already active');
      return;
    }

    this.isActive = true;

    // Subscribe to updates for each data type
    dataTypes.forEach((dataType) => {
      this.healthService.subscribeToUpdates(dataType, (data) => {
        onUpdate(dataType, data);
      });
    });

    // Set up periodic sync
    this.setupPeriodicSync(dataTypes, onUpdate);

    console.log('Background sync started');
  }

  /**
   * Stop background sync
   */
  stopBackgroundSync(): void {
    if (!this.isActive) {
      return;
    }

    // Clear interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    // Unsubscribe from all updates
    Object.values(HealthDataType).forEach((dataType) => {
      this.healthService.unsubscribeFromUpdates(dataType);
    });

    this.isActive = false;

    console.log('Background sync stopped');
  }

  /**
   * Manually trigger a sync
   */
  async triggerSync(
    dataTypes: HealthDataType[],
    onUpdate: (dataType: HealthDataType, data: any) => void
  ): Promise<void> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

    for (const dataType of dataTypes) {
      try {
        let data: any = null;

        switch (dataType) {
          case HealthDataType.STEPS:
            const steps = await this.healthService.getStepCount(startDate, endDate);
            data = { steps, timestamp: new Date() };
            break;

          case HealthDataType.SLEEP:
            const sleepHours = await this.healthService.getSleepDuration(startDate, endDate);
            data = { sleepHours, timestamp: new Date() };
            break;

          case HealthDataType.HRV:
            const hrv = await this.healthService.getHeartRateVariability(startDate, endDate);
            data = { hrv, timestamp: new Date() };
            break;
        }

        if (data) {
          onUpdate(dataType, data);
        }
      } catch (error) {
        console.error(`Error syncing ${dataType}:`, error);
      }
    }
  }

  /**
   * Configure iOS background fetch
   */
  private configureIOSBackgroundFetch(): void {
    if (Platform.OS !== 'ios') return;

    // Note: In a production app, you would use expo-background-fetch or
    // react-native-background-fetch to properly configure background tasks
    console.log('iOS background fetch configured (requires native module)');
  }

  /**
   * Configure Android WorkManager
   */
  private configureAndroidWorkManager(): void {
    if (Platform.OS !== 'android') return;

    // Note: In a production app, you would use expo-task-manager or
    // a native WorkManager implementation for periodic background tasks
    console.log('Android WorkManager configured (requires native module)');
  }

  /**
   * Set up periodic sync using JavaScript interval
   * Note: This only works when app is in foreground or background (not terminated)
   */
  private setupPeriodicSync(
    dataTypes: HealthDataType[],
    onUpdate: (dataType: HealthDataType, data: any) => void
  ): void {
    // Clear existing interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Set up new interval
    this.syncInterval = setInterval(async () => {
      if (AppState.currentState !== 'active') {
        // Only sync when app is not in foreground to save battery
        await this.triggerSync(dataTypes, onUpdate);
      }
    }, BackgroundSyncService.MIN_SYNC_INTERVAL);

    // Configure platform-specific background fetch
    this.configureIOSBackgroundFetch();
    this.configureAndroidWorkManager();
  }

  /**
   * Set up app state listener to handle app lifecycle
   */
  private setupAppStateListener(): void {
    this.appStateSubscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange.bind(this)
    );
  }

  /**
   * Handle app state changes
   */
  private handleAppStateChange(nextAppState: AppStateStatus): void {
    if (nextAppState === 'active' && this.isActive) {
      // App came to foreground, trigger a sync
      console.log('App became active, triggering sync');
    } else if (nextAppState === 'background' && this.isActive) {
      // App went to background
      console.log('App went to background');
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopBackgroundSync();

    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    BackgroundSyncService.instance = null;
  }
}

// Export singleton instance getter
export const getBackgroundSyncService = () => BackgroundSyncService.getInstance();
