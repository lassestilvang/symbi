# Changelog

All notable changes to the Symbi project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
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

