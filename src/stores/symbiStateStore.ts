import { create } from 'zustand';
import { EmotionalState, EvolutionRecord } from '../types';
import { StorageService } from '../services/StorageService';

/**
 * Symbi State Store
 *
 * Manages the Symbi creature's state including:
 * - Current emotional state
 * - Evolution level and appearance
 * - Evolution history
 * - State transition animations
 */

interface SymbiStateStore {
  // Symbi state
  emotionalState: EmotionalState;
  evolutionLevel: number;
  customAppearanceUrl: string | null;

  // Evolution tracking
  evolutionRecords: EvolutionRecord[];
  daysInPositiveState: number;

  // Animation state
  isTransitioning: boolean;

  // Actions
  setEmotionalState: (state: EmotionalState) => void;
  transitionToState: (state: EmotionalState, duration?: number) => Promise<void>;
  setEvolutionLevel: (level: number) => void;
  setCustomAppearance: (url: string) => void;
  addEvolutionRecord: (record: EvolutionRecord) => Promise<void>;
  loadEvolutionRecords: () => Promise<void>;
  incrementPositiveDays: () => void;
  resetPositiveDays: () => void;
  reset: () => void;
}

const initialState = {
  emotionalState: EmotionalState.RESTING,
  evolutionLevel: 0,
  customAppearanceUrl: null,
  evolutionRecords: [],
  daysInPositiveState: 0,
  isTransitioning: false,
};

export const useSymbiStateStore = create<SymbiStateStore>((set, get) => ({
  ...initialState,

  setEmotionalState: (state: EmotionalState) => {
    set({ emotionalState: state });
  },

  transitionToState: async (state: EmotionalState, duration: number = 2000) => {
    set({ isTransitioning: true });

    // Simulate transition animation
    await new Promise(resolve => setTimeout(resolve, duration));

    set({
      emotionalState: state,
      isTransitioning: false,
    });
  },

  setEvolutionLevel: (level: number) => {
    set({ evolutionLevel: level });
  },

  setCustomAppearance: (url: string) => {
    set({ customAppearanceUrl: url });
  },

  addEvolutionRecord: async (record: EvolutionRecord) => {
    const { evolutionRecords } = get();
    const updatedRecords = [...evolutionRecords, record];

    await StorageService.addEvolutionRecord(record);

    set({
      evolutionRecords: updatedRecords,
      evolutionLevel: record.evolutionLevel,
      customAppearanceUrl: record.appearanceUrl,
    });
  },

  loadEvolutionRecords: async () => {
    try {
      const records = await StorageService.getEvolutionRecords();

      // Set current evolution level and appearance from latest record
      if (records.length > 0) {
        const latestRecord = records[records.length - 1];
        set({
          evolutionRecords: records,
          evolutionLevel: latestRecord.evolutionLevel,
          customAppearanceUrl: latestRecord.appearanceUrl,
        });
      } else {
        set({ evolutionRecords: records });
      }
    } catch (error) {
      console.error('Error loading evolution records:', error);
    }
  },

  incrementPositiveDays: () => {
    const { daysInPositiveState } = get();
    set({ daysInPositiveState: daysInPositiveState + 1 });
  },

  resetPositiveDays: () => {
    set({ daysInPositiveState: 0 });
  },

  reset: () => {
    set(initialState);
  },
}));
