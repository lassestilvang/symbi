import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface HealthDataExplanationScreenProps {
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
}

export const HealthDataExplanationScreen: React.FC<HealthDataExplanationScreenProps> = ({
  onNext,
  onSkip,
  onBack,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>How Symbi Works</Text>
        <Text style={styles.subtitle}>Your health data brings Symbi to life</Text>

        <View style={styles.stateCard}>
          <Text style={styles.stateEmoji}>😢</Text>
          <Text style={styles.stateName}>Sad</Text>
          <Text style={styles.stateDescription}>
            When you haven't been very active, Symbi feels down and needs your help
          </Text>
        </View>

        <View style={styles.stateCard}>
          <Text style={styles.stateEmoji}>😌</Text>
          <Text style={styles.stateName}>Resting</Text>
          <Text style={styles.stateDescription}>
            With moderate activity, Symbi is content and peaceful
          </Text>
        </View>

        <View style={styles.stateCard}>
          <Text style={styles.stateEmoji}>🤩</Text>
          <Text style={styles.stateName}>Active</Text>
          <Text style={styles.stateDescription}>
            When you're moving and staying healthy, Symbi is energetic and happy!
          </Text>
        </View>

        <Text style={styles.infoText}>
          Symbi uses your daily step count, sleep quality, and heart rate variability to determine 
          its emotional state. The healthier your habits, the happier your Symbi becomes!
        </Text>

        <View style={styles.phase2Info}>
          <Text style={styles.phase2Title}>✨ Enhanced with AI</Text>
          <Text style={styles.phase2Text}>
            With multiple health metrics, Symbi can show more nuanced emotions like Vibrant, Calm, 
            Tired, Stressed, Anxious, and Rested.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={onNext}>
          <Text style={styles.nextText}>Continue</Text>
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
  stateCard: {
    backgroundColor: '#2d2d44',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  stateEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  stateName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#9333ea',
    marginBottom: 8,
  },
  stateDescription: {
    fontSize: 14,
    color: '#d8b4fe',
    textAlign: 'center',
    lineHeight: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#a78bfa',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 16,
  },
  phase2Info: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#9333ea',
  },
  phase2Title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9333ea',
    marginBottom: 8,
    textAlign: 'center',
  },
  phase2Text: {
    fontSize: 13,
    color: '#d8b4fe',
    textAlign: 'center',
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
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    color: '#a78bfa',
  },
  nextButton: {
    backgroundColor: '#9333ea',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
