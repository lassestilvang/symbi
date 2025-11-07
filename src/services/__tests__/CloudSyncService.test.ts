/**
 * CloudSyncService Tests
 * 
 * Tests cloud synchronization functionality.
 */

import { CloudSyncService } from '../CloudSyncService';
import { StorageService } from '../StorageService';
import { CloudAPIService } from '../CloudAPIService';
import { AuthService } from '../AuthService';
import { EmotionalState, UserProfile, EvolutionRecord } from '../../types';

// Mock dependencies
jest.mock('../StorageService');
jest.mock('../CloudAPIService');
jest.mock('../AuthService');
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
  addEventListener: jest.fn(() => jest.fn()),
}));

describe('CloudSyncService', () => {
  const mockUserProfile: UserProfile = {
    id: 'user123',
    createdAt: new Date(),
    preferences: {
      dataSource: 'manual',
      notificationsEnabled: true,
      hapticFeedbackEnabled: true,
      soundEnabled: true,
      theme: 'auto',
    },
    thresholds: {
      sadThreshold: 2000,
      activeThreshold: 8000,
    },
    goals: {
      targetSteps: 10000,
      targetSleepHours: 8,
      targetHRV: 60,
    },
    evolutionLevel: 1,
    totalDaysActive: 15,
  };

  const mockEvolutionRecords: EvolutionRecord[] = [
    {
      id: 'evo1',
      timestamp: new Date(),
      evolutionLevel: 1,
      appearanceUrl: 'https://example.com/evo1.png',
      daysInPositiveState: 30,
      dominantStates: [EmotionalState.ACTIVE, EmotionalState.VIBRANT],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (AuthService.isAuthenticated as jest.Mock).mockResolvedValue(true);
  });

  describe('sync', () => {
    it('should successfully sync data when authenticated and online', async () => {
      (StorageService.getUserProfile as jest.Mock).mockResolvedValue(mockUserProfile);
      (StorageService.getEvolutionRecords as jest.Mock).mockResolvedValue(mockEvolutionRecords);
      (CloudAPIService.uploadData as jest.Mock).mockResolvedValue({ success: true });
      (CloudAPIService.downloadData as jest.Mock).mockResolvedValue({
        success: true,
        data: undefined,
      });
      (StorageService.set as jest.Mock).mockResolvedValue(true);

      const result = await CloudSyncService.sync();

      expect(result).toBe(true);
      expect(CloudAPIService.uploadData).toHaveBeenCalled();
      expect(CloudAPIService.downloadData).toHaveBeenCalled();
    });

    it('should fail sync when user is not authenticated', async () => {
      (AuthService.isAuthenticated as jest.Mock).mockResolvedValue(false);

      const result = await CloudSyncService.sync();

      expect(result).toBe(false);
      expect(CloudAPIService.uploadData).not.toHaveBeenCalled();
    });

    it('should queue pending sync when offline', async () => {
      const NetInfo = require('@react-native-community/netinfo');
      NetInfo.fetch.mockResolvedValueOnce({ isConnected: false });

      (StorageService.getUserProfile as jest.Mock).mockResolvedValue(mockUserProfile);
      (StorageService.getEvolutionRecords as jest.Mock).mockResolvedValue(mockEvolutionRecords);
      (StorageService.set as jest.Mock).mockResolvedValue(true);

      const result = await CloudSyncService.sync();

      expect(result).toBe(false);
      expect(StorageService.set).toHaveBeenCalledWith(
        expect.any(String),
        true
      );
    });

    it('should only upload when uploadOnly option is set', async () => {
      (StorageService.getUserProfile as jest.Mock).mockResolvedValue(mockUserProfile);
      (StorageService.getEvolutionRecords as jest.Mock).mockResolvedValue(mockEvolutionRecords);
      (CloudAPIService.uploadData as jest.Mock).mockResolvedValue({ success: true });
      (StorageService.set as jest.Mock).mockResolvedValue(true);

      const result = await CloudSyncService.sync({ uploadOnly: true });

      expect(result).toBe(true);
      expect(CloudAPIService.uploadData).toHaveBeenCalled();
      expect(CloudAPIService.downloadData).not.toHaveBeenCalled();
    });

    it('should only download when downloadOnly option is set', async () => {
      (StorageService.getUserProfile as jest.Mock).mockResolvedValue(mockUserProfile);
      (StorageService.getEvolutionRecords as jest.Mock).mockResolvedValue(mockEvolutionRecords);
      (CloudAPIService.downloadData as jest.Mock).mockResolvedValue({
        success: true,
        data: undefined,
      });
      (StorageService.set as jest.Mock).mockResolvedValue(true);

      const result = await CloudSyncService.sync({ downloadOnly: true });

      expect(result).toBe(true);
      expect(CloudAPIService.uploadData).not.toHaveBeenCalled();
      expect(CloudAPIService.downloadData).toHaveBeenCalled();
    });
  });

  describe('uploadToCloud', () => {
    it('should call sync with uploadOnly option', async () => {
      (StorageService.getUserProfile as jest.Mock).mockResolvedValue(mockUserProfile);
      (StorageService.getEvolutionRecords as jest.Mock).mockResolvedValue(mockEvolutionRecords);
      (CloudAPIService.uploadData as jest.Mock).mockResolvedValue({ success: true });
      (StorageService.set as jest.Mock).mockResolvedValue(true);

      const result = await CloudSyncService.uploadToCloud();

      expect(result).toBe(true);
      expect(CloudAPIService.uploadData).toHaveBeenCalled();
      expect(CloudAPIService.downloadData).not.toHaveBeenCalled();
    });
  });

  describe('downloadFromCloud', () => {
    it('should call sync with downloadOnly option', async () => {
      (StorageService.getUserProfile as jest.Mock).mockResolvedValue(mockUserProfile);
      (StorageService.getEvolutionRecords as jest.Mock).mockResolvedValue(mockEvolutionRecords);
      (CloudAPIService.downloadData as jest.Mock).mockResolvedValue({
        success: true,
        data: undefined,
      });
      (StorageService.set as jest.Mock).mockResolvedValue(true);

      const result = await CloudSyncService.downloadFromCloud();

      expect(result).toBe(true);
      expect(CloudAPIService.uploadData).not.toHaveBeenCalled();
      expect(CloudAPIService.downloadData).toHaveBeenCalled();
    });
  });

  describe('getSyncStatus', () => {
    it('should return current sync status', async () => {
      const mockStatus = {
        isSyncing: false,
        lastSyncTime: new Date(),
        pendingChanges: false,
        error: null,
      };

      (StorageService.get as jest.Mock).mockResolvedValue(mockStatus);

      const status = await CloudSyncService.getSyncStatus();

      expect(status).toEqual(mockStatus);
    });

    it('should return default status if none exists', async () => {
      (StorageService.get as jest.Mock).mockResolvedValue(null);

      const status = await CloudSyncService.getSyncStatus();

      expect(status.isSyncing).toBe(false);
      expect(status.lastSyncTime).toBeNull();
      expect(status.pendingChanges).toBe(false);
      expect(status.error).toBeNull();
    });
  });

  describe('hasPendingChanges', () => {
    it('should return true when there are pending changes', async () => {
      (StorageService.get as jest.Mock).mockResolvedValue(true);

      const hasPending = await CloudSyncService.hasPendingChanges();

      expect(hasPending).toBe(true);
    });

    it('should return false when there are no pending changes', async () => {
      (StorageService.get as jest.Mock).mockResolvedValue(false);

      const hasPending = await CloudSyncService.hasPendingChanges();

      expect(hasPending).toBe(false);
    });
  });

  describe('markPendingChanges', () => {
    it('should mark that there are pending changes', async () => {
      (StorageService.set as jest.Mock).mockResolvedValue(true);
      (StorageService.get as jest.Mock).mockResolvedValue({
        isSyncing: false,
        lastSyncTime: null,
        pendingChanges: false,
        error: null,
      });

      await CloudSyncService.markPendingChanges();

      expect(StorageService.set).toHaveBeenCalledWith(
        expect.any(String),
        true
      );
    });
  });

  describe('syncPendingChanges', () => {
    it('should sync when there are pending changes and online', async () => {
      (StorageService.get as jest.Mock).mockResolvedValue(true);
      (StorageService.getUserProfile as jest.Mock).mockResolvedValue(mockUserProfile);
      (StorageService.getEvolutionRecords as jest.Mock).mockResolvedValue(mockEvolutionRecords);
      (CloudAPIService.uploadData as jest.Mock).mockResolvedValue({ success: true });
      (CloudAPIService.downloadData as jest.Mock).mockResolvedValue({
        success: true,
        data: undefined,
      });
      (StorageService.set as jest.Mock).mockResolvedValue(true);

      const result = await CloudSyncService.syncPendingChanges();

      expect(result).toBe(true);
    });

    it('should return true when there are no pending changes', async () => {
      (StorageService.get as jest.Mock).mockResolvedValue(false);

      const result = await CloudSyncService.syncPendingChanges();

      expect(result).toBe(true);
    });

    it('should return false when offline', async () => {
      const NetInfo = require('@react-native-community/netinfo');
      NetInfo.fetch.mockResolvedValueOnce({ isConnected: false });

      (StorageService.get as jest.Mock).mockResolvedValue(true);

      const result = await CloudSyncService.syncPendingChanges();

      expect(result).toBe(false);
    });
  });

  describe('addSyncListener', () => {
    it('should add listener and return unsubscribe function', () => {
      const listener = jest.fn();

      const unsubscribe = CloudSyncService.addSyncListener(listener);

      expect(typeof unsubscribe).toBe('function');

      // Unsubscribe should work
      unsubscribe();
    });
  });
});
