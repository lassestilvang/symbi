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

export class ManualHealthDataService extends HealthDataService {
  private static readonly STORAGE_KEY = 'manual_health_data';
  private static readonly MIN_STEPS = 0;
  private static readonly MAX_STEPS = 100000;
  private static readonly MIN_SLEEP = 0;
  private static readonly MAX_SLEEP = 24;
  private static readonly MIN_HRV = 0;
  private static readonly MAX_HRV = 200;

  async initialize(permissions: HealthPermissions): Promise<InitResult> {
    // Manual data entry doesn't require actual permissions
    // Just return success
    return {
      success: true,
      grantedPermissions: permissions.read,
    };
  }

  async checkAuthorizationStatus(permissions: HealthPermissions): Promise<AuthStatus> {
    // Manual data entry is always authorized
    return AuthStatus.AUTHORIZED;
  }

  async getStepCount(startDate: Date, endDate: Date): Promise<number> {
    try {
      const data = await this.getHealthDataForDateRange(startDate, endDate);
      
      // Sum up steps for all days in the range
      const totalSteps = data.reduce((sum, dayData) => sum + (dayData.steps || 0), 0);
      
      return totalSteps;
    } catch (error) {
      console.error('Error getting step count:', error);
      throw error;
    }
  }

  async getSleepDuration(startDate: Date, endDate: Date): Promise<number> {
    try {
      const data = await this.getHealthDataForDateRange(startDate, endDate);
      
      // Average sleep hours for the date range
      const sleepData = data.filter(d => d.sleepHours !== undefined);
      if (sleepData.length === 0) return 0;
      
      const totalSleep = sleepData.reduce((sum, dayData) => sum + (dayData.sleepHours || 0), 0);
      
      return totalSleep / sleepData.length;
    } catch (error) {
      console.error('Error getting sleep duration:', error);
      throw error;
    }
  }

  async getHeartRateVariability(startDate: Date, endDate: Date): Promise<number> {
    try {
      const data = await this.getHealthDataForDateRange(startDate, endDate);
      
      // Average HRV for the date range
      const hrvData = data.filter(d => d.hrv !== undefined);
      if (hrvData.length === 0) return 0;
      
      const totalHRV = hrvData.reduce((sum, dayData) => sum + (dayData.hrv || 0), 0);
      
      return totalHRV / hrvData.length;
    } catch (error) {
      console.error('Error getting HRV:', error);
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
    if (!this.validateStepCount(steps)) {
      throw new Error(`Step count must be between ${ManualHealthDataService.MIN_STEPS} and ${ManualHealthDataService.MAX_STEPS}`);
    }

    try {
      const dateKey = this.getDateKey(date);
      const allData = await this.getAllHealthData();
      
      const existingData = allData[dateKey] || {};
      existingData.steps = steps;
      
      allData[dateKey] = existingData;
      
      await StorageService.set(ManualHealthDataService.STORAGE_KEY, allData);
      
      // Notify subscribers
      this.notifyUpdate(HealthDataType.STEPS, { steps, timestamp: date });
      
      return true;
    } catch (error) {
      console.error('Error saving step count:', error);
      return false;
    }
  }

  /**
   * Save manual sleep duration entry
   */
  async saveSleepDuration(hours: number, date: Date = new Date()): Promise<boolean> {
    if (!this.validateSleepDuration(hours)) {
      throw new Error(`Sleep duration must be between ${ManualHealthDataService.MIN_SLEEP} and ${ManualHealthDataService.MAX_SLEEP} hours`);
    }

    try {
      const dateKey = this.getDateKey(date);
      const allData = await this.getAllHealthData();
      
      const existingData = allData[dateKey] || {};
      existingData.sleepHours = hours;
      
      allData[dateKey] = existingData;
      
      await StorageService.set(ManualHealthDataService.STORAGE_KEY, allData);
      
      // Notify subscribers
      this.notifyUpdate(HealthDataType.SLEEP, { sleepHours: hours, timestamp: date });
      
      return true;
    } catch (error) {
      console.error('Error saving sleep duration:', error);
      return false;
    }
  }

  /**
   * Save manual HRV entry
   */
  async saveHRV(hrv: number, date: Date = new Date()): Promise<boolean> {
    if (!this.validateHRV(hrv)) {
      throw new Error(`HRV must be between ${ManualHealthDataService.MIN_HRV} and ${ManualHealthDataService.MAX_HRV}`);
    }

    try {
      const dateKey = this.getDateKey(date);
      const allData = await this.getAllHealthData();
      
      const existingData = allData[dateKey] || {};
      existingData.hrv = hrv;
      
      allData[dateKey] = existingData;
      
      await StorageService.set(ManualHealthDataService.STORAGE_KEY, allData);
      
      // Notify subscribers
      this.notifyUpdate(HealthDataType.HRV, { hrv, timestamp: date });
      
      return true;
    } catch (error) {
      console.error('Error saving HRV:', error);
      return false;
    }
  }

  /**
   * Validation methods
   */
  private validateStepCount(steps: number): boolean {
    return (
      typeof steps === 'number' &&
      !isNaN(steps) &&
      steps >= ManualHealthDataService.MIN_STEPS &&
      steps <= ManualHealthDataService.MAX_STEPS
    );
  }

  private validateSleepDuration(hours: number): boolean {
    return (
      typeof hours === 'number' &&
      !isNaN(hours) &&
      hours >= ManualHealthDataService.MIN_SLEEP &&
      hours <= ManualHealthDataService.MAX_SLEEP
    );
  }

  private validateHRV(hrv: number): boolean {
    return (
      typeof hrv === 'number' &&
      !isNaN(hrv) &&
      hrv >= ManualHealthDataService.MIN_HRV &&
      hrv <= ManualHealthDataService.MAX_HRV
    );
  }

  /**
   * Helper methods
   */
  private getDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private async getAllHealthData(): Promise<Record<string, ManualHealthData>> {
    const data = await StorageService.get<Record<string, ManualHealthData>>(
      ManualHealthDataService.STORAGE_KEY
    );
    return data || {};
  }

  private async getHealthDataForDateRange(startDate: Date, endDate: Date): Promise<ManualHealthData[]> {
    const allData = await this.getAllHealthData();
    const result: ManualHealthData[] = [];

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = this.getDateKey(currentDate);
      const dayData = allData[dateKey];
      
      if (dayData) {
        result.push({ ...dayData, date: dateKey });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
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
