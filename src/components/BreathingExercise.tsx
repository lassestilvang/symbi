import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Vibration,
} from 'react-native';
import { InteractiveSessionManager, SessionType, SessionResult } from '../services';

/**
 * BreathingPhase represents the current phase of the breathing cycle
 */
enum BreathingPhase {
  INHALE = 'inhale',
  HOLD = 'hold',
  EXHALE = 'exhale',
}

interface BreathingExerciseProps {
  sessionManager: InteractiveSessionManager;
  duration: number; // in minutes
  onComplete: (result: SessionResult) => void;
  onCancel: () => void;
}

/**
 * BreathingExercise component implements a 4-7-8 breathing pattern
 * with animated circle and haptic feedback
 * 
 * Pattern: 4s inhale, 7s hold, 8s exhale
 * Requirements: 7.2, 7.3
 */
export const BreathingExercise: React.FC<BreathingExerciseProps> = ({
  sessionManager,
  duration,
  onComplete,
  onCancel,
}) => {
  const [phase, setPhase] = useState<BreathingPhase>(BreathingPhase.INHALE);
  const [isPaused, setIsPaused] = useState(false);
  const [remainingTime, setRemainingTime] = useState(duration * 60); // Convert to seconds
  const [cycleCount, setCycleCount] = useState(0);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  // Timers
  const phaseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Breathing pattern durations (in milliseconds)
  const INHALE_DURATION = 4000;
  const HOLD_DURATION = 7000;
  const EXHALE_DURATION = 8000;

  /**
   * Start the breathing animation for the current phase
   */
  const startPhaseAnimation = (currentPhase: BreathingPhase) => {
    switch (currentPhase) {
      case BreathingPhase.INHALE:
        // Expand circle
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.5,
            duration: INHALE_DURATION,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: INHALE_DURATION,
            useNativeDriver: true,
          }),
        ]).start();
        break;

      case BreathingPhase.HOLD:
        // Keep circle at current size
        // No animation needed
        break;

      case BreathingPhase.EXHALE:
        // Contract circle
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.5,
            duration: EXHALE_DURATION,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.6,
            duration: EXHALE_DURATION,
            useNativeDriver: true,
          }),
        ]).start();
        break;
    }
  };

  /**
   * Trigger haptic feedback on phase transitions
   */
  const triggerHaptic = () => {
    // Light vibration pattern
    Vibration.vibrate(100);
  };

  /**
   * Move to the next breathing phase
   */
  const nextPhase = () => {
    setPhase((currentPhase) => {
      let nextPhase: BreathingPhase;
      let phaseDuration: number;

      switch (currentPhase) {
        case BreathingPhase.INHALE:
          nextPhase = BreathingPhase.HOLD;
          phaseDuration = HOLD_DURATION;
          break;
        case BreathingPhase.HOLD:
          nextPhase = BreathingPhase.EXHALE;
          phaseDuration = EXHALE_DURATION;
          break;
        case BreathingPhase.EXHALE:
          nextPhase = BreathingPhase.INHALE;
          phaseDuration = INHALE_DURATION;
          setCycleCount((count) => count + 1);
          break;
      }

      // Trigger haptic feedback on phase change
      triggerHaptic();

      // Start animation for next phase
      startPhaseAnimation(nextPhase);

      // Schedule next phase transition
      phaseTimerRef.current = setTimeout(() => {
        if (!isPaused) {
          nextPhase();
        }
      }, phaseDuration);

      return nextPhase;
    });
  };

  /**
   * Initialize the breathing exercise
   */
  useEffect(() => {
    // Start the first phase animation
    startPhaseAnimation(BreathingPhase.INHALE);

    // Schedule first phase transition
    phaseTimerRef.current = setTimeout(() => {
      nextPhase();
    }, INHALE_DURATION);

    // Start countdown timer
    countdownTimerRef.current = setInterval(() => {
      setRemainingTime((time) => {
        if (time <= 1) {
          handleComplete();
          return 0;
        }
        return time - 1;
      });
    }, 1000);

    // Cleanup on unmount
    return () => {
      if (phaseTimerRef.current) {
        clearTimeout(phaseTimerRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  /**
   * Handle pause/resume
   */
  useEffect(() => {
    if (isPaused) {
      // Pause timers
      if (phaseTimerRef.current) {
        clearTimeout(phaseTimerRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
      sessionManager.pauseSession();
    } else {
      // Resume timers
      const phaseDuration = getPhaseDuration(phase);
      phaseTimerRef.current = setTimeout(() => {
        nextPhase();
      }, phaseDuration);

      countdownTimerRef.current = setInterval(() => {
        setRemainingTime((time) => {
          if (time <= 1) {
            handleComplete();
            return 0;
          }
          return time - 1;
        });
      }, 1000);

      sessionManager.resumeSession();
    }
  }, [isPaused]);

  /**
   * Get duration for current phase
   */
  const getPhaseDuration = (currentPhase: BreathingPhase): number => {
    switch (currentPhase) {
      case BreathingPhase.INHALE:
        return INHALE_DURATION;
      case BreathingPhase.HOLD:
        return HOLD_DURATION;
      case BreathingPhase.EXHALE:
        return EXHALE_DURATION;
    }
  };

  /**
   * Handle session completion
   */
  const handleComplete = async () => {
    try {
      const result = await sessionManager.completeSession();
      onComplete(result);
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  /**
   * Handle session cancellation
   */
  const handleCancel = () => {
    sessionManager.cancelSession();
    onCancel();
  };

  /**
   * Toggle pause state
   */
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  /**
   * Format time as MM:SS
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Get instruction text for current phase
   */
  const getPhaseInstruction = (): string => {
    switch (phase) {
      case BreathingPhase.INHALE:
        return 'Breathe In';
      case BreathingPhase.HOLD:
        return 'Hold';
      case BreathingPhase.EXHALE:
        return 'Breathe Out';
    }
  };

  return (
    <View style={styles.container}>
      {/* Timer Display */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(remainingTime)}</Text>
        <Text style={styles.cycleText}>Cycle {cycleCount + 1}</Text>
      </View>

      {/* Breathing Circle */}
      <View style={styles.circleContainer}>
        <Animated.View
          style={[
            styles.circle,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        />
        <Text style={styles.phaseText}>{getPhaseInstruction()}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.pauseButton]}
          onPress={togglePause}
        >
          <Text style={styles.buttonText}>{isPaused ? 'Resume' : 'Pause'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Follow the circle's rhythm
        </Text>
        <Text style={styles.instructionsSubtext}>
          4s inhale • 7s hold • 8s exhale
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 20,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cycleText: {
    fontSize: 18,
    color: '#9ca3af',
    marginTop: 8,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  phaseText: {
    position: 'absolute',
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: '#7C3AED',
  },
  cancelButton: {
    backgroundColor: '#4b5563',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsContainer: {
    alignItems: 'center',
  },
  instructionsText: {
    fontSize: 16,
    color: '#d1d5db',
    marginBottom: 4,
  },
  instructionsSubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
});
