---
inclusion: always
---

# Project Structure

## Directory Layout

| Directory         | Purpose                                                     |
| ----------------- | ----------------------------------------------------------- |
| `src/components/` | Reusable UI components (barrel exports in `index.ts`)       |
| `src/screens/`    | Full-screen views; `onboarding/` is a submodule             |
| `src/services/`   | Business logic, external integrations, platform APIs        |
| `src/stores/`     | Zustand stores with AsyncStorage persistence                |
| `src/hooks/`      | Custom React hooks                                          |
| `src/navigation/` | React Navigation stack config                               |
| `src/types/`      | TypeScript interfaces and `Result` type                     |
| `src/constants/`  | Theme colors (`theme.ts`), metric configs                   |
| `src/utils/`      | Date and metric helpers                                     |
| `src/assets/`     | Images, Lottie animations (`phase1/`, `phase2/`, `phase3/`) |
| `src/config/`     | Sentry and service configurations                           |

## Path Aliases (Required)

Use these instead of relative paths:

```
@components/* → src/components/*
@services/*   → src/services/*
@hooks/*      → src/hooks/*
@types/*      → src/types/*
@assets/*     → src/assets/*
```

## File Naming

| Type       | Convention               | Example                   |
| ---------- | ------------------------ | ------------------------- |
| Components | PascalCase `.tsx`        | `SymbiAnimation.tsx`      |
| Services   | PascalCase `.ts`         | `HealthDataService.ts`    |
| Stores     | camelCase `.ts`          | `healthDataStore.ts`      |
| Hooks      | `use` prefix, camelCase  | `useSymbiAnimation.ts`    |
| Tests      | `.test.tsx` / `.test.ts` | `SymbiAnimation.test.tsx` |

## Import Order

1. React / React Native
2. Third-party libraries
3. Path alias imports (`@components`, `@services`, etc.)
4. Relative imports
5. Type imports (`import type`)

## Architecture Patterns

**Services**: Abstract external integrations. Platform-specific code (HealthKit/Google Fit) uses factory pattern.

**Stores**: Zustand with AsyncStorage. Use selectors to minimize re-renders.

**Components**: Barrel exports via `index.ts`. Tests in `__tests__/` subdirectories.

## Code Patterns

**State**:

- Global → Zustand stores (access directly, no prop drilling)
- Local → `useState`, `useEffect`

**Errors**:

- Services return `Result` types or throw typed errors
- Components must show fallback UI on errors
- Log via `ErrorReportingService` (never log raw health data)

**Adding Files**:

- Export from directory's `index.ts`
- Tests go in `__tests__/` folder
- Match existing patterns in the directory

## Key Files

| Need                  | File                                                         |
| --------------------- | ------------------------------------------------------------ |
| Health data flow      | `src/services/HealthDataService.ts`                          |
| Emotional state logic | `src/services/EmotionalStateCalculator.ts`                   |
| Theme colors          | `src/constants/theme.ts`                                     |
| Type definitions      | `src/types/index.ts`                                         |
| Main screen           | `src/screens/MainScreen.tsx`                                 |
| Symbi animation       | `src/components/SymbiAnimation.tsx` or `Symbi8BitCanvas.tsx` |
