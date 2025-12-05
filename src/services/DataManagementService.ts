/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Data Management Service
 *
 * Handles data export, deletion, and account management.
 * Requirements: 11.4, 11.5
 */

import { Platform, Share, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { StorageService } from './StorageService';
import { SecureStorageService } from './SecureStorageService';
import { AuthService } from './AuthService';
import { CloudAPIService } from './CloudAPIService';

export interface ExportData {
  exportDate: string;
  exportVersion: string;
  userProfile: any;
  healthDataCache: any;
  evolutionRecords: any[];
  // Gamification data (Requirements: 6.4)
  achievements: any;
  streaks: any;
  challenges: any;
  cosmetics: any;
  metadata: {
    platform: string;
    appVersion: string;
    dataRetentionPolicy: string;
  };
}

export interface DeletionResult {
  success: boolean;
  error?: string;
  deletedItems: string[];
}

/**
 * DataManagementService provides data portability and deletion features.
 */
export class DataManagementService {
  private static readonly EXPORT_FILE_NAME = 'symbi-data-export.json';
  private static readonly APP_VERSION = '1.0.0';

  /**
   * Export all user data as JSON
   * Implements requirement 11.5 (data export)
   */
  static async exportAllData(): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      // Gather all data including gamification data (Requirements: 6.4)
      const [
        userProfile,
        healthCache,
        evolutionRecords,
        achievementData,
        streakData,
        challengeData,
        cosmeticData,
      ] = await Promise.all([
        StorageService.getUserProfile(),
        SecureStorageService.getHealthDataCache(),
        StorageService.getEvolutionRecords(),
        StorageService.getAchievementData(),
        StorageService.getStreakData(),
        StorageService.getChallengeData(),
        StorageService.getCosmeticData(),
      ]);

      // Create export data structure
      const exportData: ExportData = {
        exportDate: new Date().toISOString(),
        exportVersion: '1.1',
        userProfile,
        healthDataCache: healthCache,
        evolutionRecords,
        // Gamification data (Requirements: 6.4)
        achievements: achievementData,
        streaks: streakData,
        challenges: challengeData,
        cosmetics: cosmeticData,
        metadata: {
          platform: Platform.OS,
          appVersion: this.APP_VERSION,
          dataRetentionPolicy:
            'Health data: 30 days, Emotional state history: 90 days, Evolution records: Permanent, Gamification data: Permanent',
        },
      };

      // Convert to formatted JSON
      const jsonString = JSON.stringify(exportData, null, 2);

      // Save to file
      const filePath = await this.saveToFile(jsonString);

      return {
        success: true,
        filePath,
      };
    } catch (error) {
      console.error('Data export error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export data',
      };
    }
  }

  /**
   * Share exported data file
   */
  static async shareExportedData(): Promise<boolean> {
    try {
      const result = await this.exportAllData();

      if (!result.success || !result.filePath) {
        Alert.alert('Export Failed', result.error || 'Unable to export data');
        return false;
      }

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        await Sharing.shareAsync(result.filePath, {
          mimeType: 'application/json',
          dialogTitle: 'Export Symbi Data',
          UTI: 'public.json',
        });
        return true;
      } else {
        // Fallback to basic share
        await Share.share({
          message: 'Symbi data export',
          url: result.filePath,
          title: 'Export Symbi Data',
        });
        return true;
      }
    } catch (error) {
      console.error('Share export error:', error);
      Alert.alert('Share Failed', 'Unable to share exported data');
      return false;
    }
  }

  /**
   * Delete all local data
   * Implements requirement 11.4 (data deletion)
   */
  static async deleteAllLocalData(): Promise<DeletionResult> {
    const deletedItems: string[] = [];

    try {
      // Delete user profile
      const profileDeleted = await StorageService.removeUserProfile();
      if (profileDeleted) deletedItems.push('User Profile');

      // Delete health data cache (encrypted)
      const healthCacheDeleted = await SecureStorageService.clearAllEncryptedData();
      if (healthCacheDeleted) deletedItems.push('Health Data Cache');

      // Delete evolution records
      const evolutionDeleted = await StorageService.removeEvolutionRecords();
      if (evolutionDeleted) deletedItems.push('Evolution Records');

      // Delete any remaining Symbi data
      await StorageService.clearAllSymbiData();

      return {
        success: true,
        deletedItems,
      };
    } catch (error) {
      console.error('Data deletion error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete data',
        deletedItems,
      };
    }
  }

  /**
   * Delete account and all associated data (local + cloud)
   * Implements requirement 11.4 (account deletion)
   */
  static async deleteAccount(): Promise<DeletionResult> {
    const deletedItems: string[] = [];

    try {
      // Check if user is authenticated
      const isAuthenticated = await AuthService.isAuthenticated();

      if (isAuthenticated) {
        // Delete cloud data
        const cloudResult = await CloudAPIService.deleteAccount();
        if (cloudResult.success) {
          deletedItems.push('Cloud Data');
        }

        // Delete authentication data
        const authDeleted = await AuthService.deleteAccount();
        if (authDeleted) {
          deletedItems.push('Account Authentication');
        }
      }

      // Delete all local data
      const localResult = await this.deleteAllLocalData();
      deletedItems.push(...localResult.deletedItems);

      return {
        success: true,
        deletedItems,
      };
    } catch (error) {
      console.error('Account deletion error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete account',
        deletedItems,
      };
    }
  }

  /**
   * Show confirmation dialog for data deletion
   */
  static showDeleteDataConfirmation(onConfirm: () => void): void {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your health data, preferences, and Symbi history from this device. This action cannot be undone.\n\nAre you sure you want to continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Export First',
          onPress: async () => {
            await this.shareExportedData();
            // Show confirmation again after export
            this.showDeleteDataConfirmation(onConfirm);
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: onConfirm,
        },
      ],
      { cancelable: true }
    );
  }

  /**
   * Show confirmation dialog for account deletion
   */
  static showDeleteAccountConfirmation(onConfirm: () => void): void {
    Alert.alert(
      'Delete Account',
      'This will permanently delete:\n\n• Your account and authentication\n• All cloud-synced data\n• All local data on this device\n• Your Symbi evolution history\n\nCloud data will be removed within 7 days.\n\nThis action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Export First',
          onPress: async () => {
            await this.shareExportedData();
            // Show confirmation again after export
            this.showDeleteAccountConfirmation(onConfirm);
          },
        },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            // Double confirmation for account deletion
            Alert.alert(
              'Final Confirmation',
              'Are you absolutely sure? This will delete your account and all data permanently.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete Everything',
                  style: 'destructive',
                  onPress: onConfirm,
                },
              ]
            );
          },
        },
      ],
      { cancelable: true }
    );
  }

  /**
   * Get data summary for display
   */
  static async getDataSummary(): Promise<{
    userProfileExists: boolean;
    healthDataEntries: number;
    evolutionRecords: number;
    achievementsEarned: number;
    currentStreak: number;
    cosmeticsOwned: number;
    estimatedSize: string;
  }> {
    try {
      const [
        userProfile,
        healthCache,
        evolutionRecords,
        achievementData,
        streakData,
        cosmeticData,
      ] = await Promise.all([
        StorageService.getUserProfile(),
        SecureStorageService.getHealthDataCache(),
        StorageService.getEvolutionRecords(),
        StorageService.getAchievementData(),
        StorageService.getStreakData(),
        StorageService.getCosmeticData(),
      ]);

      const healthDataEntries = healthCache ? Object.keys(healthCache).length : 0;
      const evolutionCount = evolutionRecords.length;
      const achievementsEarned =
        achievementData?.achievements?.filter(
          (a: { unlockedAt?: string }) => a.unlockedAt !== undefined
        ).length || 0;
      const currentStreak = streakData?.state?.currentStreak || 0;
      const cosmeticsOwned = cosmeticData?.inventory?.items?.length || 0;

      // Estimate size (rough calculation)
      const estimatedBytes =
        JSON.stringify(userProfile || {}).length +
        JSON.stringify(healthCache || {}).length +
        JSON.stringify(evolutionRecords).length +
        JSON.stringify(achievementData || {}).length +
        JSON.stringify(streakData || {}).length +
        JSON.stringify(cosmeticData || {}).length;

      const estimatedSize = this.formatBytes(estimatedBytes);

      return {
        userProfileExists: userProfile !== null,
        healthDataEntries,
        evolutionRecords: evolutionCount,
        achievementsEarned,
        currentStreak,
        cosmeticsOwned,
        estimatedSize,
      };
    } catch (error) {
      console.error('Error getting data summary:', error);
      return {
        userProfileExists: false,
        healthDataEntries: 0,
        evolutionRecords: 0,
        achievementsEarned: 0,
        currentStreak: 0,
        cosmeticsOwned: 0,
        estimatedSize: '0 B',
      };
    }
  }

  /**
   * Save data to file
   */
  private static async saveToFile(data: string): Promise<string> {
    const fileName = `${this.EXPORT_FILE_NAME.replace('.json', '')}-${Date.now()}.json`;

    // Use the new expo-file-system API
    const file = new FileSystem.File(FileSystem.Paths.cache, fileName);
    await file.write(data);

    return file.uri;
  }

  /**
   * Format bytes to human-readable size
   */
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Verify data deletion (for testing)
   */
  static async verifyDataDeletion(): Promise<boolean> {
    try {
      const [userProfile, healthCache, evolutionRecords] = await Promise.all([
        StorageService.getUserProfile(),
        SecureStorageService.getHealthDataCache(),
        StorageService.getEvolutionRecords(),
      ]);

      return (
        userProfile === null &&
        (healthCache === null || Object.keys(healthCache).length === 0) &&
        evolutionRecords.length === 0
      );
    } catch (error) {
      console.error('Error verifying data deletion:', error);
      return false;
    }
  }
}
