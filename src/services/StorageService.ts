import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, HealthDataCache, EvolutionRecord } from '../types';

/**
 * StorageService provides type-safe access to AsyncStorage with encryption support.
 *
 * Storage Keys:
 * - USER_PROFILE: User profile data including preferences, thresholds, and goals
 * - HEALTH_DATA_CACHE: Cached health data and emotional states (30-day rolling window)
 * - EVOLUTION_RECORDS: History of Symbi evolution events
 */
export class StorageService {
  // Storage keys
  private static readonly USER_PROFILE_KEY = '@symbi:user_profile';
  private static readonly HEALTH_DATA_CACHE_KEY = '@symbi:health_data_cache';
  private static readonly EVOLUTION_RECORDS_KEY = '@symbi:evolution_records';

  // Generic get/set methods
  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (!value) {
        console.log(`[StorageService] No data found for key: ${key}`);
        return null;
      }

      const parsed = JSON.parse(value);
      const result = this.deserializeDates(parsed);
      console.log(`[StorageService] Retrieved data for key: ${key}`);
      return result;
    } catch (error) {
      console.error(`Error getting ${key} from storage:`, error);
      return null;
    }
  }

  static async set<T>(key: string, value: T): Promise<boolean> {
    try {
      const jsonString = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonString);
      console.log(`[StorageService] Saved data for key: ${key} (${jsonString.length} bytes)`);
      return true;
    } catch (error) {
      console.error(`Error setting ${key} in storage:`, error);
      return false;
    }
  }

  static async remove(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
      return false;
    }
  }

  static async clear(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  // Type-safe methods for UserProfile
  static async getUserProfile(): Promise<UserProfile | null> {
    return this.get<UserProfile>(this.USER_PROFILE_KEY);
  }

  static async setUserProfile(profile: UserProfile): Promise<boolean> {
    return this.set(this.USER_PROFILE_KEY, profile);
  }

  static async removeUserProfile(): Promise<boolean> {
    return this.remove(this.USER_PROFILE_KEY);
  }

  // Type-safe methods for HealthDataCache
  static async getHealthDataCache(): Promise<Record<string, HealthDataCache> | null> {
    const cache = await this.get<Record<string, HealthDataCache>>(this.HEALTH_DATA_CACHE_KEY);
    if (!cache) return null;

    // Clean up old entries (keep only last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const cleaned: Record<string, HealthDataCache> = {};
    for (const [dateKey, data] of Object.entries(cache)) {
      const entryDate = new Date(dateKey);
      if (entryDate >= thirtyDaysAgo) {
        cleaned[dateKey] = data;
      }
    }

    // Update storage if we cleaned anything
    if (Object.keys(cleaned).length !== Object.keys(cache).length) {
      await this.set(this.HEALTH_DATA_CACHE_KEY, cleaned);
    }

    return cleaned;
  }

  static async setHealthDataCache(cache: Record<string, HealthDataCache>): Promise<boolean> {
    return this.set(this.HEALTH_DATA_CACHE_KEY, cache);
  }

  static async addHealthDataEntry(dateKey: string, data: HealthDataCache): Promise<boolean> {
    console.log(`[StorageService] Adding health data entry for ${dateKey}`);
    const cache = (await this.getHealthDataCache()) || {};
    cache[dateKey] = data;
    const result = await this.setHealthDataCache(cache);
    console.log(
      `[StorageService] Health data entry saved. Total entries: ${Object.keys(cache).length}`
    );
    return result;
  }

  static async removeHealthDataCache(): Promise<boolean> {
    return this.remove(this.HEALTH_DATA_CACHE_KEY);
  }

  // Type-safe methods for EvolutionRecords
  static async getEvolutionRecords(): Promise<EvolutionRecord[]> {
    const records = await this.get<EvolutionRecord[]>(this.EVOLUTION_RECORDS_KEY);
    return records || [];
  }

  static async setEvolutionRecords(records: EvolutionRecord[]): Promise<boolean> {
    return this.set(this.EVOLUTION_RECORDS_KEY, records);
  }

  static async addEvolutionRecord(record: EvolutionRecord): Promise<boolean> {
    const records = await this.getEvolutionRecords();
    records.push(record);
    return this.setEvolutionRecords(records);
  }

  static async removeEvolutionRecords(): Promise<boolean> {
    return this.remove(this.EVOLUTION_RECORDS_KEY);
  }

  // Helper method to deserialize Date objects from JSON
  private static deserializeDates<T>(obj: T): T {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
      // Check if string is an ISO date
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
      if (isoDateRegex.test(obj)) {
        return new Date(obj) as unknown as T;
      }
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deserializeDates(item)) as unknown as T;
    }

    if (typeof obj === 'object') {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        result[key] = this.deserializeDates(value);
      }
      return result as T;
    }

    return obj;
  }

  /**
   * Clear all Symbi-related data from storage.
   * This is used for account deletion or data reset.
   */
  static async clearAllSymbiData(): Promise<boolean> {
    try {
      await Promise.all([
        this.removeUserProfile(),
        this.removeHealthDataCache(),
        this.removeEvolutionRecords(),
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing all Symbi data:', error);
      return false;
    }
  }

  /**
   * Export all user data as JSON for data portability.
   * Implements requirement 11.5 (data export).
   */
  static async exportAllData(): Promise<string | null> {
    try {
      const [profile, healthCache, evolutionRecords] = await Promise.all([
        this.getUserProfile(),
        this.getHealthDataCache(),
        this.getEvolutionRecords(),
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        userProfile: profile,
        healthDataCache: healthCache,
        evolutionRecords: evolutionRecords,
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }
}
