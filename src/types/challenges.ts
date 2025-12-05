/**
 * Challenge Type Definitions for Symbi
 *
 * This file contains all TypeScript interfaces for the weekly challenge system.
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

// ============================================================================
// Challenge Types
// ============================================================================

/**
 * ChallengeObjectiveType specifies what metric the challenge tracks
 */
export type ChallengeObjectiveType = 'steps' | 'sleep' | 'hrv' | 'streak' | 'combined';

// ============================================================================
// Challenge Interfaces
// ============================================================================

/**
 * ChallengeObjective defines the goal for a challenge
 */
export interface ChallengeObjective {
  type: ChallengeObjectiveType;
  target: number;
  unit: string;
}

/**
 * ChallengeReward defines what the user earns for completing a challenge
 */
export interface ChallengeReward {
  achievementId?: string;
  cosmeticId?: string;
  bonusXP?: number;
}

/**
 * Challenge represents a single weekly challenge
 */
export interface Challenge {
  id: string;
  title: string;
  description: string;
  objective: ChallengeObjective;
  reward: ChallengeReward;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  progress: number;
  completed: boolean;
}

// ============================================================================
// Storage Types
// ============================================================================

/**
 * ChallengeStorageData is the schema for persisted challenge data
 */
export interface ChallengeStorageData {
  activeChallenges: Challenge[];
  completedChallenges: string[]; // challenge IDs
  weekStartDate: string; // ISO date string
}
