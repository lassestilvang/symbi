# Evolution History Page Design

## Overview

The Evolution History Page provides users with comprehensive visualizations of their health journey through Symbi. The page displays historical health metrics, emotional state patterns, evolution milestones, and summary statistics in an engaging, Halloween-themed interface. Users access this page via a link in the Evolution Progress box on the MainScreen.

## Architecture

### Component Hierarchy

```
EvolutionHistoryScreen (New)
├── Header
│   ├── Back Button
│   └── Title
├── Time Range Filter
│   └── Filter Buttons (7D, 30D, 90D, All)
├── Summary Statistics Cards
│   ├── Average Steps Card
│   ├── Average Sleep Card
│   ├── Average HRV Card
│   └── Most Frequent State Card
├── Emotional State Timeline
│   └── Timeline Items (with ghost icons)
├── Health Metrics Graphs
│   ├── Steps Line Chart
│   ├── Sleep Line Chart (if available)
│   └── HRV Line Chart (if available)
├── Evolution Milestones Section
│   └── Milestone Cards
└── Data Table View
    └── Scrollable Table
```

### Navigation Flow

```
MainScreen
  └── Evolution Progress Box
      └── "View History" Link/Button
          └── Navigate to EvolutionHistoryScreen
              └── Back Button → MainScreen
```

## Components and Interfaces

### 1. EvolutionHistoryScreen Component

**Location**: `src/screens/EvolutionHistoryScreen.tsx`

**Props**:

```typescript
interface EvolutionHistoryScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}
```

**State**:

```typescript
interface EvolutionHistoryState {
  timeRange: '7d' | '30d' | '90d' | 'all';
  historicalData: HistoricalDataPoint[];
  evolutionRecords: EvolutionRecord[];
  isLoading: boolean;
  error: string | null;
  selectedDataPoint: HistoricalDataPoint | null;
}
```

**Key Methods**:

- `loadHistoricalData()`: Fetches health data from StorageService
- `filterDataByTimeRange()`: Filters data based on selected time range
- `calculateStatistics()`: Computes averages and dominant states
- `handleTimeRangeChange()`: Updates time range filter
- `handleDataPointPress()`: Shows detailed tooltip for a data point

### 2. HistoricalDataPoint Interface

**Location**: `src/types/index.ts` (add to existing types)

```typescript
interface HistoricalDataPoint {
  date: string; // YYYY-MM-DD
  steps: number;
  sleepHours?: number;
  hrv?: number;
  emotionalState: EmotionalState;
  calculationMethod: 'rule-based' | 'ai';
}
```

### 3. StatisticsCard Component

**Location**: `src/components/StatisticsCard.tsx`

**Props**:

```typescript
interface StatisticsCardProps {
  icon: string; // Emoji icon
  label: string;
  value: string | number;
  subtitle?: string;
  halloweenDecoration: 'ghost' | 'pumpkin' | 'tombstone' | 'bat';
}
```

Displays a single statistic with Halloween-themed decorations.

### 4. EmotionalStateTimeline Component

**Location**: `src/components/EmotionalStateTimeline.tsx`

**Props**:

```typescript
interface EmotionalStateTimelineProps {
  data: HistoricalDataPoint[];
  onItemPress: (item: HistoricalDataPoint) => void;
}
```

Renders a vertical timeline showing emotional state changes with ghost icons and color coding.

### 5. HealthMetricsChart Component

**Location**: `src/components/HealthMetricsChart.tsx`

**Props**:

```typescript
interface HealthMetricsChartProps {
  data: HistoricalDataPoint[];
  metricType: 'steps' | 'sleep' | 'hrv';
  color: string; // Halloween-themed color
  onDataPointPress: (point: HistoricalDataPoint) => void;
}
```

Uses a charting library (react-native-chart-kit or victory-native) to render line graphs with smooth animations.

### 6. EvolutionMilestoneCard Component

**Location**: `src/components/EvolutionMilestoneCard.tsx`

**Props**:

```typescript
interface EvolutionMilestoneCardProps {
  record: EvolutionRecord;
  badgeIcon: 'tombstone' | 'jack-o-lantern' | 'crystal-ball' | 'cauldron';
}
```

Displays a single evolution milestone with date, level, and appearance preview.

### 7. HealthDataTable Component

**Location**: `src/components/HealthDataTable.tsx`

**Props**:

```typescript
interface HealthDataTableProps {
  data: HistoricalDataPoint[];
  maxHeight: number;
}
```

Renders a scrollable table with alternating row colors and color-coded emotional states.

## Data Models

### Data Retrieval Strategy

1. **Health Data Cache**: Retrieve from `StorageService.getHealthDataCache()`
   - Returns: `Record<string, HealthDataCache>`
   - Contains up to 30 days of cached health data
   - Each entry includes: date, steps, sleepHours, hrv, emotionalState, calculationMethod

2. **Evolution Records**: Retrieve from `StorageService.getEvolutionRecords()`
   - Returns: `EvolutionRecord[]`
   - Contains all evolution events with timestamps and appearance URLs

3. **Daily States**: Retrieve from `EvolutionSystem.getDailyStates()` (private method - need to expose)
   - Alternative: Parse from health data cache

### Data Transformation

```typescript
// Transform HealthDataCache to HistoricalDataPoint[]
function transformCacheToDataPoints(cache: Record<string, HealthDataCache>): HistoricalDataPoint[] {
  return Object.entries(cache)
    .map(([date, data]) => ({
      date,
      steps: data.steps,
      sleepHours: data.sleepHours,
      hrv: data.hrv,
      emotionalState: data.emotionalState,
      calculationMethod: data.calculationMethod,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
```

### Statistics Calculation

```typescript
interface HistoryStatistics {
  averageSteps: number;
  averageSleep: number | null;
  averageHRV: number | null;
  mostFrequentState: EmotionalState;
  totalEvolutions: number;
  daysSinceLastEvolution: number;
}

function calculateStatistics(
  data: HistoricalDataPoint[],
  evolutionRecords: EvolutionRecord[]
): HistoryStatistics {
  // Calculate averages
  const averageSteps = data.reduce((sum, d) => sum + d.steps, 0) / data.length;

  const sleepData = data.filter(d => d.sleepHours !== undefined);
  const averageSleep =
    sleepData.length > 0
      ? sleepData.reduce((sum, d) => sum + (d.sleepHours || 0), 0) / sleepData.length
      : null;

  const hrvData = data.filter(d => d.hrv !== undefined);
  const averageHRV =
    hrvData.length > 0 ? hrvData.reduce((sum, d) => sum + (d.hrv || 0), 0) / hrvData.length : null;

  // Find most frequent state
  const stateCounts = new Map<EmotionalState, number>();
  data.forEach(d => {
    stateCounts.set(d.emotionalState, (stateCounts.get(d.emotionalState) || 0) + 1);
  });
  const mostFrequentState = Array.from(stateCounts.entries()).sort((a, b) => b[1] - a[1])[0][0];

  // Evolution stats
  const totalEvolutions = evolutionRecords.length;
  const lastEvolution = evolutionRecords[0]; // Assuming sorted newest first
  const daysSinceLastEvolution = lastEvolution
    ? Math.floor((Date.now() - new Date(lastEvolution.timestamp).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    averageSteps,
    averageSleep,
    averageHRV,
    mostFrequentState,
    totalEvolutions,
    daysSinceLastEvolution,
  };
}
```

## Halloween Theme Design

### Color Palette

```typescript
const HALLOWEEN_COLORS = {
  // Primary purple shades
  primary: '#7C3AED',
  primaryDark: '#5B21B6',
  primaryLight: '#9333EA',

  // Accent colors
  orange: '#F97316',
  green: '#10B981',
  ghostWhite: '#F3F4F6',

  // Background colors
  darkBg: '#1a1a2e',
  cardBg: '#16213e',

  // State colors
  sad: '#DC2626',
  resting: '#7C3AED',
  active: '#10B981',
  vibrant: '#F59E0B',
  calm: '#3B82F6',
  tired: '#6B7280',
  stressed: '#EF4444',
  anxious: '#F97316',
  rested: '#8B5CF6',
};
```

### Decorative Elements

1. **Ghost Icons**: Use emoji or custom SVG ghosts (👻) for timeline markers
2. **Pumpkins**: Jack-o-lantern icons (🎃) for milestone badges
3. **Tombstones**: Tombstone icons (🪦) for evolution markers
4. **Bats**: Flying bat decorations (🦇) in headers
5. **Spiderwebs**: Subtle web patterns in card corners
6. **Glowing Effects**: Purple glow shadows on interactive elements

### Typography

- **Headers**: Bold, 24-32px, purple (#9333EA)
- **Body Text**: Regular, 14-16px, light gray (#D1D5DB)
- **Labels**: Uppercase, 12px, purple (#A78BFA)
- **Values**: Bold, 20-48px, purple (#9333EA)

## Error Handling

### Error States

1. **No Data Available**:
   - Display: Ghost emoji with "No history yet" message
   - Action: Encourage user to keep tracking

2. **Loading Error**:
   - Display: Error message with retry button
   - Fallback: Show cached data if available

3. **Partial Data**:
   - Display: Available data with note about missing metrics
   - Gracefully handle undefined sleep/HRV values

### Error Recovery

```typescript
async function loadHistoricalDataWithFallback(): Promise<HistoricalDataPoint[]> {
  try {
    const cache = await StorageService.getHealthDataCache();
    if (!cache || Object.keys(cache).length === 0) {
      throw new Error('No cached data available');
    }
    return transformCacheToDataPoints(cache);
  } catch (error) {
    console.error('Error loading historical data:', error);
    // Return empty array to show "no data" state
    return [];
  }
}
```

## Testing Strategy

### Unit Tests

1. **Data Transformation Tests**:
   - Test `transformCacheToDataPoints()` with various cache formats
   - Test date sorting and filtering

2. **Statistics Calculation Tests**:
   - Test `calculateStatistics()` with different data sets
   - Test edge cases (empty data, single data point)

3. **Time Range Filtering Tests**:
   - Test filtering for 7d, 30d, 90d, all time ranges
   - Test boundary conditions

### Integration Tests

1. **Data Loading**:
   - Test loading from StorageService
   - Test error handling and fallbacks

2. **Navigation**:
   - Test navigation from MainScreen
   - Test back button functionality

3. **User Interactions**:
   - Test time range filter changes
   - Test data point selection
   - Test chart interactions

### Visual Tests

1. **Responsive Layout**:
   - Test portrait and landscape orientations
   - Test on various screen sizes

2. **Theme Consistency**:
   - Verify Halloween color palette usage
   - Check decorative element placement

## Performance Considerations

### Optimization Strategies

1. **Data Pagination**:
   - Load data in chunks for "All Time" view
   - Implement virtual scrolling for table view
   - Limit initial render to 90 days max

2. **Chart Rendering**:
   - Use memoization for chart data transformations
   - Debounce chart updates during time range changes
   - Limit data points displayed (sample if > 100 points)

3. **Image Loading**:
   - Lazy load evolution appearance images
   - Use thumbnail previews for milestone cards
   - Implement image caching

4. **State Management**:
   - Use React.memo for expensive components
   - Implement useMemo for statistics calculations
   - Use useCallback for event handlers

### Performance Targets

- **Initial Load**: < 2 seconds on mid-range devices
- **Time Range Switch**: < 500ms
- **Chart Animation**: 60 FPS
- **Scroll Performance**: Smooth scrolling with no jank
- **Memory Usage**: < 50MB additional memory

## Accessibility

### Screen Reader Support

- Provide descriptive labels for all interactive elements
- Announce time range changes
- Describe chart data in accessible format
- Provide text alternatives for decorative icons

### Touch Targets

- Minimum 44x44pt touch targets for all buttons
- Adequate spacing between interactive elements
- Support for swipe gestures on timeline

### Color Contrast

- Ensure 4.5:1 contrast ratio for text
- Use patterns in addition to colors for state indicators
- Provide high-contrast mode option

## Implementation Notes

### Third-Party Libraries

**Charting Library Options**:

1. **react-native-chart-kit** (Recommended)
   - Pros: Simple API, good performance, built-in animations
   - Cons: Limited customization
   - Install: `npm install react-native-chart-kit react-native-svg`

2. **victory-native**
   - Pros: Highly customizable, powerful
   - Cons: Larger bundle size, steeper learning curve
   - Install: `npm install victory-native react-native-svg`

**Recommendation**: Use react-native-chart-kit for MVP, migrate to victory-native if advanced customization needed.

### MainScreen Integration

**Modify Evolution Progress Container**:

```typescript
// In MainScreen.tsx, update evolutionProgressContainer section
<View style={styles.evolutionProgressContainer}>
  <View style={styles.evolutionProgressHeader}>
    <Text style={styles.evolutionProgressTitle}>✨ Evolution Progress</Text>
    <TouchableOpacity
      onPress={() => navigation.navigate('EvolutionHistory')}
      accessibilityLabel="View evolution history">
      <Text style={styles.viewHistoryLink}>📊 View History</Text>
    </TouchableOpacity>
  </View>
  {/* ... rest of evolution progress UI ... */}
</View>
```

**Add Navigation Route**:

```typescript
// In AppNavigator.tsx
<Stack.Screen
  name="EvolutionHistory"
  component={EvolutionHistoryScreen}
  options={{
    title: 'Evolution History',
    headerStyle: { backgroundColor: '#1a1a2e' },
    headerTintColor: '#9333EA',
  }}
/>
```

### Data Persistence

**Time Range Preference**:

- Store selected time range in AsyncStorage
- Key: `@symbi:history_time_range`
- Restore on screen mount

**Cache Management**:

- Leverage existing 30-day rolling cache from StorageService
- No additional caching needed for MVP
- Consider implementing extended cache (90+ days) in future

## Future Enhancements

### Phase 2 Features

1. **Export Data**: Allow users to export history as CSV/JSON
2. **Share Achievements**: Share evolution milestones on social media
3. **Comparison View**: Compare current week vs previous weeks
4. **Insights**: AI-generated insights about patterns
5. **Goals Tracking**: Overlay goal lines on charts
6. **Annotations**: Allow users to add notes to specific dates

### Phase 3 Features

1. **Cloud Sync**: Sync history across devices
2. **Advanced Filters**: Filter by emotional state, day of week
3. **Heatmap View**: Calendar heatmap of activity levels
4. **Correlations**: Show correlations between metrics
5. **Predictions**: Predict future states based on patterns
6. **Achievements**: Unlock badges for milestones

## Dependencies

### New Dependencies

```json
{
  "react-native-chart-kit": "^6.12.0",
  "react-native-svg": "^13.9.0"
}
```

### Existing Dependencies (No Changes)

- React Navigation (already installed)
- AsyncStorage (already installed)
- Zustand (already installed)

## File Structure

```
src/
├── screens/
│   └── EvolutionHistoryScreen.tsx (NEW)
├── components/
│   ├── StatisticsCard.tsx (NEW)
│   ├── EmotionalStateTimeline.tsx (NEW)
│   ├── HealthMetricsChart.tsx (NEW)
│   ├── EvolutionMilestoneCard.tsx (NEW)
│   └── HealthDataTable.tsx (NEW)
├── types/
│   └── index.ts (UPDATE - add HistoricalDataPoint, HistoryStatistics)
├── navigation/
│   └── AppNavigator.tsx (UPDATE - add route)
└── screens/
    └── MainScreen.tsx (UPDATE - add history link)
```

## Design Mockup Description

### Screen Layout (Portrait)

```
┌─────────────────────────────┐
│ ← Evolution History     🦇  │ Header
├─────────────────────────────┤
│ [7D] [30D] [90D] [All]      │ Time Filter
├─────────────────────────────┤
│ ┌───────┐ ┌───────┐         │
│ │ 👻    │ │ 😴    │         │ Statistics
│ │ 8,234 │ │ 7.2h  │         │ Cards
│ │ steps │ │ sleep │         │
│ └───────┘ └───────┘         │
│ ┌───────┐ ┌───────┐         │
│ │ ❤️    │ │ 🎃    │         │
│ │ 65ms  │ │ Active│         │
│ │ HRV   │ │ state │         │
│ └───────┘ └───────┘         │
├─────────────────────────────┤
│ 📈 Steps Over Time          │ Chart
│ ┌─────────────────────────┐ │ Section
│ │     /\    /\            │ │
│ │    /  \  /  \    /\     │ │
│ │   /    \/    \  /  \    │ │
│ │  /            \/    \   │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ 🕰️ Emotional Timeline       │ Timeline
│ ┌─────────────────────────┐ │ Section
│ │ 👻 Nov 16 - Active      │ │
│ │ 👻 Nov 15 - Resting     │ │
│ │ 👻 Nov 14 - Active      │ │
│ │ ...                     │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ ✨ Evolution Milestones     │ Milestones
│ ┌─────────────────────────┐ │ Section
│ │ 🪦 Level 2 - Oct 15     │ │
│ │ [Image Preview]         │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ 📊 Data Table               │ Table
│ ┌─────────────────────────┐ │ Section
│ │ Date  │Steps│State      │ │
│ │ 11/16 │8234 │Active     │ │
│ │ 11/15 │5432 │Resting    │ │
│ │ ...                     │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

This design provides a comprehensive, engaging, and Halloween-themed history view that helps users understand their health journey through Symbi.
