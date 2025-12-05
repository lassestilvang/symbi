/**
 * Cosmetic Store
 *
 * Zustand store for managing cosmetic state including:
 * - Cosmetic inventory
 * - Equipped cosmetics
 * - Integration with CosmeticService
 *
 * Requirements: 4.1, 5.3
 */

import { create } from 'zustand';
import type {
  Cosmetic,
  CosmeticCategory,
  CosmeticLayer,
  EquippedCosmetics,
  RarityTier,
} from '../types';
import { getCosmeticService } from '../services/CosmeticService';

// ============================================================================
// Store Interface
// ============================================================================

interface CosmeticStoreState {
  // State
  inventory: Cosmetic[];
  equipped: EquippedCosmetics;
  cosmeticLayers: CosmeticLayer[];
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  addToInventory: (cosmetic: Cosmetic) => Promise<void>;
  addToInventoryById: (cosmeticId: string) => Promise<Cosmetic | null>;
  equipCosmetic: (cosmeticId: string) => Promise<boolean>;
  unequipCosmetic: (cosmeticId: string) => Promise<boolean>;
  getByCategory: (category: CosmeticCategory) => Cosmetic[];
  getByRarity: (rarity: RarityTier) => Cosmetic[];
  isOwned: (cosmeticId: string) => boolean;
  isEquipped: (cosmeticId: string) => boolean;
  getPreviewLayers: (previewCosmeticId: string) => CosmeticLayer[];
  refreshInventory: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
  inventory: [] as Cosmetic[],
  equipped: {} as EquippedCosmetics,
  cosmeticLayers: [] as CosmeticLayer[],
  isInitialized: false,
  isLoading: false,
  error: null as string | null,
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useCosmeticStore = create<CosmeticStoreState>((set, get) => ({
  ...initialState,

  /**
   * Initialize the store by loading data from CosmeticService
   */
  initialize: async () => {
    const { isInitialized, isLoading } = get();
    if (isInitialized || isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const service = getCosmeticService();
      await service.initialize();

      const inventoryData = service.getInventory();
      const cosmeticLayers = service.getCosmeticLayers();

      set({
        inventory: inventoryData.items,
        equipped: inventoryData.equipped,
        cosmeticLayers,
        isInitialized: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('[cosmeticStore] Error initializing:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to initialize cosmetics',
        isLoading: false,
      });
    }
  },

  /**
   * Add a cosmetic to inventory
   * Requirements: 4.1
   */
  addToInventory: async (cosmetic: Cosmetic) => {
    set({ isLoading: true, error: null });

    try {
      const service = getCosmeticService();
      await service.addToInventory(cosmetic);

      // Refresh state from service
      const inventoryData = service.getInventory();
      set({
        inventory: inventoryData.items,
        isLoading: false,
      });
    } catch (error) {
      console.error('[cosmeticStore] Error adding to inventory:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to add cosmetic',
        isLoading: false,
      });
    }
  },

  /**
   * Add a cosmetic to inventory by ID
   * Requirements: 4.1
   */
  addToInventoryById: async (cosmeticId: string) => {
    set({ isLoading: true, error: null });

    try {
      const service = getCosmeticService();
      const cosmetic = await service.addToInventoryById(cosmeticId);

      if (cosmetic) {
        // Refresh state from service
        const inventoryData = service.getInventory();
        set({
          inventory: inventoryData.items,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }

      return cosmetic;
    } catch (error) {
      console.error('[cosmeticStore] Error adding to inventory:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to add cosmetic',
        isLoading: false,
      });
      return null;
    }
  },

  /**
   * Equip a cosmetic
   * Requirements: 5.3
   */
  equipCosmetic: async (cosmeticId: string) => {
    set({ isLoading: true, error: null });

    try {
      const service = getCosmeticService();
      const success = await service.equipCosmetic(cosmeticId);

      if (success) {
        // Refresh state from service
        const inventoryData = service.getInventory();
        const cosmeticLayers = service.getCosmeticLayers();

        set({
          equipped: inventoryData.equipped,
          cosmeticLayers,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }

      return success;
    } catch (error) {
      console.error('[cosmeticStore] Error equipping cosmetic:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to equip cosmetic',
        isLoading: false,
      });
      return false;
    }
  },

  /**
   * Unequip a cosmetic
   * Requirements: 5.3
   */
  unequipCosmetic: async (cosmeticId: string) => {
    set({ isLoading: true, error: null });

    try {
      const service = getCosmeticService();
      const success = await service.unequipCosmetic(cosmeticId);

      if (success) {
        // Refresh state from service
        const inventoryData = service.getInventory();
        const cosmeticLayers = service.getCosmeticLayers();

        set({
          equipped: inventoryData.equipped,
          cosmeticLayers,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }

      return success;
    } catch (error) {
      console.error('[cosmeticStore] Error unequipping cosmetic:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to unequip cosmetic',
        isLoading: false,
      });
      return false;
    }
  },

  /**
   * Get cosmetics by category
   */
  getByCategory: (category: CosmeticCategory) => {
    const { inventory } = get();
    return inventory.filter(item => item.category === category);
  },

  /**
   * Get cosmetics by rarity
   */
  getByRarity: (rarity: RarityTier) => {
    const { inventory } = get();
    return inventory.filter(item => item.rarity === rarity);
  },

  /**
   * Check if a cosmetic is owned
   */
  isOwned: (cosmeticId: string) => {
    const { inventory } = get();
    return inventory.some(item => item.id === cosmeticId);
  },

  /**
   * Check if a cosmetic is equipped
   */
  isEquipped: (cosmeticId: string) => {
    const service = getCosmeticService();
    return service.isEquipped(cosmeticId);
  },

  /**
   * Get preview layers including a preview cosmetic
   */
  getPreviewLayers: (previewCosmeticId: string) => {
    const service = getCosmeticService();
    return service.getPreviewLayers(previewCosmeticId);
  },

  /**
   * Refresh inventory from service
   */
  refreshInventory: () => {
    const service = getCosmeticService();
    const inventoryData = service.getInventory();
    const cosmeticLayers = service.getCosmeticLayers();

    set({
      inventory: inventoryData.items,
      equipped: inventoryData.equipped,
      cosmeticLayers,
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error, isLoading: false });
  },

  reset: () => {
    set(initialState);
  },
}));
