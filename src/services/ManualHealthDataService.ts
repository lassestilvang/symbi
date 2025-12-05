import { HealthDataService, HealthPermissions, InitResult, AuthStatus } from './HealthDataService';
import { HealthDataType } from '../types';
import { StorageService } from './StorageService';

interface ManualHealthData {
  date: string; // ISO date string
  steps?: number;
  sleepHours?: number;
  hrv?: number;
  mindfulMinutes?: number;
}

interface ValidationConfig {
  min: number;
  max: number;
  fieldName: string;
}

export class ManualHealthDataService extends HealthDataService {
  private static readonly STORAGE_KEY = 'manual_health_data';

  // Validation configurations
  private static readonly VALIDATION_RULES: Record<string, ValidationConfig> = {
    steps: { min: 0, max: 100000, fieldName: 'Step count' },
    sleepHours: { min: 0, max: 24, fieldName: 'Sleep duration' },
    hrv: { min: 0, max: 200, fieldName: 'HRV' },
  };

  async initialize(_permissions: HealthPermissions): Promise<InitResult> {
    // Manual data entry doesn't require actual permissions
    // Just return success
    return {
      success: true,
      grantedPermissions: _permissions.read,
    };
  }

  async checkAuthorizationStatus(_permissions: HealthPermissions): Promise<AuthStatus> {
    // Manual data entry is always authorized
    return AuthStatus.AUTHORIZED;
  }

  async getStepCount(startDate: Date, endDate: Date): Promise<number> {
    try {
      const data = await this.getHealthDataForDateRange(startDate, endDate);

      // Sum up steps for all days in the range
      const totalSteps = data.reduce((sum, dayData) => sum + (dayData.steps || 0), 0);

      console.log(
        `[ManualHealthDataService] getStepCount: ${startDate.toISOString()} to ${endDate.toISOString()} = ${totalSteps} steps (${data.length} days)`
      );

      return totalSteps;
    } catch (error) {
      console.error('Error getting step count:', error);
      throw error;
    }
  }

  async getSleepDuration(startDate: Date, endDate: Date): Promise<number> {
    return this.getAverageMetric(startDate, endDate, 'sleepHours');
  }

  async getHeartRateVariability(startDate: Date, endDate: Date): Promise<number> {
    return this.getAverageMetric(startDate, endDate, 'hrv');
  }

  /**
   * Generic method to calculate average for a metric over a date range
   */
  private async getAverageMetric(
    startDate: Date,
    endDate: Date,
    field: keyof ManualHealthData
  ): Promise<number> {
    try {
      const data = await this.getHealthDataForDateRange(startDate, endDate);
      const validData = data.filter(d => d[field] !== undefined);

      if (validData.length === 0) return 0;

      const total = validData.reduce((sum, dayData) => sum + (Number(dayData[field]) || 0), 0);
      return total / validData.length;
    } catch (error) {
      console.error(`Error getting ${String(field)}:`, error);
      throw error;
    }
  }

  async writeMindfulMinutes(duration: number, timestamp: Date): Promise<boolean> {
    try {
      const dateKey = this.getDateKey(timestamp);
      const allData = await this.getAllHealthData();

      const existingData = allData[dateKey] || {};
      existingData.mindfulMinutes = (existingData.mindfulMinutes || 0) + duration;

      allData[dateKey] = existingData;

      await StorageService.set(ManualHealthDataService.STORAGE_KEY, allData);

      return true;
    } catch (error) {
      console.error('Error writing mindful minutes:', error);
      return false;
    }
  }

  /**
   * Save manual step count entry
   */
  async saveStepCount(steps: number, date: Date = new Date()): Promise<boolean> {
    return this.saveHealthMetric('steps', steps, HealthDataType.STEPS, date);
  }

  /**
   * Save manual sleep duration entry
   */
  async saveSleepDuration(hours: number, date: Date = new Date()): Promise<boolean> {
    return this.saveHealthMetric('sleepHours', hours, HealthDataType.SLEEP, date);
  }

  /**
   * Save manual HRV entry
   */
  async saveHRV(hrv: number, date: Date = new Date()): Promise<boolean> {
    return this.saveHealthMetric('hrv', hrv, HealthDataType.HRV, date);
  }

  /**
   * Generic method to save a health metric (Template Method Pattern)
   * Reduces code duplication across save methods
   */
  private async saveHealthMetric(
    field: keyof Omit<ManualHealthData, 'date' | 'mindfulMinutes'>,
    value: number,
    dataType: HealthDataType,
    date: Date
  ): Promise<boolean> {
    // Validate the value
    this.validateMetric(field, value);

    try {
      const dateKey = this.getDateKey(date);
      const allData = await this.getAllHealthData();

      // Update or create entry for this date
      const existingData = allData[dateKey] || {};
      existingData[field] = value;
      allData[dateKey] = existingData;

      // Persist to storage
      await StorageService.set(ManualHealthDataService.STORAGE_KEY, allData);

      if (__DEV__) {
        console.log(
          `[ManualHealthDataService] Saved ${value} ${field} for ${dateKey}. Total entries: ${Object.keys(allData).length}`
        );
      }

      // Notify subscribers with properly typed data
      this.notifyUpdate(dataType, { value, timestamp: date });

      return true;
    } catch (error) {
      console.error(`Error saving ${field}:`, error);
      throw error; // Throw instead of returning false for consistent error handling
    }
  }

  /**
   * Generic validation method
   * Throws descriptive error if validation fails
   */
  private validateMetric(field: string, value: number): void {
    const rules = ManualHealthDataService.VALIDATION_RULES[field];

    if (!rules) {
      throw new Error(`Unknown metric field: ${field}`);
    }

    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`${rules.fieldName} must be a valid number`);
    }

    if (value < rules.min || value > rules.max) {
      throw new Error(`${rules.fieldName} must be between ${rules.min} and ${rules.max}`);
    }
  }

  /**
   * Helper methods
   */
  private getDateKey(date: Date): string {
    // Use local date components to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private async getAllHealthData(): Promise<Record<string, ManualHealthData>> {
    const data = await StorageService.get<Record<string, ManualHealthData>>(
      ManualHealthDataService.STORAGE_KEY
    );

    if (__DEV__) {
      console.log(
        `[ManualHealthDataService] getAllHealthData: ${data ? Object.keys(data).length : 0} entries`
      );
    }

    return data || {};
  }

  /**
   * Get health data for a date range
   * Improved: Uses immutable date iteration and reduces unnecessary object spreading
   */
  private async getHealthDataForDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<ManualHealthData[]> {
    const allData = await this.getAllHealthData();
    const result: ManualHealthData[] = [];

    if (__DEV__) {
      console.log(
        `[ManualHealthDataService] getHealthDataForDateRange: ${startDate.toISOString()} to ${endDate.toISOString()}`
      );
      console.log(`[ManualHealthDataService] Available date keys:`, Object.keys(allData));
    }

    // Generate array of date keys for the range
    const dateKeys = this.generateDateKeysInRange(startDate, endDate);

    // Collect data for each date
    for (const dateKey of dateKeys) {
      const dayData = allData[dateKey];

      if (__DEV__) {
        console.log(
          `[ManualHealthDataService] Checking ${dateKey}: ${dayData ? 'FOUND' : 'NOT FOUND'}`
        );
      }

      if (dayData) {
        result.push({ ...dayData, date: dateKey });
      }
    }

    if (__DEV__) {
      console.log(`[ManualHealthDataService] Returning ${result.length} days of data`);
    }

    return result;
  }

  /**
   * Generate array of date keys (YYYY-MM-DD) for a date range
   * Uses immutable date handling to avoid mutation bugs
   */
  private generateDateKeysInRange(startDate: Date, endDate: Date): string[] {
    const dateKeys: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Normalize to start of day
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    let current = new Date(start);
    while (current <= end) {
      dateKeys.push(this.getDateKey(current));
      current = new Date(current.setDate(current.getDate() + 1));
    }

    return dateKeys;
  }

  /**
   * Get data for a specific date
   */
  async getDataForDate(date: Date): Promise<ManualHealthData | null> {
    const allData = await this.getAllHealthData();
    const dateKey = this.getDateKey(date);
    return allData[dateKey] || null;
  }

  /**
   * Clear all manual health data
   */
  async clearAllData(): Promise<boolean> {
    try {
      await StorageService.remove(ManualHealthDataService.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing health data:', error);
      return false;
    }
  }
}
