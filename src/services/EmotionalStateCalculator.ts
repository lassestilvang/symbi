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

/** Default thresholds for step-based calculation */
const DEFAULT_THRESHOLDS: StepThresholds = {
  sadThreshold: 2000,
  activeThreshold: 8000,
};

/**
 * Instance-based calculator with dependency injection
 * Preferred for new code - allows better testing and flexibility
 */
export class EmotionalStateCalculatorInstance {
  constructor(private aiBrainService?: AIBrainService) {}

  /**
   * Check if AI analysis is available
   */
  isAIAvailable(): boolean {
    return this.aiBrainService !== undefined;
  }

  /**
   * Calculate emotional state from step count using threshold logic (Phase 1)
   */
  calculateStateFromSteps(steps: number, thresholds: StepThresholds): EmotionalState {
    const normalizedSteps = Math.max(0, steps);

    if (normalizedSteps < thresholds.sadThreshold) {
      return EmotionalState.SAD;
    }

    if (normalizedSteps < thresholds.activeThreshold) {
      return EmotionalState.RESTING;
    }

    return EmotionalState.ACTIVE;
  }

  /**
   * Calculate emotional state from multiple health metrics using AI (Phase 2)
   */
  async calculateStateFromMultipleMetrics(
    metrics: HealthMetrics,
    goals: HealthGoals,
    thresholds?: StepThresholds
  ): Promise<EmotionalState> {
    if (this.aiBrainService) {
      try {
        if (__DEV__) {
          console.log('Using AI analysis for emotional state calculation');
        }
        const result = await this.aiBrainService.analyzeHealthData(metrics, goals);
        return result.emotionalState;
      } catch (error) {
        if (__DEV__) {
          console.error('AI analysis failed, falling back to rule-based:', error);
        }
      }
    }

    if (__DEV__) {
      console.log('Using rule-based calculation for emotional state');
    }
    return this.calculateStateFromSteps(metrics.steps, thresholds || DEFAULT_THRESHOLDS);
  }

  /**
   * Calculate emotional state with enhanced rule-based logic using multiple metrics
   */
  calculateStateFromMultipleMetricsRuleBased(
    metrics: HealthMetrics,
    goals: HealthGoals,
    thresholds: StepThresholds
  ): EmotionalState {
    const { steps, sleepHours, hrv } = metrics;
    const { targetSteps, targetSleepHours } = goals;

    const stepPercentage = (steps / targetSteps) * 100;
    const sleepPercentage = sleepHours ? (sleepHours / targetSleepHours) * 100 : null;

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

/**
 * Static class for backward compatibility
 * @deprecated Use EmotionalStateCalculatorInstance with dependency injection instead
 */
export class EmotionalStateCalculator {
  private static instance: EmotionalStateCalculatorInstance | null = null;

  /**
   * Initialize the calculator with AI Brain Service
   * @param apiKey - Gemini API key for AI analysis
   */
  static initializeAI(apiKey: string): void {
    const aiBrainService = new AIBrainService(apiKey);
    this.instance = new EmotionalStateCalculatorInstance(aiBrainService);
  }

  /**
   * Get or create the calculator instance
   */
  private static getInstance(): EmotionalStateCalculatorInstance {
    if (!this.instance) {
      this.instance = new EmotionalStateCalculatorInstance();
    }
    return this.instance;
  }

  /**
   * Check if AI analysis is available
   */
  static isAIAvailable(): boolean {
    return this.getInstance().isAIAvailable();
  }

  /**
   * Calculate emotional state from step count using threshold logic (Phase 1)
   */
  static calculateStateFromSteps(steps: number, thresholds: StepThresholds): EmotionalState {
    return this.getInstance().calculateStateFromSteps(steps, thresholds);
  }

  /**
   * Calculate emotional state from multiple health metrics using AI (Phase 2)
   */
  static async calculateStateFromMultipleMetrics(
    metrics: HealthMetrics,
    goals: HealthGoals,
    thresholds?: StepThresholds
  ): Promise<EmotionalState> {
    return this.getInstance().calculateStateFromMultipleMetrics(metrics, goals, thresholds);
  }

  /**
   * Calculate emotional state with enhanced rule-based logic using multiple metrics
   */
  static calculateStateFromMultipleMetricsRuleBased(
    metrics: HealthMetrics,
    goals: HealthGoals,
    thresholds: StepThresholds
  ): EmotionalState {
    return this.getInstance().calculateStateFromMultipleMetricsRuleBased(
      metrics,
      goals,
      thresholds
    );
  }

  /**
   * Reset the instance (useful for testing)
   */
  static reset(): void {
    this.instance = null;
  }
}
