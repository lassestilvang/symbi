/**
 * Integration Tests for Gamification Cross-Service Flows
 *
 * Tests the integration between:
 * - AchievementService → CosmeticService (cosmetic unlock flow)
 * - StreakService → AchievementService (streak milestone triggers)
 * - ChallengeService → AchievementService (challenge completion rewards)
 *
 * Requirements: 1.2, 2.3, 3.3, 4.1
 */

import { StorageService } from '../StorageService';
import {
  AchievementService,
  getAchievementService,
  resetAchievementService,
} from '../AchievementService';
import { StreakService, getStreakService, resetStreakService } from '../StreakService';
import { ChallengeService, getChallengeService, resetChallengeService } from '../ChallengeService';
import { CosmeticService, getCosmeticService, resetCosmeticService } from '../CosmeticService';

// Mock StorageService
jest.mock('../StorageService');

describe('Gamification Integration Tests', () => {
  let achievementService: AchievementService;
  let streakService: StreakService;
  let challengeService: ChallengeService;
  let cosmeticService: CosmeticService;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset all service singletons
    resetAchievementService();
    resetStreakService();
    resetChallengeService();
    resetCosmeticService();

    // Get fresh instances
    achievementService = getAchievementService();
    streakService = getStreakService();
    challengeService = getChallengeService();
    cosmeticService = getCosmeticService();

    // Default mock implementations
    (StorageService.getAchievementData as jest.Mock).mockResolvedValue(null);
    (StorageService.setAchievementData as jest.Mock).mockResolvedValue(true);
    (StorageService.getStreakData as jest.Mock).mockResolvedValue(null);
    (StorageService.setStreakState as jest.Mock).mockResolvedValue(true);
    (StorageService.getChallengeData as jest.Mock).mockResolvedValue(null);
    (StorageService.setChallengeData as jest.Mock).mockResolvedValue(true);
    (StorageService.getCosmeticInventory as jest.Mock).mockResolvedValue(null);
    (StorageService.setCosmeticInventory as jest.Mock).mockResolvedValue(true);
  });

  // ==========================================================================
  // Achievement → Cosmetic Unlock Flow (Requirements: 1.2, 4.1)
  // ==========================================================================
  describe('Achievement → Cosmetic Unlock Flow', () => {
    it('should unlock cosmetics when achievement with rewards is earned', async () => {
      // Initialize services
      await achievementService.initialize();
      await cosmeticService.initialize();

      // Unlock an achievement that has cosmetic rewards (steps_10000 has 'hat_crown')
      const result = await achievementService.unlockAchievement('steps_10000');

      // Verify achievement was unlocked
      expect(result.isNewUnlock).toBe(true);
      expect(result.achievement.id).toBe('steps_10000');
      expect(result.cosmeticsUnlocked).toContain('hat_crown');

      // Verify storage was called to persist achievement
      expect(StorageService.setAchievementData).toHaveBeenCalled();
    });

    it('should not unlock duplicate cosmetics on repeated achievement unlock', async () => {
      // Setup: achievement already earned
      (StorageService.getAchievementData as jest.Mock).mockResolvedValue({
        achievements: [
          {
            id: 'steps_10000',
            name: 'Step Champion',
            unlockedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
        statistics: { totalEarned: 1, totalAvailable: 17, completionPercentage: 6 },
        lastUpdated: '2024-01-01T00:00:00.000Z',
      });

      await achievementService.initialize();

      // Try to unlock again (idempotent operation)
      const result = await achievementService.unlockAchievement('steps_10000');

      // Should not be a new unlock
      expect(result.isNewUnlock).toBe(false);
      expect(result.cosmeticsUnlocked).toHaveLength(0);
    });
  });

  // ==========================================================================
  // Streak → Achievement Trigger Flow (Requirements: 2.3)
  // ==========================================================================
  describe('Streak → Achievement Trigger Flow', () => {
    it('should trigger achievement when 7-day streak milestone is reached', async () => {
      // Setup: streak at 6 days
      (StorageService.getStreakData as jest.Mock).mockResolvedValue({
        state: {
          currentStreak: 6,
          longestStreak: 6,
          lastRecordedDate: '2024-01-06',
          streakHistory: [],
        },
        lastUpdated: '2024-01-06T00:00:00.000Z',
      });

      await streakService.initialize();
      await achievementService.initialize();

      // Record progress for day 7 (meeting criteria)
      const update = await streakService.recordDailyProgress('2024-01-07', true);

      // Verify streak was incremented to 7
      expect(update.newStreak).toBe(7);
      expect(update.milestoneReached).toBeDefined();
      expect(update.milestoneReached?.days).toBe(7);
      expect(update.milestoneReached?.achievementId).toBe('streak_7');
    });

    it('should trigger achievement when 30-day streak milestone is reached', async () => {
      // Setup: streak at 29 days
      (StorageService.getStreakData as jest.Mock).mockResolvedValue({
        state: {
          currentStreak: 29,
          longestStreak: 29,
          lastRecordedDate: '2024-01-29',
          streakHistory: [],
        },
        lastUpdated: '2024-01-29T00:00:00.000Z',
      });

      await streakService.initialize();
      await achievementService.initialize();

      // Record progress for day 30
      const update = await streakService.recordDailyProgress('2024-01-30', true);

      // Verify 30-day milestone
      expect(update.newStreak).toBe(30);
      expect(update.milestoneReached?.days).toBe(30);
      expect(update.milestoneReached?.achievementId).toBe('streak_30');
    });

    it('should reset streak and not trigger achievement when criteria not met', async () => {
      // Setup: streak at 6 days
      (StorageService.getStreakData as jest.Mock).mockResolvedValue({
        state: {
          currentStreak: 6,
          longestStreak: 6,
          lastRecordedDate: '2024-01-06',
          streakHistory: [],
        },
        lastUpdated: '2024-01-06T00:00:00.000Z',
      });

      await streakService.initialize();

      // Record progress without meeting criteria
      const update = await streakService.recordDailyProgress('2024-01-07', false);

      // Verify streak was reset
      expect(update.newStreak).toBe(0);
      expect(update.wasReset).toBe(true);
      expect(update.milestoneReached).toBeNull();
    });
  });

  // ==========================================================================
  // Challenge Completion → Reward Distribution (Requirements: 3.3)
  // ==========================================================================
  describe('Challenge Completion → Reward Distribution', () => {
    it('should complete challenge when progress reaches target', async () => {
      // Get current week start for proper challenge ID
      const getWeekStartDate = (): string => {
        const d = new Date();
        const day = d.getUTCDay();
        const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
        d.setUTCDate(diff);
        d.setUTCHours(0, 0, 0, 0);
        return d.toISOString().split('T')[0];
      };
      const weekStart = getWeekStartDate();

      // Setup: active challenge near completion
      const mockChallenge = {
        id: `steps_daily_goal_${weekStart}`,
        title: 'Daily Walker',
        description: 'Hit 10000 steps in a single day',
        objective: { type: 'steps' as const, target: 10000, unit: 'steps' },
        reward: { bonusXP: 50 },
        startDate: weekStart,
        endDate: '2024-12-31',
        progress: 9500,
        completed: false,
      };

      (StorageService.getChallengeData as jest.Mock).mockResolvedValue({
        activeChallenges: [mockChallenge],
        completedChallenges: [],
        weekStartDate: weekStart,
      });

      await challengeService.initialize();
      await achievementService.initialize();

      // Complete the challenge directly
      const reward = await challengeService.completeChallenge(mockChallenge.id);

      // Verify reward was returned
      expect(reward.bonusXP).toBe(50);

      // Verify challenge was marked complete
      const challenges = challengeService.getActiveChallenges();
      const completedChallenge = challenges.find(c => c.id === mockChallenge.id);
      expect(completedChallenge?.completed).toBe(true);
    });

    it('should detect when all weekly challenges are completed', async () => {
      // Get current week start for proper challenge ID
      const getWeekStartDate = (): string => {
        const d = new Date();
        const day = d.getUTCDay();
        const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
        d.setUTCDate(diff);
        d.setUTCHours(0, 0, 0, 0);
        return d.toISOString().split('T')[0];
      };
      const weekStart = getWeekStartDate();

      // Setup: all challenges completed
      const mockChallenges = [
        {
          id: `challenge_1_${weekStart}`,
          title: 'Challenge 1',
          description: 'Test',
          objective: { type: 'steps' as const, target: 100, unit: 'steps' },
          reward: { bonusXP: 50 },
          startDate: weekStart,
          endDate: '2024-12-31',
          progress: 100,
          completed: true,
        },
        {
          id: `challenge_2_${weekStart}`,
          title: 'Challenge 2',
          description: 'Test',
          objective: { type: 'steps' as const, target: 100, unit: 'steps' },
          reward: { bonusXP: 50 },
          startDate: weekStart,
          endDate: '2024-12-31',
          progress: 100,
          completed: true,
        },
        {
          id: `challenge_3_${weekStart}`,
          title: 'Challenge 3',
          description: 'Test',
          objective: { type: 'steps' as const, target: 100, unit: 'steps' },
          reward: { bonusXP: 50 },
          startDate: weekStart,
          endDate: '2024-12-31',
          progress: 100,
          completed: true,
        },
      ];

      (StorageService.getChallengeData as jest.Mock).mockResolvedValue({
        activeChallenges: mockChallenges,
        completedChallenges: [],
        weekStartDate: weekStart,
      });

      await challengeService.initialize();

      // Verify all challenges are completed
      const allCompleted = challengeService.checkAllCompleted();
      expect(allCompleted).toBe(true);
    });
  });

  // ==========================================================================
  // End-to-End Flow: Health Data → Streak → Achievement → Cosmetic
  // ==========================================================================
  describe('End-to-End Flow', () => {
    it('should flow from streak milestone to cosmetic unlock', async () => {
      // Setup: streak at 6 days, no achievements earned
      (StorageService.getStreakData as jest.Mock).mockResolvedValue({
        state: {
          currentStreak: 6,
          longestStreak: 6,
          lastRecordedDate: '2024-01-06',
          streakHistory: [],
        },
        lastUpdated: '2024-01-06T00:00:00.000Z',
      });
      (StorageService.getAchievementData as jest.Mock).mockResolvedValue(null);
      (StorageService.getCosmeticInventory as jest.Mock).mockResolvedValue(null);

      await streakService.initialize();
      await achievementService.initialize();
      await cosmeticService.initialize();

      // Record day 7 progress
      const streakUpdate = await streakService.recordDailyProgress('2024-01-07', true);

      // Verify the full flow
      expect(streakUpdate.newStreak).toBe(7);
      expect(streakUpdate.milestoneReached?.achievementId).toBe('streak_7');

      // The streak_7 achievement should have been unlocked
      // (triggered internally by StreakService)
      expect(StorageService.setAchievementData).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Error Handling in Cross-Service Flows
  // ==========================================================================
  describe('Error Handling', () => {
    it('should handle storage failure gracefully during achievement unlock', async () => {
      (StorageService.setAchievementData as jest.Mock).mockResolvedValue(false);

      await achievementService.initialize();

      // Should not throw even if storage fails
      const result = await achievementService.unlockAchievement('steps_5000');

      // Achievement should still be marked as unlocked in memory
      expect(result.isNewUnlock).toBe(true);
    });

    it('should handle storage failure gracefully during streak update', async () => {
      (StorageService.setStreakState as jest.Mock).mockResolvedValue(false);

      await streakService.initialize();

      // Should not throw even if storage fails
      const update = await streakService.recordDailyProgress('2024-01-01', true);

      // Streak should still be updated in memory
      expect(update.newStreak).toBe(1);
    });
  });
});
