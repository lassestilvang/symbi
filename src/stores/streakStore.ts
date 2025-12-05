/**
 * Streak Store
 *
 * Zustand store for managing streak state including:
 * - Current and longest streak tracking
 * - Streak history
 * - Integration with StreakService
 *
 * Requirements: 2.1, 2.4
 */

import { create } from 'zustand';
import type { StreakState, StreakRecord, StreakMilestone, StreakUpdate } from '../types';
import { getStreakService } from '../services/StreakService';

// ============================================================================
// Store Interface
// ============================================================================

interface StreakStoreState {
  // State
  currentStreak: number;
  longestStreak: number;
  lastRecordedDate: string;
  streakHistory: StreakRecord[];
  nextMilestone: StreakMilestone | null;
  daysUntilMilestone: number;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  recordDailyProgress: (date: string, metCriteria: boolean) => Promise<StreakUpdate | null>;
  refreshStreak: () => void;
  getStreakState: () => StreakState;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
  currentStreak: 0,
  longestStreak: 0,
  lastRecordedDate: '',
  streakHistory: [] as StreakRecord[],
  nextMilestone: null as StreakMilestone | null,
  daysUntilMilestone: 0,
  isInitialized: false,
  isLoading: false,
  error: null as string | null,
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useStreakStore = create<StreakStoreState>((set, get) => ({
  ...initialState,

  /**
   * Initialize the store by loading data from StreakService
   */
  initialize: async () => {
    const { isInitialized, isLoading } = get();
    if (isInitialized || isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const service = getStreakService();
      await service.initialize();

      const state = service.getStreakState();
      const nextMilestone = service.getNextMilestone();
      const daysUntilMilestone = service.getDaysUntilMilestone();

      set({
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        lastRecordedDate: state.lastRecordedDate,
        streakHistory: state.streakHistory,
        nextMilestone,
        daysUntilMilestone,
        isInitialized: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('[streakStore] Error initializing:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to initialize streaks',
        isLoading: false,
      });
    }
  },

  /**
   * Record daily progress and update streak
   * Requirements: 2.1
   */
  recordDailyProgress: async (date: string, metCriteria: boolean) => {
    set({ isLoading: true, error: null });

    try {
      const service = getStreakService();
      const update = await service.recordDailyProgress(date, metCriteria);

      // Refresh state from service
      const state = service.getStreakState();
      const nextMilestone = service.getNextMilestone();
      const daysUntilMilestone = service.getDaysUntilMilestone();

      set({
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        lastRecordedDate: state.lastRecordedDate,
        streakHistory: state.streakHistory,
        nextMilestone,
        daysUntilMilestone,
        isLoading: false,
      });

      return update;
    } catch (error) {
      console.error('[streakStore] Error recording progress:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to record progress',
        isLoading: false,
      });
      return null;
    }
  },

  /**
   * Refresh streak data from service
   * Requirements: 2.4
   */
  refreshStreak: () => {
    const service = getStreakService();
    const state = service.getStreakState();
    const nextMilestone = service.getNextMilestone();
    const daysUntilMilestone = service.getDaysUntilMilestone();

    set({
      currentStreak: state.currentStreak,
      longestStreak: state.longestStreak,
      lastRecordedDate: state.lastRecordedDate,
      streakHistory: state.streakHistory,
      nextMilestone,
      daysUntilMilestone,
    });
  },

  /**
   * Get the full streak state
   * Requirements: 2.4
   */
  getStreakState: () => {
    const { currentStreak, longestStreak, lastRecordedDate, streakHistory } = get();
    return {
      currentStreak,
      longestStreak,
      lastRecordedDate,
      streakHistory,
    };
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error, isLoading: false });
  },

  reset: () => {
    set(initialState);
  },
}));
