# Crash Reporting and Monitoring Setup

This document explains how to set up and configure Sentry for crash reporting and monitoring in the Symbi app.

## Overview

Symbi uses Sentry for:
- Crash reporting and error tracking
- Performance monitoring
- Breadcrumb logging for debugging
- Privacy-preserving error reports (health data is sanitized)

## Setup Instructions

### 1. Create Sentry Account

1. Go to [https://sentry.io](https://sentry.io)
2. Sign up for a free account (or use existing account)
3. Create a new project:
   - Platform: React Native
   - Project name: `symbi-mobile`
   - Team: Your team name

### 2. Get Your DSN

1. After creating the project, you'll see your DSN (Data Source Name)
2. It looks like: `https://abc123@o123456.ingest.sentry.io/7890123`
3. Copy this DSN for the next step

### 3. Configure Environment Variables

Create a `.env` file in the project root (if it doesn't exist):

```bash
# Sentry Configuration
SENTRY_DSN=https://your-actual-dsn@sentry.io/your-project-id
NODE_ENV=production
```

For development, you can use a separate Sentry project:

```bash
# .env.development
SENTRY_DSN=https://your-dev-dsn@sentry.io/your-dev-project-id
NODE_ENV=development
```

### 4. Update Configuration

The DSN is already configured in `src/config/sentry.config.ts`. If you need to change it:

```typescript
export const SENTRY_CONFIG = {
  dsn: process.env.SENTRY_DSN || 'your-fallback-dsn',
  environment: process.env.NODE_ENV || 'development',
  // ... other config
};
```

### 5. Set Up Alerts

Configure alerts in Sentry dashboard to monitor app health:

#### Critical Alerts (Immediate Notification)

1. Go to Settings > Alerts > Create Alert Rule
2. **Crash Rate Alert**:
   - Condition: When crash free rate is below 99%
   - Time window: 1 hour
   - Action: Send notification to Slack/Email immediately
   - Priority: Critical

#### Warning Alerts (Daily Digest)

1. **Error Rate Alert**:
   - Condition: When error rate is above 5%
   - Time window: 24 hours
   - Action: Send daily digest
   - Priority: Warning

2. **New Issue Alert**:
   - Condition: When a new issue is created
   - Action: Send daily digest
   - Priority: Info

3. **Performance Degradation**:
   - Condition: When p95 response time exceeds 5 seconds
   - Time window: 1 hour
   - Action: Send notification
   - Priority: Warning

### 6. Configure Integrations

#### Slack Integration (Recommended)

1. Go to Settings > Integrations > Slack
2. Click "Add to Slack"
3. Select channel for notifications (e.g., `#symbi-alerts`)
4. Configure which alerts go to Slack

#### GitHub Integration (Optional)

1. Go to Settings > Integrations > GitHub
2. Connect your GitHub repository
3. Enable automatic issue creation for new errors
4. Link Sentry issues to GitHub issues

### 7. Source Maps (For Better Stack Traces)

To get readable stack traces in production:

1. Install Sentry CLI:
```bash
npm install -g @sentry/cli
```

2. Create `.sentryclirc` file:
```ini
[defaults]
url=https://sentry.io/
org=your-org-name
project=symbi-mobile

[auth]
token=your-auth-token
```

3. Upload source maps during build:
```bash
sentry-cli releases files <release-version> upload-sourcemaps ./dist
```

For Expo/EAS builds, this is handled automatically with the Sentry Expo plugin.

## Usage in Code

### Basic Error Reporting

```typescript
import ErrorReportingService from './src/services/ErrorReportingService';

const errorReporting = ErrorReportingService.getInstance();

// Capture exception
try {
  // Your code
} catch (error) {
  errorReporting.captureException(error, {
    context: 'user_action',
    screen: 'MainScreen',
  });
}

// Capture message
errorReporting.captureMessage('Something went wrong', 'warning', {
  userId: 'user123',
});
```

### Adding Breadcrumbs

```typescript
// Track navigation
errorReporting.trackNavigation('MainScreen', { fromScreen: 'Onboarding' });

// Track API calls
errorReporting.trackAPICall('/api/analyze', 'POST', 200, 1234);

// Track user actions
errorReporting.trackUserAction('threshold_updated', {
  oldValue: 2000,
  newValue: 3000,
});

// Custom breadcrumb
errorReporting.addBreadcrumb(
  'Health data fetched',
  'health',
  'info',
  { dataType: 'steps' }
);
```

### Setting Context

```typescript
// Set user (anonymous ID only)
errorReporting.setUser('device-id-12345');

// Set custom tags
errorReporting.setTag('feature_phase', 'phase_2');
errorReporting.setTag('ai_enabled', 'true');

// Set custom context
errorReporting.setContext('app_state', {
  evolutionLevel: 2,
  dataSource: 'healthkit',
});
```

## Privacy and Data Sanitization

The ErrorReportingService automatically sanitizes health data from error reports:

### What Gets Sanitized

- Step counts
- Sleep hours
- HRV values
- Heart rate data
- Any field containing "health", "biometric", "steps", "sleep", "hrv"
- User email/name (only anonymous device ID is kept)

### Example

**Before sanitization:**
```
Error: Failed to process health data
Context: { steps: 8543, sleepHours: 7.5, hrv: 45 }
```

**After sanitization:**
```
Error: Failed to process health data
Context: { steps: [REDACTED], sleepHours: [REDACTED], hrv: [REDACTED] }
```

## Monitoring Dashboard

### Key Metrics to Monitor

1. **Crash Free Rate**: Should be > 99%
2. **Error Rate**: Should be < 5%
3. **Response Time (p95)**: Should be < 5 seconds
4. **Memory Usage**: Should be < 100MB

### Sentry Dashboard Views

1. **Issues**: View all errors and crashes
   - Filter by: Platform, Release, Environment
   - Sort by: Frequency, Users affected, Last seen

2. **Performance**: Monitor app performance
   - Transaction duration
   - Slow API calls
   - Memory usage

3. **Releases**: Track deployments
   - Crash rate per release
   - New issues introduced
   - Adoption rate

4. **Alerts**: Manage alert rules
   - Active alerts
   - Alert history
   - Notification settings

## Testing

### Test Error Reporting

Add a test button in development mode:

```typescript
// In a development screen
<Button
  title="Test Crash Reporting"
  onPress={() => {
    errorReporting.captureException(
      new Error('Test error from development'),
      { test: true }
    );
  }}
/>
```

### Test Crash

```typescript
<Button
  title="Test Crash"
  onPress={() => {
    throw new Error('Test crash');
  }}
/>
```

### Verify in Sentry

1. Trigger test error/crash
2. Wait 1-2 minutes
3. Check Sentry dashboard
4. Verify error appears with sanitized data

## Troubleshooting

### Errors Not Appearing in Sentry

1. **Check DSN**: Verify SENTRY_DSN is correct
2. **Check Network**: Ensure device has internet connection
3. **Check Environment**: Errors in development may be filtered
4. **Check Initialization**: Verify ErrorReportingService.initialize() is called

### Source Maps Not Working

1. **Check Upload**: Verify source maps were uploaded
2. **Check Release**: Ensure release version matches
3. **Check Build**: Ensure source maps are generated during build

### Too Many Errors

1. **Check Sampling**: Reduce tracesSampleRate in config
2. **Add Filters**: Filter out known/expected errors
3. **Fix Issues**: Address high-frequency errors first

## Best Practices

1. **Don't Over-Report**: Not every error needs to be reported
2. **Add Context**: Include relevant context with errors
3. **Use Breadcrumbs**: Add breadcrumbs for debugging
4. **Monitor Regularly**: Check dashboard weekly
5. **Respond Quickly**: Fix critical errors within 24 hours
6. **Sanitize Data**: Never send PII or health data
7. **Test Thoroughly**: Test error reporting in staging first

## Cost Management

Sentry pricing is based on:
- Number of events (errors/transactions)
- Data retention period
- Team size

### Free Tier Limits
- 5,000 errors per month
- 10,000 performance units per month
- 30-day data retention

### Tips to Stay Within Limits
1. Use sampling for performance monitoring (20%)
2. Filter out noisy errors
3. Set up proper error boundaries
4. Fix high-frequency errors quickly

## Support

- Sentry Documentation: https://docs.sentry.io/platforms/react-native/
- Sentry Support: https://sentry.io/support/
- Internal: Contact DevOps team

## Checklist

- [ ] Sentry account created
- [ ] Project created in Sentry
- [ ] DSN added to environment variables
- [ ] Alerts configured (crash rate, error rate)
- [ ] Slack integration set up
- [ ] Source maps configured
- [ ] Test error sent and verified
- [ ] Team members added to Sentry project
- [ ] Documentation reviewed by team
