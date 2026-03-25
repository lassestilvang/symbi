# PixelData Module Addition

## Date

November 16, 2025

## Summary

Added `src/components/symbi/pixelData.ts` as a pure data module containing all pixel coordinate definitions for the 8-bit Symbi ghost rendering system.

## File Details

**Location**: `src/components/symbi/pixelData.ts`  
**Lines of Code**: 127  
**Purpose**: Centralized pixel coordinate definitions for 8-bit ghost rendering

## Exports

### Types

- `PixelCoordinate`: Type alias for `[x: number, y: number]` tuple
- `GhostColors`: Interface defining color scheme (body, eyes, mouth, blush)

### Constants

- `GHOST_GRID_SIZE`: 32 (pixel grid dimensions)
- `GHOST_MIN_Y`: 6 (minimum Y coordinate)
- `GHOST_MAX_Y`: 25 (maximum Y coordinate)

### Pixel Data Arrays

- `ghostBodyPixels`: 400+ coordinates forming the main ghost body
- `normalEyes`: 8 pixels (2x2 per eye)
- `sadEyes`: 8 pixels (droopy, positioned lower)
- `happyEyes`: 12 pixels (3x2 per eye, larger)
- `stressedEyes`: 24 pixels (4x3 per eye, widest)
- `smileMouth`: 7 pixels (curved upward)
- `frownMouth`: 7 pixels (curved downward)
- `neutralMouth`: 5 pixels (straight line)
- `worriedMouth`: 7 pixels (wavy line)
- `blushPixels`: 8 pixels (2x2 per cheek)

## Design Characteristics

### Ghost Dimensions

- **Grid**: 32x32 pixels
- **Height**: 20 rows (Y: 6-25)
- **Width**: 16 pixels (X: 8-23)
- **Total Body Pixels**: ~400

### Positioning

- **Top**: Y: 6 (rounded head)
- **Eyes**: Y: 10-14 (varies by state)
- **Mouth**: Y: 15-18 (varies by state)
- **Blush**: Y: 13-14 (cheeks)
- **Bottom**: Y: 23-25 (wavy edge)

### Visual Features

- Rounded top for classic ghost shape
- Wavy bottom with 3 peaks for ethereal effect
- Symmetrical left/right features
- Taller proportions for better visibility

## Integration

### Used By

- `src/components/symbi/ghostRenderer.ts` - Imports pixel arrays for rendering
- `src/components/Symbi8BitCanvas.tsx` - Uses via ghostRenderer
- `src/components/symbi/__tests__/pixelData.test.ts` - Unit tests

### Dependencies

- `src/types/index.ts` - Imports `EmotionalState` enum (for documentation only)

## Benefits

1. **Separation of Concerns**: Pure data separated from rendering logic
2. **Maintainability**: Easy to modify pixel art without touching component code
3. **Testability**: Pixel data can be validated independently
4. **Reusability**: Pixel arrays can be used by multiple renderers
5. **Performance**: Immutable const arrays enable efficient memoization
6. **Type Safety**: TypeScript types prevent coordinate errors

## Related Documentation

- `src/components/symbi/README.md` - Comprehensive module documentation
- `docs/8bit-canvas-implementation.md` - Implementation summary
- `docs/code-review-8bit-ghost.md` - Code review and quality metrics
- `docs/symbi-canvas-refactoring.md` - Refactoring summary

## Testing

Unit tests in `src/components/symbi/__tests__/pixelData.test.ts` verify:

- All coordinates within 32x32 grid bounds
- No duplicate pixels within arrays
- Symmetrical left/right features
- Reasonable pixel counts per feature
- Proper positioning relationships (eyes above mouth, etc.)

## Future Enhancements

Potential additions to pixelData.ts:

1. Animation frame variations for smooth transitions
2. Particle effect coordinates for Active/Vibrant states
3. Dripping animation frames for bottom edge
4. Eye blink animation frames
5. Alternative color theme definitions
6. Evolution form pixel variations
