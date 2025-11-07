import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { useUserPreferencesStore } from '../stores/userPreferencesStore';
import { PermissionService } from '../services/PermissionService';

interface SettingsScreenProps {
  onReplayOnboarding: () => void;
  onNavigateToThresholds: () => void;
  onNavigateToManualEntry?: () => void;
  onNavigateToEvolutionGallery?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onReplayOnboarding,
  onNavigateToThresholds,
  onNavigateToManualEntry,
  onNavigateToEvolutionGallery,
}) => {
  const { profile, updatePreferences, setDataSource } = useUserPreferencesStore();
  const [isChangingDataSource, setIsChangingDataSource] = useState(false);

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Loading settings...</Text>
      </View>
    );
  }

  const handleToggleNotifications = async (value: boolean) => {
    await updatePreferences({ notificationsEnabled: value });
  };

  const handleToggleHaptics = async (value: boolean) => {
    await updatePreferences({ hapticFeedbackEnabled: value });
  };

  const handleToggleSound = async (value: boolean) => {
    await updatePreferences({ soundEnabled: value });
  };

  const handleChangeDataSource = async (newSource: 'healthkit' | 'googlefit' | 'manual') => {
    if (newSource === profile.preferences.dataSource) {
      return;
    }

    setIsChangingDataSource(true);

    try {
      if (newSource === 'manual') {
        // Switch to manual mode
        Alert.alert(
          'Switch to Manual Entry',
          'You will need to manually enter your step count each day. Continue?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Switch',
              onPress: async () => {
                await setDataSource('manual');
                Alert.alert('Success', 'Switched to manual entry mode');
              },
            },
          ]
        );
      } else {
        // Request permissions for automatic tracking (Phase 3 includes mindful minutes write)
        const result = await PermissionService.requestPhase3Permissions();
        
        if (result.granted) {
          await setDataSource(result.dataSource);
          Alert.alert('Success', `Connected to ${PermissionService.getPlatformHealthServiceName()}`);
        } else {
          Alert.alert(
            'Permission Denied',
            'Unable to connect to health data. You can try again or use manual entry mode.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error changing data source:', error);
      Alert.alert('Error', 'Failed to change data source. Please try again.');
    } finally {
      setIsChangingDataSource(false);
    }
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'This feature will export all your health data and Symbi history as a JSON file.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            // TODO: Implement data export in future
            Alert.alert('Coming Soon', 'Data export will be available in a future update.');
          },
        },
      ]
    );
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your health data, preferences, and Symbi history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement data deletion
            Alert.alert('Coming Soon', 'Data deletion will be available in a future update.');
          },
        },
      ]
    );
  };

  const handleOpenPrivacyPolicy = () => {
    // TODO: Replace with actual privacy policy URL
    Alert.alert(
      'Privacy Policy',
      'Your privacy is important to us. All health data stays on your device and is never shared with third parties.',
      [{ text: 'OK' }]
    );
  };

  const getDataSourceLabel = () => {
    switch (profile.preferences.dataSource) {
      case 'healthkit':
        return 'Apple Health';
      case 'googlefit':
        return 'Google Fit';
      case 'manual':
        return 'Manual Entry';
      default:
        return 'Unknown';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Settings</Text>

      {/* Data Source Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Source</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Current Source</Text>
            <Text style={styles.settingValue}>{getDataSourceLabel()}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            const platformSource = Platform.OS === 'ios' ? 'healthkit' : 'googlefit';
            handleChangeDataSource(
              profile.preferences.dataSource === 'manual' ? platformSource : 'manual'
            );
          }}
          disabled={isChangingDataSource}
        >
          <Text style={styles.buttonText}>
            {profile.preferences.dataSource === 'manual'
              ? `Connect to ${PermissionService.getPlatformHealthServiceName()}`
              : 'Switch to Manual Entry'}
          </Text>
        </TouchableOpacity>

        {profile.preferences.dataSource === 'manual' && onNavigateToManualEntry && (
          <TouchableOpacity style={styles.linkButton} onPress={onNavigateToManualEntry}>
            <Text style={styles.linkButtonText}>Enter Today's Steps →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Thresholds Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emotional State Thresholds</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Sad Threshold</Text>
            <Text style={styles.settingValue}>{profile.thresholds.sadThreshold} steps</Text>
          </View>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Active Threshold</Text>
            <Text style={styles.settingValue}>{profile.thresholds.activeThreshold} steps</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={onNavigateToThresholds}>
          <Text style={styles.buttonText}>Configure Thresholds</Text>
        </TouchableOpacity>
      </View>

      {/* Evolution Gallery Section */}
      {onNavigateToEvolutionGallery && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evolution History</Text>
          
          <TouchableOpacity style={styles.button} onPress={onNavigateToEvolutionGallery}>
            <Text style={styles.buttonText}>✨ View Evolution Gallery</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Notifications</Text>
          <Switch
            value={profile.preferences.notificationsEnabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: '#4a4a5e', true: '#9333ea' }}
            thumbColor="#ffffff"
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Haptic Feedback</Text>
          <Switch
            value={profile.preferences.hapticFeedbackEnabled}
            onValueChange={handleToggleHaptics}
            trackColor={{ false: '#4a4a5e', true: '#9333ea' }}
            thumbColor="#ffffff"
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Sound Effects</Text>
          <Switch
            value={profile.preferences.soundEnabled}
            onValueChange={handleToggleSound}
            trackColor={{ false: '#4a4a5e', true: '#9333ea' }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      {/* Tutorial Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Help & Tutorial</Text>

        <TouchableOpacity style={styles.button} onPress={onReplayOnboarding}>
          <Text style={styles.buttonText}>Replay Tutorial</Text>
        </TouchableOpacity>
      </View>

      {/* Privacy & Data Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Data</Text>

        <TouchableOpacity style={styles.linkButton} onPress={handleOpenPrivacyPolicy}>
          <Text style={styles.linkButtonText}>Privacy Policy →</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={handleExportData}>
          <Text style={styles.linkButtonText}>Export My Data →</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteData}>
          <Text style={styles.dangerButtonText}>Delete All Data</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Symbi v1.0.0</Text>
        <Text style={styles.footerText}>Made with 💜 for your health</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#9333ea',
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#a78bfa',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2d2d44',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#d8b4fe',
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 14,
    color: '#9333ea',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#9333ea',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  linkButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  linkButtonText: {
    fontSize: 16,
    color: '#a78bfa',
  },
  dangerButton: {
    backgroundColor: '#2d2d44',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#2d2d44',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginTop: 40,
  },
});
