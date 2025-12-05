/**
 * Achievement Type Definitions for Symbi
 *
 * This file contains all TypeScript interfaces for the achievement system.
 * Requirements: 1.5, 1.6, 7.1, 7.3
 */

// ============================================================================
// Achievement Enums and Types
// ============================================================================

/**
 * AchievementCategory classifies achievements by their unlock method
 */
export type AchievementCategory =
  | 'health_milestones'
  | 'streak_rewards'
  | 'challenge_completion'
  | 'exploration'
  | 'special_events';

/**
 * RarityTier indicates the difficulty/prestige of an achievement or cosmetic
 */
export type RarityTier = 'common' | 'rare' | 'epic' | 'legendary';

/**
 * UnlockConditionType specifies what triggers an achievement unlock
 */
export type UnlockConditionType = 'steps' | 'streak' | 'challenge' | 'evolution' | 'custom';

/**
 * ComparisonType specifies how to compare values for unlock conditions
 */
export type ComparisonType = 'gte' | 'eq' | 'consecutive';

// ============================================================================
// Achievement Interfaces
// ============================================================================

/**
 * UnlockCondition defines the criteria for unlocking an achievement
 */
export interface UnlockCondition {
  type: UnlockConditionType;
  threshold: number;
  comparison: ComparisonType;
}

/**
 * AchievementProgress tracks progress toward completing an achievement
 */
export interface AchievementProgress {
  current: number;
  target: number;
  percentage: number;
}

/**
 * Achievement represents a single achievement definition and its state
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: RarityTier;
  iconUrl: string;
  unlockCondition: UnlockCondition;
  cosmeticRewards: string[]; // cosmetic IDs
  unlockedAt?: string; // ISO date string
  progress?: AchievementProgress;
}

/**
 * AchievementStatistics provides aggregate metrics about user achievements
 */
export interface AchievementStatistics {
  totalEarned: number;
  totalAvailable: number;
  completionPercentage: number;
  rarestBadge: Achievement | null;
  recentUnlocks: Achievement[];
}

/**
 * AchievementUnlockResult represents the result of unlocking an achievement
 */
export interface AchievementUnlockResult {
  achievement: Achievement;
  cosmeticsUnlocked: string[];
  isNewUnlock: boolean;
}

// ============================================================================
// Storage Types
// ============================================================================

/**
 * AchievementStorageData is the schema for persisted achievement data
 */
export interface AchievementStorageData {
  achievements: Achievement[];
  statistics: AchievementStatistics;
  lastUpdated: string; // ISO date string
}
