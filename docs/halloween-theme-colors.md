# Halloween Theme Color Palette

## Overview

Symbi uses a consistent Halloween-themed color palette across all components to create a cohesive, spooky yet cute aesthetic. The primary color is purple with accent colors for different data types and emotional states.

## Primary Colors

### Purple Shades

```typescript
const HALLOWEEN_COLORS = {
  primary: '#7C3AED', // Main purple
  primaryDark: '#5B21B6', // Dark purple for borders/shadows
  primaryLight: '#9333EA', // Light purple for highlights
};
```

**Usage**:

- Primary buttons and interactive elements
- Chart lines for steps data
- Timeline connectors
- Card borders and shadows
- Header text and titles

### Background Colors

```typescript
const HALLOWEEN_COLORS = {
  darkBg: '#1a1a2e', // Main app background
  cardBg: '#16213e', // Card and container background
  ghostWhite: '#F3F4F6', // Text color
};
```

**Usage**:

- `darkBg`: Screen backgrounds, alternating table rows
- `cardBg`: Cards, containers, header backgrounds
- `ghostWhite`: Primary text color throughout app

## Accent Colors

### Data Type Colors

```typescript
const HALLOWEEN_COLORS = {
  orange: '#F97316', // Sleep data
  green: '#10B981', // HRV data
};
```

**Usage**:

- Orange: Sleep duration charts and metrics
- Green: HRV (Heart Rate Variability) charts and metrics
- Purple: Steps data (uses primary color)

## Emotional State Colors

Each emotional state has a specific color for visual identification:

```typescript
const STATE_COLORS: Record<string, string> = {
  sad: '#DC2626', // Red - negative state
  resting: '#7C3AED', // Purple - neutral state
  active: '#10B981', // Green - positive state
  vibrant: '#F59E0B', // Amber - very positive state
  calm: '#3B82F6', // Blue - peaceful state
  tired: '#6B7280', // Gray - low energy state
  stressed: '#EF4444', // Red - negative state
  anxious: '#F97316', // Orange - worried state
  rested: '#8B5CF6', // Light purple - recovered state
};
```

**Usage**:

- Timeline dot indicators
- Table row state indicators
- Card border accents
- State name text color

## Color Usage Guidelines

### Contrast Requirements

- Maintain 4.5:1 contrast ratio for text on backgrounds
- Use `ghostWhite` (#F3F4F6) for primary text
- Use opacity (0.6-0.8) for secondary text

### Shadows and Glows

```typescript
shadowColor: HALLOWEEN_COLORS.primary,
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.3,
shadowRadius: 8,
elevation: 8,
```

**Usage**:

- Cards and elevated components
- Interactive elements on press
- Milestone badges

### Gradients

```typescript
backgroundGradientFrom: HALLOWEEN_COLORS.cardBg,
backgroundGradientTo: HALLOWEEN_COLORS.darkBg,
```

**Usage**:

- Chart backgrounds
- Large container backgrounds
- Smooth transitions between sections

## Component-Specific Colors

### StatisticsCard

- Background: `cardBg` (#16213e)
- Border: `primaryDark` (#5B21B6)
- Value text: `primaryLight` (#9333EA)
- Label text: `ghostWhite` with 0.6 opacity

### HealthMetricsChart

- Steps: `primary` (#7C3AED)
- Sleep: `orange` (#F97316)
- HRV: `green` (#10B981)
- Grid lines: `primary` with 0.1 opacity
- Labels: `ghostWhite`

### EmotionalStateTimeline

- Dots: State-specific colors (see STATE_COLORS)
- Connecting lines: `primary` with 0.3 opacity
- Card background: `cardBg`
- Card border: State-specific color

### EvolutionMilestoneCard

- Background: `cardBg`
- Border: `primaryDark`
- Badge background: `primary`
- Badge border: `darkBg`
- Level text: `primaryLight`

### HealthDataTable

- Header background: `primary`
- Even rows: `darkBg` (#1a1a2e)
- Odd rows: `cardBg` (#16213e)
- Border: `primaryDark`
- State indicators: State-specific colors

## Decorative Elements

### Emoji Icons

- Ghost: 👻 (timeline, empty states)
- Pumpkin: 🎃 (statistics, milestones)
- Tombstone: 🪦 (evolution badges)
- Crystal Ball: 🔮 (evolution badges)
- Cauldron: 🧙 (evolution badges)
- Bat: 🦇 (header decorations)

### Visual Effects

- Dripping effects: Darker purple (#5B21B6)
- Glowing eyes: State-specific colors
- Ethereal trails: Purple with low opacity
- Particle effects: `primaryLight` with animation

## Accessibility Considerations

### Color Blindness

- Don't rely solely on color to convey information
- Use icons and text labels alongside colors
- Provide patterns or textures for critical distinctions

### High Contrast Mode

- Ensure borders are visible in high contrast
- Maintain text readability
- Test with system accessibility settings

### Dark Mode

- Current theme is dark by default
- All colors optimized for dark backgrounds
- Light mode not currently supported

## Implementation Example

```typescript
import { StyleSheet } from 'react-native';

const HALLOWEEN_COLORS = {
  primary: '#7C3AED',
  primaryDark: '#5B21B6',
  primaryLight: '#9333EA',
  orange: '#F97316',
  green: '#10B981',
  darkBg: '#1a1a2e',
  cardBg: '#16213e',
  ghostWhite: '#F3F4F6',
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: HALLOWEEN_COLORS.darkBg,
  },
  card: {
    backgroundColor: HALLOWEEN_COLORS.cardBg,
    borderColor: HALLOWEEN_COLORS.primaryDark,
    borderWidth: 2,
    borderRadius: 16,
    shadowColor: HALLOWEEN_COLORS.primary,
    shadowOpacity: 0.3,
  },
  title: {
    color: HALLOWEEN_COLORS.primaryLight,
    fontSize: 20,
    fontWeight: 'bold',
  },
  text: {
    color: HALLOWEEN_COLORS.ghostWhite,
    opacity: 0.8,
  },
});
```

## Color Palette Reference

| Color Name      | Hex Code | RGB                | Usage                     |
| --------------- | -------- | ------------------ | ------------------------- |
| Primary Purple  | #7C3AED  | rgb(124, 58, 237)  | Main interactive elements |
| Dark Purple     | #5B21B6  | rgb(91, 33, 182)   | Borders, shadows          |
| Light Purple    | #9333EA  | rgb(147, 51, 234)  | Highlights, titles        |
| Orange          | #F97316  | rgb(249, 115, 22)  | Sleep data, anxious state |
| Green           | #10B981  | rgb(16, 185, 129)  | HRV data, active state    |
| Dark Background | #1a1a2e  | rgb(26, 26, 46)    | Screen backgrounds        |
| Card Background | #16213e  | rgb(22, 33, 62)    | Card containers           |
| Ghost White     | #F3F4F6  | rgb(243, 244, 246) | Text color                |

## Related Documentation

- [Evolution History Implementation](evolution-history-implementation-summary.md)
- [Main Screen Documentation](mainscreen-complete-feature-documentation.md)
- [Design Specification](.kiro/specs/evolution-history-page/design.md)
