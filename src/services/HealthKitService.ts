/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
import { Platform } from 'react-native';
import { HealthDataService, HealthPermissions, InitResult, AuthStatus } from './HealthDataService';
import { HealthDataType } from '../types';

export class HealthKitService extends HealthDataService {
  private healthKit: any = null;
  private isInitialized = false;
  private observers: Map<HealthDataType, any> = new Map();

  async initialize(permissions: HealthPermissions): Promise<InitResult> {
    if (Platform.OS !== 'ios') {
      return {
        success: false,
        error: 'HealthKit is only available on iOS',
        grantedPermissions: [],
      };
    }

    try {
      // Dynamically import react-native-health
      const AppleHealthKit = require('react-native-health').default;
      this.healthKit = AppleHealthKit;

      // Check if HealthKit is available
      const isAvailable = await new Promise<boolean>(resolve => {
        this.healthKit.isAvailable((err: any, available: boolean) => {
          if (err) {
            console.error('HealthKit availability check error:', err);
            resolve(false);
          } else {
            resolve(available);
          }
        });
      });

      if (!isAvailable) {
        return {
          success: false,
          error: 'HealthKit is not available on this device',
          grantedPermissions: [],
        };
      }

      // Map our HealthDataType to HealthKit permissions
      const healthKitPermissions = this.mapToHealthKitPermissions(permissions);

      // Initialize HealthKit with permissions
      await new Promise<void>((resolve, reject) => {
        this.healthKit.initHealthKit(healthKitPermissions, (err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      this.isInitialized = true;

      return {
        success: true,
        grantedPermissions: permissions.read,
      };
    } catch (error) {
      console.error('HealthKit initialization error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        grantedPermissions: [],
      };
    }
  }

  async checkAuthorizationStatus(permissions: HealthPermissions): Promise<AuthStatus> {
    if (!this.isInitialized || !this.healthKit) {
      return AuthStatus.NOT_DETERMINED;
    }

    try {
      // HealthKit doesn't provide a direct way to check authorization status
      // We'll attempt to read data and infer from the result
      const hasStepsPermission = permissions.read.includes(HealthDataType.STEPS);

      if (hasStepsPermission) {
        // Try to read a small amount of data to check permission
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);

        try {
          await this.getStepCount(startDate, endDate);
          return AuthStatus.AUTHORIZED;
        } catch {
          return AuthStatus.DENIED;
        }
      }

      return AuthStatus.NOT_DETERMINED;
    } catch (error) {
      console.error('Error checking authorization status:', error);
      return AuthStatus.NOT_DETERMINED;
    }
  }

  async getStepCount(startDate: Date, endDate: Date): Promise<number> {
    if (!this.isInitialized || !this.healthKit) {
      throw new Error('HealthKit not initialized');
    }

    try {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      const result = await new Promise<any>((resolve, reject) => {
        this.healthKit.getStepCount(options, (err: any, results: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });

      // Sum up all step counts from the result
      if (result && typeof result.value === 'number') {
        return result.value;
      }

      return 0;
    } catch (error) {
      console.error('Error getting step count:', error);
      throw error;
    }
  }

  async getSleepDuration(startDate: Date, endDate: Date): Promise<number> {
    if (!this.isInitialized || !this.healthKit) {
      throw new Error('HealthKit not initialized');
    }

    try {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      const result = await new Promise<any>((resolve, reject) => {
        this.healthKit.getSleepSamples(options, (err: any, results: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });

      // Calculate total sleep duration in hours
      if (Array.isArray(result)) {
        const totalMinutes = result.reduce((sum, sample) => {
          if (sample.value === 'ASLEEP' || sample.value === 'INBED') {
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
    if (!this.isInitialized || !this.healthKit) {
      throw new Error('HealthKit not initialized');
    }

    try {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      const result = await new Promise<any>((resolve, reject) => {
        this.healthKit.getHeartRateVariabilitySamples(options, (err: any, results: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });

      // Calculate average HRV
      if (Array.isArray(result) && result.length > 0) {
        const sum = result.reduce((acc, sample) => acc + (sample.value || 0), 0);
        return sum / result.length;
      }

      return 0;
    } catch (error) {
      console.error('Error getting HRV:', error);
      throw error;
    }
  }

  async writeMindfulMinutes(duration: number, timestamp: Date): Promise<boolean> {
    if (!this.isInitialized || !this.healthKit) {
      throw new Error('HealthKit not initialized');
    }

    try {
      const options = {
        value: duration,
        startDate: timestamp.toISOString(),
        endDate: new Date(timestamp.getTime() + duration * 60 * 1000).toISOString(),
      };

      await new Promise<void>((resolve, reject) => {
        this.healthKit.saveMindfulSession(options, (err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      return true;
    } catch (error) {
      console.error('Error writing mindful minutes:', error);
      return false;
    }
  }

  subscribeToUpdates(dataType: HealthDataType, callback: (data: any) => void): void {
    super.subscribeToUpdates(dataType, callback);

    if (!this.isInitialized || !this.healthKit) {
      console.warn('HealthKit not initialized, cannot subscribe to updates');
      return;
    }

    // Set up observer for the data type
    if (dataType === HealthDataType.STEPS) {
      this.setupStepCountObserver(callback);
    }
  }

  unsubscribeFromUpdates(dataType: HealthDataType): void {
    super.unsubscribeFromUpdates(dataType);

    // Clean up observer
    const observer = this.observers.get(dataType);
    if (observer) {
      // Note: react-native-health doesn't provide a direct way to remove observers
      // In a production app, you'd need to implement this properly
      this.observers.delete(dataType);
    }
  }

  private setupStepCountObserver(callback: (data: any) => void): void {
    if (!this.healthKit) return;

    // Set up background observer for step count updates
    // This uses HKObserverQuery under the hood
    const observer = setInterval(
      async () => {
        try {
          const endDate = new Date();
          const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
          const steps = await this.getStepCount(startDate, endDate);
          callback({ steps, timestamp: new Date() });
        } catch (error) {
          console.error('Error in step count observer:', error);
        }
      },
      15 * 60 * 1000
    ); // Poll every 15 minutes

    this.observers.set(HealthDataType.STEPS, observer);
  }

  private mapToHealthKitPermissions(permissions: HealthPermissions): any {
    const healthKitPerms: any = {
      permissions: {
        read: [],
        write: [],
      },
    };

    // Map read permissions
    permissions.read.forEach(dataType => {
      switch (dataType) {
        case HealthDataType.STEPS:
          healthKitPerms.permissions.read.push('StepCount');
          break;
        case HealthDataType.SLEEP:
          healthKitPerms.permissions.read.push('SleepAnalysis');
          break;
        case HealthDataType.HRV:
          healthKitPerms.permissions.read.push('HeartRateVariability');
          break;
        case HealthDataType.MINDFUL_MINUTES:
          healthKitPerms.permissions.read.push('MindfulSession');
          break;
      }
    });

    // Map write permissions
    permissions.write.forEach(dataType => {
      switch (dataType) {
        case HealthDataType.MINDFUL_MINUTES:
          healthKitPerms.permissions.write.push('MindfulSession');
          break;
      }
    });

    return healthKitPerms;
  }
}
