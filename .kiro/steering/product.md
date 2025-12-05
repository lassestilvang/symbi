---
inclusion: always
---

# Symbi Product Context

Symbi is a Halloween-themed biometric tamagotchi app where a purple ghost creature reflects user health metrics through emotional states and animations.

## Core Concept

The Symbi character visually represents the user's wellness. When implementing features, always consider how changes affect this feedback loop:

**Health data → EmotionalStateCalculator → Symbi animation state → Visual feedback**

## Emotional States by Phase

| Phase | Metrics | Available States | Processing |
|-------|---------|------------------|------------|
| 1 (MVP) | Steps | Sad, Resting, Active | Rule-based thresholds in `EmotionalStateCalculator` |
| 2 | Steps, Sleep, HRV | +Vibrant, Calm, Tired, Stressed, Anxious, Rested | Gemini AI analysis |
| 3 | All + Activities | Evolution system | Cloud sync enabled |

When adding new emotional states, add corresponding Lottie animations to `src/assets/animations/phase{N}/`.

## Health Data Sources

- **iOS**: HealthKit via `HealthKitService`
- **Android**: Google Fit via `GoogleFitService`
- **Fallback**: Manual entry via `ManualHealthDataService`

All three sources must provide equivalent functionality. Manual entry is not a degraded experience.

## Animation Implementation

- Use Lottie JSON files from `src/assets/animations/`
- 8-bit pixel rendering: use `Symbi8BitCanvas` component
- Smooth animations: use `SymbiAnimation` component
- Frame rates: 60 FPS when active, 10 FPS when backgrounded
- Always import animation assets via `@assets/*` alias

## Visual Design Rules

| Element | Specification |
|---------|---------------|
| Primary colors | `#7C3AED` to `#9333EA` (purple palette) |
| Aesthetic | Spooky but cute, never scary |
| Color source | Always use `src/constants/theme.ts` |

## Privacy Requirements (Non-Negotiable)

1. Process health data locally first before any network calls
2. Never log raw health data to Sentry or analytics
3. Sanitize all health metrics before error reporting
4. Request permissions only after explaining why they're needed
5. App must work fully offline
6. Manual entry must be feature-complete (not a fallback)

## Performance Targets

| Metric | Target | Enforcement |
|--------|--------|-------------|
| Memory | <100MB | Monitor via `MemoryMonitor` service |
| Battery | <5% per 24 hours | Limit background sync frequency |
| UI latency | <1 second perceived | Use optimistic updates |

## When Modifying Symbi Behavior

1. Check `EmotionalStateCalculator` for state transition logic
2. Verify animation files exist for all states
3. Test with all three data sources (HealthKit, Google Fit, Manual)
4. Ensure offline functionality is preserved
5. Never expose raw health values in logs or error reports
