/* eslint-disable @typescript-eslint/no-require-imports */
import { Platform } from 'react-native';
import { HealthDataType, DataSource } from '../types';

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

/**
 * Type-safe callback types for health data updates
 */
export type HealthDataValue = number | { value: number; timestamp: Date };
export type HealthDataCallback = (data: HealthDataValue) => void;

export abstract class HealthDataService {
  protected updateCallbacks: Map<HealthDataType, HealthDataCallback> = new Map();

  abstract initialize(permissions: HealthPermissions): Promise<InitResult>;
  abstract checkAuthorizationStatus(permissions: HealthPermissions): Promise<AuthStatus>;
  abstract getStepCount(startDate: Date, endDate: Date): Promise<number>;
  abstract getSleepDuration(startDate: Date, endDate: Date): Promise<number>;
  abstract getHeartRateVariability(startDate: Date, endDate: Date): Promise<number>;
  abstract writeMindfulMinutes(duration: number, timestamp: Date): Promise<boolean>;

  subscribeToUpdates(dataType: HealthDataType, callback: HealthDataCallback): void {
    this.updateCallbacks.set(dataType, callback);
  }

  unsubscribeFromUpdates(dataType: HealthDataType): void {
    this.updateCallbacks.delete(dataType);
  }

  protected notifyUpdate(dataType: HealthDataType, data: HealthDataValue): void {
    const callback = this.updateCallbacks.get(dataType);
    if (callback) {
      callback(data);
    }
  }
}

/**
 * Factory function to create platform-specific health data service
 *
 * @param dataSource - Optional data source override
 * @returns Platform-appropriate HealthDataService implementation
 */
export function createHealthDataService(dataSource?: DataSource): HealthDataService {
  // If manual is explicitly requested, return ManualHealthDataService
  if (dataSource === 'manual') {
    const { ManualHealthDataService } = require('./ManualHealthDataService');
    return new ManualHealthDataService() as HealthDataService;
  }

  // Otherwise, use platform-specific service
  if (Platform.OS === 'ios') {
    const { HealthKitService } = require('./HealthKitService');
    return new HealthKitService() as HealthDataService;
  } else if (Platform.OS === 'android') {
    const { GoogleFitService } = require('./GoogleFitService');
    return new GoogleFitService() as HealthDataService;
  } else {
    // Fallback to manual for unsupported platforms (web, etc.)
    const { ManualHealthDataService } = require('./ManualHealthDataService');
    return new ManualHealthDataService() as HealthDataService;
  }
}
