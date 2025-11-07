/**
 * Secure Storage Service
 * 
 * Extends StorageService with encryption for sensitive health data.
 * Uses EncryptionService for AES-256 encryption of health data cache.
 * Requirements: 11.2, 14.3
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { HealthDataCache } from '../types';
import { EncryptionService } from './EncryptionService';
import { StorageService } from './StorageService';

/**
 * SecureStorageService provides encrypted storage for sensitive health data.
 * 
 * Encryption Strategy:
 * - Health data cache: Encrypted with AES-256
 * - User preferences: Not encrypted (non-sensitive)
 * - Evolution records: Not encrypted (non-sensitive)
 * - Authentication tokens: Encrypted with AES-256
 */
export class SecureStorageService {
  private static readonly ENCRYPTED_HEALTH_CACHE_KEY = '@symbi:encrypted_health_cache';
  private static readonly ENCRYPTED_AUTH_TOKEN_KEY = '@symbi:encrypted_auth_token';
  private static isInitialized = false;

  /**
   * Initialize secure storage (must be called before use)
   */
  static async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      await EncryptionService.initialize();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize secure storage:', error);
      return false;
    }
  }

  /**
   * Get encrypted health data cache
   */
  static async getHealthDataCache(): Promise<Record<string, HealthDataCache> | null> {
    try {
      await this.ensureInitialized();

      const encryptedData = await AsyncStorage.getItem(this.ENCRYPTED_HEALTH_CACHE_KEY);
      if (!encryptedData) {
        // Try to migrate from unencrypted storage
        return await this.migrateHealthDataCache();
      }

      const decrypted = await EncryptionService.decrypt(encryptedData);
      const cache = JSON.parse(decrypted);

      // Clean up old entries (keep only last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const cleaned: Record<string, HealthDataCache> = {};
      for (const [dateKey, data] of Object.entries(cache)) {
        const entryDate = new Date(dateKey);
        if (entryDate >= thirtyDaysAgo) {
          cleaned[dateKey] = data as HealthDataCache;
        }
      }

      // Update storage if we cleaned anything
      if (Object.keys(cleaned).length !== Object.keys(cache).length) {
        await this.setHealthDataCache(cleaned);
      }

      return cleaned;
    } catch (error) {
      console.error('Error getting encrypted health data cache:', error);
      return null;
    }
  }

  /**
   * Set encrypted health data cache
   */
  static async setHealthDataCache(cache: Record<string, HealthDataCache>): Promise<boolean> {
    try {
      await this.ensureInitialized();

      const jsonString = JSON.stringify(cache);
      const encrypted = await EncryptionService.encrypt(jsonString);
      await AsyncStorage.setItem(this.ENCRYPTED_HEALTH_CACHE_KEY, encrypted);

      return true;
    } catch (error) {
      console.error('Error setting encrypted health data cache:', error);
      return false;
    }
  }

  /**
   * Add a single health data entry to encrypted cache
   */
  static async addHealthDataEntry(dateKey: string, data: HealthDataCache): Promise<boolean> {
    const cache = (await this.getHealthDataCache()) || {};
    cache[dateKey] = data;
    return this.setHealthDataCache(cache);
  }

  /**
   * Get encrypted authentication token
   */
  static async getAuthToken(): Promise<string | null> {
    try {
      await this.ensureInitialized();

      const encryptedToken = await AsyncStorage.getItem(this.ENCRYPTED_AUTH_TOKEN_KEY);
      if (!encryptedToken) {
        return null;
      }

      return await EncryptionService.decrypt(encryptedToken);
    } catch (error) {
      console.error('Error getting encrypted auth token:', error);
      return null;
    }
  }

  /**
   * Set encrypted authentication token
   */
  static async setAuthToken(token: string): Promise<boolean> {
    try {
      await this.ensureInitialized();

      const encrypted = await EncryptionService.encrypt(token);
      await AsyncStorage.setItem(this.ENCRYPTED_AUTH_TOKEN_KEY, encrypted);

      return true;
    } catch (error) {
      console.error('Error setting encrypted auth token:', error);
      return false;
    }
  }

  /**
   * Remove encrypted authentication token
   */
  static async removeAuthToken(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(this.ENCRYPTED_AUTH_TOKEN_KEY);
      return true;
    } catch (error) {
      console.error('Error removing encrypted auth token:', error);
      return false;
    }
  }

  /**
   * Clear all encrypted data
   */
  static async clearAllEncryptedData(): Promise<boolean> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(this.ENCRYPTED_HEALTH_CACHE_KEY),
        AsyncStorage.removeItem(this.ENCRYPTED_AUTH_TOKEN_KEY),
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing encrypted data:', error);
      return false;
    }
  }

  /**
   * Migrate unencrypted health data cache to encrypted storage
   */
  private static async migrateHealthDataCache(): Promise<Record<string, HealthDataCache> | null> {
    try {
      console.log('Migrating health data cache to encrypted storage...');

      // Get data from old unencrypted storage
      const oldCache = await StorageService.getHealthDataCache();
      if (!oldCache) {
        return null;
      }

      // Save to encrypted storage
      await this.setHealthDataCache(oldCache);

      // Remove from old storage
      await StorageService.removeHealthDataCache();

      console.log('Health data cache migration complete');
      return oldCache;
    } catch (error) {
      console.error('Error migrating health data cache:', error);
      return null;
    }
  }

  /**
   * Ensure service is initialized
   */
  private static async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      const success = await this.initialize();
      if (!success) {
        throw new Error('Failed to initialize secure storage');
      }
    }
  }

  /**
   * Export encrypted data (for debugging/verification)
   */
  static async exportEncryptedData(): Promise<{
    healthCache: string | null;
    authToken: string | null;
  }> {
    return {
      healthCache: await AsyncStorage.getItem(this.ENCRYPTED_HEALTH_CACHE_KEY),
      authToken: await AsyncStorage.getItem(this.ENCRYPTED_AUTH_TOKEN_KEY),
    };
  }

  /**
   * Verify encryption is working
   */
  static async verifyEncryption(): Promise<boolean> {
    try {
      const testData = { test: 'encryption-test', timestamp: Date.now() };
      const testKey = '@symbi:encryption_test';

      // Encrypt and store
      const encrypted = await EncryptionService.encryptObject(testData);
      await AsyncStorage.setItem(testKey, encrypted);

      // Retrieve and decrypt
      const retrieved = await AsyncStorage.getItem(testKey);
      if (!retrieved) {
        return false;
      }

      const decrypted = await EncryptionService.decryptObject<typeof testData>(retrieved);

      // Clean up
      await AsyncStorage.removeItem(testKey);

      // Verify data matches
      return (
        decrypted.test === testData.test &&
        decrypted.timestamp === testData.timestamp
      );
    } catch (error) {
      console.error('Encryption verification failed:', error);
      return false;
    }
  }
}
