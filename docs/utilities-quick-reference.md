# Utilities Quick Reference

## Overview

This document provides a quick reference for the centralized utility modules and constants used throughout the Symbi application.

## Theme Constants (`src/constants/theme.ts`)

### HALLOWEEN_COLORS

Main color palette for the application.

```typescript
import { HALLOWEEN_COLORS } from '../constants/theme';

// Primary colors
HALLOWEEN_COLORS.primary; // '#7C3AED' - Main purple
HALLOWEEN_COLORS.primaryDark; // '#5B21B6' - Dark purple
HALLOWEEN_COLORS.primaryLight; // '#9333EA' - Light purple

// Accent colors
HALLOWEEN_COLORS.orange; // '#F97316' - Orange accent
HALLOWEEN_COLORS.green; // '#10B981' - Green accent

// Background colors
HALLOWEEN_COLORS.darkBg; // '#1a1a2e' - Dark background
HALLOWEEN_COLORS.cardBg; // '#16213e' - Card background
HALLOWEEN_COLORS.ghostWhite; // '#F3F4F6' - Light text

// Table colors
HALLOWEEN_COLORS.rowEven; // '#1a1a2e' - Even row
HALLOWEEN_COLORS.rowOdd; // '#16213e' - Odd row
```

**Usage Example:**

```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: HALLOWEEN_COLORS.darkBg,
    borderColor: HALLOWEEN_COLORS.primaryDark,
  },
  text: {
    color: HALLOWEEN_COLORS.ghostWhite,
  },
});
```

### STATE_COLORS

Color mapping for emotional states.

```typescript
import { STATE_COLORS } from '../constants/theme';

STATE_COLORS.sad; // '#DC2626' - Red
STATE_COLORS.resting; // '#7C3AED' - Purple
STATE_COLORS.active; // '#10B981' - Green
STATE_COLORS.vibrant; // '#F59E0B' - Amber
STATE_COLORS.calm; // '#3B82F6' - Blue
STATE_COLORS.tired; // '#6B7280' - Gray
STATE_COLORS.stressed; // '#EF4444' - Red-orange
STATE_COLORS.anxious; // '#F97316' - Orange
STATE_COLORS.rested; // '#8B5CF6' - Light purple
```

**Usage Example:**

```typescript
<View style={{ backgroundColor: STATE_COLORS[emotionalState] }}>
  <Text>{emotionalState}</Text>
</View>
```

### METRIC_CONFIG

Configuration for health metrics.

```typescript
import { METRIC_CONFIG } from '../constants/theme';

// Steps configuration
METRIC_CONFIG.steps.label; // "Steps"
METRIC_CONFIG.steps.color; // "#7C3AED"
METRIC_CONFIG.steps.suffix; // ""
METRIC_CONFIG.steps.decimals; // 0

// Sleep configuration
METRIC_CONFIG.sleep.label; // "Sleep"
METRIC_CONFIG.sleep.color; // "#F97316"
METRIC_CONFIG.sleep.suffix; // "h"
METRIC_CONFIG.sleep.decimals; // 1

// HRV configuration
METRIC_CONFIG.hrv.label; // "HRV"
METRIC_CONFIG.hrv.color; // "#10B981"
METRIC_CONFIG.hrv.suffix; // "ms"
METRIC_CONFIG.hrv.decimals; // 0
```

**Usage Example:**

```typescript
const config = METRIC_CONFIG[metricType];
const formattedValue = `${value.toFixed(config.decimals)}${config.suffix}`;
```

### DECORATION_ICONS

Halloween-themed decoration icons.

```typescript
import { DECORATION_ICONS } from '../constants/theme';

DECORATION_ICONS.ghost; // '👻'
DECORATION_ICONS.pumpkin; // '🎃'
DECORATION_ICONS.tombstone; // '🪦'
DECORATION_ICONS.bat; // '🦇'
```

**Usage Example:**

```typescript
<Text style={styles.decoration}>
  {DECORATION_ICONS.pumpkin}
</Text>
```

## Date Helpers (`src/utils/dateHelpers.ts`)

Centralized date formatting functions.

```typescript
import {
  formatShortDate,
  formatMediumDate,
  formatFullDate,
  formatWeekday,
  formatDisplayDate,
} from '../utils/dateHelpers';

// Format examples for "2025-11-16"
formatShortDate('2025-11-16'); // "11/16"
formatMediumDate('2025-11-16'); // "Nov 16"
formatFullDate('2025-11-16'); // "Monday, November 16, 2025"
formatWeekday('2025-11-16'); // "Mon"
formatDisplayDate(new Date()); // "Nov 16, 2025"
```

**Use Cases:**

- **formatShortDate**: Chart axis labels, compact displays
- **formatMediumDate**: Timeline items, card headers
- **formatFullDate**: Modal titles, detailed views
- **formatWeekday**: Day-of-week indicators
- **formatDisplayDate**: General date display with year

**Example:**

```typescript
// Chart labels
const labels = data.map(point => formatShortDate(point.date));

// Timeline display
<Text>{formatMediumDate(item.date)}</Text>

// Modal header
<Text>{formatFullDate(selectedDate)}</Text>
```

## Metric Helpers (`src/utils/metricHelpers.ts`)

Type-safe health metric operations.

```typescript
import {
  MetricType,
  getMetricValue,
  hasMetricValue,
  filterByMetric,
  formatMetricValue,
  getMetricConfig,
} from '../utils/metricHelpers';

// Type definition
type MetricType = 'steps' | 'sleep' | 'hrv';
```

### getMetricValue

Extract metric value from a data point.

```typescript
const value = getMetricValue(dataPoint, 'steps');
// Returns: number (steps count)

const sleepValue = getMetricValue(dataPoint, 'sleep');
// Returns: number (sleep hours or 0 if undefined)
```

### hasMetricValue

Check if a data point has a valid value for a metric.

```typescript
const hasSteps = hasMetricValue(dataPoint, 'steps');
// Returns: boolean (true if steps > 0)

const hasSleep = hasMetricValue(dataPoint, 'sleep');
// Returns: boolean (true if sleepHours exists and > 0)
```

### filterByMetric

Filter data points that have valid values for a metric.

```typescript
const stepsData = filterByMetric(allData, 'steps');
// Returns: HistoricalDataPoint[] (only points with steps > 0)

const sleepData = filterByMetric(allData, 'sleep');
// Returns: HistoricalDataPoint[] (only points with sleep data)
```

### formatMetricValue

Format a metric value with appropriate precision and suffix.

```typescript
formatMetricValue(8542, 'steps'); // "8542"
formatMetricValue(7.5, 'sleep'); // "7.5h"
formatMetricValue(65, 'hrv'); // "65ms"
```

### getMetricConfig

Get the configuration for a specific metric type.

```typescript
const config = getMetricConfig('steps');
// Returns: { label: "Steps", color: "#7C3AED", suffix: "", decimals: 0 }
```

**Complete Example:**

```typescript
import { filterByMetric, formatMetricValue, getMetricConfig } from '../utils/metricHelpers';

const ChartComponent = ({ data, metricType }) => {
  // Filter data for the metric
  const filteredData = filterByMetric(data, metricType);

  // Get metric configuration
  const config = getMetricConfig(metricType);

  // Format values for display
  const formattedValues = filteredData.map(point =>
    formatMetricValue(getMetricValue(point, metricType), metricType)
  );

  return (
    <View>
      <Text style={{ color: config.color }}>{config.label}</Text>
      {formattedValues.map(value => <Text>{value}</Text>)}
    </View>
  );
};
```

## Best Practices

### 1. Always Use Centralized Constants

❌ **Don't:**

```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2e', // Hard-coded color
  },
});
```

✅ **Do:**

```typescript
import { HALLOWEEN_COLORS } from '../constants/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: HALLOWEEN_COLORS.darkBg,
  },
});
```

### 2. Use Type-Safe Metric Operations

❌ **Don't:**

```typescript
const value = point.sleepHours || 0; // Unsafe
const formatted = `${value.toFixed(1)}h`; // Manual formatting
```

✅ **Do:**

```typescript
import { getMetricValue, formatMetricValue } from '../utils/metricHelpers';

const value = getMetricValue(point, 'sleep');
const formatted = formatMetricValue(value, 'sleep');
```

### 3. Consistent Date Formatting

❌ **Don't:**

```typescript
const date = new Date(dateString);
const formatted = `${date.getMonth() + 1}/${date.getDate()}`; // Manual formatting
```

✅ **Do:**

```typescript
import { formatShortDate } from '../utils/dateHelpers';

const formatted = formatShortDate(dateString);
```

### 4. Memoize Expensive Operations

✅ **Do:**

```typescript
import { useMemo } from 'react';
import { filterByMetric } from '../utils/metricHelpers';

const filteredData = useMemo(() => {
  return filterByMetric(data, metricType);
}, [data, metricType]);
```

## Migration Guide

If you have existing code using hard-coded values, follow these steps:

### Step 1: Import Constants

```typescript
import { HALLOWEEN_COLORS, STATE_COLORS, METRIC_CONFIG } from '../constants/theme';
```

### Step 2: Replace Hard-Coded Colors

```typescript
// Before
backgroundColor: '#7C3AED';

// After
backgroundColor: HALLOWEEN_COLORS.primary;
```

### Step 3: Import Utilities

```typescript
import { formatShortDate, formatDisplayDate } from '../utils/dateHelpers';
import { getMetricValue, formatMetricValue } from '../utils/metricHelpers';
```

### Step 4: Replace Manual Formatting

```typescript
// Before
const formatted = `${date.getMonth() + 1}/${date.getDate()}`;

// After
const formatted = formatShortDate(dateString);
```

### Step 5: Add Type Safety

```typescript
// Before
const value = point.steps;

// After
import { MetricType, getMetricValue } from '../utils/metricHelpers';
const metricType: MetricType = 'steps';
const value = getMetricValue(point, metricType);
```

## Testing

All utility functions are pure and easily testable:

```typescript
import { formatShortDate } from '../utils/dateHelpers';
import { getMetricValue } from '../utils/metricHelpers';

describe('dateHelpers', () => {
  it('formats short date correctly', () => {
    expect(formatShortDate('2025-11-16')).toBe('11/16');
  });
});

describe('metricHelpers', () => {
  it('extracts metric value', () => {
    const point = { date: '2025-11-16', steps: 8542 };
    expect(getMetricValue(point, 'steps')).toBe(8542);
  });
});
```

## Related Documentation

- [Halloween Theme Colors](./halloween-theme-colors.md)
- [Code Refactoring Summary](./code-refactoring-nov-16-2025.md)
- [App Architecture](./app-architecture.md)
- [Component README](../src/components/README.md)

## References

- TypeScript Handbook: [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- React: [useMemo](https://react.dev/reference/react/useMemo)
- React: [useCallback](https://react.dev/reference/react/useCallback)
