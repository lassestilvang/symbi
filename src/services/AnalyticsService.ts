/**
 * Analytics Service
 *
 * Privacy-preserving analytics that tracks aggregate metrics without PII.
 * Requirements: 11.3
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EmotionalState } from '../types';

/**
 * Analytics event types
 */
export enum AnalyticsEvent {
  // App lifecycle
  APP_OPENED = 'app_opened',
  APP_CLOSED = 'app_closed',

  // Onboarding
  ONBOARDING_STARTED = 'onboarding_started',
  ONBOARDING_COMPLETED = 'onboarding_completed',
  ONBOARDING_SKIPPED = 'onboarding_skipped',

  // Permissions
  PERMISSION_GRANTED = 'permission_granted',
  PERMISSION_DENIED = 'permission_denied',
  MANUAL_ENTRY_SELECTED = 'manual_entry_selected',

  // Health data
  HEALTH_DATA_SYNCED = 'health_data_synced',
  EMOTIONAL_STATE_CHANGED = 'emotional_state_changed',

  // Interactive sessions
  SESSION_STARTED = 'session_started',
  SESSION_COMPLETED = 'session_completed',
  SESSION_CANCELLED = 'session_cancelled',

  // Evolution
  EVOLUTION_TRIGGERED = 'evolution_triggered',
  EVOLUTION_COMPLETED = 'evolution_completed',

  // Settings
  THRESHOLD_CONFIGURED = 'threshold_configured',
  DATA_SOURCE_CHANGED = 'data_source_changed',

  // Privacy
  DATA_EXPORTED = 'data_exported',
  DATA_DELETED = 'data_deleted',
  ACCOUNT_DELETED = 'account_deleted',
  ANALYTICS_OPTED_OUT = 'analytics_opted_out',
}

/**
 * Analytics properties (no PII allowed)
 */
export interface AnalyticsProperties {
  // Platform info
  platform?: 'ios' | 'android';

  // Feature flags
  dataSource?: 'healthkit' | 'googlefit' | 'manual';

  // Aggregate metrics
  emotionalState?: EmotionalState;
  sessionType?: string;
  sessionDuration?: number;
  evolutionLevel?: number;

  // Counts (no specific values)
  stepCountRange?: 'low' | 'medium' | 'high'; // <2000, 2000-8000, >8000

  // Success/failure
  success?: boolean;
  errorType?: string;
}

/**
 * AnalyticsService provides privacy-preserving analytics.
 *
 * Privacy Features:
 * - Anonymous device IDs only (no user IDs, emails, or names)
 * - No health data values sent (only ranges/categories)
 * - Aggregate metrics only
 * - User can opt-out at any time
 * - No third-party analytics SDKs with tracking
 */
export class AnalyticsService {
  private static readonly ANALYTICS_ENABLED_KEY = '@symbi:analytics_enabled';
  private static readonly DEVICE_ID_KEY = '@symbi:device_id';
  private static readonly SESSION_START_KEY = '@symbi:session_start';

  private static isEnabled: boolean | null = null;
  private static deviceId: string | null = null;
  private static sessionStartTime: number | null = null;

  /**
   * Initialize analytics service
   */
  static async initialize(): Promise<void> {
    // Check if analytics is enabled (default: true, user can opt-out)
    const enabled = await AsyncStorage.getItem(this.ANALYTICS_ENABLED_KEY);
    this.isEnabled = enabled !== 'false'; // Default to true

    // Get or create anonymous device ID
    this.deviceId = await this.getOrCreateDeviceId();

    // Track session start
    this.sessionStartTime = Date.now();
    await this.trackEvent(AnalyticsEvent.APP_OPENED);
  }

  /**
   * Track an analytics event
   */
  static async trackEvent(
    event: AnalyticsEvent,
    properties: AnalyticsProperties = {}
  ): Promise<void> {
    // Check if analytics is enabled
    if (this.isEnabled === false) {
      return;
    }

    try {
      // Add platform info
      const enrichedProperties: AnalyticsProperties = {
        ...properties,
        platform: Platform.OS as 'ios' | 'android',
      };

      // In production, send to privacy-preserving analytics service
      // Options: Plausible, self-hosted Matomo, or custom backend
      await this.sendToAnalytics(event, enrichedProperties);

      // Log locally for debugging (remove in production)
      if (__DEV__) {
        console.log('[Analytics]', event, enrichedProperties);
      }
    } catch (error) {
      console.error('Analytics error:', error);
      // Fail silently - analytics should never break the app
    }
  }

  /**
   * Track emotional state change (aggregated)
   */
  static async trackEmotionalStateChange(
    newState: EmotionalState,
    _previousState?: EmotionalState
  ): Promise<void> {
    await this.trackEvent(AnalyticsEvent.EMOTIONAL_STATE_CHANGED, {
      emotionalState: newState,
    });
  }

  /**
   * Track permission grant/denial
   */
  static async trackPermissionResult(
    granted: boolean,
    dataSource: 'healthkit' | 'googlefit' | 'manual'
  ): Promise<void> {
    await this.trackEvent(
      granted ? AnalyticsEvent.PERMISSION_GRANTED : AnalyticsEvent.PERMISSION_DENIED,
      {
        dataSource,
      }
    );
  }

  /**
   * Track interactive session
   */
  static async trackSession(type: string, completed: boolean, duration?: number): Promise<void> {
    const event = completed ? AnalyticsEvent.SESSION_COMPLETED : AnalyticsEvent.SESSION_CANCELLED;

    await this.trackEvent(event, {
      sessionType: type,
      sessionDuration: duration,
    });
  }

  /**
   * Track evolution event
   */
  static async trackEvolution(level: number, success: boolean): Promise<void> {
    const event = success ? AnalyticsEvent.EVOLUTION_COMPLETED : AnalyticsEvent.EVOLUTION_TRIGGERED;

    await this.trackEvent(event, {
      evolutionLevel: level,
      success,
    });
  }

  /**
   * Get aggregate metrics (for display in settings)
   */
  static async getAggregateMetrics(): Promise<{
    totalEvents: number;
    mostCommonState: EmotionalState | null;
    sessionsCompleted: number;
  }> {
    // In production, fetch from analytics backend
    // For now, return mock data
    return {
      totalEvents: 0,
      mostCommonState: null,
      sessionsCompleted: 0,
    };
  }

  /**
   * Check if analytics is enabled
   */
  static async isAnalyticsEnabled(): Promise<boolean> {
    if (this.isEnabled !== null) {
      return this.isEnabled;
    }

    const enabled = await AsyncStorage.getItem(this.ANALYTICS_ENABLED_KEY);
    this.isEnabled = enabled !== 'false';
    return this.isEnabled;
  }

  /**
   * Enable analytics
   */
  static async enableAnalytics(): Promise<void> {
    this.isEnabled = true;
    await AsyncStorage.setItem(this.ANALYTICS_ENABLED_KEY, 'true');
    await this.trackEvent(AnalyticsEvent.APP_OPENED);
  }

  /**
   * Disable analytics (opt-out)
   */
  static async disableAnalytics(): Promise<void> {
    // Track opt-out before disabling
    await this.trackEvent(AnalyticsEvent.ANALYTICS_OPTED_OUT);

    this.isEnabled = false;
    await AsyncStorage.setItem(this.ANALYTICS_ENABLED_KEY, 'false');
  }

  /**
   * Get or create anonymous device ID
   */
  private static async getOrCreateDeviceId(): Promise<string> {
    let deviceId = await AsyncStorage.getItem(this.DEVICE_ID_KEY);

    if (!deviceId) {
      // Generate anonymous device ID (not tied to user identity)
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem(this.DEVICE_ID_KEY, deviceId);
    }

    return deviceId;
  }

  /**
   * Send event to analytics backend
   *
   * In production, implement one of these options:
   *
   * 1. Plausible Analytics (privacy-focused, GDPR compliant):
   *    POST https://plausible.io/api/event
   *    {
   *      "name": event,
   *      "url": "app://symbi",
   *      "domain": "symbi.app",
   *      "props": properties
   *    }
   *
   * 2. Self-hosted Matomo:
   *    POST https://your-matomo.com/matomo.php
   *    {
   *      "idsite": 1,
   *      "rec": 1,
   *      "action_name": event,
   *      "url": "app://symbi",
   *      "_id": deviceId,
   *      ...properties
   *    }
   *
   * 3. Custom backend:
   *    POST https://your-api.com/analytics
   *    {
   *      "event": event,
   *      "properties": properties,
   *      "deviceId": deviceId,
   *      "timestamp": Date.now()
   *    }
   */
  private static async sendToAnalytics(
    event: AnalyticsEvent,
    properties: AnalyticsProperties
  ): Promise<void> {
    // Placeholder for production implementation
    // In production, send to your chosen analytics service

    // Example: Plausible Analytics
    /*
    const response = await fetch('https://plausible.io/api/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `Symbi/${Platform.OS}`,
      },
      body: JSON.stringify({
        name: event,
        url: 'app://symbi',
        domain: 'symbi.app',
        props: {
          ...properties,
          deviceId: this.deviceId,
        },
      }),
    });
    */

    // For now, just log (remove in production)
    if (__DEV__) {
      console.log('[Analytics Backend]', {
        event,
        properties,
        deviceId: this.deviceId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Track session duration on app close
   */
  static async trackSessionEnd(): Promise<void> {
    if (this.sessionStartTime) {
      const duration = Date.now() - this.sessionStartTime;
      await this.trackEvent(AnalyticsEvent.APP_CLOSED, {
        sessionDuration: Math.floor(duration / 1000), // Convert to seconds
      });
    }
  }

  /**
   * Sanitize step count to range (privacy protection)
   */
  static sanitizeStepCount(steps: number): 'low' | 'medium' | 'high' {
    if (steps < 2000) return 'low';
    if (steps < 8000) return 'medium';
    return 'high';
  }

  /**
   * Clear all analytics data (for account deletion)
   */
  static async clearAnalyticsData(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(this.DEVICE_ID_KEY),
      AsyncStorage.removeItem(this.SESSION_START_KEY),
    ]);

    this.deviceId = null;
    this.sessionStartTime = null;
  }
}

/**
 * Production Implementation Notes:
 *
 * 1. Choose a Privacy-Preserving Analytics Service:
 *
 *    a) Plausible Analytics (Recommended):
 *       - GDPR, CCPA, PECR compliant
 *       - No cookies, no personal data collection
 *       - Open source, can self-host
 *       - Simple API
 *       npm install plausible-tracker
 *
 *    b) Self-hosted Matomo:
 *       - Full control over data
 *       - GDPR compliant with proper configuration
 *       - More features but more complex
 *
 *    c) Custom Backend:
 *       - Maximum control and privacy
 *       - Store only aggregate metrics
 *       - Implement data retention policies
 *
 * 2. Configure Analytics Opt-Out:
 *    - Add toggle in settings
 *    - Respect user choice immediately
 *    - Don't track after opt-out
 *
 * 3. Data Retention:
 *    - Keep analytics data for 90 days max
 *    - Automatically delete old data
 *    - Provide data export for transparency
 *
 * 4. Metrics to Track (Privacy-Safe):
 *    ✅ Daily Active Users (DAU)
 *    ✅ Permission grant rate
 *    ✅ Emotional state distribution (aggregated)
 *    ✅ Feature usage (sessions, evolutions)
 *    ✅ Error rates
 *    ✅ Platform distribution (iOS vs Android)
 *
 *    ❌ Individual health data values
 *    ❌ User identifiers (email, name)
 *    ❌ Location data
 *    ❌ Device identifiers (IDFA, AAID)
 */
