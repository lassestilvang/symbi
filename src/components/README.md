# Symbi Animation Component

This directory contains the Symbi animation component and related UI components for the Symbi biometric tamagotchi app.

## Components

### SymbiAnimation

The main animation component that renders the Symbi creature with different emotional states.

**Features:**
- Lottie-based vector animations for smooth, scalable visuals
- Smooth state transitions with fade and scale effects (1-3 seconds)
- Performance optimizations:
  - Frame rate throttling when app is backgrounded (10 FPS)
  - Animation preloading and caching
  - Native driver for transform animations
  - Hardware acceleration on Android
- Support for custom evolved appearances (Phase 3)

**Usage:**
```tsx
import { SymbiAnimation } from './components';
import { EmotionalState } from './types';

<SymbiAnimation 
  emotionalState={EmotionalState.ACTIVE}
  style={{ width: 300, height: 300 }}
  autoPlay={true}
  loop={true}
/>
```

**Props:**
- `emotionalState` (required): The current emotional state of the Symbi
- `evolutionLevel` (optional): Evolution level for Phase 3 features
- `customAppearance` (optional): URL to custom evolved appearance
- `style` (optional): Custom styling for the container
- `autoPlay` (optional): Whether to auto-play the animation (default: true)
- `loop` (optional): Whether to loop the animation (default: true)

### Phase 1 Emotional States

The following animations are available for Phase 1:

1. **SAD** (`sad.json`)
   - Drooping posture
   - Dim eyes (60% opacity)
   - Slow bob animation (3 seconds)
   - Dripping effects

2. **RESTING** (`resting.json`)
   - Neutral posture
   - Half-closed eyes (blinking animation)
   - Steady bob animation (3 seconds)
   - Soft glow effect

3. **ACTIVE** (`active.json`)
   - Upright posture
   - Bright eyes (100% opacity)
   - Fast bob animation (2 seconds)
   - Particle effects
   - Bright glow

### Animation Files

Animation files are located in `src/assets/animations/phase1/`:
- `sad.json` - Sad state animation
- `resting.json` - Resting state animation
- `active.json` - Active state animation

**Note:** These are placeholder Lottie animations with proper structure. For production, replace these with professionally designed animations created in After Effects or similar tools.

### Color Palette

All animations use the purple Halloween theme:
- Primary: `#7C3AED` to `#9333EA`
- Dark accent: `#5B21B6`
- Light accent: `#9333EA`

### Performance Considerations

The SymbiAnimation component is optimized for:
- **Battery efficiency**: Reduces frame rate to 10 FPS when backgrounded
- **Memory usage**: Target <100MB with animation caching
- **Smooth transitions**: 60 FPS on mid-range devices
- **No flicker**: Fade transitions prevent visual artifacts

### Testing

Run tests with:
```bash
npm test -- src/components/__tests__/SymbiAnimation.test.tsx
```

Tests cover:
- Animation rendering for all emotional states
- State transitions
- Performance optimizations
- Custom props and styling

### Demo Component

Use `SymbiAnimationDemo` to test the animation component:

```tsx
import { SymbiAnimationDemo } from './components';

<SymbiAnimationDemo />
```

This provides an interactive UI to switch between emotional states and see the transitions in action.

## Future Enhancements (Phase 2 & 3)

### Phase 2
- Additional emotional states: Vibrant, Calm, Tired, Stressed, Anxious, Rested
- New animation files in `src/assets/animations/phase2/`

### Phase 3
- Evolution system with generative appearances
- Custom appearance support via `customAppearance` prop
- Evolution gallery component

## Requirements Covered

This implementation satisfies the following requirements:
- **4.4**: Phase 1 emotional state animations
- **4.5**: Smooth state transitions
- **9.4**: Lottie animation rendering
- **10.3**: Performance optimization (60 FPS, battery efficiency)
- **10.4**: Memory optimization (<100MB target)
- **12.1-12.4**: Visual design and Halloween theming
