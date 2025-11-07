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
