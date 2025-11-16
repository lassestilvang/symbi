# Technology Stack

## Core Framework

- **React Native 0.81.5** with Expo ~54.0.22
- **TypeScript 5.9.2** with strict mode enabled
- **React 19.2.0**

## Key Libraries

### State Management

- **Zustand 5.0.8** - Lightweight reactive state management
- Stores: `healthDataStore`, `userPreferencesStore`, `symbiStateStore`

### Navigation

- **React Navigation 7.x** - Native stack navigator

### Animations

- **Lottie React Native 7.3.4** - Vector animations for Symbi emotional states

### Storage

- **AsyncStorage 2.2.0** - Local persistence with encryption

### Health Data

- **react-native-health 1.19.0** - iOS HealthKit integration
- **react-native-google-fit 0.22.1** - Android Google Fit integration

### Monitoring

- **Sentry React Native 7.5.0** - Crash reporting and error tracking

### Utilities

- **expo-crypto** - Encryption services
- **expo-file-system** - File operations
- **@react-native-community/netinfo** - Network status

## Code Style

### Prettier Configuration

- Single quotes
- Semicolons required
- 100 character line width
- 2 space indentation
- Trailing commas (ES5)
- Arrow parens: avoid

### ESLint

- TypeScript ESLint with strict rules
- Prettier integration for formatting

## Path Aliases

```typescript
@components/* → src/components/*
@services/* → src/services/*
@hooks/* → src/hooks/*
@types/* → src/types/*
@assets/* → src/assets/*
```

## Common Commands

```bash
# Development
npm start              # Start Expo dev server
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator
npm run web            # Run in web browser

# Code Quality
npm run lint           # Run ESLint
npm run lint:fix       # Fix ESLint issues
npm run format         # Format with Prettier

# Testing
npm test               # Run Jest tests
npm run test:coverage  # Run with coverage report
npm run test:watch     # Watch mode

# Pre-submission
npm run pre-submit     # Run all checks before submission
```

## Build Configuration

### iOS (app.json)

- Bundle ID: `com.symbi.app`
- HealthKit entitlement required
- Background modes: fetch, processing
- Minimum iOS: 14.0

### Android (app.json)

- Package: `com.symbi.app`
- Permissions: ACTIVITY_RECOGNITION, health data access
- Minimum Android: 8.0 (API 26)

## API Integration

### Gemini API (Phase 2+)

- Model: `gemini-2.5-flash-preview-09-2025` for analysis
- Model: `gemini-2.5-flash-image-preview` for evolution images
- TLS 1.3 encryption required
- 10 second timeout with fallback logic
- Rate limit: 1 request per 24 hours per user

## Performance Targets

- Memory usage: <100MB
- Battery consumption: <5% per 24 hours
- Animation frame rate: 60 FPS (10 FPS when backgrounded)
- API response time: <5 seconds (95th percentile)
