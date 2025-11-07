/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Sentry from '@sentry/react-native';
// import { Platform } from 'react-native';

/**
 * Error Reporting Service
 *
 * Integrates Sentry for crash reporting and monitoring with privacy-preserving features.
 * Sanitizes health data from error reports and implements breadcrumb logging.
 */

interface ErrorReportingConfig {
  dsn: string;
  environment: 'development' | 'staging' | 'production';
  enableInExpoDevelopment?: boolean;
  tracesSampleRate?: number;
  beforeSend?: (event: Sentry.Event) => Sentry.Event | null;
}

class ErrorReportingService {
  private static instance: ErrorReportingService;
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService();
    }
    return ErrorReportingService.instance;
  }

  /**
   * Initialize Sentry with privacy-preserving configuration
   */
  initialize(config: ErrorReportingConfig): void {
    if (this.initialized) {
      console.warn('ErrorReportingService already initialized');
      return;
    }

    try {
      Sentry.init({
        dsn: config.dsn,
        environment: config.environment,

        // Performance monitoring
        tracesSampleRate: config.tracesSampleRate ?? 0.2,

        // Sanitize data before sending
        beforeSend: (event, _hint) => {
          // Custom sanitization
          return this.sanitizeEvent(event);
        },

        // Breadcrumb filtering
        beforeBreadcrumb: breadcrumb => {
          return this.sanitizeBreadcrumb(breadcrumb);
        },

        // Platform-specific configuration
        integrations: [],

        // Enable native crash handling
        enableNative: true,
        enableNativeCrashHandling: true,

        // Attach stack traces
        attachStacktrace: true,

        // Session tracking
        enableAutoSessionTracking: true,
        sessionTrackingIntervalMillis: 30000,
      });

      this.initialized = true;
      console.log('ErrorReportingService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ErrorReportingService:', error);
    }
  }

  /**
   * Sanitize event data to remove sensitive health information
   */
  private sanitizeEvent(event: Sentry.ErrorEvent): Sentry.ErrorEvent {
    // Sanitize exception messages
    if (event.exception?.values) {
      event.exception.values = event.exception.values.map(exception => ({
        ...exception,
        value: this.sanitizeString(exception.value),
      }));
    }

    // Sanitize breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs
        .map(breadcrumb => this.sanitizeBreadcrumb(breadcrumb))
        .filter((b): b is Sentry.Breadcrumb => b !== null);
    }

    // Sanitize extra data
    if (event.extra) {
      event.extra = this.sanitizeObject(event.extra);
    }

    // Sanitize context data
    if (event.contexts) {
      event.contexts = this.sanitizeObject(event.contexts);
    }

    // Remove user email/name if accidentally included
    if (event.user) {
      event.user = {
        id: event.user.id, // Keep anonymous ID only
      };
    }

    return event;
  }

  /**
   * Sanitize breadcrumb data
   */
  private sanitizeBreadcrumb(breadcrumb: Sentry.Breadcrumb): Sentry.Breadcrumb | null {
    // Remove breadcrumbs that might contain health data
    const sensitiveCategories = ['health', 'biometric', 'steps', 'sleep', 'hrv'];
    if (
      breadcrumb.category &&
      sensitiveCategories.some(cat => breadcrumb.category?.toLowerCase().includes(cat))
    ) {
      return {
        ...breadcrumb,
        data: { sanitized: true },
        message: '[Health data removed for privacy]',
      };
    }

    // Sanitize breadcrumb message and data
    return {
      ...breadcrumb,
      message: breadcrumb.message ? this.sanitizeString(breadcrumb.message) : undefined,
      data: breadcrumb.data ? this.sanitizeObject(breadcrumb.data) : undefined,
    };
  }

  /**
   * Sanitize string by removing potential health data patterns
   */
  private sanitizeString(str?: string): string | undefined {
    if (!str) return str;

    // Patterns to sanitize
    const patterns = [
      /\b\d+\s*(steps?|step count)\b/gi,
      /\b\d+\.?\d*\s*(hours?|hrs?)\s*(sleep|slept)\b/gi,
      /\bhrv:?\s*\d+/gi,
      /\bheart rate:?\s*\d+/gi,
      /\b\d+\s*bpm\b/gi,
    ];

    let sanitized = str;
    patterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[HEALTH_DATA_REDACTED]');
    });

    return sanitized;
  }

  /**
   * Sanitize object by removing health data fields
   */
  private sanitizeObject(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;

    const sensitiveKeys = [
      'steps',
      'stepCount',
      'sleep',
      'sleepHours',
      'sleepDuration',
      'hrv',
      'heartRate',
      'heartRateVariability',
      'healthData',
      'biometricData',
      'emotionalState',
    ];

    const sanitized: any = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitized[key] = this.sanitizeObject(obj[key]);
      } else if (typeof obj[key] === 'string') {
        sanitized[key] = this.sanitizeString(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    }

    return sanitized;
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(
    message: string,
    category: string,
    level: Sentry.SeverityLevel = 'info',
    data?: Record<string, any>
  ): void {
    if (!this.initialized) return;

    Sentry.addBreadcrumb({
      message,
      category,
      level,
      data: data ? this.sanitizeObject(data) : undefined,
      timestamp: Date.now() / 1000,
    });
  }

  /**
   * Capture exception with sanitization
   */
  captureException(error: Error, context?: Record<string, any>): void {
    if (!this.initialized) {
      console.error('ErrorReportingService not initialized, logging error:', error);
      return;
    }

    Sentry.withScope(scope => {
      if (context) {
        scope.setContext('additional', this.sanitizeObject(context));
      }
      Sentry.captureException(error);
    });
  }

  /**
   * Capture message with sanitization
   */
  captureMessage(
    message: string,
    level: Sentry.SeverityLevel = 'info',
    context?: Record<string, any>
  ): void {
    if (!this.initialized) {
      console.log(`[${level}] ${message}`, context);
      return;
    }

    Sentry.withScope(scope => {
      if (context) {
        scope.setContext('additional', this.sanitizeObject(context));
      }
      Sentry.captureMessage(this.sanitizeString(message) || message, level);
    });
  }

  /**
   * Set user context (anonymous only)
   */
  setUser(userId: string): void {
    if (!this.initialized) return;

    Sentry.setUser({
      id: userId, // Anonymous device ID only
    });
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    if (!this.initialized) return;
    Sentry.setUser(null);
  }

  /**
   * Set custom tag
   */
  setTag(key: string, value: string): void {
    if (!this.initialized) return;
    Sentry.setTag(key, value);
  }

  /**
   * Set custom context
   */
  setContext(name: string, context: Record<string, any>): void {
    if (!this.initialized) return;
    Sentry.setContext(name, this.sanitizeObject(context));
  }

  /**
   * Track screen navigation
   */
  trackNavigation(screenName: string, params?: Record<string, any>): void {
    if (!this.initialized) return;

    this.addBreadcrumb(
      `Navigation to ${screenName}`,
      'navigation',
      'info',
      params ? { params: this.sanitizeObject(params) } : undefined
    );
  }

  /**
   * Track API call
   */
  trackAPICall(endpoint: string, method: string, statusCode?: number, duration?: number): void {
    if (!this.initialized) return;

    this.addBreadcrumb(
      `API ${method} ${endpoint}`,
      'http',
      statusCode && statusCode >= 400 ? 'error' : 'info',
      {
        method,
        endpoint,
        statusCode,
        duration,
      }
    );
  }

  /**
   * Track user action
   */
  trackUserAction(action: string, data?: Record<string, any>): void {
    if (!this.initialized) return;

    this.addBreadcrumb(
      `User action: ${action}`,
      'user',
      'info',
      data ? this.sanitizeObject(data) : undefined
    );
  }

  /**
   * Check if crash rate exceeds threshold
   * This should be monitored via Sentry dashboard alerts
   */
  static setupAlerts(): void {
    console.log(`
      ⚠️  IMPORTANT: Set up Sentry alerts for critical errors
      
      Recommended alerts:
      1. Crash rate > 1% (critical)
      2. Error rate > 5% (warning)
      3. New issue detected (info)
      4. Performance degradation (warning)
      
      Configure these in your Sentry dashboard:
      https://sentry.io/settings/[your-org]/projects/[your-project]/alerts/
    `);
  }
}

export default ErrorReportingService;
