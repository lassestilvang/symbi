/**
 * CosmeticRenderer Component
 *
 * Extends Symbi8BitCanvas to render equipped cosmetics with layer-based rendering.
 * Supports preview mode for unequipped cosmetics.
 *
 * Requirements: 5.2, 5.5
 */

import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, ViewStyle, Animated, Pressable, Dimensions } from 'react-native';
import type { EmotionalState } from '../types';
import type { CosmeticLayer, PixelData } from '../types/cosmetics';
import { useSymbiAnimation } from '../hooks/useSymbiAnimation';
import { ghostBodyPixels, blushPixels } from './symbi/pixelData';
import {
  getStateColors,
  getEyePixels,
  getMouthPixels,
  shouldShowBlush,
  GHOST_SIZE_RATIO,
  MAX_GHOST_SIZE,
  PIXEL_GRID_SIZE,
} from './symbi/ghostRenderer';
import { useCosmeticStore } from '../stores/cosmeticStore';

interface CosmeticRendererProps {
  /** Current emotional state determining ghost appearance */
  emotionalState: EmotionalState;
  /** Optional custom styles */
  style?: ViewStyle;
  /** Size in pixels (default: 70% of screen width, max 300px) */
  size?: number;
  /** Callback fired when ghost is tapped/poked */
  onPoke?: () => void;
  /** Preview cosmetic ID - renders this cosmetic instead of equipped one for its category */
  previewCosmeticId?: string;
  /** Whether to show cosmetics (default: true) */
  showCosmetics?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_SIZE = Math.min(SCREEN_WIDTH * GHOST_SIZE_RATIO, MAX_GHOST_SIZE);

export const CosmeticRenderer: React.FC<CosmeticRendererProps> = ({
  emotionalState,
  style,
  size = DEFAULT_SIZE,
  onPoke,
  previewCosmeticId,
  showCosmetics = true,
}) => {
  // Animation hook
  const { bounceAnim, squishAnim, floatAnim, rotateAnim, handlePoke } = useSymbiAnimation({
    onPoke,
    enableFloating: true,
  });

  // Get cosmetic layers from store
  const cosmeticLayers = useCosmeticStore(state => state.cosmeticLayers);
  const getPreviewLayers = useCosmeticStore(state => state.getPreviewLayers);

  // Interpolate rotation for gentle sway
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-3deg', '3deg'],
  });

  // Memoize colors and pixels based on emotional state
  const colors = useMemo(() => getStateColors(emotionalState), [emotionalState]);
  const eyePixels = useMemo(() => getEyePixels(emotionalState), [emotionalState]);
  const mouthPixels = useMemo(() => getMouthPixels(emotionalState), [emotionalState]);
  const showBlush = useMemo(() => shouldShowBlush(emotionalState), [emotionalState]);

  // Calculate pixel size
  const pixelSize = useMemo(() => size / PIXEL_GRID_SIZE, [size]);

  // Get layers to render (either preview or equipped)
  const layersToRender = useMemo(() => {
    if (!showCosmetics) return [];
    if (previewCosmeticId) {
      return getPreviewLayers(previewCosmeticId);
    }
    return cosmeticLayers;
  }, [showCosmetics, previewCosmeticId, getPreviewLayers, cosmeticLayers]);

  // Get color override from equipped color cosmetic
  const colorOverride = useMemo(() => {
    const colorLayer = layersToRender.find(layer => layer.category === 'color');
    return colorLayer?.renderData.colorOverride;
  }, [layersToRender]);

  // Apply color override to body color
  const bodyColor = useMemo(() => {
    if (colorOverride && colorOverride !== 'rainbow') {
      return colorOverride;
    }
    return colors.body;
  }, [colorOverride, colors.body]);

  /**
   * Render individual pixel with spacing for pixelated effect
   */
  const renderPixel = useCallback(
    (x: number, y: number, color: string, key: string) => {
      const pixelGap = pixelSize * 0.07;
      const adjustedPixelSize = pixelSize - pixelGap;

      return (
        <View
          key={key}
          style={[
            styles.pixel,
            {
              width: adjustedPixelSize,
              height: adjustedPixelSize,
              left: x * pixelSize + pixelGap / 2,
              top: y * pixelSize + pixelGap / 2,
              backgroundColor: color,
            },
          ]}
        />
      );
    },
    [pixelSize]
  );

  /**
   * Filter out body pixels where eyes, mouth, and blush will be drawn
   */
  const filteredBodyPixels = useMemo(() => {
    return ghostBodyPixels.filter(([x, y]) => {
      const isEye = eyePixels.some(([ex, ey]) => ex === x && ey === y);
      const isMouth = mouthPixels.some(([mx, my]) => mx === x && my === y);
      const isBlush = showBlush && blushPixels.some(([bx, by]) => bx === x && by === y);
      return !isEye && !isMouth && !isBlush;
    });
  }, [eyePixels, mouthPixels, showBlush]);

  /**
   * Render cosmetic layer pixels with fallback for missing assets.
   * Implements graceful degradation for missing cosmetic assets (Requirements: 6.3).
   */
  const renderCosmeticLayer = useCallback(
    (layer: CosmeticLayer) => {
      const { renderData, cosmeticId, category } = layer;

      // Graceful fallback: skip rendering if no render data or pixels
      if (!renderData) {
        console.warn(`[CosmeticRenderer] Missing render data for cosmetic: ${cosmeticId}`);
        return null;
      }

      const pixels = renderData.pixels;

      // Skip if no pixels defined (some cosmetics like backgrounds may not have pixels)
      if (!pixels || pixels.length === 0) return null;

      const offsetX = renderData.offsetX || 0;
      const offsetY = renderData.offsetY || 0;

      return pixels.map((pixel: PixelData, index: number) => {
        // Validate pixel data before rendering
        if (pixel.x === undefined || pixel.y === undefined || !pixel.color) {
          console.warn(`[CosmeticRenderer] Invalid pixel data at index ${index} for ${cosmeticId}`);
          return null;
        }

        const adjustedX = pixel.x + Math.floor(offsetX / pixelSize);
        const adjustedY = pixel.y + Math.floor(offsetY / pixelSize);

        return renderPixel(adjustedX, adjustedY, pixel.color, `${cosmeticId}-${category}-${index}`);
      });
    },
    [pixelSize, renderPixel]
  );

  /**
   * Render background layer (special handling)
   */
  const renderBackgroundLayer = useCallback(
    (layer: CosmeticLayer) => {
      // Background layers could be full-canvas effects
      // For now, we'll render any pixels defined
      return renderCosmeticLayer(layer);
    },
    [renderCosmeticLayer]
  );

  /**
   * Get layers sorted by z-order for rendering.
   * Filters out invalid layers for graceful degradation (Requirements: 6.3).
   */
  const sortedLayers = useMemo(() => {
    // Filter out layers with missing or invalid render data
    const validLayers = layersToRender.filter(layer => {
      if (!layer.renderData) {
        console.warn(
          `[CosmeticRenderer] Skipping layer with missing renderData: ${layer.cosmeticId}`
        );
        return false;
      }
      if (typeof layer.renderData.layerIndex !== 'number') {
        console.warn(
          `[CosmeticRenderer] Skipping layer with invalid layerIndex: ${layer.cosmeticId}`
        );
        return false;
      }
      return true;
    });

    return validLayers.sort((a, b) => a.renderData.layerIndex - b.renderData.layerIndex);
  }, [layersToRender]);

  /**
   * Separate layers by render order
   */
  const { backgroundLayers, overlayLayers } = useMemo(() => {
    const bg: CosmeticLayer[] = [];
    const overlay: CosmeticLayer[] = [];

    for (const layer of sortedLayers) {
      if (layer.category === 'background') {
        bg.push(layer);
      } else if (layer.category !== 'color' && layer.category !== 'theme') {
        // Color is applied to body, theme is handled separately
        overlay.push(layer);
      }
    }

    return { backgroundLayers: bg, overlayLayers: overlay };
  }, [sortedLayers]);

  return (
    <Pressable onPress={handlePoke} style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.ghostWrapper,
          {
            width: size,
            height: size,
            transform: [
              { translateY: floatAnim },
              { rotate },
              { scaleY: bounceAnim },
              { scaleX: squishAnim },
            ],
          },
        ]}>
        <View style={styles.pixelContainer}>
          {/* Background cosmetics (rendered behind ghost) */}
          {backgroundLayers.map(layer => renderBackgroundLayer(layer))}

          {/* Ghost body (with cutouts for facial features) */}
          {filteredBodyPixels.map(([x, y], i) => renderPixel(x, y, bodyColor, `body-${i}`))}

          {/* Eyes */}
          {eyePixels.map(([x, y], i) => renderPixel(x, y, colors.eyes, `eye-${i}`))}

          {/* Mouth */}
          {mouthPixels.map(([x, y], i) => renderPixel(x, y, colors.mouth, `mouth-${i}`))}

          {/* Blush */}
          {showBlush &&
            blushPixels.map(([x, y], i) => renderPixel(x, y, colors.blush, `blush-${i}`))}

          {/* Overlay cosmetics (hats, accessories - rendered on top) */}
          {overlayLayers.map(layer => renderCosmeticLayer(layer))}
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ghostWrapper: {
    position: 'relative',
  },
  pixelContainer: {
    width: '100%',
    height: '100%',
  },
  pixel: {
    position: 'absolute',
  },
});
