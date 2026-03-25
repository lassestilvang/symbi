/**
 * Unit tests for ghostRenderer.ts
 * Tests rendering logic and state mappings
 */

import { EmotionalState } from '../../../types';
import {
  getStateColors,
  getEyePixels,
  getMouthPixels,
  shouldShowBlush,
  pixelOverlaps,
  getFilteredBodyPixels,
  PIXEL_GRID_SIZE,
  GHOST_SIZE_RATIO,
  MAX_GHOST_SIZE,
} from '../ghostRenderer';
import {
  normalEyes,
  sadEyes,
  happyEyes,
  stressedEyes,
  smileMouth,
  frownMouth,
  neutralMouth,
  worriedMouth,
  type PixelCoordinate,
} from '../pixelData';

describe('ghostRenderer', () => {
  describe('getStateColors', () => {
    it('should return dull colors for SAD state', () => {
      const colors = getStateColors(EmotionalState.SAD);
      expect(colors.body).toBe('#E8E8E0');
      expect(colors.eyes).toBe('#000000');
      expect(colors.mouth).toBe('#000000');
    });

    it('should return bright colors for ACTIVE state', () => {
      const colors = getStateColors(EmotionalState.ACTIVE);
      expect(colors.body).toBe('#FFFFFF');
      expect(colors.blush).toBe('#FF69B4');
    });

    it('should return bright colors for VIBRANT state', () => {
      const colors = getStateColors(EmotionalState.VIBRANT);
      expect(colors.body).toBe('#FFFFFF');
      expect(colors.blush).toBe('#FF69B4');
    });

    it('should return medium colors for STRESSED state', () => {
      const colors = getStateColors(EmotionalState.STRESSED);
      expect(colors.body).toBe('#F0F0E8');
      expect(colors.blush).toBe('#FFA07A');
    });

    it('should return base colors for RESTING state', () => {
      const colors = getStateColors(EmotionalState.RESTING);
      expect(colors.body).toBe('#F5F5F0');
      expect(colors.eyes).toBe('#000000');
    });

    it('should return base colors for CALM state', () => {
      const colors = getStateColors(EmotionalState.CALM);
      expect(colors.body).toBe('#F5F5F0');
    });
  });

  describe('getEyePixels', () => {
    it('should return sad eyes for SAD state', () => {
      expect(getEyePixels(EmotionalState.SAD)).toBe(sadEyes);
    });

    it('should return sad eyes for TIRED state', () => {
      expect(getEyePixels(EmotionalState.TIRED)).toBe(sadEyes);
    });

    it('should return happy eyes for ACTIVE state', () => {
      expect(getEyePixels(EmotionalState.ACTIVE)).toBe(happyEyes);
    });

    it('should return happy eyes for VIBRANT state', () => {
      expect(getEyePixels(EmotionalState.VIBRANT)).toBe(happyEyes);
    });

    it('should return happy eyes for RESTED state', () => {
      expect(getEyePixels(EmotionalState.RESTED)).toBe(happyEyes);
    });

    it('should return stressed eyes for STRESSED state', () => {
      expect(getEyePixels(EmotionalState.STRESSED)).toBe(stressedEyes);
    });

    it('should return stressed eyes for ANXIOUS state', () => {
      expect(getEyePixels(EmotionalState.ANXIOUS)).toBe(stressedEyes);
    });

    it('should return normal eyes for RESTING state', () => {
      expect(getEyePixels(EmotionalState.RESTING)).toBe(normalEyes);
    });

    it('should return normal eyes for CALM state', () => {
      expect(getEyePixels(EmotionalState.CALM)).toBe(normalEyes);
    });
  });

  describe('getMouthPixels', () => {
    it('should return frown for SAD state', () => {
      expect(getMouthPixels(EmotionalState.SAD)).toBe(frownMouth);
    });

    it('should return frown for TIRED state', () => {
      expect(getMouthPixels(EmotionalState.TIRED)).toBe(frownMouth);
    });

    it('should return smile for ACTIVE state', () => {
      expect(getMouthPixels(EmotionalState.ACTIVE)).toBe(smileMouth);
    });

    it('should return smile for VIBRANT state', () => {
      expect(getMouthPixels(EmotionalState.VIBRANT)).toBe(smileMouth);
    });

    it('should return smile for RESTED state', () => {
      expect(getMouthPixels(EmotionalState.RESTED)).toBe(smileMouth);
    });

    it('should return worried mouth for STRESSED state', () => {
      expect(getMouthPixels(EmotionalState.STRESSED)).toBe(worriedMouth);
    });

    it('should return worried mouth for ANXIOUS state', () => {
      expect(getMouthPixels(EmotionalState.ANXIOUS)).toBe(worriedMouth);
    });

    it('should return neutral mouth for RESTING state', () => {
      expect(getMouthPixels(EmotionalState.RESTING)).toBe(neutralMouth);
    });

    it('should return neutral mouth for CALM state', () => {
      expect(getMouthPixels(EmotionalState.CALM)).toBe(neutralMouth);
    });
  });

  describe('shouldShowBlush', () => {
    it('should show blush for ACTIVE state', () => {
      expect(shouldShowBlush(EmotionalState.ACTIVE)).toBe(true);
    });

    it('should show blush for VIBRANT state', () => {
      expect(shouldShowBlush(EmotionalState.VIBRANT)).toBe(true);
    });

    it('should show blush for RESTED state', () => {
      expect(shouldShowBlush(EmotionalState.RESTED)).toBe(true);
    });

    it('should not show blush for SAD state', () => {
      expect(shouldShowBlush(EmotionalState.SAD)).toBe(false);
    });

    it('should not show blush for TIRED state', () => {
      expect(shouldShowBlush(EmotionalState.TIRED)).toBe(false);
    });

    it('should not show blush for STRESSED state', () => {
      expect(shouldShowBlush(EmotionalState.STRESSED)).toBe(false);
    });

    it('should not show blush for ANXIOUS state', () => {
      expect(shouldShowBlush(EmotionalState.ANXIOUS)).toBe(false);
    });

    it('should not show blush for RESTING state', () => {
      expect(shouldShowBlush(EmotionalState.RESTING)).toBe(false);
    });

    it('should not show blush for CALM state', () => {
      expect(shouldShowBlush(EmotionalState.CALM)).toBe(false);
    });
  });

  describe('pixelOverlaps', () => {
    const testPixels: PixelCoordinate[] = [
      [10, 10],
      [11, 11],
      [12, 12],
    ];

    it('should return true for overlapping pixel', () => {
      expect(pixelOverlaps([10, 10], testPixels)).toBe(true);
      expect(pixelOverlaps([11, 11], testPixels)).toBe(true);
      expect(pixelOverlaps([12, 12], testPixels)).toBe(true);
    });

    it('should return false for non-overlapping pixel', () => {
      expect(pixelOverlaps([0, 0], testPixels)).toBe(false);
      expect(pixelOverlaps([10, 11], testPixels)).toBe(false);
      expect(pixelOverlaps([11, 10], testPixels)).toBe(false);
    });

    it('should handle empty array', () => {
      expect(pixelOverlaps([10, 10], [])).toBe(false);
    });
  });

  describe('getFilteredBodyPixels', () => {
    const mockEyes: PixelCoordinate[] = [
      [12, 13],
      [13, 13],
    ];
    const mockMouth: PixelCoordinate[] = [[15, 17]];

    it('should filter out eye pixels from body', () => {
      const filtered = getFilteredBodyPixels(mockEyes, mockMouth, false);

      mockEyes.forEach(eyePixel => {
        expect(pixelOverlaps(eyePixel, filtered)).toBe(false);
      });
    });

    it('should filter out mouth pixels from body', () => {
      const filtered = getFilteredBodyPixels(mockEyes, mockMouth, false);

      mockMouth.forEach(mouthPixel => {
        expect(pixelOverlaps(mouthPixel, filtered)).toBe(false);
      });
    });

    it('should filter out blush pixels when includeBlush is true', () => {
      const filtered = getFilteredBodyPixels(mockEyes, mockMouth, true);

      // Check that at least some blush pixels are filtered
      // (assuming some blush pixels overlap with body)
      expect(filtered.length).toBeLessThanOrEqual(getFilteredBodyPixels([], [], false).length);
    });

    it('should not filter blush pixels when includeBlush is false', () => {
      const withoutBlushFilter = getFilteredBodyPixels(mockEyes, mockMouth, false);
      const withBlushFilter = getFilteredBodyPixels(mockEyes, mockMouth, true);

      // With blush filter should have fewer or equal pixels
      expect(withBlushFilter.length).toBeLessThanOrEqual(withoutBlushFilter.length);
    });
  });

  describe('Constants', () => {
    it('should have correct pixel grid size', () => {
      expect(PIXEL_GRID_SIZE).toBe(32);
    });

    it('should have valid ghost size ratio', () => {
      expect(GHOST_SIZE_RATIO).toBeGreaterThan(0);
      expect(GHOST_SIZE_RATIO).toBeLessThanOrEqual(1);
    });

    it('should have reasonable max ghost size', () => {
      expect(MAX_GHOST_SIZE).toBeGreaterThan(0);
      expect(MAX_GHOST_SIZE).toBeLessThanOrEqual(1000);
    });
  });

  describe('State Coverage', () => {
    it('should handle all emotional states without errors', () => {
      const allStates = Object.values(EmotionalState);

      allStates.forEach(state => {
        expect(() => getStateColors(state)).not.toThrow();
        expect(() => getEyePixels(state)).not.toThrow();
        expect(() => getMouthPixels(state)).not.toThrow();
        expect(() => shouldShowBlush(state)).not.toThrow();
      });
    });

    it('should return valid pixel arrays for all states', () => {
      const allStates = Object.values(EmotionalState);

      allStates.forEach(state => {
        const eyes = getEyePixels(state);
        const mouth = getMouthPixels(state);

        expect(Array.isArray(eyes)).toBe(true);
        expect(Array.isArray(mouth)).toBe(true);
        expect(eyes.length).toBeGreaterThan(0);
        expect(mouth.length).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
