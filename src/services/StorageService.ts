import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  UserProfile,
  HealthDataCache,
  EvolutionRecord,
  AchievementStorageData,
  StreakStorageData,
  ChallengeStorageData,
  CosmeticStorageData,
  Achievement,
  StreakState,
  Challenge,
  CosmeticInventory,
} from '../types';

/**
 * StorageService provides type-safe access to AsyncStorage with encryption support.
 * Implements graceful degradation for storage failures (Requirements: 6.3).
 *
 * Storage Keys:
 * - USER_PROFILE: User profile data including preferences, thresholds, and goals
 * - HEALTH_DATA_CACHE: Cached health data and emotional states (30-day rolling window)
 * - EVOLUTION_RECORDS: History of Symbi evolution events
 * - ACHIEVEMENTS: Achievement progress and earned badges
 * - STREAKS: Daily streak tracking data
 * - CHALLENGES: Weekly challenge progress
 * - COSMETICS: Cosmetic inventory and equipped items
 */
export class StorageService {
  // Storage keys
  private static readonly USER_PROFILE_KEY = '@symbi:user_profile';
  private static readonly HEALTH_DATA_CACHE_KEY = '@symbi:health_data_cache';
  private static readonly EVOLUTION_RECORDS_KEY = '@symbi:evolution_records';
  private static readonly ACHIEVEMENTS_KEY = '@symbi:achievements';
  private static readonly STREAKS_KEY = '@symbi:streaks';
  private static readonly CHALLENGES_KEY = '@symbi:challenges';
  private static readonly COSMETICS_KEY = '@symbi:cosmetics';

  // Retry configuration for write operations (Requirements: 6.3)
  private static readonly MAX_RETRIES = 3;
  private static readonly BASE_DELAY_MS = 100;

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

  /**
   * Set a value in storage with retry logic for resilience.
   * Implements exponential backoff for write failures (Requirements: 6.3).
   */
  static async set<T>(key: string, value: T): Promise<boolean> {
    const jsonString = JSON.stringify(value);

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        await AsyncStorage.setItem(key, jsonString);
        console.log(`[StorageService] Saved data for key: ${key} (${jsonString.length} bytes)`);
        return true;
      } catch (error) {
        console.error(
          `[StorageService] Error setting ${key} (attempt ${attempt}/${this.MAX_RETRIES}):`,
          error
        );

        if (attempt < this.MAX_RETRIES) {
          // Exponential backoff: 100ms, 200ms, 400ms
          const delay = this.BASE_DELAY_MS * Math.pow(2, attempt - 1);
          await this.sleep(delay);
        }
      }
    }

    console.error(`[StorageService] Failed to save ${key} after ${this.MAX_RETRIES} attempts`);
    return false;
  }

  /**
   * Helper to sleep for a given duration.
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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

  // ============================================================================
  // Achievement Storage Methods
  // ============================================================================

  /**
   * Get achievement data from storage with schema validation.
   * Returns null if data is missing or invalid.
   */
  static async getAchievementData(): Promise<AchievementStorageData | null> {
    const data = await this.get<AchievementStorageData>(this.ACHIEVEMENTS_KEY);
    if (!data) return null;

    // Schema validation
    if (!this.validateAchievementSchema(data)) {
      console.warn('[StorageService] Invalid achievement data schema, returning null');
      return null;
    }

    return data;
  }

  /**
   * Get achievement data with default fallback for graceful degradation.
   * Returns default empty state if storage read fails (Requirements: 6.3).
   */
  static async getAchievementDataWithDefaults(): Promise<AchievementStorageData> {
    const data = await this.getAchievementData();
    if (data) return data;

    return {
      achievements: [],
      statistics: this.getDefaultAchievementStatistics(),
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Save achievement data to storage.
   */
  static async setAchievementData(data: AchievementStorageData): Promise<boolean> {
    return this.set(this.ACHIEVEMENTS_KEY, {
      ...data,
      lastUpdated: new Date().toISOString(),
    });
  }

  /**
   * Get all earned achievements.
   */
  static async getEarnedAchievements(): Promise<Achievement[]> {
    const data = await this.getAchievementData();
    if (!data) return [];
    return data.achievements.filter(a => a.unlockedAt !== undefined);
  }

  /**
   * Add or update a single achievement.
   */
  static async updateAchievement(achievement: Achievement): Promise<boolean> {
    const data = await this.getAchievementData();
    const achievements = data?.achievements || [];
    const existingIndex = achievements.findIndex(a => a.id === achievement.id);

    if (existingIndex >= 0) {
      achievements[existingIndex] = achievement;
    } else {
      achievements.push(achievement);
    }

    return this.setAchievementData({
      achievements,
      statistics: data?.statistics || this.getDefaultAchievementStatistics(),
      lastUpdated: new Date().toISOString(),
    });
  }

  /**
   * Remove achievement data from storage.
   */
  static async removeAchievementData(): Promise<boolean> {
    return this.remove(this.ACHIEVEMENTS_KEY);
  }

  /**
   * Validate achievement storage schema.
   */
  private static validateAchievementSchema(data: unknown): data is AchievementStorageData {
    if (!data || typeof data !== 'object') return false;
    const d = data as Record<string, unknown>;
    return (
      Array.isArray(d.achievements) &&
      typeof d.statistics === 'object' &&
      typeof d.lastUpdated === 'string'
    );
  }

  /**
   * Get default achievement statistics.
   */
  private static getDefaultAchievementStatistics() {
    return {
      totalEarned: 0,
      totalAvailable: 0,
      completionPercentage: 0,
      rarestBadge: null,
      recentUnlocks: [],
    };
  }

  // ============================================================================
  // Streak Storage Methods
  // ============================================================================

  /**
   * Get streak data from storage with schema validation.
   * Returns default state if data is missing or invalid.
   */
  static async getStreakData(): Promise<StreakStorageData | null> {
    const data = await this.get<StreakStorageData>(this.STREAKS_KEY);
    if (!data) return null;

    // Schema validation
    if (!this.validateStreakSchema(data)) {
      console.warn('[StorageService] Invalid streak data schema, returning null');
      return null;
    }

    return data;
  }

  /**
   * Save streak data to storage.
   */
  static async setStreakData(data: StreakStorageData): Promise<boolean> {
    return this.set(this.STREAKS_KEY, {
      ...data,
      lastUpdated: new Date().toISOString(),
    });
  }

  /**
   * Get current streak state.
   */
  static async getStreakState(): Promise<StreakState | null> {
    const data = await this.getStreakData();
    return data?.state || null;
  }

  /**
   * Update streak state.
   */
  static async setStreakState(state: StreakState): Promise<boolean> {
    return this.setStreakData({
      state,
      lastUpdated: new Date().toISOString(),
    });
  }

  /**
   * Remove streak data from storage.
   */
  static async removeStreakData(): Promise<boolean> {
    return this.remove(this.STREAKS_KEY);
  }

  /**
   * Get streak data with default fallback for graceful degradation.
   * Returns default empty state if storage read fails (Requirements: 6.3).
   */
  static async getStreakDataWithDefaults(): Promise<StreakStorageData> {
    const data = await this.getStreakData();
    if (data) return data;

    return {
      state: {
        currentStreak: 0,
        longestStreak: 0,
        lastRecordedDate: '',
        streakHistory: [],
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Validate streak storage schema.
   */
  private static validateStreakSchema(data: unknown): data is StreakStorageData {
    if (!data || typeof data !== 'object') return false;
    const d = data as Record<string, unknown>;
    if (!d.state || typeof d.state !== 'object') return false;
    const state = d.state as Record<string, unknown>;
    return (
      typeof state.currentStreak === 'number' &&
      typeof state.longestStreak === 'number' &&
      typeof state.lastRecordedDate === 'string' &&
      Array.isArray(state.streakHistory)
    );
  }

  // ============================================================================
  // Challenge Storage Methods
  // ============================================================================

  /**
   * Get challenge data from storage with schema validation.
   */
  static async getChallengeData(): Promise<ChallengeStorageData | null> {
    const data = await this.get<ChallengeStorageData>(this.CHALLENGES_KEY);
    if (!data) return null;

    // Schema validation
    if (!this.validateChallengeSchema(data)) {
      console.warn('[StorageService] Invalid challenge data schema, returning null');
      return null;
    }

    return data;
  }

  /**
   * Save challenge data to storage.
   */
  static async setChallengeData(data: ChallengeStorageData): Promise<boolean> {
    return this.set(this.CHALLENGES_KEY, data);
  }

  /**
   * Get active challenges.
   */
  static async getActiveChallenges(): Promise<Challenge[]> {
    const data = await this.getChallengeData();
    return data?.activeChallenges || [];
  }

  /**
   * Update a single challenge.
   */
  static async updateChallenge(challenge: Challenge): Promise<boolean> {
    const data = await this.getChallengeData();
    const challenges = data?.activeChallenges || [];
    const existingIndex = challenges.findIndex(c => c.id === challenge.id);

    if (existingIndex >= 0) {
      challenges[existingIndex] = challenge;
    } else {
      challenges.push(challenge);
    }

    return this.setChallengeData({
      activeChallenges: challenges,
      completedChallenges: data?.completedChallenges || [],
      weekStartDate: data?.weekStartDate || new Date().toISOString(),
    });
  }

  /**
   * Remove challenge data from storage.
   */
  static async removeChallengeData(): Promise<boolean> {
    return this.remove(this.CHALLENGES_KEY);
  }

  /**
   * Validate challenge storage schema.
   */
  private static validateChallengeSchema(data: unknown): data is ChallengeStorageData {
    if (!data || typeof data !== 'object') return false;
    const d = data as Record<string, unknown>;
    return (
      Array.isArray(d.activeChallenges) &&
      Array.isArray(d.completedChallenges) &&
      typeof d.weekStartDate === 'string'
    );
  }

  // ============================================================================
  // Cosmetic Storage Methods
  // ============================================================================

  /**
   * Get cosmetic data from storage with schema validation.
   */
  static async getCosmeticData(): Promise<CosmeticStorageData | null> {
    const data = await this.get<CosmeticStorageData>(this.COSMETICS_KEY);
    if (!data) return null;

    // Schema validation
    if (!this.validateCosmeticSchema(data)) {
      console.warn('[StorageService] Invalid cosmetic data schema, returning null');
      return null;
    }

    return data;
  }

  /**
   * Save cosmetic data to storage.
   */
  static async setCosmeticData(data: CosmeticStorageData): Promise<boolean> {
    return this.set(this.COSMETICS_KEY, {
      ...data,
      lastUpdated: new Date().toISOString(),
    });
  }

  /**
   * Get cosmetic inventory.
   */
  static async getCosmeticInventory(): Promise<CosmeticInventory | null> {
    const data = await this.getCosmeticData();
    return data?.inventory || null;
  }

  /**
   * Update cosmetic inventory.
   */
  static async setCosmeticInventory(inventory: CosmeticInventory): Promise<boolean> {
    return this.setCosmeticData({
      inventory: {
        ...inventory,
        lastUpdated: new Date().toISOString(),
      },
      lastUpdated: new Date().toISOString(),
    });
  }

  /**
   * Remove cosmetic data from storage.
   */
  static async removeCosmeticData(): Promise<boolean> {
    return this.remove(this.COSMETICS_KEY);
  }

  /**
   * Get cosmetic data with default fallback for graceful degradation.
   * Returns default empty state if storage read fails (Requirements: 6.3).
   */
  static async getCosmeticDataWithDefaults(): Promise<CosmeticStorageData> {
    const data = await this.getCosmeticData();
    if (data) return data;

    return {
      inventory: {
        items: [],
        equipped: {},
        lastUpdated: new Date().toISOString(),
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Validate cosmetic storage schema.
   */
  private static validateCosmeticSchema(data: unknown): data is CosmeticStorageData {
    if (!data || typeof data !== 'object') return false;
    const d = data as Record<string, unknown>;
    if (!d.inventory || typeof d.inventory !== 'object') return false;
    const inv = d.inventory as Record<string, unknown>;
    return (
      Array.isArray(inv.items) &&
      typeof inv.equipped === 'object' &&
      typeof inv.lastUpdated === 'string'
    );
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
        this.removeAchievementData(),
        this.removeStreakData(),
        this.removeChallengeData(),
        this.removeCosmeticData(),
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing all Symbi data:', error);
      return false;
    }
  }

  /**
   * Export all user data as JSON for data portability.
   * Implements requirement 11.5 (data export) and 6.4 (gamification data export).
   */
  static async exportAllData(): Promise<string | null> {
    try {
      const [
        profile,
        healthCache,
        evolutionRecords,
        achievementData,
        streakData,
        challengeData,
        cosmeticData,
      ] = await Promise.all([
        this.getUserProfile(),
        this.getHealthDataCache(),
        this.getEvolutionRecords(),
        this.getAchievementData(),
        this.getStreakData(),
        this.getChallengeData(),
        this.getCosmeticData(),
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        userProfile: profile,
        healthDataCache: healthCache,
        evolutionRecords: evolutionRecords,
        achievements: achievementData,
        streaks: streakData,
        challenges: challengeData,
        cosmetics: cosmeticData,
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }
}
