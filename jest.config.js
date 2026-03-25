module.exports = {
  // File extensions to process
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // TypeScript transformation configuration
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

  // Transform React Native and Expo packages (they use ES modules)
  // Include zustand as it also uses ES modules
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|lottie-react-native|expo-.*|@expo|zustand)/)',
  ],

  // Test file patterns
  testMatch: ['**/__tests__/**/*.(test|spec).(ts|tsx|js)'],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/index.ts', // Exclude barrel exports from coverage
    '!src/types/**', // Exclude type definitions
  ],

  // Coverage threshold to maintain code quality
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Coverage output formats
  coverageReporters: ['text', 'lcov', 'html'],

  // Path aliases matching tsconfig.json
  moduleNameMapper: {
    '^react-native$': '<rootDir>/__mocks__/react-native.js',
    // Mock image imports
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@stores/(.*)$': '<rootDir>/src/stores/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',
    '^@navigation/(.*)$': '<rootDir>/src/navigation/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
  },

  // Setup files
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setupAfterEnv.js'],

  // Use jsdom environment for React Native Testing Library
  testEnvironment: 'jsdom',

  // Performance optimizations
  maxWorkers: '50%', // Use half of available CPU cores

  // Timeout for async tests (health data fetching can be slow)
  testTimeout: 10000,

  // Clear mocks between tests to prevent state leakage
  clearMocks: true,
  resetMocks: false, // Keep mock implementations
  restoreMocks: false,

  // Verbose output (set to true for debugging)
  verbose: false,
};
