import { create } from 'zustand';
import { EmotionalState, HealthMetrics } from '../types';
import { StorageService } from '../services/StorageService';

/**
 * Health Data Store
 *
 * Manages reactive health data state including:
 * - Current emotional state
 * - Latest health metrics (steps, sleep, HRV)
 * - Last update timestamp
 * - Loading and error states
 */

interface HealthDataState {
  // Current state
  emotionalState: EmotionalState;
  healthMetrics: HealthMetrics;
  lastUpdated: Date | null;
  calculationMethod: 'rule-based' | 'ai';

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  setEmotionalState: (state: EmotionalState, method: 'rule-based' | 'ai') => void;
  setHealthMetrics: (metrics: HealthMetrics) => void;
  updateHealthData: (
    metrics: HealthMetrics,
    state: EmotionalState,
    method: 'rule-based' | 'ai'
  ) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  emotionalState: EmotionalState.RESTING,
  healthMetrics: { steps: 0 },
  lastUpdated: null,
  calculationMethod: 'rule-based' as const,
  isLoading: false,
  error: null,
};

export const useHealthDataStore = create<HealthDataState>((set, _get) => ({
  ...initialState,

  setEmotionalState: (state: EmotionalState, method: 'rule-based' | 'ai') => {
    set({
      emotionalState: state,
      calculationMethod: method,
      lastUpdated: new Date(),
    });
  },

  setHealthMetrics: (metrics: HealthMetrics) => {
    set({ healthMetrics: metrics });
  },

  updateHealthData: async (
    metrics: HealthMetrics,
    state: EmotionalState,
    method: 'rule-based' | 'ai'
  ) => {
    const now = new Date();
    set({
      healthMetrics: metrics,
      emotionalState: state,
      calculationMethod: method,
      lastUpdated: now,
      error: null,
    });

    // Persist to cache
    const dateKey = now.toISOString().split('T')[0];
    const cacheEntry = {
      date: dateKey,
      steps: metrics.steps,
      sleepHours: metrics.sleepHours,
      hrv: metrics.hrv,
      emotionalState: state,
      calculationMethod: method,
      lastUpdated: now,
    };

    console.log(`[healthDataStore] Saving to cache for ${dateKey}:`, cacheEntry);
    await StorageService.addHealthDataEntry(dateKey, cacheEntry);
    console.log(`[healthDataStore] Cache save complete`);
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error, isLoading: false });
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set(initialState);
  },
}));
