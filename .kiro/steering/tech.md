---
inclusion: always
---

# Technology Stack

## Core Dependencies

| Package             | Version | Purpose                              |
| ------------------- | ------- | ------------------------------------ |
| React Native        | 0.81.5  | Mobile framework via Expo ~54.0.22   |
| TypeScript          | 5.9.2   | Strict mode enabled - no `any` types |
| React               | 19.2.0  | UI library                           |
| Zustand             | 5.0.8   | State management                     |
| React Navigation    | 7.x     | Native stack navigator               |
| Lottie React Native | 7.3.4   | Symbi animations                     |

## Code Style Rules

When writing code, follow these conventions:

- Use single quotes, require semicolons
- 100 character max line width, 2 space indentation
- Trailing commas (ES5 style), avoid arrow parens when possible
- Always use path aliases: `@components/*`, `@services/*`, `@hooks/*`, `@types/*`, `@assets/*`
- Use `import type` for type-only imports

## Platform-Specific Implementation

**iOS**: HealthKit via `react-native-health`. Requires entitlement and background modes (fetch, processing). Min iOS 14.0.

**Android**: Google Fit via `react-native-google-fit`. Requires ACTIVITY_RECOGNITION permission. Min API 26.

**Both**: Bundle ID/Package is `com.symbi.app`.

## API Integration

Gemini API (Phase 2+):

- Analysis: `gemini-2.5-flash-preview-09-2025`
- Images: `gemini-2.5-flash-image-preview`
- 10 second timeout with fallback, TLS 1.3 required
- Rate limit: 1 request/24 hours/user

## Performance Constraints

| Metric        | Target                     |
| ------------- | -------------------------- |
| Memory        | <100MB                     |
| Battery       | <5% per 24 hours           |
| Animation FPS | 60 active, 10 backgrounded |
| API response  | <5s (p95)                  |

## Commands Reference

```bash
npm start          # Expo dev server
npm run lint:fix   # Fix linting issues
npm run format     # Prettier formatting
npm test           # Jest tests
npm run pre-submit # All checks before submission
```
