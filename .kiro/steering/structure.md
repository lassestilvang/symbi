---
inclusion: always
---

# Project Structure

## Directory Layout

| Directory | Purpose |
|-----------|---------|
| `src/components/` | Reusable UI components with barrel exports via `index.ts` |
| `src/screens/` | Full-screen views including `onboarding/` submodule |
| `src/services/` | Business logic, external integrations, platform abstractions |
| `src/stores/` | Zustand state stores (`healthDataStore`, `userPreferencesStore`, `symbiStateStore`) |
| `src/hooks/` | Custom React hooks for shared logic |
| `src/navigation/` | React Navigation stack configuration |
| `src/types/` | TypeScript interfaces and Result type definitions |
| `src/constants/` | Theme colors, metric configs in `theme.ts` |
| `src/utils/` | Date and metric helper functions |
| `src/assets/` | Images and Lottie animations (`phase1/`, `phase2/`, `phase3/`) |
| `src/config/` | Sentry and other service configurations |

## Path Aliases

Always use these aliases instead of relative paths:
- `@components/*` → `src/components/*`
- `@services/*` → `src/services/*`
- `@hooks/*` → `src/hooks/*`
- `@types/*` → `src/types/*`
- `@assets/*` → `src/assets/*`

## Architecture Patterns

**Service Layer**: External integrations abstracted through service interfaces. Platform-specific implementations (HealthKit/Google Fit) use factory pattern.

**Store Pattern**: Zustand stores with AsyncStorage persistence. Use selector-based subscriptions to minimize re-renders.

**Component Organization**: Barrel exports via `index.ts`. Tests co-located in `__tests__/` directories.

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `SymbiAnimation.tsx` |
| Services | PascalCase | `HealthDataService.ts` |
| Stores | camelCase | `healthDataStore.ts` |
| Hooks | camelCase with `use` prefix | `useSymbiAnimation.ts` |
| Tests | `.test.tsx` or `.test.ts` suffix | `SymbiAnimation.test.tsx` |

## Import Order (Enforced)

1. React and React Native imports
2. Third-party libraries
3. Path alias imports (`@components`, `@services`, etc.)
4. Relative imports
5. Type imports (use `import type` when possible)

## Code Patterns

**State Management**:
- Global state → Zustand stores
- Local component state → `useState`, `useEffect`
- Never prop drill; access stores directly in nested components

**Error Handling**:
- Services return `Result` types or throw typed errors
- UI components must handle errors with fallbacks
- Log errors via `ErrorReportingService`
- Never log raw health data (sanitize first)

**New Files**:
- Add exports to the directory's `index.ts` barrel file
- Place tests in adjacent `__tests__/` folder
- Follow existing patterns in the same directory

## Key Files Reference

| Need | File |
|------|------|
| Health data flow | `src/services/HealthDataService.ts` |
| Emotional state logic | `src/services/EmotionalStateCalculator.ts` |
| Theme colors | `src/constants/theme.ts` |
| Type definitions | `src/types/index.ts` |
| Main app screen | `src/screens/MainScreen.tsx` |
| Symbi animation | `src/components/SymbiAnimation.tsx` or `Symbi8BitCanvas.tsx` |
