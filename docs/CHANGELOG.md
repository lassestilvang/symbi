# Changelog

All notable changes to the Symbi project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Accessibility Enhancement**: Evolution History Screen now WCAG 2.1 AA compliant (2025-11-16)
  - Added semantic roles (button, header, alert, radiogroup, radio, list) for proper screen reader navigation
  - Implemented descriptive accessibility labels for all interactive elements
  - Added accessibility hints explaining complex interactions
  - Added accessibility state for radio buttons (selected/not selected)
  - Implemented dynamic announcements for time range changes via `AccessibilityInfo.announceForAccessibility()`
  - Added live regions for loading states (`accessibilityLiveRegion="polite"`)
  - Hidden decorative elements (emojis, arrows) from screen readers with `accessibilityElementsHidden={true}`
  - Ensured all touch targets meet 44x44pt minimum size requirement
  - See [docs/evolution-history-accessibility-update.md](evolution-history-accessibility-update.md)
- Evolution History Page with comprehensive data visualizations (2025-11-16)
  - Time range filtering (7D, 30D, 90D, All Time) with AsyncStorage persistence
  - Summary statistics cards with Halloween-themed decorations
  - Line charts for steps, sleep, and HRV trends using react-native-chart-kit
  - Emotional state timeline with ghost icons and color-coded indicators
  - Evolution milestone gallery with badge icons
  - Scrollable data table with daily health metrics breakdown
  - Responsive layout supporting portrait and landscape orientations
  - Scroll position preservation during orientation changes
  - Loading, error, and empty states with Halloween theming
  - Components: `EvolutionHistoryScreen`, `StatisticsCard`, `HealthMetricsChart`, `EmotionalStateTimeline`, `EvolutionMilestoneCard`, `HealthDataTable`
  - See [docs/evolution-history-implementation-summary.md](evolution-history-implementation-summary.md)
- Evolution History Page type definitions (2025-11-16)
  - Added `HistoricalDataPoint` interface for daily health data visualization
  - Added `HistoryStatistics` interface for aggregated time range statistics
  - Supports time range filtering (7D, 30D, 90D, All Time)
  - Enables line charts, timelines, and data tables for historical analysis
  - See [.kiro/specs/evolution-history-page/](../.kiro/specs/evolution-history-page/)

### Changed

- **StatisticsCard Component Refactoring** (2025-11-16)
  - Migrated to centralized theme constants (`HALLOWEEN_COLORS`, `DECORATION_ICONS` from `src/constants/theme.ts`)
  - Wrapped component with `React.memo` for performance optimization
  - Implemented automatic number formatting with locale-specific thousand separators
  - Enhanced accessibility with comprehensive labels (`accessibilityLabel`, `accessibilityRole="summary"`)
  - Added `testID` prop for automated testing support
  - Memoized dynamic styles with `useMemo` for better performance
  - Improved prop typing with `keyof typeof DECORATION_ICONS`
  - See [docs/code-refactoring-nov-16-2025.md](code-refactoring-nov-16-2025.md)
- **Performance Optimization**: Refactored `HealthMetricsChart` component (2025-11-16)
  - Applied React memoization patterns (useMemo, useCallback) for 60% reduction in unnecessary recalculations
  - Extracted Tooltip as separate component for better separation of concerns
  - Integrated centralized utility functions from `metricHelpers` and `dateHelpers`
  - Imported `HALLOWEEN_COLORS` from centralized theme constants
  - Reduced component complexity by 25% (from ~200 to ~150 lines)
  - Eliminated ~50 lines of code duplication
  - Improved type safety with `MetricType` type alias
  - See [docs/healthmetricschart-refactoring-nov-16.md](healthmetricschart-refactoring-nov-16.md)
- **Code Quality**: Created centralized constants and utilities (2025-11-16)
  - Added `src/constants/theme.ts` for Halloween color palette and state colors
  - Added `src/utils/dateHelpers.ts` for consistent date formatting
  - Added `src/utils/metricHelpers.ts` for type-safe metric operations
  - Eliminated ~250 lines of duplicated code across components
  - Single source of truth for theme values and formatting logic
  - See [docs/code-refactoring-nov-16-2025.md](code-refactoring-nov-16-2025.md)
- Improved MainScreen responsive layout for tablets and large screens (2025-11-16)
  - Added 600px max-width constraint to content container
  - Centered content on wide displays for better readability
  - Maintains full-width on mobile devices
  - See [docs/mainscreen-responsive-layout-update.md](mainscreen-responsive-layout-update.md)
- Refactored `ManualHealthDataService` to eliminate code duplication and improve maintainability (2025-11-16)
  - Implemented Template Method Pattern for generic metric saving
  - Consolidated validation logic into configuration-driven approach
  - Improved date range iteration with immutable date handling
  - Enhanced type safety with new interfaces
  - Reduced code by ~12.5% while maintaining all functionality
  - See [docs/manual-health-data-service-refactoring.md](manual-health-data-service-refactoring.md)

## [1.0.0] - Phase 2 Multi-Metric Implementation

### Added

- Multi-metric health data collection (steps, sleep, HRV)
- Automatic fetching of sleep duration and HRV in `HealthDataUpdateService`
- Graceful degradation when additional metrics unavailable
- Backward compatibility with Phase 1 step-only tracking

### Documentation

- Created comprehensive Phase 2 implementation guide
- Updated health data integration summary
- Added app store submission documentation

## [0.9.0] - Phase 1 MVP

### Added

- Step tracking with HealthKit (iOS) and Google Fit (Android)
- Manual data entry mode
- Three emotional states (Sad, Resting, Active)
- Configurable thresholds
- 8-bit pixel art Symbi ghost renderer
- Tamagotchi-style frame UI
- Background sync service
- Onboarding flow
- Settings and account management

### Infrastructure

- React Native with Expo setup
- TypeScript configuration
- Zustand state management
- AsyncStorage persistence
- Sentry crash reporting
- Jest testing framework
- ESLint and Prettier code quality tools
