// Mock localStorage for Jest environment
global.localStorage = {
  getItem: jest.fn((key) => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock React Native __DEV__ global
global.__DEV__ = true;

// Mock AsyncStorage with in-memory storage
let mockStorage = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn((key, value) => {
    mockStorage[key] = value;
    return Promise.resolve();
  }),
  getItem: jest.fn((key) => {
    return Promise.resolve(mockStorage[key] || null);
  }),
  removeItem: jest.fn((key) => {
    delete mockStorage[key];
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    mockStorage = {};
    return Promise.resolve();
  }),
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
  StyleSheet: {
    create: jest.fn((styles) => styles),
    flatten: jest.fn((styles) => styles),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 667 })),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  Animated: {
    Value: jest.fn().mockImplementation(() => ({
      setValue: jest.fn(),
      interpolate: jest.fn(() => ({ setValue: jest.fn() })),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
    })),
    timing: jest.fn(() => ({
      start: jest.fn((callback) => callback && callback({ finished: true })),
    })),
    spring: jest.fn(() => ({
      start: jest.fn((callback) => callback && callback({ finished: true })),
    })),
    sequence: jest.fn(() => ({
      start: jest.fn((callback) => callback && callback({ finished: true })),
    })),
    parallel: jest.fn(() => ({
      start: jest.fn((callback) => callback && callback({ finished: true })),
    })),
    View: 'Animated.View',
    Text: 'Animated.Text',
  },
  Vibration: {
    vibrate: jest.fn(),
  },
  View: 'View',
  Text: 'Text',
  ScrollView: 'ScrollView',
  TouchableOpacity: 'TouchableOpacity',
  SafeAreaView: 'SafeAreaView',
  ActivityIndicator: 'ActivityIndicator',
  Pressable: 'Pressable',
  Modal: 'Modal',
  RefreshControl: 'RefreshControl',
  Alert: {
    alert: jest.fn(),
  },
  Share: {
    share: jest.fn(() => Promise.resolve({ action: 'sharedAction' })),
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

// Mock expo-crypto
jest.mock('expo-crypto', () => ({
  digestStringAsync: jest.fn((algorithm, data) => 
    Promise.resolve('mocked-hash-' + data.substring(0, 10))
  ),
  CryptoDigestAlgorithm: {
    SHA256: 'SHA256',
    SHA512: 'SHA512',
  },
  getRandomBytes: jest.fn((length) => {
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return bytes;
  }),
  getRandomBytesAsync: jest.fn((length) => {
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return Promise.resolve(bytes);
  }),
}));

// Mock lottie-react-native
jest.mock('lottie-react-native', () => {
  const React = require('react');
  return React.forwardRef((props, ref) => {
    return React.createElement('View', { ...props, ref });
  });
});

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  Paths: {
    cache: { uri: 'file:///mock/cache/' },
    document: { uri: 'file:///mock/documents/' },
    bundle: { uri: 'file:///mock/bundle/' },
  },
  File: jest.fn().mockImplementation((path, ...segments) => ({
    uri: `${path.uri || path}/${segments.join('/')}`,
    write: jest.fn(() => Promise.resolve()),
    read: jest.fn(() => Promise.resolve('{}')),
    delete: jest.fn(() => Promise.resolve()),
    exists: jest.fn(() => Promise.resolve(true)),
  })),
  Directory: jest.fn().mockImplementation((path, ...segments) => ({
    uri: `${path.uri || path}/${segments.join('/')}`,
    create: jest.fn(() => Promise.resolve()),
    delete: jest.fn(() => Promise.resolve()),
    exists: jest.fn(() => Promise.resolve(true)),
  })),
}));

// Mock expo-sharing
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn(() => Promise.resolve()),
}));

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  setUser: jest.fn(),
  setContext: jest.fn(),
  setTag: jest.fn(),
  setExtra: jest.fn(),
  withScope: jest.fn((callback) => callback({ setTag: jest.fn(), setExtra: jest.fn() })),
}));
