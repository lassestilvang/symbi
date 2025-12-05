/**
 * Achievement Store
 *
 * Zustand store for managing achievement state including:
 * - Earned achievements and progress tracking
 * - Achievement statistics
 * - Integration with AchievementService
 *
 * Requirements: 1.2, 1.3, 7.1
 */

import { create } from 'zustand';
import type {
  Achievement,
  AchievementCategory,
  AchievementProgress,
  AchievementStatistics,
  RarityTier,
} from '../types';
import { getAchievementService } from '../services/AchievementService';

// ============================================================================
// Store Interface
// ============================================================================

interface AchievementState {
  // State
  achievements: Achievement[];
  earnedAchievements: Achievement[];
  statistics: AchievementStatistics;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  unlockAchievement: (achievementId: string) => Promise<Achievement | null>;
  updateProgress: (achievementId: string, current: number) => Promise<AchievementProgress>;
  refreshAchievements: () => void;
  getAchievementsByCategory: (category: AchievementCategory) => Achievement[];
  filterAchievements: (options: {
    category?: AchievementCategory;
    status?: 'earned' | 'locked' | 'all';
    rarity?: RarityTier;
  }) => Achievement[];
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const initialStatistics: AchievementStatistics = {
  totalEarned: 0,
  totalAvailable: 0,
  completionPercentage: 0,
  rarestBadge: null,
  recentUnlocks: [],
};

const initialState = {
  achievements: [] as Achievement[],
  earnedAchievements: [] as Achievement[],
  statistics: initialStatistics,
  isInitialized: false,
  isLoading: false,
  error: null as string | null,
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useAchievementStore = create<AchievementState>((set, get) => ({
  ...initialState,

  /**
   * Initialize the store by loading data from AchievementService
   */
  initialize: async () => {
    const { isInitialized, isLoading } = get();
    if (isInitialized || isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const service = getAchievementService();
      await service.initialize();

      const achievements = service.getAllAchievements();
      const earnedAchievements = service.getEarnedAchievements();
      const statistics = service.getStatistics();

      set({
        achievements,
        earnedAchievements,
        statistics,
        isInitialized: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('[achievementStore] Error initializing:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to initialize achievements',
        isLoading: false,
      });
    }
  },

  /**
   * Unlock an achievement by ID
   * Requirements: 1.2
   */
  unlockAchievement: async (achievementId: string) => {
    set({ isLoading: true, error: null });

    try {
      const service = getAchievementService();
      const result = await service.unlockAchievement(achievementId);

      if (result.isNewUnlock) {
        // Refresh state from service
        const achievements = service.getAllAchievements();
        const earnedAchievements = service.getEarnedAchievements();
        const statistics = service.getStatistics();

        set({
          achievements,
          earnedAchievements,
          statistics,
          isLoading: false,
        });

        return result.achievement;
      }

      set({ isLoading: false });
      return null;
    } catch (error) {
      console.error('[achievementStore] Error unlocking achievement:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to unlock achievement',
        isLoading: false,
      });
      return null;
    }
  },

  /**
   * Update progress for an achievement
   */
  updateProgress: async (achievementId: string, current: number) => {
    try {
      const service = getAchievementService();
      const progress = await service.updateProgress(achievementId, current);

      // Refresh achievements to reflect updated progress
      const achievements = service.getAllAchievements();
      set({ achievements });

      return progress;
    } catch (error) {
      console.error('[achievementStore] Error updating progress:', error);
      return { current: 0, target: 0, percentage: 0 };
    }
  },

  /**
   * Refresh achievements from service
   * Requirements: 1.3
   */
  refreshAchievements: () => {
    const service = getAchievementService();
    const achievements = service.getAllAchievements();
    const earnedAchievements = service.getEarnedAchievements();
    const statistics = service.getStatistics();

    set({
      achievements,
      earnedAchievements,
      statistics,
    });
  },

  /**
   * Get achievements filtered by category
   * Requirements: 1.3
   */
  getAchievementsByCategory: (category: AchievementCategory) => {
    const { achievements } = get();
    return achievements.filter(a => a.category === category);
  },

  /**
   * Filter achievements by multiple criteria
   * Requirements: 7.1
   */
  filterAchievements: options => {
    const service = getAchievementService();
    return service.filterAchievements(options);
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
