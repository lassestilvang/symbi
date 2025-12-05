import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { useUserPreferencesStore } from '../stores/userPreferencesStore';
import { PermissionService } from '../services/PermissionService';
import { DataManagementService } from '../services/DataManagementService';
import { AnalyticsService } from '../services/AnalyticsService';
import { SceneSelector } from '../components/habitat';
import { loadScenePreference } from '../services/HabitatPreferencesService';
import type { SceneType } from '../types/habitat';
import { SCENE_REGISTRY } from '../constants/habitatScenes';

interface SettingsScreenProps {
  navigation?: {
    goBack: () => void;
  };
  onReplayOnboarding: () => void;
  onNavigateToThresholds: () => void;
  onNavigateToManualEntry?: () => void;
  onNavigateToEvolutionGallery?: () => void;
  onNavigateToAccount?: () => void;
  onNavigateToPrivacyPolicy?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  navigation,
  onReplayOnboarding,
  onNavigateToThresholds,
  onNavigateToManualEntry,
  onNavigateToEvolutionGallery,
  onNavigateToAccount,
  onNavigateToPrivacyPolicy,
}) => {
  const { profile, updatePreferences, setDataSource } = useUserPreferencesStore();
  const [isChangingDataSource, setIsChangingDataSource] = useState(false);
  const [currentScene, setCurrentScene] = useState<SceneType>('haunted-forest');

  // Load current scene preference on mount
  useEffect(() => {
    loadScenePreference().then(setCurrentScene);
  }, []);

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

  const handleToggleAnalytics = async (value: boolean) => {
    await updatePreferences({ analyticsEnabled: value });

    if (value) {
      await AnalyticsService.enableAnalytics();
    } else {
      await AnalyticsService.disableAnalytics();
    }
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
          Alert.alert(
            'Success',
            `Connected to ${PermissionService.getPlatformHealthServiceName()}`
          );
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

  const handleExportData = async () => {
    const success = await DataManagementService.shareExportedData();
    if (success) {
      Alert.alert('Success', 'Data exported successfully!');
    }
  };

  const handleDeleteData = () => {
    DataManagementService.showDeleteDataConfirmation(async () => {
      const result = await DataManagementService.deleteAllLocalData();
      if (result.success) {
        Alert.alert('Data Deleted', `Successfully deleted:\n${result.deletedItems.join('\n')}`, [
          { text: 'OK' },
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to delete data. Please try again.');
      }
    });
  };

  const handleOpenPrivacyPolicy = () => {
    if (onNavigateToPrivacyPolicy) {
      onNavigateToPrivacyPolicy();
    } else {
      Alert.alert(
        'Privacy Policy',
        'Your privacy is important to us. All health data stays on your device and is never shared with third parties.',
        [{ text: 'OK' }]
      );
    }
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
      <View style={styles.contentWrapper}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Settings</Text>
          {navigation && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => navigation.goBack()}
              accessibilityLabel="Close settings"
              accessibilityRole="button">
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

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
            disabled={isChangingDataSource}>
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

        {/* Habitat Scene Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Habitat Scene</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Current Scene</Text>
              <Text style={styles.settingValue}>{SCENE_REGISTRY[currentScene]?.name}</Text>
            </View>
          </View>

          <View style={styles.sceneSelectorContainer}>
            <SceneSelector
              initialScene={currentScene}
              onSceneChange={scene => setCurrentScene(scene)}
            />
          </View>
        </View>

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

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Anonymous Analytics</Text>
              <Text style={styles.settingDescription}>
                Help improve Symbi by sharing anonymous usage data. No health data is collected.
              </Text>
            </View>
            <Switch
              value={profile.preferences.analyticsEnabled}
              onValueChange={handleToggleAnalytics}
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

        {/* Cloud Sync Section */}
        {onNavigateToAccount && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cloud Sync</Text>

            <TouchableOpacity style={styles.button} onPress={onNavigateToAccount}>
              <Text style={styles.buttonText}>☁️ Manage Cloud Sync</Text>
            </TouchableOpacity>
          </View>
        )}

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
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 600,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#9333ea',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2d2d44',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#9333ea',
    fontWeight: 'bold',
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
  settingDescription: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    lineHeight: 16,
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
  sceneSelectorContainer: {
    marginTop: 12,
    backgroundColor: '#2d2d44',
    padding: 16,
    borderRadius: 12,
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
