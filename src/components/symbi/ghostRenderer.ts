/**
 * Ghost Renderer
 *
 * Handles all rendering logic for the 8-bit Symbi ghost.
 * Separates rendering concerns from component logic.
 */

import { EmotionalState } from '../../types';
import {
  PixelCoordinate,
  GhostColors,
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
} from './pixelData';

// Constants for rendering
export const PIXEL_GRID_SIZE = 32;
export const GHOST_SIZE_RATIO = 0.7;
export const MAX_GHOST_SIZE = 300;

// Color constants
const COLORS = {
  CREAM_WHITE: '#F5F5F0',
  DULL_WHITE: '#E8E8E0',
  BRIGHT_WHITE: '#FFFFFF',
  MEDIUM_WHITE: '#F0F0E8',
  BLACK: '#000000',
  LIGHT_PINK: '#FFB6C1',
  HOT_PINK: '#FF69B4',
  LIGHT_SALMON: '#FFA07A',
} as const;

/**
 * Get colors based on emotional state
 */
export const getStateColors = (state: EmotionalState): GhostColors => {
  const baseColors: GhostColors = {
    body: COLORS.CREAM_WHITE,
    eyes: COLORS.BLACK,
    mouth: COLORS.BLACK,
    blush: COLORS.LIGHT_PINK,
  };

  switch (state) {
    case EmotionalState.SAD:
    case EmotionalState.TIRED:
      return {
        ...baseColors,
        body: COLORS.DULL_WHITE,
      };
    case EmotionalState.ACTIVE:
    case EmotionalState.VIBRANT:
      return {
        ...baseColors,
        body: COLORS.BRIGHT_WHITE,
        blush: COLORS.HOT_PINK,
      };
    case EmotionalState.STRESSED:
    case EmotionalState.ANXIOUS:
      return {
        ...baseColors,
        body: COLORS.MEDIUM_WHITE,
        blush: COLORS.LIGHT_SALMON,
      };
    default:
      return baseColors;
  }
};

/**
 * Get eye pixels based on emotional state
 */
export const getEyePixels = (state: EmotionalState): PixelCoordinate[] => {
  switch (state) {
    case EmotionalState.SAD:
    case EmotionalState.TIRED:
      return sadEyes;
    case EmotionalState.ACTIVE:
    case EmotionalState.VIBRANT:
    case EmotionalState.RESTED:
      return happyEyes;
    case EmotionalState.STRESSED:
    case EmotionalState.ANXIOUS:
      return stressedEyes;
    case EmotionalState.RESTING:
    case EmotionalState.CALM:
    default:
      return normalEyes;
  }
};

/**
 * Get mouth pixels based on emotional state
 */
export const getMouthPixels = (state: EmotionalState): PixelCoordinate[] => {
  switch (state) {
    case EmotionalState.SAD:
    case EmotionalState.TIRED:
      return frownMouth;
    case EmotionalState.ACTIVE:
    case EmotionalState.VIBRANT:
    case EmotionalState.RESTED:
      return smileMouth;
    case EmotionalState.STRESSED:
    case EmotionalState.ANXIOUS:
      return worriedMouth;
    case EmotionalState.RESTING:
    case EmotionalState.CALM:
    default:
      return neutralMouth;
  }
};

/**
 * Determine if blush should be shown
 */
export const shouldShowBlush = (state: EmotionalState): boolean => {
  return [EmotionalState.ACTIVE, EmotionalState.VIBRANT, EmotionalState.RESTED].includes(state);
};

/**
 * Check if a pixel coordinate overlaps with any coordinate in an array
 */
export const pixelOverlaps = (pixel: PixelCoordinate, pixelArray: PixelCoordinate[]): boolean => {
  return pixelArray.some(([x, y]) => x === pixel[0] && y === pixel[1]);
};

/**
 * Filter body pixels to exclude facial features
 * Useful for rendering body without overlapping eyes/mouth/blush
 */
export const getFilteredBodyPixels = (
  eyePixels: PixelCoordinate[],
  mouthPixels: PixelCoordinate[],
  includeBlush: boolean
): PixelCoordinate[] => {
  return ghostBodyPixels.filter(pixel => {
    const isEye = pixelOverlaps(pixel, eyePixels);
    const isMouth = pixelOverlaps(pixel, mouthPixels);
    const isBlush = includeBlush && pixelOverlaps(pixel, blushPixels);
    return !isEye && !isMouth && !isBlush;
  });
};

/**
 * Helper to draw pixel art from coordinate array
 */
export const drawPixelArt = (
  ctx: CanvasRenderingContext2D,
  pixelSize: number,
  pixels: PixelCoordinate[],
  color: string
): void => {
  ctx.fillStyle = color;
  pixels.forEach(([x, y]) => {
    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
  });
};

/**
 * Main ghost rendering function
 */
export const renderGhost = (
  ctx: CanvasRenderingContext2D,
  size: number,
  emotionalState: EmotionalState
): void => {
  // Clear canvas
  ctx.clearRect(0, 0, size, size);

  // Calculate pixel size for 8-bit grid
  const pixelSize = size / PIXEL_GRID_SIZE;

  // Get colors based on emotional state
  const colors = getStateColors(emotionalState);

  // Draw ghost body
  drawPixelArt(ctx, pixelSize, ghostBodyPixels, colors.body);

  // Draw eyes based on emotional state
  const eyePixels = getEyePixels(emotionalState);
  drawPixelArt(ctx, pixelSize, eyePixels, colors.eyes);

  // Draw mouth based on emotional state
  const mouthPixels = getMouthPixels(emotionalState);
  if (mouthPixels.length > 0) {
    drawPixelArt(ctx, pixelSize, mouthPixels, colors.mouth);
  }

  // Add blush for certain states
  if (shouldShowBlush(emotionalState)) {
    drawPixelArt(ctx, pixelSize, blushPixels, colors.blush);
  }
};
