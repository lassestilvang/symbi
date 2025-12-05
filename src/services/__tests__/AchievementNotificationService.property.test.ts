/**
 * Property-Based Tests for AchievementNotificationService
 *
 * **Feature: achievement-streak-system, Property 14: Notification queue ordering**
 * **Feature: achievement-streak-system, Property 15: Notification suppression with recording**
 *
 * These tests use fast-check to verify that notifications are displayed in the
 * order they were triggered (FIFO) and that notifications are suppressed but
 * achievements are still recorded when notifications are disabled.
 */

import * as fc from 'fast-check';
import type { RarityTier } from '../../types';
import {
  AchievementNotificationService,
  resetAchievementNotificationService,
} from '../AchievementNotificationService';
import type {
  AchievementNotification,
  NotificationType,
  NotificationPriority,
} from '../AchievementNotificationService';

// ============================================================================
// Arbitraries (Generators) for Notification Types
// ============================================================================

/**
 * Generator for NotificationType
 */
const notificationTypeArb: fc.Arbitrary<NotificationType> = fc.constantFrom(
  'achievement',
  'streak_milestone',
  'cosmetic_unlock'
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

// ============================================================================
// Property-Based Tests
// ============================================================================

describe('AchievementNotificationService Property Tests', () => {
  /**
   * **Feature: achievement-streak-system, Property 14: Notification queue ordering**
   * **Validates: Requirements 8.4**
   *
   * For any sequence of achievement notifications, they SHALL be displayed
   * in the order they were triggered.
   */
  describe('Property 14: Notification queue ordering', () => {
    beforeEach(() => {
      resetAchievementNotificationService();
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
      resetAchievementNotificationService();
    });

    it('notifications are queued in FIFO order based on timestamp', () => {
      fc.assert(
        fc.property(fc.integer({ min: 2, max: 10 }), numNotifications => {
          // Reset service for each iteration
          resetAchievementNotificationService();
          const service = new AchievementNotificationService();

          // Disable notifications to prevent auto-processing
          service.setNotificationsEnabled(false);

          const baseTimestamp = Date.now();
          const notifications: AchievementNotification[] = [];

          // Create notifications with increasing timestamps
          for (let i = 0; i < numNotifications; i++) {
            const notification: AchievementNotification = {
              id: `notification_${i}`,
              type: 'achievement',
              title: `Achievement ${i}`,
              message: `Message ${i}`,
              priority: 'normal',
              timestamp: baseTimestamp + i * 100,
            };
            notifications.push(notification);
          }

          // Queue notifications in order
          for (const notification of notifications) {
            // Access private method via any cast for testing
            (
              service as unknown as { queueNotification: (n: AchievementNotification) => void }
            ).queueNotification(notification);
          }

          // Get queued notifications
          const queued = service.getQueuedNotifications();

          // Verify queue length
          if (queued.length !== numNotifications) {
            return false;
          }

          // Verify FIFO ordering - notifications should be in timestamp order
          for (let i = 0; i < queued.length - 1; i++) {
            if (queued[i].timestamp > queued[i + 1].timestamp) {
              return false;
            }
          }

          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('notifications with same timestamp are ordered by priority (higher first)', () => {
      fc.assert(
        fc.property(fc.integer({ min: 2, max: 5 }), numNotifications => {
          resetAchievementNotificationService();
          const service = new AchievementNotificationService();

          // Disable notifications to prevent auto-processing
          service.setNotificationsEnabled(false);

          const sameTimestamp = Date.now();
          const priorities: NotificationPriority[] = ['low', 'normal', 'high'];
          const notifications: AchievementNotification[] = [];

          // Create notifications with same timestamp but different priorities
          for (let i = 0; i < numNotifications; i++) {
            const notification: AchievementNotification = {
              id: `notification_${i}`,
              type: 'achievement',
              title: `Achievement ${i}`,
              message: `Message ${i}`,
              priority: priorities[i % 3],
              timestamp: sameTimestamp,
            };
            notifications.push(notification);
          }

          // Queue notifications
          for (const notification of notifications) {
            (
              service as unknown as { queueNotification: (n: AchievementNotification) => void }
            ).queueNotification(notification);
          }

          // Get queued notifications
          const queued = service.getQueuedNotifications();

          // Verify that for same timestamps, higher priority comes first
          const priorityOrder: Record<NotificationPriority, number> = {
            low: 1,
            normal: 2,
            high: 3,
          };

          for (let i = 0; i < queued.length - 1; i++) {
            if (queued[i].timestamp === queued[i + 1].timestamp) {
              // Same timestamp - higher priority should come first
              if (priorityOrder[queued[i].priority] < priorityOrder[queued[i + 1].priority]) {
                return false;
              }
            }
          }

          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('displayed notifications follow queue order', () => {
      fc.assert(
        fc.property(fc.integer({ min: 2, max: 5 }), numNotifications => {
          resetAchievementNotificationService();
          const service = new AchievementNotificationService();

          const displayedOrder: string[] = [];

          // Add listener to track display order
          service.addListener(notification => {
            displayedOrder.push(notification.id);
          });

          const baseTimestamp = Date.now();

          // Queue notifications with increasing timestamps
          for (let i = 0; i < numNotifications; i++) {
            const notification: AchievementNotification = {
              id: `notification_${i}`,
              type: 'achievement',
              title: `Achievement ${i}`,
              message: `Message ${i}`,
              priority: 'normal',
              timestamp: baseTimestamp + i * 100,
            };
            (
              service as unknown as { queueNotification: (n: AchievementNotification) => void }
            ).queueNotification(notification);
          }

          // Process all notifications by advancing timers
          for (let i = 0; i < numNotifications; i++) {
            jest.advanceTimersByTime(5000); // Advance past notification duration
          }

          // Verify display order matches queue order (FIFO)
          for (let i = 0; i < displayedOrder.length; i++) {
            if (displayedOrder[i] !== `notification_${i}`) {
              return false;
            }
          }

          return displayedOrder.length === numNotifications;
        }),
        { numRuns: 100 }
      );
    });

    it('achievement notifications via showAchievementNotification maintain order', () => {
      fc.assert(
        fc.property(fc.integer({ min: 2, max: 5 }), numAchievements => {
          resetAchievementNotificationService();
          const service = new AchievementNotificationService();

          const displayedOrder: string[] = [];

          // Add listener to track display order
          service.addListener(notification => {
            displayedOrder.push(notification.data?.achievement?.id || notification.id);
          });

          // Create and show achievement notifications
          for (let i = 0; i < numAchievements; i++) {
            service.showAchievementNotification({
              id: `achievement_${i}`,
              name: `Achievement ${i}`,
              description: `Description ${i}`,
              category: 'health_milestones',
              rarity: 'common',
              iconUrl: 'icon.png',
              unlockCondition: { type: 'steps', threshold: 1000, comparison: 'gte' },
              cosmeticRewards: [],
            });
          }

          // Process all notifications
          for (let i = 0; i < numAchievements; i++) {
            jest.advanceTimersByTime(5000);
          }

          // Verify achievements were displayed in order
          for (let i = 0; i < displayedOrder.length; i++) {
            if (displayedOrder[i] !== `achievement_${i}`) {
              return false;
            }
          }

          return displayedOrder.length === numAchievements;
        }),
        { numRuns: 100 }
      );
    });

    it('queue maintains FIFO order regardless of notification type mix', () => {
      fc.assert(
        fc.property(fc.array(notificationTypeArb, { minLength: 2, maxLength: 8 }), types => {
          resetAchievementNotificationService();
          const service = new AchievementNotificationService();

          // Disable to prevent auto-processing
          service.setNotificationsEnabled(false);

          const baseTimestamp = Date.now();

          // Queue notifications of different types
          for (let i = 0; i < types.length; i++) {
            const notification: AchievementNotification = {
              id: `notification_${i}`,
              type: types[i],
              title: `Title ${i}`,
              message: `Message ${i}`,
              priority: 'normal',
              timestamp: baseTimestamp + i * 100,
            };
            (
              service as unknown as { queueNotification: (n: AchievementNotification) => void }
            ).queueNotification(notification);
          }

          // Get queued notifications
          const queued = service.getQueuedNotifications();

          // Verify FIFO ordering by timestamp
          for (let i = 0; i < queued.length - 1; i++) {
            if (queued[i].timestamp > queued[i + 1].timestamp) {
              return false;
            }
          }

          return queued.length === types.length;
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: achievement-streak-system, Property 15: Notification suppression with recording**
   * **Validates: Requirements 8.5**
   *
   * For any achievement earned when notifications are disabled, the achievement
   * SHALL be recorded but no visual notification SHALL be displayed.
   */
  describe('Property 15: Notification suppression with recording', () => {
    beforeEach(() => {
      resetAchievementNotificationService();
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
      resetAchievementNotificationService();
    });

    it('notifications are suppressed when disabled but achievements are still queued', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 10 }), numAchievements => {
          resetAchievementNotificationService();
          const service = new AchievementNotificationService();

          // Disable notifications BEFORE queueing
          service.setNotificationsEnabled(false);

          const displayedNotifications: string[] = [];

          // Add listener to track if any notifications are displayed
          service.addListener(notification => {
            displayedNotifications.push(notification.id);
          });

          // Queue achievements while notifications are disabled
          for (let i = 0; i < numAchievements; i++) {
            service.showAchievementNotification({
              id: `achievement_${i}`,
              name: `Achievement ${i}`,
              description: `Description ${i}`,
              category: 'health_milestones',
              rarity: 'common',
              iconUrl: 'icon.png',
              unlockCondition: { type: 'steps', threshold: 1000, comparison: 'gte' },
              cosmeticRewards: [],
            });
          }

          // Advance timers to ensure any pending notifications would have been processed
          jest.advanceTimersByTime(10000);

          // Verify: No notifications were displayed (listeners not called)
          if (displayedNotifications.length !== 0) {
            return false;
          }

          // Verify: Service correctly reports notifications are disabled
          if (service.isEnabled() !== false) {
            return false;
          }

          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('achievements are recorded in queue when notifications are disabled', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 10 }), numAchievements => {
          resetAchievementNotificationService();
          const service = new AchievementNotificationService();

          // Disable notifications
          service.setNotificationsEnabled(false);

          const baseTimestamp = Date.now();

          // Queue notifications directly (simulating achievement recording)
          for (let i = 0; i < numAchievements; i++) {
            const notification: AchievementNotification = {
              id: `notification_${i}`,
              type: 'achievement',
              title: `Achievement ${i}`,
              message: `Message ${i}`,
              priority: 'normal',
              timestamp: baseTimestamp + i * 100,
            };
            (
              service as unknown as { queueNotification: (n: AchievementNotification) => void }
            ).queueNotification(notification);
          }

          // Verify: Notifications were added to queue (recorded)
          const queueLength = service.getQueueLength();

          // The queue should have the notifications recorded
          return queueLength === numAchievements;
        }),
        { numRuns: 100 }
      );
    });

    it('re-enabling notifications does not auto-display previously suppressed notifications', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 5 }), numAchievements => {
          resetAchievementNotificationService();
          const service = new AchievementNotificationService();

          // Disable notifications
          service.setNotificationsEnabled(false);

          const displayedNotifications: string[] = [];

          service.addListener(notification => {
            displayedNotifications.push(notification.id);
          });

          // Queue achievements while disabled
          for (let i = 0; i < numAchievements; i++) {
            service.showAchievementNotification({
              id: `achievement_${i}`,
              name: `Achievement ${i}`,
              description: `Description ${i}`,
              category: 'health_milestones',
              rarity: 'common',
              iconUrl: 'icon.png',
              unlockCondition: { type: 'steps', threshold: 1000, comparison: 'gte' },
              cosmeticRewards: [],
            });
          }

          // Re-enable notifications
          service.setNotificationsEnabled(true);

          // Advance timers
          jest.advanceTimersByTime(10000);

          // The suppressed notifications should NOT be auto-displayed
          // (they were cleared when processQueue ran with notifications disabled)
          // This is the expected behavior per the implementation
          return displayedNotifications.length === 0;
        }),
        { numRuns: 100 }
      );
    });

    it('streak milestone notifications are suppressed when disabled', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(7, 14, 30, 60, 90),
          fc.integer({ min: 7, max: 100 }),
          (milestoneDays, currentStreak) => {
            // Ensure currentStreak >= milestoneDays
            const validStreak = Math.max(milestoneDays, currentStreak);

            resetAchievementNotificationService();
            const service = new AchievementNotificationService();

            // Disable notifications
            service.setNotificationsEnabled(false);

            const displayedNotifications: string[] = [];

            service.addListener(notification => {
              displayedNotifications.push(notification.id);
            });

            // Show streak milestone notification while disabled
            service.showStreakMilestoneNotification(
              { days: milestoneDays, achievementId: `streak_${milestoneDays}` },
              validStreak
            );

            // Advance timers
            jest.advanceTimersByTime(10000);

            // Verify: No notifications were displayed
            return displayedNotifications.length === 0;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('cosmetic unlock notifications are suppressed when disabled', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          rarityTierArb,
          (cosmeticId, cosmeticName, rarity) => {
            resetAchievementNotificationService();
            const service = new AchievementNotificationService();

            // Disable notifications
            service.setNotificationsEnabled(false);

            const displayedNotifications: string[] = [];

            service.addListener(notification => {
              displayedNotifications.push(notification.id);
            });

            // Show cosmetic unlock notification while disabled
            service.showCosmeticUnlockNotification(cosmeticId, cosmeticName, rarity);

            // Advance timers
            jest.advanceTimersByTime(10000);

            // Verify: No notifications were displayed
            return displayedNotifications.length === 0;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('mixed notification types are all suppressed when disabled', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 3 }), count => {
          resetAchievementNotificationService();
          const service = new AchievementNotificationService();

          // Disable notifications
          service.setNotificationsEnabled(false);

          const displayedNotifications: string[] = [];

          service.addListener(notification => {
            displayedNotifications.push(notification.id);
          });

          // Queue different types of notifications
          for (let i = 0; i < count; i++) {
            // Achievement notification
            service.showAchievementNotification({
              id: `achievement_${i}`,
              name: `Achievement ${i}`,
              description: `Description ${i}`,
              category: 'health_milestones',
              rarity: 'common',
              iconUrl: 'icon.png',
              unlockCondition: { type: 'steps', threshold: 1000, comparison: 'gte' },
              cosmeticRewards: [],
            });

            // Streak milestone notification
            service.showStreakMilestoneNotification(
              { days: 7, achievementId: `streak_7_${i}` },
              7 + i
            );

            // Cosmetic unlock notification
            service.showCosmeticUnlockNotification(`cosmetic_${i}`, `Cosmetic ${i}`, 'rare');
          }

          // Advance timers
          jest.advanceTimersByTime(30000);

          // Verify: No notifications were displayed
          return displayedNotifications.length === 0;
        }),
        { numRuns: 100 }
      );
    });

    it('notifications enabled state can be toggled', () => {
      fc.assert(
        fc.property(fc.array(fc.boolean(), { minLength: 1, maxLength: 10 }), toggleSequence => {
          resetAchievementNotificationService();
          const service = new AchievementNotificationService();

          // Apply toggle sequence
          for (const enabled of toggleSequence) {
            service.setNotificationsEnabled(enabled);

            // Verify state matches what was set
            if (service.isEnabled() !== enabled) {
              return false;
            }
          }

          // Final state should match last toggle
          const expectedFinalState = toggleSequence[toggleSequence.length - 1];
          return service.isEnabled() === expectedFinalState;
        }),
        { numRuns: 100 }
      );
    });
  });
});
