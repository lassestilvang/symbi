# Requirements Document: Symbi (Biometric Tamagotchi)

## Introduction

Symbi is a Halloween-themed digital pet application that reflects the user's real-world health data through a cute yet spooky ghost creature. The application motivates users to maintain healthy habits by visualizing their biometric data as the emotional and physical state of their digital companion. The Symbi creature is based on the Kiro ghost with a purple color palette and bloody/scary aesthetic elements appropriate for Halloween theming.

The application is developed in three phases: Phase 1 establishes the core nurture loop with step tracking, Phase 2 introduces AI-driven multi-metric analysis, and Phase 3 adds interactive features and generative evolution.

## Glossary

- **Symbi**: The digital ghost creature that serves as the user's companion and visual representation of their health data
- **Mobile Application**: The cross-platform React Native or Flutter application running on iOS and Android devices
- **Health Data Provider**: Either Apple HealthKit (iOS), Google Fit API (Android), or manual user input
- **Emotional State**: A categorized representation of the Symbi's condition (e.g., Active, Resting, Sad, Vibrant, Calm, Tired, Stressed, Anxious)
- **State Threshold**: User-configurable numeric boundaries that determine when the Symbi transitions between emotional states
- **AI Brain Service**: The Gemini API integration that analyzes multiple health metrics to determine emotional states
- **Evolution Event**: A generative transformation of the Symbi's visual appearance triggered by sustained positive health patterns
- **Interactive Session**: A guided activity (e.g., breathing exercise) that the user performs to improve the Symbi's emotional state
- **Lottie Animation**: Vector-based animation format used for rendering the Symbi's visual states
- **Background Fetch**: A system mechanism that retrieves health data updates without constant polling

## Requirements

### Requirement 1: Health Data Integration

**User Story:** As a health-conscious user, I want Symbi to connect to my device's health data sources, so that my digital pet automatically reflects my real-world activity without manual tracking.

#### Acceptance Criteria

1. WHEN the Mobile Application launches for the first time, THE Mobile Application SHALL display an onboarding screen that explains each requested health data permission with user-friendly language
2. WHEN the user grants HealthKit permissions on iOS, THE Mobile Application SHALL retrieve step count data from HealthKit
3. WHEN the user grants Google Fit permissions on Android, THE Mobile Application SHALL retrieve step count data from Google Fit API
4. WHERE the user declines health data permissions, THE Mobile Application SHALL provide a manual data entry interface for step count input
5. WHEN new health data becomes available from the Health Data Provider, THE Mobile Application SHALL update the Symbi's state within 5 minutes using background fetch mechanisms

### Requirement 2: Manual Data Entry

**User Story:** As a privacy-conscious user, I want to manually enter my health data, so that I can use Symbi without granting access to my device's health tracking systems.

#### Acceptance Criteria

1. WHERE the user selects manual data entry mode, THE Mobile Application SHALL display a daily input form for step count
2. WHEN the user submits a step count value between 0 and 100000, THE Mobile Application SHALL store the value and update the Symbi's emotional state
3. WHEN the user submits an invalid step count value, THE Mobile Application SHALL display an error message indicating the acceptable range
4. THE Mobile Application SHALL allow users to switch between automatic health data integration and manual entry mode at any time through settings

### Requirement 3: Configurable State Thresholds (Phase 1)

**User Story:** As a user with unique fitness levels, I want to customize the step count thresholds that affect my Symbi's mood, so that the pet's reactions align with my personal health goals.

#### Acceptance Criteria

1. THE Mobile Application SHALL provide default state thresholds of 2000 steps for the Sad-to-Resting transition and 8000 steps for the Resting-to-Active transition
2. WHEN the user accesses the threshold configuration screen, THE Mobile Application SHALL display editable numeric input fields for each state transition threshold
3. WHEN the user saves modified thresholds with valid numeric values, THE Mobile Application SHALL apply the new thresholds to future emotional state calculations
4. WHEN the user enters a lower threshold value that exceeds a higher threshold value, THE Mobile Application SHALL display a validation error message
5. THE Mobile Application SHALL persist user-configured thresholds across application sessions

### Requirement 4: Phase 1 MVP - Basic Emotional States

**User Story:** As a new user, I want to see my Symbi react to my daily step count with simple animations, so that I can immediately understand the connection between my activity and my pet's wellbeing.

#### Acceptance Criteria

1. WHEN the user's daily step count is below the Sad threshold, THE Mobile Application SHALL display the Symbi in the Sad emotional state using a Lottie animation
2. WHEN the user's daily step count is between the Sad threshold and Active threshold, THE Mobile Application SHALL display the Symbi in the Resting emotional state using a Lottie animation
3. WHEN the user's daily step count exceeds the Active threshold, THE Mobile Application SHALL display the Symbi in the Active emotional state using a Lottie animation
4. THE Mobile Application SHALL render the Symbi as a ghost creature with a purple base color palette and Halloween-themed bloody or scary visual elements
5. WHEN the Symbi transitions between emotional states, THE Mobile Application SHALL animate the transition smoothly over a duration of 1 to 3 seconds

### Requirement 5: Phase 2 - Multi-Metric Health Analysis

**User Story:** As an engaged user, I want my Symbi to respond to multiple aspects of my health data, so that the pet provides a more holistic reflection of my overall wellbeing.

#### Acceptance Criteria

1. WHEN Phase 2 features are enabled, THE Mobile Application SHALL retrieve sleep duration data and heart rate variability data from the Health Data Provider
2. WHEN Phase 2 features are enabled and manual entry mode is active, THE Mobile Application SHALL provide input fields for sleep hours and HRV values
3. THE Mobile Application SHALL batch health data once per day and transmit it to the AI Brain Service
4. WHEN the AI Brain Service receives health data, THE AI Brain Service SHALL return one emotional state label from the set: Vibrant, Calm, Tired, Stressed, Anxious, Rested, Active
5. WHEN the Mobile Application receives an emotional state label from the AI Brain Service, THE Mobile Application SHALL display the corresponding Lottie animation for the Symbi within 2 seconds

### Requirement 6: Phase 2 - AI Brain Integration

**User Story:** As a user seeking personalized feedback, I want an AI system to interpret my combined health metrics, so that my Symbi's emotional state reflects nuanced patterns in my data.

#### Acceptance Criteria

1. WHEN the Mobile Application sends health data to the AI Brain Service, THE Mobile Application SHALL include step count, sleep duration, and HRV values with their respective goal targets
2. THE AI Brain Service SHALL use the Gemini API with model gemini-2.5-flash-preview-09-2025 to analyze the health data
3. THE AI Brain Service SHALL respond with a single emotional state label within 5 seconds of receiving the request
4. IF the AI Brain Service fails to respond within 10 seconds, THEN THE Mobile Application SHALL fall back to Phase 1 rule-based logic using step count only
5. THE Mobile Application SHALL cache the most recent AI-determined emotional state for offline display

### Requirement 7: Phase 3 - Interactive Sessions

**User Story:** As a user who wants to actively improve my Symbi's mood, I want to perform guided wellness activities, so that I can immediately see positive changes in my pet's emotional state.

#### Acceptance Criteria

1. WHEN the Symbi is in the Stressed or Anxious emotional state, THE Mobile Application SHALL display a button labeled "Calm your Symbi"
2. WHEN the user taps the calm button, THE Mobile Application SHALL launch a guided breathing exercise with a duration between 1 and 5 minutes
3. WHEN the user completes the Interactive Session, THE Mobile Application SHALL write a mindful minutes entry to the Health Data Provider with the session duration
4. WHEN the mindful minutes entry is successfully written, THE Mobile Application SHALL immediately update the Symbi's emotional state to Calm
5. WHERE the user has manual entry mode enabled, THE Mobile Application SHALL record the Interactive Session in local storage instead of writing to the Health Data Provider

### Requirement 8: Phase 3 - Generative Evolution

**User Story:** As a long-term user with consistent healthy habits, I want my Symbi to visually evolve into unique forms, so that I feel rewarded for sustained positive behavior.

#### Acceptance Criteria

1. WHEN the Symbi has been in Active or Vibrant emotional states for a cumulative total of 30 days, THE Mobile Application SHALL trigger an Evolution Event
2. WHEN an Evolution Event is triggered, THE Mobile Application SHALL send a generation request to the Gemini API gemini-2.5-flash-image-preview model with a prompt describing an evolved version of the ghost creature
3. WHEN the Gemini API returns a generated image, THE Mobile Application SHALL display the new evolved Symbi appearance to the user with a celebratory animation
4. THE Mobile Application SHALL persist the evolved Symbi appearance and continue using it for all emotional state animations
5. THE Mobile Application SHALL allow users to view a gallery of all previous Symbi evolution forms

### Requirement 9: Cross-Platform Compatibility

**User Story:** As a user who may switch between iOS and Android devices, I want Symbi to work consistently on both platforms, so that I can maintain my relationship with my digital pet regardless of my device choice.

#### Acceptance Criteria

1. THE Mobile Application SHALL be built using React Native or Flutter to support both iOS and Android platforms from a single codebase
2. WHEN running on iOS version 14.0 or later, THE Mobile Application SHALL integrate with Apple HealthKit APIs
3. WHEN running on Android version 8.0 or later, THE Mobile Application SHALL integrate with Google Fit API
4. THE Mobile Application SHALL render the Symbi's Lottie animations identically on both iOS and Android devices with a visual difference of less than 5 percent
5. THE Mobile Application SHALL synchronize user preferences and Symbi evolution history across devices using cloud storage

### Requirement 10: Battery Efficiency

**User Story:** As a mobile device user, I want Symbi to minimize battery consumption, so that I can keep the app installed without significantly impacting my device's battery life.

#### Acceptance Criteria

1. THE Mobile Application SHALL use Background Fetch mechanisms provided by HealthKit and Google Fit API instead of continuous polling
2. THE Mobile Application SHALL limit AI Brain Service requests to a maximum of one request per 24-hour period
3. WHEN the Mobile Application is in the background, THE Mobile Application SHALL reduce animation frame rates to 10 frames per second or lower
4. THE Mobile Application SHALL consume less than 5 percent of total device battery capacity over a 24-hour period during normal usage
5. WHEN the device enters low power mode, THE Mobile Application SHALL pause all non-essential background data fetching

### Requirement 11: Privacy and Data Security

**User Story:** As a user sharing sensitive health information, I want my data to be handled securely and transparently, so that I can trust Symbi with my personal biometric information.

#### Acceptance Criteria

1. THE Mobile Application SHALL display a privacy policy during onboarding that explains what health data is collected and how it is used
2. THE Mobile Application SHALL transmit all health data to the AI Brain Service using TLS 1.3 or higher encryption
3. THE Mobile Application SHALL not store raw health data on remote servers for longer than 24 hours after processing
4. WHEN the user deletes their account, THE Mobile Application SHALL permanently delete all associated health data from local storage and remote servers within 7 days
5. THE Mobile Application SHALL allow users to export their complete health data history in JSON format at any time

### Requirement 12: Visual Design and Theming

**User Story:** As a user who enjoys Halloween aesthetics, I want my Symbi to have a spooky yet cute appearance, so that the app feels unique and seasonally appropriate.

#### Acceptance Criteria

1. THE Mobile Application SHALL render the Symbi as a ghost creature based on the Kiro ghost design
2. THE Mobile Application SHALL use a purple base color palette for the Symbi with hex values in the range #6B46C1 to #9333EA
3. THE Mobile Application SHALL incorporate bloody or scary visual elements such as dripping effects, glowing eyes, or ethereal trails appropriate for Halloween theming
4. THE Symbi SHALL maintain a cute aesthetic despite scary elements, with rounded shapes and expressive facial features
5. WHEN the Symbi is in negative emotional states, THE Mobile Application SHALL emphasize darker purple tones and more prominent scary elements

### Requirement 13: Onboarding Experience

**User Story:** As a first-time user, I want a clear and friendly introduction to Symbi's features, so that I understand how to care for my digital pet and why health data permissions are needed.

#### Acceptance Criteria

1. WHEN the Mobile Application launches for the first time, THE Mobile Application SHALL display an onboarding flow with 3 to 5 screens explaining core concepts
2. THE Mobile Application SHALL explain the connection between health data and the Symbi's emotional state using simple language and visual examples
3. WHEN requesting health data permissions, THE Mobile Application SHALL display specific explanations for each data type such as "We use your Sleep Data to know if your Symbi is rested"
4. THE Mobile Application SHALL allow users to skip onboarding and access the main application screen at any point
5. THE Mobile Application SHALL provide access to replay the onboarding tutorial from the settings menu

### Requirement 14: Error Handling and Offline Support

**User Story:** As a user who may experience connectivity issues, I want Symbi to continue functioning with cached data, so that my digital pet remains responsive even without an internet connection.

#### Acceptance Criteria

1. WHEN the Mobile Application cannot reach the AI Brain Service, THE Mobile Application SHALL display the most recently cached emotional state for the Symbi
2. WHEN health data cannot be retrieved from the Health Data Provider, THE Mobile Application SHALL display an error message with troubleshooting steps
3. THE Mobile Application SHALL cache the last 30 days of health data and emotional states in local storage
4. WHEN connectivity is restored after an offline period, THE Mobile Application SHALL synchronize any manually entered health data to cloud storage
5. IF an Evolution Event is triggered while offline, THEN THE Mobile Application SHALL queue the generation request and process it when connectivity is restored
