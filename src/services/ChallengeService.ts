/**
 * ChallengeService - Manages weekly challenges, progress tracking, and rewards
 *
 * This service handles:
 * - Generating weekly challenges based on user health patterns
 * - Tracking challenge progress in real-time
 * - Completing challenges and distributing rewards
 * - Detecting when all weekly challenges are completed
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

import type { Challenge, ChallengeObjective, ChallengeReward, HealthDataCache } from '../types';
import { StorageService } from './StorageService';
import { getAchievementService } from './AchievementService';

// ============================================================================
// Challenge Templates
// ============================================================================

/**
 * Challenge templates define the base challenges that can be generated.
 * The actual targets are adjusted based on user's health history.
 */
interface ChallengeTemplate {
  id: string;
  titleTemplate: string;
  descriptionTemplate: string;
  objectiveType: ChallengeObjective['type'];
  baseTarget: number;
  unit: string;
  reward: ChallengeReward;
  difficultyMultiplier: number; // Applied to user's average
}

const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  // Steps challenges
  {
    id: 'steps_weekly_total',
    titleTemplate: 'Step Master',
    descriptionTemplate: 'Walk {target} steps this week',
    objectiveType: 'steps',
    baseTarget: 50000,
    unit: 'steps',
    reward: { bonusXP: 100 },
    difficultyMultiplier: 1.1,
  },
  {
    id: 'steps_daily_goal',
    titleTemplate: 'Daily Walker',
    descriptionTemplate: 'Hit {target} steps in a single day',
    objectiveType: 'steps',
    baseTarget: 10000,
    unit: 'steps',
    reward: { bonusXP: 50 },
    difficultyMultiplier: 1.2,
  },
  {
    id: 'steps_consistency',
    titleTemplate: 'Consistent Stepper',
    descriptionTemplate: 'Walk at least {target} steps for 5 days',
    objectiveType: 'steps',
    baseTarget: 5000,
    unit: 'steps/day',
    reward: { bonusXP: 75 },
    difficultyMultiplier: 0.8,
  },
  // Sleep challenges
  {
    id: 'sleep_weekly_avg',
    titleTemplate: 'Sleep Champion',
    descriptionTemplate: 'Average {target} hours of sleep this week',
    objectiveType: 'sleep',
    baseTarget: 7,
    unit: 'hours',
    reward: { bonusXP: 100 },
    difficultyMultiplier: 1.0,
  },
  {
    id: 'sleep_quality',
    titleTemplate: 'Rest Master',
    descriptionTemplate: 'Get {target}+ hours of sleep for 4 nights',
    objectiveType: 'sleep',
    baseTarget: 7,
    unit: 'hours/night',
    reward: { bonusXP: 75 },
    difficultyMultiplier: 1.0,
  },
  // HRV challenges
  {
    id: 'hrv_improvement',
    titleTemplate: 'Stress Buster',
    descriptionTemplate: 'Maintain HRV above {target}ms for 3 days',
    objectiveType: 'hrv',
    baseTarget: 40,
    unit: 'ms',
    reward: { bonusXP: 100 },
    difficultyMultiplier: 1.0,
  },
  // Streak challenges
  {
    id: 'streak_maintain',
    titleTemplate: 'Streak Keeper',
    descriptionTemplate: 'Maintain your streak for {target} more days',
    objectiveType: 'streak',
    baseTarget: 3,
    unit: 'days',
    reward: { bonusXP: 50 },
    difficultyMultiplier: 1.0,
  },
  // Combined challenges
  {
    id: 'combined_active_day',
    titleTemplate: 'Active Day',
    descriptionTemplate: 'Hit step goal AND sleep goal in the same day',
    objectiveType: 'combined',
    baseTarget: 1,
    unit: 'days',
    reward: { bonusXP: 150, achievementId: 'challenge_first' },
    difficultyMultiplier: 1.0,
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the start of the current week (Monday at midnight UTC)
 */
function getWeekStartDate(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  d.setUTCDate(diff);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

/**
 * Get the end of the current week (Sunday at 23:59:59 UTC)
 */
function getWeekEndDate(date: Date = new Date()): string {
  const weekStart = new Date(getWeekStartDate(date) + 'T00:00:00.000Z');
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  return weekEnd.toISOString().split('T')[0];
}

/**
 * Generate a unique challenge ID
 */
function generateChallengeId(templateId: string, weekStart: string): string {
  return `${templateId}_${weekStart}`;
}

/**
 * Calculate average steps from health history
 */
function calculateAverageSteps(healthHistory: HealthDataCache[]): number {
  if (healthHistory.length === 0) return 7500; // Default average
  const total = healthHistory.reduce((sum, day) => sum + day.steps, 0);
  return Math.round(total / healthHistory.length);
}

/**
 * Calculate average sleep from health history
 */
function calculateAverageSleep(healthHistory: HealthDataCache[]): number {
  const daysWithSleep = healthHistory.filter(day => day.sleepHours !== undefined);
  if (daysWithSleep.length === 0) return 7; // Default average
  const total = daysWithSleep.reduce((sum, day) => sum + (day.sleepHours || 0), 0);
  return Math.round((total / daysWithSleep.length) * 10) / 10;
}

/**
 * Calculate average HRV from health history
 */
function calculateAverageHRV(healthHistory: HealthDataCache[]): number {
  const daysWithHRV = healthHistory.filter(day => day.hrv !== undefined);
  if (daysWithHRV.length === 0) return 40; // Default average
  const total = daysWithHRV.reduce((sum, day) => sum + (day.hrv || 0), 0);
  return Math.round(total / daysWithHRV.length);
}

// ============================================================================
// ChallengeService Class
// ============================================================================

/**
 * ChallengeService manages weekly challenges, progress tracking, and rewards.
 */
export class ChallengeService {
  private activeChallenges: Challenge[] = [];
  private completedChallengeIds: Set<string> = new Set();
  private weekStartDate: string = '';
  private initialized = false;

  /**
   * Initialize the service by loading persisted challenge data.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const data = await StorageService.getChallengeData();
      if (data) {
        this.activeChallenges = data.activeChallenges;
        this.completedChallengeIds = new Set(data.completedChallenges);
        this.weekStartDate = data.weekStartDate;

        // Check if we need to generate new challenges for a new week
        const currentWeekStart = getWeekStartDate();
        if (this.weekStartDate !== currentWeekStart) {
          // New week - will need to generate new challenges
          this.activeChallenges = [];
          this.weekStartDate = currentWeekStart;
        }
      }
    } catch (error) {
      console.error('[ChallengeService] Error loading challenge data:', error);
    }

    this.initialized = true;
  }

  // ==========================================================================
  // Challenge Generation (Requirements: 3.1)
  // ==========================================================================

  /**
   * Generate weekly challenges based on user's health data patterns.
   * Selects 3 challenges and adjusts targets based on user's averages.
   *
   * @param healthHistory - Recent health data to analyze patterns
   * @returns Array of generated challenges
   */
  generateWeeklyChallenges(healthHistory: HealthDataCache[]): Challenge[] {
    const weekStart = getWeekStartDate();
    const weekEnd = getWeekEndDate();

    // Calculate user averages for personalization
    const avgSteps = calculateAverageSteps(healthHistory);
    const avgSleep = calculateAverageSleep(healthHistory);
    const avgHRV = calculateAverageHRV(healthHistory);

    // Select 3 diverse challenges (one from each category if possible)
    const selectedTemplates = this.selectChallengeTemplates(healthHistory);

    const challenges: Challenge[] = selectedTemplates.map(template => {
      const target = this.calculatePersonalizedTarget(template, avgSteps, avgSleep, avgHRV);

      return {
        id: generateChallengeId(template.id, weekStart),
        title: template.titleTemplate,
        description: template.descriptionTemplate.replace('{target}', target.toString()),
        objective: {
          type: template.objectiveType,
          target,
          unit: template.unit,
        },
        reward: template.reward,
        startDate: weekStart,
        endDate: weekEnd,
        progress: 0,
        completed: false,
      };
    });

    // Store the generated challenges
    this.activeChallenges = challenges;
    this.weekStartDate = weekStart;
    this.persistState();

    return challenges;
  }

  /**
   * Select challenge templates ensuring variety.
   */
  private selectChallengeTemplates(healthHistory: HealthDataCache[]): ChallengeTemplate[] {
    const hasStepsData = healthHistory.some(d => d.steps > 0);
    const hasSleepData = healthHistory.some(d => d.sleepHours !== undefined);
    const hasHRVData = healthHistory.some(d => d.hrv !== undefined);

    const availableTemplates: ChallengeTemplate[] = [];

    // Add steps challenges if user has steps data
    if (hasStepsData) {
      availableTemplates.push(...CHALLENGE_TEMPLATES.filter(t => t.objectiveType === 'steps'));
    }

    // Add sleep challenges if user has sleep data
    if (hasSleepData) {
      availableTemplates.push(...CHALLENGE_TEMPLATES.filter(t => t.objectiveType === 'sleep'));
    }

    // Add HRV challenges if user has HRV data
    if (hasHRVData) {
      availableTemplates.push(...CHALLENGE_TEMPLATES.filter(t => t.objectiveType === 'hrv'));
    }

    // Always include streak and combined challenges
    availableTemplates.push(
      ...CHALLENGE_TEMPLATES.filter(
        t => t.objectiveType === 'streak' || t.objectiveType === 'combined'
      )
    );

    // Shuffle and select 3 unique challenges
    const shuffled = [...availableTemplates].sort(() => Math.random() - 0.5);
    const selected: ChallengeTemplate[] = [];
    const usedTypes = new Set<string>();

    for (const template of shuffled) {
      if (selected.length >= 3) break;

      // Try to get variety in challenge types
      if (!usedTypes.has(template.objectiveType) || selected.length < 2) {
        selected.push(template);
        usedTypes.add(template.objectiveType);
      }
    }

    // If we don't have 3, fill with any remaining
    for (const template of shuffled) {
      if (selected.length >= 3) break;
      if (!selected.includes(template)) {
        selected.push(template);
      }
    }

    return selected;
  }

  /**
   * Calculate personalized target based on user's averages.
   */
  private calculatePersonalizedTarget(
    template: ChallengeTemplate,
    avgSteps: number,
    avgSleep: number,
    avgHRV: number
  ): number {
    switch (template.objectiveType) {
      case 'steps':
        // For weekly total, multiply daily average by 7 and apply multiplier
        if (template.id === 'steps_weekly_total') {
          return Math.round(avgSteps * 7 * template.difficultyMultiplier);
        }
        return Math.round(avgSteps * template.difficultyMultiplier);

      case 'sleep':
        return Math.round(avgSleep * template.difficultyMultiplier * 10) / 10;

      case 'hrv':
        return Math.round(avgHRV * template.difficultyMultiplier);

      default:
        return template.baseTarget;
    }
  }

  // ==========================================================================
  // Query Methods (Requirements: 3.4)
  // ==========================================================================

  /**
   * Get all active challenges for the current week.
   */
  getActiveChallenges(): Challenge[] {
    return [...this.activeChallenges];
  }

  /**
   * Get a specific challenge by ID.
   */
  getChallengeById(challengeId: string): Challenge | null {
    return this.activeChallenges.find(c => c.id === challengeId) || null;
  }

  /**
   * Get time remaining until challenges expire (in milliseconds).
   */
  getTimeRemaining(): number {
    if (this.activeChallenges.length === 0) return 0;

    const endDate = this.activeChallenges[0].endDate;
    const endDateTime = new Date(endDate + 'T23:59:59.999Z').getTime();
    const now = Date.now();

    return Math.max(0, endDateTime - now);
  }

  /**
   * Get time remaining formatted as a human-readable string.
   */
  getTimeRemainingFormatted(): string {
    const remaining = this.getTimeRemaining();
    if (remaining === 0) return 'Expired';

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    }
    return `${hours}h remaining`;
  }

  // ==========================================================================
  // Progress Tracking (Requirements: 3.2, 3.5)
  // ==========================================================================

  /**
   * Update progress for a specific challenge.
   * Progress is cumulative and updates in real-time.
   *
   * @param challengeId - The challenge to update
   * @param progress - The new progress value (cumulative)
   */
  async updateChallengeProgress(challengeId: string, progress: number): Promise<void> {
    await this.initialize();

    const challenge = this.activeChallenges.find(c => c.id === challengeId);
    if (!challenge) {
      console.warn(`[ChallengeService] Challenge not found: ${challengeId}`);
      return;
    }

    // Don't update completed challenges
    if (challenge.completed) return;

    // Update progress (capped at target)
    challenge.progress = Math.min(progress, challenge.objective.target);

    // Check if challenge is now complete
    if (challenge.progress >= challenge.objective.target) {
      await this.completeChallenge(challengeId);
    } else {
      await this.persistState();
    }
  }

  /**
   * Update progress for all challenges based on current health data.
   * Called when health data is updated.
   *
   * @param healthData - Current day's health data
   * @param weeklyData - All health data for the current week
   */
  async updateAllChallengeProgress(
    healthData: HealthDataCache,
    weeklyData: HealthDataCache[]
  ): Promise<void> {
    await this.initialize();

    for (const challenge of this.activeChallenges) {
      if (challenge.completed) continue;

      const progress = this.calculateChallengeProgress(challenge, healthData, weeklyData);
      await this.updateChallengeProgress(challenge.id, progress);
    }
  }

  /**
   * Calculate progress for a challenge based on health data.
   */
  private calculateChallengeProgress(
    challenge: Challenge,
    currentData: HealthDataCache,
    weeklyData: HealthDataCache[]
  ): number {
    switch (challenge.objective.type) {
      case 'steps':
        return this.calculateStepsProgress(challenge, currentData, weeklyData);

      case 'sleep':
        return this.calculateSleepProgress(challenge, weeklyData);

      case 'hrv':
        return this.calculateHRVProgress(challenge, weeklyData);

      case 'streak':
        // Streak progress is handled by StreakService
        return challenge.progress;

      case 'combined':
        return this.calculateCombinedProgress(challenge, weeklyData);

      default:
        return challenge.progress;
    }
  }

  /**
   * Calculate steps challenge progress.
   */
  private calculateStepsProgress(
    challenge: Challenge,
    currentData: HealthDataCache,
    weeklyData: HealthDataCache[]
  ): number {
    if (challenge.id.includes('weekly_total')) {
      // Sum all steps for the week
      return weeklyData.reduce((sum, day) => sum + day.steps, 0);
    } else if (challenge.id.includes('daily_goal')) {
      // Find the max steps in a single day
      return Math.max(...weeklyData.map(day => day.steps), currentData.steps);
    } else if (challenge.id.includes('consistency')) {
      // Count days meeting the target
      const target = challenge.objective.target;
      return weeklyData.filter(day => day.steps >= target).length;
    }
    return currentData.steps;
  }

  /**
   * Calculate sleep challenge progress.
   */
  private calculateSleepProgress(challenge: Challenge, weeklyData: HealthDataCache[]): number {
    const daysWithSleep = weeklyData.filter(day => day.sleepHours !== undefined);

    if (challenge.id.includes('weekly_avg')) {
      // Calculate average sleep
      if (daysWithSleep.length === 0) return 0;
      const total = daysWithSleep.reduce((sum, day) => sum + (day.sleepHours || 0), 0);
      return Math.round((total / daysWithSleep.length) * 10) / 10;
    } else if (challenge.id.includes('quality')) {
      // Count nights meeting the target
      const target = challenge.objective.target;
      return daysWithSleep.filter(day => (day.sleepHours || 0) >= target).length;
    }
    return 0;
  }

  /**
   * Calculate HRV challenge progress.
   */
  private calculateHRVProgress(challenge: Challenge, weeklyData: HealthDataCache[]): number {
    const daysWithHRV = weeklyData.filter(day => day.hrv !== undefined);
    const target = challenge.objective.target;

    // Count days with HRV above target
    return daysWithHRV.filter(day => (day.hrv || 0) >= target).length;
  }

  /**
   * Calculate combined challenge progress.
   */
  private calculateCombinedProgress(_challenge: Challenge, weeklyData: HealthDataCache[]): number {
    // Count days where both step goal (8000) and sleep goal (7h) are met
    return weeklyData.filter(day => day.steps >= 8000 && (day.sleepHours || 0) >= 7).length;
  }

  // ==========================================================================
  // Challenge Completion (Requirements: 3.2, 3.3)
  // ==========================================================================

  /**
   * Complete a challenge and distribute rewards.
   *
   * @param challengeId - The challenge to complete
   * @returns The reward distributed
   */
  async completeChallenge(challengeId: string): Promise<ChallengeReward> {
    await this.initialize();

    const challenge = this.activeChallenges.find(c => c.id === challengeId);
    if (!challenge) {
      throw new Error(`Challenge not found: ${challengeId}`);
    }

    // Mark as completed
    challenge.completed = true;
    challenge.progress = challenge.objective.target;
    this.completedChallengeIds.add(challengeId);

    // Distribute rewards
    const reward = challenge.reward;

    // Unlock achievement if specified
    if (reward.achievementId) {
      try {
        const achievementService = getAchievementService();
        await achievementService.unlockAchievement(reward.achievementId);
        console.log(`[ChallengeService] Unlocked achievement: ${reward.achievementId}`);
      } catch (error) {
        console.error('[ChallengeService] Error unlocking achievement:', error);
      }
    }

    // Persist state
    await this.persistState();

    // Check if all challenges are completed for bonus
    if (this.checkAllCompleted()) {
      await this.awardBonusAchievement();
    }

    console.log(`[ChallengeService] Challenge completed: ${challengeId}`);
    return reward;
  }

  // ==========================================================================
  // Bonus Achievement (Requirements: 3.3)
  // ==========================================================================

  /**
   * Check if all weekly challenges are completed.
   */
  checkAllCompleted(): boolean {
    if (this.activeChallenges.length === 0) return false;
    return this.activeChallenges.every(c => c.completed);
  }

  /**
   * Award bonus achievement for completing all weekly challenges.
   */
  private async awardBonusAchievement(): Promise<void> {
    try {
      const achievementService = getAchievementService();
      await achievementService.unlockAchievement('challenge_weekly_all');
      console.log('[ChallengeService] Awarded bonus achievement for completing all challenges');
    } catch (error) {
      console.error('[ChallengeService] Error awarding bonus achievement:', error);
    }
  }

  // ==========================================================================
  // Streak Integration
  // ==========================================================================

  /**
   * Update streak challenge progress.
   * Called by StreakService when streak changes.
   *
   * @param currentStreak - The current streak count
   */
  async updateStreakProgress(currentStreak: number): Promise<void> {
    await this.initialize();

    const streakChallenge = this.activeChallenges.find(
      c => c.objective.type === 'streak' && !c.completed
    );

    if (streakChallenge) {
      await this.updateChallengeProgress(streakChallenge.id, currentStreak);
    }
  }

  // ==========================================================================
  // Persistence
  // ==========================================================================

  /**
   * Persist current state to storage.
   */
  private async persistState(): Promise<void> {
    try {
      await StorageService.setChallengeData({
        activeChallenges: this.activeChallenges,
        completedChallenges: Array.from(this.completedChallengeIds),
        weekStartDate: this.weekStartDate,
      });
    } catch (error) {
      console.error('[ChallengeService] Error persisting state:', error);
    }
  }

  /**
   * Reset the service state (for testing or data reset).
   */
  reset(): void {
    this.activeChallenges = [];
    this.completedChallengeIds.clear();
    this.weekStartDate = '';
    this.initialized = false;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let challengeServiceInstance: ChallengeService | null = null;

/**
 * Get the singleton ChallengeService instance.
 */
export function getChallengeService(): ChallengeService {
  if (!challengeServiceInstance) {
    challengeServiceInstance = new ChallengeService();
  }
  return challengeServiceInstance;
}

/**
 * Reset the singleton instance (for testing).
 */
export function resetChallengeService(): void {
  if (challengeServiceInstance) {
    challengeServiceInstance.reset();
  }
  challengeServiceInstance = null;
}
