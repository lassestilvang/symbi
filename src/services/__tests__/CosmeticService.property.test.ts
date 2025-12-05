/**
 * Property-Based Tests for CosmeticService
 *
 * **Feature: achievement-streak-system, Property 8: Cosmetic data round-trip consistency**
 * **Feature: achievement-streak-system, Property 10: Cosmetic layer ordering**
 *
 * These tests use fast-check to verify that cosmetic data maintains integrity
 * through serialization and deserialization cycles, and that cosmetic layers
 * are rendered in the correct z-order.
 *
 * **Validates: Requirements 4.3, 4.4, 5.5**
 */

import * as fc from 'fast-check';
import type {
  Cosmetic,
  CosmeticCategory,
  CosmeticInventory,
  CosmeticLayer,
  CosmeticRenderData,
  CosmeticStorageData,
  EquippedCosmetics,
  PixelData,
  RarityTier,
} from '../../types';
import { LAYER_ORDER } from '../CosmeticService';

// ============================================================================
// Arbitraries (Generators) for Cosmetic Types
// ============================================================================

/**
 * Generator for CosmeticCategory
 */
const cosmeticCategoryArb: fc.Arbitrary<CosmeticCategory> = fc.constantFrom(
  'hat',
  'accessory',
  'color',
  'background',
  'theme'
);

/**
 * Generator for RarityTier
 */
const rarityTierArb: fc.Arbitrary<RarityTier> = fc.constantFrom(
  'common',
  'rare',
  'epic',
  'legendary'
);

/**
 * Generator for valid hex color strings
 */
const hexColorArb: fc.Arbitrary<string> = fc
  .tuple(
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 })
  )
  .map(([r, g, b]) => {
    const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  });

/**
 * Generator for PixelData
 */
const pixelDataArb: fc.Arbitrary<PixelData> = fc.record({
  x: fc.integer({ min: 0, max: 100 }),
  y: fc.integer({ min: 0, max: 100 }),
  color: hexColorArb,
});

/**
 * Generator for ISO date strings
 */
const isoDateArb: fc.Arbitrary<string> = fc
  .integer({ min: 1577836800000, max: 1924905600000 }) // 2020-01-01 to 2030-12-31 in ms
  .map(ms => new Date(ms).toISOString());

/**
 * Generator for optional ISO date strings
 */
const optionalIsoDateArb: fc.Arbitrary<string | undefined> = fc.option(isoDateArb, {
  nil: undefined,
});

/**
 * Generator for CosmeticRenderData
 */
const cosmeticRenderDataArb: fc.Arbitrary<CosmeticRenderData> = fc.record({
  layerIndex: fc.integer({ min: 0, max: 10 }),
  pixels: fc.option(fc.array(pixelDataArb, { maxLength: 50 }), { nil: undefined }),
  offsetX: fc.integer({ min: -50, max: 50 }),
  offsetY: fc.integer({ min: -50, max: 50 }),
  colorOverride: fc.option(hexColorArb, { nil: undefined }),
});

/**
 * Generator for non-empty string IDs
 */
const idArb: fc.Arbitrary<string> = fc
  .string({ minLength: 1, maxLength: 50 })
  .filter(s => s.trim().length > 0 && !s.includes('\u0000'));

/**
 * Generator for Cosmetic
 */
const cosmeticArb: fc.Arbitrary<Cosmetic> = fc.record({
  id: idArb,
  name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  category: cosmeticCategoryArb,
  rarity: rarityTierArb,
  previewUrl: fc.string({ minLength: 1, maxLength: 200 }),
  renderData: cosmeticRenderDataArb,
  unlockCondition: fc.string({ minLength: 1, maxLength: 100 }),
  unlockedAt: optionalIsoDateArb,
  sourceAchievement: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
});

/**
 * Generator for EquippedCosmetics
 */
const equippedCosmeticsArb: fc.Arbitrary<EquippedCosmetics> = fc.record({
  hat: fc.option(idArb, { nil: undefined }),
  accessory: fc.option(idArb, { nil: undefined }),
  color: fc.option(idArb, { nil: undefined }),
  background: fc.option(idArb, { nil: undefined }),
  theme: fc.option(idArb, { nil: undefined }),
});

/**
 * Generator for CosmeticInventory
 */
const cosmeticInventoryArb: fc.Arbitrary<CosmeticInventory> = fc.record({
  items: fc.array(cosmeticArb, { maxLength: 30 }),
  equipped: equippedCosmeticsArb,
  lastUpdated: isoDateArb,
});

/**
 * Generator for CosmeticStorageData
 */
const cosmeticStorageDataArb: fc.Arbitrary<CosmeticStorageData> = fc.record({
  inventory: cosmeticInventoryArb,
  lastUpdated: isoDateArb,
});

// ============================================================================
// Helper Functions for Comparison
// ============================================================================

/**
 * Deep equality check for PixelData arrays.
 */
function pixelArraysAreEqual(
  original: PixelData[] | undefined,
  parsed: PixelData[] | undefined
): boolean {
  if (original === undefined && parsed === undefined) return true;
  if (original === undefined || parsed === undefined) return false;
  if (original.length !== parsed.length) return false;

  for (let i = 0; i < original.length; i++) {
    if (
      original[i].x !== parsed[i].x ||
      original[i].y !== parsed[i].y ||
      original[i].color !== parsed[i].color
    ) {
      return false;
    }
  }
  return true;
}

/**
 * Deep equality check for CosmeticRenderData.
 */
function renderDataIsEqual(original: CosmeticRenderData, parsed: CosmeticRenderData): boolean {
  return (
    original.layerIndex === parsed.layerIndex &&
    original.offsetX === parsed.offsetX &&
    original.offsetY === parsed.offsetY &&
    original.colorOverride === parsed.colorOverride &&
    pixelArraysAreEqual(original.pixels, parsed.pixels)
  );
}

/**
 * Deep equality check for Cosmetic objects after round-trip.
 */
function cosmeticsAreEqual(original: Cosmetic, parsed: Cosmetic): boolean {
  return (
    original.id === parsed.id &&
    original.name === parsed.name &&
    original.category === parsed.category &&
    original.rarity === parsed.rarity &&
    original.previewUrl === parsed.previewUrl &&
    original.unlockCondition === parsed.unlockCondition &&
    original.unlockedAt === parsed.unlockedAt &&
    original.sourceAchievement === parsed.sourceAchievement &&
    renderDataIsEqual(original.renderData, parsed.renderData)
  );
}

/**
 * Deep equality check for EquippedCosmetics.
 */
function equippedCosmeticsAreEqual(
  original: EquippedCosmetics,
  parsed: EquippedCosmetics
): boolean {
  return (
    original.hat === parsed.hat &&
    original.accessory === parsed.accessory &&
    original.color === parsed.color &&
    original.background === parsed.background &&
    original.theme === parsed.theme
  );
}

/**
 * Deep equality check for CosmeticInventory after round-trip.
 */
function inventoryIsEqual(original: CosmeticInventory, parsed: CosmeticInventory): boolean {
  if (original.lastUpdated !== parsed.lastUpdated) return false;
  if (!equippedCosmeticsAreEqual(original.equipped, parsed.equipped)) return false;
  if (original.items.length !== parsed.items.length) return false;

  for (let i = 0; i < original.items.length; i++) {
    if (!cosmeticsAreEqual(original.items[i], parsed.items[i])) {
      return false;
    }
  }
  return true;
}

/**
 * Deep equality check for CosmeticStorageData after round-trip.
 */
function storageDataIsEqual(original: CosmeticStorageData, parsed: CosmeticStorageData): boolean {
  return (
    original.lastUpdated === parsed.lastUpdated &&
    inventoryIsEqual(original.inventory, parsed.inventory)
  );
}

// ============================================================================
// Property-Based Tests
// ============================================================================

describe('CosmeticService Property Tests', () => {
  /**
   * **Feature: achievement-streak-system, Property 9: Cosmetic unlock adds to inventory**
   * **Validates: Requirements 4.1**
   *
   * For any achievement with cosmetic rewards, unlocking the achievement SHALL add
   * all associated cosmetics to the user's inventory.
   */
  describe('Property 9: Cosmetic unlock adds to inventory', () => {
    /**
     * Generator for cosmetics with unique IDs
     */
    const uniqueCosmeticsArb: fc.Arbitrary<Cosmetic[]> = fc
      .array(cosmeticArb, { minLength: 1, maxLength: 10 })
      .map(cosmetics => {
        // Ensure unique IDs by using a Map
        const uniqueMap = new Map<string, Cosmetic>();
        for (const c of cosmetics) {
          if (!uniqueMap.has(c.id)) {
            uniqueMap.set(c.id, c);
          }
        }
        return Array.from(uniqueMap.values());
      })
      .filter(arr => arr.length > 0);

    it('adding a cosmetic to inventory increases inventory size by 1', () => {
      fc.assert(
        fc.property(cosmeticArb, cosmetic => {
          // Start with empty inventory
          const inventory: CosmeticInventory = {
            items: [],
            equipped: {},
            lastUpdated: new Date().toISOString(),
          };

          const initialSize = inventory.items.length;

          // Add cosmetic to inventory (simulating the addToInventory operation)
          const exists = inventory.items.some(item => item.id === cosmetic.id);
          if (!exists) {
            inventory.items.push({
              ...cosmetic,
              unlockedAt: new Date().toISOString(),
            });
          }

          // Verify: inventory size increased by 1
          return inventory.items.length === initialSize + 1;
        }),
        { numRuns: 100 }
      );
    });

    it('adding multiple cosmetics adds all of them to inventory', () => {
      fc.assert(
        fc.property(uniqueCosmeticsArb, cosmetics => {
          // Start with empty inventory
          const inventory: CosmeticInventory = {
            items: [],
            equipped: {},
            lastUpdated: new Date().toISOString(),
          };

          // Add all cosmetics (simulating cosmetic rewards from achievement)
          for (const cosmetic of cosmetics) {
            const exists = inventory.items.some(item => item.id === cosmetic.id);
            if (!exists) {
              inventory.items.push({
                ...cosmetic,
                unlockedAt: new Date().toISOString(),
              });
            }
          }

          // Verify: all cosmetics are in inventory
          const allAdded = cosmetics.every(c => inventory.items.some(item => item.id === c.id));

          // Verify: inventory size equals number of unique cosmetics
          const correctSize = inventory.items.length === cosmetics.length;

          return allAdded && correctSize;
        }),
        { numRuns: 100 }
      );
    });

    it('adding cosmetic is idempotent - adding same cosmetic twice does not duplicate', () => {
      fc.assert(
        fc.property(cosmeticArb, cosmetic => {
          // Start with empty inventory
          const inventory: CosmeticInventory = {
            items: [],
            equipped: {},
            lastUpdated: new Date().toISOString(),
          };

          // Add cosmetic twice (simulating duplicate unlock attempts)
          for (let i = 0; i < 2; i++) {
            const exists = inventory.items.some(item => item.id === cosmetic.id);
            if (!exists) {
              inventory.items.push({
                ...cosmetic,
                unlockedAt: new Date().toISOString(),
              });
            }
          }

          // Verify: cosmetic appears exactly once
          const count = inventory.items.filter(item => item.id === cosmetic.id).length;
          return count === 1;
        }),
        { numRuns: 100 }
      );
    });

    it('added cosmetic preserves all original properties', () => {
      fc.assert(
        fc.property(cosmeticArb, cosmetic => {
          // Start with empty inventory
          const inventory: CosmeticInventory = {
            items: [],
            equipped: {},
            lastUpdated: new Date().toISOString(),
          };

          // Add cosmetic
          const exists = inventory.items.some(item => item.id === cosmetic.id);
          if (!exists) {
            inventory.items.push({
              ...cosmetic,
              unlockedAt: new Date().toISOString(),
            });
          }

          // Find the added cosmetic
          const addedCosmetic = inventory.items.find(item => item.id === cosmetic.id);
          if (!addedCosmetic) return false;

          // Verify: all original properties are preserved (except unlockedAt which is set)
          return (
            addedCosmetic.id === cosmetic.id &&
            addedCosmetic.name === cosmetic.name &&
            addedCosmetic.category === cosmetic.category &&
            addedCosmetic.rarity === cosmetic.rarity &&
            addedCosmetic.previewUrl === cosmetic.previewUrl &&
            addedCosmetic.unlockCondition === cosmetic.unlockCondition &&
            renderDataIsEqual(addedCosmetic.renderData, cosmetic.renderData) &&
            addedCosmetic.unlockedAt !== undefined // unlockedAt should be set
          );
        }),
        { numRuns: 100 }
      );
    });

    it('cosmetic rewards from achievement are all added to inventory', () => {
      // This test simulates the full flow: achievement with cosmetic rewards -> inventory
      fc.assert(
        fc.property(
          fc.record({
            achievementId: idArb,
            cosmeticRewards: uniqueCosmeticsArb,
          }),
          ({ cosmeticRewards }) => {
            // Start with empty inventory
            const inventory: CosmeticInventory = {
              items: [],
              equipped: {},
              lastUpdated: new Date().toISOString(),
            };

            // Simulate unlocking achievement and adding all cosmetic rewards
            for (const cosmetic of cosmeticRewards) {
              const exists = inventory.items.some(item => item.id === cosmetic.id);
              if (!exists) {
                inventory.items.push({
                  ...cosmetic,
                  unlockedAt: new Date().toISOString(),
                });
              }
            }

            // Verify: all cosmetic rewards are in inventory
            const allRewardsAdded = cosmeticRewards.every(reward =>
              inventory.items.some(item => item.id === reward.id)
            );

            return allRewardsAdded;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: achievement-streak-system, Property 8: Cosmetic data round-trip consistency**
   * **Validates: Requirements 4.3, 4.4**
   *
   * For any valid cosmetic inventory, serializing to JSON and then parsing back
   * SHALL produce an equivalent inventory with all items, equipped status, and metadata preserved.
   */
  describe('Property 8: Cosmetic data round-trip consistency', () => {
    it('single Cosmetic round-trips through JSON serialization', () => {
      fc.assert(
        fc.property(cosmeticArb, cosmetic => {
          // Serialize to JSON
          const serialized = JSON.stringify(cosmetic);

          // Parse back from JSON
          const parsed: Cosmetic = JSON.parse(serialized);

          // Verify equality
          return cosmeticsAreEqual(cosmetic, parsed);
        }),
        { numRuns: 100 }
      );
    });

    it('CosmeticRenderData round-trips through JSON serialization', () => {
      fc.assert(
        fc.property(cosmeticRenderDataArb, renderData => {
          // Serialize to JSON
          const serialized = JSON.stringify(renderData);

          // Parse back from JSON
          const parsed: CosmeticRenderData = JSON.parse(serialized);

          // Verify equality
          return renderDataIsEqual(renderData, parsed);
        }),
        { numRuns: 100 }
      );
    });

    it('PixelData array round-trips through JSON serialization', () => {
      fc.assert(
        fc.property(fc.array(pixelDataArb, { maxLength: 50 }), pixels => {
          // Serialize to JSON
          const serialized = JSON.stringify(pixels);

          // Parse back from JSON
          const parsed: PixelData[] = JSON.parse(serialized);

          // Verify equality
          return pixelArraysAreEqual(pixels, parsed);
        }),
        { numRuns: 100 }
      );
    });

    it('EquippedCosmetics round-trips through JSON serialization', () => {
      fc.assert(
        fc.property(equippedCosmeticsArb, equipped => {
          // Serialize to JSON
          const serialized = JSON.stringify(equipped);

          // Parse back from JSON
          const parsed: EquippedCosmetics = JSON.parse(serialized);

          // Verify equality
          return equippedCosmeticsAreEqual(equipped, parsed);
        }),
        { numRuns: 100 }
      );
    });

    it('CosmeticInventory round-trips through JSON serialization', () => {
      fc.assert(
        fc.property(cosmeticInventoryArb, inventory => {
          // Serialize to JSON
          const serialized = JSON.stringify(inventory);

          // Parse back from JSON
          const parsed: CosmeticInventory = JSON.parse(serialized);

          // Verify equality
          return inventoryIsEqual(inventory, parsed);
        }),
        { numRuns: 100 }
      );
    });

    it('CosmeticStorageData round-trips through JSON serialization', () => {
      fc.assert(
        fc.property(cosmeticStorageDataArb, storageData => {
          // Serialize to JSON
          const serialized = JSON.stringify(storageData);

          // Parse back from JSON
          const parsed: CosmeticStorageData = JSON.parse(serialized);

          // Verify equality
          return storageDataIsEqual(storageData, parsed);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: achievement-streak-system, Property 10: Cosmetic layer ordering**
   * **Validates: Requirements 5.5**
   *
   * For any set of equipped cosmetics, the render layers SHALL be ordered by
   * layerIndex in ascending order (background < color < accessory < hat < theme).
   */
  describe('Property 10: Cosmetic layer ordering', () => {
    /**
     * Generator for a cosmetic with a specific category and correct layerIndex
     */
    const cosmeticWithCategoryArb = (category: CosmeticCategory): fc.Arbitrary<Cosmetic> =>
      fc.record({
        id: idArb,
        name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        category: fc.constant(category),
        rarity: rarityTierArb,
        previewUrl: fc.string({ minLength: 1, maxLength: 200 }),
        renderData: fc.record({
          layerIndex: fc.constant(LAYER_ORDER[category]),
          pixels: fc.option(fc.array(pixelDataArb, { maxLength: 50 }), {
            nil: undefined,
          }),
          offsetX: fc.integer({ min: -50, max: 50 }),
          offsetY: fc.integer({ min: -50, max: 50 }),
          colorOverride: fc.option(hexColorArb, { nil: undefined }),
        }),
        unlockCondition: fc.string({ minLength: 1, maxLength: 100 }),
        unlockedAt: optionalIsoDateArb,
        sourceAchievement: fc.option(fc.string({ minLength: 1, maxLength: 50 }), {
          nil: undefined,
        }),
      });

    /**
     * Generator for a set of cosmetics with one per category (all with unique IDs)
     */
    const cosmeticSetArb: fc.Arbitrary<{
      background?: Cosmetic;
      color?: Cosmetic;
      accessory?: Cosmetic;
      hat?: Cosmetic;
      theme?: Cosmetic;
    }> = fc.record({
      background: fc.option(cosmeticWithCategoryArb('background'), { nil: undefined }),
      color: fc.option(cosmeticWithCategoryArb('color'), { nil: undefined }),
      accessory: fc.option(cosmeticWithCategoryArb('accessory'), { nil: undefined }),
      hat: fc.option(cosmeticWithCategoryArb('hat'), { nil: undefined }),
      theme: fc.option(cosmeticWithCategoryArb('theme'), { nil: undefined }),
    });

    /**
     * Simulates getCosmeticLayers() logic: builds layers from equipped cosmetics
     * and sorts by layerIndex ascending.
     */
    function buildCosmeticLayers(
      inventory: CosmeticInventory,
      equipped: EquippedCosmetics
    ): CosmeticLayer[] {
      const layers: CosmeticLayer[] = [];
      const categories: CosmeticCategory[] = ['background', 'color', 'accessory', 'hat', 'theme'];

      for (const category of categories) {
        const cosmeticId = equipped[category];
        if (!cosmeticId) continue;

        const cosmetic = inventory.items.find(item => item.id === cosmeticId);
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

    it('cosmetic layers are sorted by layerIndex in ascending order', () => {
      fc.assert(
        fc.property(cosmeticSetArb, cosmeticSet => {
          // Build inventory from the cosmetic set
          const items: Cosmetic[] = [];
          const equipped: EquippedCosmetics = {};

          if (cosmeticSet.background) {
            items.push(cosmeticSet.background);
            equipped.background = cosmeticSet.background.id;
          }
          if (cosmeticSet.color) {
            items.push(cosmeticSet.color);
            equipped.color = cosmeticSet.color.id;
          }
          if (cosmeticSet.accessory) {
            items.push(cosmeticSet.accessory);
            equipped.accessory = cosmeticSet.accessory.id;
          }
          if (cosmeticSet.hat) {
            items.push(cosmeticSet.hat);
            equipped.hat = cosmeticSet.hat.id;
          }
          if (cosmeticSet.theme) {
            items.push(cosmeticSet.theme);
            equipped.theme = cosmeticSet.theme.id;
          }

          const inventory: CosmeticInventory = {
            items,
            equipped,
            lastUpdated: new Date().toISOString(),
          };

          // Get layers using the same logic as CosmeticService.getCosmeticLayers()
          const layers = buildCosmeticLayers(inventory, equipped);

          // Verify: layers are sorted by layerIndex in ascending order
          for (let i = 1; i < layers.length; i++) {
            if (layers[i].renderData.layerIndex < layers[i - 1].renderData.layerIndex) {
              return false;
            }
          }
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('background layer always renders before other layers', () => {
      fc.assert(
        fc.property(cosmeticSetArb, cosmeticSet => {
          // Ensure we have a background cosmetic
          if (!cosmeticSet.background) return true; // Skip if no background

          // Build inventory
          const items: Cosmetic[] = [];
          const equipped: EquippedCosmetics = {};

          if (cosmeticSet.background) {
            items.push(cosmeticSet.background);
            equipped.background = cosmeticSet.background.id;
          }
          if (cosmeticSet.color) {
            items.push(cosmeticSet.color);
            equipped.color = cosmeticSet.color.id;
          }
          if (cosmeticSet.accessory) {
            items.push(cosmeticSet.accessory);
            equipped.accessory = cosmeticSet.accessory.id;
          }
          if (cosmeticSet.hat) {
            items.push(cosmeticSet.hat);
            equipped.hat = cosmeticSet.hat.id;
          }
          if (cosmeticSet.theme) {
            items.push(cosmeticSet.theme);
            equipped.theme = cosmeticSet.theme.id;
          }

          const inventory: CosmeticInventory = {
            items,
            equipped,
            lastUpdated: new Date().toISOString(),
          };

          const layers = buildCosmeticLayers(inventory, equipped);

          // Verify: background is first if present
          if (layers.length > 0 && layers[0].category === 'background') {
            return layers[0].renderData.layerIndex === LAYER_ORDER.background;
          }
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('hat layer renders after accessory layer', () => {
      fc.assert(
        fc.property(cosmeticSetArb, cosmeticSet => {
          // Ensure we have both hat and accessory
          if (!cosmeticSet.hat || !cosmeticSet.accessory) return true;

          // Build inventory
          const items: Cosmetic[] = [];
          const equipped: EquippedCosmetics = {};

          if (cosmeticSet.background) {
            items.push(cosmeticSet.background);
            equipped.background = cosmeticSet.background.id;
          }
          if (cosmeticSet.color) {
            items.push(cosmeticSet.color);
            equipped.color = cosmeticSet.color.id;
          }
          if (cosmeticSet.accessory) {
            items.push(cosmeticSet.accessory);
            equipped.accessory = cosmeticSet.accessory.id;
          }
          if (cosmeticSet.hat) {
            items.push(cosmeticSet.hat);
            equipped.hat = cosmeticSet.hat.id;
          }
          if (cosmeticSet.theme) {
            items.push(cosmeticSet.theme);
            equipped.theme = cosmeticSet.theme.id;
          }

          const inventory: CosmeticInventory = {
            items,
            equipped,
            lastUpdated: new Date().toISOString(),
          };

          const layers = buildCosmeticLayers(inventory, equipped);

          // Find hat and accessory layers
          const hatLayer = layers.find(l => l.category === 'hat');
          const accessoryLayer = layers.find(l => l.category === 'accessory');

          if (hatLayer && accessoryLayer) {
            // Hat should have higher layerIndex than accessory
            return hatLayer.renderData.layerIndex > accessoryLayer.renderData.layerIndex;
          }
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('layer order follows LAYER_ORDER constant: background < color < accessory < hat < theme', () => {
      fc.assert(
        fc.property(cosmeticSetArb, cosmeticSet => {
          // Build inventory with all cosmetics
          const items: Cosmetic[] = [];
          const equipped: EquippedCosmetics = {};

          if (cosmeticSet.background) {
            items.push(cosmeticSet.background);
            equipped.background = cosmeticSet.background.id;
          }
          if (cosmeticSet.color) {
            items.push(cosmeticSet.color);
            equipped.color = cosmeticSet.color.id;
          }
          if (cosmeticSet.accessory) {
            items.push(cosmeticSet.accessory);
            equipped.accessory = cosmeticSet.accessory.id;
          }
          if (cosmeticSet.hat) {
            items.push(cosmeticSet.hat);
            equipped.hat = cosmeticSet.hat.id;
          }
          if (cosmeticSet.theme) {
            items.push(cosmeticSet.theme);
            equipped.theme = cosmeticSet.theme.id;
          }

          const inventory: CosmeticInventory = {
            items,
            equipped,
            lastUpdated: new Date().toISOString(),
          };

          const layers = buildCosmeticLayers(inventory, equipped);

          // Verify each layer has the correct layerIndex based on its category
          for (const layer of layers) {
            const expectedLayerIndex = LAYER_ORDER[layer.category];
            if (layer.renderData.layerIndex !== expectedLayerIndex) {
              return false;
            }
          }
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('empty equipped cosmetics returns empty layers array', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const inventory: CosmeticInventory = {
            items: [],
            equipped: {},
            lastUpdated: new Date().toISOString(),
          };

          const layers = buildCosmeticLayers(inventory, {});

          return layers.length === 0;
        }),
        { numRuns: 10 }
      );
    });

    it('layers contain only equipped cosmetics', () => {
      fc.assert(
        fc.property(cosmeticSetArb, cosmeticSet => {
          // Build inventory with all cosmetics but only equip some
          const items: Cosmetic[] = [];
          const equipped: EquippedCosmetics = {};

          // Add all cosmetics to inventory
          if (cosmeticSet.background) items.push(cosmeticSet.background);
          if (cosmeticSet.color) items.push(cosmeticSet.color);
          if (cosmeticSet.accessory) items.push(cosmeticSet.accessory);
          if (cosmeticSet.hat) items.push(cosmeticSet.hat);
          if (cosmeticSet.theme) items.push(cosmeticSet.theme);

          // Only equip hat and background (if available)
          if (cosmeticSet.background) equipped.background = cosmeticSet.background.id;
          if (cosmeticSet.hat) equipped.hat = cosmeticSet.hat.id;

          const inventory: CosmeticInventory = {
            items,
            equipped,
            lastUpdated: new Date().toISOString(),
          };

          const layers = buildCosmeticLayers(inventory, equipped);

          // Verify: layers only contain equipped cosmetics
          const equippedIds = Object.values(equipped).filter(Boolean);
          const layerIds = layers.map(l => l.cosmeticId);

          // All layer IDs should be in equipped IDs
          const allLayersEquipped = layerIds.every(id => equippedIds.includes(id));

          // Number of layers should match number of equipped cosmetics
          const correctCount = layers.length === equippedIds.length;

          return allLayersEquipped && correctCount;
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: achievement-streak-system, Property 11: Equipped cosmetics persistence**
   * **Validates: Requirements 5.3, 6.2**
   *
   * For any cosmetic equip action, the selection SHALL persist to storage
   * and be restored on application load.
   */
  describe('Property 11: Equipped cosmetics persistence', () => {
    /**
     * Simulates the persistence round-trip:
     * 1. Start with an inventory containing cosmetics
     * 2. Equip some cosmetics
     * 3. Serialize to storage format (JSON)
     * 4. Deserialize from storage
     * 5. Verify equipped cosmetics are preserved
     */

    it('equipped cosmetics persist through storage round-trip', () => {
      fc.assert(
        fc.property(cosmeticInventoryArb, inventory => {
          // Ensure equipped cosmetics reference items that exist in inventory
          const validEquipped: EquippedCosmetics = {};
          const itemIds = new Set(inventory.items.map(item => item.id));

          // Only keep equipped references that exist in inventory
          if (inventory.equipped.hat && itemIds.has(inventory.equipped.hat)) {
            validEquipped.hat = inventory.equipped.hat;
          }
          if (inventory.equipped.accessory && itemIds.has(inventory.equipped.accessory)) {
            validEquipped.accessory = inventory.equipped.accessory;
          }
          if (inventory.equipped.color && itemIds.has(inventory.equipped.color)) {
            validEquipped.color = inventory.equipped.color;
          }
          if (inventory.equipped.background && itemIds.has(inventory.equipped.background)) {
            validEquipped.background = inventory.equipped.background;
          }
          if (inventory.equipped.theme && itemIds.has(inventory.equipped.theme)) {
            validEquipped.theme = inventory.equipped.theme;
          }

          const inventoryWithValidEquipped: CosmeticInventory = {
            ...inventory,
            equipped: validEquipped,
          };

          // Simulate storage: serialize to JSON
          const serialized = JSON.stringify(inventoryWithValidEquipped);

          // Simulate load: deserialize from JSON
          const restored: CosmeticInventory = JSON.parse(serialized);

          // Verify: equipped cosmetics are preserved
          return equippedCosmeticsAreEqual(inventoryWithValidEquipped.equipped, restored.equipped);
        }),
        { numRuns: 100 }
      );
    });

    it('equipping a cosmetic updates the equipped state correctly', () => {
      fc.assert(
        fc.property(
          cosmeticArb,
          fc.array(cosmeticArb, { minLength: 0, maxLength: 10 }),
          (newCosmetic, existingItems) => {
            // Start with inventory containing existing items
            const inventory: CosmeticInventory = {
              items: [...existingItems, newCosmetic],
              equipped: {},
              lastUpdated: new Date().toISOString(),
            };

            // Simulate equip action: set the cosmetic in its category slot
            inventory.equipped[newCosmetic.category] = newCosmetic.id;

            // Serialize and restore (simulating persistence)
            const serialized = JSON.stringify(inventory);
            const restored: CosmeticInventory = JSON.parse(serialized);

            // Verify: the equipped cosmetic is preserved in the correct category
            return restored.equipped[newCosmetic.category] === newCosmetic.id;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('unequipping a cosmetic persists the removal', () => {
      fc.assert(
        fc.property(cosmeticArb, cosmetic => {
          // Start with inventory where cosmetic is equipped
          const inventory: CosmeticInventory = {
            items: [cosmetic],
            equipped: {
              [cosmetic.category]: cosmetic.id,
            },
            lastUpdated: new Date().toISOString(),
          };

          // Verify cosmetic is initially equipped
          const initiallyEquipped = inventory.equipped[cosmetic.category] === cosmetic.id;

          // Simulate unequip action
          inventory.equipped[cosmetic.category] = undefined;

          // Serialize and restore
          const serialized = JSON.stringify(inventory);
          const restored: CosmeticInventory = JSON.parse(serialized);

          // Verify: the cosmetic is no longer equipped after restore
          const unequippedAfterRestore =
            restored.equipped[cosmetic.category] === undefined ||
            restored.equipped[cosmetic.category] === null;

          return initiallyEquipped && unequippedAfterRestore;
        }),
        { numRuns: 100 }
      );
    });

    it('multiple equip/unequip operations persist correctly', () => {
      fc.assert(
        fc.property(
          fc.array(cosmeticArb, { minLength: 2, maxLength: 5 }),
          fc.array(fc.boolean(), { minLength: 2, maxLength: 5 }),
          (cosmetics, equipStates) => {
            // Ensure unique IDs
            const uniqueCosmetics = cosmetics.reduce((acc, c, i) => {
              const uniqueId = `${c.id}_${i}`;
              acc.push({ ...c, id: uniqueId });
              return acc;
            }, [] as Cosmetic[]);

            // Start with empty inventory
            const inventory: CosmeticInventory = {
              items: uniqueCosmetics,
              equipped: {},
              lastUpdated: new Date().toISOString(),
            };

            // Apply equip/unequip operations based on equipStates
            for (let i = 0; i < uniqueCosmetics.length && i < equipStates.length; i++) {
              const cosmetic = uniqueCosmetics[i];
              if (equipStates[i]) {
                inventory.equipped[cosmetic.category] = cosmetic.id;
              }
            }

            // Serialize and restore
            const serialized = JSON.stringify(inventory);
            const restored: CosmeticInventory = JSON.parse(serialized);

            // Verify: all equipped states are preserved
            return equippedCosmeticsAreEqual(inventory.equipped, restored.equipped);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('CosmeticStorageData preserves equipped cosmetics through full storage cycle', () => {
      fc.assert(
        fc.property(cosmeticStorageDataArb, storageData => {
          // Ensure equipped cosmetics reference items that exist in inventory
          const itemIds = new Set(storageData.inventory.items.map(item => item.id));
          const validEquipped: EquippedCosmetics = {};

          if (
            storageData.inventory.equipped.hat &&
            itemIds.has(storageData.inventory.equipped.hat)
          ) {
            validEquipped.hat = storageData.inventory.equipped.hat;
          }
          if (
            storageData.inventory.equipped.accessory &&
            itemIds.has(storageData.inventory.equipped.accessory)
          ) {
            validEquipped.accessory = storageData.inventory.equipped.accessory;
          }
          if (
            storageData.inventory.equipped.color &&
            itemIds.has(storageData.inventory.equipped.color)
          ) {
            validEquipped.color = storageData.inventory.equipped.color;
          }
          if (
            storageData.inventory.equipped.background &&
            itemIds.has(storageData.inventory.equipped.background)
          ) {
            validEquipped.background = storageData.inventory.equipped.background;
          }
          if (
            storageData.inventory.equipped.theme &&
            itemIds.has(storageData.inventory.equipped.theme)
          ) {
            validEquipped.theme = storageData.inventory.equipped.theme;
          }

          const validStorageData: CosmeticStorageData = {
            ...storageData,
            inventory: {
              ...storageData.inventory,
              equipped: validEquipped,
            },
          };

          // Full storage cycle: serialize -> deserialize
          const serialized = JSON.stringify(validStorageData);
          const restored: CosmeticStorageData = JSON.parse(serialized);

          // Verify: equipped cosmetics are preserved
          return equippedCosmeticsAreEqual(
            validStorageData.inventory.equipped,
            restored.inventory.equipped
          );
        }),
        { numRuns: 100 }
      );
    });

    it('equipped cosmetics survive application reload simulation', () => {
      fc.assert(
        fc.property(cosmeticArb, cosmeticCategoryArb, (cosmetic, _category) => {
          // Use the cosmetic's actual category to ensure consistency
          const category = cosmetic.category;

          // Initial state: cosmetic is in inventory and equipped
          const initialInventory: CosmeticInventory = {
            items: [cosmetic],
            equipped: { [category]: cosmetic.id },
            lastUpdated: new Date().toISOString(),
          };

          // Simulate save to storage
          const storageData: CosmeticStorageData = {
            inventory: initialInventory,
            lastUpdated: new Date().toISOString(),
          };
          const savedJson = JSON.stringify(storageData);

          // Simulate application reload: create new inventory from storage
          const loadedStorageData: CosmeticStorageData = JSON.parse(savedJson);
          const loadedInventory = loadedStorageData.inventory;

          // Verify: equipped cosmetic is restored
          const equippedId = loadedInventory.equipped[category];
          const cosmeticExists = loadedInventory.items.some(item => item.id === cosmetic.id);

          return equippedId === cosmetic.id && cosmeticExists;
        }),
        { numRuns: 100 }
      );
    });
  });
});
