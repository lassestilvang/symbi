import { Platform } from 'react-native';
import { HealthDataService, HealthPermissions, InitResult, AuthStatus } from './HealthDataService';
import { HealthDataType } from '../types';

export class GoogleFitService extends HealthDataService {
  private googleFit: any = null;
  private isInitialized = false;
  private syncInterval: NodeJS.Timeout | null = null;

  async initialize(permissions: HealthPermissions): Promise<InitResult> {
    if (Platform.OS !== 'android') {
      return {
        success: false,
        error: 'Google Fit is only available on Android',
        grantedPermissions: [],
      };
    }

    try {
      // Dynamically import react-native-google-fit
      const GoogleFit = require('react-native-google-fit');
      this.googleFit = GoogleFit.default || GoogleFit;

      // Map our HealthDataType to Google Fit scopes
      const scopes = this.mapToGoogleFitScopes(permissions);

      // Authorize Google Fit
      const authResult = await new Promise<any>((resolve, reject) => {
        this.googleFit.authorize({
          scopes,
        })
          .then((res: any) => resolve(res))
          .catch((err: any) => reject(err));
      });

      if (!authResult.success) {
        return {
          success: false,
          error: 'Google Fit authorization failed',
          grantedPermissions: [],
        };
      }

      // Start recording for background data collection
      await this.startRecording(permissions);

      this.isInitialized = true;

      return {
        success: true,
        grantedPermissions: permissions.read,
      };
    } catch (error) {
      console.error('Google Fit initialization error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        grantedPermissions: [],
      };
    }
  }

  async checkAuthorizationStatus(permissions: HealthPermissions): Promise<AuthStatus> {
    if (!this.isInitialized || !this.googleFit) {
      return AuthStatus.NOT_DETERMINED;
    }

    try {
      const isAuthorized = await this.googleFit.isAuthorized();
      return isAuthorized ? AuthStatus.AUTHORIZED : AuthStatus.DENIED;
    } catch (error) {
      console.error('Error checking authorization status:', error);
      return AuthStatus.NOT_DETERMINED;
    }
  }

  async getStepCount(startDate: Date, endDate: Date): Promise<number> {
    if (!this.isInitialized || !this.googleFit) {
      throw new Error('Google Fit not initialized');
    }

    try {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      const result = await this.googleFit.getDailyStepCountSamples(options);

      // Google Fit returns data from multiple sources, we'll use the aggregated data
      if (Array.isArray(result) && result.length > 0) {
        // Find the source with aggregated data (usually com.google.android.gms)
        const aggregatedSource = result.find(
          (source: any) => source.source && source.source.includes('com.google')
        );

        if (aggregatedSource && Array.isArray(aggregatedSource.steps)) {
          const totalSteps = aggregatedSource.steps.reduce(
            (sum: number, step: any) => sum + (step.value || 0),
            0
          );
          return totalSteps;
        }

        // Fallback: sum all sources
        const totalSteps = result.reduce((sum: number, source: any) => {
          if (Array.isArray(source.steps)) {
            return sum + source.steps.reduce((s: number, step: any) => s + (step.value || 0), 0);
          }
          return sum;
        }, 0);

        return totalSteps;
      }

      return 0;
    } catch (error) {
      console.error('Error getting step count:', error);
      throw error;
    }
  }

  async getSleepDuration(startDate: Date, endDate: Date): Promise<number> {
    if (!this.isInitialized || !this.googleFit) {
      throw new Error('Google Fit not initialized');
    }

    try {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      const result = await this.googleFit.getSleepSamples(options);

      // Calculate total sleep duration in hours
      if (Array.isArray(result) && result.length > 0) {
        const totalMinutes = result.reduce((sum: number, sample: any) => {
          if (sample.value === 'sleep' || sample.value === 'light_sleep' || sample.value === 'deep_sleep') {
            const start = new Date(sample.startDate).getTime();
            const end = new Date(sample.endDate).getTime();
            return sum + (end - start) / (1000 * 60);
          }
          return sum;
        }, 0);

        return totalMinutes / 60; // Convert to hours
      }

      return 0;
    } catch (error) {
      console.error('Error getting sleep duration:', error);
      throw error;
    }
  }

  async getHeartRateVariability(startDate: Date, endDate: Date): Promise<number> {
    if (!this.isInitialized || !this.googleFit) {
      throw new Error('Google Fit not initialized');
    }

    try {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      // Note: Google Fit doesn't have a direct HRV API in react-native-google-fit
      // We'll need to use heart rate data as a proxy or implement custom data reading
      const result = await this.googleFit.getHeartRateSamples(options);

      // Calculate HRV approximation from heart rate variability
      if (Array.isArray(result) && result.length > 1) {
        // Simple HRV approximation: standard deviation of heart rate intervals
        const heartRates = result.map((sample: any) => sample.value);
        const mean = heartRates.reduce((sum: number, hr: number) => sum + hr, 0) / heartRates.length;
        const variance = heartRates.reduce((sum: number, hr: number) => sum + Math.pow(hr - mean, 2), 0) / heartRates.length;
        const stdDev = Math.sqrt(variance);

        // Convert to milliseconds (rough approximation)
        return stdDev * 10;
      }

      return 0;
    } catch (error) {
      console.error('Error getting HRV:', error);
      throw error;
    }
  }

  async writeMindfulMinutes(duration: number, timestamp: Date): Promise<boolean> {
    if (!this.isInitialized || !this.googleFit) {
      throw new Error('Google Fit not initialized');
    }

    try {
      const options = {
        startDate: timestamp.toISOString(),
        endDate: new Date(timestamp.getTime() + duration * 60 * 1000).toISOString(),
        activityType: 'meditation', // Google Fit activity type for mindfulness
      };

      await this.googleFit.saveActivity(options);
      return true;
    } catch (error) {
      console.error('Error writing mindful minutes:', error);
      return false;
    }
  }

  subscribeToUpdates(dataType: HealthDataType, callback: (data: any) => void): void {
    super.subscribeToUpdates(dataType, callback);

    if (!this.isInitialized || !this.googleFit) {
      console.warn('Google Fit not initialized, cannot subscribe to updates');
      return;
    }

    // Set up periodic sync for the data type
    if (dataType === HealthDataType.STEPS) {
      this.setupPeriodicSync(callback);
    }
  }

  unsubscribeFromUpdates(dataType: HealthDataType): void {
    super.unsubscribeFromUpdates(dataType);

    // Clean up periodic sync
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private async startRecording(permissions: HealthPermissions): Promise<void> {
    if (!this.googleFit) return;

    try {
      // Start recording for step count
      if (permissions.read.includes(HealthDataType.STEPS)) {
        await this.googleFit.startRecording((callback: any) => {
          // Recording started callback
          console.log('Google Fit recording started');
        });
      }
    } catch (error) {
      console.error('Error starting Google Fit recording:', error);
    }
  }

  private setupPeriodicSync(callback: (data: any) => void): void {
    // Set up periodic sync every 15 minutes
    this.syncInterval = setInterval(async () => {
      try {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
        const steps = await this.getStepCount(startDate, endDate);
        callback({ steps, timestamp: new Date() });
      } catch (error) {
        console.error('Error in periodic sync:', error);
      }
    }, 15 * 60 * 1000); // Poll every 15 minutes
  }

  private mapToGoogleFitScopes(permissions: HealthPermissions): string[] {
    const scopes: string[] = [];

    // Map read permissions
    permissions.read.forEach((dataType) => {
      switch (dataType) {
        case HealthDataType.STEPS:
          scopes.push('https://www.googleapis.com/auth/fitness.activity.read');
          break;
        case HealthDataType.SLEEP:
          scopes.push('https://www.googleapis.com/auth/fitness.sleep.read');
          break;
        case HealthDataType.HRV:
          scopes.push('https://www.googleapis.com/auth/fitness.heart_rate.read');
          break;
      }
    });

    // Map write permissions
    permissions.write.forEach((dataType) => {
      switch (dataType) {
        case HealthDataType.MINDFUL_MINUTES:
          scopes.push('https://www.googleapis.com/auth/fitness.activity.write');
          break;
      }
    });

    // Remove duplicates
    return [...new Set(scopes)];
  }
}
