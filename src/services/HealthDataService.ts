/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
import { Platform } from 'react-native';
import { HealthDataType } from '../types';

export interface HealthPermissions {
  read: HealthDataType[];
  write: HealthDataType[];
}

export interface InitResult {
  success: boolean;
  error?: string;
  grantedPermissions: HealthDataType[];
}

export enum AuthStatus {
  AUTHORIZED = 'authorized',
  DENIED = 'denied',
  NOT_DETERMINED = 'not_determined',
}

export abstract class HealthDataService {
  protected updateCallbacks: Map<HealthDataType, (data: any) => void> = new Map();

  abstract initialize(permissions: HealthPermissions): Promise<InitResult>;
  abstract checkAuthorizationStatus(permissions: HealthPermissions): Promise<AuthStatus>;
  abstract getStepCount(startDate: Date, endDate: Date): Promise<number>;
  abstract getSleepDuration(startDate: Date, endDate: Date): Promise<number>;
  abstract getHeartRateVariability(startDate: Date, endDate: Date): Promise<number>;
  abstract writeMindfulMinutes(duration: number, timestamp: Date): Promise<boolean>;

  subscribeToUpdates(dataType: HealthDataType, callback: (data: any) => void): void {
    this.updateCallbacks.set(dataType, callback);
  }

  unsubscribeFromUpdates(dataType: HealthDataType): void {
    this.updateCallbacks.delete(dataType);
  }

  protected notifyUpdate(dataType: HealthDataType, data: any): void {
    const callback = this.updateCallbacks.get(dataType);
    if (callback) {
      callback(data);
    }
  }
}

// Factory function to create platform-specific health data service
export function createHealthDataService(
  dataSource?: 'healthkit' | 'googlefit' | 'manual'
): HealthDataService {
  // If manual is explicitly requested, return ManualHealthDataService
  if (dataSource === 'manual') {
    const { ManualHealthDataService } = require('./ManualHealthDataService');
    return new ManualHealthDataService();
  }

  // Otherwise, use platform-specific service
  if (Platform.OS === 'ios') {
    const { HealthKitService } = require('./HealthKitService');
    return new HealthKitService();
  } else if (Platform.OS === 'android') {
    const { GoogleFitService } = require('./GoogleFitService');
    return new GoogleFitService();
  } else {
    // Fallback to manual for unsupported platforms (web, etc.)
    const { ManualHealthDataService } = require('./ManualHealthDataService');
    return new ManualHealthDataService();
  }
}
