import { useState, useCallback, useEffect } from 'react';
import { useHealthDataStore } from '../stores/healthDataStore';
import { useSymbiStateStore } from '../stores/symbiStateStore';
import {
  EvolutionSystem,
  EvolutionEligibility,
  EvolutionResult,
  AIBrainService,
} from '../services';

/**
 * Custom hook for evolution progress management
 *
 * Extracts evolution-related logic from MainScreen
 * to improve code organization and testability.
 */

interface UseEvolutionProgressResult {
  evolutionEligibility: EvolutionEligibility | null;
  showEvolutionNotification: boolean;
  isEvolutionInProgress: boolean;
  showEvolutionCelebration: boolean;
  evolutionResult: EvolutionResult | null;
  handleTriggerEvolution: () => Promise<void>;
  handleEvolutionCelebrationClose: () => void;
  checkEvolutionProgress: () => Promise<void>;
}

interface UseEvolutionProgressOptions {
  onError?: (message: string) => void;
}

export const useEvolutionProgress = (
  options: UseEvolutionProgressOptions = {}
): UseEvolutionProgressResult => {
  const { onError } = options;
  const [evolutionEligibility, setEvolutionEligibility] = useState<EvolutionEligibility | null>(
    null
  );
  const [showEvolutionNotification, setShowEvolutionNotification] = useState(false);
  const [isEvolutionInProgress, setIsEvolutionInProgress] = useState(false);
  const [showEvolutionCelebration, setShowEvolutionCelebration] = useState(false);
  const [evolutionResult, setEvolutionResult] = useState<EvolutionResult | null>(null);

  const { emotionalState } = useHealthDataStore();

  const checkEvolutionProgress = useCallback(async () => {
    try {
      const eligibility = await EvolutionSystem.checkEvolutionEligibility();
      setEvolutionEligibility(eligibility);

      if (eligibility.eligible && !showEvolutionNotification) {
        setShowEvolutionNotification(true);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error checking evolution progress:', error);
      }
    }
  }, [showEvolutionNotification]);

  const handleTriggerEvolution = useCallback(async () => {
    try {
      setIsEvolutionInProgress(true);

      // Get API key from secure storage in production
      const apiKey = (process.env.GEMINI_API_KEY as string) || '';
      if (!apiKey) {
        onError?.('API key not configured for evolution');
        setIsEvolutionInProgress(false);
        return;
      }

      const aiService = new AIBrainService(apiKey);
      const result = await EvolutionSystem.triggerEvolution(aiService);

      if (result.success) {
        useSymbiStateStore.getState().setEvolutionLevel(result.evolutionLevel);
        useSymbiStateStore.getState().setCustomAppearance(result.newAppearanceUrl);

        setEvolutionResult(result);
        setShowEvolutionCelebration(true);
        setShowEvolutionNotification(false);

        await checkEvolutionProgress();
      } else {
        onError?.('Evolution failed. Please try again later.');
      }

      setIsEvolutionInProgress(false);
    } catch (error) {
      if (__DEV__) {
        console.error('Error triggering evolution:', error);
      }
      onError?.('Failed to trigger evolution. Please try again.');
      setIsEvolutionInProgress(false);
    }
  }, [checkEvolutionProgress, onError]);

  const handleEvolutionCelebrationClose = useCallback(() => {
    setShowEvolutionCelebration(false);
    setEvolutionResult(null);
  }, []);

  // Track daily emotional state
  useEffect(() => {
    if (emotionalState) {
      EvolutionSystem.trackDailyState(emotionalState).catch(err => {
        if (__DEV__) {
          console.error('Error tracking daily state:', err);
        }
      });
    }
  }, [emotionalState]);

  return {
    evolutionEligibility,
    showEvolutionNotification,
    isEvolutionInProgress,
    showEvolutionCelebration,
    evolutionResult,
    handleTriggerEvolution,
    handleEvolutionCelebrationClose,
    checkEvolutionProgress,
  };
};
