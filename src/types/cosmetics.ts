/**
 * Cosmetic Type Definitions for Symbi
 *
 * This file contains all TypeScript interfaces for the cosmetic/customization system.
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.5
 */

import type { RarityTier } from './achievements';

// ============================================================================
// Cosmetic Types
// ============================================================================

/**
 * CosmeticCategory classifies cosmetics by their type
 */
export type CosmeticCategory = 'hat' | 'accessory' | 'color' | 'background' | 'theme';

// ============================================================================
// Cosmetic Interfaces
// ============================================================================

/**
 * PixelData represents a single pixel for 8-bit style cosmetics
 */
export interface PixelData {
  x: number;
  y: number;
  color: string;
}

/**
 * CosmeticRenderData contains rendering information for a cosmetic
 */
export interface CosmeticRenderData {
  layerIndex: number; // z-order for rendering (lower = behind)
  pixels?: PixelData[]; // for 8-bit style cosmetics
  offsetX: number;
  offsetY: number;
  colorOverride?: string; // for color variations
}

/**
 * Cosmetic represents a single cosmetic item
 */
export interface Cosmetic {
  id: string;
  name: string;
  category: CosmeticCategory;
  rarity: RarityTier;
  previewUrl: string;
  renderData: CosmeticRenderData;
  unlockCondition: string; // achievement ID or special condition
  unlockedAt?: string; // ISO date string
  sourceAchievement?: string;
}

/**
 * EquippedCosmetics tracks which cosmetics are currently equipped
 */
export interface EquippedCosmetics {
  hat?: string; // cosmetic ID
  accessory?: string; // cosmetic ID
  color?: string; // cosmetic ID
  background?: string; // cosmetic ID
  theme?: string; // cosmetic ID
}

/**
 * CosmeticInventory represents the user's complete cosmetic collection
 */
export interface CosmeticInventory {
  items: Cosmetic[];
  equipped: EquippedCosmetics;
  lastUpdated: string; // ISO date string
}

/**
 * CosmeticLayer represents a single layer for rendering
 */
export interface CosmeticLayer {
  cosmeticId: string;
  category: CosmeticCategory;
  renderData: CosmeticRenderData;
}

// ============================================================================
// Storage Types
// ============================================================================

/**
 * CosmeticStorageData is the schema for persisted cosmetic data
 */
export interface CosmeticStorageData {
  inventory: CosmeticInventory;
  lastUpdated: string; // ISO date string
}
