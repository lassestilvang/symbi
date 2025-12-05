/**
 * AchievementNotificationService - Manages achievement and streak notification display
 *
 * This service handles:
 * - Notification queue with sequential display
 * - Achievement unlock notifications with badge icon and name
 * - Streak milestone notifications with celebration effects
 * - Notification suppression when disabled (while still recording achievements)
 *
 * Requirements: 8.1, 8.2, 8.4, 8.5
 */

import type { Achievement, StreakMilestone, RarityTier } from '../types';

// ============================================================================
// Notification Types
// ============================================================================

/**
 * NotificationType distinguishes between different notification styles
 */
export type NotificationType = 'achievement' | 'streak_milestone' | 'cosmetic_unlock';

/**
 * NotificationPriority determines display order when multiple notifications queue
 */
export type NotificationPriority = 'low' | 'normal' | 'high';

/**
 * AchievementNotification represents a queued notification
 */
export interface AchievementNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  iconUrl?: string;
  rarity?: RarityTier;
  priority: NotificationPriority;
  timestamp: number;
  data?: {
    achievement?: Achievement;
    milestone?: StreakMilestone;
    cosmeticId?: string;
  };
}

/**
 * NotificationDisplayOptions controls how a notification is shown
 */
export interface NotificationDisplayOptions {
  duration?: number; // milliseconds
  showConfetti?: boolean;
  celebrationAnimation?: boolean;
}

/**
 * NotificationListener callback for UI components to receive notifications
 */
export type NotificationListener = (notification: AchievementNotification) => void;

/**
 * NotificationDismissListener callback when a notification is dismissed
 */
export type NotificationDismissListener = (notificationId: string) => void;

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_NOTIFICATION_DURATION = 4000; // 4 seconds
const RARE_NOTIFICATION_DURATION = 5000; // 5 seconds for rare items
const LEGENDARY_NOTIFICATION_DURATION = 6000; // 6 seconds for legendary items

/**
 * Priority order for sorting notifications
 */
const PRIORITY_ORDER: Record<NotificationPriority, number> = {
  low: 1,
  normal: 2,
  high: 3,
};

/**
 * Rarity to priority mapping
 */
const RARITY_PRIORITY: Record<RarityTier, NotificationPriority> = {
  common: 'low',
  rare: 'normal',
  epic: 'high',
  legendary: 'high',
};

// ============================================================================
// AchievementNotificationService Class
// ============================================================================

/**
 * AchievementNotificationService manages the notification queue and display logic.
 */
export class AchievementNotificationService {
  private queue: AchievementNotification[] = [];
  private isDisplaying = false;
  private notificationsEnabled = true;
  private listeners: Set<NotificationListener> = new Set();
  private dismissListeners: Set<NotificationDismissListener> = new Set();
  private currentNotification: AchievementNotification | null = null;
  private displayTimeoutId: ReturnType<typeof setTimeout> | null = null;

  // ==========================================================================
  // Configuration (Requirements: 8.5)
  // ==========================================================================

  /**
   * Enable or disable notification display.
   * When disabled, achievements are still recorded but no visual notification is shown.
   */
  setNotificationsEnabled(enabled: boolean): void {
    this.notificationsEnabled = enabled;
  }

  /**
   * Check if notifications are currently enabled.
   */
  isEnabled(): boolean {
    return this.notificationsEnabled;
  }

  // ==========================================================================
  // Listener Management
  // ==========================================================================

  /**
   * Subscribe to notification events.
   * UI components use this to receive notifications for display.
   */
  addListener(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Subscribe to notification dismiss events.
   */
  addDismissListener(listener: NotificationDismissListener): () => void {
    this.dismissListeners.add(listener);
    return () => this.dismissListeners.delete(listener);
  }

  /**
   * Notify all listeners of a new notification.
   */
  private notifyListeners(notification: AchievementNotification): void {
    this.listeners.forEach(listener => {
      try {
        listener(notification);
      } catch (error) {
        console.error('[AchievementNotificationService] Listener error:', error);
      }
    });
  }

  /**
   * Notify all dismiss listeners.
   */
  private notifyDismissListeners(notificationId: string): void {
    this.dismissListeners.forEach(listener => {
      try {
        listener(notificationId);
      } catch (error) {
        console.error('[AchievementNotificationService] Dismiss listener error:', error);
      }
    });
  }

  // ==========================================================================
  // Achievement Notifications (Requirements: 8.1)
  // ==========================================================================

  /**
   * Show a notification for an unlocked achievement.
   * Displays a toast with badge icon and achievement name.
   *
   * @param achievement - The achievement that was unlocked
   * @param options - Optional display configuration
   */
  showAchievementNotification(
    achievement: Achievement,
    options?: NotificationDisplayOptions
  ): void {
    const notification: AchievementNotification = {
      id: `achievement_${achievement.id}_${Date.now()}`,
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: achievement.name,
      iconUrl: achievement.iconUrl,
      rarity: achievement.rarity,
      priority: RARITY_PRIORITY[achievement.rarity],
      timestamp: Date.now(),
      data: { achievement },
    };

    this.queueNotification(notification, options);
  }

  // ==========================================================================
  // Streak Milestone Notifications (Requirements: 8.2)
  // ==========================================================================

  /**
   * Show a notification for reaching a streak milestone.
   * Displays an animated celebration effect.
   *
   * @param milestone - The streak milestone reached
   * @param currentStreak - The current streak count
   * @param options - Optional display configuration
   */
  showStreakMilestoneNotification(
    milestone: StreakMilestone,
    currentStreak: number,
    options?: NotificationDisplayOptions
  ): void {
    const notification: AchievementNotification = {
      id: `streak_${milestone.days}_${Date.now()}`,
      type: 'streak_milestone',
      title: `${milestone.days}-Day Streak!`,
      message: `Amazing! You've maintained your health streak for ${currentStreak} days!`,
      priority: milestone.days >= 30 ? 'high' : 'normal',
      timestamp: Date.now(),
      data: { milestone },
    };

    // Streak milestones always show celebration animation
    const displayOptions: NotificationDisplayOptions = {
      ...options,
      celebrationAnimation: true,
      showConfetti: milestone.days >= 30,
    };

    this.queueNotification(notification, displayOptions);
  }

  // ==========================================================================
  // Cosmetic Unlock Notifications (Requirements: 8.3)
  // ==========================================================================

  /**
   * Show a notification for unlocking a rare cosmetic.
   * Displays a special unlock animation with confetti.
   *
   * @param cosmeticId - The ID of the unlocked cosmetic
   * @param cosmeticName - The name of the cosmetic
   * @param rarity - The rarity tier of the cosmetic
   * @param options - Optional display configuration
   */
  showCosmeticUnlockNotification(
    cosmeticId: string,
    cosmeticName: string,
    rarity: RarityTier,
    options?: NotificationDisplayOptions
  ): void {
    const notification: AchievementNotification = {
      id: `cosmetic_${cosmeticId}_${Date.now()}`,
      type: 'cosmetic_unlock',
      title: 'New Cosmetic Unlocked!',
      message: cosmeticName,
      rarity,
      priority: RARITY_PRIORITY[rarity],
      timestamp: Date.now(),
      data: { cosmeticId },
    };

    // Rare cosmetics show confetti
    const displayOptions: NotificationDisplayOptions = {
      ...options,
      showConfetti: rarity === 'epic' || rarity === 'legendary',
    };

    this.queueNotification(notification, displayOptions);
  }

  // ==========================================================================
  // Queue Management (Requirements: 8.4)
  // ==========================================================================

  /**
   * Add a notification to the queue.
   * Notifications are displayed sequentially in the order they were triggered.
   */
  private queueNotification(
    notification: AchievementNotification,
    options?: NotificationDisplayOptions
  ): void {
    // Always add to queue (for tracking), but only display if enabled
    this.queue.push(notification);

    // Sort queue by timestamp to maintain order (FIFO), with priority as tiebreaker
    this.queue.sort((a, b) => {
      const timeDiff = a.timestamp - b.timestamp;
      if (timeDiff !== 0) return timeDiff;
      // Higher priority notifications come first when timestamps are equal
      return PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
    });

    console.log(
      `[AchievementNotificationService] Queued notification: ${notification.id}, ` +
        `queue length: ${this.queue.length}, enabled: ${this.notificationsEnabled}`
    );

    // Start processing if not already displaying and notifications are enabled
    if (!this.isDisplaying && this.notificationsEnabled) {
      this.processQueue(options);
    }
  }

  /**
   * Process the notification queue sequentially.
   */
  private processQueue(options?: NotificationDisplayOptions): void {
    if (this.queue.length === 0) {
      this.isDisplaying = false;
      this.currentNotification = null;
      return;
    }

    // Check if notifications are suppressed (Requirements: 8.5)
    if (!this.notificationsEnabled) {
      // Clear the queue without displaying
      console.log(
        '[AchievementNotificationService] Notifications suppressed, ' +
          `clearing ${this.queue.length} queued notifications`
      );
      this.queue = [];
      this.isDisplaying = false;
      this.currentNotification = null;
      return;
    }

    this.isDisplaying = true;
    const notification = this.queue.shift()!;
    this.currentNotification = notification;

    // Determine display duration based on rarity
    const duration = this.getNotificationDuration(notification, options);

    // Notify listeners to display the notification
    this.notifyListeners(notification);

    // Schedule auto-dismiss
    this.displayTimeoutId = setTimeout(() => {
      this.dismissCurrentNotification();
    }, duration);
  }

  /**
   * Get the display duration for a notification based on its rarity.
   */
  private getNotificationDuration(
    notification: AchievementNotification,
    options?: NotificationDisplayOptions
  ): number {
    if (options?.duration) {
      return options.duration;
    }

    switch (notification.rarity) {
      case 'legendary':
        return LEGENDARY_NOTIFICATION_DURATION;
      case 'epic':
      case 'rare':
        return RARE_NOTIFICATION_DURATION;
      default:
        return DEFAULT_NOTIFICATION_DURATION;
    }
  }

  /**
   * Dismiss the currently displayed notification and process the next one.
   */
  dismissCurrentNotification(): void {
    if (this.displayTimeoutId) {
      clearTimeout(this.displayTimeoutId);
      this.displayTimeoutId = null;
    }

    if (this.currentNotification) {
      const notificationId = this.currentNotification.id;
      this.currentNotification = null;
      this.notifyDismissListeners(notificationId);
    }

    // Process next notification in queue
    this.processQueue();
  }

  /**
   * Manually dismiss a specific notification by ID.
   */
  dismissNotification(notificationId: string): void {
    // Remove from queue if not yet displayed
    this.queue = this.queue.filter(n => n.id !== notificationId);

    // If it's the current notification, dismiss it
    if (this.currentNotification?.id === notificationId) {
      this.dismissCurrentNotification();
    }
  }

  // ==========================================================================
  // Query Methods
  // ==========================================================================

  /**
   * Get the current notification being displayed.
   */
  getCurrentNotification(): AchievementNotification | null {
    return this.currentNotification;
  }

  /**
   * Get the number of notifications in the queue.
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * Get all queued notifications (for debugging/testing).
   */
  getQueuedNotifications(): AchievementNotification[] {
    return [...this.queue];
  }

  /**
   * Check if a notification is currently being displayed.
   */
  isNotificationDisplaying(): boolean {
    return this.isDisplaying;
  }

  // ==========================================================================
  // Cleanup
  // ==========================================================================

  /**
   * Clear all queued notifications.
   */
  clearQueue(): void {
    this.queue = [];
    if (this.displayTimeoutId) {
      clearTimeout(this.displayTimeoutId);
      this.displayTimeoutId = null;
    }
    this.isDisplaying = false;
    this.currentNotification = null;
  }

  /**
   * Reset the service state (for testing or cleanup).
   */
  reset(): void {
    this.clearQueue();
    this.listeners.clear();
    this.dismissListeners.clear();
    this.notificationsEnabled = true;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let notificationServiceInstance: AchievementNotificationService | null = null;

/**
 * Get the singleton AchievementNotificationService instance.
 */
export function getAchievementNotificationService(): AchievementNotificationService {
  if (!notificationServiceInstance) {
    notificationServiceInstance = new AchievementNotificationService();
  }
  return notificationServiceInstance;
}

/**
 * Reset the singleton instance (for testing).
 */
export function resetAchievementNotificationService(): void {
  if (notificationServiceInstance) {
    notificationServiceInstance.reset();
  }
  notificationServiceInstance = null;
}
