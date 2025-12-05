# Implementation Plan

- [x] 1. Set up type definitions and storage infrastructure
  - [x] 1.1 Create achievement and gamification type definitions
    - Create `src/types/achievements.ts` with Achievement, AchievementCategory, RarityTier, UnlockCondition, AchievementProgress, AchievementStatistics interfaces
    - Create `src/types/streaks.ts` with StreakState, StreakRecord, StreakMilestone interfaces
    - Create `src/types/challenges.ts` with Challenge, ChallengeObjective, ChallengeReward interfaces
    - Create `src/types/cosmetics.ts` with Cosmetic, CosmeticCategory, CosmeticRenderData, EquippedCosmetics, CosmeticInventory interfaces
    - Export all types from `src/types/index.ts`
    - _Requirements: 1.5, 4.3, 6.1_

  - [x] 1.2 Write property test for achievement data round-trip
    - **Property 1: Achievement data round-trip consistency**
    - **Validates: Requirements 1.5, 1.6**

  - [x] 1.3 Write property test for cosmetic data round-trip
    - **Property 8: Cosmetic data round-trip consistency**
    - **Validates: Requirements 4.3, 4.4**

  - [x] 1.4 Extend StorageService with achievement and cosmetic storage methods
    - Add storage keys for achievements, streaks, challenges, cosmetics
    - Implement type-safe get/set methods for each data type
    - Add schema validation on load
    - _Requirements: 6.1, 6.2, 6.4_

- [x] 2. Implement AchievementService core functionality
  - [x] 2.1 Create AchievementService with achievement definitions
    - Create `src/services/AchievementService.ts`
    - Define achievement catalog with categories, rarity, unlock conditions
    - Implement `getAllAchievements()`, `getEarnedAchievements()`, `getAchievementsByCategory()`
    - _Requirements: 1.3, 7.1_

  - [x] 2.2 Implement milestone detection and achievement unlocking
    - Implement `checkMilestone(healthData)` to detect when thresholds are crossed
    - Implement `unlockAchievement(achievementId)` with persistence and cosmetic unlock
    - Implement `getAchievementProgress(achievementId)` for progress calculation
    - _Requirements: 1.1, 1.2, 1.4_

  - [x] 2.3 Write property test for milestone detection
    - **Property 2: Milestone detection correctness**
    - **Validates: Requirements 1.1**

  - [x] 2.4 Write property test for achievement progress calculation
    - **Property 3: Achievement progress calculation**
    - **Validates: Requirements 1.4**

  - [x] 2.5 Implement achievement statistics and filtering
    - Implement `getStatistics()` returning total earned, completion percentage, rarest badge
    - Implement `getCompletionPercentage()` calculation
    - Implement filtering by category, status, rarity
    - _Requirements: 7.1, 7.3, 7.4_

  - [x] 2.6 Write property test for statistics calculation
    - **Property 13: Statistics calculation accuracy**
    - **Validates: Requirements 7.1, 7.4**

  - [x] 2.7 Write property test for achievement filtering
    - **Property 12: Achievement filter correctness**
    - **Validates: Requirements 7.3**

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement StreakService
  - [x] 4.1 Create StreakService with core streak tracking
    - Create `src/services/StreakService.ts`
    - Implement `recordDailyProgress(date, metCriteria)` with increment/reset logic
    - Implement `getCurrentStreak()`, `getLongestStreak()`
    - Implement streak state persistence
    - _Requirements: 2.1, 2.2, 2.4_

  - [x] 4.2 Write property test for streak increment
    - **Property 4: Streak increment on criteria met**
    - **Validates: Requirements 2.1**

  - [x] 4.3 Write property test for streak reset
    - **Property 5: Streak reset on criteria missed**
    - **Validates: Requirements 2.2**

  - [x] 4.4 Implement streak milestone detection and achievement triggers
    - Define STREAK_MILESTONES constant (7, 14, 30, 60, 90 days)
    - Implement `getNextMilestone()`, `getDaysUntilMilestone()`
    - Implement `checkMilestoneReached()` that triggers achievement unlocks
    - Implement `recoverFromCorruption()` for graceful error recovery
    - _Requirements: 2.3, 2.4, 2.5_

  - [x] 4.5 Write property test for streak milestone triggers
    - **Property 6: Streak milestone triggers achievement**
    - **Validates: Requirements 2.3**

- [x] 5. Implement ChallengeService
  - [x] 5.1 Create ChallengeService with challenge generation
    - Create `src/services/ChallengeService.ts`
    - Implement `generateWeeklyChallenges(healthHistory)` based on user patterns
    - Implement `getActiveChallenges()`, `getTimeRemaining()`
    - _Requirements: 3.1, 3.4_

  - [x] 5.2 Implement challenge progress tracking and completion
    - Implement `updateChallengeProgress(challengeId, progress)` with real-time updates
    - Implement `completeChallenge(challengeId)` with reward distribution
    - Implement `checkAllCompleted()` for bonus achievement trigger
    - _Requirements: 3.2, 3.3, 3.5_

  - [x] 5.3 Write property test for challenge progress updates
    - **Property 7: Challenge progress updates correctly**
    - **Validates: Requirements 3.2, 3.5**

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement CosmeticService
  - [x] 7.1 Create CosmeticService with inventory management
    - Create `src/services/CosmeticService.ts`
    - Define cosmetic catalog with categories, rarity, render data
    - Implement `addToInventory(cosmetic)`, `getInventory()`, `getByCategory(category)`
    - _Requirements: 4.1, 4.2, 4.5_

  - [x] 7.2 Write property test for cosmetic unlock adds to inventory
    - **Property 9: Cosmetic unlock adds to inventory**
    - **Validates: Requirements 4.1**

  - [x] 7.3 Implement cosmetic equipment and rendering
    - Implement `equipCosmetic(cosmeticId)`, `unequipCosmetic(cosmeticId)`
    - Implement `getEquippedCosmetics()` returning current equipment state
    - Implement `getCosmeticLayers()` returning layers in correct z-order
    - Implement `getPreviewRender(cosmeticId)` for preview functionality
    - _Requirements: 5.2, 5.3, 5.5_

  - [x] 7.4 Write property test for cosmetic layer ordering
    - **Property 10: Cosmetic layer ordering**
    - **Validates: Requirements 5.5**

  - [x] 7.5 Write property test for equipped cosmetics persistence
    - **Property 11: Equipped cosmetics persistence**
    - **Validates: Requirements 5.3, 6.2**

- [x] 8. Implement NotificationService for achievements
  - [x] 8.1 Create NotificationService with queue management
    - Create `src/services/AchievementNotificationService.ts`
    - Implement notification queue with sequential display
    - Implement `showAchievementNotification(achievement)`
    - Implement `showStreakMilestoneNotification(milestone)`
    - Implement notification suppression when disabled
    - _Requirements: 8.1, 8.2, 8.4, 8.5_

  - [x] 8.2 Write property test for notification queue ordering
    - **Property 14: Notification queue ordering**
    - **Validates: Requirements 8.4**

  - [x] 8.3 Write property test for notification suppression
    - **Property 15: Notification suppression with recording**
    - **Validates: Requirements 8.5**

- [x] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Create Zustand stores for gamification state
  - [x] 10.1 Create achievementStore
    - Create `src/stores/achievementStore.ts`
    - Implement state for earned achievements, progress, statistics
    - Implement actions for unlocking, updating progress
    - Integrate with AchievementService
    - _Requirements: 1.2, 1.3, 7.1_

  - [x] 10.2 Create streakStore
    - Create `src/stores/streakStore.ts`
    - Implement state for current streak, longest streak, history
    - Implement actions for recording daily progress
    - Integrate with StreakService
    - _Requirements: 2.1, 2.4_

  - [x] 10.3 Create cosmeticStore
    - Create `src/stores/cosmeticStore.ts`
    - Implement state for inventory, equipped cosmetics
    - Implement actions for equipping, unequipping
    - Integrate with CosmeticService
    - _Requirements: 4.1, 5.3_

- [x] 11. Build UI components for Customization Studio
  - [x] 11.1 Create CosmeticRenderer component
    - Create `src/components/CosmeticRenderer.tsx`
    - Extend Symbi8BitCanvas to render equipped cosmetics
    - Implement layer-based rendering with correct z-order
    - Support preview mode for unequipped cosmetics
    - _Requirements: 5.2, 5.5_

  - [x] 11.2 Create CustomizationStudio screen
    - Create `src/screens/CustomizationStudioScreen.tsx`
    - Implement category tabs (hats, accessories, colors, backgrounds, themes)
    - Display unlocked cosmetics with equip/unequip buttons
    - Display locked cosmetics as silhouettes with unlock requirements
    - Integrate real-time Symbi preview with CosmeticRenderer
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 11.3 Create cosmetic item components
    - Create `src/components/CosmeticItem.tsx` for individual cosmetic display
    - Create `src/components/CosmeticGrid.tsx` for category grid layout
    - Implement rarity tier visual indicators
    - _Requirements: 4.5, 5.1, 5.4_

- [x] 12. Build UI components for Achievements
  - [x] 12.1 Create AchievementsScreen
    - Create `src/screens/AchievementsScreen.tsx`
    - Display earned badges organized by category
    - Show achievement progress for incomplete achievements
    - Display statistics (total earned, completion percentage, rarest badge)
    - _Requirements: 1.3, 1.4, 7.1, 7.2_

  - [x] 12.2 Create achievement display components
    - Create `src/components/AchievementBadge.tsx` for individual badge display
    - Create `src/components/AchievementProgress.tsx` for progress bars
    - Create `src/components/AchievementTimeline.tsx` for history view
    - Implement filtering UI by category, status, rarity
    - _Requirements: 1.3, 7.2, 7.3_

  - [x] 12.3 Create streak display components
    - Create `src/components/StreakDisplay.tsx` showing current streak, longest streak
    - Create `src/components/StreakMilestoneProgress.tsx` for days until next milestone
    - _Requirements: 2.4_

  - [x] 12.4 Create challenge display components
    - Create `src/components/ChallengeCard.tsx` for individual challenge display
    - Create `src/components/WeeklyChallenges.tsx` for challenge list
    - Show objective, progress, reward preview, time remaining
    - _Requirements: 3.4_

- [x] 13. Create notification UI components
  - [x] 13.1 Create NotificationToast component
    - Create `src/components/NotificationToast.tsx`
    - Implement toast notification with badge icon and achievement name
    - Implement celebration animation for streak milestones
    - Implement special unlock animation for rare cosmetics
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 13.2 Integrate notification system with app
    - Add NotificationToast to App.tsx or main layout
    - Connect to AchievementNotificationService
    - Implement notification queue display logic
    - _Requirements: 8.4_

- [x] 14. Integrate with existing systems
  - [x] 14.1 Connect health data flow to achievement system
    - Update HealthDataService to trigger achievement checks on data updates
    - Connect EmotionalStateCalculator results to streak tracking
    - Integrate with existing evolution system
    - _Requirements: 1.1, 2.1, 3.5_

  - [x] 14.2 Update MainScreen with gamification elements
    - Add streak display to MainScreen
    - Add quick access to achievements and customization
    - Update Symbi8BitCanvas to use CosmeticRenderer
    - _Requirements: 2.4, 5.5_

  - [x] 14.3 Add navigation routes
    - Add AchievementsScreen to AppNavigator
    - Add CustomizationStudioScreen to AppNavigator
    - Add navigation buttons/links from MainScreen
    - _Requirements: 1.3, 5.1_

- [x] 15. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Final integration and polish
  - [x] 16.1 Implement data export with gamification data
    - Update StorageService.exportAllData() to include achievements, streaks, challenges, cosmetics
    - _Requirements: 6.4_

  - [x] 16.2 Add error handling and recovery
    - Implement graceful degradation for storage failures
    - Add streak corruption recovery
    - Add fallback rendering for missing cosmetic assets
    - _Requirements: 2.5, 6.3_

  - [x] 16.3 Write integration tests for cross-service flows
    - Test achievement → cosmetic unlock flow
    - Test streak → achievement trigger flow
    - Test challenge completion → reward distribution
    - _Requirements: 1.2, 2.3, 3.3, 4.1_

- [x] 17. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
