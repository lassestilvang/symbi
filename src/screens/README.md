# Screens

This directory contains all screen components for the Symbi application.

## Onboarding Flow

The onboarding flow guides new users through setting up Symbi and requesting health data permissions.

### Components

- **WelcomeScreen**: Introduction to Symbi with welcome message
- **HealthDataExplanationScreen**: Explains how health data affects Symbi's emotional states
- **PermissionRequestScreen**: Requests health data permissions (HealthKit/Google Fit)
- **ManualEntryExplanationScreen**: Explains manual entry mode for users who decline permissions
- **OnboardingFlow**: Orchestrates the onboarding screens with progress indicators

### Usage

```tsx
import { OnboardingFlow } from './screens/onboarding';

<OnboardingFlow
  onComplete={(dataSource) => {
    // Handle onboarding completion
    console.log('Selected data source:', dataSource);
  }}
  onRequestPermissions={async () => {
    // Request platform-specific permissions
    const result = await PermissionService.requestHealthPermissions();
    return result.granted;
  }}
/>
```

## Main Screens

### MainScreen

The primary app screen displaying the Symbi creature and health metrics.

**Features:**
- 8-bit pixel art Symbi ghost with emotional state animations in Tamagotchi-style frame
- Real-time step count display with progress bar
- Emotional state label (Sad, Resting, Active, etc.)
- Threshold indicators showing state ranges
- Pull-to-refresh for manual data updates
- Background sync with automatic updates
- Offline indicator when disconnected
- Settings button (top right corner)
- Configure thresholds button
- Test buttons for quick state changes (development)
- Evolution progress tracker with eligibility display (Phase 3)
- Evolution trigger button when eligible (Phase 3)
- "Calm your Symbi" breathing exercise button for Stressed/Anxious states (Phase 3)
- State change notifications with smooth fade animations
- Manual entry button for users in manual mode
- Multi-metric display (sleep, HRV) when available (Phase 2)
- Evolution celebration modal (Phase 3)
- Breathing exercise modal (Phase 3)

**UI Layout:**
- Minimalist top bar with app title, offline indicator, and settings button
- Tamagotchi-style frame containing the 8-bit Symbi ghost (centered, responsive)
- Emotional state label with debug info below ghost
- Manual entry button (when in manual mode)
- Test buttons for quick state testing (3 buttons: Sad, Resting, Active)
- Health metrics card with step count and goal
- Additional metrics row for sleep and HRV (Phase 2)
- Progress bar with color-coded fill based on emotional state
- Threshold indicators showing state ranges (Sad, Resting, Active)
- Evolution progress card with progress bar and trigger button (Phase 3)
- "Calm your Symbi" button (shown for Stressed/Anxious states)
- Configure thresholds button
- Last updated timestamp

**State Management:**
- Uses `useHealthDataStore` for health metrics and emotional state
- Uses `useSymbiStateStore` for Symbi evolution level and custom appearance
- Uses `useUserPreferencesStore` for user preferences and thresholds
- Local state for UI interactions (modals, notifications, loading states)

**Services Used:**
- `HealthDataUpdateService` - Fetches and updates health data
- `BackgroundSyncService` - Handles background data synchronization
- `InteractiveSessionManager` - Manages breathing exercises
- `EvolutionSystem` - Tracks evolution progress and triggers evolution events
- `AIBrainService` - Generates evolved Symbi appearances (Phase 3)

**Key Functions:**
- `initializeHealthData()` - Initializes health data service and fetches today's data
- `checkEvolutionProgress()` - Checks if Symbi is eligible for evolution
- `handleTriggerEvolution()` - Triggers evolution event with AI image generation
- `handleStartBreathingExercise()` - Starts breathing exercise session
- `handleBreathingComplete()` - Handles breathing exercise completion and state update
- `handleRefresh()` - Manual refresh via pull-to-refresh
- `handleSymbiPoke()` - Handles tap interaction with Symbi ghost

**Usage:**
```tsx
import { MainScreen } from './screens';

<MainScreen
  navigation={{
    navigate: (screen) => {
      // Handle navigation to other screens
      // Supported: 'Settings', 'Thresholds', 'ManualEntry'
    }
  }}
/>
```

### ManualEntryScreen

Allows users to manually enter their daily step count when not using automatic health data tracking.

**Features:**
- Input validation (0-100,000 steps)
- Automatic emotional state calculation
- Saves to local storage
- Updates health data store

**Usage:**
```tsx
import { ManualEntryScreen } from './screens';

<ManualEntryScreen
  onComplete={() => {
    // Navigate back or show success
  }}
/>
```

### SettingsScreen

Comprehensive settings interface for managing app preferences and data sources.

**Features:**
- Data source switching (HealthKit/Google Fit/Manual)
- Threshold configuration navigation
- Preference toggles (notifications, haptics, sound)
- Onboarding replay
- Privacy policy and data management
- Data export and deletion (coming soon)

**Usage:**
```tsx
import { SettingsScreen } from './screens';

<SettingsScreen
  onReplayOnboarding={() => {
    // Show onboarding flow again
  }}
  onNavigateToThresholds={() => {
    // Navigate to threshold configuration
  }}
  onNavigateToManualEntry={() => {
    // Navigate to manual entry screen
  }}
/>
```

## Navigation Integration

The screens are integrated with React Navigation in `src/navigation/AppNavigator.tsx`:

```tsx
import { AppNavigator } from './navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
```

## Requirements Fulfilled

This implementation fulfills the following requirements:

- **Requirement 1.1**: Onboarding explains health data permissions
- **Requirement 1.4**: Manual data entry mode available
- **Requirement 2.1, 2.4**: Manual entry interface with validation
- **Requirement 3.5**: Settings screen with threshold configuration
- **Requirement 11.1**: Privacy policy access
- **Requirement 11.5**: Data export functionality (UI ready)
- **Requirement 13.1, 13.2, 13.4**: Onboarding flow with explanations
- **Requirement 13.3**: Permission request with clear explanations
- **Requirement 13.5**: Onboarding replay functionality

## Design Patterns

### Color Scheme
- Background: `#1a1a2e` (dark navy)
- Primary: `#9333ea` (purple)
- Secondary: `#a78bfa` (light purple)
- Accent: `#d8b4fe` (lighter purple)
- Cards: `#2d2d44` (dark gray)

### Typography
- Headers: 28-32px, bold
- Body: 14-16px, regular
- Labels: 16-18px, semi-bold

### Spacing
- Section margins: 32px
- Card padding: 16-24px
- Button padding: 14-16px vertical

## Future Enhancements

- Add animations for screen transitions
- Implement data export functionality
- Add data deletion with confirmation
- Create privacy policy page
- Add theme switching (light/dark/auto)
- Implement Phase 2 multi-metric manual entry
