import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface WelcomeScreenProps {
  onNext: () => void;
  onSkip: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext, onSkip }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>👻</Text>
        <Text style={styles.title}>Welcome to Symbi</Text>
        <Text style={styles.subtitle}>Your Biometric Tamagotchi</Text>
        <Text style={styles.description}>
          Meet your new digital companion! Symbi is a cute Halloween ghost that reflects your
          health and activity through its mood and appearance.
        </Text>
        <Text style={styles.description}>
          The more you move and take care of yourself, the happier your Symbi becomes!
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={onNext}>
          <Text style={styles.nextText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#9333ea',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#a78bfa',
    marginBottom: 32,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#d8b4fe',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
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
