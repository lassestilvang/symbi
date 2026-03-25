# Symbi Animation Component

This directory contains the Symbi animation component and related UI components for the Symbi biometric tamagotchi app.

## Components

### Evolution History Components

The following components are used to build the Evolution History page, providing comprehensive visualizations of health data and emotional states.

#### StatisticsCard

A reusable card component for displaying health statistics with Halloween-themed styling.

**Features:**

- Halloween-themed styling with purple glow shadows
- Decorative icons (ghost, pumpkin, tombstone, bat)
- Automatic number formatting with locale-specific thousand separators
- Responsive width support
- Memoized for performance optimization
- Full accessibility support with labels and roles
- Text shadows and purple glow effects

**Usage:**

```tsx
import { StatisticsCard } from './components';

<StatisticsCard
  icon="👣"
  label="Average Steps"
  value={8542}
  subtitle="Last 30 days"
  halloweenDecoration="pumpkin"
  width={160}
  testID="steps-card"
/>;
```

**Props:**

- `icon` (required): Emoji icon to display (e.g., "👣", "😴", "❤️")
- `label` (required): Label text for the statistic
- `value` (required): Numeric or string value to display
- `subtitle` (optional): Additional context text below the label
- `halloweenDecoration` (required): Decoration icon type ("ghost" | "pumpkin" | "tombstone" | "bat")
- `width` (optional): Custom width for the card
- `testID` (optional): Test identifier for testing

**Styling:**

- Enhanced purple glow shadow (12px radius)
- Main icon: 36px with text shadow
- Decorative icon: 28px in corner at 20% opacity
- Value text: 28px bold with purple glow
- Border: 2px with dark purple color
- Uses centralized `HALLOWEEN_COLORS` and `DECORATION_ICONS` from theme constants

#### HealthMetricsChart

A line chart component for visualizing health metrics over time using react-native-chart-kit.

**Features:**

- Supports steps, sleep, and HRV metric types
- Halloween-themed colors (purple, orange, green)
- Touch interaction with data point tooltips
- Smooth animation on mount
- Responsive width for portrait and landscape orientations
- Memoized for performance optimization
- Full accessibility support with labels and hints

**Usage:**

```tsx
import { HealthMetricsChart } from './components';

<HealthMetricsChart
  data={historicalData}
  metricType="steps"
  onDataPointPress={point => console.log(point)}
  width={350}
  testID="steps-chart"
/>;
```

**Props:**

- `data` (required): Array of HistoricalDataPoint objects
- `metricType` (required): Type of metric to display ("steps" | "sleep" | "hrv")
- `onDataPointPress` (optional): Callback when a data point is tapped
- `width` (optional): Custom width for the chart
- `testID` (optional): Test identifier for testing

**Styling:**

- Uses `METRIC_CONFIG` from theme constants for colors and labels
- Gradient background with Halloween colors
- Bezier curve for smooth line rendering
- Purple glow shadow effect

#### EmotionalStateTimeline

A chronological timeline component displaying emotional state changes with ghost icons.

**Features:**

- Vertical timeline with color-coded state indicators
- Ghost icons for each state entry
- Timestamps with relative time display
- Tap handler for detailed state information
- Halloween-themed styling with purple gradients
- Memoized for performance optimization
- Full accessibility support with list semantics

**Usage:**

```tsx
import { EmotionalStateTimeline } from './components';

<EmotionalStateTimeline
  data={historicalData}
  onItemPress={item => console.log(item)}
  testID="timeline"
/>;
```

**Props:**

- `data` (required): Array of HistoricalDataPoint objects
- `onItemPress` (optional): Callback when a timeline item is tapped
- `testID` (optional): Test identifier for testing

**Styling:**

- Uses `STATE_COLORS` from theme constants
- Purple connecting line between entries
- Color-coded state badges
- Alternating ghost icon sizes for visual interest

#### EvolutionMilestoneCard

A card component for displaying evolution milestones with appearance previews.

**Features:**

- Evolution level and date display
- Appearance preview image with lazy loading
- Halloween badge icons (tombstone, jack-o-lantern, crystal ball, cauldron)
- Trigger condition and dominant states
- Purple glow shadow effect
- Memoized for performance optimization
- Full accessibility support with image descriptions

**Usage:**

```tsx
import { EvolutionMilestoneCard } from './components';

<EvolutionMilestoneCard record={evolutionRecord} badgeIcon="tombstone" testID="milestone-card" />;
```

**Props:**

- `record` (required): EvolutionRecord object with evolution details
- `badgeIcon` (required): Badge icon type ("tombstone" | "jack-o-lantern" | "crystal-ball" | "cauldron")
- `testID` (optional): Test identifier for testing

**Styling:**

- Uses `HALLOWEEN_COLORS` from theme constants
- Purple border with glow effect
- Badge icon in corner at 24px
- Responsive image sizing

#### HealthDataTable

A scrollable table component displaying daily health metrics in tabular format.

**Features:**

- Columns: Date, Steps, Sleep, HRV, Emotional State
- Alternating row colors with Halloween-themed shading
- Formatted numerical values (whole numbers for steps, one decimal for hours)
- Color-coded emotional state indicators
- Vertical scrolling for large datasets
- Memoized for performance optimization
- Full accessibility support with table semantics

**Usage:**

```tsx
import { HealthDataTable } from './components';

<HealthDataTable data={historicalData} maxHeight={400} testID="data-table" />;
```

**Props:**

- `data` (required): Array of HistoricalDataPoint objects
- `maxHeight` (optional): Maximum height for scrollable area
- `testID` (optional): Test identifier for testing

**Styling:**

- Uses `HALLOWEEN_COLORS` for row backgrounds (rowEven, rowOdd)
- Uses `STATE_COLORS` for emotional state indicators
- Fixed header row with purple background
- Monospace font for numerical values

### SymbiAnimation

The main animation component that renders the Symbi creature with different emotional states using Lottie animations.

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
/>;
```

**Props:**

- `emotionalState` (required): The current emotional state of the Symbi
- `evolutionLevel` (optional): Evolution level for Phase 3 features
- `customAppearance` (optional): URL to custom evolved appearance
- `style` (optional): Custom styling for the container
- `autoPlay` (optional): Whether to auto-play the animation (default: true)
- `loop` (optional): Whether to loop the animation (default: true)

### Symbi8BitCanvas

An alternative 8-bit pixel art implementation of the Symbi ghost using React Native Views as pixels. This provides a retro aesthetic option that doesn't require Lottie animation files.

**Features:**

- Pure React Native implementation (no external animation files needed)
- 8-bit pixel art style with cream-colored ghost
- Interactive poke/tap animation with bounce and squish effects
- Idle floating animation with gentle sway
- State-based visual changes (eyes, mouth, blush, body color)
- Responsive sizing based on screen width
- Performance optimized with native driver animations

**Usage:**

```tsx
import { Symbi8BitCanvas } from './components';
import { EmotionalState } from './types';

<Symbi8BitCanvas
  emotionalState={EmotionalState.ACTIVE}
  size={300}
  onPoke={() => console.log('Ghost poked!')}
/>;
```

**Props:**

- `emotionalState` (required): The current emotional state of the Symbi
- `style` (optional): Custom styling for the container
- `size` (optional): Size of the ghost in pixels (default: 70% of screen width, max 300)
- `onPoke` (optional): Callback function when ghost is tapped

**Visual States:**

- **SAD/TIRED**: Droopy eyes, frown, duller body color
- **RESTING/CALM**: Normal eyes, neutral mouth, standard body color
- **ACTIVE/VIBRANT/RESTED**: Larger eyes, smile, brighter body color, pink blush
- **STRESSED/ANXIOUS**: Wide eyes, worried mouth, salmon blush

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

### Demo Components

#### SymbiAnimationDemo

Use `SymbiAnimationDemo` to test the Lottie animation component:

```tsx
import { SymbiAnimationDemo } from './components';

<SymbiAnimationDemo />;
```

This provides an interactive UI to switch between emotional states and see the transitions in action.

#### Symbi8BitDemo

Use `Symbi8BitDemo` to test the 8-bit pixel art component:

```tsx
import { Symbi8BitDemo } from './components';

<Symbi8BitDemo />;
```

This provides an interactive UI to:

- Switch between all emotional states
- Test poke/tap interactions
- View poke counter
- See real-time state changes

## Future Enhancements (Phase 2 & 3)

### Phase 2

- Additional emotional states: Vibrant, Calm, Tired, Stressed, Anxious, Rested
- New animation files in `src/assets/animations/phase2/`

### Phase 3

- Evolution system with generative appearances
- Custom appearance support via `customAppearance` prop
- Evolution gallery component

## Halloween Theme Colors

All components use a centralized color palette defined in `src/constants/theme.ts`. This ensures consistent theming across the app.

### Primary Colors

```typescript
HALLOWEEN_COLORS = {
  primary: '#7C3AED', // Main purple
  primaryDark: '#5B21B6', // Dark purple for borders
  primaryLight: '#9333EA', // Light purple for highlights
  orange: '#F97316', // Accent orange
  green: '#10B981', // Accent green
  darkBg: '#1a1a2e', // Dark background
  cardBg: '#16213e', // Card background
  ghostWhite: '#F3F4F6', // Light text/ghost color
  rowEven: '#1a1a2e', // Table even rows
  rowOdd: '#16213e', // Table odd rows
};
```

### Emotional State Colors

```typescript
STATE_COLORS = {
  sad: '#DC2626', // Red
  resting: '#7C3AED', // Purple
  active: '#10B981', // Green
  vibrant: '#F59E0B', // Amber
  calm: '#3B82F6', // Blue
  tired: '#6B7280', // Gray
  stressed: '#EF4444', // Red-orange
  anxious: '#F97316', // Orange
  rested: '#8B5CF6', // Light purple
};
```

### Metric Configuration

Each health metric has associated styling configuration:

```typescript
METRIC_CONFIG = {
  steps: {
    label: 'Steps',
    color: '#7C3AED', // Purple
    suffix: '',
    decimals: 0,
  },
  sleep: {
    label: 'Sleep (hours)',
    color: '#F97316', // Orange
    suffix: 'h',
    decimals: 1,
  },
  hrv: {
    label: 'HRV (ms)',
    color: '#10B981', // Green
    suffix: 'ms',
    decimals: 0,
  },
};
```

### Decoration Icons

Halloween-themed emoji icons used throughout the app:

```typescript
DECORATION_ICONS = {
  ghost: '👻',
  pumpkin: '🎃',
  tombstone: '🪦',
  bat: '🦇',
};
```

### Usage in Components

Import and use theme constants in your components:

```tsx
import { HALLOWEEN_COLORS, STATE_COLORS, DECORATION_ICONS } from '../constants/theme';

// Use in styles
const styles = StyleSheet.create({
  container: {
    backgroundColor: HALLOWEEN_COLORS.darkBg,
    borderColor: HALLOWEEN_COLORS.primaryDark,
  },
  stateIndicator: {
    backgroundColor: STATE_COLORS.active,
  },
});

// Use decoration icons
<Text>{DECORATION_ICONS.ghost}</Text>;
```

For complete theme documentation, see `docs/halloween-theme-colors.md`.

## Requirements Covered

This implementation satisfies the following requirements:

- **4.4**: Phase 1 emotional state animations
- **4.5**: Smooth state transitions
- **9.4**: Lottie animation rendering
- **10.3**: Performance optimization (60 FPS, battery efficiency)
- **10.4**: Memory optimization (<100MB target)
- **12.1-12.4**: Visual design and Halloween theming
- **Evolution History Requirements 1.1-10.5**: All Evolution History page components and features
