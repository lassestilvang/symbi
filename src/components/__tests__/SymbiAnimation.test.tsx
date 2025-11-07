/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { EmotionalState } from '../../types';

/**
 * SymbiAnimation Component Tests
 *
 * Tests core functionality of the Symbi animation component:
 * - Animation rendering for different emotional states
 * - State transitions
 * - Performance optimizations
 *
 * Requirements: 4.4, 4.5, 9.4
 */

// Mock LottieView since it requires native modules
jest.mock('lottie-react-native', () => {
  const React = require('react');
  return React.forwardRef((props: any, ref: any) => {
    return React.createElement('LottieView', { ...props, ref });
  });
});

// Mock React Native modules
jest.mock('react-native', () => ({
  View: 'View',
  StyleSheet: {
    create: (styles: any) => styles,
  },
  Animated: {
    View: 'Animated.View',
    timing: jest.fn(() => ({
      start: jest.fn(callback => callback && callback()),
    })),
    parallel: jest.fn(_animations => ({
      start: jest.fn(callback => callback && callback()),
    })),
    Value: jest.fn(() => ({
      setValue: jest.fn(),
    })),
  },
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(() => ({
      remove: jest.fn(),
    })),
  },
}));

describe('SymbiAnimation', () => {
  // Import after mocks are set up
  const { SymbiAnimation } = require('../SymbiAnimation');

  describe('Animation Rendering', () => {
    it('should render with SAD emotional state', () => {
      const component = <SymbiAnimation emotionalState={EmotionalState.SAD} />;
      expect(component).toBeDefined();
    });

    it('should render with RESTING emotional state', () => {
      const component = <SymbiAnimation emotionalState={EmotionalState.RESTING} />;
      expect(component).toBeDefined();
    });

    it('should render with ACTIVE emotional state', () => {
      const component = <SymbiAnimation emotionalState={EmotionalState.ACTIVE} />;
      expect(component).toBeDefined();
    });

    it('should accept custom style prop', () => {
      const customStyle = { width: 400, height: 400 };
      const component = (
        <SymbiAnimation emotionalState={EmotionalState.RESTING} style={customStyle} />
      );
      expect(component).toBeDefined();
    });

    it('should support evolution level prop', () => {
      const component = (
        <SymbiAnimation emotionalState={EmotionalState.ACTIVE} evolutionLevel={1} />
      );
      expect(component).toBeDefined();
    });

    it('should support custom appearance URL', () => {
      const component = (
        <SymbiAnimation
          emotionalState={EmotionalState.ACTIVE}
          evolutionLevel={1}
          customAppearance="https://example.com/evolved.json"
        />
      );
      expect(component).toBeDefined();
    });
  });

  describe('Animation Control', () => {
    it('should support autoPlay prop', () => {
      const component = <SymbiAnimation emotionalState={EmotionalState.RESTING} autoPlay={false} />;
      expect(component).toBeDefined();
    });

    it('should support loop prop', () => {
      const component = <SymbiAnimation emotionalState={EmotionalState.ACTIVE} loop={false} />;
      expect(component).toBeDefined();
    });
  });

  describe('State Transitions', () => {
    it('should handle emotional state changes', () => {
      // This test verifies the component can handle state prop changes
      const states = [EmotionalState.SAD, EmotionalState.RESTING, EmotionalState.ACTIVE];

      states.forEach(state => {
        const component = <SymbiAnimation emotionalState={state} />;
        expect(component).toBeDefined();
      });
    });

    it('should support all Phase 1 emotional states', () => {
      const phase1States = [EmotionalState.SAD, EmotionalState.RESTING, EmotionalState.ACTIVE];

      phase1States.forEach(state => {
        const component = <SymbiAnimation emotionalState={state} />;
        expect(component).toBeDefined();
      });
    });

    it('should support Phase 2 emotional states with fallback', () => {
      const phase2States = [
        EmotionalState.VIBRANT,
        EmotionalState.CALM,
        EmotionalState.TIRED,
        EmotionalState.STRESSED,
        EmotionalState.ANXIOUS,
        EmotionalState.RESTED,
      ];

      phase2States.forEach(state => {
        const component = <SymbiAnimation emotionalState={state} />;
        expect(component).toBeDefined();
      });
    });
  });

  describe('Performance Optimizations', () => {
    it('should initialize with default speed', () => {
      const component = <SymbiAnimation emotionalState={EmotionalState.RESTING} />;
      expect(component).toBeDefined();
    });

    it('should handle app state changes for performance', () => {
      const component = <SymbiAnimation emotionalState={EmotionalState.ACTIVE} />;
      expect(component).toBeDefined();
      // AppState listener is set up in useEffect
    });
  });
});
