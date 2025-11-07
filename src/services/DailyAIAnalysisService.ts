import { Platform } from 'react-native';
import { AIBrainService } from './AIBrainService';
import { createHealthDataService } from './HealthDataService';
import { EmotionalStateCalculator } from './EmotionalStateCalculator';
import { StorageService } from './StorageService';
import { EmotionalState, HealthMetrics, HealthGoals } from '../types';

/**
 * DailyAIAnalysisService
 * 
 * Schedules and performs daily AI analysis of health data at 8:00 AM local time.
 * Batches health data from the previous day and calls AIBrainService.
 * Falls back to Phase 1 rule-based logic if AI fails.
 * 
 * Requirements: 5.3, 6.4, 6.5
 */

export interface DailyAnalysisResult {
  emotionalState: EmotionalState;
  calculationMethod: 'ai' | 'rule-based';
  timestamp: Date;
  metrics: HealthMetrics;
}

export class DailyAIAnalysisService {
  private static readonly ANALYSIS_HOUR = 8; // 8:00 AM
  private static readonly LAST_ANALYSIS_KEY = 'last_ai_analysis';
  private static readonly GEMINI_API_KEY_STORAGE = 'gemini_api_key';

  private aiBrainService: AIBrainService | null = null;
  private scheduledTaskId: NodeJS.Timeout | null = null;

  /**
   * Initialize the service with Gemini API key
   */
  async initialize(apiKey?: string): Promise<void> {
    // Get API key from storage if not provided
    if (!apiKey) {
      apiKey = await StorageService.get<string>(DailyAIAnalysisService.GEMINI_API_KEY_STORAGE);
    }

    if (apiKey) {
      this.aiBrainService = new AIBrainService(apiKey);
      // Store API key for future use
      await StorageService.set(DailyAIAnalysisService.GEMINI_API_KEY_STORAGE, apiKey);
    } else {
      console.warn('No Gemini API key provided, AI analysis will not be available');
    }
  }

  /**
   * Schedule daily analysis at 8:00 AM local time
   * Note: In production, this should use platform-specific background task schedulers
   * (iOS: BackgroundTasks, Android: WorkManager)
   */
  scheduleDailyAnalysis(onAnalysisComplete: (result: DailyAnalysisResult) => void): void {
    // Calculate time until next 8:00 AM
    const now = new Date();
    const next8AM = new Date();
    next8AM.setHours(DailyAIAnalysisService.ANALYSIS_HOUR, 0, 0, 0);

    // If it's already past 8 AM today, schedule for tomorrow
    if (now >= next8AM) {
      next8AM.setDate(next8AM.getDate() + 1);
    }

    const msUntil8AM = next8AM.getTime() - now.getTime();

    console.log(`Scheduling daily AI analysis in ${Math.round(msUntil8AM / 1000 / 60)} minutes`);

    // Clear any existing scheduled task
    if (this.scheduledTaskId) {
      clearTimeout(this.scheduledTaskId);
    }

    // Schedule the analysis
    this.scheduledTaskId = setTimeout(async () => {
      try {
        const result = await this.performDailyAnalysis();
        onAnalysisComplete(result);
      } catch (error) {
        console.error('Error in scheduled daily analysis:', error);
      }

      // Reschedule for next day
      this.scheduleDailyAnalysis(onAnalysisComplete);
    }, msUntil8AM);
  }

  /**
   * Cancel scheduled daily analysis
   */
  cancelScheduledAnalysis(): void {
    if (this.scheduledTaskId) {
      clearTimeout(this.scheduledTaskId);
      this.scheduledTaskId = null;
    }
  }

  /**
   * Perform daily analysis immediately (can be called manually)
   */
  async performDailyAnalysis(): Promise<DailyAnalysisResult> {
    console.log('Performing daily AI analysis...');

    // Check if we've already analyzed today
    const lastAnalysis = await this.getLastAnalysisDate();
    const today = new Date().toISOString().split('T')[0];

    if (lastAnalysis === today) {
      console.log('Analysis already performed today, skipping');
      throw new Error('Analysis already performed today');
    }

    // Batch health data from previous day
    const metrics = await this.batchHealthData();

    // Get user's health goals
    const goals = await this.getHealthGoals();

    // Attempt AI analysis
    let emotionalState: EmotionalState;
    let calculationMethod: 'ai' | 'rule-based';

    if (this.aiBrainService) {
      try {
        const aiResult = await this.aiBrainService.analyzeHealthData(metrics, goals);
        emotionalState = aiResult.emotionalState;
        calculationMethod = 'ai';
        console.log('AI analysis successful:', emotionalState);
      } catch (error) {
        console.error('AI analysis failed, falling back to rule-based:', error);
        emotionalState = this.fallbackToRuleBased(metrics, goals);
        calculationMethod = 'rule-based';
      }
    } else {
      console.log('AI service not available, using rule-based calculation');
      emotionalState = this.fallbackToRuleBased(metrics, goals);
      calculationMethod = 'rule-based';
    }

    const result: DailyAnalysisResult = {
      emotionalState,
      calculationMethod,
      timestamp: new Date(),
      metrics,
    };

    // Store last analysis date
    await this.setLastAnalysisDate(today);

    return result;
  }

  /**
   * Batch health data from the previous day
   */
  private async batchHealthData(): Promise<HealthMetrics> {
    try {
      // Get health data service
      const healthService = createHealthDataService();

      // Get data for the previous day (yesterday)
      const endDate = new Date();
      endDate.setHours(0, 0, 0, 0); // Start of today
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 1); // Start of yesterday

      // Fetch all metrics
      const steps = await healthService.getStepCount(startDate, endDate);
      
      let sleepHours: number | undefined;
      let hrv: number | undefined;

      try {
        sleepHours = await healthService.getSleepDuration(startDate, endDate);
      } catch (error) {
        console.warn('Could not fetch sleep data:', error);
      }

      try {
        hrv = await healthService.getHeartRateVariability(startDate, endDate);
      } catch (error) {
        console.warn('Could not fetch HRV data:', error);
      }

      return {
        steps,
        sleepHours,
        hrv,
      };
    } catch (error) {
      console.error('Error batching health data:', error);
      throw error;
    }
  }

  /**
   * Get user's health goals from storage
   */
  private async getHealthGoals(): Promise<HealthGoals> {
    try {
      const profile = await StorageService.get<any>('user_profile');
      
      if (profile?.goals) {
        return profile.goals;
      }

      // Return default goals if not set
      return {
        targetSteps: 8000,
        targetSleepHours: 7.5,
        targetHRV: 60,
      };
    } catch (error) {
      console.error('Error getting health goals:', error);
      // Return default goals
      return {
        targetSteps: 8000,
        targetSleepHours: 7.5,
        targetHRV: 60,
      };
    }
  }

  /**
   * Fallback to Phase 1 rule-based calculation when AI is unavailable
   */
  private fallbackToRuleBased(metrics: HealthMetrics, goals: HealthGoals): EmotionalState {
    // Get thresholds from storage or use defaults
    const thresholds = {
      sadThreshold: 2000,
      activeThreshold: 8000,
    };

    return EmotionalStateCalculator.calculateStateFromSteps(metrics.steps, thresholds);
  }

  /**
   * Get the date of the last analysis
   */
  private async getLastAnalysisDate(): Promise<string | null> {
    try {
      return await StorageService.get<string>(DailyAIAnalysisService.LAST_ANALYSIS_KEY);
    } catch (error) {
      console.error('Error getting last analysis date:', error);
      return null;
    }
  }

  /**
   * Set the date of the last analysis
   */
  private async setLastAnalysisDate(date: string): Promise<void> {
    try {
      await StorageService.set(DailyAIAnalysisService.LAST_ANALYSIS_KEY, date);
    } catch (error) {
      console.error('Error setting last analysis date:', error);
    }
  }

  /**
   * Check if analysis should run today
   */
  async shouldRunAnalysisToday(): Promise<boolean> {
    const lastAnalysis = await this.getLastAnalysisDate();
    const today = new Date().toISOString().split('T')[0];
    return lastAnalysis !== today;
  }

  /**
   * Set Gemini API key
   */
  async setApiKey(apiKey: string): Promise<void> {
    await StorageService.set(DailyAIAnalysisService.GEMINI_API_KEY_STORAGE, apiKey);
    this.aiBrainService = new AIBrainService(apiKey);
  }

  /**
   * Check if AI analysis is available
   */
  isAIAvailable(): boolean {
    return this.aiBrainService !== null;
  }
}

// Singleton instance
let dailyAIAnalysisServiceInstance: DailyAIAnalysisService | null = null;

/**
 * Get singleton instance of DailyAIAnalysisService
 */
export function getDailyAIAnalysisService(): DailyAIAnalysisService {
  if (!dailyAIAnalysisServiceInstance) {
    dailyAIAnalysisServiceInstance = new DailyAIAnalysisService();
  }
  return dailyAIAnalysisServiceInstance;
}
