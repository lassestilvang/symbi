const React = require('react');

const ReactNative = {
  // Platform
  Platform: {
    OS: 'ios',
    Version: 14,
    select: jest.fn(obj => obj.ios || obj.default),
  },

  // StyleSheet
  StyleSheet: {
    create: jest.fn(styles => styles),
    flatten: jest.fn(styles => styles),
    hairlineWidth: 1,
  },

  // Dimensions
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 667, scale: 2, fontScale: 1 })),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
  },

  // AppState
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
  },

  // Animated
  Animated: {
    Value: jest.fn().mockImplementation(value => ({
      setValue: jest.fn(),
      setOffset: jest.fn(),
      flattenOffset: jest.fn(),
      extractOffset: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
      stopAnimation: jest.fn(),
      resetAnimation: jest.fn(),
      interpolate: jest.fn(() => ({ setValue: jest.fn() })),
      animate: jest.fn(),
      _value: value,
    })),
    timing: jest.fn(() => ({
      start: jest.fn(callback => callback && callback({ finished: true })),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
    spring: jest.fn(() => ({
      start: jest.fn(callback => callback && callback({ finished: true })),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
    decay: jest.fn(() => ({
      start: jest.fn(callback => callback && callback({ finished: true })),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
    sequence: jest.fn(() => ({
      start: jest.fn(callback => callback && callback({ finished: true })),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
    parallel: jest.fn(() => ({
      start: jest.fn(callback => callback && callback({ finished: true })),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
    stagger: jest.fn(() => ({
      start: jest.fn(callback => callback && callback({ finished: true })),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
    loop: jest.fn(() => ({
      start: jest.fn(callback => callback && callback({ finished: true })),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
    delay: jest.fn(() => ({
      start: jest.fn(callback => callback && callback({ finished: true })),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
    event: jest.fn(),
    View: React.forwardRef((props, ref) => React.createElement('View', { ...props, ref })),
    Text: React.forwardRef((props, ref) => React.createElement('Text', { ...props, ref })),
    Image: React.forwardRef((props, ref) => React.createElement('Image', { ...props, ref })),
    ScrollView: React.forwardRef((props, ref) =>
      React.createElement('ScrollView', { ...props, ref })
    ),
    FlatList: React.forwardRef((props, ref) => React.createElement('FlatList', { ...props, ref })),
  },

  // Components
  View: React.forwardRef((props, ref) => React.createElement('View', { ...props, ref })),
  Text: React.forwardRef((props, ref) => React.createElement('Text', { ...props, ref })),
  TextInput: React.forwardRef((props, ref) => React.createElement('TextInput', { ...props, ref })),
  ScrollView: React.forwardRef((props, ref) =>
    React.createElement('ScrollView', { ...props, ref })
  ),
  TouchableOpacity: React.forwardRef((props, ref) =>
    React.createElement('TouchableOpacity', { ...props, ref })
  ),
  TouchableHighlight: React.forwardRef((props, ref) =>
    React.createElement('TouchableHighlight', { ...props, ref })
  ),
  TouchableWithoutFeedback: React.forwardRef((props, ref) =>
    React.createElement('TouchableWithoutFeedback', { ...props, ref })
  ),
  Pressable: React.forwardRef((props, ref) => React.createElement('Pressable', { ...props, ref })),
  SafeAreaView: React.forwardRef((props, ref) =>
    React.createElement('SafeAreaView', { ...props, ref })
  ),
  ActivityIndicator: React.forwardRef((props, ref) =>
    React.createElement('ActivityIndicator', { ...props, ref })
  ),
  Image: React.forwardRef((props, ref) => React.createElement('Image', { ...props, ref })),
  ImageBackground: React.forwardRef((props, ref) =>
    React.createElement('ImageBackground', { ...props, ref }, props.children)
  ),
  FlatList: React.forwardRef((props, ref) => React.createElement('FlatList', { ...props, ref })),
  SectionList: React.forwardRef((props, ref) =>
    React.createElement('SectionList', { ...props, ref })
  ),
  Modal: React.forwardRef((props, ref) => React.createElement('Modal', { ...props, ref })),
  RefreshControl: React.forwardRef((props, ref) =>
    React.createElement('RefreshControl', { ...props, ref })
  ),
  Switch: React.forwardRef((props, ref) => React.createElement('Switch', { ...props, ref })),
  Button: React.forwardRef((props, ref) => React.createElement('Button', { ...props, ref })),

  // APIs
  Alert: {
    alert: jest.fn(),
    prompt: jest.fn(),
  },
  Share: {
    share: jest.fn(() => Promise.resolve({ action: 'sharedAction' })),
  },
  Vibration: {
    vibrate: jest.fn(),
    cancel: jest.fn(),
  },
  Linking: {
    openURL: jest.fn(() => Promise.resolve()),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    getInitialURL: jest.fn(() => Promise.resolve(null)),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  Keyboard: {
    dismiss: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeListener: jest.fn(),
  },
  PixelRatio: {
    get: jest.fn(() => 2),
    getFontScale: jest.fn(() => 1),
    getPixelSizeForLayoutSize: jest.fn(size => size * 2),
    roundToNearestPixel: jest.fn(size => Math.round(size)),
  },
  BackHandler: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
    exitApp: jest.fn(),
  },
  NativeModules: {},
  NativeEventEmitter: jest.fn().mockImplementation(() => ({
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
  })),
  findNodeHandle: jest.fn(),
};

module.exports = ReactNative;
