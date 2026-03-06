# Implementation Plan

- [x] 1. Set up habitat infrastructure and types
  - [x] 1.1 Create habitat type definitions and interfaces
    - Create `src/types/habitat.ts` with all TypeScript interfaces (SceneType, TimePhase, QualityLevel, HabitatConfig, etc.)
    - Export types from `src/types/index.ts`
    - _Requirements: 1.1, 5.1_

  - [ ]\* 1.2 Write property test for time phase calculation
    - **Property 4: Time Phase Calculation**
    - **Validates: Requirements 3.1**

  - [x] 1.3 Implement TimeManager utility
    - Create `src/utils/TimeManager.ts` with getTimePhase function
    - Implement time phase boundaries (Dawn: 5-8, Day: 8-17, Dusk: 17-20, Night: 20-5)
    - Add getTimePhaseColors function returning appropriate color configurations
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]\* 1.4 Write unit tests for TimeManager
    - Test boundary hours (5am, 8am, 5pm, 8pm)
    - Test color configurations for each phase
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 2. Implement scene configuration system
  - [x] 2.1 Create scene definitions
    - Create `src/constants/habitatScenes.ts` with scene definitions
    - Define Haunted Forest scene with trees, leaves, fog, creatures
    - Define Moonlit Graveyard scene with tombstones, fences, wisps, moon
    - Define Spooky Mansion scene with mansion, windows, candles
    - _Requirements: 5.2, 5.3, 5.4_

  - [ ]\* 2.2 Write property test for ambient element count
    - **Property 2: Ambient Element Minimum Count**
    - **Validates: Requirements 1.4**

  - [x] 2.3 Implement emotional state modifiers
    - Create `src/utils/getSceneModifiers.ts` function
    - Implement modifier calculations for each emotional state
    - SAD: darker, slower; ACTIVE/VIBRANT: brighter, faster; CALM/RESTED: soft, gentle
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

  - [ ]\* 2.4 Write property test for emotional state modifiers
    - **Property 3: Emotional State Scene Modifiers**
    - **Validates: Requirements 2.2, 2.3, 2.4**

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement quality and performance system
  - [x] 4.1 Create quality settings utility
    - Create `src/utils/getQualitySettings.ts` function
    - Implement quality level constraints (low, medium, high)
    - Handle reducedMotion preference
    - _Requirements: 6.1, 6.3, 6.4_

  - [ ]\* 4.2 Write property test for quality settings
    - **Property 6: Quality Settings Constraints**
    - **Validates: Requirements 6.1, 6.3, 6.4**

  - [x] 4.3 Implement PerformanceMonitor hook
    - Create `src/hooks/usePerformanceMonitor.ts`
    - Monitor FPS using requestAnimationFrame
    - Detect low performance and trigger quality reduction
    - Handle browser visibility changes to pause animations
    - _Requirements: 6.2, 6.5_

  - [ ]\* 4.4 Write unit tests for PerformanceMonitor
    - Test FPS detection
    - Test visibility change handling
    - _Requirements: 6.2_

- [x] 5. Implement core rendering components
  - [x] 5.1 Create ParallaxLayer component
    - Create `src/components/habitat/ParallaxLayer.tsx`
    - Implement depth-based parallax scrolling
    - Support animated offset values
    - _Requirements: 1.2_

  - [ ]\* 5.2 Write property test for parallax layer count
    - **Property 1: Parallax Layer Count**
    - **Validates: Requirements 1.2**

  - [x] 5.3 Create AmbientElement component
    - Create `src/components/habitat/AmbientElement.tsx`
    - Implement animated decorative elements (trees, tombstones, bats, etc.)
    - Support emotional state modifiers for animation speed
    - _Requirements: 1.4, 2.2, 2.3, 2.4_

  - [x] 5.4 Create ParticleSystem component
    - Create `src/components/habitat/ParticleSystem.tsx`
    - Implement particle generation and lifecycle management
    - Support different particle types (fog, sparkles, fireflies, leaves)
    - Respect quality settings for particle count
    - _Requirements: 1.3, 2.2, 2.3, 2.4, 6.1_

  - [ ]\* 5.5 Write unit tests for ParticleSystem
    - Test particle creation within bounds
    - Test particle lifecycle and removal
    - Test quality-based particle limits
    - _Requirements: 1.3, 6.1_

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement scene renderer and transitions
  - [x] 7.1 Create SceneRenderer component
    - Create `src/components/habitat/SceneRenderer.tsx`
    - Compose parallax layers, ambient elements, and particle systems
    - Apply time phase colors and emotional modifiers
    - _Requirements: 1.1, 1.2, 1.4, 2.1, 3.1_

  - [ ]\* 7.2 Write property test for color palette validation
    - **Property 5: Color Palette Validation**
    - **Validates: Requirements 5.5**

  - [x] 7.3 Implement scene transitions
    - Add transition animations for time phase changes (3 seconds)
    - Add crossfade for emotional state changes (1.5 seconds)
    - Handle simultaneous transitions smoothly
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]\* 7.4 Write unit tests for scene transitions
    - Test transition duration configurations
    - Test simultaneous transition handling
    - _Requirements: 4.1, 4.2_

- [x] 8. Implement interaction system
  - [x] 8.1 Create interaction effect handlers
    - Create `src/hooks/useHabitatInteraction.ts`
    - Implement click/tap particle burst effect
    - Implement ripple effect for Symbi poke
    - Ensure effects complete within 1 second
    - _Requirements: 7.1, 7.3, 7.4_

  - [ ]\* 8.2 Write property test for interaction effect position
    - **Property 7: Interaction Effect Position**
    - **Validates: Requirements 7.1**

  - [ ]\* 8.3 Write unit tests for interaction effects
    - Test effect creation at click position
    - Test effect duration
    - _Requirements: 7.1, 7.4_

- [x] 9. Implement preference persistence
  - [x] 9.1 Create habitat preferences service
    - Create `src/services/HabitatPreferencesService.ts`
    - Implement saveScenePreference and loadScenePreference functions
    - Handle storage errors gracefully with fallback to defaults
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]\* 9.2 Write property test for preference persistence round-trip
    - **Property 8: Scene Preference Persistence Round-Trip**
    - **Validates: Requirements 8.1, 8.2**

  - [ ]\* 9.3 Write unit tests for preference persistence
    - Test save and load operations
    - Test default scene when no preference exists
    - Test graceful handling of storage errors
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Integrate HabitatManager and MainScreen
  - [x] 11.1 Create HabitatManager component
    - Create `src/components/habitat/HabitatManager.tsx`
    - Orchestrate SceneRenderer, TimeManager, and PerformanceMonitor
    - Connect to emotional state from healthDataStore
    - Handle visibility changes and reduced motion preferences
    - _Requirements: 1.1, 2.1, 3.1, 6.2, 6.3_

  - [x] 11.2 Create habitat barrel exports
    - Create `src/components/habitat/index.ts` with all exports
    - Export HabitatManager, SceneRenderer, ParallaxLayer, AmbientElement, ParticleSystem
    - _Requirements: 1.1_

  - [x] 11.3 Integrate habitat into MainScreen
    - Import HabitatManager into MainScreen
    - Position habitat behind Symbi character
    - Pass emotional state and interaction handlers
    - Ensure proper z-index layering
    - _Requirements: 1.1, 7.3_

  - [ ]\* 11.4 Write integration tests for MainScreen with habitat
    - Test habitat renders with MainScreen
    - Test emotional state changes update habitat
    - Test interaction effects trigger correctly
    - _Requirements: 1.1, 2.1, 7.1_

- [x] 12. Add scene selection UI
  - [x] 12.1 Create SceneSelector component
    - Create `src/components/habitat/SceneSelector.tsx`
    - Display scene thumbnails with names
    - Highlight currently selected scene
    - Save preference on selection
    - _Requirements: 8.1_

  - [x] 12.2 Add scene selection to Settings screen
    - Add "Habitat Scene" section to SettingsScreen
    - Include SceneSelector component
    - Show current scene preference
    - _Requirements: 8.1, 8.2_

- [x] 13. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
