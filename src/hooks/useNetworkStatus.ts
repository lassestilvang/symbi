import { useState, useEffect, useCallback, useRef } from 'react';
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import { HealthDataUpdateService } from '../services/HealthDataUpdateService';

/**
 * Custom hook for network status monitoring
 *
 * Extracts network connectivity logic from MainScreen
 * and properly handles cleanup to prevent memory leaks.
 */

interface UseNetworkStatusResult {
  isOffline: boolean;
}

interface UseNetworkStatusOptions {
  /** Whether to auto-refresh data when coming back online */
  autoRefreshOnReconnect?: boolean;
  /** Skip refresh during initialization */
  skipInitialRefresh?: boolean;
}

export const useNetworkStatus = (options: UseNetworkStatusOptions = {}): UseNetworkStatusResult => {
  const { autoRefreshOnReconnect = true, skipInitialRefresh = true } = options;
  const [isOffline, setIsOffline] = useState(false);
  const isInitialMount = useRef(true);

  const handleNetworkChange = useCallback(
    (state: NetInfoState) => {
      const wasOffline = isOffline;
      const nowOffline = !state.isConnected;

      setIsOffline(nowOffline);

      // Refresh data when coming back online (but not on initial mount)
      if (autoRefreshOnReconnect && wasOffline && !nowOffline && !isInitialMount.current) {
        if (__DEV__) {
          console.log('Network restored, refreshing data...');
        }
        HealthDataUpdateService.refreshHealthData().catch(err => {
          if (__DEV__) {
            console.error('Error refreshing after network restore:', err);
          }
        });
      }
    },
    [isOffline, autoRefreshOnReconnect]
  );

  useEffect(() => {
    let unsubscribe: NetInfoSubscription | null = null;

    // Check initial network state
    NetInfo.fetch().then(state => {
      setIsOffline(!state.isConnected);
      // Mark initial mount as complete after first check
      if (skipInitialRefresh) {
        isInitialMount.current = false;
      }
    });

    // Subscribe to network changes
    unsubscribe = NetInfo.addEventListener(handleNetworkChange);

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [handleNetworkChange, skipInitialRefresh]);

  return { isOffline };
};
