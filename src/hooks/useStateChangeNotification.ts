import { useState, useRef, useEffect, useCallback } from 'react';
import { Animated } from 'react-native';
import { EmotionalState } from '../types';

/**
 * Custom hook for state change notifications
 *
 * Extracts notification animation logic from MainScreen
 * to improve code organization and reusability.
 */

interface UseStateChangeNotificationResult {
  stateChangeNotification: string | null;
  notificationOpacity: Animated.Value;
}

interface UseStateChangeNotificationOptions {
  /** Duration to show notification in ms */
  displayDuration?: number;
  /** Fade animation duration in ms */
  fadeDuration?: number;
  /** Skip notification during initialization */
  isInitializing?: boolean;
}

export const useStateChangeNotification = (
  emotionalState: EmotionalState,
  options: UseStateChangeNotificationOptions = {}
): UseStateChangeNotificationResult => {
  const { displayDuration = 2000, fadeDuration = 300, isInitializing = false } = options;

  const [stateChangeNotification, setStateChangeNotification] = useState<string | null>(null);
  const notificationOpacity = useRef(new Animated.Value(0)).current;
  const previousStateRef = useRef<EmotionalState>(emotionalState);

  const showNotification = useCallback(
    (oldState: EmotionalState, newState: EmotionalState) => {
      const oldName = oldState.charAt(0).toUpperCase() + oldState.slice(1);
      const newName = newState.charAt(0).toUpperCase() + newState.slice(1);

      setStateChangeNotification(`${oldName} → ${newName}`);

      Animated.sequence([
        Animated.timing(notificationOpacity, {
          toValue: 1,
          duration: fadeDuration,
          useNativeDriver: true,
        }),
        Animated.delay(displayDuration),
        Animated.timing(notificationOpacity, {
          toValue: 0,
          duration: fadeDuration,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setStateChangeNotification(null);
      });
    },
    [notificationOpacity, displayDuration, fadeDuration]
  );

  useEffect(() => {
    if (previousStateRef.current !== emotionalState && !isInitializing) {
      showNotification(previousStateRef.current, emotionalState);
      previousStateRef.current = emotionalState;
    }
  }, [emotionalState, isInitializing, showNotification]);

  return {
    stateChangeNotification,
    notificationOpacity,
  };
};
