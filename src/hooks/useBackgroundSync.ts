import { useEffect, useCallback, useRef } from 'react';
import { getBackgroundSyncService } from '../services/BackgroundSyncService';
import { HealthDataUpdateService } from '../services/HealthDataUpdateService';
import { HealthDataType } from '../types';

/**
 * Custom hook for background health data synchronization
 *
 * Extracts background sync logic from MainScreen
 * and properly handles cleanup to prevent memory leaks.
 */

interface UseBackgroundSyncOptions {
  /** Data types to sync */
  dataTypes?: HealthDataType[];
  /** Whether sync is enabled */
  enabled?: boolean;
}

export const useBackgroundSync = (options: UseBackgroundSyncOptions = {}): void => {
  const { dataTypes = [HealthDataType.STEPS], enabled = true } = options;
  const isSyncingRef = useRef(false);

  const startSync = useCallback(async () => {
    if (isSyncingRef.current || !enabled) return;

    try {
      const backgroundSync = getBackgroundSyncService();

      await backgroundSync.startBackgroundSync(dataTypes, async (dataType, data) => {
        if (__DEV__) {
          console.log('Background update received:', dataType, data);
        }
        await HealthDataUpdateService.updateDailyHealthData();
      });

      isSyncingRef.current = true;
      if (__DEV__) {
        console.log('Background sync started');
      }
    } catch (err) {
      if (__DEV__) {
        console.error('Error starting background sync:', err);
      }
    }
  }, [dataTypes, enabled]);

  const stopSync = useCallback(() => {
    if (!isSyncingRef.current) return;

    try {
      const backgroundSync = getBackgroundSyncService();
      backgroundSync.stopBackgroundSync();
      isSyncingRef.current = false;
      if (__DEV__) {
        console.log('Background sync stopped');
      }
    } catch (err) {
      if (__DEV__) {
        console.error('Error stopping background sync:', err);
      }
    }
  }, []);

  useEffect(() => {
    startSync();

    return () => {
      stopSync();
    };
  }, [startSync, stopSync]);
};
