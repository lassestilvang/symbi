# Testing Configuration

## Overview

Symbi uses Jest as the primary testing framework with React Native preset for unit and integration testing. The configuration is optimized for TypeScript and React Native development.

## Jest Configuration

### File: `jest.config.js`

```javascript
module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|lottie-react-native|expo-.*)/)',
  ],
  testMatch: ['**/__tests__/**/*.(test|spec).(ts|tsx|js)'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/**/__tests__/**'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
};
```

## Key Configuration Details

### React Native Preset

The `preset: 'react-native'` configuration provides:

- React Native-specific module resolution
- Built-in mocks for React Native APIs
- Proper handling of React Native's module system
- Optimized for React Native's JavaScript environment

### Test Environment

**Environment**: `node`

The Node.js test environment is used instead of `jsdom` because:

- Better performance for React Native tests
- React Native doesn't run in a browser DOM
- Faster test execution
- Lower memory footprint

### Transform Configuration

**TypeScript Transform**: `ts-jest`

All `.ts` and `.tsx` files are transformed using ts-jest with:

- JSX support enabled (`jsx: 'react'`)
- ES module interop for better compatibility
- Synthetic default imports allowed

### Transform Ignore Patterns

The following packages are **not** ignored (they are transformed):

- `react-native` - Core React Native library
- `@react-native/*` - React Native community packages
- `@react-navigation/*` - Navigation libraries
- `lottie-react-native` - Animation library
- `expo-*` - All Expo packages

This ensures these packages are properly transformed from ES modules to CommonJS for Jest.

### Module Name Mapper

Path aliases are configured to match `tsconfig.json`:

- `@/*` → `src/*`

This allows tests to use the same import paths as the application code.

### Test File Patterns

Tests are discovered in:

- `**/__tests__/**/*.test.(ts|tsx|js)`
- `**/__tests__/**/*.spec.(ts|tsx|js)`

### Coverage Collection

Coverage is collected from:

- All files in `src/**/*.{ts,tsx}`

Coverage excludes:

- Type definition files (`*.d.ts`)
- Test files (`__tests__/**`)
- Node modules

## Setup File

### File: `jest.setup.js`

The setup file runs before each test suite and includes:

- React Native mock setup
- Global test utilities
- Custom matchers
- Environment configuration

## Running Tests

### Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- HealthDataService.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should calculate emotional state"
```

### Coverage Reports

Coverage reports are generated in:

- `coverage/` directory
- HTML report: `coverage/lcov-report/index.html`
- Text summary in terminal

### Coverage Targets

- **Overall**: 70%+ for critical business logic
- **Services**: 80%+ (core business logic)
- **Components**: 60%+ (UI components)
- **Utilities**: 90%+ (pure functions)

## Test Organization

### Directory Structure

```
src/
├── components/
│   ├── SymbiAnimation.tsx
│   └── __tests__/
│       └── SymbiAnimation.test.tsx
├── services/
│   ├── HealthDataService.ts
│   └── __tests__/
│       ├── HealthDataService.test.ts
│       ├── EmotionalStateCalculator.test.ts
│       └── EvolutionSystem.test.ts
└── stores/
    ├── healthDataStore.ts
    └── __tests__/
        └── healthDataStore.test.ts
```

### Test File Naming

- Component tests: `ComponentName.test.tsx`
- Service tests: `ServiceName.test.ts`
- Store tests: `storeName.test.ts`
- Utility tests: `utilityName.test.ts`

## Writing Tests

### Example: Service Test

```typescript
import { EmotionalStateCalculator } from '../EmotionalStateCalculator';
import { EmotionalState } from '@/types';

describe('EmotionalStateCalculator', () => {
  let calculator: EmotionalStateCalculator;

  beforeEach(() => {
    calculator = new EmotionalStateCalculator();
  });

  describe('calculateStateFromSteps', () => {
    it('should return SAD when steps below sad threshold', () => {
      const result = calculator.calculateStateFromSteps(1000, {
        sadThreshold: 2000,
        activeThreshold: 8000,
      });
      expect(result).toBe(EmotionalState.SAD);
    });

    it('should return RESTING when steps between thresholds', () => {
      const result = calculator.calculateStateFromSteps(5000, {
        sadThreshold: 2000,
        activeThreshold: 8000,
      });
      expect(result).toBe(EmotionalState.RESTING);
    });

    it('should return ACTIVE when steps above active threshold', () => {
      const result = calculator.calculateStateFromSteps(10000, {
        sadThreshold: 2000,
        activeThreshold: 8000,
      });
      expect(result).toBe(EmotionalState.ACTIVE);
    });
  });
});
```

### Example: Component Test

```typescript
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { SymbiAnimation } from '../SymbiAnimation';
import { EmotionalState } from '@/types';

describe('SymbiAnimation', () => {
  it('should render Lottie animation', () => {
    const { getByTestId } = render(
      <SymbiAnimation emotionalState={EmotionalState.ACTIVE} />
    );
    expect(getByTestId('symbi-animation')).toBeTruthy();
  });

  it('should change animation when emotional state changes', async () => {
    const { rerender, getByTestId } = render(
      <SymbiAnimation emotionalState={EmotionalState.RESTING} />
    );

    rerender(<SymbiAnimation emotionalState={EmotionalState.ACTIVE} />);

    await waitFor(() => {
      const animation = getByTestId('symbi-animation');
      expect(animation.props.source).toContain('active.json');
    });
  });
});
```

## Mocking

### React Native Mocks

React Native modules are automatically mocked by the preset. Custom mocks can be added in `__mocks__/` directory.

### Example: Mock Health Service

```typescript
// __mocks__/react-native-health.ts
export default {
  isAvailable: jest.fn(() => Promise.resolve(true)),
  requestPermissions: jest.fn(() => Promise.resolve(true)),
  getStepCount: jest.fn(() => Promise.resolve(5000)),
};
```

### Using Mocks in Tests

```typescript
import AppleHealthKit from 'react-native-health';

jest.mock('react-native-health');

describe('HealthKitService', () => {
  it('should fetch step count', async () => {
    (AppleHealthKit.getStepCount as jest.Mock).mockResolvedValue(5000);

    const service = new HealthKitService();
    const steps = await service.getStepCount(new Date(), new Date());

    expect(steps).toBe(5000);
  });
});
```

## Troubleshooting

### Common Issues

#### Issue: Transform errors for React Native modules

**Solution**: Ensure the module is included in `transformIgnorePatterns`:

```javascript
transformIgnorePatterns: ['node_modules/(?!(react-native|your-module)/)'];
```

#### Issue: Path alias not resolving

**Solution**: Check `moduleNameMapper` matches `tsconfig.json` paths:

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

#### Issue: Async tests timing out

**Solution**: Increase timeout or use `waitFor`:

```typescript
it('should complete async operation', async () => {
  await waitFor(() => expect(result).toBeDefined(), { timeout: 5000 });
});
```

#### Issue: Memory leaks in tests

**Solution**: Clean up in `afterEach`:

```typescript
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Descriptive Names**: Use clear, descriptive test names
3. **Arrange-Act-Assert**: Follow AAA pattern
4. **Mock External Dependencies**: Mock APIs, storage, etc.
5. **Test Behavior, Not Implementation**: Focus on what, not how
6. **Keep Tests Fast**: Avoid unnecessary delays
7. **Use Test Data Builders**: Create reusable test data factories
8. **Clean Up**: Always clean up after tests

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## References

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)
- [Testing React Native Apps](https://reactnative.dev/docs/testing-overview)

## Revision History

| Version | Date       | Changes                                                      |
| ------- | ---------- | ------------------------------------------------------------ |
| 1.0     | 2025-11-16 | Initial documentation with React Native preset configuration |
