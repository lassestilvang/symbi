// Core type definitions for Symbi

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

export enum HealthDataType {
  STEPS = 'steps',
  SLEEP = 'sleep',
  HRV = 'hrv',
  MINDFUL_MINUTES = 'mindful_minutes',
}

export interface StepThresholds {
  sadThreshold: number;
  activeThreshold: number;
}

export interface HealthMetrics {
  steps: number;
  sleepHours?: number;
  hrv?: number;
}

export interface HealthGoals {
  targetSteps: number;
  targetSleepHours: number;
  targetHRV?: number;
}

export interface UserPreferences {
  dataSource: 'healthkit' | 'googlefit' | 'manual';
  notificationsEnabled: boolean;
  hapticFeedbackEnabled: boolean;
  soundEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface UserProfile {
  id: string;
  createdAt: Date;
  preferences: UserPreferences;
  thresholds: StepThresholds;
  goals: HealthGoals;
  evolutionLevel: number;
  totalDaysActive: number;
}

export interface HealthDataCache {
  date: string;
  steps: number;
  sleepHours?: number;
  hrv?: number;
  emotionalState: EmotionalState;
  calculationMethod: 'rule-based' | 'ai';
  lastUpdated: Date;
}

export interface EvolutionRecord {
  id: string;
  timestamp: Date;
  evolutionLevel: number;
  appearanceUrl: string;
  daysInPositiveState: number;
  dominantStates: EmotionalState[];
}
