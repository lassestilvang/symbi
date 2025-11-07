import { Platform } from 'react-native';
import { HealthDataType } from '../types';
import { createHealthDataService } from './HealthDataService';
import { HealthPermissions, AuthStatus } from './HealthDataService';

/**
 * PermissionService
 * 
 * Handles health data permission requests for both iOS (HealthKit) and Android (Google Fit).
 * Provides a unified interface for requesting permissions and checking authorization status.
 * 
 * Requirements: 1.1, 13.3, 11.1
 */

export interface PermissionResult {
  granted: boolean;
  dataSource: 'healthkit' | 'googlefit' | 'manual';
  error?: string;
}

export class PermissionService {
  /**
   * Request health data permissions from the platform-specific health service
   * Now includes Phase 2 permissions (sleep and HRV) by default
   * 
   * @returns PermissionResult indicating whether permissions were granted
   */
  static async requestHealthPermissions(): Promise<PermissionResult> {
    try {
      // Determine the data source based on platform
      const dataSource = Platform.OS === 'ios' ? 'healthkit' : 'googlefit';
      
      // Create the appropriate health data service
      const healthService = createHealthDataService(dataSource);
      
      // Define the permissions we need (Phase 2: includes sleep and HRV)
      const permissions: HealthPermissions = {
        read: [HealthDataType.STEPS, HealthDataType.SLEEP, HealthDataType.HRV],
        write: [], // Phase 2 only needs read permissions
      };
      
      // Initialize the service and request permissions
      const result = await healthService.initialize(permissions);
      
      if (result.success) {
        return {
          granted: true,
          dataSource,
        };
      } else {
        return {
          granted: false,
          dataSource: 'manual',
          error: result.error,
        };
      }
    } catch (error) {
      console.error('Error requesting health permissions:', error);
      return {
        granted: false,
        dataSource: 'manual',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if health data permissions have been granted
   * Now checks Phase 2 permissions (sleep and HRV)
   * 
   * @returns AuthStatus indicating the current authorization state
   */
  static async checkPermissionStatus(): Promise<AuthStatus> {
    try {
      const dataSource = Platform.OS === 'ios' ? 'healthkit' : 'googlefit';
      const healthService = createHealthDataService(dataSource);
      
      const permissions: HealthPermissions = {
        read: [HealthDataType.STEPS, HealthDataType.SLEEP, HealthDataType.HRV],
        write: [],
      };
      
      return await healthService.checkAuthorizationStatus(permissions);
    } catch (error) {
      console.error('Error checking permission status:', error);
      return AuthStatus.NOT_DETERMINED;
    }
  }

  /**
   * Request Phase 2 permissions (sleep and HRV)
   * This will be used when Phase 2 features are enabled
   * 
   * @returns PermissionResult indicating whether permissions were granted
   */
  static async requestPhase2Permissions(): Promise<PermissionResult> {
    try {
      const dataSource = Platform.OS === 'ios' ? 'healthkit' : 'googlefit';
      const healthService = createHealthDataService(dataSource);
      
      const permissions: HealthPermissions = {
        read: [HealthDataType.STEPS, HealthDataType.SLEEP, HealthDataType.HRV],
        write: [],
      };
      
      const result = await healthService.initialize(permissions);
      
      if (result.success) {
        return {
          granted: true,
          dataSource,
        };
      } else {
        return {
          granted: false,
          dataSource: 'manual',
          error: result.error,
        };
      }
    } catch (error) {
      console.error('Error requesting Phase 2 permissions:', error);
      return {
        granted: false,
        dataSource: 'manual',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Request Phase 3 permissions (mindful minutes write)
   * This will be used when Phase 3 features are enabled
   * 
   * @returns PermissionResult indicating whether permissions were granted
   */
  static async requestPhase3Permissions(): Promise<PermissionResult> {
    try {
      const dataSource = Platform.OS === 'ios' ? 'healthkit' : 'googlefit';
      const healthService = createHealthDataService(dataSource);
      
      const permissions: HealthPermissions = {
        read: [HealthDataType.STEPS, HealthDataType.SLEEP, HealthDataType.HRV],
        write: [HealthDataType.MINDFUL_MINUTES],
      };
      
      const result = await healthService.initialize(permissions);
      
      if (result.success) {
        return {
          granted: true,
          dataSource,
        };
      } else {
        return {
          granted: false,
          dataSource: 'manual',
          error: result.error,
        };
      }
    } catch (error) {
      console.error('Error requesting Phase 3 permissions:', error);
      return {
        granted: false,
        dataSource: 'manual',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get a user-friendly explanation for why permissions are needed
   * 
   * @param dataType The type of health data
   * @returns A user-friendly explanation string
   */
  static getPermissionExplanation(dataType: HealthDataType): string {
    switch (dataType) {
      case HealthDataType.STEPS:
        return 'We use your step count to determine your Symbi\'s emotional state. More steps mean a happier Symbi!';
      case HealthDataType.SLEEP:
        return 'We use your sleep data to know if your Symbi is well-rested and energized.';
      case HealthDataType.HRV:
        return 'We use your heart rate variability to understand your stress levels and overall wellbeing.';
      case HealthDataType.MINDFUL_MINUTES:
        return 'We write mindful minutes when you complete wellness activities with your Symbi.';
      default:
        return 'This data helps us provide a better experience with your Symbi.';
    }
  }

  /**
   * Get the platform-specific health service name
   * 
   * @returns The name of the health service (Apple Health or Google Fit)
   */
  static getPlatformHealthServiceName(): string {
    return Platform.OS === 'ios' ? 'Apple Health' : 'Google Fit';
  }
}
