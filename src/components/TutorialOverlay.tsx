import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { HALLOWEEN_COLORS, TYPOGRAPHY, SHADOWS, TEXT_COLORS } from '../constants/theme';

interface TutorialStep {
  title: string;
  description: string;
  emoji: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Meet Your Symbi!',
    emoji: '👻',
    description: 'This little ghost reflects your daily activity. Keep moving to keep it happy!',
  },
  {
    title: 'Track Your Steps',
    emoji: '👟',
    description: "Your step count determines Symbi's mood. More steps = happier ghost!",
  },
  {
    title: 'Watch It Evolve',
    emoji: '✨',
    description: 'Stay active for multiple days and your Symbi will evolve into new forms!',
  },
  {
    title: 'Interact & Play',
    emoji: '🎃',
    description: 'Tap the sparkle button to trigger fun effects. Customize your Symbi in settings!',
  },
];

interface TutorialOverlayProps {
  visible: boolean;
  onComplete: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ visible, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.emoji}>{step.emoji}</Text>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>

          {/* Progress dots */}
          <View style={styles.dotsContainer}>
            {TUTORIAL_STEPS.map((_, index) => (
              <View key={index} style={[styles.dot, index === currentStep && styles.dotActive]} />
            ))}
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {!isLastStep && (
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>{isLastStep ? 'Get Started!' : 'Next'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: 'rgba(22, 33, 62, 0.95)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    maxWidth: 340,
    width: '100%',
    borderWidth: 2,
    borderColor: HALLOWEEN_COLORS.primary,
    ...SHADOWS.card,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: TYPOGRAPHY.headingSize,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.primaryLight,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: TYPOGRAPHY.bodySize,
    color: TEXT_COLORS.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
  },
  dotActive: {
    backgroundColor: HALLOWEEN_COLORS.primary,
    width: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  skipButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: HALLOWEEN_COLORS.primary,
    alignItems: 'center',
  },
  skipButtonText: {
    color: TEXT_COLORS.secondary,
    fontSize: TYPOGRAPHY.bodySize,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: HALLOWEEN_COLORS.primary,
    alignItems: 'center',
  },
  nextButtonText: {
    color: TEXT_COLORS.primary,
    fontSize: TYPOGRAPHY.bodySize,
    fontWeight: 'bold',
  },
});
