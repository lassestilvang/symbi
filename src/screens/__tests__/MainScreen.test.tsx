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
jest.mock('../../services/BackgroundSyncService', () => ({
  getBackgroundSyncService: jest.fn(() => ({
    startBackgroundSync: jest.fn().mockResolvedValue(undefined),
    stopBackgroundSync: jest.fn(),
  })),
}));

describe('MainScreen', () => {
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

  it('renders main screen with Symbi animation', async () => {
    const { getByText } = render(<MainScreen navigation={mockNavigation as any} />);
    
    await waitFor(() => {
      expect(getByText('Symbi')).toBeTruthy();
    });
  });

  it('displays step count and emotional state', async () => {
    const { getByText } = render(<MainScreen navigation={mockNavigation as any} />);
    
    await waitFor(() => {
      expect(getByText('5,000')).toBeTruthy();
      expect(getByText('Resting')).toBeTruthy();
    });
  });

  it('shows configure thresholds button', async () => {
    const { getByText } = render(<MainScreen navigation={mockNavigation as any} />);
    
    await waitFor(() => {
      expect(getByText('⚡ Configure Thresholds')).toBeTruthy();
    });
  });

  it('displays progress bar based on step count', async () => {
    const { getByText } = render(<MainScreen navigation={mockNavigation as any} />);
    
    await waitFor(() => {
      // 5000 steps / 8000 active threshold = 62.5%
      expect(getByText('63%')).toBeTruthy();
    });
  });

  it('shows error message when error exists', async () => {
    useHealthDataStore.setState({
      error: 'Test error message',
    });

    const { getByText } = render(<MainScreen navigation={mockNavigation as any} />);
    
    await waitFor(() => {
      expect(getByText(/Test error message/)).toBeTruthy();
    });
  });

  it('shows loading state initially', () => {
    useHealthDataStore.setState({
      isLoading: true,
    });

    const { getByText } = render(<MainScreen navigation={mockNavigation as any} />);
    
    expect(getByText('Loading Symbi...')).toBeTruthy();
  });

  it('shows waiting for data message when no data available', async () => {
    useHealthDataStore.setState({
      healthMetrics: { steps: 0 },
      lastUpdated: null,
      isLoading: false,
    });

    const { getByText } = render(<MainScreen navigation={mockNavigation as any} />);
    
    await waitFor(() => {
      expect(getByText('Waiting for today\'s data...')).toBeTruthy();
    });
  });

  it('displays threshold indicators', async () => {
    const { getByText } = render(<MainScreen navigation={mockNavigation as any} />);
    
    await waitFor(() => {
      expect(getByText('Sad')).toBeTruthy();
      expect(getByText('Resting')).toBeTruthy();
      expect(getByText('Active')).toBeTruthy();
      expect(getByText('< 2,000')).toBeTruthy();
      expect(getByText('> 8,000')).toBeTruthy();
    });
  });
});
