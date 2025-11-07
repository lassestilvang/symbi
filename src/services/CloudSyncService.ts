/**
 * Cloud Sync Service
 * 
 * Manages synchronization of user data between local storage and cloud.
 * Handles conflict resolution, offline queueing, and automatic sync.
 * Requirements: 9.5, 14.4
 */

import NetInfo from '@react-native-community/netinfo';
import { UserProfile, EvolutionRecord } from '../types';
import { StorageService } from './StorageService';
import { CloudAPIService, CloudSyncData } from './CloudAPIService';
import { AuthService } from './AuthService';

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingChanges: boolean;
  error: string | null;
}

export interface SyncOptions {
  force?: boolean; // Force sync even if no changes detected
  uploadOnly?: boolean; // Only upload, don't download
  downloadOnly?: boolean; // Only download, don't upload
}

/**
 * CloudSyncService handles bidirectional sync between local and cloud storage.
 */
export class CloudSyncService {
  private static readonly SYNC_STATUS_KEY = '@symbi:sync_status';
  private static readonly PENDING_SYNC_KEY = '@symbi:pending_sync';
  private static readonly LAST_SYNC_KEY = '@symbi:last_sync_timestamp';

  private static syncInProgress = false;
  private static syncListeners: Array<(status: SyncStatus) => void> = [];

  /**
   * Perform full sync (upload and download)
   */
  static async sync(options: SyncOptions = {}): Promise<boolean> {
    // Prevent concurrent syncs
    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping');
      return false;
    }

    try {
      this.syncInProgress = true;
      await this.updateSyncStatus({ isSyncing: true, error: null });

      // Check authentication
      const isAuthenticated = await AuthService.isAuthenticated();
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }

      // Check network connectivity
      const isConnected = await this.checkNetworkConnectivity();
      if (!isConnected) {
        // Queue for later sync
        await this.queuePendingSync();
        throw new Error('No network connection');
      }

      // Get local data
      const localData = await this.getLocalData();

      // Upload local data to cloud
      if (!options.downloadOnly) {
        const uploadResult = await CloudAPIService.uploadData(localData);
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Upload failed');
        }
      }

      // Download cloud data and merge
      if (!options.uploadOnly) {
        const downloadResult = await CloudAPIService.downloadData();
        if (downloadResult.success && downloadResult.data) {
          await this.mergeCloudData(downloadResult.data, localData);
        }
      }

      // Update sync status
      await this.updateLastSyncTime();
      await this.clearPendingSync();
      await this.updateSyncStatus({
        isSyncing: false,
        lastSyncTime: new Date(),
        pendingChanges: false,
        error: null,
      });

      return true;
    } catch (error) {
      console.error('Sync error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      
      await this.updateSyncStatus({
        isSyncing: false,
        error: errorMessage,
      });

      return false;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Upload local data to cloud
   */
  static async uploadToCloud(): Promise<boolean> {
    return this.sync({ uploadOnly: true });
  }

  /**
   * Download cloud data and merge with local
   */
  static async downloadFromCloud(): Promise<boolean> {
    return this.sync({ downloadOnly: true });
  }

  /**
   * Get current sync status
   */
  static async getSyncStatus(): Promise<SyncStatus> {
    const status = await StorageService.get<SyncStatus>(this.SYNC_STATUS_KEY);
    return status || {
      isSyncing: false,
      lastSyncTime: null,
      pendingChanges: false,
      error: null,
    };
  }

  /**
   * Check if there are pending changes to sync
   */
  static async hasPendingChanges(): Promise<boolean> {
    const pending = await StorageService.get<boolean>(this.PENDING_SYNC_KEY);
    return pending === true;
  }

  /**
   * Mark that there are pending changes to sync
   */
  static async markPendingChanges(): Promise<void> {
    await StorageService.set(this.PENDING_SYNC_KEY, true);
    await this.updateSyncStatus({ pendingChanges: true });
  }

  /**
   * Attempt to sync pending changes if online
   */
  static async syncPendingChanges(): Promise<boolean> {
    const hasPending = await this.hasPendingChanges();
    if (!hasPending) {
      return true;
    }

    const isConnected = await this.checkNetworkConnectivity();
    if (!isConnected) {
      return false;
    }

    return this.sync();
  }

  /**
   * Subscribe to sync status changes
   */
  static addSyncListener(listener: (status: SyncStatus) => void): () => void {
    this.syncListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== listener);
    };
  }

  /**
   * Enable automatic sync when network becomes available
   */
  static enableAutoSync(): () => void {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && !this.syncInProgress) {
        this.syncPendingChanges().catch(error => {
          console.error('Auto-sync error:', error);
        });
      }
    });

    return unsubscribe;
  }

  /**
   * Get local data for sync
   */
  private static async getLocalData(): Promise<CloudSyncData> {
    const [userProfile, evolutionRecords] = await Promise.all([
      StorageService.getUserProfile(),
      StorageService.getEvolutionRecords(),
    ]);

    if (!userProfile) {
      throw new Error('No user profile found');
    }

    return {
      userProfile,
      evolutionRecords,
      lastSyncTimestamp: new Date(),
    };
  }

  /**
   * Merge cloud data with local data
   * Implements conflict resolution strategy: cloud data wins for preferences,
   * local data is preserved for evolution records (merge both)
   */
  private static async mergeCloudData(
    cloudData: CloudSyncData,
    localData: CloudSyncData
  ): Promise<void> {
    // Merge user profile (cloud wins for preferences, keep local evolution level)
    const mergedProfile: UserProfile = {
      ...cloudData.userProfile,
      evolutionLevel: Math.max(
        cloudData.userProfile.evolutionLevel,
        localData.userProfile.evolutionLevel
      ),
      totalDaysActive: Math.max(
        cloudData.userProfile.totalDaysActive,
        localData.userProfile.totalDaysActive
      ),
    };

    // Merge evolution records (combine both, deduplicate by ID)
    const mergedRecords = this.mergeEvolutionRecords(
      cloudData.evolutionRecords,
      localData.evolutionRecords
    );

    // Save merged data
    await StorageService.setUserProfile(mergedProfile);
    await StorageService.setEvolutionRecords(mergedRecords);
  }

  /**
   * Merge evolution records from cloud and local, removing duplicates
   */
  private static mergeEvolutionRecords(
    cloudRecords: EvolutionRecord[],
    localRecords: EvolutionRecord[]
  ): EvolutionRecord[] {
    const recordMap = new Map<string, EvolutionRecord>();

    // Add local records first
    for (const record of localRecords) {
      recordMap.set(record.id, record);
    }

    // Add cloud records (will overwrite if same ID)
    for (const record of cloudRecords) {
      recordMap.set(record.id, record);
    }

    // Convert back to array and sort by timestamp
    return Array.from(recordMap.values()).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  /**
   * Check network connectivity
   */
  private static async checkNetworkConnectivity(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected === true;
  }

  /**
   * Queue pending sync for when network becomes available
   */
  private static async queuePendingSync(): Promise<void> {
    await StorageService.set(this.PENDING_SYNC_KEY, true);
  }

  /**
   * Clear pending sync flag
   */
  private static async clearPendingSync(): Promise<void> {
    await StorageService.set(this.PENDING_SYNC_KEY, false);
  }

  /**
   * Update last sync timestamp
   */
  private static async updateLastSyncTime(): Promise<void> {
    await StorageService.set(this.LAST_SYNC_KEY, new Date().toISOString());
  }

  /**
   * Update sync status and notify listeners
   */
  private static async updateSyncStatus(updates: Partial<SyncStatus>): Promise<void> {
    const currentStatus = await this.getSyncStatus();
    const newStatus: SyncStatus = {
      ...currentStatus,
      ...updates,
    };

    await StorageService.set(this.SYNC_STATUS_KEY, newStatus);

    // Notify all listeners
    this.syncListeners.forEach(listener => {
      try {
        listener(newStatus);
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  }
}
