/**
 * SceneSelector Component
 *
 * Displays scene thumbnails with background images for user selection.
 * Highlights the currently selected scene and saves preference on selection.
 *
 * Requirements: 8.1 - WHEN the user selects a preferred scene THEN the Habitat System
 * SHALL persist the selection to local storage
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ImageSourcePropType,
} from 'react-native';
import type { SceneType } from '../../types/habitat';
import { SCENE_REGISTRY, getAvailableScenes } from '../../constants/habitatScenes';
import { saveScenePreference, loadScenePreference } from '../../services/HabitatPreferencesService';
import { HALLOWEEN_COLORS, TEXT_COLORS } from '../../constants/theme';

// Background images for each habitat scene
// eslint-disable-next-line @typescript-eslint/no-require-imports
const hauntedForestBg = require('../../assets/images/habitats/haunted-forest.png');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const moonlitGraveyardBg = require('../../assets/images/habitats/moonlit-graveyard.png');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const spookyMansionBg = require('../../assets/images/habitats/spooky-mansion.png');

const SCENE_BACKGROUNDS: Record<SceneType, ImageSourcePropType> = {
  'haunted-forest': hauntedForestBg,
  'moonlit-graveyard': moonlitGraveyardBg,
  'spooky-mansion': spookyMansionBg,
};

interface SceneSelectorProps {
  /** Callback when scene selection changes */
  onSceneChange?: (scene: SceneType) => void;
  /** Optional initial scene (if not provided, loads from storage) */
  initialScene?: SceneType;
}

interface SceneThumbnailProps {
  sceneType: SceneType;
  name: string;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * Scene thumbnail with background image preview
 */
const SceneThumbnail: React.FC<SceneThumbnailProps> = ({
  sceneType,
  name,
  isSelected,
  onSelect,
}) => {
  const backgroundImage = SCENE_BACKGROUNDS[sceneType];

  return (
    <TouchableOpacity
      style={[styles.thumbnailContainer, isSelected && styles.thumbnailSelected]}
      onPress={onSelect}
      accessibilityLabel={`Select ${name} scene`}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}>
      <View style={styles.thumbnail}>
        <Image source={backgroundImage} style={styles.thumbnailImage} resizeMode="cover" />
        {isSelected && <View style={styles.selectedOverlay} />}
      </View>
      <Text style={[styles.sceneName, isSelected && styles.sceneNameSelected]}>{name}</Text>
      {isSelected && (
        <View style={styles.selectedIndicator}>
          <Text style={styles.selectedCheckmark}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

/**
 * SceneSelector displays available habitat scenes for user selection
 */
export const SceneSelector: React.FC<SceneSelectorProps> = ({ onSceneChange, initialScene }) => {
  const [selectedScene, setSelectedScene] = useState<SceneType | null>(initialScene ?? null);
  const [isLoading, setIsLoading] = useState(!initialScene);
  const [isSaving, setIsSaving] = useState(false);

  // Load saved preference on mount, or sync with initialScene prop changes
  useEffect(() => {
    if (initialScene) {
      // Sync with external initialScene prop
      setSelectedScene(initialScene);
      setIsLoading(false);
    } else {
      // Load from storage if no initialScene provided
      loadScenePreference()
        .then(scene => {
          setSelectedScene(scene);
          setIsLoading(false);
        })
        .catch(() => {
          setSelectedScene('haunted-forest');
          setIsLoading(false);
        });
    }
  }, [initialScene]);

  const handleSceneSelect = useCallback(
    async (sceneType: SceneType) => {
      if (sceneType === selectedScene || isSaving) {
        return;
      }

      setIsSaving(true);
      setSelectedScene(sceneType);

      // Save preference to storage
      const success = await saveScenePreference(sceneType);

      if (success) {
        onSceneChange?.(sceneType);
      } else {
        // Revert on failure
        setSelectedScene(selectedScene);
      }

      setIsSaving(false);
    },
    [selectedScene, isSaving, onSceneChange]
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={HALLOWEEN_COLORS.primary} />
      </View>
    );
  }

  const availableScenes = getAvailableScenes();

  return (
    <View style={styles.container}>
      <Text style={styles.headline}>🎃 Choose Your Habitat</Text>
      <Text style={styles.subtitle}>Select a spooky background for your Symbi</Text>
      <View style={styles.scenesGrid}>
        {availableScenes.map(sceneType => {
          const sceneDefinition = SCENE_REGISTRY[sceneType];
          return (
            <SceneThumbnail
              key={sceneType}
              sceneType={sceneType}
              name={sceneDefinition.name}
              isSelected={selectedScene === sceneType}
              onSelect={() => handleSceneSelect(sceneType)}
            />
          );
        })}
      </View>
      {isSaving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="small" color={HALLOWEEN_COLORS.primary} />
          <Text style={styles.savingText}>Saving...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  headline: {
    fontSize: 20,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.primaryLight,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_COLORS.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scenesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  thumbnailContainer: {
    width: '30%',
    minWidth: 90,
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#2d2d44',
  },
  thumbnailSelected: {
    borderColor: HALLOWEEN_COLORS.primary,
    backgroundColor: '#3d3d54',
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 0.75,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: HALLOWEEN_COLORS.primary,
    opacity: 0.2,
  },
  sceneName: {
    marginTop: 8,
    fontSize: 11,
    color: '#a78bfa',
    textAlign: 'center',
    fontWeight: '500',
  },
  sceneNameSelected: {
    color: HALLOWEEN_COLORS.primaryLight,
    fontWeight: '600',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: HALLOWEEN_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheckmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  savingOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  savingText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});

export default SceneSelector;
