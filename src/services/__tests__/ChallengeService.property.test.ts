/**
 * Property-Based Tests for ChallengeService
 *
 * **Feature: achievement-streak-system, Property 7: Challenge progress updates correctly**
 *
 * These tests use fast-check to verify that challenge progress tracking
 * correctly reflects cumulative progress toward objectives.
 *
 * **Validates: Requirements 3.2, 3.5**
 */

import * as fc from 'fast-check';
import type { Challenge, ChallengeObjective, ChallengeReward } from '../../types';
import { ChallengeService, resetChallengeService } from '../ChallengeService';
import { StorageService } from '../StorageService';

// ============================================================================
// Arbitraries (Generators) for Challenge Types
// ============================================================================

/**
 * Get the start of the current week (Monday at midnight UTC)
 * This must match the logic in ChallengeService
 */
function getWeekStartDate(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  d.setUTCDate(diff);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

// Current week start date - must match what ChallengeService expects
const CURRENT_WEEK_START = getWeekStartDate();

/**
 * Generator for valid date strings in YYYY-MM-DD format
 */
const dateStringArb: fc.Arbitrary<string> = fc
  .record({
    year: fc.integer({ min: 2024, max: 2026 }),
    month: fc.integer({ min: 1, max: 12 }),
    day: fc.integer({ min: 1, max: 28 }),
  })
  .map(({ year, month, day }) => {
    const monthStr = month.toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}`;
  });

/**
 * Generator for valid challenge IDs (alphanumeric with underscores)
 */
const challengeIdArb: fc.Arbitrary<string> = fc
  .string({ minLength: 5, maxLength: 30 })
  .filter(s => s.trim().length >= 5 && /^[a-zA-Z0-9_]+$/.test(s.trim()))
  .map(s =>
    s
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
  );

/**
 * Generator for challenge objective types
 */
const objectiveTypeArb: fc.Arbitrary<ChallengeObjective['type']> = fc.constantFrom(
  'steps',
  'sleep',
  'hrv',
  'streak',
  'combined'
);

/**
 * Generator for positive target values (minimum 2 to allow incomplete progress)
 */
const targetArb: fc.Arbitrary<number> = fc.integer({ min: 2, max: 100000 });

/**
 * Generator for challenge objectives
 */
const challengeObjectiveArb: fc.Arbitrary<ChallengeObjective> = fc.record({
  type: objectiveTypeArb,
  target: targetArb,
  unit: fc.constantFrom('steps', 'hours', 'ms', 'days'),
});

/**
 * Generator for challenge rewards
 */
const challengeRewardArb: fc.Arbitrary<ChallengeReward> = fc.record({
  bonusXP: fc.option(fc.integer({ min: 10, max: 500 }), { nil: undefined }),
  achievementId: fc.option(
    fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
    { nil: undefined }
  ),
  cosmeticId: fc.option(
    fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
    { nil: undefined }
  ),
});

/**
 * Generator for valid challenges with progress less than target
 */
const incompleteChallengeArb: fc.Arbitrary<Challenge> = fc
  .record({
    id: challengeIdArb,
    title: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
    description: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
    objective: challengeObjectiveArb,
    reward: challengeRewardArb,
    startDate: dateStringArb,
    progress: fc.integer({ min: 0, max: 99999 }),
  })
  .chain(partial => {
    // Ensure progress is less than target for incomplete challenges
    const maxProgress = Math.max(0, partial.objective.target - 1);
    const adjustedProgress = Math.min(partial.progress, maxProgress);

    return fc
      .record({
        endDate: dateStringArb,
      })
      .map(rest => ({
        ...partial,
        ...rest,
        progress: adjustedProgress,
        completed: false,
      }));
  });

/**
 * Generator for progress update values (positive numbers)
 */
const progressUpdateArb: fc.Arbitrary<number> = fc.integer({ min: 0, max: 100000 });

// ============================================================================
// Property-Based Tests
// ============================================================================

describe('ChallengeService Property Tests', () => {
  /**
   * **Feature: achievement-streak-system, Property 7: Challenge progress updates correctly**
   * **Validates: Requirements 3.2, 3.5**
   *
   * For any active challenge and health data update, the challenge progress
   * SHALL reflect the cumulative progress toward the objective.
   */
  describe('Property 7: Challenge progress updates correctly', () => {
    let getChallengeDataSpy: jest.SpyInstance;
    let setChallengeDataSpy: jest.SpyInstance;

    beforeEach(() => {
      resetChallengeService();
      getChallengeDataSpy = jest.spyOn(StorageService, 'getChallengeData');
      setChallengeDataSpy = jest.spyOn(StorageService, 'setChallengeData').mockResolvedValue(true);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('progress updates to the exact value provided when below target', async () => {
      await fc.assert(
        fc.asyncProperty(
          incompleteChallengeArb,
          progressUpdateArb,
          async (challenge, newProgress) => {
            // Reset service for each property test iteration
            resetChallengeService();

            // Ensure newProgress is below target for this test
            const cappedProgress = Math.min(newProgress, challenge.objective.target - 1);

            // Set up mock to return our challenge data with current week start
            getChallengeDataSpy.mockResolvedValue({
              activeChallenges: [{ ...challenge }],
              completedChallenges: [],
              weekStartDate: CURRENT_WEEK_START,
            });

            const service = new ChallengeService();
            await service.initialize();

            // Update progress
            await service.updateChallengeProgress(challenge.id, cappedProgress);

            // Verify progress was updated correctly
            const updatedChallenge = service.getChallengeById(challenge.id);
            return updatedChallenge !== null && updatedChallenge.progress === cappedProgress;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('progress is capped at target value when update exceeds target', async () => {
      await fc.assert(
        fc.asyncProperty(incompleteChallengeArb, async challenge => {
          resetChallengeService();

          // Set up mock to return our challenge data with current week start
          getChallengeDataSpy.mockResolvedValue({
            activeChallenges: [{ ...challenge }],
            completedChallenges: [],
            weekStartDate: CURRENT_WEEK_START,
          });

          const service = new ChallengeService();
          await service.initialize();

          // Update with progress exceeding target
          const excessProgress = challenge.objective.target + 1000;
          await service.updateChallengeProgress(challenge.id, excessProgress);

          // Verify progress is capped at target
          const updatedChallenge = service.getChallengeById(challenge.id);
          return (
            updatedChallenge !== null && updatedChallenge.progress === challenge.objective.target
          );
        }),
        { numRuns: 100 }
      );
    });

    it('challenge is marked complete when progress reaches target', async () => {
      await fc.assert(
        fc.asyncProperty(incompleteChallengeArb, async challenge => {
          resetChallengeService();

          getChallengeDataSpy.mockResolvedValue({
            activeChallenges: [{ ...challenge }],
            completedChallenges: [],
            weekStartDate: CURRENT_WEEK_START,
          });

          const service = new ChallengeService();
          await service.initialize();

          // Update progress to exactly meet target
          await service.updateChallengeProgress(challenge.id, challenge.objective.target);

          // Verify challenge is marked complete
          const updatedChallenge = service.getChallengeById(challenge.id);
          return updatedChallenge !== null && updatedChallenge.completed === true;
        }),
        { numRuns: 100 }
      );
    });

    it('completed challenges do not update progress', async () => {
      await fc.assert(
        fc.asyncProperty(
          incompleteChallengeArb,
          progressUpdateArb,
          async (challenge, newProgress) => {
            resetChallengeService();

            // Create a completed challenge
            const completedChallenge: Challenge = {
              ...challenge,
              progress: challenge.objective.target,
              completed: true,
            };

            getChallengeDataSpy.mockResolvedValue({
              activeChallenges: [{ ...completedChallenge }],
              completedChallenges: [completedChallenge.id],
              weekStartDate: CURRENT_WEEK_START,
            });

            const service = new ChallengeService();
            await service.initialize();

            // Try to update progress on completed challenge
            await service.updateChallengeProgress(completedChallenge.id, newProgress);

            // Verify progress remains at target
            const updatedChallenge = service.getChallengeById(completedChallenge.id);
            return (
              updatedChallenge !== null &&
              updatedChallenge.progress === challenge.objective.target &&
              updatedChallenge.completed === true
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('progress updates are cumulative (new value replaces old)', async () => {
      await fc.assert(
        fc.asyncProperty(
          incompleteChallengeArb,
          fc.array(progressUpdateArb, { minLength: 2, maxLength: 5 }),
          async (challenge, progressUpdates) => {
            resetChallengeService();

            getChallengeDataSpy.mockResolvedValue({
              activeChallenges: [{ ...challenge }],
              completedChallenges: [],
              weekStartDate: CURRENT_WEEK_START,
            });

            const service = new ChallengeService();
            await service.initialize();

            // Apply multiple progress updates
            let lastProgress = 0;
            for (const progress of progressUpdates) {
              // Cap progress to keep challenge incomplete for testing
              const cappedProgress = Math.min(progress, challenge.objective.target - 1);
              await service.updateChallengeProgress(challenge.id, cappedProgress);
              lastProgress = cappedProgress;
            }

            // Verify final progress matches last update
            const updatedChallenge = service.getChallengeById(challenge.id);
            return updatedChallenge !== null && updatedChallenge.progress === lastProgress;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('updating non-existent challenge does not throw', async () => {
      await fc.assert(
        fc.asyncProperty(challengeIdArb, progressUpdateArb, async (nonExistentId, progress) => {
          resetChallengeService();

          getChallengeDataSpy.mockResolvedValue({
            activeChallenges: [],
            completedChallenges: [],
            weekStartDate: CURRENT_WEEK_START,
          });

          const service = new ChallengeService();
          await service.initialize();

          // This should not throw
          try {
            await service.updateChallengeProgress(nonExistentId, progress);
            return true;
          } catch {
            return false;
          }
        }),
        { numRuns: 100 }
      );
    });

    it('progress percentage is correctly calculated', async () => {
      await fc.assert(
        fc.asyncProperty(
          incompleteChallengeArb,
          progressUpdateArb,
          async (challenge, newProgress) => {
            resetChallengeService();

            // Ensure progress is below target
            const cappedProgress = Math.min(newProgress, challenge.objective.target - 1);

            getChallengeDataSpy.mockResolvedValue({
              activeChallenges: [{ ...challenge }],
              completedChallenges: [],
              weekStartDate: CURRENT_WEEK_START,
            });

            const service = new ChallengeService();
            await service.initialize();

            await service.updateChallengeProgress(challenge.id, cappedProgress);

            const updatedChallenge = service.getChallengeById(challenge.id);
            if (!updatedChallenge) return false;

            // Calculate expected percentage
            const expectedPercentage = (cappedProgress / challenge.objective.target) * 100;
            const actualPercentage =
              (updatedChallenge.progress / updatedChallenge.objective.target) * 100;

            // Allow small floating point tolerance
            return Math.abs(actualPercentage - expectedPercentage) < 0.001;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('multiple challenges can be updated independently', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(incompleteChallengeArb, { minLength: 2, maxLength: 5 }),
          async challenges => {
            resetChallengeService();

            // Ensure unique IDs by prefixing with index
            const uniqueChallenges = challenges.map((c, i) => ({
              ...c,
              id: `challenge_${i}_${c.id}`,
            }));

            getChallengeDataSpy.mockResolvedValue({
              activeChallenges: uniqueChallenges.map(c => ({ ...c })),
              completedChallenges: [],
              weekStartDate: CURRENT_WEEK_START,
            });

            const service = new ChallengeService();
            await service.initialize();

            // Update each challenge with different progress
            const progressValues = uniqueChallenges.map((c, i) =>
              Math.min((i + 1) * 100, c.objective.target - 1)
            );

            for (let i = 0; i < uniqueChallenges.length; i++) {
              await service.updateChallengeProgress(uniqueChallenges[i].id, progressValues[i]);
            }

            // Verify each challenge has correct progress
            for (let i = 0; i < uniqueChallenges.length; i++) {
              const updated = service.getChallengeById(uniqueChallenges[i].id);
              if (!updated || updated.progress !== progressValues[i]) {
                return false;
              }
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('checkAllCompleted returns true only when all challenges are complete', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(incompleteChallengeArb, { minLength: 2, maxLength: 5 }),
          async challenges => {
            resetChallengeService();

            // Ensure unique IDs by prefixing with index
            const uniqueChallenges = challenges.map((c, i) => ({
              ...c,
              id: `challenge_${i}_${c.id}`,
            }));

            getChallengeDataSpy.mockResolvedValue({
              activeChallenges: uniqueChallenges.map(c => ({ ...c })),
              completedChallenges: [],
              weekStartDate: CURRENT_WEEK_START,
            });

            const service = new ChallengeService();
            await service.initialize();

            // Initially not all completed
            if (service.checkAllCompleted()) {
              return false;
            }

            // Complete all but one
            for (let i = 0; i < uniqueChallenges.length - 1; i++) {
              await service.updateChallengeProgress(
                uniqueChallenges[i].id,
                uniqueChallenges[i].objective.target
              );
            }

            // Still not all completed (since we have at least 2 challenges)
            if (service.checkAllCompleted()) {
              return false;
            }

            // Complete the last one
            const lastChallenge = uniqueChallenges[uniqueChallenges.length - 1];
            await service.updateChallengeProgress(lastChallenge.id, lastChallenge.objective.target);

            // Now all should be completed
            return service.checkAllCompleted();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
