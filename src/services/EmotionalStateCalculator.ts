import { EmotionalState, StepThresholds, HealthMetrics, HealthGoals } from '../types';

/**
 * EmotionalStateCalculator
 * 
 * Determines the Symbi's emotional state based on health metrics.
 * Phase 1: Rule-based calculation using step count and thresholds
 * Phase 2: AI-based calculation using multiple metrics (to be implemented)
 * 
 * Requirements: 3.1, 4.1, 4.2, 4.3
 */
export class EmotionalStateCalculator {
  /**
   * Calculate emotional state from step count using threshold logic (Phase 1)
   * 
   * @param steps - Daily step count
   * @param thresholds - User-configured thresholds
   * @returns EmotionalState enum value
   * 
   * Logic:
   * - steps < sadThreshold → SAD
   * - sadThreshold ≤ steps < activeThreshold → RESTING
   * - steps ≥ activeThreshold → ACTIVE
   */
  static calculateStateFromSteps(
    steps: number,
    thresholds: StepThresholds
  ): EmotionalState {
    // Handle edge cases
    if (steps < 0) {
      steps = 0;
    }

    // Apply threshold logic
    if (steps < thresholds.sadThreshold) {
      return EmotionalState.SAD;
    }
    
    if (steps < thresholds.activeThreshold) {
      return EmotionalState.RESTING;
    }
    
    return EmotionalState.ACTIVE;
  }

  /**
   * Calculate emotional state from multiple health metrics using AI (Phase 2)
   * 
   * @param metrics - Health metrics (steps, sleep, HRV)
   * @param goals - User's health goals
   * @returns Promise<EmotionalState>
   * 
   * Note: This will be implemented in Phase 2 with Gemini API integration
   */
  static async calculateStateFromMultipleMetrics(
    metrics: HealthMetrics,
    goals: HealthGoals
  ): Promise<EmotionalState> {
    // Phase 2: Will integrate with AIBrainService
    // For now, fallback to Phase 1 rule-based logic
    const defaultThresholds: StepThresholds = {
      sadThreshold: 2000,
      activeThreshold: 8000,
    };
    
    return this.calculateStateFromSteps(metrics.steps, defaultThresholds);
  }
}
