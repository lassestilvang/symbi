# Application Architecture

## Overview

This document describes the architecture of the Symbi application, focusing on the main entry point (`App.tsx`) and core initialization flow.

## App.tsx - Main Entry Point

The `App.tsx` file serves as the application's main entry point and handles critical initialization tasks before rendering the main application.

### Key Responsibilities

1. **Error Reporting Initialization**: Sets up Sentry for crash reporting and monitoring
2. **Global Error Handling**: Captures unhandled errors and promise rejections
3. **Platform Detection**: Tags errors with platform information for better debugging
4. **Responsive Layout**: Implements web-responsive design with max-width constraints
5. **Graceful Degradation**: Ensures app functionality even if monitoring fails

### Component Structure

```typescript
App (Root Component)
├── Error Reporting Initialization (useEffect)
│   ├── Environment Validation
│   ├── Sentry Initialization
│   ├── Global Error Handler Setup
│   ├── Promise Rejection Handler Setup
│   └── Cleanup Function Registration
│
└── Render Tree
    └── SafeAreaProvider
        └── View (appContainer)
            └── View (contentWrapper)
                └── AppNavigator
                    └── [App Screens]
```

### Initialization Flow

```
1. App Component Mounts
   ↓
2. useEffect Triggers
   ↓
3. initializeErrorReporting() Called
   ↓
4. Validate Environment Configuration
   ↓
5. Initialize ErrorReportingService
   ↓
6. Set Platform Tags (OS, Version)
   ↓
7. Log "App started" Breadcrumb
   ↓
8. Setup Global Error Handler
   ↓
9. Setup Promise Rejection Handler
   ↓
10. Set isInitialized = true
    ↓
11. Render Application UI
    ↓
12. On Unmount: Cleanup Handlers
```

### Error Handling Architecture

#### Global Error Handler

```typescript
ErrorUtils.setGlobalHandler((error, isFatal) => {
  // 1. Capture to Sentry with context
  errorReporting.captureException(error, {
    isFatal,
    context: 'global_error_handler',
  });

  // 2. Call original handler (preserve default behavior)
  if (originalHandler) {
    originalHandler(error, isFatal);
  }
});
```

**Features:**

- Captures all unhandled JavaScript errors
- Preserves original error handler behavior
- Adds fatal/non-fatal context
- Properly restored on component unmount

#### Promise Rejection Handler

```typescript
window.addEventListener('unhandledrejection', event => {
  errorReporting.captureException(new Error(`Unhandled Promise Rejection: ${event.reason}`), {
    context: 'unhandled_promise_rejection',
  });
});
```

**Features:**

- Captures unhandled promise rejections
- Converts rejection reason to Error object
- Adds specific context for debugging
- Properly cleaned up on unmount

### Layout Architecture

#### Responsive Design

The app implements a responsive layout that adapts to different platforms:

```typescript
const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e', // Dark Halloween theme
    ...(Platform.OS === 'web' && {
      alignItems: 'center', // Center content on web
    }),
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    ...(Platform.OS === 'web' && {
      maxWidth: 600, // Constrain width on web
    }),
  },
});
```

**Platform-Specific Behavior:**

| Platform | Layout     | Max Width | Alignment |
| -------- | ---------- | --------- | --------- |
| iOS      | Full width | None      | Default   |
| Android  | Full width | None      | Default   |
| Web      | Centered   | 600px     | Center    |

#### Visual Hierarchy

```
┌─────────────────────────────────────┐
│ SafeAreaProvider (System Safe Areas)│
│ ┌─────────────────────────────────┐ │
│ │ appContainer (#1a1a2e)          │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ contentWrapper (max 600px)  │ │ │
│ │ │ ┌─────────────────────────┐ │ │ │
│ │ │ │ AppNavigator            │ │ │ │
│ │ │ │ (Navigation Stack)      │ │ │ │
│ │ │ └─────────────────────────┘ │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Environment Validation

The app validates the Sentry environment configuration before initialization:

```typescript
const validEnvironments = ['development', 'staging', 'production'] as const;
const environment = validEnvironments.includes(
  SENTRY_CONFIG.environment as (typeof validEnvironments)[number]
)
  ? (SENTRY_CONFIG.environment as (typeof validEnvironments)[number])
  : 'development'; // Fallback to development
```

**Benefits:**

- Prevents runtime errors from invalid environment values
- Provides safe fallback to development environment
- Type-safe environment handling

### Initialization State Management

The app uses React state to manage initialization:

```typescript
const [isInitialized, setIsInitialized] = useState(false);

// Show nothing while initializing
if (!isInitialized) {
  return null;
}
```

**Why This Matters:**

- Prevents race conditions with error handlers
- Ensures error reporting is ready before app renders
- Provides clean loading state (initialization is fast)
- Avoids flash of content before handlers are ready

### Graceful Degradation

The app implements graceful degradation for error reporting:

```typescript
useEffect(() => {
  try {
    const cleanup = initializeErrorReporting();
    setIsInitialized(true);
    return cleanup;
  } catch (error) {
    // Fallback: App continues even if monitoring fails
    console.error('Failed to initialize error reporting:', error);
    setIsInitialized(true); // Still allow app to run
  }
}, []);
```

**Benefits:**

- App remains functional if Sentry is unavailable
- Errors logged to console for debugging
- User experience not impacted by monitoring failures
- Critical for development and testing environments

### Cleanup and Memory Management

The initialization function returns a cleanup function:

```typescript
return () => {
  // Restore original error handler
  if (originalHandler) {
    ErrorUtils.setGlobalHandler(originalHandler);
  }

  // Remove promise rejection handler
  if (typeof window !== 'undefined' && 'removeEventListener' in window) {
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }
};
```

**Cleanup Ensures:**

- No memory leaks from event listeners
- Original error handlers restored
- Proper behavior during hot reload (development)
- Clean unmount in test environments

## Platform-Specific Considerations

### iOS

- Uses native safe area insets via SafeAreaProvider
- Full-width layout on all device sizes
- Native error handling preserved

### Android

- Uses native safe area insets via SafeAreaProvider
- Full-width layout on all device sizes
- Native error handling preserved

### Web

- Centered layout with 600px max-width
- Responsive design for desktop browsers
- Web-specific error handling for promise rejections
- Maintains mobile-like experience on desktop

## Performance Considerations

### Initialization Performance

- Error reporting initialization is synchronous and fast (<50ms)
- No blocking operations during startup
- Minimal impact on Time to Interactive (TTI)

### Memory Footprint

- Single ErrorReportingService instance (singleton pattern)
- Event listeners properly cleaned up
- No memory leaks from error handlers

### Bundle Size Impact

- Sentry SDK: ~50KB gzipped
- Error reporting service: ~5KB
- Total overhead: ~55KB (acceptable for monitoring)

## Security Considerations

### Data Sanitization

- Health data automatically sanitized from error reports
- PII removed before sending to Sentry
- Only anonymous device IDs included

### Network Security

- All Sentry communication over HTTPS
- TLS 1.3 encryption
- Certificate pinning (production)

### Error Context

- Platform information included for debugging
- No sensitive user data in error context
- Environment tags for filtering

## Testing Considerations

### Unit Testing

- `initializeErrorReporting` extracted for testability
- Can be mocked in component tests
- Cleanup function can be tested independently

### Integration Testing

- Test error capture flow end-to-end
- Verify platform tags are set correctly
- Confirm cleanup restores handlers

### Manual Testing

- Test crash reporting with intentional errors
- Verify Sentry dashboard receives errors
- Confirm health data is sanitized

## Troubleshooting

### Common Issues

**Issue: Errors not appearing in Sentry**

- Check SENTRY_DSN environment variable
- Verify network connectivity
- Check Sentry dashboard for project status
- Confirm initialization completed successfully

**Issue: App crashes on startup**

- Check Sentry configuration in `src/config/sentry.config.ts`
- Verify environment variable format
- Check console for initialization errors

**Issue: Memory leaks in development**

- Ensure cleanup function is being called
- Check for multiple error handler registrations
- Verify hot reload behavior

## Future Enhancements

### Planned Improvements

- [ ] Add performance monitoring for screen transitions
- [ ] Implement custom error boundaries for React components
- [ ] Add offline error queueing
- [ ] Implement error rate limiting
- [ ] Add user feedback mechanism for errors

### Monitoring Enhancements

- [ ] Track app startup time
- [ ] Monitor memory usage trends
- [ ] Track API response times
- [ ] Monitor battery usage impact

## Health Data Architecture

### Multi-Metric Collection (Phase 2)

The application now collects multiple health metrics for comprehensive analysis:

**HealthDataUpdateService Flow**:

```
1. Initialize health data service (platform-specific)
   ↓
2. Fetch step count (required, Phase 1)
   ↓
3. Fetch sleep duration (optional, Phase 2)
   ↓
4. Fetch HRV (optional, Phase 2)
   ↓
5. Package into HealthMetrics object
   ↓
6. Calculate emotional state
   ↓
7. Update stores and trigger UI updates
```

**Graceful Degradation**:

- Sleep and HRV fetching wrapped in try-catch blocks
- Zero values treated as unavailable (set to `undefined`)
- Continues with available metrics if some fail
- Maintains Phase 1 compatibility (step-only tracking)

**Data Structure**:

```typescript
interface HealthMetrics {
  steps: number; // Required (Phase 1)
  sleepHours?: number; // Optional (Phase 2)
  hrv?: number; // Optional (Phase 2)
}
```

For detailed information, see [Phase 2 Multi-Metric Implementation](./phase2-multi-metric-implementation.md).

## Evolution History Page Architecture

### Data Visualization Types

The Evolution History Page uses specialized type definitions for displaying historical health data:

**HistoricalDataPoint**:

```typescript
interface HistoricalDataPoint {
  date: string; // YYYY-MM-DD
  steps: number;
  sleepHours?: number;
  hrv?: number;
  emotionalState: EmotionalState;
  calculationMethod: 'rule-based' | 'ai';
}
```

Used for:

- Timeline visualizations of emotional states
- Line charts showing health metric trends
- Data table displays with daily breakdowns

**HistoryStatistics**:

```typescript
interface HistoryStatistics {
  averageSteps: number;
  averageSleep: number | null;
  averageHRV: number | null;
  mostFrequentState: EmotionalState;
  totalEvolutions: number;
  daysSinceLastEvolution: number;
}
```

Used for:

- Summary cards displaying aggregated metrics
- Time range comparisons (7D, 30D, 90D, All)
- Evolution milestone tracking

### Data Flow

```
StorageService.getHealthDataCache()
   ↓
Transform to HistoricalDataPoint[]
   ↓
Filter by Time Range (7D/30D/90D/All)
   ↓
Calculate HistoryStatistics
   ↓
Render Visualizations
   ├── Summary Cards
   ├── Line Charts
   ├── Timeline
   └── Data Table
```

For detailed information, see [Evolution History Page Design](./.kiro/specs/evolution-history-page/design.md).

## Related Documentation

- [Crash Reporting Setup](./crash-reporting-setup.md)
- [Error Reporting Service](../src/services/ErrorReportingService.ts)
- [Sentry Configuration](../src/config/sentry.config.ts)
- [Testing Guide](./testing-configuration.md)
- [Health Data Integration](./health-data-integration-summary.md)
- [Phase 2 Multi-Metric Implementation](./phase2-multi-metric-implementation.md)
- [Evolution History Page Spec](./.kiro/specs/evolution-history-page/)

## References

- [React Native Error Handling](https://reactnative.dev/docs/error-handling)
- [Sentry React Native SDK](https://docs.sentry.io/platforms/react-native/)
- [Expo Error Handling](https://docs.expo.dev/guides/errors/)
