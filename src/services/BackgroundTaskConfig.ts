/**
 * BackgroundTaskConfig
 * 
 * Configuration for background tasks and battery optimization.
 * Centralizes all timing and performance settings.
 * 
 * Requirements: 10.1, 10.2, 10.3
 */

export const BackgroundTaskConfig = {
  /**
   * Minimum interval between background fetches (15 minutes)
   * Requirement 10.1: Configure background fetch intervals (15 minutes minimum)
   */
  MIN_FETCH_INTERVAL_MS: 15 * 60 * 1000,

  /**
   * Batch delay for API calls (5 seconds)
   * Requirement 10.2: Batch API calls to minimize wake-ups
   */
  BATCH_DELAY_MS: 5000,

  /**
   * Background animation frame rate (10 FPS)
   * Requirement 10.3: Reduce animation frame rate when backgrounded
   */
  BACKGROUND_FPS: 10,
  FOREGROUND_FPS: 30,

  /**
   * Animation speed multiplier for background mode
   * 10 FPS / 30 FPS = 0.33
   */
  BACKGROUND_ANIMATION_SPEED: 0.33,
  FOREGROUND_ANIMATION_SPEED: 1.0,

  /**
   * Daily AI analysis schedule (8:00 AM)
   * Requirement 10.2: Batch API calls once per day
   */
  DAILY_ANALYSIS_HOUR: 8,

  /**
   * Maximum battery usage target (5% per 24 hours)
   * Requirement 10.1
   */
  MAX_BATTERY_USAGE_PERCENT: 5,

  /**
   * iOS BackgroundTasks configuration
   * For production deployment with native modules
   */
  IOS_BACKGROUND_TASK_IDENTIFIER: 'com.symbi.healthdatarefresh',
  IOS_MIN_FETCH_INTERVAL: 15 * 60, // 15 minutes in seconds

  /**
   * Android WorkManager configuration
   * For production deployment with native modules
   */
  ANDROID_WORK_NAME: 'HealthDataSyncWork',
  ANDROID_REPEAT_INTERVAL_MINUTES: 15,
  ANDROID_FLEX_INTERVAL_MINUTES: 5,

  /**
   * Network request timeouts
   */
  GEMINI_API_TIMEOUT_MS: 10000, // 10 seconds
  GEMINI_IMAGE_API_TIMEOUT_MS: 30000, // 30 seconds

  /**
   * Retry configuration
   */
  MAX_RETRIES: 2,
  RETRY_DELAY_BASE_MS: 1000, // Exponential backoff base
};

/**
 * Get animation speed based on app state
 */
export function getAnimationSpeed(isBackground: boolean): number {
  return isBackground
    ? BackgroundTaskConfig.BACKGROUND_ANIMATION_SPEED
    : BackgroundTaskConfig.FOREGROUND_ANIMATION_SPEED;
}

/**
 * Calculate next scheduled time for daily analysis
 */
export function getNextAnalysisTime(): Date {
  const now = new Date();
  const next = new Date();
  next.setHours(BackgroundTaskConfig.DAILY_ANALYSIS_HOUR, 0, 0, 0);

  // If it's already past the scheduled hour today, schedule for tomorrow
  if (now >= next) {
    next.setDate(next.getDate() + 1);
  }

  return next;
}

/**
 * Calculate milliseconds until next analysis
 */
export function getMillisecondsUntilNextAnalysis(): number {
  const now = new Date();
  const next = getNextAnalysisTime();
  return next.getTime() - now.getTime();
}

/**
 * Check if enough time has passed since last sync
 */
export function shouldSync(lastSyncTime: number): boolean {
  const now = Date.now();
  const timeSinceLastSync = now - lastSyncTime;
  return timeSinceLastSync >= BackgroundTaskConfig.MIN_FETCH_INTERVAL_MS;
}
