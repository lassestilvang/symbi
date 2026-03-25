/**
 * CosmeticService - Manages cosmetic inventory, equipment, and rendering
 *
 * This service handles:
 * - Cosmetic catalog with categories, rarity, and render data
 * - Inventory management (add, get, filter by category)
 * - Equipment management (equip, unequip, get equipped)
 * - Rendering support (layer ordering, preview)
 *
 * Requirements: 4.1, 4.2, 4.5, 5.2, 5.3, 5.5
 */

import type {
  Cosmetic,
  CosmeticCategory,
  CosmeticInventory,
  CosmeticLayer,
  CosmeticRenderData,
  EquippedCosmetics,
  RarityTier,
} from '../types';
import { StorageService } from './StorageService';

// ============================================================================
// Layer Index Constants (z-order for rendering)
// ============================================================================

/**
 * LAYER_ORDER defines the z-index for each cosmetic category.
 * Lower values render behind higher values.
 * background (0) < color (1) < accessory (2) < hat (3) < theme (4)
 */
export const LAYER_ORDER: Record<CosmeticCategory, number> = {
  background: 0,
  color: 1,
  accessory: 2,
  hat: 3,
  theme: 4,
};

// ============================================================================
// Cosmetic Catalog
// ============================================================================

/**
 * COSMETIC_CATALOG defines all available cosmetics in the system.
 * Each cosmetic has a unique ID, category, rarity, and render data.
 */
export const COSMETIC_CATALOG: Cosmetic[] = [
  // Hats
  {
    id: 'hat_crown',
    name: 'Royal Crown',
    category: 'hat',
    rarity: 'common',
    previewUrl: 'cosmetics/hat_crown.png',
    renderData: {
      layerIndex: LAYER_ORDER.hat,
      offsetX: 0,
      offsetY: -10,
      pixels: [
        { x: 4, y: 0, color: '#FFD700' },
        { x: 5, y: 0, color: '#FFD700' },
        { x: 6, y: 0, color: '#FFD700' },
        { x: 3, y: 1, color: '#FFD700' },
        { x: 7, y: 1, color: '#FFD700' },
        { x: 3, y: 2, color: '#FFD700' },
        { x: 4, y: 2, color: '#FFD700' },
        { x: 5, y: 2, color: '#FFD700' },
        { x: 6, y: 2, color: '#FFD700' },
        { x: 7, y: 2, color: '#FFD700' },
      ],
    },
    unlockCondition: 'steps_10000',
  },
  {
    id: 'hat_headband',
    name: 'Fitness Headband',
    category: 'hat',
    rarity: 'common',
    previewUrl: 'cosmetics/hat_headband.png',
    renderData: {
      layerIndex: LAYER_ORDER.hat,
      offsetX: 0,
      offsetY: -5,
      pixels: [
        { x: 2, y: 0, color: '#FF6B6B' },
        { x: 3, y: 0, color: '#FF6B6B' },
        { x: 4, y: 0, color: '#FF6B6B' },
        { x: 5, y: 0, color: '#FF6B6B' },
        { x: 6, y: 0, color: '#FF6B6B' },
        { x: 7, y: 0, color: '#FF6B6B' },
        { x: 8, y: 0, color: '#FF6B6B' },
      ],
    },
    unlockCondition: 'streak_7',
  },

  {
    id: 'hat_witch',
    name: 'Witch Hat',
    category: 'hat',
    rarity: 'rare',
    previewUrl: 'cosmetics/hat_witch.png',
    renderData: {
      layerIndex: LAYER_ORDER.hat,
      offsetX: 0,
      offsetY: -12,
      pixels: [
        { x: 5, y: 0, color: '#2D1B4E' },
        { x: 4, y: 1, color: '#2D1B4E' },
        { x: 5, y: 1, color: '#2D1B4E' },
        { x: 6, y: 1, color: '#2D1B4E' },
        { x: 3, y: 2, color: '#2D1B4E' },
        { x: 4, y: 2, color: '#2D1B4E' },
        { x: 5, y: 2, color: '#2D1B4E' },
        { x: 6, y: 2, color: '#2D1B4E' },
        { x: 7, y: 2, color: '#2D1B4E' },
        { x: 2, y: 3, color: '#2D1B4E' },
        { x: 3, y: 3, color: '#2D1B4E' },
        { x: 4, y: 3, color: '#2D1B4E' },
        { x: 5, y: 3, color: '#2D1B4E' },
        { x: 6, y: 3, color: '#2D1B4E' },
        { x: 7, y: 3, color: '#2D1B4E' },
        { x: 8, y: 3, color: '#2D1B4E' },
      ],
    },
    unlockCondition: 'special_halloween',
  },
  {
    id: 'hat_champion',
    name: 'Champion Crown',
    category: 'hat',
    rarity: 'epic',
    previewUrl: 'cosmetics/hat_champion.png',
    renderData: {
      layerIndex: LAYER_ORDER.hat,
      offsetX: 0,
      offsetY: -10,
      pixels: [
        { x: 4, y: 0, color: '#9333EA' },
        { x: 5, y: 0, color: '#FFD700' },
        { x: 6, y: 0, color: '#9333EA' },
        { x: 3, y: 1, color: '#9333EA' },
        { x: 4, y: 1, color: '#FFD700' },
        { x: 5, y: 1, color: '#FFD700' },
        { x: 6, y: 1, color: '#FFD700' },
        { x: 7, y: 1, color: '#9333EA' },
        { x: 3, y: 2, color: '#9333EA' },
        { x: 4, y: 2, color: '#9333EA' },
        { x: 5, y: 2, color: '#9333EA' },
        { x: 6, y: 2, color: '#9333EA' },
        { x: 7, y: 2, color: '#9333EA' },
      ],
    },
    unlockCondition: 'challenge_weekly_all',
  },

  // Accessories
  {
    id: 'accessory_medal',
    name: 'Gold Medal',
    category: 'accessory',
    rarity: 'rare',
    previewUrl: 'cosmetics/accessory_medal.png',
    renderData: {
      layerIndex: LAYER_ORDER.accessory,
      offsetX: 0,
      offsetY: 8,
      pixels: [
        { x: 5, y: 0, color: '#4169E1' },
        { x: 4, y: 1, color: '#FFD700' },
        { x: 5, y: 1, color: '#FFD700' },
        { x: 6, y: 1, color: '#FFD700' },
        { x: 4, y: 2, color: '#FFD700' },
        { x: 5, y: 2, color: '#FFA500' },
        { x: 6, y: 2, color: '#FFD700' },
        { x: 5, y: 3, color: '#FFD700' },
      ],
    },
    unlockCondition: 'steps_15000',
  },
  {
    id: 'accessory_cape',
    name: 'Hero Cape',
    category: 'accessory',
    rarity: 'rare',
    previewUrl: 'cosmetics/accessory_cape.png',
    renderData: {
      layerIndex: LAYER_ORDER.accessory,
      offsetX: -2,
      offsetY: 2,
      pixels: [
        { x: 0, y: 0, color: '#DC143C' },
        { x: 0, y: 1, color: '#DC143C' },
        { x: 1, y: 1, color: '#DC143C' },
        { x: 0, y: 2, color: '#DC143C' },
        { x: 1, y: 2, color: '#DC143C' },
        { x: 0, y: 3, color: '#DC143C' },
        { x: 1, y: 3, color: '#DC143C' },
        { x: 2, y: 3, color: '#DC143C' },
        { x: 0, y: 4, color: '#B22222' },
        { x: 1, y: 4, color: '#B22222' },
        { x: 2, y: 4, color: '#B22222' },
      ],
    },
    unlockCondition: 'streak_14',
  },
  {
    id: 'accessory_trophy',
    name: 'Mini Trophy',
    category: 'accessory',
    rarity: 'rare',
    previewUrl: 'cosmetics/accessory_trophy.png',
    renderData: {
      layerIndex: LAYER_ORDER.accessory,
      offsetX: 8,
      offsetY: 4,
      pixels: [
        { x: 0, y: 0, color: '#FFD700' },
        { x: 1, y: 0, color: '#FFD700' },
        { x: 2, y: 0, color: '#FFD700' },
        { x: 0, y: 1, color: '#FFD700' },
        { x: 1, y: 1, color: '#FFA500' },
        { x: 2, y: 1, color: '#FFD700' },
        { x: 1, y: 2, color: '#FFD700' },
        { x: 0, y: 3, color: '#8B4513' },
        { x: 1, y: 3, color: '#8B4513' },
        { x: 2, y: 3, color: '#8B4513' },
      ],
    },
    unlockCondition: 'challenge_5',
  },

  // Colors
  {
    id: 'color_gold',
    name: 'Golden Glow',
    category: 'color',
    rarity: 'epic',
    previewUrl: 'cosmetics/color_gold.png',
    renderData: {
      layerIndex: LAYER_ORDER.color,
      offsetX: 0,
      offsetY: 0,
      colorOverride: '#FFD700',
    },
    unlockCondition: 'steps_20000',
  },
  {
    id: 'color_rainbow',
    name: 'Rainbow Spirit',
    category: 'color',
    rarity: 'epic',
    previewUrl: 'cosmetics/color_rainbow.png',
    renderData: {
      layerIndex: LAYER_ORDER.color,
      offsetX: 0,
      offsetY: 0,
      colorOverride: 'rainbow',
    },
    unlockCondition: 'streak_60',
  },

  // Backgrounds
  {
    id: 'background_stars',
    name: 'Starry Night',
    category: 'background',
    rarity: 'epic',
    previewUrl: 'cosmetics/background_stars.png',
    renderData: {
      layerIndex: LAYER_ORDER.background,
      offsetX: 0,
      offsetY: 0,
    },
    unlockCondition: 'streak_30',
  },
  {
    id: 'background_evolution',
    name: 'Evolution Aura',
    category: 'background',
    rarity: 'rare',
    previewUrl: 'cosmetics/background_evolution.png',
    renderData: {
      layerIndex: LAYER_ORDER.background,
      offsetX: 0,
      offsetY: 0,
    },
    unlockCondition: 'explore_evolution',
  },
  {
    id: 'background_haunted',
    name: 'Haunted Mist',
    category: 'background',
    rarity: 'rare',
    previewUrl: 'cosmetics/background_haunted.png',
    renderData: {
      layerIndex: LAYER_ORDER.background,
      offsetX: 0,
      offsetY: 0,
    },
    unlockCondition: 'special_halloween',
  },

  // Themes
  {
    id: 'theme_golden',
    name: 'Golden Theme',
    category: 'theme',
    rarity: 'legendary',
    previewUrl: 'cosmetics/theme_golden.png',
    renderData: {
      layerIndex: LAYER_ORDER.theme,
      offsetX: 0,
      offsetY: 0,
    },
    unlockCondition: 'steps_30000',
  },
  {
    id: 'theme_legendary',
    name: 'Legendary Theme',
    category: 'theme',
    rarity: 'legendary',
    previewUrl: 'cosmetics/theme_legendary.png',
    renderData: {
      layerIndex: LAYER_ORDER.theme,
      offsetX: 0,
      offsetY: 0,
    },
    unlockCondition: 'streak_90',
  },
];

// ============================================================================
// Rarity Order (for sorting and comparison)
// ============================================================================

const RARITY_ORDER: Record<RarityTier, number> = {
  common: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
};

// ============================================================================
// CosmeticService Class
// ============================================================================

/**
 * CosmeticService manages cosmetic inventory, equipment, and rendering.
 */
export class CosmeticService {
  private inventory: CosmeticInventory;
  private initialized = false;

  constructor() {
    this.inventory = this.getDefaultInventory();
  }

  /**
   * Initialize the service by loading persisted cosmetic data.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const data = await StorageService.getCosmeticInventory();
    if (data) {
      this.inventory = data;
    }

    this.initialized = true;
  }

  // ==========================================================================
  // Inventory Management (Requirements: 4.1, 4.2, 4.5)
  // ==========================================================================

  /**
   * Add a cosmetic to the user's inventory.
   * If the cosmetic already exists, this is a no-op (idempotent).
   */
  async addToInventory(cosmetic: Cosmetic): Promise<void> {
    await this.initialize();

    // Check if already in inventory
    const exists = this.inventory.items.some(item => item.id === cosmetic.id);
    if (exists) {
      console.log(`[CosmeticService] Cosmetic ${cosmetic.id} already in inventory`);
      return;
    }

    // Add with unlock timestamp
    const unlockedCosmetic: Cosmetic = {
      ...cosmetic,
      unlockedAt: new Date().toISOString(),
    };

    this.inventory.items.push(unlockedCosmetic);
    this.inventory.lastUpdated = new Date().toISOString();

    await this.persistInventory();
    console.log(`[CosmeticService] Added cosmetic ${cosmetic.id} to inventory`);
  }

  /**
   * Add a cosmetic to inventory by ID.
   * Looks up the cosmetic in the catalog and adds it.
   */
  async addToInventoryById(cosmeticId: string): Promise<Cosmetic | null> {
    const cosmetic = COSMETIC_CATALOG.find(c => c.id === cosmeticId);
    if (!cosmetic) {
      console.warn(`[CosmeticService] Cosmetic not found in catalog: ${cosmeticId}`);
      return null;
    }

    await this.addToInventory(cosmetic);
    return cosmetic;
  }

  /**
   * Get the complete cosmetic inventory.
   */
  getInventory(): CosmeticInventory {
    return { ...this.inventory };
  }

  /**
   * Get cosmetics filtered by category.
   */
  getByCategory(category: CosmeticCategory): Cosmetic[] {
    return this.inventory.items.filter(item => item.category === category);
  }

  /**
   * Get all cosmetics from the catalog (including locked ones).
   */
  getAllCosmetics(): Cosmetic[] {
    return COSMETIC_CATALOG.map(cosmetic => {
      const owned = this.inventory.items.find(item => item.id === cosmetic.id);
      return owned || cosmetic;
    });
  }

  /**
   * Get cosmetics by rarity tier.
   */
  getByRarity(rarity: RarityTier): Cosmetic[] {
    return this.inventory.items.filter(item => item.rarity === rarity);
  }

  /**
   * Check if a cosmetic is owned.
   */
  isOwned(cosmeticId: string): boolean {
    return this.inventory.items.some(item => item.id === cosmeticId);
  }

  /**
   * Get a cosmetic by ID from inventory.
   */
  getCosmeticById(cosmeticId: string): Cosmetic | null {
    return this.inventory.items.find(item => item.id === cosmeticId) || null;
  }

  /**
   * Get a cosmetic from the catalog by ID.
   */
  getCatalogCosmetic(cosmeticId: string): Cosmetic | null {
    return COSMETIC_CATALOG.find(c => c.id === cosmeticId) || null;
  }

  // ==========================================================================
  // Equipment Management (Requirements: 5.2, 5.3, 5.5)
  // ==========================================================================

  /**
   * Equip a cosmetic by ID.
   * The cosmetic must be owned to be equipped.
   */
  async equipCosmetic(cosmeticId: string): Promise<boolean> {
    await this.initialize();

    const cosmetic = this.inventory.items.find(item => item.id === cosmeticId);
    if (!cosmetic) {
      console.warn(`[CosmeticService] Cannot equip: cosmetic ${cosmeticId} not owned`);
      return false;
    }

    // Set the equipped cosmetic for its category
    this.inventory.equipped[cosmetic.category] = cosmeticId;
    this.inventory.lastUpdated = new Date().toISOString();

    await this.persistInventory();
    console.log(`[CosmeticService] Equipped ${cosmeticId} in ${cosmetic.category} slot`);
    return true;
  }

  /**
   * Unequip a cosmetic by ID.
   */
  async unequipCosmetic(cosmeticId: string): Promise<boolean> {
    await this.initialize();

    const cosmetic = this.inventory.items.find(item => item.id === cosmeticId);
    if (!cosmetic) {
      console.warn(`[CosmeticService] Cannot unequip: cosmetic ${cosmeticId} not found`);
      return false;
    }

    // Check if this cosmetic is currently equipped
    if (this.inventory.equipped[cosmetic.category] !== cosmeticId) {
      console.log(`[CosmeticService] Cosmetic ${cosmeticId} is not currently equipped`);
      return false;
    }

    // Remove from equipped
    this.inventory.equipped[cosmetic.category] = undefined;
    this.inventory.lastUpdated = new Date().toISOString();

    await this.persistInventory();
    console.log(`[CosmeticService] Unequipped ${cosmeticId} from ${cosmetic.category} slot`);
    return true;
  }

  /**
   * Get currently equipped cosmetics.
   */
  getEquippedCosmetics(): EquippedCosmetics {
    return { ...this.inventory.equipped };
  }

  /**
   * Check if a cosmetic is currently equipped.
   */
  isEquipped(cosmeticId: string): boolean {
    const cosmetic = this.inventory.items.find(item => item.id === cosmeticId);
    if (!cosmetic) return false;
    return this.inventory.equipped[cosmetic.category] === cosmeticId;
  }

  // ==========================================================================
  // Rendering Support (Requirements: 5.5)
  // ==========================================================================

  /**
   * Get cosmetic layers for rendering in correct z-order.
   * Returns layers sorted by layerIndex (ascending).
   */
  getCosmeticLayers(): CosmeticLayer[] {
    const layers: CosmeticLayer[] = [];

    // Get all equipped cosmetics
    const equipped = this.inventory.equipped;
    const categories: CosmeticCategory[] = ['background', 'color', 'accessory', 'hat', 'theme'];

    for (const category of categories) {
      const cosmeticId = equipped[category];
      if (!cosmeticId) continue;

      const cosmetic = this.inventory.items.find(item => item.id === cosmeticId);
      if (!cosmetic) continue;

      layers.push({
        cosmeticId: cosmetic.id,
        category: cosmetic.category,
        renderData: cosmetic.renderData,
      });
    }

    // Sort by layerIndex (ascending order for correct z-order)
    return layers.sort((a, b) => a.renderData.layerIndex - b.renderData.layerIndex);
  }

  /**
   * Get render data for a specific cosmetic (for preview).
   */
  getPreviewRender(cosmeticId: string): CosmeticRenderData | null {
    // First check inventory
    const owned = this.inventory.items.find(item => item.id === cosmeticId);
    if (owned) {
      return owned.renderData;
    }

    // Fall back to catalog for preview of locked items
    const catalogItem = COSMETIC_CATALOG.find(c => c.id === cosmeticId);
    return catalogItem?.renderData || null;
  }

  /**
   * Get all cosmetic layers including a preview cosmetic.
   * Used for previewing a cosmetic before equipping.
   */
  getPreviewLayers(previewCosmeticId: string): CosmeticLayer[] {
    const previewCosmetic =
      this.inventory.items.find(item => item.id === previewCosmeticId) ||
      COSMETIC_CATALOG.find(c => c.id === previewCosmeticId);

    if (!previewCosmetic) {
      return this.getCosmeticLayers();
    }

    const layers: CosmeticLayer[] = [];
    const equipped = this.inventory.equipped;
    const categories: CosmeticCategory[] = ['background', 'color', 'accessory', 'hat', 'theme'];

    for (const category of categories) {
      // Use preview cosmetic for its category, otherwise use equipped
      if (category === previewCosmetic.category) {
        layers.push({
          cosmeticId: previewCosmetic.id,
          category: previewCosmetic.category,
          renderData: previewCosmetic.renderData,
        });
      } else {
        const cosmeticId = equipped[category];
        if (!cosmeticId) continue;

        const cosmetic = this.inventory.items.find(item => item.id === cosmeticId);
        if (!cosmetic) continue;

        layers.push({
          cosmeticId: cosmetic.id,
          category: cosmetic.category,
          renderData: cosmetic.renderData,
        });
      }
    }

    return layers.sort((a, b) => a.renderData.layerIndex - b.renderData.layerIndex);
  }

  // ==========================================================================
  // Statistics
  // ==========================================================================

  /**
   * Get cosmetic statistics.
   */
  getStatistics(): {
    totalOwned: number;
    totalAvailable: number;
    byCategory: Record<CosmeticCategory, number>;
    byRarity: Record<RarityTier, number>;
    rarestOwned: Cosmetic | null;
  } {
    const byCategory: Record<CosmeticCategory, number> = {
      hat: 0,
      accessory: 0,
      color: 0,
      background: 0,
      theme: 0,
    };

    const byRarity: Record<RarityTier, number> = {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    };

    let rarestOwned: Cosmetic | null = null;
    let highestRarity = 0;

    for (const item of this.inventory.items) {
      byCategory[item.category]++;
      byRarity[item.rarity]++;

      const rarityValue = RARITY_ORDER[item.rarity];
      if (rarityValue > highestRarity) {
        highestRarity = rarityValue;
        rarestOwned = item;
      }
    }

    return {
      totalOwned: this.inventory.items.length,
      totalAvailable: COSMETIC_CATALOG.length,
      byCategory,
      byRarity,
      rarestOwned,
    };
  }

  // ==========================================================================
  // Helper Methods
  // ==========================================================================

  /**
   * Get default empty inventory.
   */
  private getDefaultInventory(): CosmeticInventory {
    return {
      items: [],
      equipped: {},
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Persist inventory to storage.
   */
  private async persistInventory(): Promise<void> {
    await StorageService.setCosmeticInventory(this.inventory);
  }

  /**
   * Reset the service state (for testing or data reset).
   */
  reset(): void {
    this.inventory = this.getDefaultInventory();
    this.initialized = false;
  }

  /**
   * Force reload from storage.
   */
  async reload(): Promise<void> {
    this.initialized = false;
    await this.initialize();
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let cosmeticServiceInstance: CosmeticService | null = null;

/**
 * Get the singleton CosmeticService instance.
 */
export function getCosmeticService(): CosmeticService {
  if (!cosmeticServiceInstance) {
    cosmeticServiceInstance = new CosmeticService();
  }
  return cosmeticServiceInstance;
}

/**
 * Reset the singleton instance (for testing).
 */
export function resetCosmeticService(): void {
  if (cosmeticServiceInstance) {
    cosmeticServiceInstance.reset();
  }
  cosmeticServiceInstance = null;
}
