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

export interface HealthDataService {
  initialize(permissions: HealthPermissions): Promise<InitResult>;
  checkAuthorizationStatus(permissions: HealthPermissions): Promise<AuthStatus>;
  getStepCount(startDate: Date, endDate: Date): Promise<number>;
  getSleepDuration(startDate: Date, endDate: Date): Promise<number>;
  getHeartRateVariability(startDate: Date, endDate: Date): Promise<number>;
  writeMindfulMinutes(duration: number, timestamp: Date): Promise<boolean>;
  subscribeToUpdates(dataType: HealthDataType, callback: (data: any) => void): void;
  unsubscribeFromUpdates(dataType: HealthDataType): void;
}
