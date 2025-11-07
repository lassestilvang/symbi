# Design Document: Symbi (Biometric Tamagotchi)

## Overview

Symbi is a cross-platform mobile application that gamifies health tracking by representing the user's biometric data through a Halloween-themed digital pet. The application follows a phased development approach, starting with a simple step-tracking MVP and evolving into an AI-powered, interactive wellness companion.

The core design philosophy centers on creating an emotional feedback loop: the user's real-world health behaviors directly influence their Symbi's visual state and animations, which in turn motivates the user to maintain or improve their health habits. The Halloween aesthetic (purple Kiro ghost with bloody/scary elements) provides a unique, memorable visual identity while maintaining cuteness through rounded shapes and expressive features.

### Key Design Principles

1. **Immediate Visual Feedback**: Health data changes should reflect in the Symbi's state within seconds
2. **Privacy-First Architecture**: All sensitive health data processing happens locally or with explicit user consent
3. **Battery Efficiency**: Leverage platform-native background fetch mechanisms rather than polling
4. **Progressive Enhancement**: Each phase builds on the previous without breaking existing functionality
5. **Cross-Platform Consistency**: Identical user experience on iOS and Android despite different health APIs

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Native App                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Presentation Layer                        │  │
│  │  - Symbi Animation Component (Lottie)                 │  │
│  │  - Onboarding Screens                                 │  │
│  │  - Settings & Configuration UI                        │  │
│  │  - Interactive Session UI (Phase 3)                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ↕                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Business Logic Layer                      │  │
│  │  - State Management (Context API / Zustand)           │  │
│  │  - Emotional State Calculator                         │  │
│  │  - Threshold Configuration Manager                    │  │
│  │  - Evolution Tracker (Phase 3)                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ↕                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Data Access Layer                         │  │
│  │  - Health Data Service (Abstraction)                  │  │
│  │  - Local Storage Service (AsyncStorage)               │  │
│  │  - AI Brain Service Client (Phase 2)                  │  │
│  │  - Cloud Sync Service (Phase 3)                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ↕                                  │
│  ┌─────────────────────┬─────────────────────────────────┐  │
│  │  iOS Native Module  │  Android Native Module          │  │
│  │  - HealthKit Bridge │  - Google Fit Bridge            │  │
│  │  - Background Fetch │  - Background Fetch             │  │
│  └─────────────────────┴─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  - Apple HealthKit (iOS)                                    │
│  - Google Fit API (Android)                                 │
│  - Gemini API (Phase 2+)                                    │
│  - Cloud Storage (Phase 3)                                  │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Core Framework**: React Native 0.72+
- Chosen for cross-platform development with single codebase
- Native module support for HealthKit and Google Fit
- Strong community and ecosystem

**Animation Engine**: Lottie React Native
- Vector-based animations for smooth, scalable visuals
- Small file sizes for multiple emotional state animations
- Easy to create and iterate on designs in After Effects

**State Management**: React Context API + Zustand (lightweight)
- Context API for global app state (user preferences, thresholds)
- Zustand for reactive health data state updates
- Minimal boilerplate compared to Redux

**Local Storage**: AsyncStorage
- Persist user preferences, thresholds, and cached health data
- Simple key-value store suitable for app needs

**Health Data Integration**:
- iOS: `react-native-health` library for HealthKit access
- Android: `react-native-google-fit` library for Google Fit access
- Custom abstraction layer to unify both APIs

**AI Integration (Phase 2)**: Gemini API
- Model: `gemini-2.5-flash-preview-09-2025`
- RESTful API calls with TLS 1.3 encryption
- Prompt engineering for emotional state classification

**Image Generation (Phase 3)**: Gemini Image API
- Model: `gemini-2.5-flash-image-preview`
- Generate evolved Symbi forms based on user progress

## Components and Interfaces

### 1. Health Data Service (Abstraction Layer)

This service provides a unified interface for accessing health data regardless of platform.

```typescript
interface HealthDataService {
  // Initialization
  initialize(permissions: HealthPermissions): Promise<InitResult>;
  checkAuthorizationStatus(permissions: HealthPermissions): Promise<AuthStatus>;
  
  // Data Retrieval
  getStepCount(startDate: Date, endDate: Date): Promise<number>;
  getSleepDuration(startDate: Date, endDate: Date): Promise<number>; // Phase 2
  getHeartRateVariability(startDate: Date, endDate: Date): Promise<number>; // Phase 2
  
  // Data Writing (Phase 3)
  writeMindfulMinutes(duration: number, timestamp: Date): Promise<boolean>;
  
  // Background Updates
  subscribeToUpdates(dataType: HealthDataType, callback: (data: any) => void): void;
  unsubscribeFromUpdates(dataType: HealthDataType): void;
}

interface HealthPermissions {
  read: HealthDataType[];
  write: HealthDataType[];
}

enum HealthDataType {
  STEPS = 'steps',
  SLEEP = 'sleep',
  HRV = 'hrv',
  MINDFUL_MINUTES = 'mindful_minutes'
}

interface InitResult {
  success: boolean;
  error?: string;
  grantedPermissions: HealthDataType[];
}
```

**Implementation Strategy**:
- Create platform-specific implementations (`HealthKitService`, `GoogleFitService`)
- Use factory pattern to instantiate correct service based on `Platform.OS`
- Manual data entry mode uses `ManualHealthDataService` that reads from AsyncStorage

### 2. Emotional State Calculator

Determines the Symbi's emotional state based on health metrics and user-configured thresholds.

```typescript
interface EmotionalStateCalculator {
  // Phase 1: Rule-based calculation
  calculateStateFromSteps(steps: number, thresholds: StepThresholds): EmotionalState;
  
  // Phase 2: AI-based calculation
  calculateStateFromMultipleMetrics(
    metrics: HealthMetrics,
    goals: HealthGoals
  ): Promise<EmotionalState>;
}

interface StepThresholds {
  sadThreshold: number;      // Default: 2000
  activeThreshold: number;   // Default: 8000
}

interface HealthMetrics {
  steps: number;
  sleepHours?: number;
  hrv?: number;
}

interface HealthGoals {
  targetSteps: number;
  targetSleepHours: number;
  targetHRV?: number;
}

enum EmotionalState {
  // Phase 1 states
  SAD = 'sad',
  RESTING = 'resting',
  ACTIVE = 'active',
  
  // Phase 2 additional states
  VIBRANT = 'vibrant',
  CALM = 'calm',
  TIRED = 'tired',
  STRESSED = 'stressed',
  ANXIOUS = 'anxious',
  RESTED = 'rested'
}
```

**Phase 1 Logic**:
```typescript
calculateStateFromSteps(steps: number, thresholds: StepThresholds): EmotionalState {
  if (steps < thresholds.sadThreshold) return EmotionalState.SAD;
  if (steps < thresholds.activeThreshold) return EmotionalState.RESTING;
  return EmotionalState.ACTIVE;
}
```

**Phase 2 Logic**:
- Batch health data once per day (e.g., 8:00 AM)
- Construct prompt for Gemini API with metrics and goals
- Parse AI response to extract emotional state label
- Fallback to Phase 1 logic if API fails or times out

### 3. Symbi Animation Component

Renders the Symbi creature with smooth state transitions.

```typescript
interface SymbiAnimationProps {
  emotionalState: EmotionalState;
  evolutionLevel?: number; // Phase 3
  customAppearance?: string; // Phase 3: URL to evolved image
}

interface SymbiAnimationComponent {
  render(): JSX.Element;
  transitionToState(newState: EmotionalState, duration: number): void;
}
```

**Animation Asset Structure**:
```
assets/
  animations/
    phase1/
      sad.json
      resting.json
      active.json
    phase2/
      vibrant.json
      calm.json
      tired.json
      stressed.json
      anxious.json
      rested.json
    phase3/
      evolved/
        [dynamically generated images]
```

**Visual Design Specifications**:
- Base color: Purple (#7C3AED to #9333EA gradient)
- Ghost shape: Rounded, floating with subtle bob animation
- Scary elements:
  - Dripping effect on edges (darker purple #5B21B6)
  - Glowing eyes (color changes with emotional state)
  - Ethereal trail particles
- Cute elements:
  - Large expressive eyes
  - Rounded body shape
  - Playful idle animations (blinking, looking around)

**State-Specific Visual Cues**:
- **Sad**: Drooping posture, dim eyes, slower bob animation, more dripping
- **Resting**: Neutral posture, half-closed eyes, steady bob
- **Active**: Upright posture, bright eyes, faster bob, particle effects
- **Vibrant**: Energetic bouncing, sparkling particles, brightest colors
- **Calm**: Gentle swaying, soft glow, minimal dripping
- **Tired**: Slouched, very dim eyes, minimal movement
- **Stressed**: Jittery movement, flickering eyes, erratic dripping
- **Anxious**: Rapid small movements, wide eyes, pulsing glow

### 4. AI Brain Service (Phase 2)

Handles communication with Gemini API for emotional state analysis.

```typescript
interface AIBrainService {
  analyzeHealthData(
    metrics: HealthMetrics,
    goals: HealthGoals
  ): Promise<AIAnalysisResult>;
  
  generateEvolvedAppearance(
    evolutionContext: EvolutionContext
  ): Promise<string>; // Phase 3: Returns image URL
}

interface AIAnalysisResult {
  emotionalState: EmotionalState;
  confidence: number;
  reasoning?: string; // Optional explanation
}

interface EvolutionContext {
  daysActive: number;
  dominantStates: EmotionalState[];
  userPreferences?: any;
}
```

**Prompt Engineering Strategy**:

```typescript
const EMOTIONAL_STATE_PROMPT = `
You are the "brain" for a digital pet called Symbi. Your job is to analyze the user's health data and determine their overall emotional state in ONE WORD.

Choose from: [Vibrant, Calm, Tired, Stressed, Anxious, Rested, Active]

Health Data:
- Steps: {steps} (goal: {targetSteps})
- Sleep: {sleepHours} hours (goal: {targetSleepHours})
- HRV: {hrv}ms (higher is better, typical range: 20-100)

Rules:
- Vibrant: Exceeding goals, high HRV
- Active: Meeting step goals, decent sleep
- Calm: Good sleep, moderate activity
- Rested: Excellent sleep, lower activity
- Tired: Low sleep, any activity level
- Stressed: Low HRV, high activity, low sleep
- Anxious: Low HRV, erratic patterns

Respond with ONLY ONE WORD from the list above.
`;
```

**API Configuration**:
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent`
- Request timeout: 10 seconds
- Retry strategy: 2 attempts with exponential backoff
- Caching: Cache result for 24 hours
- Rate limiting: Max 1 request per 24 hours per user

### 5. Interactive Session Manager (Phase 3)

Manages guided wellness activities that improve Symbi's state.

```typescript
interface InteractiveSessionManager {
  startSession(type: SessionType): Promise<void>;
  completeSession(duration: number): Promise<SessionResult>;
  cancelSession(): void;
}

enum SessionType {
  BREATHING_EXERCISE = 'breathing',
  MEDITATION = 'meditation',
  STRETCHING = 'stretching'
}

interface SessionResult {
  success: boolean;
  duration: number;
  newEmotionalState: EmotionalState;
  healthDataWritten: boolean;
}
```

**Breathing Exercise Implementation**:
- Visual: Animated circle that expands (inhale) and contracts (exhale)
- Audio: Optional calming background sounds
- Duration: 1-5 minutes (user configurable)
- Pattern: 4-7-8 breathing (4s inhale, 7s hold, 8s exhale)
- Haptic feedback: Gentle vibrations on breath transitions

### 6. Evolution System (Phase 3)

Tracks user progress and triggers visual evolution events.

```typescript
interface EvolutionSystem {
  trackDailyState(state: EmotionalState): void;
  checkEvolutionEligibility(): Promise<EvolutionEligibility>;
  triggerEvolution(): Promise<EvolutionResult>;
  getEvolutionHistory(): EvolutionRecord[];
}

interface EvolutionEligibility {
  eligible: boolean;
  daysInPositiveState: number;
  daysRequired: number;
}

interface EvolutionResult {
  success: boolean;
  newAppearanceUrl: string;
  evolutionLevel: number;
}

interface EvolutionRecord {
  timestamp: Date;
  evolutionLevel: number;
  appearanceUrl: string;
  triggerReason: string;
}
```

**Evolution Criteria**:
- Cumulative 30 days in Active or Vibrant states
- Days don't need to be consecutive
- Each evolution is permanent and adds to gallery
- Maximum 5 evolution levels

**Image Generation Prompt**:
```typescript
const EVOLUTION_PROMPT = `
Generate an evolved version of a cute Halloween ghost creature (Symbi).

Base characteristics:
- Purple color palette (#7C3AED to #9333EA)
- Ghost-like floating form
- Cute but slightly spooky aesthetic
- Rounded shapes

Evolution level: {level}
Dominant emotional states: {states}

Add new features that reflect {level} weeks of healthy habits:
- Level 1: Subtle glow, small wings
- Level 2: Brighter colors, larger wings, sparkles
- Level 3: Crown or halo, multiple tails, energy aura
- Level 4: Ethereal armor, magical symbols
- Level 5: Fully transcendent form, cosmic elements

Style: Digital art, vibrant colors, Halloween theme, cute but powerful
`;
```

## Data Models

### User Profile

```typescript
interface UserProfile {
  id: string;
  createdAt: Date;
  preferences: UserPreferences;
  thresholds: StepThresholds;
  goals: HealthGoals;
  evolutionLevel: number;
  totalDaysActive: number;
}

interface UserPreferences {
  dataSource: 'healthkit' | 'googlefit' | 'manual';
  notificationsEnabled: boolean;
  hapticFeedbackEnabled: boolean;
  soundEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
}
```

### Health Data Cache

```typescript
interface HealthDataCache {
  date: string; // ISO date string
  steps: number;
  sleepHours?: number;
  hrv?: number;
  emotionalState: EmotionalState;
  calculationMethod: 'rule-based' | 'ai';
  lastUpdated: Date;
}
```

### Evolution Record

```typescript
interface EvolutionRecord {
  id: string;
  timestamp: Date;
  evolutionLevel: number;
  appearanceUrl: string;
  daysInPositiveState: number;
  dominantStates: EmotionalState[];
}
```

## Error Handling

### Health Data Access Errors

**Scenario**: User denies health data permissions
- **Handling**: Show friendly explanation of why permissions are needed
- **Fallback**: Offer manual data entry mode
- **UI**: Display banner with "Enable Health Data" button

**Scenario**: Health data unavailable (no data for today)
- **Handling**: Use yesterday's data with visual indicator
- **Fallback**: Show neutral Resting state
- **UI**: Display "Waiting for today's data..." message

**Scenario**: Background fetch fails
- **Handling**: Retry with exponential backoff (1min, 5min, 15min)
- **Fallback**: Use cached data from last successful fetch
- **UI**: No user-facing error unless data is >24 hours old

### AI Service Errors

**Scenario**: Gemini API timeout (>10 seconds)
- **Handling**: Cancel request and fallback to Phase 1 rule-based logic
- **Logging**: Log error for debugging
- **UI**: No user-facing error (seamless fallback)

**Scenario**: Gemini API returns invalid response
- **Handling**: Parse response, if invalid use rule-based logic
- **Retry**: Don't retry same request, wait for next scheduled analysis
- **UI**: No user-facing error

**Scenario**: Rate limit exceeded
- **Handling**: Use cached emotional state from previous analysis
- **Logging**: Log rate limit hit
- **UI**: No user-facing error

### Network Errors

**Scenario**: No internet connection
- **Handling**: Use cached data and local calculations
- **UI**: Show offline indicator in status bar
- **Sync**: Queue any pending writes (mindful minutes) for later sync

**Scenario**: Cloud sync failure (Phase 3)
- **Handling**: Retry with exponential backoff
- **Fallback**: Keep data local until connection restored
- **UI**: Show sync status icon

### Evolution Generation Errors

**Scenario**: Image generation fails
- **Handling**: Retry up to 3 times
- **Fallback**: Use previous evolution appearance
- **UI**: Show "Evolution in progress..." message, then "Evolution will complete soon"

## Testing Strategy

### Unit Tests

**Health Data Service**:
- Test platform detection and correct service instantiation
- Mock HealthKit/Google Fit responses
- Test data transformation and normalization
- Test error handling for denied permissions

**Emotional State Calculator**:
- Test Phase 1 threshold logic with various step counts
- Test Phase 2 AI response parsing
- Test fallback logic when AI fails
- Test edge cases (0 steps, extremely high steps)

**Evolution System**:
- Test day counting logic
- Test eligibility calculation
- Test evolution level progression
- Test history tracking

### Integration Tests

**Health Data Flow**:
- Test end-to-end data retrieval from HealthKit (iOS simulator)
- Test end-to-end data retrieval from Google Fit (Android emulator)
- Test manual data entry flow
- Test background fetch triggering

**AI Integration**:
- Test Gemini API request/response cycle
- Test prompt construction with various metrics
- Test timeout and retry logic
- Test fallback to rule-based calculation

**Animation Transitions**:
- Test smooth transitions between all emotional states
- Test animation loading and caching
- Test performance with rapid state changes

### End-to-End Tests (Manual)

**Phase 1 MVP**:
1. Fresh install → onboarding → permission grant → see Symbi
2. Walk 1000 steps → verify Sad state
3. Walk 5000 steps → verify Resting state
4. Walk 10000 steps → verify Active state
5. Configure custom thresholds → verify new behavior
6. Deny permissions → verify manual entry mode works

**Phase 2 AI**:
1. Enable Phase 2 features
2. Provide sleep + HRV data
3. Verify AI analysis runs once per day
4. Verify emotional state reflects multiple metrics
5. Simulate API failure → verify fallback to Phase 1

**Phase 3 Interactive**:
1. Get Symbi into Stressed state
2. Tap "Calm your Symbi" button
3. Complete breathing exercise
4. Verify state changes to Calm
5. Verify mindful minutes written to HealthKit/Google Fit
6. Accumulate 30 active days → verify evolution triggers

### Performance Tests

**Battery Usage**:
- Monitor battery drain over 24 hours
- Target: <5% of total battery capacity
- Test background fetch frequency
- Test animation frame rate impact

**Memory Usage**:
- Monitor memory footprint during normal use
- Target: <100MB RAM
- Test for memory leaks during state transitions
- Test Lottie animation memory usage

**API Response Times**:
- Measure Gemini API response time
- Target: <5 seconds for 95th percentile
- Test with poor network conditions
- Test timeout and retry behavior

## Security and Privacy

### Data Encryption

**In Transit**:
- All API calls to Gemini use TLS 1.3
- Certificate pinning for Gemini API endpoints
- No health data transmitted to third parties except Gemini (with user consent)

**At Rest**:
- AsyncStorage data encrypted using device keychain (iOS) / Keystore (Android)
- Health data cache encrypted with AES-256
- User preferences stored in encrypted storage

### Data Minimization

**What We Store**:
- Daily aggregated health metrics (steps, sleep, HRV)
- Emotional state history (last 30 days)
- User preferences and thresholds
- Evolution records

**What We Don't Store**:
- Raw minute-by-minute health data
- Personally identifiable information beyond device ID
- Location data
- Contacts or other sensitive device data

### Data Retention

**Local Storage**:
- Health data cache: 30 days rolling window
- Emotional state history: 90 days
- Evolution records: Permanent (user can delete)

**Remote Storage** (Phase 3):
- Cloud sync data: Same as local
- Deleted within 7 days of account deletion
- User can export all data before deletion

### Permissions

**iOS (Info.plist)**:
```xml
<key>NSHealthShareUsageDescription</key>
<string>Symbi uses your step count to reflect your activity in your digital pet's mood and appearance.</string>

<key>NSHealthUpdateUsageDescription</key>
<string>Symbi writes mindful minutes when you complete wellness activities with your pet.</string>

<key>NSHealthClinicalHealthRecordsShareUsageDescription</key>
<string>Not used by this app.</string>
```

**Android (AndroidManifest.xml)**:
```xml
<uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
<uses-permission android:name="com.google.android.gms.permission.FITNESS_ACTIVITY_READ" />
<uses-permission android:name="com.google.android.gms.permission.FITNESS_ACTIVITY_WRITE" />
```

## Performance Optimization

### Background Fetch Strategy

**iOS (HealthKit)**:
- Use `HKObserverQuery` to receive notifications when new data is available
- Set up background delivery for step count data type
- Minimum fetch interval: 15 minutes
- Batch updates to reduce wake-ups

**Android (Google Fit)**:
- Use `Recording API` for automatic background data collection
- Set up `SensorListener` for step count updates
- Use `WorkManager` for periodic data sync
- Minimum fetch interval: 15 minutes

### Animation Performance

**Optimization Techniques**:
- Preload all Lottie animations on app launch
- Use `useNativeDriver: true` for transform animations
- Reduce animation complexity for lower-end devices
- Implement frame rate throttling when app is backgrounded (10 FPS)
- Cache rendered frames for frequently used states

### API Call Optimization

**Gemini API**:
- Batch daily analysis at fixed time (8:00 AM local time)
- Cache results for 24 hours
- Implement request deduplication
- Use compression for request/response payloads

**Image Generation** (Phase 3):
- Generate evolution images asynchronously
- Cache generated images locally
- Use CDN for serving evolved appearances
- Implement progressive image loading

## Deployment and Monitoring

### App Store Requirements

**iOS App Store**:
- HealthKit entitlement required
- Privacy policy URL in App Store Connect
- Screenshots showing health data usage
- Age rating: 4+ (no objectionable content despite Halloween theme)

**Google Play Store**:
- Health Connect integration (Android 14+)
- Privacy policy URL in Play Console
- Data safety section completed
- Age rating: Everyone

### Analytics and Monitoring

**Key Metrics**:
- Daily Active Users (DAU)
- Health data permission grant rate
- Average emotional state distribution
- AI API success rate and latency
- Evolution event completion rate
- Session duration and frequency
- Crash rate and error frequency

**Privacy-Preserving Analytics**:
- Use anonymous device IDs
- Aggregate metrics only (no individual tracking)
- No health data sent to analytics service
- Opt-out option in settings

### Crash Reporting

**Tools**: Sentry or Firebase Crashlytics
- Automatic crash reporting
- Breadcrumb logging for debugging
- Sanitize health data from crash reports
- Alert on critical errors (>1% crash rate)

## Future Enhancements (Beyond Phase 3)

### Social Features
- Share Symbi evolution milestones (without health data)
- Friend challenges (step count competitions)
- Symbi "playdates" (virtual meetups)

### Additional Health Metrics
- Heart rate monitoring
- Blood pressure tracking
- Nutrition logging
- Hydration tracking

### Gamification
- Achievement system (badges for milestones)
- Streak tracking (consecutive active days)
- Leaderboards (optional, privacy-preserving)

### Customization
- Unlock accessories for Symbi (hats, scarves, etc.)
- Custom color themes beyond purple
- Seasonal themes (Christmas, Easter, etc.)

### AI Enhancements
- Personalized health recommendations
- Predictive analytics (forecast tomorrow's state)
- Natural language chat with Symbi
- Voice interaction

## Conclusion

This design provides a comprehensive blueprint for building Symbi across three development phases. The architecture prioritizes user privacy, battery efficiency, and cross-platform consistency while delivering an engaging, emotionally resonant experience. The phased approach allows for iterative validation of core concepts before investing in more complex AI and interactive features.

Key success factors:
1. **Immediate gratification**: Users see their Symbi react to their activity within minutes
2. **Privacy transparency**: Clear explanations of data usage build trust
3. **Delightful aesthetics**: The Halloween-themed Kiro ghost is memorable and unique
4. **Progressive complexity**: Each phase adds value without overwhelming users
5. **Technical robustness**: Fallback mechanisms ensure the app works even when services fail
