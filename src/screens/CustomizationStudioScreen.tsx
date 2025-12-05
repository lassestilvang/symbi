/**
 * CustomizationStudioScreen
 *
 * Full-screen interface for previewing and equipping cosmetics.
 * Features category tabs, real-time Symbi preview, and equip/unequip actions.
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import type { Cosmetic, CosmeticCategory } from '../types';
import { EmotionalState } from '../types';
import { CosmeticRenderer } from '../components/CosmeticRenderer';
import { CosmeticGrid } from '../components/CosmeticGrid';
import { useCosmeticStore } from '../stores/cosmeticStore';
import { COSMETIC_CATALOG } from '../services/CosmeticService';
import { HALLOWEEN_COLORS } from '../constants/theme';

interface CustomizationStudioScreenProps {
  navigation: {
    goBack: () => void;
  };
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Category tabs configuration
 */
const CATEGORIES: { key: CosmeticCategory; label: string; icon: string }[] = [
  { key: 'hat', label: 'Hats', icon: '🎩' },
  { key: 'accessory', label: 'Accessories', icon: '✨' },
  { key: 'color', label: 'Colors', icon: '🎨' },
  { key: 'background', label: 'Backgrounds', icon: '🌌' },
  { key: 'theme', label: 'Themes', icon: '🎭' },
];

export const CustomizationStudioScreen: React.FC<CustomizationStudioScreenProps> = ({
  navigation,
}) => {
  // Store state
  const {
    inventory,
    equipped,
    isInitialized,
    isLoading,
    initialize,
    equipCosmetic,
    unequipCosmetic,
  } = useCosmeticStore();

  // Local state
  const [activeCategory, setActiveCategory] = useState<CosmeticCategory>('hat');
  const [selectedCosmetic, setSelectedCosmetic] = useState<Cosmetic | null>(null);
  const [previewCosmeticId, setPreviewCosmeticId] = useState<string | undefined>(undefined);

  // Initialize store on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Create set of owned cosmetic IDs for quick lookup
  const ownedIds = useMemo(() => new Set(inventory.map(c => c.id)), [inventory]);

  // Get equipped cosmetic ID for current category
  const equippedId = equipped[activeCategory];

  // Handle category tab press
  const handleCategoryPress = useCallback((category: CosmeticCategory) => {
    setActiveCategory(category);
    setSelectedCosmetic(null);
    setPreviewCosmeticId(undefined);
  }, []);

  // Handle cosmetic selection
  const handleCosmeticSelect = useCallback(
    (cosmetic: Cosmetic) => {
      setSelectedCosmetic(cosmetic);

      // Only preview if owned
      if (ownedIds.has(cosmetic.id)) {
        setPreviewCosmeticId(cosmetic.id);
      } else {
        setPreviewCosmeticId(undefined);
      }
    },
    [ownedIds]
  );

  // Handle equip action
  const handleEquip = useCallback(async () => {
    if (!selectedCosmetic || !ownedIds.has(selectedCosmetic.id)) return;

    const success = await equipCosmetic(selectedCosmetic.id);
    if (success) {
      setPreviewCosmeticId(undefined);
    }
  }, [selectedCosmetic, ownedIds, equipCosmetic]);

  // Handle unequip action
  const handleUnequip = useCallback(async () => {
    if (!selectedCosmetic) return;

    const success = await unequipCosmetic(selectedCosmetic.id);
    if (success) {
      setPreviewCosmeticId(undefined);
      setSelectedCosmetic(null);
    }
  }, [selectedCosmetic, unequipCosmetic]);

  // Check if selected cosmetic is equipped
  const isSelectedEquipped = selectedCosmetic && equippedId === selectedCosmetic.id;
  const isSelectedOwned = selectedCosmetic && ownedIds.has(selectedCosmetic.id);

  // Get unlock requirement text for locked cosmetics
  const getUnlockRequirement = (cosmetic: Cosmetic): string => {
    const condition = cosmetic.unlockCondition;
    if (condition.startsWith('steps_')) {
      const steps = condition.replace('steps_', '');
      return `Reach ${parseInt(steps).toLocaleString()} steps in a day`;
    }
    if (condition.startsWith('streak_')) {
      const days = condition.replace('streak_', '');
      return `Maintain a ${days}-day streak`;
    }
    if (condition.startsWith('challenge_')) {
      return 'Complete weekly challenges';
    }
    if (condition.startsWith('special_')) {
      return 'Special event reward';
    }
    if (condition.startsWith('explore_')) {
      return 'Explore the app features';
    }
    return 'Complete achievements to unlock';
  };

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={HALLOWEEN_COLORS.primary} />
        <Text style={styles.loadingText}>Loading Customization Studio...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Customization Studio</Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      {/* Preview Section */}
      <View style={styles.previewSection}>
        <View style={styles.previewContainer}>
          <CosmeticRenderer
            emotionalState={EmotionalState.ACTIVE}
            size={Math.min(SCREEN_WIDTH * 0.4, 160)}
            previewCosmeticId={previewCosmeticId}
            showCosmetics={true}
          />
        </View>

        {/* Selected cosmetic info */}
        {selectedCosmetic && (
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedName}>{selectedCosmetic.name}</Text>
            <Text style={styles.selectedRarity}>{selectedCosmetic.rarity.toUpperCase()}</Text>

            {!isSelectedOwned && (
              <Text style={styles.unlockRequirement}>
                🔒 {getUnlockRequirement(selectedCosmetic)}
              </Text>
            )}

            {/* Action buttons */}
            {isSelectedOwned && (
              <View style={styles.actionButtons}>
                {isSelectedEquipped ? (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.unequipButton]}
                    onPress={handleUnequip}
                    disabled={isLoading}>
                    <Text style={styles.actionButtonText}>Unequip</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.equipButton]}
                    onPress={handleEquip}
                    disabled={isLoading}>
                    <Text style={styles.actionButtonText}>Equip</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}
      </View>

      {/* Category Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.tab, activeCategory === cat.key && styles.activeTab]}
              onPress={() => handleCategoryPress(cat.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeCategory === cat.key }}>
              <Text style={styles.tabIcon}>{cat.icon}</Text>
              <Text style={[styles.tabLabel, activeCategory === cat.key && styles.activeTabLabel]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Cosmetic Grid */}
      <View style={styles.gridContainer}>
        <CosmeticGrid
          cosmetics={COSMETIC_CATALOG}
          ownedIds={ownedIds}
          equippedId={equippedId}
          selectedId={selectedCosmetic?.id}
          onSelect={handleCosmeticSelect}
          category={activeCategory}
          showLocked={true}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HALLOWEEN_COLORS.darkBg,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: HALLOWEEN_COLORS.darkBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: HALLOWEEN_COLORS.ghostWhite,
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  header: {
    width: '100%',
    maxWidth: 600,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 28,
    color: HALLOWEEN_COLORS.primaryLight,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.primaryLight,
  },
  placeholder: {
    width: 44,
  },
  previewSection: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  previewContainer: {
    width: Math.min(SCREEN_WIDTH * 0.5, 200),
    height: Math.min(SCREEN_WIDTH * 0.5, 200),
    backgroundColor: HALLOWEEN_COLORS.cardBg,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: HALLOWEEN_COLORS.primary,
  },
  selectedInfo: {
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
  },
  selectedName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.ghostWhite,
    marginBottom: 4,
  },
  selectedRarity: {
    fontSize: 12,
    fontWeight: '600',
    color: HALLOWEEN_COLORS.primaryLight,
    marginBottom: 8,
  },
  unlockRequirement: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  equipButton: {
    backgroundColor: HALLOWEEN_COLORS.primary,
  },
  unequipButton: {
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: HALLOWEEN_COLORS.primary,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  tabsContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: HALLOWEEN_COLORS.cardBg,
  },
  activeTab: {
    backgroundColor: HALLOWEEN_COLORS.primary,
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tabLabel: {
    fontSize: 14,
    color: HALLOWEEN_COLORS.ghostWhite,
  },
  activeTabLabel: {
    fontWeight: 'bold',
  },
  gridContainer: {
    flex: 1,
    paddingTop: 16,
  },
});
