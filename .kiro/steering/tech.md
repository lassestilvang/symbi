---
inclusion: always
---

# Technology Stack & Code Standards

## Core Dependencies

| Package             | Version | Purpose                            |
| ------------------- | ------- | ---------------------------------- |
| React Native        | 0.81.5  | Mobile framework via Expo ~54.0.22 |
| TypeScript          | 5.9.2   | Strict mode, no `any` types        |
| React               | 19.2.0  | UI library                         |
| Zustand             | 5.0.8   | State management                   |
| React Navigation    | 7.x     | Native stack navigator             |
| Lottie React Native | 7.3.4   | Symbi animations                   |

## TypeScript Rules (Strict)

- Never use `any` type - use `unknown`, generics, or proper interfaces
- Enable all strict compiler options
- Use `import type { X }` for type-only imports
- Define return types explicitly on exported functions

## Code Style (Enforced)

```
Quotes:       single
Semicolons:   required
Line width:   100 characters max
Indentation:  2 spaces
Trailing:     commas (ES5 style)
Arrow parens: avoid when possible
```

## Required Path Aliases

Always use these instead of relative imports:

| Alias           | Maps to            |
| --------------- | ------------------ |
| `@components/*` | `src/components/*` |
| `@services/*`   | `src/services/*`   |
| `@hooks/*`      | `src/hooks/*`      |
| `@types/*`      | `src/types/*`      |
| `@assets/*`     | `src/assets/*`     |

## Platform Implementation

| Platform | Health API                | Min Version | Key Permission        |
| -------- | ------------------------- | ----------- | --------------------- |
| iOS      | `react-native-health`     | iOS 14.0    | HealthKit entitlement |
| Android  | `react-native-google-fit` | API 26      | ACTIVITY_RECOGNITION  |

Bundle ID: `com.symbi.app`

## Gemini API (Phase 2+)

| Setting    | Value                              |
| ---------- | ---------------------------------- |
| Analysis   | `gemini-2.5-flash-preview-09-2025` |
| Images     | `gemini-2.5-flash-image-preview`   |
| Timeout    | 10 seconds with fallback           |
| Rate limit | 1 request per 24 hours per user    |
| Security   | TLS 1.3 required                   |

## Performance Targets

| Metric        | Target                     |
| ------------- | -------------------------- |
| Memory        | <100MB                     |
| Battery       | <5% per 24 hours           |
| Animation FPS | 60 active, 10 backgrounded |
| API response  | <5s (p95)                  |

## Commands

| Command              | Purpose                  |
| -------------------- | ------------------------ |
| `npm start`          | Expo dev server          |
| `npm run lint:fix`   | Fix linting issues       |
| `npm run format`     | Prettier formatting      |
| `npm test`           | Jest tests               |
| `npm run pre-submit` | All checks before submit |
