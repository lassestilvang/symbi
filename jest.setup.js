// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock react-native modules
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  },
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

// Mock react-native-health
jest.mock('react-native-health', () => ({
  default: {
    isAvailable: jest.fn((callback) => callback(null, true)),
    initHealthKit: jest.fn((permissions, callback) => callback(null)),
    getStepCount: jest.fn((options, callback) => callback(null, { value: 5000 })),
    getSleepSamples: jest.fn((options, callback) => callback(null, [])),
    getHeartRateVariabilitySamples: jest.fn((options, callback) => callback(null, [])),
    saveMindfulSession: jest.fn((options, callback) => callback(null)),
  },
}));

// Mock react-native-google-fit
jest.mock('react-native-google-fit', () => ({
  default: {
    authorize: jest.fn(() => Promise.resolve({ success: true })),
    isAuthorized: jest.fn(() => Promise.resolve(true)),
    getDailyStepCountSamples: jest.fn(() => Promise.resolve([])),
    getSleepSamples: jest.fn(() => Promise.resolve([])),
    getHeartRateSamples: jest.fn(() => Promise.resolve([])),
    saveActivity: jest.fn(() => Promise.resolve()),
    startRecording: jest.fn(() => Promise.resolve()),
  },
}));
