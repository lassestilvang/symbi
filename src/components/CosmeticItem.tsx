/**
 * CosmeticItem Component
 *
 * Displays an individual cosmetic item with rarity indicators.
 * Shows locked state with silhouette and unlock requirements.
 *
 * Requirements: 4.5, 5.1, 5.4
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import type { Cosmetic, RarityTier } from '../types';
import { HALLOWEEN_COLORS } from '../constants/theme';

interface CosmeticItemProps {
  /** The cosmetic to display */
  cosmetic: Cosmetic;
  /** Whether the cosmetic is owned/unlocked */
  isOwned: boolean;
  /** Whether the cosmetic is currently equipped */
  isEquipped: boolean;
  /** Whether this item is selected for preview */
  isSelected: boolean;
  /** Callback when item is pressed */
  onPress: (cosmetic: Cosmetic) => void;
  /** Optional custom styles */
  style?: ViewStyle;
}

/**
 * Rarity color mapping
 */
const RARITY_COLORS: Record<RarityTier, string> = {
  common: '#9CA3AF',
  rare: '#3B82F6',
  epic: '#9333EA',
  legendary: '#F59E0B',
};

/**
 * Rarity border glow colors
 */
const RARITY_GLOW: Record<RarityTier, string> = {
  common: 'rgba(156, 163, 175, 0.3)',
  rare: 'rgba(59, 130, 246, 0.4)',
  epic: 'rgba(147, 51, 234, 0.5)',
  legendary: 'rgba(245, 158, 11, 0.6)',
};

/**
 * Get emoji icon for cosmetic category
 */
const getCategoryIcon = (category: string): string => {
  switch (category) {
    case 'hat':
      return '🎩';
    case 'accessory':
      return '✨';
    case 'color':
      return '🎨';
    case 'background':
      return '🌌';
    case 'theme':
      return '🎭';
    default:
      return '📦';
  }
};

export const CosmeticItem: React.FC<CosmeticItemProps> = ({
  cosmetic,
  isOwned,
  isEquipped,
  isSelected,
  onPress,
  style,
}) => {
  const rarityColor = RARITY_COLORS[cosmetic.rarity];
  const rarityGlow = RARITY_GLOW[cosmetic.rarity];

  const containerStyle = useMemo(() => {
    const baseStyle: ViewStyle[] = [styles.container];

    if (isSelected) {
      baseStyle.push(styles.selected);
    }

    if (isEquipped) {
      baseStyle.push(styles.equipped);
    }

    if (!isOwned) {
      baseStyle.push(styles.locked);
    }

    return baseStyle;
  }, [isOwned, isEquipped, isSelected]);

  const handlePress = () => {
    onPress(cosmetic);
  };

  return (
    <TouchableOpacity
      style={[...containerStyle, { borderColor: rarityColor }, style]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${cosmetic.name}, ${cosmetic.rarity} ${cosmetic.category}${isOwned ? '' : ', locked'}${isEquipped ? ', equipped' : ''}`}
      accessibilityHint={
        isOwned ? 'Double tap to preview or equip' : 'Double tap to see unlock requirements'
      }>
      {/* Rarity glow effect */}
      {isOwned && <View style={[styles.glowEffect, { backgroundColor: rarityGlow }]} />}

      {/* Item content */}
      <View style={styles.content}>
        {/* Category icon or silhouette */}
        <View style={[styles.iconContainer, !isOwned && styles.silhouette]}>
          <Text style={styles.icon}>{getCategoryIcon(cosmetic.category)}</Text>
        </View>

        {/* Name */}
        <Text
          style={[styles.name, !isOwned && styles.lockedText]}
          numberOfLines={2}
          ellipsizeMode="tail">
          {isOwned ? cosmetic.name : '???'}
        </Text>

        {/* Rarity badge */}
        <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
          <Text style={styles.rarityText}>{cosmetic.rarity.toUpperCase()}</Text>
        </View>
      </View>

      {/* Equipped indicator */}
      {isEquipped && (
        <View style={styles.equippedBadge}>
          <Text style={styles.equippedText}>✓</Text>
        </View>
      )}

      {/* Lock overlay for locked items */}
      {!isOwned && (
        <View style={styles.lockOverlay}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 120,
    backgroundColor: HALLOWEEN_COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  selected: {
    borderWidth: 3,
    transform: [{ scale: 1.05 }],
  },
  equipped: {
    borderWidth: 3,
  },
  locked: {
    opacity: 0.6,
  },
  glowEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: HALLOWEEN_COLORS.darkBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  silhouette: {
    backgroundColor: '#374151',
  },
  icon: {
    fontSize: 24,
  },
  name: {
    fontSize: 11,
    fontWeight: '600',
    color: HALLOWEEN_COLORS.ghostWhite,
    textAlign: 'center',
    marginBottom: 4,
  },
  lockedText: {
    color: '#6B7280',
  },
  rarityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rarityText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  equippedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: HALLOWEEN_COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  equippedText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    fontSize: 24,
  },
});
