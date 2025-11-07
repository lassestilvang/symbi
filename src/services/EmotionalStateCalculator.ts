import { EmotionalState, StepThresholds, HealthMetrics, HealthGoals } from '../types';
import { AIBrainService } from './AIBrainService';

/**
 * EmotionalStateCalculator
 *
 * Determines the Symbi's emotional state based on health metrics.
 * Phase 1: Rule-based calculation using step count and thresholds
 * Phase 2: AI-based calculation using multiple metrics
 *
 * Requirements: 3.1, 4.1, 4.2, 4.3, 5.3, 5.4, 6.4
 */
export class EmotionalStateCalculator {
  private static aiBrainService: AIBrainService | null = null;

  /**
   * Initialize the calculator with AI Brain Service
   * @param apiKey - Gemini API key for AI analysis
   */
  static initializeAI(apiKey: string): void {
    this.aiBrainService = new AIBrainService(apiKey);
  }

  /**
   * Check if AI analysis is available
   */
  static isAIAvailable(): boolean {
    return this.aiBrainService !== null;
  }
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
  static calculateStateFromSteps(steps: number, thresholds: StepThresholds): EmotionalState {
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
   * @param thresholds - Optional thresholds for fallback calculation
   * @returns Promise<EmotionalState>
   *
   * This method attempts to use AI analysis if available, otherwise falls back to rule-based logic
   */
  static async calculateStateFromMultipleMetrics(
    metrics: HealthMetrics,
    goals: HealthGoals,
    thresholds?: StepThresholds
  ): Promise<EmotionalState> {
    // If AI is available, try to use it
    if (this.aiBrainService) {
      try {
        console.log('Using AI analysis for emotional state calculation');
        const result = await this.aiBrainService.analyzeHealthData(metrics, goals);
        return result.emotionalState;
      } catch (error) {
        console.error('AI analysis failed, falling back to rule-based:', error);
        // Fall through to rule-based calculation
      }
    }

    // Fallback to Phase 1 rule-based logic
    console.log('Using rule-based calculation for emotional state');
    const defaultThresholds: StepThresholds = thresholds || {
      sadThreshold: 2000,
      activeThreshold: 8000,
    };

    return this.calculateStateFromSteps(metrics.steps, defaultThresholds);
  }

  /**
   * Calculate emotional state with enhanced rule-based logic using multiple metrics
   * This provides a more nuanced calculation without AI when sleep and HRV data is available
   *
   * @param metrics - Health metrics (steps, sleep, HRV)
   * @param goals - User's health goals
   * @param thresholds - Step thresholds
   * @returns EmotionalState
   */
  static calculateStateFromMultipleMetricsRuleBased(
    metrics: HealthMetrics,
    goals: HealthGoals,
    thresholds: StepThresholds
  ): EmotionalState {
    const { steps, sleepHours, hrv } = metrics;
    const { targetSteps, targetSleepHours } = goals;

    // Calculate percentages of goals met
    const stepPercentage = (steps / targetSteps) * 100;
    const sleepPercentage = sleepHours ? (sleepHours / targetSleepHours) * 100 : null;

    // Enhanced logic using multiple metrics

    // Vibrant: Exceeding goals across the board
    if (stepPercentage > 100 && sleepPercentage && sleepPercentage > 90 && hrv && hrv > 60) {
      return EmotionalState.VIBRANT;
    }

    // Rested: Excellent sleep, activity is okay
    if (sleepPercentage && sleepPercentage > 100 && stepPercentage > 40) {
      return EmotionalState.RESTED;
    }

    // Tired: Poor sleep regardless of activity
    if (sleepPercentage && sleepPercentage < 75) {
      return EmotionalState.TIRED;
    }

    // Stressed: Low HRV with high activity and poor sleep
    if (hrv && hrv < 40 && stepPercentage > 80 && sleepPercentage && sleepPercentage < 85) {
      return EmotionalState.STRESSED;
    }

    // Anxious: Low HRV with moderate metrics
    if (hrv && hrv < 40 && stepPercentage > 50 && stepPercentage < 90) {
      return EmotionalState.ANXIOUS;
    }

    // Calm: Good sleep and moderate activity
    if (sleepPercentage && sleepPercentage > 85 && stepPercentage > 60 && stepPercentage < 100) {
      return EmotionalState.CALM;
    }

    // Fall back to Phase 1 step-based logic
    return this.calculateStateFromSteps(steps, thresholds);
  }
}
