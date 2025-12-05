/**
 * Property-Based Tests for StreakService
 *
 * **Feature: achievement-streak-system, Property 4: Streak increment on criteria met**
 *
 * These tests use fast-check to verify that streak tracking correctly
 * increments the streak counter when daily criteria is met on consecutive days.
 */

import * as fc from 'fast-check';
import type { StreakState } from '../../types';
import { StreakService, resetStreakService } from '../StreakService';
import { StorageService } from '../StorageService';

// ============================================================================
// Arbitraries (Generators) for Streak Types
// ============================================================================

/**
 * Generator for valid date strings in YYYY-MM-DD format
 * Generates dates between 2020-01-01 and 2030-12-31
 */
const dateStringArb: fc.Arbitrary<string> = fc
  .record({
    year: fc.integer({ min: 2020, max: 2030 }),
    month: fc.integer({ min: 1, max: 12 }),
    day: fc.integer({ min: 1, max: 28 }), // Use 28 to avoid invalid dates
  })
  .map(({ year, month, day }) => {
    const monthStr = month.toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}`;
  });

/**
 * Helper to get the next consecutive day from a date string
 */
function getNextDay(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00.000Z');
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().split('T')[0];
}

// ============================================================================
// Property-Based Tests
// ============================================================================

describe('StreakService Property Tests', () => {
  /**
   * **Feature: achievement-streak-system, Property 4: Streak increment on criteria met**
   * **Validates: Requirements 2.1**
   *
   * For any streak state where daily criteria is met, recording progress
   * SHALL increment the streak counter by exactly 1.
   */
  describe('Property 4: Streak increment on criteria met', () => {
    beforeEach(() => {
      resetStreakService();
      // Mock storage to return empty data initially
      jest.spyOn(StorageService, 'getStreakData').mockResolvedValue(null);
      jest.spyOn(StorageService, 'setStreakState').mockResolvedValue(true);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('increments streak by exactly 1 when criteria is met on consecutive day', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 89 }), // Initial streak (max 89 to avoid milestone complexity)
          dateStringArb,
          async (initialStreak, lastDate) => {
            resetStreakService();

            // Create initial state with the given streak
            const initialState: StreakState = {
              currentStreak: initialStreak,
              longestStreak: Math.max(initialStreak, 10),
              lastRecordedDate: lastDate,
              streakHistory: [],
            };

            // Mock storage to return our initial state
            jest.spyOn(StorageService, 'getStreakData').mockResolvedValue({
              state: initialState,
              lastUpdated: new Date().toISOString(),
            });

            const service = new StreakService();
            await service.initialize();

            // Get the next consecutive day
            const nextDay = getNextDay(lastDate);

            // Record progress with criteria met
            const result = await service.recordDailyProgress(nextDay, true);

            // The new streak should be exactly initialStreak + 1
            return result.newStreak === initialStreak + 1;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('streak starts at 1 when first recording with criteria met', async () => {
      await fc.assert(
        fc.asyncProperty(dateStringArb, async date => {
          resetStreakService();

          // Mock storage to return null (no previous data)
          jest.spyOn(StorageService, 'getStreakData').mockResolvedValue(null);

          const service = new StreakService();

          // Record first progress with criteria met
          const result = await service.recordDailyProgress(date, true);

          // First record with criteria met should result in streak of 1
          return result.newStreak === 1 && result.previousStreak === 0;
        }),
        { numRuns: 100 }
      );
    });

    it('streak increments correctly through multiple consecutive days', async () => {
      await fc.assert(
        fc.asyncProperty(
          dateStringArb,
          fc.integer({ min: 2, max: 10 }), // Number of consecutive days
          async (startDate, numDays) => {
            resetStreakService();

            // Mock storage to return null initially
            jest.spyOn(StorageService, 'getStreakData').mockResolvedValue(null);

            const service = new StreakService();

            let currentDate = startDate;
            let expectedStreak = 0;

            // Record progress for multiple consecutive days
            for (let i = 0; i < numDays; i++) {
              const result = await service.recordDailyProgress(currentDate, true);
              expectedStreak++;

              if (result.newStreak !== expectedStreak) {
                return false;
              }

              currentDate = getNextDay(currentDate);
            }

            // Final streak should equal number of days
            return service.getCurrentStreak() === numDays;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('previousStreak in result matches streak before recording', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 50 }),
          dateStringArb,
          async (initialStreak, lastDate) => {
            resetStreakService();

            const initialState: StreakState = {
              currentStreak: initialStreak,
              longestStreak: initialStreak,
              lastRecordedDate: lastDate,
              streakHistory: [],
            };

            jest.spyOn(StorageService, 'getStreakData').mockResolvedValue({
              state: initialState,
              lastUpdated: new Date().toISOString(),
            });

            const service = new StreakService();
            await service.initialize();

            const nextDay = getNextDay(lastDate);
            const result = await service.recordDailyProgress(nextDay, true);

            // previousStreak should match what we started with
            return result.previousStreak === initialStreak;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('longestStreak updates when currentStreak exceeds it', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 50 }),
          dateStringArb,
          async (initialStreak, lastDate) => {
            resetStreakService();

            // Set longestStreak equal to currentStreak
            const initialState: StreakState = {
              currentStreak: initialStreak,
              longestStreak: initialStreak,
              lastRecordedDate: lastDate,
              streakHistory: [],
            };

            jest.spyOn(StorageService, 'getStreakData').mockResolvedValue({
              state: initialState,
              lastUpdated: new Date().toISOString(),
            });

            const service = new StreakService();
            await service.initialize();

            const nextDay = getNextDay(lastDate);
            await service.recordDailyProgress(nextDay, true);

            // longestStreak should now be initialStreak + 1
            return service.getLongestStreak() === initialStreak + 1;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('recording same day twice does not increment streak', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 50 }),
          dateStringArb,
          async (initialStreak, lastDate) => {
            resetStreakService();

            const initialState: StreakState = {
              currentStreak: initialStreak,
              longestStreak: initialStreak,
              lastRecordedDate: lastDate,
              streakHistory: [],
            };

            jest.spyOn(StorageService, 'getStreakData').mockResolvedValue({
              state: initialState,
              lastUpdated: new Date().toISOString(),
            });

            const service = new StreakService();
            await service.initialize();

            // Record on the same day (not next day)
            const result = await service.recordDailyProgress(lastDate, true);

            // Streak should remain unchanged
            return result.newStreak === initialStreak;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: achievement-streak-system, Property 5: Streak reset on criteria missed**
   * **Validates: Requirements 2.2**
   *
   * For any streak state where daily criteria is not met, recording progress
   * SHALL reset the streak counter to zero.
   */
  describe('Property 5: Streak reset on criteria missed', () => {
    beforeEach(() => {
      resetStreakService();
      jest.spyOn(StorageService, 'getStreakData').mockResolvedValue(null);
      jest.spyOn(StorageService, 'setStreakState').mockResolvedValue(true);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('resets streak to zero when criteria is not met', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 100 }), // Initial streak (must be > 0 to test reset)
          dateStringArb,
          async (initialStreak, lastDate) => {
            resetStreakService();

            const initialState: StreakState = {
              currentStreak: initialStreak,
              longestStreak: Math.max(initialStreak, 10),
              lastRecordedDate: lastDate,
              streakHistory: [],
            };

            jest.spyOn(StorageService, 'getStreakData').mockResolvedValue({
              state: initialState,
              lastUpdated: new Date().toISOString(),
            });

            const service = new StreakService();
            await service.initialize();

            const nextDay = getNextDay(lastDate);

            // Record progress with criteria NOT met
            const result = await service.recordDailyProgress(nextDay, false);

            // The new streak should be exactly 0
            return result.newStreak === 0;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('wasReset flag is true when streak was positive before reset', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 100 }), // Initial streak must be > 0
          dateStringArb,
          async (initialStreak, lastDate) => {
            resetStreakService();

            const initialState: StreakState = {
              currentStreak: initialStreak,
              longestStreak: initialStreak,
              lastRecordedDate: lastDate,
              streakHistory: [],
            };

            jest.spyOn(StorageService, 'getStreakData').mockResolvedValue({
              state: initialState,
              lastUpdated: new Date().toISOString(),
            });

            const service = new StreakService();
            await service.initialize();

            const nextDay = getNextDay(lastDate);
            const result = await service.recordDailyProgress(nextDay, false);

            // wasReset should be true since we had a positive streak
            return result.wasReset === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('wasReset flag is false when streak was already zero', async () => {
      await fc.assert(
        fc.asyncProperty(dateStringArb, async lastDate => {
          resetStreakService();

          const initialState: StreakState = {
            currentStreak: 0, // Already zero
            longestStreak: 5,
            lastRecordedDate: lastDate,
            streakHistory: [],
          };

          jest.spyOn(StorageService, 'getStreakData').mockResolvedValue({
            state: initialState,
            lastUpdated: new Date().toISOString(),
          });

          const service = new StreakService();
          await service.initialize();

          const nextDay = getNextDay(lastDate);
          const result = await service.recordDailyProgress(nextDay, false);

          // wasReset should be false since streak was already 0
          return result.wasReset === false && result.newStreak === 0;
        }),
        { numRuns: 100 }
      );
    });

    it('previousStreak in result matches streak before reset', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 100 }),
          dateStringArb,
          async (initialStreak, lastDate) => {
            resetStreakService();

            const initialState: StreakState = {
              currentStreak: initialStreak,
              longestStreak: Math.max(initialStreak, 10),
              lastRecordedDate: lastDate,
              streakHistory: [],
            };

            jest.spyOn(StorageService, 'getStreakData').mockResolvedValue({
              state: initialState,
              lastUpdated: new Date().toISOString(),
            });

            const service = new StreakService();
            await service.initialize();

            const nextDay = getNextDay(lastDate);
            const result = await service.recordDailyProgress(nextDay, false);

            // previousStreak should match what we started with
            return result.previousStreak === initialStreak;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('longestStreak is preserved when streak resets', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 50 }),
          fc.integer({ min: 51, max: 100 }), // longestStreak > currentStreak
          dateStringArb,
          async (currentStreak, longestStreak, lastDate) => {
            resetStreakService();

            const initialState: StreakState = {
              currentStreak,
              longestStreak,
              lastRecordedDate: lastDate,
              streakHistory: [],
            };

            jest.spyOn(StorageService, 'getStreakData').mockResolvedValue({
              state: initialState,
              lastUpdated: new Date().toISOString(),
            });

            const service = new StreakService();
            await service.initialize();

            const nextDay = getNextDay(lastDate);
            await service.recordDailyProgress(nextDay, false);

            // longestStreak should remain unchanged after reset
            return service.getLongestStreak() === longestStreak;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('streak resets to zero regardless of initial streak value', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 1000 }), // Any streak value
          dateStringArb,
          async (initialStreak, lastDate) => {
            resetStreakService();

            const initialState: StreakState = {
              currentStreak: initialStreak,
              longestStreak: Math.max(initialStreak, 10),
              lastRecordedDate: lastDate,
              streakHistory: [],
            };

            jest.spyOn(StorageService, 'getStreakData').mockResolvedValue({
              state: initialState,
              lastUpdated: new Date().toISOString(),
            });

            const service = new StreakService();
            await service.initialize();

            const nextDay = getNextDay(lastDate);
            const result = await service.recordDailyProgress(nextDay, false);

            // Streak should always reset to 0 when criteria not met
            return result.newStreak === 0 && service.getCurrentStreak() === 0;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: achievement-streak-system, Property 6: Streak milestone triggers achievement**
   * **Validates: Requirements 2.3**
   *
   * For any streak reaching a milestone threshold (7, 14, 30, 60, 90),
   * the corresponding achievement SHALL be unlocked.
   */
  describe('Property 6: Streak milestone triggers achievement', () => {
    beforeEach(() => {
      resetStreakService();
      jest.spyOn(StorageService, 'getStreakData').mockResolvedValue(null);
      jest.spyOn(StorageService, 'setStreakState').mockResolvedValue(true);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('returns milestone in result when streak reaches milestone threshold', async () => {
      // Test each milestone threshold: 7, 14, 30, 60, 90
      const milestoneThresholds = [7, 14, 30, 60, 90];

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...milestoneThresholds),
          dateStringArb,
          async (milestoneDay, lastDate) => {
            resetStreakService();

            // Set up state where streak is one day before milestone
            const initialState: StreakState = {
              currentStreak: milestoneDay - 1,
              longestStreak: milestoneDay - 1,
              lastRecordedDate: lastDate,
              streakHistory: [],
            };

            jest.spyOn(StorageService, 'getStreakData').mockResolvedValue({
              state: initialState,
              lastUpdated: new Date().toISOString(),
            });

            const service = new StreakService();
            await service.initialize();

            const nextDay = getNextDay(lastDate);

            // Record progress with criteria met - should reach milestone
            const result = await service.recordDailyProgress(nextDay, true);

            // Verify milestone was reached
            if (result.milestoneReached === null) {
              return false;
            }

            // Verify the milestone matches the expected threshold
            return (
              result.milestoneReached.days === milestoneDay &&
              result.milestoneReached.achievementId === `streak_${milestoneDay}`
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('does not return milestone when streak is not at milestone threshold', async () => {
      // Non-milestone values (excluding 7, 14, 30, 60, 90)
      const nonMilestoneValues = fc.integer({ min: 1, max: 100 }).filter(n => {
        return n !== 7 && n !== 14 && n !== 30 && n !== 60 && n !== 90;
      });

      await fc.assert(
        fc.asyncProperty(nonMilestoneValues, dateStringArb, async (targetStreak, lastDate) => {
          resetStreakService();

          // Set up state where streak will reach targetStreak (non-milestone)
          const initialState: StreakState = {
            currentStreak: targetStreak - 1,
            longestStreak: targetStreak - 1,
            lastRecordedDate: lastDate,
            streakHistory: [],
          };

          jest.spyOn(StorageService, 'getStreakData').mockResolvedValue({
            state: initialState,
            lastUpdated: new Date().toISOString(),
          });

          const service = new StreakService();
          await service.initialize();

          const nextDay = getNextDay(lastDate);

          // Record progress with criteria met
          const result = await service.recordDailyProgress(nextDay, true);

          // Verify no milestone was reached for non-milestone values
          return result.milestoneReached === null;
        }),
        { numRuns: 100 }
      );
    });

    it('milestone achievement ID matches the streak threshold', async () => {
      const milestoneThresholds = [7, 14, 30, 60, 90];

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...milestoneThresholds),
          dateStringArb,
          async (milestoneDay, lastDate) => {
            resetStreakService();

            const initialState: StreakState = {
              currentStreak: milestoneDay - 1,
              longestStreak: milestoneDay - 1,
              lastRecordedDate: lastDate,
              streakHistory: [],
            };

            jest.spyOn(StorageService, 'getStreakData').mockResolvedValue({
              state: initialState,
              lastUpdated: new Date().toISOString(),
            });

            const service = new StreakService();
            await service.initialize();

            const nextDay = getNextDay(lastDate);
            const result = await service.recordDailyProgress(nextDay, true);

            // The achievement ID should follow the pattern streak_{days}
            const expectedAchievementId = `streak_${milestoneDay}`;
            return (
              result.milestoneReached !== null &&
              result.milestoneReached.achievementId === expectedAchievementId
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('checkMilestoneReached returns correct milestone for current streak', async () => {
      const milestoneThresholds = [7, 14, 30, 60, 90];

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...milestoneThresholds),
          dateStringArb,
          async (milestoneDay, lastDate) => {
            resetStreakService();

            // Set up state where streak is exactly at milestone
            const initialState: StreakState = {
              currentStreak: milestoneDay,
              longestStreak: milestoneDay,
              lastRecordedDate: lastDate,
              streakHistory: [],
            };

            jest.spyOn(StorageService, 'getStreakData').mockResolvedValue({
              state: initialState,
              lastUpdated: new Date().toISOString(),
            });

            const service = new StreakService();
            await service.initialize();

            // Check milestone directly
            const milestone = service.checkMilestoneReached();

            return (
              milestone !== null &&
              milestone.days === milestoneDay &&
              milestone.achievementId === `streak_${milestoneDay}`
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('checkMilestoneReached returns null for non-milestone streaks', async () => {
      const nonMilestoneValues = fc.integer({ min: 1, max: 100 }).filter(n => {
        return n !== 7 && n !== 14 && n !== 30 && n !== 60 && n !== 90;
      });

      await fc.assert(
        fc.asyncProperty(nonMilestoneValues, dateStringArb, async (streakValue, lastDate) => {
          resetStreakService();

          const initialState: StreakState = {
            currentStreak: streakValue,
            longestStreak: streakValue,
            lastRecordedDate: lastDate,
            streakHistory: [],
          };

          jest.spyOn(StorageService, 'getStreakData').mockResolvedValue({
            state: initialState,
            lastUpdated: new Date().toISOString(),
          });

          const service = new StreakService();
          await service.initialize();

          // Check milestone directly
          const milestone = service.checkMilestoneReached();

          return milestone === null;
        }),
        { numRuns: 100 }
      );
    });

    it('all milestone thresholds are correctly detected when reached sequentially', async () => {
      await fc.assert(
        fc.asyncProperty(dateStringArb, async startDate => {
          resetStreakService();

          jest.spyOn(StorageService, 'getStreakData').mockResolvedValue(null);

          const service = new StreakService();

          let currentDate = startDate;
          const milestonesReached: number[] = [];
          const expectedMilestones = [7, 14, 30, 60, 90];

          // Simulate 90 consecutive days of meeting criteria
          for (let day = 1; day <= 90; day++) {
            const result = await service.recordDailyProgress(currentDate, true);

            if (result.milestoneReached !== null) {
              milestonesReached.push(result.milestoneReached.days);
            }

            currentDate = getNextDay(currentDate);
          }

          // Verify all milestones were reached
          return (
            milestonesReached.length === expectedMilestones.length &&
            expectedMilestones.every((m, i) => milestonesReached[i] === m)
          );
        }),
        { numRuns: 10 } // Fewer runs due to longer execution time
      );
    });
  });
});
