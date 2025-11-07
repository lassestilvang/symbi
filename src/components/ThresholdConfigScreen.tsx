import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useUserPreferencesStore } from '../stores/userPreferencesStore';
import { StepThresholds } from '../types';

/**
 * ThresholdConfigScreen
 * 
 * UI component for configuring step count thresholds that determine
 * the Symbi's emotional state transitions.
 * 
 * Requirements: 3.2, 3.3, 3.4, 3.5
 */
export const ThresholdConfigScreen: React.FC = () => {
  const { profile, updateThresholds } = useUserPreferencesStore();
  
  const [sadThreshold, setSadThreshold] = useState<string>('');
  const [activeThreshold, setActiveThreshold] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Load current thresholds on mount
  useEffect(() => {
    if (profile?.thresholds) {
      setSadThreshold(profile.thresholds.sadThreshold.toString());
      setActiveThreshold(profile.thresholds.activeThreshold.toString());
    }
  }, [profile]);

  /**
   * Validate threshold values
   * - Both must be positive numbers
   * - sadThreshold must be less than activeThreshold
   */
  const validateThresholds = (sad: number, active: number): string | null => {
    if (isNaN(sad) || isNaN(active)) {
      return 'Please enter valid numbers for both thresholds';
    }

    if (sad < 0 || active < 0) {
      return 'Thresholds must be positive numbers';
    }

    if (sad >= active) {
      return 'Sad threshold must be less than Active threshold';
    }

    return null;
  };

  /**
   * Handle save button press
   * Validates and saves thresholds to storage
   */
  const handleSave = async () => {
    const sad = parseInt(sadThreshold, 10);
    const active = parseInt(activeThreshold, 10);

    // Validate
    const error = validateThresholds(sad, active);
    if (error) {
      Alert.alert('Invalid Thresholds', error);
      return;
    }

    // Save to store (which persists to AsyncStorage)
    setIsSaving(true);
    try {
      const newThresholds: StepThresholds = {
        sadThreshold: sad,
        activeThreshold: active,
      };
      
      await updateThresholds(newThresholds);
      
      Alert.alert(
        'Success',
        'Thresholds updated successfully! Your Symbi will now use these values.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save thresholds. Please try again.');
      console.error('Error saving thresholds:', error);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Reset to default thresholds
   */
  const handleReset = () => {
    Alert.alert(
      'Reset to Defaults',
      'Reset thresholds to default values (2000 for Sad, 8000 for Active)?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSadThreshold('2000');
            setActiveThreshold('8000');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Configure Thresholds</Text>
        <Text style={styles.description}>
          Set the step count boundaries that determine your Symbi's emotional state.
        </Text>

        {/* Sad Threshold Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Sad Threshold</Text>
          <Text style={styles.hint}>
            Steps below this value will make your Symbi sad
          </Text>
          <TextInput
            style={styles.input}
            value={sadThreshold}
            onChangeText={setSadThreshold}
            keyboardType="number-pad"
            placeholder="2000"
            placeholderTextColor="#999"
          />
        </View>

        {/* Active Threshold Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Active Threshold</Text>
          <Text style={styles.hint}>
            Steps above this value will make your Symbi active
          </Text>
          <TextInput
            style={styles.input}
            value={activeThreshold}
            onChangeText={setActiveThreshold}
            keyboardType="number-pad"
            placeholder="8000"
            placeholderTextColor="#999"
          />
        </View>

        {/* State Preview */}
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>State Preview:</Text>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>0 - {sadThreshold || '?'} steps:</Text>
            <Text style={[styles.previewState, styles.sadState]}>SAD</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>
              {sadThreshold || '?'} - {activeThreshold || '?'} steps:
            </Text>
            <Text style={[styles.previewState, styles.restingState]}>RESTING</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>{activeThreshold || '?'}+ steps:</Text>
            <Text style={[styles.previewState, styles.activeState]}>ACTIVE</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={handleReset}
            disabled={isSaving}
          >
            <Text style={styles.resetButtonText}>Reset to Defaults</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton, isSaving && styles.disabledButton]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save Thresholds'}
            </Text>
          </TouchableOpacity>
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
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 30,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 5,
  },
  hint: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#2a2a3e',
    borderRadius: 10,
    padding: 15,
    fontSize: 18,
    color: '#fff',
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  previewContainer: {
    backgroundColor: '#2a2a3e',
    borderRadius: 10,
    padding: 20,
    marginTop: 10,
    marginBottom: 30,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  previewLabel: {
    fontSize: 14,
    color: '#aaa',
  },
  previewState: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 5,
  },
  sadState: {
    color: '#5B21B6',
    backgroundColor: '#5B21B633',
  },
  restingState: {
    color: '#7C3AED',
    backgroundColor: '#7C3AED33',
  },
  activeState: {
    color: '#9333EA',
    backgroundColor: '#9333EA33',
  },
  buttonContainer: {
    gap: 15,
  },
  button: {
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#2a2a3e',
    borderWidth: 2,
    borderColor: '#555',
  },
  resetButtonText: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#7C3AED',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
