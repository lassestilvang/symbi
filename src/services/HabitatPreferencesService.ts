/**
 * HabitatPreferencesService
 *
 * Manages persistence of habitat scene preferences using AsyncStorage.
 * Handles storage errors gracefully with fallback to defaults.
 *
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SceneType, HabitatPreferences } from '../types/habitat';

const HABITAT_PREFERENCES_KEY = '@symbi:habitat_preferences';
const DEFAULT_SCENE: SceneType = 'haunted-forest';

/**
 * Validates that a value is a valid SceneType
 */
function isValidSceneType(value: unknown): value is SceneType {
  return (
    typeof value === 'string' &&
    ['haunted-forest', 'moonlit-graveyard', 'spooky-mansion'].includes(value)
  );
}

/**
 * Saves the user's preferred scene to local storage.
 * Requirements: 8.1 - WHEN the user selects a preferred scene THEN the Habitat System
 * SHALL persist the selection to local storage
 *
 * @param scene - The scene type to save
 * @returns true if save was successful, false otherwise
 */
export async function saveScenePreference(scene: SceneType): Promise<boolean> {
  try {
    const preferences: HabitatPreferences = {
      selectedScene: scene,
      lastUpdated: new Date().toISOString(),
    };
    await AsyncStorage.setItem(HABITAT_PREFERENCES_KEY, JSON.stringify(preferences));
    console.log(`[HabitatPreferencesService] Saved scene preference: ${scene}`);
    return true;
  } catch (error) {
    console.error('[HabitatPreferencesService] Error saving scene preference:', error);
    return false;
  }
}

/**
 * Loads the user's preferred scene from local storage.
 * Requirements: 8.2 - WHEN the app loads THEN the Habitat System SHALL restore
 * the previously selected scene preference
 * Requirements: 8.3 - WHEN no preference is stored THEN the Habitat System SHALL
 * default to the Haunted Forest scene
 * Requirements: 8.4 - WHEN the user clears app data THEN the Habitat System SHALL
 * gracefully reset to default scene
 *
 * @returns The saved scene preference, or default scene if none exists or on error
 */
export async function loadScenePreference(): Promise<SceneType> {
  try {
    const stored = await AsyncStorage.getItem(HABITAT_PREFERENCES_KEY);

    if (!stored) {
      console.log('[HabitatPreferencesService] No preference found, using default');
      return DEFAULT_SCENE;
    }

    const preferences: HabitatPreferences = JSON.parse(stored);

    if (!isValidSceneType(preferences.selectedScene)) {
      console.warn('[HabitatPreferencesService] Invalid scene type stored, using default');
      return DEFAULT_SCENE;
    }

    console.log(
      `[HabitatPreferencesService] Loaded scene preference: ${preferences.selectedScene}`
    );
    return preferences.selectedScene;
  } catch (error) {
    // Gracefully handle storage errors by returning default
    // Requirements: 8.4 - graceful reset to default scene
    console.error('[HabitatPreferencesService] Error loading scene preference:', error);
    return DEFAULT_SCENE;
  }
}

/**
 * Clears the habitat preferences from storage.
 * Used when user clears app data.
 *
 * @returns true if clear was successful, false otherwise
 */
export async function clearScenePreference(): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(HABITAT_PREFERENCES_KEY);
    console.log('[HabitatPreferencesService] Cleared scene preference');
    return true;
  } catch (error) {
    console.error('[HabitatPreferencesService] Error clearing scene preference:', error);
    return false;
  }
}

/**
 * Gets the default scene type.
 * Useful for components that need to know the fallback value.
 *
 * @returns The default scene type (haunted-forest)
 */
export function getDefaultScene(): SceneType {
  return DEFAULT_SCENE;
}

export const HabitatPreferencesService = {
  saveScenePreference,
  loadScenePreference,
  clearScenePreference,
  getDefaultScene,
};
