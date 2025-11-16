# Symbi 8-Bit Ghost Rendering System

## Overview

This directory contains the pixel-art rendering system for the 8-bit style Symbi ghost. The implementation is split into three focused modules for maintainability and testability.

## Architecture

```
symbi/
├── pixelData.ts       # Pure data: pixel coordinates and type definitions
├── ghostRenderer.ts   # Rendering logic: state-to-visual mappings
└── README.md          # This file
```

### Module Responsibilities

#### `pixelData.ts`
**Purpose**: Pure data definitions with no business logic

**Exports**:
- `PixelCoordinate` - Type for [x, y] pixel coordinates
- `GhostColors` - Interface for ghost color scheme
- `GHOST_GRID_SIZE` - 32x32 pixel grid constant
- `GHOST_MIN_Y`, `GHOST_MAX_Y` - Y-axis boundaries for ghost body
- `ghostBodyPixels` - Main body shape coordinates (taller version, 26 rows)
- `normalEyes`, `sadEyes`, `happyEyes`, `stressedEyes` - Eye variations
- `smileMouth` (7 pixels), `frownMouth`, `neutralMouth` (6 pixels), `worriedMouth` - Mouth variations
- `blushPixels` - Cheek blush coordinates

**Design Principles**:
- Imports only from types module (EmotionalState)
- Immutable data structures (const arrays)
- Coordinates based on 32x32 grid
- Taller ghost design (Y: 6-25) for better proportions
- Easy to modify for visual tweaks (e.g., smile and neutral mouths refined for balanced expressions)

#### `ghostRenderer.ts`
**Purpose**: Rendering logic and state-to-visual mappings

**Exports**:
- `getStateColors()` - Maps EmotionalState to color scheme
- `getEyePixels()` - Selects eye pixels for state
- `getMouthPixels()` - Selects mouth pixels for state
- `shouldShowBlush()` - Determines if blush should render
- `pixelOverlaps()` - Utility for pixel collision detection
- `getFilteredBodyPixels()` - Filters body pixels to avoid overlaps
- `drawPixelArt()` - Canvas drawing helper with 10% pixel spacing for enhanced pixelated look
- `renderGhost()` - Main rendering function

**Design Principles**:
- Pure functions (no side effects except canvas drawing)
- Centralized color constants
- State-based rendering logic
- Testable without React components

## Usage Examples

### Basic Rendering

```typescript
import { renderGhost } from './symbi/ghostRenderer';
import { EmotionalState } from '../../types';

const canvas = document.getElementById('ghost-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

renderGhost(ctx, 300, EmotionalState.ACTIVE);
```

### Custom Pixel Rendering

```typescript
import { ghostBodyPixels, happyEyes, smileMouth } from './symbi/pixelData';
import { drawPixelArt, getStateColors } from './symbi/ghostRenderer';

const colors = getStateColors(EmotionalState.VIBRANT);
const pixelSize = 10;

drawPixelArt(ctx, pixelSize, ghostBodyPixels, colors.body);
drawPixelArt(ctx, pixelSize, happyEyes, colors.eyes);
drawPixelArt(ctx, pixelSize, smileMouth, colors.mouth);
```

### State-Based Pixel Selection

```typescript
import { getEyePixels, getMouthPixels, shouldShowBlush } from './symbi/ghostRenderer';
import { blushPixels } from './symbi/pixelData';

const state = EmotionalState.STRESSED;
const eyes = getEyePixels(state);
const mouth = getMouthPixels(state);
const showBlush = shouldShowBlush(state);

console.log(`Eyes: ${eyes.length} pixels`);
console.log(`Mouth: ${mouth.length} pixels`);
console.log(`Blush: ${showBlush ? blushPixels.length : 0} pixels`);
```

## Emotional State Mappings

| State | Eyes | Mouth | Body Color | Blush |
|-------|------|-------|------------|-------|
| SAD | Small, droopy | Frown | Dull (#E8E8E0) | None |
| TIRED | Small, droopy | Frown | Dull (#E8E8E0) | None |
| RESTING | Normal oval | Neutral | Standard (#F5F5F0) | None |
| CALM | Normal oval | Neutral | Standard (#F5F5F0) | None |
| ACTIVE | Large, bright | Smile | Bright (#FFFFFF) | Pink (#FF69B4) |
| VIBRANT | Large, bright | Smile | Bright (#FFFFFF) | Pink (#FF69B4) |
| RESTED | Large, bright | Smile | Standard (#F5F5F0) | Pink (#FF69B4) |
| STRESSED | Wide | Worried | Medium (#F0F0E8) | Salmon (#FFA07A) |
| ANXIOUS | Wide | Worried | Medium (#F0F0E8) | Salmon (#FFA07A) |

## Color Palette

```typescript
const COLORS = {
  CREAM_WHITE: '#F5F5F0',   // Base body color
  DULL_WHITE: '#E8E8E0',    // Sad/tired state
  BRIGHT_WHITE: '#FFFFFF',  // Active/vibrant state
  MEDIUM_WHITE: '#F0F0E8',  // Stressed/anxious state
  BLACK: '#000000',         // Eyes and mouth
  LIGHT_PINK: '#FFB6C1',    // Base blush
  HOT_PINK: '#FF69B4',      // Active blush
  LIGHT_SALMON: '#FFA07A',  // Stressed blush
};
```

## Grid System

The ghost is rendered on a **32x32 pixel grid**:
- X-axis: 0-31 (left to right)
- Y-axis: 0-31 (top to bottom)
- Ghost occupies Y: 6-25 (taller version, 20 rows)
- Centered horizontally around X: 15-16
- Body width: 16 pixels (X: 8-23)

### Coordinate System

```
     0  4  8  12 16 20 24 28 31
   0 ┌──┬──┬──┬──┬──┬──┬──┬──┐
   4 │  │  │  │  │  │  │  │  │
   6 │  │  ╭──────────╮  │  │  ← Top of ghost (Y: 6)
   8 │  ╭─┴──────────┴─╮  │  │
  10 │ ●│  │  │  │  │  │●│  │  ← Eyes (Y: 10-12)
  12 │  │  │  │  │  │  │  │  │
  14 │  │  │  │  │  │  │  │  │
  16 │  │  │  ╰──╯  │  │  │  │  ← Mouth (Y: 15-18)
  18 │  │  │  │  │  │  │  │  │
  20 │  │  │  │  │  │  │  │  │
  22 │  │  │  │  │  │  │  │  │
  24 │  │  ╰╯  ╰╯  ╰╯  │  │  │  ← Wavy bottom (Y: 23-25)
  26 │  │  │  │  │  │  │  │  │
  28 │  │  │  │  │  │  │  │  │
  31 └──┴──┴──┴──┴──┴──┴──┴──┘
```

## Testing

### Unit Tests

Test pixel data integrity:
```typescript
describe('pixelData', () => {
  it('should have valid coordinates within 32x32 grid', () => {
    ghostBodyPixels.forEach(([x, y]) => {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(32);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThan(32);
    });
  });
});
```

Test rendering logic:
```typescript
describe('ghostRenderer', () => {
  it('should return correct eyes for each state', () => {
    expect(getEyePixels(EmotionalState.SAD)).toBe(sadEyes);
    expect(getEyePixels(EmotionalState.ACTIVE)).toBe(happyEyes);
    expect(getEyePixels(EmotionalState.STRESSED)).toBe(stressedEyes);
  });
  
  it('should show blush only for positive states', () => {
    expect(shouldShowBlush(EmotionalState.ACTIVE)).toBe(true);
    expect(shouldShowBlush(EmotionalState.SAD)).toBe(false);
  });
});
```

## Performance Considerations

### Optimization Strategies

1. **Memoization**: Pixel arrays are constants, no runtime generation
2. **Pure Functions**: All rendering functions are pure for easy memoization
3. **Minimal Calculations**: Pre-computed pixel coordinates
4. **Efficient Filtering**: `pixelOverlaps()` uses early return
5. **Pixel Spacing**: Configurable gaps between pixels enhance pixelated aesthetic without performance cost
   - Canvas rendering: 10% spacing for subtle separation
   - React Native Views: 7% spacing for balanced clarity

### Memory Usage

- Total pixel coordinates: ~400 pixels
- Memory per coordinate: 16 bytes (2 numbers)
- Total memory: ~6.4 KB (negligible)

## Future Enhancements

### Potential Additions

1. **Animation Frames**: Add intermediate frames for smooth transitions
2. **Particle Effects**: Add floating particles for Active/Vibrant states
3. **Dripping Animation**: Animate dripping effect on bottom edge
4. **Eye Blink**: Add periodic blinking animation frames
5. **Color Themes**: Support alternative color palettes
6. **Evolution Forms**: Modify pixel patterns for evolved appearances

### Phase 3 Integration

- Generate evolved forms by modifying pixel arrays
- Add accessories as additional pixel layers
- Support custom color palettes from user preferences
- Implement pixel-based particle systems

## Contributing

When modifying pixel data:

1. **Test Visually**: Use `Symbi8BitDemo` component to verify changes
2. **Maintain Grid**: Keep all coordinates within 0-31 range
3. **Document Changes**: Update this README with new features
4. **Preserve Symmetry**: Keep left/right features balanced
5. **Test All States**: Verify all 9 emotional states render correctly

## Related Files

- `../Symbi8BitCanvas.tsx` - React component using this rendering system
- `../Symbi8BitDemo.tsx` - Interactive demo component
- `../../types/index.ts` - EmotionalState enum definition
- `../../../docs/8bit-canvas-implementation.md` - Implementation summary
# Symbi Ghost Rendering Module

This module contains the pixel data and rendering logic for the 8-bit style Symbi ghost character.

## Files

### `pixelData.ts`
Contains all pixel coordinate definitions for the ghost character:
- **ghostBodyPixels**: Main body shape (taller version with 32x32 grid)
- **Eye variations**: normalEyes, sadEyes, happyEyes, stressedEyes
- **Mouth variations**: smileMouth, frownMouth, neutralMouth, worriedMouth
- **blushPixels**: Cheek blush for positive emotional states

All coordinates are based on a 32x32 grid that scales to the actual canvas size.

### `ghostRenderer.ts`
Rendering logic and state-to-appearance mapping:
- **getStateColors()**: Maps emotional states to color palettes
- **getEyePixels()**: Returns appropriate eye pixels for each state
- **getMouthPixels()**: Returns appropriate mouth pixels for each state
- **shouldShowBlush()**: Determines if blush should be displayed
- **renderGhost()**: Main rendering function (for canvas-based rendering)
- **drawPixelArt()**: Helper for drawing pixel arrays with 10% spacing between pixels

**Note**: The React Native component (`Symbi8BitCanvas.tsx`) uses 7% pixel spacing for balanced visual clarity with View-based rendering, while canvas rendering uses 10% spacing for a more subtle effect.

## Constants

```typescript
PIXEL_GRID_SIZE = 32        // Base grid size
GHOST_SIZE_RATIO = 0.7      // 70% of screen width
MAX_GHOST_SIZE = 300        // Maximum size in pixels
```

## Color Palette

### Base Colors
- Body: `#F5F5F0` (Cream white)
- Eyes: `#000000` (Black)
- Mouth: `#000000` (Black)
- Blush: `#FFB6C1` (Light pink)

### State-Specific Variations
- **Sad/Tired**: Duller body (`#E8E8E0`)
- **Active/Vibrant**: Brighter body (`#FFFFFF`), hot pink blush (`#FF69B4`)
- **Stressed/Anxious**: Medium body (`#F0F0E8`), salmon blush (`#FFA07A`)

## Emotional State Mapping

| State | Eyes | Mouth | Blush | Body Color |
|-------|------|-------|-------|------------|
| SAD | Droopy | Frown | No | Dull |
| TIRED | Droopy | Frown | No | Dull |
| RESTING | Normal | Neutral | No | Normal |
| ACTIVE | Large | Smile | Yes | Bright |
| VIBRANT | Large | Smile | Yes | Bright |
| RESTED | Large | Smile | Yes | Normal |
| STRESSED | Wide | Worried | Yes (salmon) | Medium |
| ANXIOUS | Wide | Worried | Yes (salmon) | Medium |
| CALM | Normal | Neutral | No | Normal |

## Usage

```typescript
import { getStateColors, getEyePixels, getMouthPixels } from './symbi/ghostRenderer';
import { ghostBodyPixels, blushPixels } from './symbi/pixelData';

// Get appearance for current state
const colors = getStateColors(emotionalState);
const eyePixels = getEyePixels(emotionalState);
const mouthPixels = getMouthPixels(emotionalState);

// Render pixels
ghostBodyPixels.forEach(([x, y]) => {
  renderPixel(x, y, colors.body);
});
```

## Design Notes

- The ghost uses a 32x32 pixel grid for consistent scaling
- Facial features are positioned to avoid overlap with body pixels
- The taller design (26 rows) provides better proportions
- Wavy bottom creates the classic ghost silhouette
- All pixel coordinates are immutable and can be safely shared
