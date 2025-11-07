/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { MainScreen } from '../MainScreen';
import { useHealthDataStore } from '../../stores/healthDataStore';
import { useSymbiStateStore } from '../../stores/symbiStateStore';
import { useUserPreferencesStore } from '../../stores/userPreferencesStore';
import { EmotionalState } from '../../types';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
};

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
}));

// Mock HealthDataUpdateService
jest.mock('../../services/HealthDataUpdateService', () => ({
  HealthDataUpdateService: {
    initialize: jest.fn().mockResolvedValue(undefined),
    updateDailyHealthData: jest.fn().mockResolvedValue(undefined),
    refreshHealthData: jest.fn().mockResolvedValue(undefined),
    getTodayHealthData: jest.fn().mockResolvedValue(null),
  },
}));

// Mock BackgroundSyncService
const mockStopBackgroundSync = jest.fn();
const mockStartBackgroundSync = jest.fn().mockResolvedValue(undefined);

// Create a singleton mock instance
const mockBackgroundSyncInstance = {
  startBackgroundSync: mockStartBackgroundSync,
  stopBackgroundSync: mockStopBackgroundSync,
  destroy: jest.fn(),
};

jest.mock('../../services/BackgroundSyncService', () => ({
  BackgroundSyncService: jest.fn().mockImplementation(() => mockBackgroundSyncInstance),
  getBackgroundSyncService: jest.fn(() => mockBackgroundSyncInstance),
}));

// Mock InteractiveSessionManager
jest.mock('../../services/InteractiveSessionManager', () => ({
  InteractiveSessionManager: jest.fn().mockImplementation(() => ({
    startSession: jest.fn().mockResolvedValue(undefined),
    pauseSession: jest.fn(),
    resumeSession: jest.fn(),
    completeSession: jest.fn().mockResolvedValue({ success: true }),
    cancelSession: jest.fn(),
  })),
  SessionType: {
    BREATHING_EXERCISE: 'breathing_exercise',
  },
}));

describe('MainScreen', () => {
  let unmount: (() => void) | undefined;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset stores to initial state
    useHealthDataStore.setState({
      emotionalState: EmotionalState.RESTING,
      healthMetrics: { steps: 5000 },
      lastUpdated: new Date(),
      calculationMethod: 'rule-based',
      isLoading: false,
      error: null,
    });

    useSymbiStateStore.setState({
      emotionalState: EmotionalState.RESTING,
      evolutionLevel: 0,
      customAppearanceUrl: null,
      evolutionRecords: [],
      daysInPositiveState: 0,
      isTransitioning: false,
    });

    useUserPreferencesStore.setState({
      profile: {
        id: 'test-user',
        createdAt: new Date(),
        preferences: {
          dataSource: 'manual',
          notificationsEnabled: true,
          hapticFeedbackEnabled: true,
          soundEnabled: true,
          theme: 'auto',
          analyticsEnabled: false,
        },
        thresholds: {
          sadThreshold: 2000,
          activeThreshold: 8000,
        },
        goals: {
          targetSteps: 10000,
          targetSleepHours: 8,
          targetHRV: 60,
        },
        evolutionLevel: 0,
        totalDaysActive: 0,
      },
      isInitialized: true,
    });
  });

  afterEach(() => {
    // Unmount component to trigger cleanup
    if (unmount) {
      unmount();
      unmount = undefined;
    }
    
    // Force cleanup of background service
    mockStopBackgroundSync();
    mockBackgroundSyncInstance.destroy();
  });

  it('renders main screen with Symbi animation', async () => {
    const result = render(<MainScreen navigation={mockNavigation as any} />);
    unmount = result.unmount;

    await waitFor(() => {
      expect(result.getByText('Symbi')).toBeTruthy();
    });
  });

  it('displays step count and emotional state', async () => {
    const result = render(<MainScreen navigation={mockNavigation as any} />);
    unmount = result.unmount;

    await waitFor(() => {
      expect(result.getByText('5,000')).toBeTruthy();
      expect(result.getAllByText('Resting').length).toBeGreaterThan(0);
    });
  });

  it('shows configure thresholds button', async () => {
    const result = render(<MainScreen navigation={mockNavigation as any} />);
    unmount = result.unmount;

    await waitFor(() => {
      expect(result.getByText('⚡ Configure Thresholds')).toBeTruthy();
    });
  });

  it('displays progress bar based on step count', async () => {
    const result = render(<MainScreen navigation={mockNavigation as any} />);
    unmount = result.unmount;

    await waitFor(() => {
      // 5000 steps / 8000 active threshold = 62.5%
      expect(result.getByText('63%')).toBeTruthy();
    });
  });

  it('shows error message when error exists', async () => {
    const result = render(<MainScreen navigation={mockNavigation as any} />);
    unmount = result.unmount;

    // Set error after component is mounted
    useHealthDataStore.setState({
      error: 'Test error message',
    });

    await waitFor(() => {
      expect(result.getByText(/Test error message/)).toBeTruthy();
    });
  });

  it('shows loading state initially', () => {
    useHealthDataStore.setState({
      isLoading: true,
    });

    const result = render(<MainScreen navigation={mockNavigation as any} />);
    unmount = result.unmount;

    expect(result.getByText('Loading Symbi...')).toBeTruthy();
  });

  it('shows waiting for data message when no data available', async () => {
    useHealthDataStore.setState({
      healthMetrics: { steps: 0 },
      lastUpdated: null,
      isLoading: false,
    });

    const result = render(<MainScreen navigation={mockNavigation as any} />);
    unmount = result.unmount;

    await waitFor(() => {
      expect(result.getByText("Waiting for today's data...")).toBeTruthy();
    });
  });

  it('displays threshold indicators', async () => {
    const result = render(<MainScreen navigation={mockNavigation as any} />);
    unmount = result.unmount;

    await waitFor(() => {
      expect(result.getByText('Sad')).toBeTruthy();
      expect(result.getAllByText('Resting').length).toBeGreaterThan(0);
      expect(result.getByText('Active')).toBeTruthy();
      expect(result.getByText('< 2,000')).toBeTruthy();
      expect(result.getByText('> 8,000')).toBeTruthy();
    });
  });
});
