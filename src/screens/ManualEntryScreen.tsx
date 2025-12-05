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
import { useNavigation } from '@react-navigation/native';
import { useHealthDataStore } from '../stores/healthDataStore';
import { ManualHealthDataService } from '../services/ManualHealthDataService';
import { EmotionalStateCalculator } from '../services/EmotionalStateCalculator';
import { useUserPreferencesStore } from '../stores/userPreferencesStore';

interface ManualEntryScreenProps {
  onComplete?: () => void;
}

export const ManualEntryScreen: React.FC<ManualEntryScreenProps> = ({ onComplete }) => {
  const navigation = useNavigation();
  const [stepCount, setStepCount] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [hrv, setHrv] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { updateHealthData } = useHealthDataStore();
  const { profile } = useUserPreferencesStore();

  const handleSubmit = async () => {
    const steps = parseInt(stepCount, 10);
    const sleep = sleepHours ? parseFloat(sleepHours) : undefined;
    const hrvValue = hrv ? parseFloat(hrv) : undefined;

    // Validate step count
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

    // Validate sleep hours if provided
    if (sleep !== undefined && (isNaN(sleep) || sleep < 0 || sleep > 24)) {
      Alert.alert(
        'Invalid Range',
        'Sleep hours must be between 0 and 24. Please enter a valid value.'
      );
      return;
    }

    // Validate HRV if provided
    if (hrvValue !== undefined && (isNaN(hrvValue) || hrvValue < 0 || hrvValue > 200)) {
      Alert.alert('Invalid Range', 'HRV must be between 0 and 200. Please enter a valid value.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to manual health data service
      const manualService = new ManualHealthDataService();
      const today = new Date();

      // Store the health data
      await manualService.saveStepCount(steps, today);
      if (sleep !== undefined) {
        await manualService.saveSleepDuration(sleep, today);
      }
      if (hrvValue !== undefined) {
        await manualService.saveHRV(hrvValue, today);
      }

      // Calculate emotional state
      const thresholds = profile?.thresholds || {
        sadThreshold: 2000,
        activeThreshold: 8000,
      };
      const emotionalState = EmotionalStateCalculator.calculateStateFromSteps(steps, thresholds);

      // Update the health data store
      await updateHealthData(
        { steps, sleepHours: sleep, hrv: hrvValue },
        emotionalState,
        'rule-based'
      );

      // Clear form and navigate back
      setStepCount('');
      setSleepHours('');
      setHrv('');
      if (onComplete) {
        onComplete();
      }
      // Navigate back to main screen
      navigation.goBack();
    } catch (error) {
      console.error('Error saving health data:', error);
      Alert.alert('Error', 'Failed to save health data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <Text style={styles.title}>Enter Your Health Data</Text>
        <Text style={styles.subtitle}>Track your daily health metrics</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputGroupLabel}>👟 Step Count (Required)</Text>
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
          <Text style={styles.rangeText}>Valid range: 0 - 100,000 steps</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputGroupLabel}>😴 Sleep Duration (Optional)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={sleepHours}
              onChangeText={setSleepHours}
              placeholder="0"
              placeholderTextColor="#6b7280"
              keyboardType="decimal-pad"
              maxLength={4}
              editable={!isSubmitting}
            />
            <Text style={styles.inputLabel}>hours</Text>
          </View>
          <Text style={styles.rangeText}>Valid range: 0 - 24 hours</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputGroupLabel}>❤️ Heart Rate Variability (Optional)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={hrv}
              onChangeText={setHrv}
              placeholder="0"
              placeholderTextColor="#6b7280"
              keyboardType="decimal-pad"
              maxLength={5}
              editable={!isSubmitting}
            />
            <Text style={styles.inputLabel}>ms</Text>
          </View>
          <Text style={styles.rangeText}>Valid range: 0 - 200 ms</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting || !stepCount}>
          <Text style={styles.submitText}>{isSubmitting ? 'Saving...' : 'Save Health Data'}</Text>
        </TouchableOpacity>

        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>💡 Tip</Text>
          <Text style={styles.tipText}>
            Check your phone's built-in health app to find your daily metrics. Most smartphones
            track steps automatically, and some track sleep and HRV too!
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
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 32,
    maxWidth: 600,
    width: '100%',
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
  inputGroup: {
    marginBottom: 24,
  },
  inputGroupLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9333ea',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  input: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#9333ea',
    backgroundColor: '#2d2d44',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 150,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 18,
    color: '#a78bfa',
    marginLeft: 12,
  },
  rangeText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
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
