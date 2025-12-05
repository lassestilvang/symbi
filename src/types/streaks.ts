/**
 * Streak Type Definitions for Symbi
 *
 * This file contains all TypeScript interfaces for the streak tracking system.
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

// ============================================================================
// Streak Interfaces
// ============================================================================

/**
 * StreakRecord represents a single day's streak data
 */
export interface StreakRecord {
  date: string; // ISO date string (YYYY-MM-DD)
  metCriteria: boolean;
  streakCount: number;
}

/**
 * StreakState represents the current state of the user's streak
 */
export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastRecordedDate: string; // ISO date string (YYYY-MM-DD)
  streakHistory: StreakRecord[];
}

/**
 * StreakMilestone defines a streak threshold that triggers rewards
 */
export interface StreakMilestone {
  days: number;
  achievementId: string;
  cosmeticReward?: string;
}

/**
 * StreakUpdate represents the result of recording daily progress
 */
export interface StreakUpdate {
  previousStreak: number;
  newStreak: number;
  wasReset: boolean;
  milestoneReached: StreakMilestone | null;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * STREAK_MILESTONES defines the milestone thresholds for streak achievements
 */
export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 7, achievementId: 'streak_7' },
  { days: 14, achievementId: 'streak_14' },
  { days: 30, achievementId: 'streak_30' },
  { days: 60, achievementId: 'streak_60' },
  { days: 90, achievementId: 'streak_90' },
];

// ============================================================================
// Storage Types
// ============================================================================

/**
 * StreakStorageData is the schema for persisted streak data
 */
export interface StreakStorageData {
  state: StreakState;
  lastUpdated: string; // ISO date string
}
