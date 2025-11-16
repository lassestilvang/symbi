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

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Tech Stack

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **State Management**: Zustand
- **Navigation**: React Navigation
- **Animations**: Lottie
- **Storage**: AsyncStorage
- **Security**: TLS 1.3, AES-256 encryption, dependency vulnerability management

## Phase Development

### Phase 1: MVP - Basic Emotional States

- Step tracking integration
- Three emotional states (Sad, Resting, Active)
- Configurable thresholds
- Manual data entry mode

### Phase 2: Multi-Metric Health Analysis

- Sleep and HRV tracking
- AI-powered emotional state analysis (Gemini API)
- Six additional emotional states

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

## Monitoring

Crash reporting and monitoring is configured with Sentry:

- **Setup Guide**: [docs/crash-reporting-setup.md](docs/crash-reporting-setup.md)
- **Service**: `src/services/ErrorReportingService.ts`
- **Privacy**: Health data is automatically sanitized from error reports

## License

Private project - All rights reserved
