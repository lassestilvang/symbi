import { useState, useEffect, useCallback } from 'react';
import { useHealthDataStore } from '../stores/healthDataStore';
import { HealthDataUpdateService } from '../services/HealthDataUpdateService';

/**
 * Custom hook for health data initialization
 *
 * Extracts health data initialization logic from MainScreen
 * to improve code organization and reusability.
 */

interface UseHealthDataInitializationResult {
  isInitializing: boolean;
  refreshing: boolean;
  handleRefresh: () => Promise<void>;
}

/**
 * Get user-friendly error message based on error type
 */
const getErrorMessage = (err: unknown): string => {
  const error = err as Error;
  const errorString = error?.message || error?.toString() || '';

  if (errorString.includes('permission') || errorString.includes('authorized')) {
    return 'Health data permissions not granted. Please enable in Settings.';
  }

  if (errorString.includes('no data') || errorString.includes('not available')) {
    return 'No health data available yet. Try walking a bit!';
  }

  if (errorString.includes('network') || errorString.includes('connection')) {
    return 'Network error. Using cached data if available.';
  }

  return 'Unable to load health data. Please try again.';
};

export const useHealthDataInitialization = (): UseHealthDataInitializationResult => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { setLoading, setError, clearError } = useHealthDataStore();

  const initializeHealthData = useCallback(async () => {
    try {
      setIsInitializing(true);
      setLoading(true);
      clearError();

      await HealthDataUpdateService.initialize();
      await HealthDataUpdateService.updateDailyHealthData();

      setIsInitializing(false);
      setLoading(false);
    } catch (err) {
      if (__DEV__) {
        console.error('Error initializing health data:', err);
      }
      setIsInitializing(false);
      setLoading(false);

      const cachedData = await HealthDataUpdateService.getTodayHealthData();
      if (cachedData) {
        setError('Using cached data from previous update');
      } else {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
      }
    }
  }, [setLoading, setError, clearError]);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      clearError();
      await HealthDataUpdateService.refreshHealthData();
      setRefreshing(false);
    } catch (err) {
      if (__DEV__) {
        console.error('Error refreshing health data:', err);
      }
      setRefreshing(false);
      setError('Failed to refresh health data');
    }
  }, [clearError, setError]);

  useEffect(() => {
    initializeHealthData();
  }, [initializeHealthData]);

  return {
    isInitializing,
    refreshing,
    handleRefresh,
  };
};
