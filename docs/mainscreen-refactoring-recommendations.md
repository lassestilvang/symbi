# MainScreen.tsx Refactoring Recommendations

## Priority 1: Critical Issues (Fix Immediately)

### 1.1 Remove Unused Imports

**Issue**: `Image` is imported but never used (Note: `ImageBackground` IS used for the tamagotchi frame)

```typescript
// Remove this from line 13:
import {
  // ... other imports
  Image, // ❌ REMOVE - Not used
  ImageBackground, // ✅ KEEP - Used for tamagotchi frame on line 549
} from 'react-native';
```

**Action**: Remove the unused `Image` import to reduce bundle size and improve code clarity. Keep `ImageBackground` as it's used to display the tamagotchi frame around the Symbi ghost.

### 1.2 Fix Hardcoded API Key Security Risk

**Issue**: Line 195 contains `'YOUR_API_KEY_HERE'` placeholder

```typescript
// ❌ CURRENT (INSECURE):
const apiKey = (process.env.GEMINI_API_KEY as string) || 'YOUR_API_KEY_HERE';

// ✅ RECOMMENDED:
const apiKey = await SecureStorageService.getItem('GEMINI_API_KEY');
if (!apiKey) {
  setError('API key not configured. Please check settings.');
  return;
}
```

**Action**: Use SecureStorageService to retrieve API keys, never hardcode them.

### 1.3 Fix useEffect Dependency Arrays

**Issue**: Missing dependencies could cause stale closures

```typescript
// ❌ CURRENT:
useEffect(() => {
  initializeHealthData();
  startBackgroundSync();
  setupNetworkListener();
  checkEvolutionProgress();
  return () => {
    stopBackgroundSync();
  };
}, []); // Missing dependencies!

// ✅ RECOMMENDED:
useEffect(() => {
  initializeHealthData();
  startBackgroundSync();
  const unsubscribe = setupNetworkListener();
  checkEvolutionProgress();

  return () => {
    stopBackgroundSync();
    unsubscribe?.();
  };
}, []); // Empty is OK if truly only on mount
```

**Action**: Ensure setupNetworkListener returns cleanup function and it's called.

---

## Priority 2: Component Decomposition (Refactor Soon)

### 2.1 Extract Sub-Components

**Current**: 1159-line monolithic component
**Target**: Multiple focused components <200 lines each

#### Recommended Component Structure:

```
MainScreen.tsx (orchestrator, ~150 lines)
├── SymbiDisplay.tsx (~100 lines)
│   ├── Symbi8BitCanvas
│   └── EmotionalStateLabel
├── HealthMetricsCard.tsx (~80 lines)
│   ├── StepCounter
│   ├── SleepMetric
│   └── HRVMetric
├── ProgressIndicator.tsx (~60 lines)
│   ├── ProgressBar
│   └── ThresholdIndicators
├── EvolutionProgress.tsx (~100 lines)
│   ├── ProgressBar
│   └── TriggerButton
├── ActionButtons.tsx (~80 lines)
│   ├── CalmButton
│   ├── ConfigureButton
│   └── ManualEntryButton
└── NotificationBanner.tsx (~50 lines)
    ├── ErrorNotification
    ├── StateChangeNotification
    └── OfflineIndicator
```

### 2.2 Extract Custom Hooks

**Create these hooks to separate concerns:**

```typescript
// hooks/useHealthDataSync.ts
export const useHealthDataSync = () => {
  // Move initializeHealthData, startBackgroundSync, stopBackgroundSync
  // Returns: { isLoading, error, refresh }
};

// hooks/useEvolutionProgress.ts
export const useEvolutionProgress = () => {
  // Move checkEvolutionProgress, handleTriggerEvolution
  // Returns: { eligibility, triggerEvolution, isInProgress }
};

// hooks/useBreathingSession.ts
export const useBreathingSession = () => {
  // Move breathing exercise logic
  // Returns: { startSession, isActive, complete, cancel }
};

// hooks/useNetworkStatus.ts
export const useNetworkStatus = () => {
  // Move setupNetworkListener
  // Returns: { isOffline }
};

// hooks/useStateNotification.ts
export const useStateNotification = (emotionalState: EmotionalState) => {
  // Move showStateChangeNotification logic
  // Returns: { notification, opacity }
};
```

---

## Priority 3: Code Quality Improvements

### 3.1 Extract Constants

```typescript
// constants/mainScreen.constants.ts
export const ANIMATION_DURATIONS = {
  NOTIFICATION_FADE_IN: 300,
  NOTIFICATION_HOLD: 2000,
  NOTIFICATION_FADE_OUT: 300,
} as const;

export const SYMBI_SIZE = {
  MAX_WIDTH: 350,
  SCREEN_PERCENTAGE: 0.8,
} as const;

export const DEFAULT_THRESHOLDS = {
  SAD: 2000,
  ACTIVE: 8000,
} as const;

export const COLORS = {
  PURPLE_DARK: '#5B21B6',
  PURPLE_MEDIUM: '#7C3AED',
  PURPLE_BRIGHT: '#9333EA',
  BACKGROUND: '#1a1a2e',
  CARD_BG: '#16213e',
  ERROR_BG: '#7F1D1D',
  ERROR_BORDER: '#DC2626',
  SUCCESS: '#10B981',
} as const;
```

### 3.2 Create Utility Functions

```typescript
// utils/emotionalState.utils.ts
export const capitalizeState = (state: EmotionalState): string => {
  return state.charAt(0).toUpperCase() + state.slice(1);
};

export const getStateColor = (state: EmotionalState): string => {
  const colorMap: Record<EmotionalState, string> = {
    [EmotionalState.SAD]: COLORS.PURPLE_DARK,
    [EmotionalState.RESTING]: COLORS.PURPLE_MEDIUM,
    [EmotionalState.ACTIVE]: COLORS.PURPLE_BRIGHT,
    // ... other states
  };
  return colorMap[state] || COLORS.PURPLE_MEDIUM;
};

export const shouldShowCalmButton = (state: EmotionalState): boolean => {
  return state === EmotionalState.STRESSED || state === EmotionalState.ANXIOUS;
};

// utils/time.utils.ts
export const formatRelativeTime = (date: Date | null): string => {
  if (!date) return 'Never';

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// utils/progress.utils.ts
export const calculateStepProgress = (steps: number, activeThreshold: number): number => {
  if (steps >= activeThreshold) return 100;
  if (steps <= 0) return 0;
  return Math.min(100, (steps / activeThreshold) * 100);
};
```

### 3.3 Improve Error Handling

```typescript
// types/errors.ts
export enum HealthDataErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NO_DATA_AVAILABLE = 'NO_DATA_AVAILABLE',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class HealthDataError extends Error {
  constructor(
    public type: HealthDataErrorType,
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'HealthDataError';
  }
}

// utils/errorHandler.ts
export const parseHealthDataError = (error: unknown): HealthDataError => {
  if (error instanceof HealthDataError) return error;

  const errorString = error instanceof Error ? error.message : String(error);

  if (errorString.includes('permission') || errorString.includes('authorized')) {
    return new HealthDataError(
      HealthDataErrorType.PERMISSION_DENIED,
      'Health data permissions not granted. Please enable in Settings.',
      error
    );
  }

  if (errorString.includes('no data') || errorString.includes('not available')) {
    return new HealthDataError(
      HealthDataErrorType.NO_DATA_AVAILABLE,
      'No health data available yet. Try walking a bit!',
      error
    );
  }

  if (errorString.includes('network') || errorString.includes('connection')) {
    return new HealthDataError(
      HealthDataErrorType.NETWORK_ERROR,
      'Network error. Using cached data if available.',
      error
    );
  }

  return new HealthDataError(
    HealthDataErrorType.UNKNOWN_ERROR,
    'Unable to load health data. Please try again.',
    error
  );
};
```

### 3.4 Add Type Safety

```typescript
// Add proper navigation typing
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Main: undefined;
  Settings: undefined;
  Thresholds: undefined;
  ManualEntry: undefined;
  EvolutionGallery: undefined;
};

interface MainScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Main'>;
}

// Add return types to all functions
const initializeHealthData = async (): Promise<void> => {
  // ...
};

const calculateProgress = (): number => {
  // ...
};

const getProgressColor = (): string => {
  // ...
};
```

### 3.5 Fix sessionManager Anti-Pattern

```typescript
// ❌ CURRENT (creates new instance on every render):
const [sessionManager] = useState(() => {
  const healthService = createHealthDataService(profile?.preferences.dataSource);
  return new InteractiveSessionManager(healthService);
});

// ✅ RECOMMENDED (use useMemo or useRef):
const sessionManager = useMemo(() => {
  const healthService = createHealthDataService(profile?.preferences.dataSource);
  return new InteractiveSessionManager(healthService);
}, [profile?.preferences.dataSource]);

// Or even better, use a custom hook:
const sessionManager = useSessionManager(profile?.preferences.dataSource);
```

---

## Priority 4: Performance Optimizations

### 4.1 Memoize Expensive Calculations

```typescript
const progress = useMemo(
  () => calculateProgress(),
  [healthMetrics.steps, thresholds.activeThreshold]
);

const progressColor = useMemo(() => getProgressColor(), [emotionalState]);

const stateName = useMemo(() => getStateName(), [emotionalState]);
```

### 4.2 Optimize Re-renders with React.memo

```typescript
// For extracted components:
export const HealthMetricsCard = React.memo(
  ({ steps, sleepHours, hrv, thresholds }: HealthMetricsCardProps) => {
    // ...
  }
);

export const ProgressIndicator = React.memo(({ progress, color }: ProgressIndicatorProps) => {
  // ...
});
```

### 4.3 Debounce Rapid Updates

```typescript
// For background sync updates
import { debounce } from 'lodash'; // or create custom debounce

const debouncedHealthUpdate = useMemo(
  () =>
    debounce(async () => {
      await HealthDataUpdateService.updateDailyHealthData();
    }, 1000),
  []
);
```

---

## Priority 5: Testing Improvements

### 5.1 Make Component More Testable

```typescript
// Extract business logic from component
// services/mainScreen.service.ts
export class MainScreenService {
  static async initializeHealthData(): Promise<void> {
    await HealthDataUpdateService.initialize();
    await HealthDataUpdateService.updateDailyHealthData();
  }

  static calculateProgress(steps: number, activeThreshold: number): number {
    if (steps >= activeThreshold) return 100;
    if (steps <= 0) return 0;
    return Math.min(100, (steps / activeThreshold) * 100);
  }

  // ... other business logic
}

// Now MainScreen just orchestrates, making it easier to test
```

### 5.2 Add Test IDs

```typescript
<TouchableOpacity
  testID="settings-button"
  style={styles.settingsButton}
  onPress={handleOpenSettings}
  accessibilityLabel="Open settings">
  <Text style={styles.settingsIcon}>⚙️</Text>
</TouchableOpacity>
```

---

## Priority 6: Accessibility Improvements

### 6.1 Add Missing Accessibility Labels

```typescript
<View
  accessible={true}
  accessibilityLabel={`Current emotional state: ${getStateName()}`}
  style={styles.stateContainer}>
  <Text style={styles.stateName}>{getStateName()}</Text>
</View>

<View
  accessible={true}
  accessibilityLabel={`Steps today: ${healthMetrics.steps}. Goal: ${thresholds.activeThreshold}`}
  style={styles.metricCard}>
  {/* ... */}
</View>
```

### 6.2 Add Accessibility Hints

```typescript
<TouchableOpacity
  accessibilityLabel="Configure thresholds"
  accessibilityHint="Opens screen to customize step count thresholds"
  accessibilityRole="button"
  style={styles.configureButton}
  onPress={handleConfigureThresholds}>
  <Text style={styles.configureButtonText}>⚡ Configure Thresholds</Text>
</TouchableOpacity>
```

---

## Implementation Priority Order

1. **Week 1**: Remove unused imports, fix API key security, fix useEffect cleanup
2. **Week 2**: Extract 3-4 major sub-components (HealthMetricsCard, EvolutionProgress)
3. **Week 3**: Create custom hooks (useHealthDataSync, useEvolutionProgress)
4. **Week 4**: Extract constants and utility functions
5. **Week 5**: Add proper TypeScript types and error handling
6. **Week 6**: Performance optimizations (memoization, React.memo)
7. **Week 7**: Testing improvements and accessibility enhancements

---

## Estimated Impact

| Improvement             | Lines Reduced | Maintainability | Performance | Security   |
| ----------------------- | ------------- | --------------- | ----------- | ---------- |
| Remove unused imports   | -2            | ⭐              | ⭐          | -          |
| Fix API key             | 0             | ⭐⭐⭐          | -           | ⭐⭐⭐⭐⭐ |
| Component decomposition | -600          | ⭐⭐⭐⭐⭐      | ⭐⭐        | -          |
| Extract hooks           | -300          | ⭐⭐⭐⭐        | ⭐          | -          |
| Extract constants       | -50           | ⭐⭐⭐          | -           | -          |
| Add memoization         | +20           | ⭐⭐            | ⭐⭐⭐⭐    | -          |
| Improve types           | +50           | ⭐⭐⭐⭐        | -           | ⭐⭐       |

**Total estimated reduction**: ~900 lines in MainScreen.tsx
**Final MainScreen size**: ~250 lines (orchestration only)
