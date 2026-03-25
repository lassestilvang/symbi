# Requirements Document

## Introduction

This feature adds a comprehensive Evolution History page to Symbi that displays historical health data and emotional states in various engaging visualizations. The page will be accessible via a link in the Evolution Progress box on the MainScreen, providing users with insights into their health journey through Halloween-themed data visualizations.

## Glossary

- **Symbi App**: The biometric tamagotchi mobile application
- **Evolution History Page**: A dedicated screen displaying historical health and emotional state data
- **Health Metrics**: Quantifiable health data including steps, sleep duration, HRV, and other biometric measurements
- **Emotional State**: The calculated mood of the Symbi creature based on health metrics (e.g., Sad, Resting, Active, Vibrant, Calm, Tired, Stressed, Anxious, Rested)
- **Evolution Event**: A milestone when Symbi transforms based on sustained health patterns
- **Data Visualization**: Graphical representation of data including charts, graphs, and tables
- **Time Range Filter**: User-selectable period for viewing historical data (e.g., 7 days, 30 days, 90 days, all time)
- **Halloween Theme**: Visual design elements incorporating spooky, ghost-like aesthetics with purple color palette (#7C3AED to #9333EA)

## Requirements

### Requirement 1

**User Story:** As a Symbi user, I want to access my evolution history from the MainScreen, so that I can review my health journey over time

#### Acceptance Criteria

1. WHEN the user taps the Evolution Progress box on MainScreen, THE Symbi App SHALL navigate to the Evolution History Page
2. THE Symbi App SHALL display a clearly visible link or button within the Evolution Progress box labeled "View History" or similar
3. THE Symbi App SHALL maintain the current Evolution Progress box functionality while adding the history navigation option
4. THE Symbi App SHALL use React Navigation to handle the screen transition with appropriate animation

### Requirement 2

**User Story:** As a Symbi user, I want to see my emotional state history in a timeline view, so that I can understand how my Symbi's mood has changed over time

#### Acceptance Criteria

1. THE Symbi App SHALL display a chronological timeline of emotional states on the Evolution History Page
2. THE Symbi App SHALL show each emotional state with its corresponding ghost icon or color representation
3. THE Symbi App SHALL include timestamps for each emotional state change
4. THE Symbi App SHALL apply Halloween-themed styling to the timeline visualization with purple gradients and spooky elements
5. WHEN the user taps on a timeline entry, THE Symbi App SHALL display detailed information about that emotional state period

### Requirement 3

**User Story:** As a Symbi user, I want to view my health metrics in graph format, so that I can visualize trends and patterns in my data

#### Acceptance Criteria

1. THE Symbi App SHALL display line graphs for continuous metrics (steps, sleep duration, HRV)
2. THE Symbi App SHALL use Halloween-themed colors for graph lines (purple, orange, green)
3. THE Symbi App SHALL include axis labels with appropriate units (steps, hours, ms)
4. THE Symbi App SHALL render graphs with smooth animations when the page loads
5. WHEN the user taps on a data point, THE Symbi App SHALL display the exact value and timestamp in a tooltip

### Requirement 4

**User Story:** As a Symbi user, I want to filter historical data by time range, so that I can focus on specific periods of interest

#### Acceptance Criteria

1. THE Symbi App SHALL provide time range filter options including "7 Days", "30 Days", "90 Days", and "All Time"
2. WHEN the user selects a time range filter, THE Symbi App SHALL update all visualizations to reflect the selected period within 500 milliseconds
3. THE Symbi App SHALL persist the selected time range filter using AsyncStorage
4. THE Symbi App SHALL default to "30 Days" view when the user first accesses the Evolution History Page
5. THE Symbi App SHALL display the currently selected time range prominently at the top of the page

### Requirement 5

**User Story:** As a Symbi user, I want to see my evolution milestones highlighted, so that I can celebrate my achievements

#### Acceptance Criteria

1. THE Symbi App SHALL display a dedicated section for evolution milestones on the Evolution History Page
2. THE Symbi App SHALL show each evolution event with its date, trigger condition, and resulting Symbi form
3. THE Symbi App SHALL use special Halloween-themed badges or icons for milestone markers (e.g., tombstones, jack-o-lanterns)
4. THE Symbi App SHALL sort evolution milestones in reverse chronological order (newest first)
5. WHEN no evolution events exist, THE Symbi App SHALL display an encouraging message with a ghost icon

### Requirement 6

**User Story:** As a Symbi user, I want to view my data in a table format, so that I can see precise numerical values for each day

#### Acceptance Criteria

1. THE Symbi App SHALL provide a tabular view of daily health metrics including date, steps, sleep hours, HRV, and emotional state
2. THE Symbi App SHALL make the table scrollable vertically when data exceeds screen height
3. THE Symbi App SHALL alternate row colors with subtle Halloween-themed shading for readability
4. THE Symbi App SHALL format numerical values with appropriate precision (whole numbers for steps, one decimal for hours)
5. THE Symbi App SHALL display emotional states using both text labels and color-coded indicators

### Requirement 7

**User Story:** As a Symbi user, I want to see summary statistics, so that I can understand my overall health patterns

#### Acceptance Criteria

1. THE Symbi App SHALL calculate and display average values for steps, sleep duration, and HRV within the selected time range
2. THE Symbi App SHALL show the most frequent emotional state during the selected period
3. THE Symbi App SHALL display total evolution count and days since last evolution
4. THE Symbi App SHALL present statistics in Halloween-themed cards with ghost or pumpkin decorations
5. THE Symbi App SHALL update statistics automatically when the time range filter changes

### Requirement 8

**User Story:** As a Symbi user, I want the history page to load quickly, so that I can access my data without frustration

#### Acceptance Criteria

1. THE Symbi App SHALL load and display the Evolution History Page within 2 seconds on devices with at least 2GB RAM
2. THE Symbi App SHALL show a Halloween-themed loading indicator (e.g., floating ghost) while data is being retrieved
3. THE Symbi App SHALL retrieve historical data from local storage (AsyncStorage) without requiring network access
4. THE Symbi App SHALL implement pagination or lazy loading when displaying more than 90 days of data
5. WHEN data retrieval fails, THE Symbi App SHALL display an error message with a retry option

### Requirement 9

**User Story:** As a Symbi user, I want the history page to work in both portrait and landscape orientations, so that I can view data comfortably

#### Acceptance Criteria

1. THE Symbi App SHALL adapt the layout of the Evolution History Page for both portrait and landscape orientations
2. WHEN in landscape mode, THE Symbi App SHALL display graphs with increased width for better visibility
3. THE Symbi App SHALL maintain readability of text and labels in both orientations
4. THE Symbi App SHALL reflow content smoothly when orientation changes occur
5. THE Symbi App SHALL preserve scroll position and filter selections during orientation changes

### Requirement 10

**User Story:** As a Symbi user, I want to navigate back to the MainScreen easily, so that I can return to viewing my current Symbi state

#### Acceptance Criteria

1. THE Symbi App SHALL provide a back button or navigation gesture to return to MainScreen from the Evolution History Page
2. WHEN the user taps the back button, THE Symbi App SHALL navigate to MainScreen within 300 milliseconds
3. THE Symbi App SHALL use the standard React Navigation back behavior for platform consistency
4. THE Symbi App SHALL preserve the MainScreen state when returning from the Evolution History Page
5. THE Symbi App SHALL apply appropriate transition animation when navigating back
