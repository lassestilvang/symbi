/**
 * Core Type Definitions for Symbi
 * 
 * This file contains all TypeScript interfaces and enums used throughout the application.
 * Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 5.4, 8.4
 */

// ============================================================================
// Enums
// ============================================================================

/**
 * EmotionalState represents the Symbi's current mood/state
 * Phase 1: SAD, RESTING, ACTIVE
 * Phase 2: VIBRANT, CALM, TIRED, STRESSED, ANXIOUS, RESTED
 */
export enum EmotionalState {
  // Phase 1 states
  SAD = 'sad',
  RESTING = 'resting',
  ACTIVE = 'active',

  // Phase 2 additional states
  VIBRANT = 'vibrant',
  CALM = 'calm',
  TIRED = 'tired',
  STRESSED = 'stressed',
  ANXIOUS = 'anxious',
  RESTED = 'rested',
}

/**
 * HealthDataType represents the types of health data we track
 */
export enum HealthDataType {
  STEPS = 'steps',
  SLEEP = 'sleep',
  HRV = 'hrv',
  MINDFUL_MINUTES = 'mindful_minutes',
}

// ============================================================================
// User Configuration Types
// ============================================================================

/**
 * StepThresholds defines the step count boundaries for emotional state transitions
 * Default: sadThreshold = 2000, activeThreshold = 8000
 */
export interface StepThresholds {
  sadThreshold: number;      // Steps below this = SAD state
  activeThreshold: number;   // Steps above this = ACTIVE state
}

/**
 * HealthGoals defines the user's target health metrics
 */
export interface HealthGoals {
  targetSteps: number;
  targetSleepHours: number;
  targetHRV?: number;
}

/**
 * UserPreferences stores user settings and preferences
 */
export interface UserPreferences {
  dataSource: 'healthkit' | 'googlefit' | 'manual';
  notificationsEnabled: boolean;
  hapticFeedbackEnabled: boolean;
  soundEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  analyticsEnabled: boolean;
}

/**
 * UserProfile is the complete user profile including preferences, thresholds, and goals
 */
export interface UserProfile {
  id: string;
  createdAt: Date;
  preferences: UserPreferences;
  thresholds: StepThresholds;
  goals: HealthGoals;
  evolutionLevel: number;
  totalDaysActive: number;
}

// ============================================================================
// Health Data Types
// ============================================================================

/**
 * HealthMetrics represents the current health data values
 */
export interface HealthMetrics {
  steps: number;
  sleepHours?: number;
  hrv?: number;
}

/**
 * HealthDataCache stores daily health data with emotional state
 * Cached for 30 days rolling window
 */
export interface HealthDataCache {
  date: string;              // ISO date string (YYYY-MM-DD)
  steps: number;
  sleepHours?: number;
  hrv?: number;
  emotionalState: EmotionalState;
  calculationMethod: 'rule-based' | 'ai';
  lastUpdated: Date;
}

// ============================================================================
// Evolution Types
// ============================================================================

/**
 * EvolutionRecord tracks a single evolution event
 */
export interface EvolutionRecord {
  id: string;
  timestamp: Date;
  evolutionLevel: number;
  appearanceUrl: string;
  daysInPositiveState: number;
  dominantStates: EmotionalState[];
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * DataSource type for health data providers
 */
export type DataSource = 'healthkit' | 'googlefit' | 'manual';

/**
 * CalculationMethod indicates how emotional state was determined
 */
export type CalculationMethod = 'rule-based' | 'ai';

/**
 * Theme options for the app
 */
export type Theme = 'light' | 'dark' | 'auto';
