import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingFlow } from '../screens/onboarding';
import { ManualEntryScreen } from '../screens/ManualEntryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { MainScreen } from '../screens/MainScreen';
import { useUserPreferencesStore } from '../stores/userPreferencesStore';
import { PermissionService } from '../services/PermissionService';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ThresholdConfigScreen } from '../components/ThresholdConfigScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator: React.FC = () => {
  const { profile, isInitialized, initializeProfile, setDataSource } = useUserPreferencesStore();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize user profile
      await initializeProfile();
      
      // Check if this is first launch (no profile exists yet)
      // For now, we'll show onboarding if profile was just created
      // In production, you'd check a separate "hasCompletedOnboarding" flag
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing app:', error);
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async (dataSource: 'healthkit' | 'googlefit' | 'manual') => {
    await setDataSource(dataSource);
    setShowOnboarding(false);
  };

  const handleRequestPermissions = async (): Promise<boolean> => {
    const result = await PermissionService.requestHealthPermissions();
    return result.granted;
  };

  const handleReplayOnboarding = () => {
    setShowOnboarding(true);
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#9333ea" />
        <Text style={styles.loadingText}>Loading Symbi...</Text>
      </View>
    );
  }

  // Show onboarding if requested or if it's first launch
  // For demo purposes, we'll check if dataSource is still default
  const shouldShowOnboarding = showOnboarding || !isInitialized;

  if (shouldShowOnboarding) {
    return (
      <OnboardingFlow
        onComplete={handleOnboardingComplete}
        onRequestPermissions={handleRequestPermissions}
      />
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a1a2e',
          },
          headerTintColor: '#9333ea',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainScreen}
          options={{ title: 'Symbi' }}
        />
        <Stack.Screen
          name="Settings"
          options={{ title: 'Settings' }}
        >
          {(props) => (
            <SettingsScreen
              {...props}
              onReplayOnboarding={handleReplayOnboarding}
              onNavigateToThresholds={() => props.navigation.navigate('Thresholds')}
              onNavigateToManualEntry={() => props.navigation.navigate('ManualEntry')}
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="Thresholds"
          component={ThresholdConfigScreen}
          options={{ title: 'Configure Thresholds' }}
        />
        <Stack.Screen
          name="ManualEntry"
          component={ManualEntryScreen}
          options={{ title: 'Enter Steps' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#a78bfa',
  },
});
