/**
 * StreakService - Tracks daily streaks and milestone achievements
 *
 * This service handles:
 * - Recording daily progress with increment/reset logic
 * - Tracking current and longest streaks
 * - Detecting milestone thresholds (7, 14, 30, 60, 90 days)
 * - Triggering achievement unlocks at milestones
 * - Graceful recovery from data corruption
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import type { StreakState, StreakRecord, StreakMilestone, StreakUpdate } from '../types';
import { STREAK_MILESTONES } from '../types';
import { StorageService } from './StorageService';
import { getAchievementService } from './AchievementService';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse a date string to Date object (at midnight UTC)
 */
function parseDate(dateString: string): Date {
  return new Date(dateString + 'T00:00:00.000Z');
}

/**
 * Calculate the difference in days between two date strings
 */
function daysBetween(date1: string, date2: string): number {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if date1 is the day before date2
 */
function isConsecutiveDay(previousDate: string, currentDate: string): boolean {
  return daysBetween(previousDate, currentDate) === 1;
}

/**
 * Check if two dates are the same day
 */
function isSameDay(date1: string, date2: string): boolean {
  return date1 === date2;
}

// ============================================================================
// Default State
// ============================================================================

/**
 * Create a default streak state for new users or recovery
 */
function createDefaultStreakState(): StreakState {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastRecordedDate: '',
    streakHistory: [],
  };
}

// ============================================================================
// StreakService Class
// ============================================================================

/**
 * StreakService manages daily streak tracking and milestone detection.
 */
export class StreakService {
  private state: StreakState = createDefaultStreakState();
  private initialized = false;

  /**
   * Initialize the service by loading persisted streak data.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const data = await StorageService.getStreakData();
      if (data?.state) {
        this.state = data.state;
      }
    } catch (error) {
      console.error('[StreakService] Error loading streak data:', error);
      // Use default state on error
      this.state = createDefaultStreakState();
    }

    this.initialized = true;
  }

  // ==========================================================================
  // Core Streak Tracking (Requirements: 2.1, 2.2)
  // ==========================================================================

  /**
   * Record daily progress and update streak accordingly.
   *
   * - If criteria is met and it's a consecutive day: increment streak
   * - If criteria is met but not consecutive: reset to 1
   * - If criteria is not met: reset to 0
   *
   * @param date - The date to record (YYYY-MM-DD format)
   * @param metCriteria - Whether the user met the daily health criteria
   * @returns StreakUpdate with previous/new streak and any milestone reached
   */
  async recordDailyProgress(date: string, metCriteria: boolean): Promise<StreakUpdate> {
    await this.initialize();

    const previousStreak = this.state.currentStreak;
    let newStreak: number;
    let wasReset = false;

    if (metCriteria) {
      // Check if this is a consecutive day
      if (this.state.lastRecordedDate === '') {
        // First ever record
        newStreak = 1;
      } else if (isSameDay(this.state.lastRecordedDate, date)) {
        // Same day - don't change streak
        newStreak = this.state.currentStreak;
      } else if (isConsecutiveDay(this.state.lastRecordedDate, date)) {
        // Consecutive day - increment streak
        newStreak = this.state.currentStreak + 1;
      } else {
        // Gap in days - reset to 1 (they met criteria today)
        newStreak = 1;
        wasReset = previousStreak > 0;
      }
    } else {
      // Criteria not met - reset streak to 0
      newStreak = 0;
      wasReset = previousStreak > 0;
    }

    // Update state
    this.state.currentStreak = newStreak;
    this.state.lastRecordedDate = date;

    // Update longest streak if needed
    if (newStreak > this.state.longestStreak) {
      this.state.longestStreak = newStreak;
    }

    // Add to history
    const record: StreakRecord = {
      date,
      metCriteria,
      streakCount: newStreak,
    };
    this.state.streakHistory.push(record);

    // Keep history manageable (last 90 days)
    if (this.state.streakHistory.length > 90) {
      this.state.streakHistory = this.state.streakHistory.slice(-90);
    }

    // Persist state
    await this.persistState();

    // Check for milestone
    const milestoneReached = this.checkMilestoneReached();

    // Trigger achievement unlock if milestone reached
    if (milestoneReached) {
      await this.triggerMilestoneAchievement(milestoneReached);
    }

    return {
      previousStreak,
      newStreak,
      wasReset,
      milestoneReached,
    };
  }

  // ==========================================================================
  // Query Methods (Requirements: 2.4)
  // ==========================================================================

  /**
   * Get the current streak count.
   */
  getCurrentStreak(): number {
    return this.state.currentStreak;
  }

  /**
   * Get the longest streak ever achieved.
   */
  getLongestStreak(): number {
    return this.state.longestStreak;
  }

  /**
   * Get the full streak state.
   */
  getStreakState(): StreakState {
    return { ...this.state };
  }

  /**
   * Get streak history records.
   */
  getStreakHistory(): StreakRecord[] {
    return [...this.state.streakHistory];
  }

  // ==========================================================================
  // Milestone Detection (Requirements: 2.3, 2.4)
  // ==========================================================================

  /**
   * Get the next milestone the user is working toward.
   */
  getNextMilestone(): StreakMilestone | null {
    const currentStreak = this.state.currentStreak;

    for (const milestone of STREAK_MILESTONES) {
      if (currentStreak < milestone.days) {
        return milestone;
      }
    }

    // User has passed all milestones
    return null;
  }

  /**
   * Get the number of days until the next milestone.
   */
  getDaysUntilMilestone(): number {
    const nextMilestone = this.getNextMilestone();
    if (!nextMilestone) {
      return 0; // All milestones achieved
    }
    return nextMilestone.days - this.state.currentStreak;
  }

  /**
   * Check if the current streak has just reached a milestone.
   * Returns the milestone if reached, null otherwise.
   */
  checkMilestoneReached(): StreakMilestone | null {
    const currentStreak = this.state.currentStreak;

    for (const milestone of STREAK_MILESTONES) {
      if (currentStreak === milestone.days) {
        return milestone;
      }
    }

    return null;
  }

  /**
   * Trigger achievement unlock for a reached milestone.
   */
  private async triggerMilestoneAchievement(milestone: StreakMilestone): Promise<void> {
    try {
      const achievementService = getAchievementService();
      await achievementService.unlockAchievement(milestone.achievementId);
      console.log(`[StreakService] Unlocked achievement: ${milestone.achievementId}`);
    } catch (error) {
      console.error('[StreakService] Error unlocking milestone achievement:', error);
    }
  }

  // ==========================================================================
  // Error Recovery (Requirements: 2.5)
  // ==========================================================================

  /**
   * Recover from corrupted streak data.
   * Attempts to reconstruct state from history or resets to default.
   */
  async recoverFromCorruption(): Promise<StreakState> {
    console.warn('[StreakService] Attempting to recover from corruption');

    try {
      // Try to load raw data
      const data = await StorageService.getStreakData();

      if (data?.state?.streakHistory && Array.isArray(data.state.streakHistory)) {
        // Reconstruct from history
        const history = data.state.streakHistory;

        if (history.length > 0) {
          // Sort history by date
          const sortedHistory = [...history].sort(
            (a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime()
          );

          // Recalculate streaks from history
          let currentStreak = 0;
          let longestStreak = 0;
          let lastDate = '';

          for (const record of sortedHistory) {
            if (record.metCriteria) {
              if (lastDate === '' || isConsecutiveDay(lastDate, record.date)) {
                currentStreak++;
              } else {
                currentStreak = 1;
              }
              longestStreak = Math.max(longestStreak, currentStreak);
            } else {
              currentStreak = 0;
            }
            lastDate = record.date;
          }

          this.state = {
            currentStreak,
            longestStreak,
            lastRecordedDate: lastDate,
            streakHistory: sortedHistory,
          };

          await this.persistState();
          console.log('[StreakService] Successfully recovered from history');
          return this.state;
        }
      }
    } catch (error) {
      console.error('[StreakService] Recovery failed:', error);
    }

    // Reset to default if recovery fails
    this.state = createDefaultStreakState();
    await this.persistState();
    console.log('[StreakService] Reset to default state');
    return this.state;
  }

  // ==========================================================================
  // Persistence
  // ==========================================================================

  /**
   * Persist current state to storage.
   */
  private async persistState(): Promise<void> {
    try {
      await StorageService.setStreakState(this.state);
    } catch (error) {
      console.error('[StreakService] Error persisting state:', error);
    }
  }

  /**
   * Reset the service state (for testing or data reset).
   */
  reset(): void {
    this.state = createDefaultStreakState();
    this.initialized = false;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let streakServiceInstance: StreakService | null = null;

/**
 * Get the singleton StreakService instance.
 */
export function getStreakService(): StreakService {
  if (!streakServiceInstance) {
    streakServiceInstance = new StreakService();
  }
  return streakServiceInstance;
}

/**
 * Reset the singleton instance (for testing).
 */
export function resetStreakService(): void {
  if (streakServiceInstance) {
    streakServiceInstance.reset();
  }
  streakServiceInstance = null;
}
