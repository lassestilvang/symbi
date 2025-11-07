import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface ManualEntryExplanationScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export const ManualEntryExplanationScreen: React.FC<ManualEntryExplanationScreenProps> = ({
  onComplete,
  onBack,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Manual Entry Mode</Text>
        <Text style={styles.subtitle}>Track your activity your way</Text>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>✍️</Text>
          <Text style={styles.featureTitle}>Daily Input</Text>
          <Text style={styles.featureDescription}>
            Enter your step count each day to update Symbi's mood
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🔒</Text>
          <Text style={styles.featureTitle}>Complete Privacy</Text>
          <Text style={styles.featureDescription}>
            Your data stays entirely on your device with no external connections
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🔄</Text>
          <Text style={styles.featureTitle}>Switch Anytime</Text>
          <Text style={styles.featureDescription}>
            You can enable automatic health data tracking later in settings
          </Text>
        </View>

        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>💡 Tip</Text>
          <Text style={styles.tipText}>
            Most smartphones have a built-in step counter. Check your phone's health app to find
            your daily step count!
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.completeButton} onPress={onComplete}>
          <Text style={styles.completeText}>Start Using Symbi</Text>
        </TouchableOpacity>
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
  featureCard: {
    backgroundColor: '#2d2d44',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9333ea',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#d8b4fe',
    textAlign: 'center',
    lineHeight: 20,
  },
  tipBox: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f59e0b',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#d8b4fe',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backText: {
    fontSize: 16,
    color: '#a78bfa',
  },
  completeButton: {
    backgroundColor: '#9333ea',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  completeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
