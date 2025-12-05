/**
 * AchievementService - Manages achievement definitions, progress tracking, and unlock logic
 *
 * This service handles:
 * - Achievement catalog with categories, rarity, and unlock conditions
 * - Milestone detection when health thresholds are crossed
 * - Achievement unlocking with persistence and cosmetic rewards
 * - Progress calculation for incomplete achievements
 * - Statistics and filtering
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 7.1, 7.3, 7.4
 */

import type {
  Achievement,
  AchievementCategory,
  AchievementProgress,
  AchievementStatistics,
  AchievementUnlockResult,
  HealthMetrics,
  RarityTier,
  UnlockCondition,
} from '../types';
import { StorageService } from './StorageService';

// ============================================================================
// Achievement Catalog
// ============================================================================

/**
 * ACHIEVEMENT_CATALOG defines all available achievements in the system.
 * Each achievement has a unique ID, category, rarity, and unlock condition.
 */
export const ACHIEVEMENT_CATALOG: Achievement[] = [
  // Health Milestones - Steps
  {
    id: 'steps_5000',
    name: 'First Steps',
    description: 'Walk 5,000 steps in a single day',
    category: 'health_milestones',
    rarity: 'common',
    iconUrl: 'achievements/steps_5000.png',
    unlockCondition: { type: 'steps', threshold: 5000, comparison: 'gte' },
    cosmeticRewards: [],
  },
  {
    id: 'steps_10000',
    name: 'Step Champion',
    description: 'Walk 10,000 steps in a single day',
    category: 'health_milestones',
    rarity: 'common',
    iconUrl: 'achievements/steps_10000.png',
    unlockCondition: { type: 'steps', threshold: 10000, comparison: 'gte' },
    cosmeticRewards: ['hat_crown'],
  },
  {
    id: 'steps_15000',
    name: 'Marathon Walker',
    description: 'Walk 15,000 steps in a single day',
    category: 'health_milestones',
    rarity: 'rare',
    iconUrl: 'achievements/steps_15000.png',
    unlockCondition: { type: 'steps', threshold: 15000, comparison: 'gte' },
    cosmeticRewards: ['accessory_medal'],
  },

  {
    id: 'steps_20000',
    name: 'Ultra Walker',
    description: 'Walk 20,000 steps in a single day',
    category: 'health_milestones',
    rarity: 'epic',
    iconUrl: 'achievements/steps_20000.png',
    unlockCondition: { type: 'steps', threshold: 20000, comparison: 'gte' },
    cosmeticRewards: ['color_gold'],
  },
  {
    id: 'steps_30000',
    name: 'Legendary Strider',
    description: 'Walk 30,000 steps in a single day',
    category: 'health_milestones',
    rarity: 'legendary',
    iconUrl: 'achievements/steps_30000.png',
    unlockCondition: { type: 'steps', threshold: 30000, comparison: 'gte' },
    cosmeticRewards: ['theme_golden'],
  },

  // Streak Rewards
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day health streak',
    category: 'streak_rewards',
    rarity: 'common',
    iconUrl: 'achievements/streak_7.png',
    unlockCondition: { type: 'streak', threshold: 7, comparison: 'gte' },
    cosmeticRewards: ['hat_headband'],
  },
  {
    id: 'streak_14',
    name: 'Fortnight Fighter',
    description: 'Maintain a 14-day health streak',
    category: 'streak_rewards',
    rarity: 'rare',
    iconUrl: 'achievements/streak_14.png',
    unlockCondition: { type: 'streak', threshold: 14, comparison: 'gte' },
    cosmeticRewards: ['accessory_cape'],
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day health streak',
    category: 'streak_rewards',
    rarity: 'epic',
    iconUrl: 'achievements/streak_30.png',
    unlockCondition: { type: 'streak', threshold: 30, comparison: 'gte' },
    cosmeticRewards: ['background_stars'],
  },
  {
    id: 'streak_60',
    name: 'Dedication Champion',
    description: 'Maintain a 60-day health streak',
    category: 'streak_rewards',
    rarity: 'epic',
    iconUrl: 'achievements/streak_60.png',
    unlockCondition: { type: 'streak', threshold: 60, comparison: 'gte' },
    cosmeticRewards: ['color_rainbow'],
  },
  {
    id: 'streak_90',
    name: 'Legendary Dedication',
    description: 'Maintain a 90-day health streak',
    category: 'streak_rewards',
    rarity: 'legendary',
    iconUrl: 'achievements/streak_90.png',
    unlockCondition: { type: 'streak', threshold: 90, comparison: 'gte' },
    cosmeticRewards: ['theme_legendary'],
  },

  // Challenge Completion
  {
    id: 'challenge_first',
    name: 'Challenge Accepted',
    description: 'Complete your first weekly challenge',
    category: 'challenge_completion',
    rarity: 'common',
    iconUrl: 'achievements/challenge_first.png',
    unlockCondition: { type: 'challenge', threshold: 1, comparison: 'gte' },
    cosmeticRewards: [],
  },
  {
    id: 'challenge_5',
    name: 'Challenge Seeker',
    description: 'Complete 5 weekly challenges',
    category: 'challenge_completion',
    rarity: 'rare',
    iconUrl: 'achievements/challenge_5.png',
    unlockCondition: { type: 'challenge', threshold: 5, comparison: 'gte' },
    cosmeticRewards: ['accessory_trophy'],
  },
  {
    id: 'challenge_weekly_all',
    name: 'Perfect Week',
    description: 'Complete all challenges in a single week',
    category: 'challenge_completion',
    rarity: 'epic',
    iconUrl: 'achievements/challenge_weekly_all.png',
    unlockCondition: { type: 'custom', threshold: 1, comparison: 'eq' },
    cosmeticRewards: ['hat_champion'],
  },

  // Exploration
  {
    id: 'explore_customization',
    name: 'Fashion Forward',
    description: 'Equip your first cosmetic item',
    category: 'exploration',
    rarity: 'common',
    iconUrl: 'achievements/explore_customization.png',
    unlockCondition: { type: 'custom', threshold: 1, comparison: 'eq' },
    cosmeticRewards: [],
  },
  {
    id: 'explore_evolution',
    name: 'Evolution Witness',
    description: 'Witness your first Symbi evolution',
    category: 'exploration',
    rarity: 'rare',
    iconUrl: 'achievements/explore_evolution.png',
    unlockCondition: { type: 'evolution', threshold: 1, comparison: 'gte' },
    cosmeticRewards: ['background_evolution'],
  },

  // Special Events
  {
    id: 'special_halloween',
    name: 'Spooky Spirit',
    description: 'Be active during Halloween season',
    category: 'special_events',
    rarity: 'rare',
    iconUrl: 'achievements/special_halloween.png',
    unlockCondition: { type: 'custom', threshold: 1, comparison: 'eq' },
    cosmeticRewards: ['hat_witch', 'background_haunted'],
  },
];

// ============================================================================
// Rarity Order (for sorting and comparison)
// ============================================================================

const RARITY_ORDER: Record<RarityTier, number> = {
  common: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
};

// ============================================================================
// AchievementService Class
// ============================================================================

/**
 * AchievementService manages achievement definitions, progress tracking, and unlock logic.
 */
export class AchievementService {
  private earnedAchievementIds: Set<string> = new Set();
  private achievementProgress: Map<string, AchievementProgress> = new Map();
  private initialized = false;

  /**
   * Initialize the service by loading persisted achievement data.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const data = await StorageService.getAchievementData();
    if (data) {
      data.achievements
        .filter(a => a.unlockedAt !== undefined)
        .forEach(a => this.earnedAchievementIds.add(a.id));

      data.achievements
        .filter(a => a.progress !== undefined)
        .forEach(a => this.achievementProgress.set(a.id, a.progress!));
    }

    this.initialized = true;
  }

  // ==========================================================================
  // Query Methods (Requirements: 1.3, 7.1)
  // ==========================================================================

  /**
   * Get all achievements from the catalog with their current state.
   */
  getAllAchievements(): Achievement[] {
    return ACHIEVEMENT_CATALOG.map(achievement => this.enrichAchievement(achievement));
  }

  /**
   * Get all earned (unlocked) achievements.
   */
  getEarnedAchievements(): Achievement[] {
    return ACHIEVEMENT_CATALOG.filter(a => this.earnedAchievementIds.has(a.id)).map(a =>
      this.enrichAchievement(a)
    );
  }

  /**
   * Get achievements filtered by category.
   */
  getAchievementsByCategory(category: AchievementCategory): Achievement[] {
    return ACHIEVEMENT_CATALOG.filter(a => a.category === category).map(a =>
      this.enrichAchievement(a)
    );
  }

  /**
   * Get a single achievement by ID.
   */
  getAchievementById(achievementId: string): Achievement | null {
    const achievement = ACHIEVEMENT_CATALOG.find(a => a.id === achievementId);
    return achievement ? this.enrichAchievement(achievement) : null;
  }

  /**
   * Check if an achievement is earned.
   */
  isAchievementEarned(achievementId: string): boolean {
    return this.earnedAchievementIds.has(achievementId);
  }

  // ==========================================================================
  // Milestone Detection (Requirements: 1.1)
  // ==========================================================================

  /**
   * Check health metrics against achievement thresholds and return newly unlocked achievements.
   * This method detects when milestones are crossed based on current health data.
   */
  async checkMilestone(healthData: HealthMetrics): Promise<Achievement[]> {
    await this.initialize();

    const newlyUnlocked: Achievement[] = [];

    for (const achievement of ACHIEVEMENT_CATALOG) {
      // Skip already earned achievements
      if (this.earnedAchievementIds.has(achievement.id)) continue;

      // Check if the unlock condition is met
      if (this.checkUnlockCondition(achievement.unlockCondition, healthData)) {
        const result = await this.unlockAchievement(achievement.id);
        if (result.isNewUnlock) {
          newlyUnlocked.push(result.achievement);
        }
      }
    }

    return newlyUnlocked;
  }

  /**
   * Check if an unlock condition is satisfied by the given health data.
   */
  private checkUnlockCondition(condition: UnlockCondition, healthData: HealthMetrics): boolean {
    let value: number;

    switch (condition.type) {
      case 'steps':
        value = healthData.steps;
        break;
      case 'streak':
      case 'challenge':
      case 'evolution':
      case 'custom':
        // These are handled by other services (StreakService, ChallengeService, etc.)
        return false;
      default:
        return false;
    }

    switch (condition.comparison) {
      case 'gte':
        return value >= condition.threshold;
      case 'eq':
        return value === condition.threshold;
      case 'consecutive':
        // Consecutive comparisons are handled by StreakService
        return false;
      default:
        return false;
    }
  }

  // ==========================================================================
  // Achievement Unlocking (Requirements: 1.2)
  // ==========================================================================

  /**
   * Unlock an achievement by ID.
   * Persists the achievement and returns the unlock result with cosmetic rewards.
   */
  async unlockAchievement(achievementId: string): Promise<AchievementUnlockResult> {
    await this.initialize();

    const achievement = ACHIEVEMENT_CATALOG.find(a => a.id === achievementId);
    if (!achievement) {
      throw new Error(`Achievement not found: ${achievementId}`);
    }

    // Check if already unlocked (idempotent operation)
    if (this.earnedAchievementIds.has(achievementId)) {
      return {
        achievement: this.enrichAchievement(achievement),
        cosmeticsUnlocked: [],
        isNewUnlock: false,
      };
    }

    // Mark as earned
    this.earnedAchievementIds.add(achievementId);

    // Create the unlocked achievement with timestamp
    const unlockedAchievement: Achievement = {
      ...achievement,
      unlockedAt: new Date().toISOString(),
      progress: {
        current: achievement.unlockCondition.threshold,
        target: achievement.unlockCondition.threshold,
        percentage: 100,
      },
    };

    // Persist to storage
    await this.persistAchievementState(unlockedAchievement);

    return {
      achievement: unlockedAchievement,
      cosmeticsUnlocked: achievement.cosmeticRewards,
      isNewUnlock: true,
    };
  }

  /**
   * Unlock an achievement by condition type and value.
   * Used by other services (StreakService, ChallengeService) to trigger unlocks.
   */
  async unlockByCondition(
    conditionType: UnlockCondition['type'],
    value: number
  ): Promise<Achievement[]> {
    await this.initialize();

    const newlyUnlocked: Achievement[] = [];

    for (const achievement of ACHIEVEMENT_CATALOG) {
      if (this.earnedAchievementIds.has(achievement.id)) continue;

      const condition = achievement.unlockCondition;
      if (condition.type !== conditionType) continue;

      let shouldUnlock = false;
      switch (condition.comparison) {
        case 'gte':
          shouldUnlock = value >= condition.threshold;
          break;
        case 'eq':
          shouldUnlock = value === condition.threshold;
          break;
        case 'consecutive':
          shouldUnlock = value >= condition.threshold;
          break;
      }

      if (shouldUnlock) {
        const result = await this.unlockAchievement(achievement.id);
        if (result.isNewUnlock) {
          newlyUnlocked.push(result.achievement);
        }
      }
    }

    return newlyUnlocked;
  }

  // ==========================================================================
  // Progress Tracking (Requirements: 1.4)
  // ==========================================================================

  /**
   * Get progress for a specific achievement.
   * Returns current progress, target, and percentage.
   */
  getAchievementProgress(achievementId: string): AchievementProgress {
    const achievement = ACHIEVEMENT_CATALOG.find(a => a.id === achievementId);
    if (!achievement) {
      return { current: 0, target: 0, percentage: 0 };
    }

    // If already earned, return 100%
    if (this.earnedAchievementIds.has(achievementId)) {
      return {
        current: achievement.unlockCondition.threshold,
        target: achievement.unlockCondition.threshold,
        percentage: 100,
      };
    }

    // Return stored progress or default
    const storedProgress = this.achievementProgress.get(achievementId);
    if (storedProgress) {
      return storedProgress;
    }

    return {
      current: 0,
      target: achievement.unlockCondition.threshold,
      percentage: 0,
    };
  }

  /**
   * Update progress for an achievement.
   * Calculates percentage and persists the update.
   */
  async updateProgress(achievementId: string, current: number): Promise<AchievementProgress> {
    await this.initialize();

    const achievement = ACHIEVEMENT_CATALOG.find(a => a.id === achievementId);
    if (!achievement) {
      return { current: 0, target: 0, percentage: 0 };
    }

    const target = achievement.unlockCondition.threshold;
    const percentage = Math.min(100, Math.round((current / target) * 100));

    const progress: AchievementProgress = { current, target, percentage };
    this.achievementProgress.set(achievementId, progress);

    // Persist progress
    const enrichedAchievement = this.enrichAchievement(achievement);
    enrichedAchievement.progress = progress;
    await this.persistAchievementState(enrichedAchievement);

    return progress;
  }

  // ==========================================================================
  // Statistics (Requirements: 7.1, 7.4)
  // ==========================================================================

  /**
   * Get aggregate achievement statistics.
   * Returns total earned, completion percentage, and rarest badge.
   */
  getStatistics(): AchievementStatistics {
    const totalAvailable = ACHIEVEMENT_CATALOG.length;
    const totalEarned = this.earnedAchievementIds.size;
    const completionPercentage =
      totalAvailable > 0 ? Math.round((totalEarned / totalAvailable) * 100) : 0;

    // Find rarest earned badge
    const earnedAchievements = this.getEarnedAchievements();
    const rarestBadge = this.findRarestAchievement(earnedAchievements);

    // Get recent unlocks (last 5)
    const recentUnlocks = earnedAchievements
      .filter(a => a.unlockedAt)
      .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
      .slice(0, 5);

    return {
      totalEarned,
      totalAvailable,
      completionPercentage,
      rarestBadge,
      recentUnlocks,
    };
  }

  /**
   * Get completion percentage.
   */
  getCompletionPercentage(): number {
    const totalAvailable = ACHIEVEMENT_CATALOG.length;
    if (totalAvailable === 0) return 0;
    return Math.round((this.earnedAchievementIds.size / totalAvailable) * 100);
  }

  /**
   * Find the rarest achievement from a list.
   */
  private findRarestAchievement(achievements: Achievement[]): Achievement | null {
    if (achievements.length === 0) return null;

    return achievements.reduce((rarest, current) => {
      const currentRarity = RARITY_ORDER[current.rarity];
      const rarestRarity = RARITY_ORDER[rarest.rarity];
      return currentRarity > rarestRarity ? current : rarest;
    });
  }

  // ==========================================================================
  // Filtering (Requirements: 7.3)
  // ==========================================================================

  /**
   * Filter achievements by multiple criteria.
   */
  filterAchievements(options: {
    category?: AchievementCategory;
    status?: 'earned' | 'locked' | 'all';
    rarity?: RarityTier;
  }): Achievement[] {
    let results = ACHIEVEMENT_CATALOG.map(a => this.enrichAchievement(a));

    // Filter by category
    if (options.category) {
      results = results.filter(a => a.category === options.category);
    }

    // Filter by status
    if (options.status === 'earned') {
      results = results.filter(a => this.earnedAchievementIds.has(a.id));
    } else if (options.status === 'locked') {
      results = results.filter(a => !this.earnedAchievementIds.has(a.id));
    }

    // Filter by rarity
    if (options.rarity) {
      results = results.filter(a => a.rarity === options.rarity);
    }

    return results;
  }

  // ==========================================================================
  // Helper Methods
  // ==========================================================================

  /**
   * Enrich an achievement with current state (earned status, progress).
   */
  private enrichAchievement(achievement: Achievement): Achievement {
    const isEarned = this.earnedAchievementIds.has(achievement.id);
    const progress = this.achievementProgress.get(achievement.id);

    return {
      ...achievement,
      unlockedAt: isEarned ? achievement.unlockedAt : undefined,
      progress: isEarned
        ? {
            current: achievement.unlockCondition.threshold,
            target: achievement.unlockCondition.threshold,
            percentage: 100,
          }
        : progress || { current: 0, target: achievement.unlockCondition.threshold, percentage: 0 },
    };
  }

  /**
   * Persist achievement state to storage.
   */
  private async persistAchievementState(achievement: Achievement): Promise<void> {
    const data = await StorageService.getAchievementData();
    const achievements = data?.achievements || [];

    const existingIndex = achievements.findIndex(a => a.id === achievement.id);
    if (existingIndex >= 0) {
      achievements[existingIndex] = achievement;
    } else {
      achievements.push(achievement);
    }

    const statistics = this.getStatistics();

    await StorageService.setAchievementData({
      achievements,
      statistics,
      lastUpdated: new Date().toISOString(),
    });
  }

  /**
   * Reset the service state (for testing or data reset).
   */
  reset(): void {
    this.earnedAchievementIds.clear();
    this.achievementProgress.clear();
    this.initialized = false;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let achievementServiceInstance: AchievementService | null = null;

/**
 * Get the singleton AchievementService instance.
 */
export function getAchievementService(): AchievementService {
  if (!achievementServiceInstance) {
    achievementServiceInstance = new AchievementService();
  }
  return achievementServiceInstance;
}

/**
 * Reset the singleton instance (for testing).
 */
export function resetAchievementService(): void {
  if (achievementServiceInstance) {
    achievementServiceInstance.reset();
  }
  achievementServiceInstance = null;
}
