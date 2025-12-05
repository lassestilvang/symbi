/**
 * CosmeticGrid Component
 *
 * Displays cosmetics in a grid layout organized by category.
 * Handles selection and equip/unequip actions.
 *
 * Requirements: 4.5, 5.1, 5.4
 */

import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import type { Cosmetic, CosmeticCategory } from '../types';
import { CosmeticItem } from './CosmeticItem';
import { HALLOWEEN_COLORS } from '../constants/theme';

interface CosmeticGridProps {
  /** All cosmetics to display (both owned and locked) */
  cosmetics: Cosmetic[];
  /** Set of owned cosmetic IDs */
  ownedIds: Set<string>;
  /** Currently equipped cosmetic ID for this category */
  equippedId?: string;
  /** Currently selected cosmetic ID for preview */
  selectedId?: string;
  /** Callback when a cosmetic is selected */
  onSelect: (cosmetic: Cosmetic) => void;
  /** Category being displayed */
  category: CosmeticCategory;
  /** Whether to show locked cosmetics */
  showLocked?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = 100;
const ITEM_MARGIN = 8;
const GRID_PADDING = 16;

/**
 * Category display names
 */
const CATEGORY_NAMES: Record<CosmeticCategory, string> = {
  hat: 'Hats',
  accessory: 'Accessories',
  color: 'Colors',
  background: 'Backgrounds',
  theme: 'Themes',
};

/**
 * Category descriptions
 */
const CATEGORY_DESCRIPTIONS: Record<CosmeticCategory, string> = {
  hat: 'Stylish headwear for your Symbi',
  accessory: 'Fun accessories and decorations',
  color: "Change your Symbi's color",
  background: 'Beautiful background effects',
  theme: 'Complete visual themes',
};

export const CosmeticGrid: React.FC<CosmeticGridProps> = ({
  cosmetics,
  ownedIds,
  equippedId,
  selectedId,
  onSelect,
  category,
  showLocked = true,
}) => {
  // Filter and sort cosmetics
  const displayCosmetics = useMemo(() => {
    let filtered = cosmetics.filter(c => c.category === category);

    if (!showLocked) {
      filtered = filtered.filter(c => ownedIds.has(c.id));
    }

    // Sort: owned first, then by rarity (legendary > epic > rare > common)
    const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
    return filtered.sort((a, b) => {
      const aOwned = ownedIds.has(a.id) ? 1 : 0;
      const bOwned = ownedIds.has(b.id) ? 1 : 0;

      if (aOwned !== bOwned) return bOwned - aOwned;
      return rarityOrder[b.rarity] - rarityOrder[a.rarity];
    });
  }, [cosmetics, category, ownedIds, showLocked]);

  // Calculate number of columns based on screen width
  const numColumns = useMemo(() => {
    const availableWidth = SCREEN_WIDTH - GRID_PADDING * 2;
    return Math.floor(availableWidth / (ITEM_WIDTH + ITEM_MARGIN * 2));
  }, []);

  // Chunk cosmetics into rows
  const rows = useMemo(() => {
    const result: Cosmetic[][] = [];
    for (let i = 0; i < displayCosmetics.length; i += numColumns) {
      result.push(displayCosmetics.slice(i, i + numColumns));
    }
    return result;
  }, [displayCosmetics, numColumns]);

  const handleItemPress = useCallback(
    (cosmetic: Cosmetic) => {
      onSelect(cosmetic);
    },
    [onSelect]
  );

  // Count owned vs total
  const ownedCount = displayCosmetics.filter(c => ownedIds.has(c.id)).length;
  const totalCount = displayCosmetics.length;

  if (displayCosmetics.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📦</Text>
        <Text style={styles.emptyTitle}>No {CATEGORY_NAMES[category]} Yet</Text>
        <Text style={styles.emptyText}>
          Complete achievements to unlock {CATEGORY_NAMES[category].toLowerCase()}!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Category header */}
      <View style={styles.header}>
        <Text style={styles.title}>{CATEGORY_NAMES[category]}</Text>
        <Text style={styles.count}>
          {ownedCount}/{totalCount} Unlocked
        </Text>
      </View>
      <Text style={styles.description}>{CATEGORY_DESCRIPTIONS[category]}</Text>

      {/* Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}>
        {rows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map(cosmetic => (
              <CosmeticItem
                key={cosmetic.id}
                cosmetic={cosmetic}
                isOwned={ownedIds.has(cosmetic.id)}
                isEquipped={equippedId === cosmetic.id}
                isSelected={selectedId === cosmetic.id}
                onPress={handleItemPress}
                style={styles.item}
              />
            ))}
            {/* Fill empty spaces in last row */}
            {rowIndex === rows.length - 1 &&
              row.length < numColumns &&
              Array(numColumns - row.length)
                .fill(null)
                .map((_, i) => <View key={`empty-${i}`} style={styles.emptyItem} />)}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: GRID_PADDING,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.primaryLight,
  },
  count: {
    fontSize: 14,
    color: HALLOWEEN_COLORS.ghostWhite,
    opacity: 0.7,
  },
  description: {
    fontSize: 12,
    color: '#9CA3AF',
    paddingHorizontal: GRID_PADDING,
    marginBottom: 12,
  },
  scrollView: {
    flex: 1,
  },
  gridContent: {
    paddingHorizontal: GRID_PADDING,
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: ITEM_MARGIN * 2,
  },
  item: {
    marginHorizontal: ITEM_MARGIN,
  },
  emptyItem: {
    width: ITEM_WIDTH,
    height: 120,
    marginHorizontal: ITEM_MARGIN,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.primaryLight,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
