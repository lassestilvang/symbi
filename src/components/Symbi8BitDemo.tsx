import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Symbi8BitCanvas } from './Symbi8BitCanvas';
import { EmotionalState } from '../types';

/**
 * Demo component to showcase the 8-bit Symbi ghost
 */
export const Symbi8BitDemo: React.FC = () => {
  const [currentState, setCurrentState] = useState<EmotionalState>(EmotionalState.RESTING);
  const [pokeCount, setPokeCount] = useState(0);

  const states: EmotionalState[] = [
    EmotionalState.SAD,
    EmotionalState.RESTING,
    EmotionalState.ACTIVE,
    EmotionalState.VIBRANT,
    EmotionalState.CALM,
    EmotionalState.TIRED,
    EmotionalState.STRESSED,
    EmotionalState.ANXIOUS,
    EmotionalState.RESTED,
  ];

  const handlePoke = () => {
    setPokeCount(prev => prev + 1);
    console.log('Ghost poked!', pokeCount + 1);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>8-Bit Symbi Ghost Demo</Text>
      <Text style={styles.subtitle}>Current State: {currentState}</Text>
      <Text style={styles.pokeCounter}>Pokes: {pokeCount}</Text>

      <View style={styles.ghostContainer}>
        <Symbi8BitCanvas emotionalState={currentState} size={300} onPoke={handlePoke} />
      </View>

      <Text style={styles.instruction}>Tap the ghost to poke it!</Text>

      <View style={styles.buttonsContainer}>
        {states.map(state => (
          <TouchableOpacity
            key={state}
            style={[styles.button, currentState === state && styles.buttonActive]}
            onPress={() => setCurrentState(state)}>
            <Text style={styles.buttonText}>{state}</Text>
          </TouchableOpacity>
        ))}
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
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#9333EA',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#a78bfa',
    marginBottom: 4,
  },
  pokeCounter: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  ghostContainer: {
    marginVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instruction: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  button: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4B5563',
  },
  buttonActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#9333EA',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
});
