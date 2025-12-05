# Project Structure

## Directory Organization

```
src/
├── components/          # Reusable UI components
│   ├── SymbiAnimation.tsx          # Main Symbi creature animation (Lottie)
│   ├── Symbi8BitCanvas.tsx         # 8-bit pixel art ghost renderer
│   ├── Symbi8BitDemo.tsx           # Demo component for 8-bit ghost
│   ├── SymbiAnimationDemo.tsx      # Demo for Lottie animations
│   ├── BreathingExercise.tsx       # Interactive breathing UI
│   ├── EvolutionCelebration.tsx    # Evolution event UI
│   ├── ThresholdConfigScreen.tsx   # Threshold configuration
│   ├── StatisticsCard.tsx          # Metric display with Halloween decorations
│   ├── HealthMetricsChart.tsx      # Interactive line charts with tooltips
│   ├── EmotionalStateTimeline.tsx  # Scrollable timeline with state indicators
│   ├── EvolutionMilestoneCard.tsx  # Evolution achievement cards
│   ├── HealthDataTable.tsx         # Scrollable data table
│   ├── ProgressiveImage.tsx        # Progressive image loading
│   ├── symbi/                      # 8-bit ghost rendering system
│   │   ├── pixelData.ts            # Pixel coordinate definitions
│   │   ├── ghostRenderer.ts        # Rendering logic and state mappings
│   │   ├── README.md               # Module documentation
│   │   └── __tests__/              # Unit tests for rendering system
│   ├── __tests__/                  # Component tests
│   └── index.ts                    # Barrel exports
│
├── screens/             # Full-screen views
│   ├── MainScreen.tsx              # Primary app screen with Symbi
│   ├── SettingsScreen.tsx          # App settings and preferences
│   ├── ManualEntryScreen.tsx       # Manual health data input
│   ├── AccountScreen.tsx           # User account management
│   ├── EvolutionGalleryScreen.tsx  # Evolution gallery viewer
│   ├── EvolutionHistoryScreen.tsx  # Historical data visualizations
│   ├── PrivacyPolicyScreen.tsx     # Privacy policy display
│   ├── onboarding/                 # Onboarding flow screens
│   │   ├── OnboardingFlow.tsx
│   │   ├── WelcomeScreen.tsx
│   │   ├── HealthDataExplanationScreen.tsx
│   │   ├── PermissionRequestScreen.tsx
│   │   ├── ManualEntryExplanationScreen.tsx
│   │   ├── ProgressIndicator.tsx
│   │   └── index.ts
│   ├── __tests__/                  # Screen tests
│   └── index.ts
│
├── services/            # Business logic and external integrations
│   ├── HealthDataService.ts        # Unified health data abstraction
│   ├── HealthKitService.ts         # iOS HealthKit implementation
│   ├── GoogleFitService.ts         # Android Google Fit implementation
│   ├── ManualHealthDataService.ts  # Manual entry implementation
│   ├── HealthDataUpdateService.ts  # Multi-metric data fetching
│   ├── EmotionalStateCalculator.ts # State determination logic
│   ├── AIBrainService.ts           # Gemini API integration
│   ├── DailyAIAnalysisService.ts   # Daily AI analysis scheduling
│   ├── EvolutionSystem.ts          # Evolution tracking and triggers
│   ├── InteractiveSessionManager.ts # Wellness activity management
│   ├── CloudSyncService.ts         # Cloud synchronization (Phase 3)
│   ├── CloudAPIService.ts          # Cloud API client
│   ├── StorageService.ts           # AsyncStorage wrapper
│   ├── SecureStorageService.ts     # Encrypted storage
│   ├── EncryptionService.ts        # Encryption utilities
│   ├── SecureAPIService.ts         # Secure API communication
│   ├── AuthService.ts              # Authentication service
│   ├── PermissionService.ts        # Permission handling
│   ├── ErrorReportingService.ts    # Sentry integration
│   ├── PerformanceMonitor.ts       # Performance tracking
│   ├── MemoryMonitor.ts            # Memory usage monitoring
│   ├── AnalyticsService.ts         # Privacy-preserving analytics
│   ├── BackgroundSyncService.ts    # Background data fetching
│   ├── BackgroundTaskConfig.ts     # Background task configuration
│   ├── DataManagementService.ts    # Data export/import management
│   ├── ImageCacheManager.ts        # Image caching for evolutions
│   ├── RequestDeduplicator.ts      # API request deduplication
│   ├── FirebaseConfig.ts           # Firebase configuration
│   ├── __tests__/                  # Service tests
│   └── index.ts
│
├── stores/              # Zustand state management
│   ├── healthDataStore.ts          # Health metrics and emotional state
│   ├── userPreferencesStore.ts     # User settings and thresholds
│   ├── symbiStateStore.ts          # Symbi creature state
│   ├── README.md                   # Store documentation
│   └── index.ts
│
├── hooks/               # Custom React hooks
│   ├── useSymbiAnimation.ts        # Animation logic for 8-bit ghost
│   ├── useBackgroundSync.ts        # Background sync management
│   ├── useEvolutionProgress.ts     # Evolution progress tracking
│   ├── useHealthDataInitialization.ts # Health data init on mount
│   ├── useNetworkStatus.ts         # Network connectivity status
│   ├── useStateChangeNotification.ts # State change notifications
│   └── index.ts                    # Barrel exports
│
├── navigation/          # React Navigation setup
│   └── AppNavigator.tsx            # Main navigation stack
│
├── types/               # TypeScript type definitions
│   ├── index.ts                    # Shared types and interfaces
│   └── result.ts                   # Result type for error handling
│
├── constants/           # Application constants
│   ├── theme.ts                    # Halloween colors, state colors, metric config
│   └── index.ts                    # Barrel exports
│
├── utils/               # Utility functions
│   ├── dateHelpers.ts              # Date formatting utilities
│   ├── metricHelpers.ts            # Type-safe metric operations
│   └── index.ts                    # Barrel exports
│
├── assets/              # Static assets
│   ├── images/
│   │   └── tamagotchi-frame.png    # Tamagotchi-style frame
│   └── animations/
│       ├── phase1/                 # Basic emotional states
│       │   ├── sad.json
│       │   ├── resting.json
│       │   └── active.json
│       ├── phase2/                 # Advanced emotional states
│       │   ├── vibrant.json
│       │   ├── calm.json
│       │   ├── tired.json
│       │   ├── stressed.json
│       │   ├── anxious.json
│       │   └── rested.json
│       └── phase3/                 # Evolution animations
│
└── config/              # Configuration files
    └── sentry.config.ts            # Sentry setup
```

## Architecture Patterns

### Service Layer Pattern

- All external integrations abstracted through service interfaces
- Platform-specific implementations (HealthKit vs Google Fit)
- Factory pattern for service instantiation based on platform

### Store Pattern

- Zustand stores for reactive state management
- Automatic persistence to AsyncStorage
- Selector-based subscriptions to minimize re-renders

### Component Organization

- Barrel exports via `index.ts` files
- Co-located tests in `__tests__` directories
- README.md files in major directories for documentation

## Key Conventions

### File Naming

- Components: PascalCase (e.g., `SymbiAnimation.tsx`)
- Services: PascalCase (e.g., `HealthDataService.ts`)
- Stores: camelCase (e.g., `healthDataStore.ts`)
- Tests: `*.test.tsx` or `*.test.ts`

### Import Order

1. React and React Native imports
2. Third-party libraries
3. Path alias imports (@components, @services, etc.)
4. Relative imports
5. Type imports

### State Management

- Use Zustand stores for global state
- Use React hooks (useState, useEffect) for local component state
- Avoid prop drilling - use stores for deeply nested data

### Error Handling

- Services return Result types or throw typed errors
- UI components handle errors gracefully with fallbacks
- All errors logged to ErrorReportingService
- Health data sanitized from error reports

### Testing

- Unit tests for services and utilities
- Integration tests for data flows
- Component tests using React Testing Library
- Manual E2E testing checklist in docs/

## Documentation

- Component READMEs: `src/components/README.md`, `src/screens/README.md`, `src/stores/README.md`
- Implementation summaries: `docs/task-*-implementation-summary.md`
- App store guides: `docs/app-store/`
- Spec files: `.kiro/specs/symbi-biometric-tamagotchi/`
