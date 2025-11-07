/**
 * Sentry Configuration
 * 
 * Configuration for error reporting and monitoring.
 * Replace the DSN with your actual Sentry project DSN before deployment.
 */

export const SENTRY_CONFIG = {
  // Replace with your Sentry DSN from https://sentry.io/settings/[org]/projects/[project]/keys/
  dsn: process.env.SENTRY_DSN || 'https://your-sentry-dsn@sentry.io/your-project-id',
  
  // Environment configuration
  environment: process.env.NODE_ENV || 'development',
  
  // Enable in Expo development (useful for testing)
  enableInExpoDevelopment: false,
  
  // Performance monitoring sample rate (0.0 to 1.0)
  // 0.2 = 20% of transactions are sent to Sentry
  tracesSampleRate: 0.2,
  
  // Release version (automatically set from package.json)
  release: undefined, // Will be set automatically
  
  // Distribution (build number)
  dist: undefined, // Will be set automatically
};

/**
 * Alert Configuration
 * 
 * These should be configured in the Sentry dashboard, but are documented here
 * for reference.
 */
export const ALERT_THRESHOLDS = {
  // Critical: Crash rate exceeds 1%
  criticalCrashRate: 0.01,
  
  // Warning: Error rate exceeds 5%
  warningErrorRate: 0.05,
  
  // Performance: Response time exceeds 5 seconds
  slowResponseTime: 5000,
  
  // Memory: Memory usage exceeds 100MB
  highMemoryUsage: 100 * 1024 * 1024,
};

/**
 * Sentry Dashboard Setup Instructions
 * 
 * 1. Create a Sentry account at https://sentry.io
 * 2. Create a new React Native project
 * 3. Copy the DSN and add it to your environment variables
 * 4. Set up alerts in Settings > Alerts:
 *    - Crash rate > 1%: Critical alert, notify immediately
 *    - Error rate > 5%: Warning alert, notify daily digest
 *    - New issue: Info alert, notify daily digest
 *    - Performance degradation: Warning alert, notify daily digest
 * 5. Configure integrations:
 *    - Slack/Discord for team notifications
 *    - GitHub for issue tracking
 *    - PagerDuty for on-call alerts (optional)
 * 6. Set up release tracking:
 *    - Enable source maps upload
 *    - Configure CI/CD integration
 *    - Track deploys and releases
 */
