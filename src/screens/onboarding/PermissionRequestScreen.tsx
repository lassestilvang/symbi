import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';

interface PermissionRequestScreenProps {
  onRequestPermissions: () => void;
  onUseManualEntry: () => void;
  onBack: () => void;
  onViewPrivacyPolicy?: () => void;
}

export const PermissionRequestScreen: React.FC<PermissionRequestScreenProps> = ({
  onRequestPermissions,
  onUseManualEntry,
  onBack,
  onViewPrivacyPolicy,
}) => {
  const platformName = Platform.OS === 'ios' ? 'Apple Health' : 'Google Fit';

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Connect Your Health Data</Text>
        <Text style={styles.subtitle}>
          To bring Symbi to life, we need access to your health data
        </Text>

        <View style={styles.permissionCard}>
          <Text style={styles.permissionIcon}>👟</Text>
          <Text style={styles.permissionTitle}>Step Count</Text>
          <Text style={styles.permissionDescription}>
            We use your daily step count to determine Symbi's emotional state. More steps mean a
            happier Symbi!
          </Text>
        </View>

        <View style={styles.permissionCard}>
          <Text style={styles.permissionIcon}>😴</Text>
          <Text style={styles.permissionTitle}>Sleep Data</Text>
          <Text style={styles.permissionDescription}>
            We use your sleep data to know if your Symbi is well-rested and energized.
          </Text>
        </View>

        <View style={styles.permissionCard}>
          <Text style={styles.permissionIcon}>❤️</Text>
          <Text style={styles.permissionTitle}>Heart Rate Variability</Text>
          <Text style={styles.permissionDescription}>
            We use your heart rate variability to understand your stress levels and overall wellbeing.
          </Text>
        </View>

        <View style={styles.permissionCard}>
          <Text style={styles.permissionIcon}>🧘</Text>
          <Text style={styles.permissionTitle}>Mindful Minutes (Write)</Text>
          <Text style={styles.permissionDescription}>
            When you complete breathing exercises with Symbi, we'll record mindful minutes to your health data.
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>🔒 Your Privacy Matters</Text>
          <Text style={styles.infoText}>
            • Your health data stays on your device{'\n'}
            • We never share your data with third parties{'\n'}
            • You can disconnect at any time{'\n'}
            • Only daily summaries are used, not minute-by-minute data
          </Text>
        </View>

        <Text style={styles.platformNote}>
          This will open {platformName} to request permissions
        </Text>

        {onViewPrivacyPolicy && (
          <TouchableOpacity style={styles.privacyLink} onPress={onViewPrivacyPolicy}>
            <Text style={styles.privacyLinkText}>📄 View Privacy Policy</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.manualButton} onPress={onUseManualEntry}>
            <Text style={styles.manualText}>Manual Entry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.connectButton} onPress={onRequestPermissions}>
            <Text style={styles.connectText}>Connect {platformName}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#9333ea',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#a78bfa',
    marginBottom: 32,
    textAlign: 'center',
  },
  permissionCard: {
    backgroundColor: '#2d2d44',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  permissionIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#9333ea',
    marginBottom: 12,
  },
  permissionDescription: {
    fontSize: 14,
    color: '#d8b4fe',
    textAlign: 'center',
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#9333ea',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9333ea',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#d8b4fe',
    lineHeight: 22,
  },
  platformNote: {
    fontSize: 12,
    color: '#a78bfa',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  privacyLink: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  privacyLinkText: {
    fontSize: 14,
    color: '#9333ea',
    textDecorationLine: 'underline',
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: '#a78bfa',
  },
  buttonGroup: {
    gap: 12,
  },
  manualButton: {
    backgroundColor: '#2d2d44',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#9333ea',
    alignItems: 'center',
  },
  manualText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9333ea',
  },
  connectButton: {
    backgroundColor: '#9333ea',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  connectText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
