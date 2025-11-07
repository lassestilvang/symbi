import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useHealthDataStore } from '../stores/healthDataStore';
import { ManualHealthDataService } from '../services/ManualHealthDataService';
import { EmotionalStateCalculator } from '../services/EmotionalStateCalculator';
import { useUserPreferencesStore } from '../stores/userPreferencesStore';

interface ManualEntryScreenProps {
  onComplete?: () => void;
}

export const ManualEntryScreen: React.FC<ManualEntryScreenProps> = ({ onComplete }) => {
  const [stepCount, setStepCount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { updateHealthData } = useHealthDataStore();
  const { profile } = useUserPreferencesStore();

  const handleSubmit = async () => {
    const steps = parseInt(stepCount, 10);

    // Validate input
    if (isNaN(steps)) {
      Alert.alert('Invalid Input', 'Please enter a valid number for step count.');
      return;
    }

    if (steps < 0 || steps > 100000) {
      Alert.alert(
        'Invalid Range',
        'Step count must be between 0 and 100,000. Please enter a valid value.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to manual health data service
      const manualService = new ManualHealthDataService();
      const today = new Date();

      // Store the step count
      await manualService.saveStepCount(steps, today);

      // Calculate emotional state
      const thresholds = profile?.thresholds || {
        sadThreshold: 2000,
        activeThreshold: 8000,
      };
      const emotionalState = EmotionalStateCalculator.calculateStateFromSteps(steps, thresholds);

      // Update the health data store
      await updateHealthData({ steps }, emotionalState, 'rule-based');

      Alert.alert('Success', 'Your step count has been saved!', [
        {
          text: 'OK',
          onPress: () => {
            setStepCount('');
            if (onComplete) {
              onComplete();
            }
          },
        },
      ]);
    } catch (error) {
      console.error('Error saving step count:', error);
      Alert.alert('Error', 'Failed to save step count. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Enter Your Steps</Text>
        <Text style={styles.subtitle}>How many steps did you take today?</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={stepCount}
            onChangeText={setStepCount}
            placeholder="0"
            placeholderTextColor="#6b7280"
            keyboardType="number-pad"
            maxLength={6}
            editable={!isSubmitting}
          />
          <Text style={styles.inputLabel}>steps</Text>
        </View>

        <View style={styles.rangeInfo}>
          <Text style={styles.rangeText}>Valid range: 0 - 100,000 steps</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting || !stepCount}
        >
          <Text style={styles.submitText}>
            {isSubmitting ? 'Saving...' : 'Save Step Count'}
          </Text>
        </TouchableOpacity>

        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>💡 Tip</Text>
          <Text style={styles.tipText}>
            Check your phone's built-in health app to find your daily step count. Most smartphones
            track steps automatically!
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flex: 1,
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
    marginBottom: 48,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  input: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#9333ea',
    backgroundColor: '#2d2d44',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    minWidth: 200,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 20,
    color: '#a78bfa',
    marginLeft: 12,
  },
  rangeInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  rangeText: {
    fontSize: 14,
    color: '#6b7280',
  },
  submitButton: {
    backgroundColor: '#9333ea',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#4a4a5e',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  tipBox: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 20,
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
});
