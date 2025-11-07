# Implementation Plan: Symbi (Biometric Tamagotchi)

- [x] 1. Initialize React Native project and configure development environment
  - Create new React Native project with TypeScript template
  - Configure iOS and Android build settings
  - Set up folder structure (src/components, src/services, src/hooks, src/types, src/assets)
  - Install core dependencies (Lottie, AsyncStorage, navigation)
  - Configure ESLint and Prettier for code consistency
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 2. Set up health data integration infrastructure
- [x] 2.1 Create health data service abstraction layer
  - Define TypeScript interfaces for HealthDataService, HealthPermissions, and HealthDataType
  - Implement factory pattern to instantiate platform-specific services
  - Create base HealthDataService abstract class with common methods
  - _Requirements: 1.1, 1.2, 1.3, 9.1, 9.2_

- [x] 2.2 Implement iOS HealthKit integration
  - Install and configure react-native-health library
  - Add HealthKit capability to iOS project
  - Update Info.plist with NSHealthShareUsageDescription and NSHealthUpdateUsageDescription
  - Implement HealthKitService class extending HealthDataService
  - Implement initialize(), getStepCount(), and checkAuthorizationStatus() methods
  - Set up HKObserverQuery for background step count updates
  - _Requirements: 1.2, 5.1, 10.1, 11.1, 11.2_

- [x] 2.3 Implement Android Google Fit integration
  - Install and configure react-native-google-fit library
  - Add required permissions to AndroidManifest.xml
  - Implement GoogleFitService class extending HealthDataService
  - Implement initialize(), getStepCount(), and checkAuthorizationStatus() methods
  - Set up Recording API for background step count updates
  - _Requirements: 1.3, 5.1, 10.1, 11.1, 11.2_

- [x] 2.4 Implement manual data entry service
  - Create ManualHealthDataService class extending HealthDataService
  - Implement AsyncStorage-based data persistence for manual entries
  - Create validation logic for step count input (0-100000 range)
  - _Requirements: 2.1, 2.2, 2.3, 4.1_

- [x] 2.5 Implement background fetch and subscription system
  - Create subscribeToUpdates() and unsubscribeFromUpdates() methods
  - Configure iOS background fetch with 15-minute minimum interval
  - Configure Android WorkManager for periodic sync
  - Implement callback system to notify app of new health data
  - _Requirements: 1.5, 10.2, 10.3_

- [x] 2.6 Write unit tests for health data services
  - Test platform detection and service instantiation
  - Mock HealthKit and Google Fit responses
  - Test data transformation and error handling
  - Test permission denial scenarios
  - _Requirements: 1.1, 1.2, 1.3, 2.4_

- [x] 3. Implement local storage and state management
- [x] 3.1 Set up AsyncStorage wrapper service
  - Create StorageService class with type-safe get/set methods
  - Implement encryption wrapper using device keychain/keystore
  - Create methods for storing UserProfile, HealthDataCache, and EvolutionRecord
  - _Requirements: 11.2, 14.3_

- [x] 3.2 Implement state management with Zustand
  - Create health data store for reactive updates
  - Create user preferences store
  - Create Symbi state store (emotional state, evolution level)
  - Implement persistence middleware to sync with AsyncStorage
  - _Requirements: 4.1, 4.2, 4.3, 3.1, 3.2, 3.3_

- [x] 3.3 Create data models and TypeScript types
  - Define UserProfile, UserPreferences, StepThresholds, HealthGoals interfaces
  - Define HealthDataCache, EvolutionRecord interfaces
  - Define EmotionalState enum with all states
  - Export all types from central types file
  - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 5.4, 8.4_

- [ ] 4. Build emotional state calculation system (Phase 1)
- [ ] 4.1 Implement rule-based emotional state calculator
  - Create EmotionalStateCalculator class
  - Implement calculateStateFromSteps() method with threshold logic
  - Add default thresholds (2000 for Sad, 8000 for Active)
  - Return EmotionalState enum value based on step count
  - _Requirements: 3.1, 4.1, 4.2, 4.3_

- [ ] 4.2 Implement threshold configuration manager
  - Create UI component for threshold configuration screen
  - Implement validation logic (lower threshold < higher threshold)
  - Save custom thresholds to AsyncStorage via StorageService
  - Load thresholds on app launch and apply to calculator
  - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [ ] 4.3 Create health data polling and state update logic
  - Implement daily health data fetch at app launch
  - Calculate emotional state using EmotionalStateCalculator
  - Update Zustand store with new emotional state
  - Cache health data and emotional state in AsyncStorage
  - _Requirements: 1.5, 4.1, 4.2, 4.3, 14.1, 14.3_

- [ ] 4.4 Write unit tests for emotional state calculator
  - Test threshold logic with various step counts (0, 1000, 5000, 10000)
  - Test edge cases (negative steps, extremely high steps)
  - Test custom threshold configuration
  - Test state transitions
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 5. Create Symbi animation component and visual assets
- [ ] 5.1 Design and export Lottie animations for Phase 1 states
  - Create Sad state animation (drooping posture, dim eyes, slow bob, dripping)
  - Create Resting state animation (neutral posture, half-closed eyes, steady bob)
  - Create Active state animation (upright posture, bright eyes, fast bob, particles)
  - Export as JSON files to assets/animations/phase1/
  - Ensure purple color palette (#7C3AED to #9333EA) and Halloween aesthetic
  - _Requirements: 4.4, 12.1, 12.2, 12.3, 12.4_

- [ ] 5.2 Implement SymbiAnimation component
  - Create React component that accepts emotionalState prop
  - Use LottieView to render appropriate animation based on state
  - Implement animation preloading on component mount
  - Add style prop for sizing and positioning
  - _Requirements: 4.4, 4.5, 9.4_

- [ ] 5.3 Implement smooth state transition animations
  - Create transitionToState() method with configurable duration (1-3 seconds)
  - Use Animated API to fade between animation states
  - Ensure no animation flicker during transitions
  - Optimize for 60 FPS on mid-range devices
  - _Requirements: 4.5, 10.3_

- [ ] 5.4 Optimize animation performance
  - Implement frame rate throttling when app is backgrounded (10 FPS)
  - Use useNativeDriver for transform animations
  - Cache rendered frames for frequently used states
  - Test memory usage and optimize if >100MB
  - _Requirements: 10.3, 10.4_

- [ ] 5.5 Test animation rendering and transitions
  - Test all three Phase 1 state animations render correctly
  - Test smooth transitions between all state combinations
  - Test animation performance on low-end devices
  - Test memory usage during rapid state changes
  - _Requirements: 4.4, 4.5, 9.4_

- [ ] 6. Build onboarding flow and permission handling
- [ ] 6.1 Create onboarding screen components
  - Design 3-5 onboarding screens explaining Symbi concept
  - Create screen 1: Welcome and introduction to Symbi
  - Create screen 2: Explain health data connection and emotional states
  - Create screen 3: Permission request with clear explanations
  - Create screen 4: Optional manual entry mode explanation
  - Add skip button and progress indicators
  - _Requirements: 13.1, 13.2, 13.4_

- [ ] 6.2 Implement permission request flow
  - Create permission request UI with specific explanations per data type
  - Implement HealthKit permission request for iOS (step count read)
  - Implement Google Fit permission request for Android (step count read)
  - Handle permission grant, denial, and "ask later" scenarios
  - _Requirements: 1.1, 13.3, 11.1_

- [ ] 6.3 Implement manual entry mode selection
  - Add "Use Manual Entry" option during onboarding
  - Save data source preference to UserPreferences
  - Show manual entry form if user declines permissions
  - Allow switching between modes in settings
  - _Requirements: 1.4, 2.1, 2.4_

- [ ] 6.4 Create settings screen with onboarding replay
  - Build settings UI with sections for data source, thresholds, preferences
  - Add "Replay Tutorial" button that launches onboarding flow
  - Implement toggle for notifications, haptics, and sound
  - Add privacy policy and data export links
  - _Requirements: 2.4, 3.5, 13.5, 11.5_

- [ ] 7. Implement main app screen and daily update flow
- [ ] 7.1 Create main Symbi screen UI
  - Design main screen layout with Symbi animation centered
  - Add step count display and progress bar
  - Add current emotional state label
  - Add "Configure Thresholds" button
  - Implement responsive layout for various screen sizes
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 7.2 Implement daily health data update cycle
  - Fetch step count on app launch
  - Calculate emotional state using EmotionalStateCalculator
  - Update UI with new state and trigger animation transition
  - Show loading indicator during data fetch
  - Handle errors gracefully with fallback to cached data
  - _Requirements: 1.5, 4.1, 4.2, 4.3, 14.1, 14.2_

- [ ] 7.3 Implement background update handling
  - Listen for health data update callbacks from HealthDataService
  - Update emotional state when new data arrives
  - Show subtle notification or animation when state changes
  - Ensure updates don't drain battery (max 5% per 24 hours)
  - _Requirements: 1.5, 10.2, 10.4_

- [ ] 7.4 Add error handling and offline support
  - Display friendly error messages for permission issues
  - Show "Waiting for today's data" when no data available
  - Use cached data when health data fetch fails
  - Display offline indicator when no internet connection
  - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [ ] 7.5 Perform end-to-end testing of Phase 1 MVP
  - Test fresh install through onboarding to main screen
  - Test permission grant and denial flows
  - Test manual entry mode
  - Test emotional state changes with different step counts
  - Test custom threshold configuration
  - Test background updates
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3_

- [ ] 8. Implement Phase 2 multi-metric health analysis
- [ ] 8.1 Extend health data services for sleep and HRV
  - Add getSleepDuration() method to HealthDataService interface
  - Add getHeartRateVariability() method to HealthDataService interface
  - Implement sleep data retrieval in HealthKitService
  - Implement HRV data retrieval in HealthKitService
  - Implement sleep data retrieval in GoogleFitService
  - Implement HRV data retrieval in GoogleFitService
  - Add manual entry fields for sleep hours and HRV in ManualHealthDataService
  - _Requirements: 5.1, 5.2_

- [ ] 8.2 Update permission requests for Phase 2 data types
  - Add sleep data read permission to iOS HealthKit request
  - Add HRV read permission to iOS HealthKit request
  - Add sleep data read permission to Android Google Fit request
  - Add HRV read permission to Android Google Fit request
  - Update onboarding explanations for new data types
  - _Requirements: 5.1, 5.2, 13.3_

- [ ] 8.3 Design and export Lottie animations for Phase 2 states
  - Create Vibrant state animation (energetic bouncing, sparkling particles, brightest colors)
  - Create Calm state animation (gentle swaying, soft glow, minimal dripping)
  - Create Tired state animation (slouched, very dim eyes, minimal movement)
  - Create Stressed state animation (jittery movement, flickering eyes, erratic dripping)
  - Create Anxious state animation (rapid small movements, wide eyes, pulsing glow)
  - Create Rested state animation (peaceful posture, closed eyes, gentle breathing)
  - Export as JSON files to assets/animations/phase2/
  - _Requirements: 5.4, 12.5_

- [ ] 8.4 Implement AI Brain Service for Gemini API integration
  - Create AIBrainService class with analyzeHealthData() method
  - Implement Gemini API client with TLS 1.3 encryption
  - Construct emotional state analysis prompt with health metrics and goals
  - Parse API response to extract EmotionalState enum value
  - Implement 10-second timeout with retry logic (2 attempts)
  - Cache API results for 24 hours in AsyncStorage
  - _Requirements: 5.3, 5.4, 6.1, 6.2, 6.3, 11.2_

- [ ] 8.5 Implement daily AI analysis scheduling
  - Schedule daily analysis at 8:00 AM local time using WorkManager/BackgroundTasks
  - Batch health data from previous day (steps, sleep, HRV)
  - Call AIBrainService.analyzeHealthData() with batched data
  - Update emotional state in Zustand store with AI result
  - Fallback to Phase 1 rule-based logic if AI fails
  - _Requirements: 5.3, 6.4, 6.5_

- [ ] 8.6 Update EmotionalStateCalculator for multi-metric analysis
  - Add calculateStateFromMultipleMetrics() method
  - Integrate AIBrainService call within calculator
  - Implement fallback logic to Phase 1 when AI unavailable
  - Update main screen to display multiple health metrics
  - _Requirements: 5.3, 5.4, 6.4_

- [ ] 8.7 Test Phase 2 AI integration
  - Test Gemini API request/response cycle with sample data
  - Test prompt construction with various metric combinations
  - Test timeout and retry logic
  - Test fallback to rule-based calculation
  - Test daily scheduling and batching
  - _Requirements: 5.3, 5.4, 6.1, 6.2, 6.3, 6.4_

- [ ] 9. Implement Phase 3 interactive sessions
- [ ] 9.1 Create InteractiveSessionManager service
  - Define SessionType enum (breathing, meditation, stretching)
  - Implement startSession() method to initialize session
  - Implement completeSession() method to finalize and write health data
  - Implement cancelSession() method for user cancellation
  - _Requirements: 7.2, 7.3, 7.4_

- [ ] 9.2 Build breathing exercise UI component
  - Create animated circle that expands (inhale) and contracts (exhale)
  - Implement 4-7-8 breathing pattern (4s inhale, 7s hold, 8s exhale)
  - Add timer display showing remaining session time
  - Add pause and cancel buttons
  - Implement haptic feedback on breath transitions
  - Add optional calming background sounds
  - _Requirements: 7.2, 7.3_

- [ ] 9.3 Implement mindful minutes health data writing
  - Add writeMindfulMinutes() method to HealthDataService interface
  - Implement mindful minutes write in HealthKitService
  - Implement mindful minutes write in GoogleFitService
  - Store session data locally in ManualHealthDataService
  - Update write permissions in onboarding flow
  - _Requirements: 7.4, 5.2_

- [ ] 9.4 Integrate interactive sessions with emotional state
  - Show "Calm your Symbi" button when state is Stressed or Anxious
  - Launch breathing exercise when button tapped
  - Update emotional state to Calm immediately after session completion
  - Write mindful minutes to health data provider
  - Animate Symbi transition to Calm state
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 9.5 Test interactive session flow
  - Test session start, pause, and completion
  - Test mindful minutes writing to HealthKit and Google Fit
  - Test emotional state update after session
  - Test UI animations and haptic feedback
  - Test session cancellation
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 10. Implement Phase 3 evolution system
- [ ] 10.1 Create EvolutionSystem service
  - Implement trackDailyState() method to record daily emotional states
  - Implement checkEvolutionEligibility() method to check 30-day criteria
  - Implement getEvolutionHistory() method to retrieve past evolutions
  - Store evolution data in AsyncStorage using StorageService
  - _Requirements: 8.1, 8.4_

- [ ] 10.2 Implement evolution eligibility tracking
  - Count cumulative days in Active or Vibrant states
  - Check if count reaches 30 days threshold
  - Display progress indicator on main screen
  - Show notification when evolution is available
  - _Requirements: 8.1_

- [ ] 10.3 Integrate Gemini Image API for evolution generation
  - Add generateEvolvedAppearance() method to AIBrainService
  - Construct evolution prompt with level and dominant states
  - Call Gemini Image API (gemini-2.5-flash-image-preview)
  - Download and cache generated image locally
  - Implement retry logic (up to 3 attempts)
  - _Requirements: 8.2, 8.3_

- [ ] 10.4 Implement evolution trigger and celebration UI
  - Create triggerEvolution() method in EvolutionSystem
  - Show "Evolution Available!" modal when eligible
  - Display loading state during image generation
  - Show celebratory animation when evolution completes
  - Update Symbi appearance to use evolved image
  - Save evolution record to history
  - _Requirements: 8.2, 8.3, 8.4_

- [ ] 10.5 Create evolution gallery UI
  - Build gallery screen showing all past evolution forms
  - Display evolution level, date, and appearance for each record
  - Allow users to view full-size evolved images
  - Add share functionality for evolution milestones
  - _Requirements: 8.5_

- [ ] 10.6 Test evolution system
  - Test daily state tracking over 30+ days
  - Test eligibility calculation
  - Test image generation with Gemini API
  - Test evolution trigger and UI flow
  - Test gallery display and history
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 11. Implement cloud sync and cross-platform support (Phase 3)
- [ ] 11.1 Set up cloud storage backend
  - Choose cloud provider (Firebase, AWS, or custom backend)
  - Implement authentication system for user accounts
  - Create API endpoints for data sync (preferences, evolution history)
  - Implement data encryption for cloud storage
  - _Requirements: 9.5, 11.2, 11.3_

- [ ] 11.2 Implement cloud sync service
  - Create CloudSyncService class with sync methods
  - Implement upload of user preferences and evolution history
  - Implement download and merge of cloud data on new device
  - Handle sync conflicts (local vs cloud data)
  - Queue pending writes when offline
  - _Requirements: 9.5, 14.4_

- [ ] 11.3 Add account management UI
  - Create account creation and login screens
  - Add "Sync Data" option in settings
  - Show sync status indicator
  - Implement account deletion with 7-day data retention
  - Add data export functionality (JSON format)
  - _Requirements: 9.5, 11.4, 11.5_

- [ ] 11.4 Test cloud sync functionality
  - Test data upload and download
  - Test sync across multiple devices
  - Test offline queueing and sync when online
  - Test account deletion and data removal
  - Test data export
  - _Requirements: 9.5, 11.4, 11.5, 14.4_

- [ ] 12. Implement privacy, security, and compliance features
- [ ] 12.1 Add privacy policy and data handling documentation
  - Write comprehensive privacy policy explaining data collection and usage
  - Create in-app privacy policy viewer
  - Add privacy policy link to onboarding and settings
  - Document data retention policies (30-day cache, 90-day history)
  - _Requirements: 11.1, 11.3_

- [ ] 12.2 Implement data encryption
  - Enable AsyncStorage encryption using device keychain (iOS) / Keystore (Android)
  - Implement AES-256 encryption for health data cache
  - Ensure TLS 1.3 for all API calls
  - Implement certificate pinning for Gemini API
  - _Requirements: 11.2_

- [ ] 12.3 Add data export and deletion features
  - Implement "Export My Data" function that generates JSON file
  - Implement "Delete My Data" function that clears local storage
  - Implement "Delete Account" function that removes cloud data
  - Show confirmation dialogs for destructive actions
  - _Requirements: 11.4, 11.5_

- [ ] 12.4 Implement analytics with privacy preservation
  - Integrate privacy-preserving analytics (e.g., Plausible, self-hosted)
  - Use anonymous device IDs only
  - Track aggregate metrics (DAU, permission grant rate, state distribution)
  - Ensure no health data sent to analytics
  - Add analytics opt-out in settings
  - _Requirements: 11.3_

- [ ] 12.5 Perform security audit and testing
  - Test data encryption at rest and in transit
  - Test permission handling and data access controls
  - Test privacy policy accessibility
  - Test data export and deletion functionality
  - Verify no PII leakage in logs or analytics
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 13. Optimize performance and battery usage
- [ ] 13.1 Implement battery optimization strategies
  - Configure background fetch intervals (15 minutes minimum)
  - Reduce animation frame rate when backgrounded (10 FPS)
  - Batch API calls to minimize wake-ups
  - Use WorkManager/BackgroundTasks efficiently
  - _Requirements: 10.1, 10.2, 10.3_

- [ ] 13.2 Optimize memory usage
  - Implement Lottie animation preloading and caching
  - Monitor memory footprint (target <100MB)
  - Fix any memory leaks during state transitions
  - Optimize image caching for evolved appearances
  - _Requirements: 10.4_

- [ ] 13.3 Optimize API performance
  - Implement request deduplication for Gemini API
  - Use compression for request/response payloads
  - Implement progressive image loading for evolutions
  - Cache API responses appropriately (24 hours for analysis)
  - _Requirements: 6.3, 8.3_

- [ ] 13.4 Perform performance testing
  - Measure battery drain over 24 hours (target <5%)
  - Measure memory usage during normal use (target <100MB)
  - Measure Gemini API response times (target <5s for 95th percentile)
  - Test animation frame rates on low-end devices
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 14. Prepare for app store submission
- [ ] 14.1 Configure iOS App Store metadata
  - Add HealthKit entitlement to app capabilities
  - Prepare app screenshots showing health data usage
  - Write app description highlighting privacy and features
  - Set age rating to 4+
  - Add privacy policy URL to App Store Connect
  - _Requirements: 11.1, 13.1, 13.2_

- [ ] 14.2 Configure Google Play Store metadata
  - Integrate Health Connect for Android 14+
  - Complete Data Safety section in Play Console
  - Prepare app screenshots and feature graphic
  - Write app description
  - Set age rating to Everyone
  - Add privacy policy URL to Play Console
  - _Requirements: 11.1, 13.1, 13.2_

- [ ] 14.3 Set up crash reporting and monitoring
  - Integrate Sentry or Firebase Crashlytics
  - Configure automatic crash reporting
  - Implement breadcrumb logging for debugging
  - Sanitize health data from crash reports
  - Set up alerts for critical errors (>1% crash rate)
  - _Requirements: 14.5_

- [ ] 14.4 Create app store preview materials
  - Record demo video showing onboarding and core features
  - Design app icon with Symbi ghost character
  - Create promotional graphics for app stores
  - Write release notes for initial version
  - _Requirements: 13.1, 13.2_

- [ ] 14.5 Perform final QA and testing
  - Test complete user journey from install to evolution
  - Test on multiple iOS devices (iPhone 12+, various iOS versions)
  - Test on multiple Android devices (Pixel, Samsung, various Android versions)
  - Test edge cases (no health data, denied permissions, offline mode)
  - Verify all requirements are met
  - _Requirements: All requirements_

- [ ] 15. Launch and post-launch activities
- [ ] 15.1 Submit to app stores
  - Submit iOS build to App Store Connect for review
  - Submit Android build to Google Play Console for review
  - Monitor review status and respond to any feedback
  - Prepare for launch day communications
  - _Requirements: 13.1, 13.2_

- [ ] 15.2 Set up monitoring and analytics dashboards
  - Configure analytics dashboard for key metrics (DAU, retention, state distribution)
  - Set up crash rate monitoring and alerts
  - Monitor API usage and costs (Gemini API)
  - Track permission grant rates and user feedback
  - _Requirements: 14.5_

- [ ] 15.3 Create user documentation and support resources
  - Write FAQ document addressing common questions
  - Create troubleshooting guide for permission issues
  - Set up support email or contact form
  - Prepare responses for common user inquiries
  - _Requirements: 13.4, 13.5_

- [ ] 15.4 Monitor launch metrics and iterate
  - Track first-week metrics (installs, DAU, retention)
  - Monitor crash rates and fix critical bugs
  - Gather user feedback and feature requests
  - Plan first post-launch update based on feedback
  - _Requirements: All requirements_
