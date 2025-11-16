/**
 * Unit tests for pixelData.ts
 * Tests pixel coordinate validity and data integrity
 */

import {
  ghostBodyPixels,
  normalEyes,
  sadEyes,
  happyEyes,
  stressedEyes,
  smileMouth,
  frownMouth,
  neutralMouth,
  worriedMouth,
  blushPixels,
  GHOST_GRID_SIZE,
  GHOST_MIN_Y,
  GHOST_MAX_Y,
  type PixelCoordinate,
} from '../pixelData';

describe('pixelData', () => {
  describe('Grid Constraints', () => {
    const validatePixelArray = (pixels: PixelCoordinate[]) => {
      pixels.forEach(([x, y]) => {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThan(GHOST_GRID_SIZE);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThan(GHOST_GRID_SIZE);

        // Ensure coordinates are integers
        expect(Number.isInteger(x)).toBe(true);
        expect(Number.isInteger(y)).toBe(true);
      });
    };

    it('should have valid ghostBodyPixels within 32x32 grid', () => {
      validatePixelArray(ghostBodyPixels);
    });

    it('should have valid eye pixels within 32x32 grid', () => {
      validatePixelArray(normalEyes);
      validatePixelArray(sadEyes);
      validatePixelArray(happyEyes);
      validatePixelArray(stressedEyes);
    });

    it('should have valid mouth pixels within 32x32 grid', () => {
      validatePixelArray(smileMouth);
      validatePixelArray(frownMouth);
      validatePixelArray(neutralMouth);
      validatePixelArray(worriedMouth);
    });

    it('should have valid blush pixels within 32x32 grid', () => {
      validatePixelArray(blushPixels);
    });
  });

  describe('Ghost Body', () => {
    it('should have a reasonable number of body pixels', () => {
      expect(ghostBodyPixels.length).toBeGreaterThan(50);
      expect(ghostBodyPixels.length).toBeLessThan(500);
    });

    it('should have body pixels within reasonable Y range', () => {
      // Find actual min/max Y values
      const yValues = ghostBodyPixels.map(([, y]) => y);
      const minY = Math.min(...yValues);
      const maxY = Math.max(...yValues);

      // Ghost should be roughly in the middle/upper portion of the grid
      expect(minY).toBeGreaterThanOrEqual(0);
      expect(minY).toBeLessThan(GHOST_GRID_SIZE / 2);
      expect(maxY).toBeLessThan(GHOST_GRID_SIZE);
      expect(maxY - minY).toBeGreaterThan(10); // Should have reasonable height
    });

    it('should have no duplicate body pixels', () => {
      const pixelSet = new Set(ghostBodyPixels.map(([x, y]) => `${x},${y}`));
      expect(pixelSet.size).toBe(ghostBodyPixels.length);
    });
  });

  describe('Eye Variations', () => {
    it('should have different eye sizes for different states', () => {
      // Sad eyes should be smaller or equal to normal
      expect(sadEyes.length).toBeLessThanOrEqual(normalEyes.length);
      // Happy eyes should be larger or equal to normal
      expect(happyEyes.length).toBeGreaterThanOrEqual(normalEyes.length);
      // Stressed eyes should be the largest
      expect(stressedEyes.length).toBeGreaterThanOrEqual(happyEyes.length);

      // Ensure they're actually different
      const sizes = [sadEyes.length, normalEyes.length, happyEyes.length, stressedEyes.length];
      const uniqueSizes = new Set(sizes);
      expect(uniqueSizes.size).toBeGreaterThan(1);
    });

    it('should have symmetrical eyes (left and right)', () => {
      // Normal eyes should have equal left and right pixels
      const leftEyes = normalEyes.filter(([x]) => x < 16);
      const rightEyes = normalEyes.filter(([x]) => x >= 16);
      expect(leftEyes.length).toBe(rightEyes.length);
    });

    it('should have no duplicate eye pixels', () => {
      [normalEyes, sadEyes, happyEyes, stressedEyes].forEach(eyes => {
        const pixelSet = new Set(eyes.map(([x, y]) => `${x},${y}`));
        expect(pixelSet.size).toBe(eyes.length);
      });
    });
  });

  describe('Mouth Variations', () => {
    it('should have different mouth shapes', () => {
      expect(smileMouth.length).toBeGreaterThan(0);
      expect(frownMouth.length).toBeGreaterThan(0);
      expect(neutralMouth.length).toBeGreaterThan(0);
      expect(worriedMouth.length).toBeGreaterThan(0);
    });

    it('should have mouths positioned below eyes', () => {
      const maxEyeY = Math.max(...normalEyes.map(([, y]) => y));
      const minMouthY = Math.min(...smileMouth.map(([, y]) => y));
      expect(minMouthY).toBeGreaterThan(maxEyeY);
    });

    it('should have no duplicate mouth pixels', () => {
      [smileMouth, frownMouth, neutralMouth, worriedMouth].forEach(mouth => {
        const pixelSet = new Set(mouth.map(([x, y]) => `${x},${y}`));
        expect(pixelSet.size).toBe(mouth.length);
      });
    });
  });

  describe('Blush', () => {
    it('should have blush pixels on both cheeks', () => {
      const leftBlush = blushPixels.filter(([x]) => x < 16);
      const rightBlush = blushPixels.filter(([x]) => x >= 16);

      expect(leftBlush.length).toBeGreaterThan(0);
      expect(rightBlush.length).toBeGreaterThan(0);
      expect(leftBlush.length).toBe(rightBlush.length);
    });

    it('should have blush positioned near eyes', () => {
      const avgEyeY = normalEyes.reduce((sum, [, y]) => sum + y, 0) / normalEyes.length;
      const avgBlushY = blushPixels.reduce((sum, [, y]) => sum + y, 0) / blushPixels.length;

      // Blush should be roughly at same height as eyes or slightly below
      expect(Math.abs(avgBlushY - avgEyeY)).toBeLessThan(5);
    });
  });

  describe('Constants', () => {
    it('should have correct grid size', () => {
      expect(GHOST_GRID_SIZE).toBe(32);
    });

    it('should have valid Y range', () => {
      expect(GHOST_MIN_Y).toBeGreaterThanOrEqual(0);
      expect(GHOST_MAX_Y).toBeLessThan(GHOST_GRID_SIZE);
      expect(GHOST_MIN_Y).toBeLessThan(GHOST_MAX_Y);
    });
  });
});
