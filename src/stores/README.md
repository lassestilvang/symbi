# Zustand Stores

This directory contains the Zustand state management stores for the Symbi application.

## Stores

### 1. Health Data Store (`healthDataStore.ts`)

Manages reactive health data state including emotional state, health metrics, and loading states.

**Usage:**

```typescript
import { useHealthDataStore } from './stores';

function MyComponent() {
  const { emotionalState, healthMetrics, updateHealthData, isLoading } = useHealthDataStore();

  // Update health data and emotional state
  await updateHealthData({ steps: 8500, sleepHours: 7.5 }, EmotionalState.ACTIVE, 'rule-based');
}
```

### 2. User Preferences Store (`userPreferencesStore.ts`)

Manages user profile, preferences, thresholds, and goals with automatic persistence to AsyncStorage.

**Usage:**

```typescript
import { useUserPreferencesStore } from './stores';

function SettingsScreen() {
  const { profile, updatePreferences, updateThresholds, initializeProfile } =
    useUserPreferencesStore();

  // Initialize on app launch
  useEffect(() => {
    initializeProfile();
  }, []);

  // Update preferences
  await updatePreferences({
    notificationsEnabled: true,
    theme: 'dark',
  });

  // Update thresholds
  await updateThresholds({
    sadThreshold: 3000,
    activeThreshold: 10000,
  });
}
```

### 3. Symbi State Store (`symbiStateStore.ts`)

Manages the Symbi creature's state including emotional state, evolution level, and appearance.

**Usage:**

```typescript
import { useSymbiStateStore } from './stores';

function SymbiComponent() {
  const {
    emotionalState,
    evolutionLevel,
    customAppearanceUrl,
    transitionToState,
    addEvolutionRecord,
  } = useSymbiStateStore();

  // Transition to new state with animation
  await transitionToState(EmotionalState.VIBRANT, 2000);

  // Add evolution record
  await addEvolutionRecord({
    id: 'evo_1',
    timestamp: new Date(),
    evolutionLevel: 1,
    appearanceUrl: 'https://...',
    daysInPositiveState: 30,
    dominantStates: [EmotionalState.ACTIVE, EmotionalState.VIBRANT],
  });
}
```

## Persistence

All stores automatically persist their data to AsyncStorage:

- **Health Data Store**: Persists to health data cache (30-day rolling window)
- **User Preferences Store**: Persists entire profile on every update
- **Symbi State Store**: Persists evolution records

## Data Flow

```
User Action → Store Action → Update State → Persist to AsyncStorage
                                ↓
                          Update UI (React)
```

## Best Practices

1. **Initialize on App Launch**: Call `initializeProfile()` and `loadEvolutionRecords()` when the app starts
2. **Use Selectors**: Only subscribe to the specific state you need to avoid unnecessary re-renders
3. **Async Actions**: All persistence actions are async - use `await` or handle promises appropriately
4. **Error Handling**: Stores log errors but don't throw - check return values for success/failure

## Example: Complete Integration

```typescript
import { useEffect } from 'react';
import {
  useHealthDataStore,
  useUserPreferencesStore,
  useSymbiStateStore
} from './stores';

function App() {
  const initializeProfile = useUserPreferencesStore(s => s.initializeProfile);
  const loadEvolutionRecords = useSymbiStateStore(s => s.loadEvolutionRecords);

  useEffect(() => {
    // Initialize stores on app launch
    const init = async () => {
      await initializeProfile();
      await loadEvolutionRecords();
    };
    init();
  }, []);

  return <MainScreen />;
}
```
