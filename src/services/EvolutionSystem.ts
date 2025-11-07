import { EmotionalState, EvolutionRecord } from '../types';
import { StorageService } from './StorageService';

/**
 * EvolutionEligibility represents whether the user is eligible for evolution
 */
export interface EvolutionEligibility {
  eligible: boolean;
  daysInPositiveState: number;
  daysRequired: number;
}

/**
 * EvolutionResult represents the outcome of an evolution event
 */
export interface EvolutionResult {
  success: boolean;
  newAppearanceUrl: string;
  evolutionLevel: number;
}

/**
 * DailyStateRecord tracks emotional state for a specific date
 */
interface DailyStateRecord {
  date: string; // ISO date string (YYYY-MM-DD)
  state: EmotionalState;
}

/**
 * EvolutionSystem manages the Symbi evolution tracking and triggering.
 * 
 * Evolution Criteria:
 * - User must accumulate 30 days in Active or Vibrant states
 * - Days don't need to be consecutive
 * - Each evolution increases the evolution level
 * - Maximum 5 evolution levels
 * 
 * Requirements: 8.1, 8.4
 */
export class EvolutionSystem {
  private static readonly DAILY_STATES_KEY = '@symbi:daily_states';
  private static readonly DAYS_REQUIRED = 30;
  private static readonly MAX_EVOLUTION_LEVEL = 5;
  private static readonly POSITIVE_STATES = [EmotionalState.ACTIVE, EmotionalState.VIBRANT];

  /**
   * Track the emotional state for a specific day.
   * This should be called once per day with the day's dominant emotional state.
   * 
   * @param state The emotional state to record
   * @param date Optional date (defaults to today)
   */
  static async trackDailyState(state: EmotionalState, date?: Date): Promise<void> {
    try {
      const dateKey = this.getDateKey(date || new Date());
      const dailyStates = await this.getDailyStates();
      
      // Update or add the state for this date
      const existingIndex = dailyStates.findIndex(record => record.date === dateKey);
      if (existingIndex >= 0) {
        dailyStates[existingIndex].state = state;
      } else {
        dailyStates.push({ date: dateKey, state });
      }

      // Keep only last 90 days of records
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const ninetyDaysAgoKey = this.getDateKey(ninetyDaysAgo);
      
      const filtered = dailyStates.filter(record => record.date >= ninetyDaysAgoKey);
      
      await StorageService.set(this.DAILY_STATES_KEY, filtered);
    } catch (error) {
      console.error('Error tracking daily state:', error);
      throw error;
    }
  }

  /**
   * Check if the user is eligible for evolution.
   * Returns eligibility status and progress towards next evolution.
   * 
   * @returns EvolutionEligibility object with eligibility status and progress
   */
  static async checkEvolutionEligibility(): Promise<EvolutionEligibility> {
    try {
      const dailyStates = await this.getDailyStates();
      const userProfile = await StorageService.getUserProfile();
      
      // Count days in positive states (Active or Vibrant)
      const daysInPositiveState = dailyStates.filter(
        record => this.POSITIVE_STATES.includes(record.state)
      ).length;

      // Check if user has reached max evolution level
      const currentLevel = userProfile?.evolutionLevel || 0;
      if (currentLevel >= this.MAX_EVOLUTION_LEVEL) {
        return {
          eligible: false,
          daysInPositiveState,
          daysRequired: this.DAYS_REQUIRED,
        };
      }

      // Check if user has accumulated enough positive days
      const eligible = daysInPositiveState >= this.DAYS_REQUIRED;

      return {
        eligible,
        daysInPositiveState,
        daysRequired: this.DAYS_REQUIRED,
      };
    } catch (error) {
      console.error('Error checking evolution eligibility:', error);
      return {
        eligible: false,
        daysInPositiveState: 0,
        daysRequired: this.DAYS_REQUIRED,
      };
    }
  }

  /**
   * Get the evolution history for the user.
   * Returns all past evolution records sorted by timestamp (newest first).
   * 
   * @returns Array of EvolutionRecord objects
   */
  static async getEvolutionHistory(): Promise<EvolutionRecord[]> {
    try {
      const records = await StorageService.getEvolutionRecords();
      // Sort by timestamp descending (newest first)
      return records.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Error getting evolution history:', error);
      return [];
    }
  }

  /**
   * Get the dominant emotional states from recent history.
   * Used for evolution prompt generation.
   * 
   * @param days Number of days to analyze (default: 30)
   * @returns Array of dominant emotional states
   */
  static async getDominantStates(days: number = 30): Promise<EmotionalState[]> {
    try {
      const dailyStates = await this.getDailyStates();
      
      // Get states from last N days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const cutoffKey = this.getDateKey(cutoffDate);
      
      const recentStates = dailyStates
        .filter(record => record.date >= cutoffKey)
        .map(record => record.state);

      // Count occurrences of each state
      const stateCounts = new Map<EmotionalState, number>();
      recentStates.forEach(state => {
        stateCounts.set(state, (stateCounts.get(state) || 0) + 1);
      });

      // Sort by count and return top states
      const sortedStates = Array.from(stateCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([state]) => state);

      // Return top 3 dominant states
      return sortedStates.slice(0, 3);
    } catch (error) {
      console.error('Error getting dominant states:', error);
      return [];
    }
  }

  /**
   * Trigger an evolution event.
   * Generates a new appearance using AI, saves the evolution record, and updates user profile.
   * 
   * Requirements: 8.2, 8.3, 8.4
   * 
   * @param aiService AIBrainService instance for image generation
   * @returns EvolutionResult with success status and new appearance URL
   */
  static async triggerEvolution(aiService: any): Promise<EvolutionResult> {
    try {
      // Check eligibility first
      const eligibility = await this.checkEvolutionEligibility();
      if (!eligibility.eligible) {
        return {
          success: false,
          newAppearanceUrl: '',
          evolutionLevel: 0,
        };
      }

      // Get user profile to determine current evolution level
      const userProfile = await StorageService.getUserProfile();
      const currentLevel = userProfile?.evolutionLevel || 0;
      const newLevel = currentLevel + 1;

      // Get dominant states for evolution context
      const dominantStates = await this.getDominantStates(30);

      // Generate evolved appearance using AI
      const evolutionContext = {
        daysActive: eligibility.daysInPositiveState,
        dominantStates,
      };

      const newAppearanceUrl = await aiService.generateEvolvedAppearance(evolutionContext);

      // Create evolution record
      const evolutionRecord: EvolutionRecord = {
        id: `evolution_${Date.now()}`,
        timestamp: new Date(),
        evolutionLevel: newLevel,
        appearanceUrl: newAppearanceUrl,
        daysInPositiveState: eligibility.daysInPositiveState,
        dominantStates,
      };

      // Save evolution record
      await StorageService.addEvolutionRecord(evolutionRecord);

      // Update user profile with new evolution level
      if (userProfile) {
        userProfile.evolutionLevel = newLevel;
        await StorageService.setUserProfile(userProfile);
      }

      // Reset progress for next evolution
      await this.resetProgressAfterEvolution();

      return {
        success: true,
        newAppearanceUrl,
        evolutionLevel: newLevel,
      };
    } catch (error) {
      console.error('Error triggering evolution:', error);
      return {
        success: false,
        newAppearanceUrl: '',
        evolutionLevel: 0,
      };
    }
  }

  /**
   * Reset the daily state tracking after an evolution.
   * This clears the positive state counter so the user can work towards the next evolution.
   */
  static async resetProgressAfterEvolution(): Promise<void> {
    try {
      // Clear all daily states to reset progress
      await StorageService.set(this.DAILY_STATES_KEY, []);
    } catch (error) {
      console.error('Error resetting progress:', error);
      throw error;
    }
  }

  /**
   * Get all daily state records from storage.
   * 
   * @returns Array of DailyStateRecord objects
   */
  private static async getDailyStates(): Promise<DailyStateRecord[]> {
    try {
      const states = await StorageService.get<DailyStateRecord[]>(this.DAILY_STATES_KEY);
      return states || [];
    } catch (error) {
      console.error('Error getting daily states:', error);
      return [];
    }
  }

  /**
   * Convert a Date object to a date key string (YYYY-MM-DD).
   * 
   * @param date Date to convert
   * @returns Date key string
   */
  private static getDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
