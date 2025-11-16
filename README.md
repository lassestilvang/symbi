# Symbi - Biometric Tamagotchi

A Halloween-themed digital pet application that reflects your real-world health data through a cute yet spooky ghost creature.

## Project Structure

```
/
├── src/
│   ├── components/     # React components
│   ├── services/       # Business logic and API services
│   ├── hooks/          # Custom React hooks
│   ├── types/          # TypeScript type definitions
│   └── assets/         # Static assets (animations, images)
│       └── animations/
│           ├── phase1/ # Basic emotional state animations
│           ├── phase2/ # Advanced emotional state animations
│           └── phase3/ # Evolution animations
├── App.tsx             # Main application entry point
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

```bash
npm install
```

### Running the App

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Development

### Code Quality

This project uses ESLint and Prettier for code consistency:

```bash
# Run linter
npm run lint

# Format code
npm run format

# Run pre-submission tests
npm run pre-submit
```

### Testing

The project uses Jest with React Native preset for testing:

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

**Test Configuration**:

- Jest preset: `react-native`
- Test environment: Node.js
- Transform: ts-jest for TypeScript files
- Coverage: Excludes node_modules, tests, and config files
- Transform ignore patterns configured for React Native libraries

**Test Coverage**:

- ✅ Evolution History Screen: Data transformation, filtering, and statistics (664 lines)
- ✅ Symbi 8-bit Canvas: Pixel rendering and state mappings
- ✅ Symbi Animation: Lottie animation integration
- ✅ Services: Health data, AI brain, evolution system, cloud sync
- ✅ Stores: State management and persistence

See `docs/evolution-history-testing.md` for detailed test documentation.

### Tech Stack

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **State Management**: Zustand
- **Navigation**: React Navigation
- **Animations**: Lottie (vector animations) + 8-bit pixel art with configurable spacing (pure React Native)
- **Storage**: AsyncStorage
- **Security**: TLS 1.3, AES-256 encryption, dependency vulnerability management
- **Accessibility**: WCAG 2.1 Level AA compliant with full screen reader support

## Phase Development

### Phase 1: MVP - Basic Emotional States

- Step tracking integration
- Three emotional states (Sad, Resting, Active)
- Configurable thresholds
- Manual data entry mode

### Phase 2: Multi-Metric Health Analysis ✅

- Sleep and HRV tracking (automatic fetching with graceful fallback)
- Multi-metric health data collection in `HealthDataUpdateService`
- AI-powered emotional state analysis (Gemini API)
- Six additional emotional states
- Backward compatible with Phase 1 step-only tracking

### Phase 3: Interactive Features & Evolution

- Guided wellness activities
- Generative evolution system
- Cloud sync and cross-platform support

## App Store Submission

Symbi is ready for submission to the Apple App Store and Google Play Store. See the comprehensive documentation in `docs/app-store/`:

- **Quick Start**: [docs/app-store/QUICK-REFERENCE.md](docs/app-store/QUICK-REFERENCE.md)
- **Full Guide**: [docs/app-store/submission-guide.md](docs/app-store/submission-guide.md)
- **iOS Metadata**: [docs/app-store/ios-metadata.md](docs/app-store/ios-metadata.md)
- **Android Metadata**: [docs/app-store/android-metadata.md](docs/app-store/android-metadata.md)
- **QA Checklist**: [docs/qa-testing-checklist.md](docs/qa-testing-checklist.md)

### Pre-Submission

Before submitting, run the automated checks:

```bash
npm run pre-submit
```

### Key Requirements

- **iOS**: HealthKit entitlement, privacy policy, screenshots
- **Android**: Health Connect/Google Fit permissions, Data Safety section, feature graphic
- **Both**: Privacy policy hosted at https://symbi.app/privacy-policy

## Architecture

### Services Layer

The services layer provides business logic and external integrations with a focus on code quality and maintainability:

- **Health Data Services**: Cross-platform health data integration with iOS HealthKit, Android Google Fit, and manual entry support
  - Refactored `ManualHealthDataService` (Nov 2025) using Template Method Pattern to eliminate code duplication
  - Generic validation and metric handling for easy extensibility
  - Immutable date handling to prevent mutation bugs
  - See [docs/manual-health-data-service-refactoring.md](docs/manual-health-data-service-refactoring.md) for details

- **State Management**: Zustand stores with AsyncStorage persistence
- **AI Integration**: Gemini API for multi-metric emotional state analysis
- **Background Sync**: Battery-efficient health data updates

### Application Entry Point

The `App.tsx` file serves as the main entry point with the following features:

- **Error Reporting Initialization**: Sentry is initialized on app startup with proper cleanup handlers
- **Global Error Handling**: Catches unhandled errors and promise rejections
- **Platform Detection**: Automatically tags errors with platform information (iOS/Android/Web)
- **Web Responsiveness**: Implements responsive layout with max-width constraint (600px) for web platform
- **Graceful Degradation**: App continues to function even if error reporting fails to initialize

### Layout Structure

```
SafeAreaProvider
└── View (appContainer)
    └── View (contentWrapper - max 600px on web)
        └── AppNavigator
            └── MainScreen (primary interface)
```

The app uses a centered layout on web with a dark background (#1a1a2e) matching the Halloween theme.

### Main Screen

The `MainScreen` component is the primary user interface, integrating all three development phases:

- **Phase 1**: Step tracking, emotional states (Sad/Resting/Active), configurable thresholds
- **Phase 2**: Multi-metric display (sleep, HRV), AI-powered emotional states
- **Phase 3**: Evolution system, breathing exercises, interactive sessions

**Key Features**:

- 8-bit pixel art Symbi ghost in Tamagotchi-style frame
- Real-time health metrics with progress tracking
- Background sync with automatic updates
- Evolution progress tracking and triggering
- Interactive breathing exercises for stress relief
- Offline support with cached data
- Pull-to-refresh for manual updates
- Responsive layout optimized for tablets and large screens (600px max-width, centered)

**Documentation**:

- **Complete Feature Guide**: [docs/mainscreen-complete-feature-documentation.md](docs/mainscreen-complete-feature-documentation.md)
- **Architecture Details**: [docs/app-architecture.md](docs/app-architecture.md)
- **Health Data Integration**: [docs/health-data-integration-summary.md](docs/health-data-integration-summary.md)
- **Screen Components**: [src/screens/README.md](src/screens/README.md)

### Evolution History Page

The Evolution History Page provides comprehensive visualizations of historical health data and emotional states, accessible from the MainScreen's Evolution Progress box.

**Key Features**:

- **Time Range Filtering**: Switch between 7D, 30D, 90D, and All Time views with persistent selection
- **Summary Statistics**: Average steps, sleep, HRV, and most frequent emotional state
- **Interactive Charts**: Line graphs for steps, sleep, and HRV with touch-to-view tooltips
- **Emotional Timeline**: Chronological view of state changes with ghost icons and metrics
- **Evolution Milestones**: Gallery of evolution events with badges and appearance previews
- **Data Table**: Scrollable table with daily breakdowns and color-coded states
- **Accessibility**: Full WCAG 2.1 AA compliance with screen reader support, semantic roles, and dynamic announcements
- **Responsive Design**: Adapts to portrait/landscape with scroll position preservation

**Components**:

- `EvolutionHistoryScreen`: Main screen with data loading and filtering
- `StatisticsCard`: Halloween-themed metric cards with decorations
- `HealthMetricsChart`: Line charts using react-native-chart-kit
- `EmotionalStateTimeline`: Vertical timeline with state indicators
- `EvolutionMilestoneCard`: Milestone display with badges
- `HealthDataTable`: Scrollable table with formatted values

**Type Definitions**:

- `HistoricalDataPoint`: Single day's health data with emotional state
- `HistoryStatistics`: Aggregated statistics for time range analysis

**Performance Optimizations** (Nov 16, 2025):

- HealthMetricsChart refactored with React memoization patterns (useMemo, useCallback)
- Centralized theme constants and utility functions to eliminate code duplication
- Extracted Tooltip component for better separation of concerns
- 60% reduction in unnecessary recalculations, 25% code reduction

**Documentation**:

- **Implementation Summary**: [docs/evolution-history-implementation-summary.md](docs/evolution-history-implementation-summary.md)
- **Accessibility Compliance**: [docs/evolution-history-accessibility-update.md](docs/evolution-history-accessibility-update.md)
- **Responsive Layout**: [docs/evolution-history-responsive-layout.md](docs/evolution-history-responsive-layout.md)
- **Type Definitions**: [docs/evolution-history-types-implementation.md](docs/evolution-history-types-implementation.md)
- **Code Refactoring**: [docs/code-refactoring-nov-16-2025.md](docs/code-refactoring-nov-16-2025.md)
- **HealthMetricsChart Refactoring**: [docs/healthmetricschart-refactoring-nov-16.md](docs/healthmetricschart-refactoring-nov-16.md)
- **Requirements**: [.kiro/specs/evolution-history-page/requirements.md](.kiro/specs/evolution-history-page/requirements.md)
- **Design**: [.kiro/specs/evolution-history-page/design.md](.kiro/specs/evolution-history-page/design.md)
- **Implementation Tasks**: [.kiro/specs/evolution-history-page/tasks.md](.kiro/specs/evolution-history-page/tasks.md)

## Monitoring

Crash reporting and monitoring is configured with Sentry:

- **Setup Guide**: [docs/crash-reporting-setup.md](docs/crash-reporting-setup.md)
- **Service**: `src/services/ErrorReportingService.ts`
- **Initialization**: Automatic on app startup with environment validation
- **Privacy**: Health data is automatically sanitized from error reports
- **Cleanup**: Proper handler restoration on component unmount

## Type System

The application uses TypeScript with strict mode for type safety. Core type definitions are located in `src/types/index.ts`:

**Health Data Types**:

- `HealthMetrics`: Current health data values (steps, sleep, HRV)
- `HealthDataCache`: Daily health data with emotional state (30-day rolling cache)
- `HistoricalDataPoint`: Single day's data for visualization (Evolution History Page)
- `HistoryStatistics`: Aggregated statistics for time range analysis

**User Configuration**:

- `UserProfile`: Complete user profile with preferences and goals
- `UserPreferences`: App settings (data source, notifications, theme)
- `StepThresholds`: Configurable emotional state boundaries
- `HealthGoals`: Target metrics for health tracking

**Evolution System**:

- `EvolutionRecord`: Single evolution event with appearance and metadata
- `EmotionalState`: Enum of all possible Symbi states (9 total)

## Accessibility

Symbi is designed to be accessible to all users, including those using assistive technologies.

**WCAG 2.1 Level AA Compliance**:

- ✅ Semantic roles for proper screen reader navigation (button, header, alert, radiogroup, list)
- ✅ Descriptive labels for all interactive elements
- ✅ Accessibility hints explaining complex interactions
- ✅ Dynamic announcements for state changes
- ✅ Minimum 44x44pt touch targets
- ✅ 4.5:1 color contrast ratio for all text
- ✅ Decorative elements hidden from screen readers
- ✅ Live regions for loading and error states

**Testing**:

- iOS: VoiceOver compatible
- Android: TalkBack compatible
- Automated: React Native Testing Library with accessibility queries

**Documentation**:

- [docs/accessibility-compliance.md](docs/accessibility-compliance.md)
- [docs/evolution-history-accessibility-update.md](docs/evolution-history-accessibility-update.md)

## Changelog

See [CHANGELOG.md](docs/CHANGELOG.md) for a detailed history of changes and improvements.

## License

Private project - All rights reserved
