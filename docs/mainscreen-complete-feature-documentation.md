# MainScreen Complete Feature Documentation

**Date**: November 16, 2025  
**Component**: `src/screens/MainScreen.tsx`  
**Status**: Production Ready

## Overview

MainScreen is the primary interface of the Symbi application, serving as the central hub where users interact with their digital pet and monitor their health metrics. The screen integrates all three development phases (MVP, AI Analysis, and Interactive Features) into a cohesive experience.

## Architecture

### Component Structure

```
MainScreen
├── Header
│   ├── Title ("Symbi")
│   ├── Offline Indicator (conditional)
│   └── Settings Button
├── Error Container (conditional)
├── State Change Notification (animated, conditional)
├── Symbi Display
│   └── Tamagotchi Frame
│       └── 8-bit Ghost Canvas (Symbi8BitCanvas)
├── Emotional State Label
├── Manual Entry Button (conditional - manual mode only)
├── Test Buttons (3 buttons for quick state testing)
├── Health Metrics
│   ├── Primary Metric Card (Steps)
│   └── Additional Metrics Row (Sleep, HRV - Phase 2)
├── Progress Bar (color-coded by state)
├── Threshold Indicators (Sad, Resting, Active ranges)
├── Evolution Progress Card (Phase 3, conditional)
│   ├── Progress Bar
│   ├── Days Counter
│   └── Evolution Trigger Button (when eligible)
├── Calm Button (Phase 3, conditional - Stressed/Anxious only)
├── Configure Thresholds Button
├── Last Updated Timestamp
└── Modals
    ├── Breathing Exercise Modal (Phase 3)
    └── Evolution Celebration Modal (Phase 3)
```

## Features by Phase

### Phase 1: MVP Features

#### 1. Health Data Integration
- **Automatic Fetching**: Retrieves step count from HealthKit (iOS) or Google Fit (Android)
- **Manual Entry Mode**: Allows users to manually input step count
- **Background Sync**: Listens for health data updates via BackgroundSyncService
- **Pull-to-Refresh**: Manual refresh capability with visual feedback

#### 2. Emotional State Display
- **Three Base States**: Sad, Resting, Active
- **Visual Representation**: 8-bit pixel art ghost with state-specific animations
- **State Label**: Clear text label showing current emotional state
- **Debug Info**: Step count and state name for development

#### 3. Progress Tracking
- **Progress Bar**: Visual representation of progress toward Active state
- **Color Coding**: Bar color changes based on emotional state
  - Sad: Dark purple (#5B21B6)
  - Resting: Medium purple (#7C3AED)
  - Active: Bright purple (#9333EA)
- **Percentage Display**: Shows exact progress percentage

#### 4. Threshold Configuration
- **Visual Indicators**: Shows threshold ranges for each state
- **Configure Button**: Direct access to threshold configuration screen
- **Default Values**: 2000 steps (Sad threshold), 8000 steps (Active threshold)

#### 5. Tamagotchi Frame
- **Visual Design**: Symbi ghost displayed within a Tamagotchi-style frame
- **Responsive Sizing**: Frame scales appropriately for different screen sizes
- **Interactive**: Ghost can be tapped/poked (with console logging)

### Phase 2: AI Analysis Features

#### 1. Multi-Metric Display
- **Sleep Hours**: Displays sleep duration when available
- **HRV (Heart Rate Variability)**: Shows HRV value when available
- **Additional Metrics Row**: Compact cards for sleep and HRV
- **Icons**: Emoji icons for visual clarity (😴 for sleep, ❤️ for HRV)

#### 2. AI-Powered States
- **Extended States**: Supports Vibrant, Calm, Tired, Stressed, Anxious, Rested
- **Automatic Analysis**: Daily AI analysis via Gemini API
- **Fallback Logic**: Falls back to Phase 1 rule-based logic if AI fails

### Phase 3: Interactive Features

#### 1. Evolution System
- **Progress Tracking**: Displays cumulative days in Active/Vibrant states
- **Progress Bar**: Visual representation of evolution progress (0-30 days)
- **Eligibility Badge**: "Ready!" badge when evolution is available
- **Evolution Trigger**: Button to initiate evolution event
- **AI Image Generation**: Generates evolved Symbi appearance via Gemini API
- **Celebration Modal**: Full-screen celebration when evolution completes
- **Loading State**: Shows activity indicator during image generation

#### 2. Interactive Sessions
- **Calm Button**: Appears when Symbi is Stressed or Anxious
- **Breathing Exercise**: Guided breathing activity (5 minutes default)
- **Immediate State Change**: Updates emotional state to Calm upon completion
- **Health Data Writing**: Writes mindful minutes to HealthKit/Google Fit
- **Modal Interface**: Full-screen modal for breathing exercise

#### 3. State Change Notifications
- **Animated Alerts**: Smooth fade-in/fade-out notifications
- **State Transitions**: Shows "Old State → New State" format
- **Auto-Dismiss**: Automatically fades out after 2 seconds
- **Visual Feedback**: Purple background with white text
- **Positioning**: Absolutely positioned at top of screen (80px from top) with high z-index for visibility
- **Overlay**: Floats above other content without disrupting layout

## State Management

### Zustand Stores

#### healthDataStore
```typescript
{
  emotionalState: EmotionalState,
  healthMetrics: {
    steps: number,
    sleepHours?: number,
    hrv?: number
  },
  lastUpdated: Date | null,
  isLoading: boolean,
  error: string | null
}
```

#### symbiStateStore
```typescript
{
  evolutionLevel: number,
  customAppearance: string | null,
  totalDaysActive: number
}
```

#### userPreferencesStore
```typescript
{
  profile: {
    preferences: {
      dataSource: 'healthkit' | 'googlefit' | 'manual'
    },
    thresholds: {
      sadThreshold: number,
      activeThreshold: number
    }
  }
}
```

### Local State

```typescript
const [refreshing, setRefreshing] = useState(false);
const [isInitializing, setIsInitializing] = useState(true);
const [stateChangeNotification, setStateChangeNotification] = useState<string | null>(null);
const [isOffline, setIsOffline] = useState(false);
const [showBreathingExercise, setShowBreathingExercise] = useState(false);
const [evolutionEligibility, setEvolutionEligibility] = useState<EvolutionEligibility | null>(null);
const [showEvolutionNotification, setShowEvolutionNotification] = useState(false);
const [isEvolutionInProgress, setIsEvolutionInProgress] = useState(false);
const [showEvolutionCelebration, setShowEvolutionCelebration] = useState(false);
const [evolutionResult, setEvolutionResult] = useState<EvolutionResult | null>(null);
```

## Service Integration

### HealthDataUpdateService
- **Initialization**: `HealthDataUpdateService.initialize()`
- **Daily Updates**: `HealthDataUpdateService.updateDailyHealthData()`
- **Manual Refresh**: `HealthDataUpdateService.refreshHealthData()`
- **Cached Data**: `HealthDataUpdateService.getTodayHealthData()`

### BackgroundSyncService
- **Start Sync**: `backgroundSync.startBackgroundSync([HealthDataType.STEPS], callback)`
- **Stop Sync**: `backgroundSync.stopBackgroundSync()`
- **Automatic Updates**: Triggers callback when new health data is available

### InteractiveSessionManager
- **Start Session**: `sessionManager.startSession(SessionType.BREATHING_EXERCISE, duration)`
- **Session Result**: Returns `SessionResult` with success status and new emotional state

### EvolutionSystem
- **Track State**: `EvolutionSystem.trackDailyState(emotionalState)`
- **Check Eligibility**: `EvolutionSystem.checkEvolutionEligibility()`
- **Trigger Evolution**: `EvolutionSystem.triggerEvolution(aiService)`

### AIBrainService
- **Image Generation**: Used for generating evolved Symbi appearances
- **API Key**: Retrieved from environment or secure storage

## Error Handling

### Error Types and Messages

| Error Type | User Message | Fallback Behavior |
|------------|--------------|-------------------|
| Permission Denied | "Health data permissions not granted. Please enable in Settings." | Show manual entry option |
| No Data Available | "No health data available yet. Try walking a bit!" | Show neutral state |
| Network Error | "Network error. Using cached data if available." | Use cached data |
| Generic Error | "Unable to load health data. Please try again." | Show error banner |

### Error Display
- **Error Container**: Red banner at top of screen
- **Warning Icon**: ⚠️ emoji prefix
- **Dismissible**: Error clears on successful refresh
- **Non-Blocking**: App remains functional with cached data

## Network Handling

### Offline Detection
- **NetInfo Integration**: Monitors network connectivity
- **Offline Indicator**: Shows "📡 Offline" badge in header
- **Auto-Refresh**: Automatically refreshes data when connection restored
- **Cached Data**: Uses cached data when offline

### Background Sync
- **Automatic Updates**: Receives health data updates in background
- **Callback System**: Updates UI when new data arrives
- **Battery Efficient**: Uses platform-native background fetch mechanisms

## User Interactions

### Tap Interactions
1. **Settings Button**: Navigate to SettingsScreen
2. **Configure Thresholds**: Navigate to ThresholdConfigScreen
3. **Manual Entry Button**: Navigate to ManualEntryScreen
4. **Test Buttons**: Instantly change emotional state (development)
5. **Calm Button**: Start breathing exercise
6. **Evolution Button**: Trigger evolution event
7. **Symbi Ghost**: Log poke event (future: haptic feedback)

### Gestures
1. **Pull-to-Refresh**: Manually refresh health data
2. **Scroll**: Scroll through content (ScrollView)

## Animations

### State Change Notification
```typescript
Animated.sequence([
  Animated.timing(notificationOpacity, {
    toValue: 1,
    duration: 300,
    useNativeDriver: true,
  }),
  Animated.delay(2000),
  Animated.timing(notificationOpacity, {
    toValue: 0,
    duration: 300,
    useNativeDriver: true,
  }),
])
```

**Positioning**: The notification container uses absolute positioning to overlay content:
- `position: 'absolute'` - Floats above other elements
- `top: 80` - Positioned 80px from top (below header)
- `left: 20, right: 20` - 20px margins on both sides
- `zIndex: 1000` - Ensures visibility above all other content
- Shadow and elevation for depth perception

### Symbi Ghost
- **State Transitions**: Smooth transitions between emotional states
- **Idle Animations**: Continuous subtle animations (floating, blinking)
- **Interactive Feedback**: Visual response to poke/tap

## Performance Considerations

### Optimization Strategies
1. **Memoization**: Uses `useRef` for animation values
2. **Conditional Rendering**: Only renders visible components
3. **Lazy Loading**: Modals only render when visible
4. **Background Throttling**: Reduces updates when app is backgrounded
5. **Efficient Re-renders**: Zustand selectors minimize unnecessary re-renders

### Responsive Layout
- **Max Width Constraint**: Content container limited to 600px for optimal readability on tablets and large screens
- **Centered Layout**: Content automatically centers on wide displays using `alignSelf: 'center'`
- **Adaptive Sizing**: Maintains full width on mobile devices while preventing excessive stretching on tablets
- **Consistent Experience**: Ensures comfortable viewing across all device sizes

### Memory Management
- **Cleanup Functions**: Properly cleans up listeners on unmount
- **Animation Cleanup**: Stops animations when component unmounts
- **Service Cleanup**: Stops background sync on unmount

## Accessibility

### Labels
- All interactive elements have `accessibilityLabel` props
- Clear, descriptive labels for screen readers

### Visual Feedback
- High contrast colors for readability
- Large touch targets (minimum 44x44 points)
- Clear visual states for buttons

## Testing

### Test Buttons (Development)
Three test buttons for quick state changes:
1. **Sad Button**: Sets steps to 500, state to Sad
2. **Resting Button**: Sets steps to 5000, state to Resting
3. **Active Button**: Sets steps to 10000, state to Active

### Manual Testing Checklist
- [ ] Fresh install → onboarding → main screen
- [ ] Permission grant → automatic data fetch
- [ ] Permission deny → manual entry mode
- [ ] Pull-to-refresh → data updates
- [ ] Background sync → automatic updates
- [ ] Offline mode → cached data display
- [ ] State changes → notification animations
- [ ] Evolution progress → eligibility tracking
- [ ] Evolution trigger → image generation
- [ ] Breathing exercise → state change to Calm
- [ ] Threshold configuration → navigation
- [ ] Settings → navigation

## Requirements Fulfilled

### Phase 1 Requirements
- ✅ **Requirement 1.5**: Background fetch updates within 5 minutes
- ✅ **Requirement 4.1**: Sad state display below threshold
- ✅ **Requirement 4.2**: Resting state display between thresholds
- ✅ **Requirement 4.3**: Active state display above threshold
- ✅ **Requirement 4.4**: Purple ghost with Halloween elements
- ✅ **Requirement 4.5**: Smooth state transitions (1-3 seconds)

### Phase 2 Requirements
- ✅ **Requirement 5.4**: Display AI-determined emotional state
- ✅ **Requirement 5.5**: Multi-metric display (sleep, HRV)

### Phase 3 Requirements
- ✅ **Requirement 7.1**: "Calm your Symbi" button for Stressed/Anxious
- ✅ **Requirement 7.2**: Launch breathing exercise
- ✅ **Requirement 7.4**: Update state to Calm after session
- ✅ **Requirement 8.1**: Track cumulative days in positive states
- ✅ **Requirement 8.2**: Trigger evolution event
- ✅ **Requirement 8.3**: Display evolved appearance
- ✅ **Requirement 8.4**: Persist evolved appearance

### Cross-Cutting Requirements
- ✅ **Requirement 10.3**: Reduced frame rate when backgrounded
- ✅ **Requirement 14.1**: Cached data for offline support
- ✅ **Requirement 14.2**: Error handling with troubleshooting

## Future Enhancements

### Planned Features
- [ ] Haptic feedback on Symbi poke
- [ ] Multiple breathing exercise durations
- [ ] Evolution gallery access from main screen
- [ ] Streak tracking display
- [ ] Achievement badges
- [ ] Social sharing for evolution milestones

### Performance Improvements
- [ ] Image caching for evolved appearances
- [ ] Progressive loading for large animations
- [ ] Optimized re-render logic
- [ ] Background task optimization

## Related Documentation

- [Task 7 Implementation Summary](./task-7-implementation-summary.md) - Phase 1 implementation
- [Task 9 Implementation Summary](./task-9-implementation-summary.md) - Phase 3 interactive features
- [MainScreen UI Refactor](./mainscreen-ui-refactor.md) - Recent UI improvements
- [MainScreen Refactoring Recommendations](./mainscreen-refactoring-recommendations.md) - Future improvements
- [Screens README](../src/screens/README.md) - Screen component documentation

## Code Quality

### Current Status
- **Lines of Code**: ~1187 lines
- **TypeScript Errors**: 0
- **ESLint Warnings**: 1 (unused import - resolved)
- **Test Coverage**: Component tests in `__tests__/MainScreen.test.tsx`

### Recent Improvements
- Added responsive layout with max-width constraint (November 16, 2025)
- Removed unused `Image` import (November 16, 2025)
- Simplified header layout
- Added comprehensive error handling
- Improved offline support

## Conclusion

MainScreen is the heart of the Symbi application, successfully integrating all three development phases into a cohesive, user-friendly interface. The component demonstrates strong separation of concerns, robust error handling, and excellent user experience through smooth animations and clear visual feedback.

The implementation fulfills all requirements for Phases 1-3 and provides a solid foundation for future enhancements.
