---
inclusion: always
---

# Symbi Product Context

Symbi is a Halloween-themed biometric tamagotchi app. A purple ghost creature ("Symbi") reflects user health metrics through emotional states and animations.

## Data Flow

Health data → EmotionalStateCalculator → Symbi animation state → Visual feedback

## Phases & Emotional States

| Phase | Metrics | States | Logic |
|-------|---------|--------|-------|
| 1 (MVP) | Steps | Sad, Resting, Active | Rule-based thresholds |
| 2 | Steps, Sleep, HRV | +Vibrant, Calm, Tired, Stressed, Anxious, Rested | Gemini AI analysis |
| 3 | All + Activities | Evolution system | Cloud sync enabled |

## Implementation Rules

- Health data sources: HealthKit (iOS), Google Fit (Android), Manual entry
- All health processing happens locally first (privacy-first)
- Animations use Lottie JSON files in `src/assets/animations/`
- 8-bit pixel ghost renderer available via `Symbi8BitCanvas` component
- Background sync must be battery-efficient (<5% per 24 hours)
- UI updates should feel immediate (<1 second perceived latency)

## Visual Design Constraints

- Primary purple palette: `#7C3AED` to `#9333EA`
- Halloween aesthetic: spooky but cute, never scary
- Animation frame rate: 60 FPS active, 10 FPS backgrounded
- Use `src/constants/theme.ts` for all color values

## Privacy Requirements

- Never log raw health data to error reporting
- Sanitize all data before Sentry/analytics
- Explain permissions clearly before requesting
- Support full offline functionality
- Manual entry mode must be feature-complete alternative
