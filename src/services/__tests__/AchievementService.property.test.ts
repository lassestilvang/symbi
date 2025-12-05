/**
 * Property-Based Tests for AchievementService
 *
 * **Feature: achievement-streak-system, Property 1: Achievement data round-trip consistency**
 * **Feature: achievement-streak-system, Property 2: Milestone detection correctness**
 * **Feature: achievement-streak-system, Property 3: Achievement progress calculation**
 * **Feature: achievement-streak-system, Property 12: Achievement filter correctness**
 *
 * These tests use fast-check to verify that achievement data maintains integrity
 * through serialization and deserialization cycles, that milestone detection
 * correctly identifies when health metrics meet or exceed thresholds, that
 * progress calculations are mathematically correct, and that filtering returns
 * only achievements matching all specified criteria.
 */

import * as fc from 'fast-check';
import type {
  Achievement,
  AchievementCategory,
  AchievementProgress,
  AchievementStatistics,
  AchievementStorageData,
  RarityTier,
  UnlockCondition,
  ComparisonType,
  UnlockConditionType,
  HealthMetrics,
} from '../../types';
import {
  AchievementService,
  ACHIEVEMENT_CATALOG,
  resetAchievementService,
} from '../AchievementService';
import { StorageService } from '../StorageService';

// ============================================================================
// Arbitraries (Generators) for Achievement Types
// ============================================================================

/**
 * Generator for AchievementCategory
 */
const achievementCategoryArb: fc.Arbitrary<AchievementCategory> = fc.constantFrom(
  'health_milestones',
  'streak_rewards',
  'challenge_completion',
  'exploration',
  'special_events'
);

/**
 * Generator for RarityTier
 */
const rarityTierArb: fc.Arbitrary<RarityTier> = fc.constantFrom(
  'common',
  'rare',
  'epic',
  'legendary'
);

/**
 * Generator for UnlockConditionType
 */
const unlockConditionTypeArb: fc.Arbitrary<UnlockConditionType> = fc.constantFrom(
  'steps',
  'streak',
  'challenge',
  'evolution',
  'custom'
);

/**
 * Generator for ComparisonType
 */
const comparisonTypeArb: fc.Arbitrary<ComparisonType> = fc.constantFrom('gte', 'eq', 'consecutive');

/**
 * Generator for UnlockCondition
 */
const unlockConditionArb: fc.Arbitrary<UnlockCondition> = fc.record({
  type: unlockConditionTypeArb,
  threshold: fc.integer({ min: 1, max: 100000 }),
  comparison: comparisonTypeArb,
});

/**
 * Generator for AchievementProgress
 */
const achievementProgressArb: fc.Arbitrary<AchievementProgress> = fc
  .record({
    current: fc.integer({ min: 0, max: 100000 }),
    target: fc.integer({ min: 1, max: 100000 }),
  })
  .map(({ current, target }) => ({
    current,
    target,
    percentage: target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0,
  }));

/**
 * Generator for ISO date strings
 */
const isoDateArb: fc.Arbitrary<string> = fc
  .integer({ min: 1577836800000, max: 1924905600000 }) // 2020-01-01 to 2030-12-31 in ms
  .map(ms => new Date(ms).toISOString());

/**
 * Generator for ISO date strings (optional)
 */
const optionalIsoDateArb: fc.Arbitrary<string | undefined> = fc.option(isoDateArb, {
  nil: undefined,
});

/**
 * Generator for Achievement
 */
const achievementArb: fc.Arbitrary<Achievement> = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  description: fc.string({ minLength: 1, maxLength: 500 }),
  category: achievementCategoryArb,
  rarity: rarityTierArb,
  iconUrl: fc.string({ minLength: 1, maxLength: 200 }),
  unlockCondition: unlockConditionArb,
  cosmeticRewards: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 5 }),
  unlockedAt: optionalIsoDateArb,
  progress: fc.option(achievementProgressArb, { nil: undefined }),
});

/**
 * Generator for AchievementStatistics
 */
const achievementStatisticsArb: fc.Arbitrary<AchievementStatistics> = fc
  .record({
    totalEarned: fc.integer({ min: 0, max: 1000 }),
    totalAvailable: fc.integer({ min: 0, max: 1000 }),
    rarestBadge: fc.option(achievementArb, { nil: null }),
    recentUnlocks: fc.array(achievementArb, { maxLength: 10 }),
  })
  .map(stats => ({
    ...stats,
    completionPercentage:
      stats.totalAvailable > 0 ? Math.round((stats.totalEarned / stats.totalAvailable) * 100) : 0,
  }));

/**
 * Generator for AchievementStorageData
 */
const achievementStorageDataArb: fc.Arbitrary<AchievementStorageData> = fc.record({
  achievements: fc.array(achievementArb, { maxLength: 50 }),
  statistics: achievementStatisticsArb,
  lastUpdated: isoDateArb,
});

// ============================================================================
// Helper Functions for Comparison
// ============================================================================

/**
 * Deep equality check for Achievement objects after round-trip.
 * Handles Date string comparisons and optional fields.
 */
function achievementsAreEqual(original: Achievement, parsed: Achievement): boolean {
  // Check required fields
  if (
    original.id !== parsed.id ||
    original.name !== parsed.name ||
    original.description !== parsed.description ||
    original.category !== parsed.category ||
    original.rarity !== parsed.rarity ||
    original.iconUrl !== parsed.iconUrl
  ) {
    return false;
  }

  // Check unlock condition
  if (
    original.unlockCondition.type !== parsed.unlockCondition.type ||
    original.unlockCondition.threshold !== parsed.unlockCondition.threshold ||
    original.unlockCondition.comparison !== parsed.unlockCondition.comparison
  ) {
    return false;
  }

  // Check cosmetic rewards array
  if (original.cosmeticRewards.length !== parsed.cosmeticRewards.length) {
    return false;
  }
  for (let i = 0; i < original.cosmeticRewards.length; i++) {
    if (original.cosmeticRewards[i] !== parsed.cosmeticRewards[i]) {
      return false;
    }
  }

  // Check optional unlockedAt (both undefined or both equal strings)
  if (original.unlockedAt !== parsed.unlockedAt) {
    return false;
  }

  // Check optional progress
  if (original.progress === undefined && parsed.progress === undefined) {
    return true;
  }
  if (original.progress === undefined || parsed.progress === undefined) {
    return false;
  }
  if (
    original.progress.current !== parsed.progress.current ||
    original.progress.target !== parsed.progress.target ||
    original.progress.percentage !== parsed.progress.percentage
  ) {
    return false;
  }

  return true;
}

/**
 * Deep equality check for AchievementStorageData after round-trip.
 */
function storageDataIsEqual(
  original: AchievementStorageData,
  parsed: AchievementStorageData
): boolean {
  // Check lastUpdated
  if (original.lastUpdated !== parsed.lastUpdated) {
    return false;
  }

  // Check achievements array
  if (original.achievements.length !== parsed.achievements.length) {
    return false;
  }
  for (let i = 0; i < original.achievements.length; i++) {
    if (!achievementsAreEqual(original.achievements[i], parsed.achievements[i])) {
      return false;
    }
  }

  // Check statistics
  const origStats = original.statistics;
  const parsedStats = parsed.statistics;
  if (
    origStats.totalEarned !== parsedStats.totalEarned ||
    origStats.totalAvailable !== parsedStats.totalAvailable ||
    origStats.completionPercentage !== parsedStats.completionPercentage
  ) {
    return false;
  }

  // Check rarestBadge
  if (origStats.rarestBadge === null && parsedStats.rarestBadge === null) {
    // Both null, OK
  } else if (origStats.rarestBadge === null || parsedStats.rarestBadge === null) {
    return false;
  } else if (!achievementsAreEqual(origStats.rarestBadge, parsedStats.rarestBadge)) {
    return false;
  }

  // Check recentUnlocks
  if (origStats.recentUnlocks.length !== parsedStats.recentUnlocks.length) {
    return false;
  }
  for (let i = 0; i < origStats.recentUnlocks.length; i++) {
    if (!achievementsAreEqual(origStats.recentUnlocks[i], parsedStats.recentUnlocks[i])) {
      return false;
    }
  }

  return true;
}

// ============================================================================
// Property-Based Tests
// ============================================================================

describe('AchievementService Property Tests', () => {
  /**
   * **Feature: achievement-streak-system, Property 1: Achievement data round-trip consistency**
   * **Validates: Requirements 1.5, 1.6**
   *
   * For any valid achievement data, serializing to JSON and then parsing back
   * SHALL produce an equivalent achievement object with all fields preserved.
   */
  describe('Property 1: Achievement data round-trip consistency', () => {
    it('single Achievement round-trips through JSON serialization', () => {
      fc.assert(
        fc.property(achievementArb, achievement => {
          // Serialize to JSON
          const serialized = JSON.stringify(achievement);

          // Parse back from JSON
          const parsed: Achievement = JSON.parse(serialized);

          // Verify equality
          return achievementsAreEqual(achievement, parsed);
        }),
        { numRuns: 100 }
      );
    });

    it('AchievementStorageData round-trips through JSON serialization', () => {
      fc.assert(
        fc.property(achievementStorageDataArb, storageData => {
          // Serialize to JSON
          const serialized = JSON.stringify(storageData);

          // Parse back from JSON
          const parsed: AchievementStorageData = JSON.parse(serialized);

          // Verify equality
          return storageDataIsEqual(storageData, parsed);
        }),
        { numRuns: 100 }
      );
    });

    it('AchievementProgress round-trips through JSON serialization', () => {
      fc.assert(
        fc.property(achievementProgressArb, progress => {
          // Serialize to JSON
          const serialized = JSON.stringify(progress);

          // Parse back from JSON
          const parsed: AchievementProgress = JSON.parse(serialized);

          // Verify equality
          return (
            progress.current === parsed.current &&
            progress.target === parsed.target &&
            progress.percentage === parsed.percentage
          );
        }),
        { numRuns: 100 }
      );
    });

    it('UnlockCondition round-trips through JSON serialization', () => {
      fc.assert(
        fc.property(unlockConditionArb, condition => {
          // Serialize to JSON
          const serialized = JSON.stringify(condition);

          // Parse back from JSON
          const parsed: UnlockCondition = JSON.parse(serialized);

          // Verify equality
          return (
            condition.type === parsed.type &&
            condition.threshold === parsed.threshold &&
            condition.comparison === parsed.comparison
          );
        }),
        { numRuns: 100 }
      );
    });

    it('AchievementStatistics round-trips through JSON serialization', () => {
      fc.assert(
        fc.property(achievementStatisticsArb, stats => {
          // Serialize to JSON
          const serialized = JSON.stringify(stats);

          // Parse back from JSON
          const parsed: AchievementStatistics = JSON.parse(serialized);

          // Verify basic fields
          if (
            stats.totalEarned !== parsed.totalEarned ||
            stats.totalAvailable !== parsed.totalAvailable ||
            stats.completionPercentage !== parsed.completionPercentage
          ) {
            return false;
          }

          // Verify rarestBadge
          if (stats.rarestBadge === null && parsed.rarestBadge === null) {
            // OK
          } else if (stats.rarestBadge === null || parsed.rarestBadge === null) {
            return false;
          } else if (!achievementsAreEqual(stats.rarestBadge, parsed.rarestBadge)) {
            return false;
          }

          // Verify recentUnlocks
          if (stats.recentUnlocks.length !== parsed.recentUnlocks.length) {
            return false;
          }
          for (let i = 0; i < stats.recentUnlocks.length; i++) {
            if (!achievementsAreEqual(stats.recentUnlocks[i], parsed.recentUnlocks[i])) {
              return false;
            }
          }

          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: achievement-streak-system, Property 2: Milestone detection correctness**
   * **Validates: Requirements 1.1**
   *
   * For any health metrics and milestone threshold, when the metrics meet or exceed
   * the threshold, the achievement system SHALL detect and record the milestone.
   */
  describe('Property 2: Milestone detection correctness', () => {
    // Get step-based achievements from the catalog for testing
    const stepAchievements = ACHIEVEMENT_CATALOG.filter(
      a => a.unlockCondition.type === 'steps' && a.unlockCondition.comparison === 'gte'
    );

    beforeEach(() => {
      // Reset the service state before each test
      resetAchievementService();
      // Mock storage to return empty data
      jest.spyOn(StorageService, 'getAchievementData').mockResolvedValue(null);
      jest.spyOn(StorageService, 'setAchievementData').mockResolvedValue(true);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('detects milestone when steps meet the threshold exactly', async () => {
      await fc.assert(
        fc.asyncProperty(fc.constantFrom(...stepAchievements), async achievement => {
          // Reset service for each iteration
          resetAchievementService();

          const service = new AchievementService();
          const threshold = achievement.unlockCondition.threshold;

          // Create health metrics that exactly meet the threshold
          const healthData: HealthMetrics = { steps: threshold };

          // Check milestone
          const unlocked = await service.checkMilestone(healthData);

          // The achievement should be unlocked
          const wasUnlocked = unlocked.some(a => a.id === achievement.id);
          return wasUnlocked;
        }),
        { numRuns: 100 }
      );
    });

    it('detects milestone when steps exceed the threshold', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...stepAchievements),
          fc.integer({ min: 1, max: 50000 }),
          async (achievement, extraSteps) => {
            // Reset service for each iteration
            resetAchievementService();

            const service = new AchievementService();
            const threshold = achievement.unlockCondition.threshold;

            // Create health metrics that exceed the threshold
            const healthData: HealthMetrics = { steps: threshold + extraSteps };

            // Check milestone
            const unlocked = await service.checkMilestone(healthData);

            // The achievement should be unlocked
            const wasUnlocked = unlocked.some(a => a.id === achievement.id);
            return wasUnlocked;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('does not detect milestone when steps are below threshold', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...stepAchievements.filter(a => a.unlockCondition.threshold > 0)),
          async achievement => {
            // Reset service for each iteration
            resetAchievementService();

            const service = new AchievementService();
            const threshold = achievement.unlockCondition.threshold;

            // Create health metrics below the threshold (at least 1 step below)
            const healthData: HealthMetrics = { steps: Math.max(0, threshold - 1) };

            // Check milestone
            const unlocked = await service.checkMilestone(healthData);

            // The achievement should NOT be unlocked
            const wasUnlocked = unlocked.some(a => a.id === achievement.id);
            return !wasUnlocked;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('unlocks all applicable achievements when steps exceed multiple thresholds', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 30000, max: 50000 }), // High step count to trigger multiple achievements
          async steps => {
            // Reset service for each iteration
            resetAchievementService();

            const service = new AchievementService();
            const healthData: HealthMetrics = { steps };

            // Check milestone
            const unlocked = await service.checkMilestone(healthData);

            // All step achievements with threshold <= steps should be unlocked
            const expectedUnlocks = stepAchievements.filter(
              a => a.unlockCondition.threshold <= steps
            );

            // Verify all expected achievements were unlocked
            const allExpectedUnlocked = expectedUnlocks.every(expected =>
              unlocked.some(u => u.id === expected.id)
            );

            return allExpectedUnlocked;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('does not unlock already earned achievements', async () => {
      await fc.assert(
        fc.asyncProperty(fc.constantFrom(...stepAchievements), async achievement => {
          // Reset service for each iteration
          resetAchievementService();

          const service = new AchievementService();
          const threshold = achievement.unlockCondition.threshold;
          const healthData: HealthMetrics = { steps: threshold };

          // First call should unlock the achievement
          const firstUnlock = await service.checkMilestone(healthData);
          const wasUnlockedFirst = firstUnlock.some(a => a.id === achievement.id);

          // Second call with same data should NOT unlock again
          const secondUnlock = await service.checkMilestone(healthData);
          const wasUnlockedSecond = secondUnlock.some(a => a.id === achievement.id);

          // First should unlock, second should not (idempotent)
          return wasUnlockedFirst && !wasUnlockedSecond;
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: achievement-streak-system, Property 3: Achievement progress calculation**
   * **Validates: Requirements 1.4**
   *
   * For any incomplete achievement with defined criteria, the progress percentage
   * SHALL equal (current / target) * 100, and remaining criteria SHALL equal (target - current).
   */
  describe('Property 3: Achievement progress calculation', () => {
    beforeEach(() => {
      resetAchievementService();
      jest.spyOn(StorageService, 'getAchievementData').mockResolvedValue(null);
      jest.spyOn(StorageService, 'setAchievementData').mockResolvedValue(true);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('progress percentage equals (current / target) * 100 rounded', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate current value (0 to 100000)
          fc.integer({ min: 0, max: 100000 }),
          // Generate target value (1 to 100000, must be positive) - unused but kept for generator consistency
          fc.integer({ min: 1, max: 100000 }),
          async (current, _target) => {
            resetAchievementService();

            const service = new AchievementService();
            await service.initialize();

            // Use a real achievement from the catalog
            const achievement = ACHIEVEMENT_CATALOG[0];

            // Update progress with our generated values
            const progress = await service.updateProgress(achievement.id, current);

            // The actual target comes from the achievement's unlock condition
            const actualTarget = achievement.unlockCondition.threshold;

            // Calculate expected percentage: (current / actualTarget) * 100, capped at 100
            const expectedPercentage = Math.min(100, Math.round((current / actualTarget) * 100));

            // Verify the percentage calculation
            return progress.percentage === expectedPercentage;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('remaining criteria equals (target - current) for incomplete achievements', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate current value less than target to ensure incomplete
          fc.integer({ min: 0, max: 4999 }), // Less than the smallest threshold (5000)
          async current => {
            resetAchievementService();

            const service = new AchievementService();
            await service.initialize();

            // Use the first step achievement (threshold: 5000)
            const achievement = ACHIEVEMENT_CATALOG.find(a => a.id === 'steps_5000')!;
            const target = achievement.unlockCondition.threshold;

            // Update progress
            await service.updateProgress(achievement.id, current);

            // Get the progress
            const progress = service.getAchievementProgress(achievement.id);

            // Calculate expected remaining
            const expectedRemaining = target - progress.current;

            // Verify remaining calculation
            return progress.target - progress.current === expectedRemaining;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('progress is 100% when current equals or exceeds target', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...ACHIEVEMENT_CATALOG),
          fc.integer({ min: 0, max: 50000 }), // Extra amount to add to threshold
          async (achievement, extra) => {
            resetAchievementService();

            const service = new AchievementService();
            await service.initialize();

            const target = achievement.unlockCondition.threshold;
            const current = target + extra; // Current >= target

            // Update progress
            const progress = await service.updateProgress(achievement.id, current);

            // When current >= target, percentage should be capped at 100
            return progress.percentage === 100;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('progress is 0% when current is 0', async () => {
      await fc.assert(
        fc.asyncProperty(fc.constantFrom(...ACHIEVEMENT_CATALOG), async achievement => {
          resetAchievementService();

          const service = new AchievementService();
          await service.initialize();

          // Update progress with 0
          const progress = await service.updateProgress(achievement.id, 0);

          // When current is 0, percentage should be 0
          return progress.percentage === 0 && progress.current === 0;
        }),
        { numRuns: 100 }
      );
    });

    it('getAchievementProgress returns correct values for any achievement', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...ACHIEVEMENT_CATALOG),
          fc.integer({ min: 0, max: 100000 }),
          async (achievement, current) => {
            resetAchievementService();

            const service = new AchievementService();
            await service.initialize();

            // Update progress
            await service.updateProgress(achievement.id, current);

            // Get progress
            const progress = service.getAchievementProgress(achievement.id);

            // Verify all fields are consistent
            const target = achievement.unlockCondition.threshold;
            const expectedPercentage = Math.min(100, Math.round((current / target) * 100));

            return (
              progress.current === current &&
              progress.target === target &&
              progress.percentage === expectedPercentage
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('earned achievements always show 100% progress', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            ...ACHIEVEMENT_CATALOG.filter(
              a => a.unlockCondition.type === 'steps' && a.unlockCondition.comparison === 'gte'
            )
          ),
          async achievement => {
            resetAchievementService();

            const service = new AchievementService();
            await service.initialize();

            // Unlock the achievement
            await service.unlockAchievement(achievement.id);

            // Get progress for earned achievement
            const progress = service.getAchievementProgress(achievement.id);

            // Earned achievements should always show 100%
            return (
              progress.percentage === 100 &&
              progress.current === achievement.unlockCondition.threshold &&
              progress.target === achievement.unlockCondition.threshold
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: achievement-streak-system, Property 13: Statistics calculation accuracy**
   * **Validates: Requirements 7.1, 7.4**
   *
   * For any set of achievements, the completion percentage SHALL equal
   * (earned count / total count) * 100.
   */
  describe('Property 13: Statistics calculation accuracy', () => {
    beforeEach(() => {
      resetAchievementService();
      jest.spyOn(StorageService, 'getAchievementData').mockResolvedValue(null);
      jest.spyOn(StorageService, 'setAchievementData').mockResolvedValue(true);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('completion percentage equals (earned / total) * 100 rounded', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate a subset of achievements to unlock (0 to all achievements)
          fc.subarray(ACHIEVEMENT_CATALOG, { minLength: 0 }),
          async achievementsToUnlock => {
            resetAchievementService();

            const service = new AchievementService();
            await service.initialize();

            // Unlock the selected achievements
            for (const achievement of achievementsToUnlock) {
              await service.unlockAchievement(achievement.id);
            }

            // Get statistics
            const stats = service.getStatistics();

            // Calculate expected values
            const totalAvailable = ACHIEVEMENT_CATALOG.length;
            const totalEarned = achievementsToUnlock.length;
            const expectedPercentage =
              totalAvailable > 0 ? Math.round((totalEarned / totalAvailable) * 100) : 0;

            // Verify statistics
            return (
              stats.totalEarned === totalEarned &&
              stats.totalAvailable === totalAvailable &&
              stats.completionPercentage === expectedPercentage
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('getCompletionPercentage matches statistics completionPercentage', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.subarray(ACHIEVEMENT_CATALOG, { minLength: 0 }),
          async achievementsToUnlock => {
            resetAchievementService();

            const service = new AchievementService();
            await service.initialize();

            // Unlock the selected achievements
            for (const achievement of achievementsToUnlock) {
              await service.unlockAchievement(achievement.id);
            }

            // Get both values
            const stats = service.getStatistics();
            const completionPercentage = service.getCompletionPercentage();

            // They should match
            return stats.completionPercentage === completionPercentage;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('statistics totalEarned equals number of earned achievements', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.subarray(ACHIEVEMENT_CATALOG, { minLength: 0 }),
          async achievementsToUnlock => {
            resetAchievementService();

            const service = new AchievementService();
            await service.initialize();

            // Unlock the selected achievements
            for (const achievement of achievementsToUnlock) {
              await service.unlockAchievement(achievement.id);
            }

            // Get statistics and earned achievements
            const stats = service.getStatistics();
            const earnedAchievements = service.getEarnedAchievements();

            // totalEarned should match the count of earned achievements
            return stats.totalEarned === earnedAchievements.length;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('statistics totalAvailable equals catalog size', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.subarray(ACHIEVEMENT_CATALOG, { minLength: 0 }),
          async achievementsToUnlock => {
            resetAchievementService();

            const service = new AchievementService();
            await service.initialize();

            // Unlock the selected achievements
            for (const achievement of achievementsToUnlock) {
              await service.unlockAchievement(achievement.id);
            }

            // Get statistics
            const stats = service.getStatistics();

            // totalAvailable should always equal catalog size
            return stats.totalAvailable === ACHIEVEMENT_CATALOG.length;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('completion percentage is 0 when no achievements earned', async () => {
      resetAchievementService();

      const service = new AchievementService();
      await service.initialize();

      // Don't unlock any achievements
      const stats = service.getStatistics();

      // Verify 0% completion
      expect(stats.totalEarned).toBe(0);
      expect(stats.completionPercentage).toBe(0);
      expect(stats.rarestBadge).toBeNull();
    });

    it('completion percentage is 100 when all achievements earned', async () => {
      resetAchievementService();

      const service = new AchievementService();
      await service.initialize();

      // Unlock all achievements
      for (const achievement of ACHIEVEMENT_CATALOG) {
        await service.unlockAchievement(achievement.id);
      }

      const stats = service.getStatistics();

      // Verify 100% completion
      expect(stats.totalEarned).toBe(ACHIEVEMENT_CATALOG.length);
      expect(stats.totalAvailable).toBe(ACHIEVEMENT_CATALOG.length);
      expect(stats.completionPercentage).toBe(100);
    });

    it('rarestBadge is the highest rarity among earned achievements', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate a non-empty subset of achievements to unlock
          fc.subarray(ACHIEVEMENT_CATALOG, { minLength: 1 }),
          async achievementsToUnlock => {
            resetAchievementService();

            const service = new AchievementService();
            await service.initialize();

            // Unlock the selected achievements
            for (const achievement of achievementsToUnlock) {
              await service.unlockAchievement(achievement.id);
            }

            // Get statistics
            const stats = service.getStatistics();

            // Find the expected rarest badge
            const rarityOrder: Record<RarityTier, number> = {
              common: 1,
              rare: 2,
              epic: 3,
              legendary: 4,
            };

            const expectedRarest = achievementsToUnlock.reduce((rarest, current) => {
              const currentRarity = rarityOrder[current.rarity];
              const rarestRarity = rarityOrder[rarest.rarity];
              return currentRarity > rarestRarity ? current : rarest;
            });

            // Verify rarestBadge has the correct rarity
            return stats.rarestBadge !== null && stats.rarestBadge.rarity === expectedRarest.rarity;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: achievement-streak-system, Property 12: Achievement filter correctness**
   * **Validates: Requirements 7.3**
   *
   * For any filter criteria (category, status, rarity), the filtered results
   * SHALL contain only achievements matching all specified criteria.
   */
  describe('Property 12: Achievement filter correctness', () => {
    beforeEach(() => {
      resetAchievementService();
      jest.spyOn(StorageService, 'getAchievementData').mockResolvedValue(null);
      jest.spyOn(StorageService, 'setAchievementData').mockResolvedValue(true);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('filtering by category returns only achievements in that category', async () => {
      await fc.assert(
        fc.asyncProperty(
          achievementCategoryArb,
          fc.subarray(ACHIEVEMENT_CATALOG, { minLength: 0 }),
          async (category, achievementsToUnlock) => {
            resetAchievementService();

            const service = new AchievementService();
            await service.initialize();

            // Unlock some achievements to have a mix of earned/locked
            for (const achievement of achievementsToUnlock) {
              await service.unlockAchievement(achievement.id);
            }

            // Filter by category
            const filtered = service.filterAchievements({ category });

            // All results should have the specified category
            return filtered.every(a => a.category === category);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('filtering by status "earned" returns only earned achievements', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.subarray(ACHIEVEMENT_CATALOG, { minLength: 0 }),
          async achievementsToUnlock => {
            resetAchievementService();

            const service = new AchievementService();
            await service.initialize();

            // Unlock some achievements
            for (const achievement of achievementsToUnlock) {
              await service.unlockAchievement(achievement.id);
            }

            // Filter by status 'earned'
            const filtered = service.filterAchievements({ status: 'earned' });

            // All results should be earned (check using service method)
            const allEarned = filtered.every(a => service.isAchievementEarned(a.id));

            // The count should match the number of unlocked achievements
            const countMatches = filtered.length === achievementsToUnlock.length;

            return allEarned && countMatches;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('filtering by status "locked" returns only locked achievements', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.subarray(ACHIEVEMENT_CATALOG, { minLength: 0 }),
          async achievementsToUnlock => {
            resetAchievementService();

            const service = new AchievementService();
            await service.initialize();

            // Unlock some achievements
            for (const achievement of achievementsToUnlock) {
              await service.unlockAchievement(achievement.id);
            }

            // Filter by status 'locked'
            const filtered = service.filterAchievements({ status: 'locked' });

            // All results should be locked (check using service method)
            const allLocked = filtered.every(a => !service.isAchievementEarned(a.id));

            // The count should match total minus unlocked
            const expectedLockedCount = ACHIEVEMENT_CATALOG.length - achievementsToUnlock.length;
            const countMatches = filtered.length === expectedLockedCount;

            return allLocked && countMatches;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('filtering by rarity returns only achievements with that rarity', async () => {
      await fc.assert(
        fc.asyncProperty(
          rarityTierArb,
          fc.subarray(ACHIEVEMENT_CATALOG, { minLength: 0 }),
          async (rarity, achievementsToUnlock) => {
            resetAchievementService();

            const service = new AchievementService();
            await service.initialize();

            // Unlock some achievements
            for (const achievement of achievementsToUnlock) {
              await service.unlockAchievement(achievement.id);
            }

            // Filter by rarity
            const filtered = service.filterAchievements({ rarity });

            // All results should have the specified rarity
            return filtered.every(a => a.rarity === rarity);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('filtering by multiple criteria returns only achievements matching ALL criteria', async () => {
      await fc.assert(
        fc.asyncProperty(
          achievementCategoryArb,
          rarityTierArb,
          fc.subarray(ACHIEVEMENT_CATALOG, { minLength: 0 }),
          async (category, rarity, achievementsToUnlock) => {
            resetAchievementService();

            const service = new AchievementService();
            await service.initialize();

            // Unlock some achievements
            for (const achievement of achievementsToUnlock) {
              await service.unlockAchievement(achievement.id);
            }

            // Filter by both category and rarity
            const filtered = service.filterAchievements({ category, rarity });

            // All results should match BOTH criteria
            return filtered.every(a => a.category === category && a.rarity === rarity);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('filtering by category, status, and rarity returns only achievements matching ALL criteria', async () => {
      await fc.assert(
        fc.asyncProperty(
          achievementCategoryArb,
          rarityTierArb,
          fc.constantFrom<'earned' | 'locked' | 'all'>('earned', 'locked', 'all'),
          fc.subarray(ACHIEVEMENT_CATALOG, { minLength: 0 }),
          async (category, rarity, status, achievementsToUnlock) => {
            resetAchievementService();

            const service = new AchievementService();
            await service.initialize();

            // Unlock some achievements
            for (const achievement of achievementsToUnlock) {
              await service.unlockAchievement(achievement.id);
            }

            // Filter by all three criteria
            const filtered = service.filterAchievements({ category, rarity, status });

            // All results should match ALL criteria
            return filtered.every(a => {
              // Check category
              if (a.category !== category) return false;

              // Check rarity
              if (a.rarity !== rarity) return false;

              // Check status using service method
              const isEarned = service.isAchievementEarned(a.id);
              if (status === 'earned' && !isEarned) return false;
              if (status === 'locked' && isEarned) return false;

              return true;
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('filtering with status "all" returns achievements regardless of earned status', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.subarray(ACHIEVEMENT_CATALOG, { minLength: 0 }),
          async achievementsToUnlock => {
            resetAchievementService();

            const service = new AchievementService();
            await service.initialize();

            // Unlock some achievements
            for (const achievement of achievementsToUnlock) {
              await service.unlockAchievement(achievement.id);
            }

            // Filter with status 'all'
            const filtered = service.filterAchievements({ status: 'all' });

            // Should return all achievements
            return filtered.length === ACHIEVEMENT_CATALOG.length;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('filtering with no criteria returns all achievements', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.subarray(ACHIEVEMENT_CATALOG, { minLength: 0 }),
          async achievementsToUnlock => {
            resetAchievementService();

            const service = new AchievementService();
            await service.initialize();

            // Unlock some achievements
            for (const achievement of achievementsToUnlock) {
              await service.unlockAchievement(achievement.id);
            }

            // Filter with empty criteria
            const filtered = service.filterAchievements({});

            // Should return all achievements
            return filtered.length === ACHIEVEMENT_CATALOG.length;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('filtered results are a subset of all achievements', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.option(achievementCategoryArb, { nil: undefined }),
          fc.option(rarityTierArb, { nil: undefined }),
          fc.option(fc.constantFrom<'earned' | 'locked' | 'all'>('earned', 'locked', 'all'), {
            nil: undefined,
          }),
          fc.subarray(ACHIEVEMENT_CATALOG, { minLength: 0 }),
          async (category, rarity, status, achievementsToUnlock) => {
            resetAchievementService();

            const service = new AchievementService();
            await service.initialize();

            // Unlock some achievements
            for (const achievement of achievementsToUnlock) {
              await service.unlockAchievement(achievement.id);
            }

            // Filter with any combination of criteria
            const filtered = service.filterAchievements({ category, rarity, status });
            const allAchievements = service.getAllAchievements();

            // Filtered results should be a subset of all achievements
            const allIds = new Set(allAchievements.map(a => a.id));
            return filtered.every(a => allIds.has(a.id));
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
