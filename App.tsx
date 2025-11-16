import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import ErrorReportingService from './src/services/ErrorReportingService';
import { SENTRY_CONFIG } from './src/config/sentry.config';
import { Platform, View, StyleSheet } from 'react-native';

export default function App() {
  useEffect(() => {
    // Initialize error reporting
    const errorReporting = ErrorReportingService.getInstance();
    errorReporting.initialize({
      dsn: SENTRY_CONFIG.dsn,
      environment: SENTRY_CONFIG.environment as 'development' | 'staging' | 'production',
      enableInExpoDevelopment: SENTRY_CONFIG.enableInExpoDevelopment,
      tracesSampleRate: SENTRY_CONFIG.tracesSampleRate,
    });

    // Set platform tag
    errorReporting.setTag('platform', Platform.OS);
    errorReporting.setTag('platform_version', Platform.Version.toString());

    // Log app start
    errorReporting.addBreadcrumb('App started', 'lifecycle', 'info');

    // Setup global error handler
    const originalHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      errorReporting.captureException(error, {
        isFatal,
        context: 'global_error_handler',
      });

      // Call original handler
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });

    // Log unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      errorReporting.captureException(new Error(`Unhandled Promise Rejection: ${event.reason}`), {
        context: 'unhandled_promise_rejection',
      });
    };

    // @ts-expect-error - addEventListener exists in React Native
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
    }

    return () => {
      // Cleanup
      if (typeof window !== 'undefined') {
        // @ts-expect-error - removeEventListener exists in React Native
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      }
    };
  }, []);

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
