import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import ErrorReportingService from './src/services/ErrorReportingService';
import { SENTRY_CONFIG } from './src/config/sentry.config';
import { Platform, View, StyleSheet } from 'react-native';

/**
 * Initialize error reporting and global error handlers
 * Extracted from component for better separation of concerns and testability
 */
const initializeErrorReporting = (): (() => void) => {
  const errorReporting = ErrorReportingService.getInstance();

  // Validate environment before initialization to prevent runtime errors
  const validEnvironments = ['development', 'staging', 'production'] as const;
  const environment = validEnvironments.includes(
    SENTRY_CONFIG.environment as (typeof validEnvironments)[number]
  )
    ? (SENTRY_CONFIG.environment as (typeof validEnvironments)[number])
    : 'development';

  errorReporting.initialize({
    dsn: SENTRY_CONFIG.dsn,
    environment,
    enableInExpoDevelopment: SENTRY_CONFIG.enableInExpoDevelopment,
    tracesSampleRate: SENTRY_CONFIG.tracesSampleRate,
  });

  // Set platform tags for better error context
  errorReporting.setTag('platform', Platform.OS);
  errorReporting.setTag('platform_version', Platform.Version.toString());

  // Log app start
  errorReporting.addBreadcrumb('App started', 'lifecycle', 'info');

  // Setup global error handler with proper cleanup tracking
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    errorReporting.captureException(error, {
      isFatal,
      context: 'global_error_handler',
    });

    // Call original handler to maintain default behavior
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });

  // Handle unhandled promise rejections
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    errorReporting.captureException(new Error(`Unhandled Promise Rejection: ${event.reason}`), {
      context: 'unhandled_promise_rejection',
    });
  };

  // Setup promise rejection handler with proper typing
  if (typeof window !== 'undefined' && 'addEventListener' in window) {
    (window as unknown as EventTarget).addEventListener(
      'unhandledrejection',
      handleUnhandledRejection as EventListener
    );
  }

  // Return cleanup function to properly restore handlers
  return () => {
    // Restore original error handler
    if (originalHandler) {
      ErrorUtils.setGlobalHandler(originalHandler);
    }

    // Remove promise rejection handler
    if (typeof window !== 'undefined' && 'removeEventListener' in window) {
      (window as unknown as EventTarget).removeEventListener(
        'unhandledrejection',
        handleUnhandledRejection as EventListener
      );
    }
  };
};

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const cleanup = initializeErrorReporting();
      setIsInitialized(true);
      return cleanup;
    } catch (error) {
      // Fallback if error reporting fails to initialize
      // App should continue to function even if monitoring fails
      console.error('Failed to initialize error reporting:', error);
      setIsInitialized(true);
    }
  }, []);

  // Show nothing while initializing (initialization is typically fast)
  // This prevents any potential race conditions with error handlers
  if (!isInitialized) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View style={styles.appContainer}>
        <View style={styles.contentWrapper}>
          <AppNavigator />
        </View>
      </View>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    ...(Platform.OS === 'web' && {
      alignItems: 'center',
    }),
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    ...(Platform.OS === 'web' && {
      maxWidth: 600,
    }),
  },
});
