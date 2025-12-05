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
  onComplete={dataSource => {
    // Handle onboarding completion
    console.log('Selected data source:', dataSource);
  }}
  onRequestPermissions={async () => {
    // Request platform-specific permissions
    const result = await PermissionService.requestHealthPermissions();
    return result.granted;
  }}
/>;
```

## Main Screens

### MainScreen

The primary app screen displaying the Symbi creature and health metrics.

### EvolutionHistoryScreen

A comprehensive data visualization screen showing the user's health journey over time.

**Features:**

- Time range filtering (7 days, 30 days, 90 days, all time)
- Summary statistics cards with Halloween decorations
- Interactive line charts for steps, sleep, and HRV trends
- Emotional state timeline with color-coded indicators
- Evolution milestone gallery with badges
- Scrollable data table with daily health metrics
- Responsive layout for portrait and landscape orientations
- Scroll position preservation during orientation changes
- Loading, error, and empty states with Halloween theming
- WCAG 2.1 AA accessibility compliance
- AsyncStorage persistence for time range preference

**Components Used:**

- `StatisticsCard` - Displays average metrics
- `HealthMetricsChart` - Line charts for metric trends
- `EmotionalStateTimeline` - Timeline of emotional states
- `EvolutionMilestoneCard` - Evolution achievement cards
- `HealthDataTable` - Detailed data table

**Data Flow:**

```
StorageService.getHealthDataCache()
   ↓
Transform to HistoricalDataPoint[]
   ↓
Filter by Time Range
   ↓
Calculate Statistics
   ↓
Render Visualizations
```

**Navigation:**

- Accessible from Settings screen
- Back button returns to main screen
- Deep linking support (future)

**Performance:**

- Memoized data transformations
- Debounced time range changes (300ms)
- Efficient scroll handling
- Responsive layout calculations cached

**Accessibility:**

- Semantic roles (button, header, alert, radiogroup, list)
- Descriptive accessibility labels
- Screen reader announcements for state changes
- 44x44pt minimum touch targets
- High contrast colors

See [Evolution History Implementation Summary](../../docs/evolution-history-implementation-summary.md) for detailed documentation.

### EvolutionGalleryScreen

Displays a gallery of all evolution milestones achieved by the user.

**Features:**

- 2-column grid layout with responsive sizing
- Evolution cards with images and metadata
- ScrollView-based rendering for optimal layout control
- 400px max-width for readability
- Halloween-themed styling
- Empty state for new users

**Layout:**

- Portrait: 2 columns
- Landscape: 2 columns (maintained for consistency)
- Card gap: 12px
- Horizontal padding: 16px

See [Evolution Gallery Responsive Layout](../../docs/evolution-gallery-responsive-layout.md) for details.

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
    navigate: screen => {
      // Handle navigation to other screens
      // Supported: 'Settings', 'Thresholds', 'ManualEntry'
    },
  }}
/>;
```

### ManualEntryScreen

Allows users to manually enter their daily health metrics when not using automatic health data tracking. Supports Phase 2 multi-metric entry.

**Features:**

- Multi-metric input: steps (required), sleep hours (optional), HRV (optional)
- Input validation with user-friendly error messages:
  - Steps: 0-100,000 (required)
  - Sleep: 0-24 hours (optional)
  - HRV: 0-200 ms (optional)
- Automatic emotional state calculation using user's configured thresholds
- Saves to ManualHealthDataService with per-metric persistence
- Updates health data store with calculation method tracking
- Keyboard-avoiding layout for comfortable input
- Disabled state during submission to prevent double-saves
- Helpful tip box guiding users to find their metrics
- Halloween-themed styling consistent with app design

**UI Layout:**

- Title and subtitle header
- Three input groups with emoji labels:
  - 👟 Step Count (Required)
  - 😴 Sleep Duration (Optional)
  - ❤️ Heart Rate Variability (Optional)
- Each input shows valid range hint
- Submit button (disabled until steps entered)
- Tip box with guidance on finding health data

**Data Flow:**

```
User Input
   ↓
Validation (per-metric ranges)
   ↓
ManualHealthDataService.save*() for each metric
   ↓
EmotionalStateCalculator.calculateStateFromSteps()
   ↓
healthDataStore.updateHealthData()
   ↓
Navigation.goBack()
```

**Usage:**

```tsx
import { ManualEntryScreen } from './screens';

<ManualEntryScreen
  onComplete={() => {
    // Optional callback after successful save
  }}
/>;
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
/>;
```

### EvolutionHistoryScreen

A comprehensive history page displaying health data, emotional states, and evolution milestones through engaging Halloween-themed visualizations.

**Features:**

- Time range filtering (7 days, 30 days, 90 days, all time)
- Summary statistics cards (average steps, sleep, HRV, most frequent state)
- Line charts for health metrics (steps, sleep, HRV)
- Emotional state timeline with ghost icons
- Evolution milestone cards with appearance previews
- Scrollable data table with daily metrics
- Responsive layout for portrait and landscape orientations
- Loading states with Halloween-themed animations
- Error handling with retry functionality
- Empty state messaging
- Full accessibility support (WCAG 2.1 AA compliant)
- Performance optimizations (memoization, lazy loading, pagination)

**UI Layout:**

- Header with back button and title
- Time range filter buttons (7D, 30D, 90D, All)
- Statistics cards grid (4 cards: steps, sleep, HRV, state)
- Health metrics charts section (3 charts with tabs or stacked)
- Emotional state timeline (vertical scrollable list)
- Evolution milestones section (cards for each evolution)
- Data table (scrollable with fixed header)

**State Management:**

- Local state for time range selection, data loading, and error handling
- Persists selected time range to AsyncStorage
- Loads data from StorageService (health data cache and evolution records)

**Data Sources:**

- `StorageService.getHealthDataCache()` - Historical health data (up to 30 days)
- `StorageService.getEvolutionRecords()` - Evolution milestone records
- AsyncStorage for time range preference

**Key Functions:**

- `loadHistoricalData()` - Fetches health data from storage
- `filterDataByTimeRange()` - Filters data based on selected time range
- `calculateStatistics()` - Computes averages and dominant states
- `handleTimeRangeChange()` - Updates time range filter and persists preference
- `handleDataPointPress()` - Shows detailed tooltip for chart data points
- `handleTimelineItemPress()` - Shows expanded state information

**Components Used:**

- `StatisticsCard` - Displays summary statistics
- `HealthMetricsChart` - Line charts for metrics
- `EmotionalStateTimeline` - Timeline of emotional states
- `EvolutionMilestoneCard` - Evolution milestone displays
- `HealthDataTable` - Tabular data view

**Usage:**

```tsx
import { EvolutionHistoryScreen } from './screens';

<EvolutionHistoryScreen
  navigation={{
    navigate: screen => {
      // Handle navigation
    },
    goBack: () => {
      // Navigate back to MainScreen
    },
  }}
/>;
```

**Navigation:**

Accessible from MainScreen via the Evolution Progress box "View History" link. Users can navigate back using the header back button or platform-specific gestures.

**Performance:**

- Initial load: <2 seconds on mid-range devices
- Time range switch: <500ms
- Chart animations: 60 FPS
- Pagination for "All Time" view (limits to 90 days initially)
- Memoized components and calculations
- Lazy loading for evolution images

**Accessibility:**

- Descriptive labels for all interactive elements
- Screen reader announcements for time range changes
- Text alternatives for decorative icons
- 44x44pt minimum touch targets
- 4.5:1 color contrast ratio
- Semantic roles (button, header, alert, radiogroup, list)
- Accessibility hints for complex interactions
- Live regions for dynamic content updates

**Requirements Fulfilled:**

- **Requirement 1**: Navigation from MainScreen Evolution Progress box
- **Requirement 2**: Emotional state timeline visualization
- **Requirement 3**: Health metrics graphs with Halloween theming
- **Requirement 4**: Time range filtering with persistence
- **Requirement 5**: Evolution milestone highlighting
- **Requirement 6**: Tabular data view with formatting
- **Requirement 7**: Summary statistics calculation
- **Requirement 8**: Fast loading with error handling
- **Requirement 9**: Responsive layout for both orientations
- **Requirement 10**: Easy navigation back to MainScreen

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

### EvolutionGalleryScreen

Displays all past evolution forms of the Symbi in a visual gallery format.

**Features:**

- 2-column grid layout of evolution cards
- Evolution level badges on each card
- Date and days active display
- Full-screen image modal on card tap
- Share evolution milestones
- Empty state for users without evolutions
- Loading states with activity indicator
- Responsive layout with max-width constraint (400px)
- ScrollView-based layout for better centering control

**UI Layout:**

- Header with back button and title (centered, max 400px)
- ScrollView with centered content wrapper
- 2-column grid of evolution cards (responsive width)
- Each card shows: evolution image, level badge, date, days active
- Modal overlay for full-size image viewing
- Share button in modal

**Layout Structure:**

```
Container
└── Header Container (centers header)
    └── Header (max 400px)
└── ScrollView
    └── Scroll Content (centers wrapper)
        └── Content Wrapper (max 400px)
            └── Grid Container
                └── Rows (2 cards per row)
                    └── Evolution Cards
```

**State Management:**

- Local state for evolution records, selected record, modal visibility
- Loads data from `EvolutionSystem.getEvolutionHistory()`

**Key Functions:**

- `loadEvolutionHistory()` - Fetches evolution records from storage
- `handleCardPress()` - Opens full-screen modal for selected evolution
- `handleShare()` - Shares evolution milestone via platform share sheet
- `formatDate()` - Formats timestamp for display
- `renderEvolutionCard()` - Renders individual evolution card

**Usage:**

```tsx
import { EvolutionGalleryScreen } from './screens';

<EvolutionGalleryScreen
  navigation={{
    goBack: () => {
      // Navigate back to previous screen
    },
  }}
/>;
```

**Responsive Design:**

- Max container width: 400px (optimized for readability)
- Centered layout on larger screens using ScrollView wrapper pattern
- Card width: flex: 1 with maxWidth: 180px
- Maintains consistent spacing across device sizes
- Manual row-by-row rendering for precise layout control

**Performance:**

- ScrollView appropriate for small datasets (typically < 20 evolutions)
- No virtualization overhead needed
- Simpler layout logic than FlatList columnWrapper approach

## Future Enhancements

- Add animations for screen transitions
- Implement data export functionality
- Add data deletion with confirmation
- Create privacy policy page
- Add theme switching (light/dark/auto)
- ~~Implement Phase 2 multi-metric manual entry~~ ✅ Completed
