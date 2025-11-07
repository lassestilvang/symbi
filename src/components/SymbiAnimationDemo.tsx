import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SymbiAnimation } from './SymbiAnimation';
import { EmotionalState } from '../types';

/**
 * SymbiAnimationDemo Component
 *
 * Demo component showing how to use SymbiAnimation with state transitions.
 * This can be used for testing and demonstration purposes.
 */

export const SymbiAnimationDemo: React.FC = () => {
  const [emotionalState, setEmotionalState] = useState<EmotionalState>(EmotionalState.RESTING);

  const states = [
    { state: EmotionalState.SAD, label: 'Sad' },
    { state: EmotionalState.RESTING, label: 'Resting' },
    { state: EmotionalState.ACTIVE, label: 'Active' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Symbi Animation Demo</Text>

      <View style={styles.animationContainer}>
        <SymbiAnimation emotionalState={emotionalState} style={styles.animation} />
      </View>

      <Text style={styles.currentState}>Current State: {emotionalState.toUpperCase()}</Text>

      <View style={styles.buttonContainer}>
        {states.map(({ state, label }) => (
          <TouchableOpacity
            key={state}
            style={[styles.button, emotionalState === state && styles.buttonActive]}
            onPress={() => setEmotionalState(state)}>
            <Text style={styles.buttonText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9333EA',
    marginBottom: 20,
  },
  animationContainer: {
    width: 300,
    height: 300,
    marginVertical: 20,
  },
  animation: {
    width: 300,
    height: 300,
  },
  currentState: {
    fontSize: 18,
    color: '#7C3AED',
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  button: {
    backgroundColor: '#4a4a6a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#7C3AED',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
