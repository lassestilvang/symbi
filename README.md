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
```

### Tech Stack

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **State Management**: Zustand
- **Navigation**: React Navigation
- **Animations**: Lottie
- **Storage**: AsyncStorage

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

## License

Private project - All rights reserved
