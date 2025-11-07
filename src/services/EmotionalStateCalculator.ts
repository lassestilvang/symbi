import { EmotionalState, StepThresholds, HealthMetrics, HealthGoals } from '../types';

export class EmotionalStateCalculator {
  /**
   * Phase 1: Calculate emotional state based on step count and thresholds
   */
  static calculateStateFromSteps(steps: number, thresholds: StepThresholds): EmotionalState {
    if (steps < thresholds.sadThreshold) {
      return EmotionalState.SAD;
    }
    if (steps < thresholds.activeThreshold) {
      return EmotionalState.RESTING;
    }
    return EmotionalState.ACTIVE;
  }

  /**
   * Phase 2: Calculate emotional state from multiple metrics using AI
   * This will be implemented in Phase 2
   */
  static async calculateStateFromMultipleMetrics(
    metrics: HealthMetrics,
    goals: HealthGoals
  ): Promise<EmotionalState> {
    // Placeholder for Phase 2 AI integration
    // For now, fallback to Phase 1 logic
    return this.calculateStateFromSteps(metrics.steps, {
      sadThreshold: 2000,
      activeThreshold: 8000,
    });
  }
}
