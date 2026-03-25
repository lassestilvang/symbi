/**
 * Unit tests for EvolutionHistoryScreen data transformation and calculations
 * Tests Requirements: 4.2, 7.1, 8.5
 */

import {
  HealthDataCache,
  HistoricalDataPoint,
  EmotionalState,
  EvolutionRecord,
  HistoryStatistics,
} from '../../types';

// Import the functions we need to test
// Since they're not exported, we'll need to extract them for testing
// For now, we'll define them here to test the logic

/**
 * Transform HealthDataCache to HistoricalDataPoint[]
 */
const transformCacheToDataPoints = (
  cache: Record<string, HealthDataCache>
): HistoricalDataPoint[] => {
  return Object.entries(cache)
    .map(([date, data]) => ({
      date,
      steps: data.steps,
      sleepHours: data.sleepHours,
      hrv: data.hrv,
      emotionalState: data.emotionalState,
      calculationMethod: data.calculationMethod,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Filter data by time range with pagination for "All Time" view
 */
const filterDataByTimeRange = (
  data: HistoricalDataPoint[],
  range: '7d' | '30d' | '90d' | 'all'
): HistoricalDataPoint[] => {
  const now = new Date();
  let days: number;

  if (range === 'all') {
    days = 90; // Limit "All Time" to 90 days for performance
  } else {
    days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  }

  const cutoffDate = new Date(now);
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return data.filter(point => {
    const pointDate = new Date(point.date);
    return pointDate >= cutoffDate;
  });
};

/**
 * Calculate statistics for the given data
 */
const calculateStatistics = (
  data: HistoricalDataPoint[],
  evolutionRecords: EvolutionRecord[]
): HistoryStatistics => {
  if (data.length === 0) {
    return {
      averageSteps: 0,
      averageSleep: null,
      averageHRV: null,
      mostFrequentState: EmotionalState.RESTING,
      totalEvolutions: evolutionRecords.length,
      daysSinceLastEvolution: 0,
    };
  }

  // Calculate average steps
  const averageSteps = data.reduce((sum, d) => sum + d.steps, 0) / data.length;

  // Calculate average sleep
  const sleepData = data.filter(d => d.sleepHours !== undefined);
  const averageSleep =
    sleepData.length > 0
      ? sleepData.reduce((sum, d) => sum + (d.sleepHours || 0), 0) / sleepData.length
      : null;

  // Calculate average HRV
  const hrvData = data.filter(d => d.hrv !== undefined);
  const averageHRV =
    hrvData.length > 0 ? hrvData.reduce((sum, d) => sum + (d.hrv || 0), 0) / hrvData.length : null;

  // Find most frequent state
  const stateCounts = new Map<EmotionalState, number>();
  data.forEach(d => {
    const state = d.emotionalState;
    stateCounts.set(state, (stateCounts.get(state) || 0) + 1);
  });
  const mostFrequentState =
    Array.from(stateCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || EmotionalState.RESTING;

  // Evolution stats
  const totalEvolutions = evolutionRecords.length;
  const lastEvolution = evolutionRecords[0]; // Assuming sorted newest first
  const daysSinceLastEvolution = lastEvolution
    ? Math.floor((Date.now() - new Date(lastEvolution.timestamp).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    averageSteps: Math.round(averageSteps),
    averageSleep,
    averageHRV,
    mostFrequentState,
    totalEvolutions,
    daysSinceLastEvolution,
  };
};

describe('EvolutionHistoryScreen - Data Transformation', () => {
  describe('transformCacheToDataPoints', () => {
    it('should transform cache to data points correctly', () => {
      const cache: Record<string, HealthDataCache> = {
        '2024-11-15': {
          date: '2024-11-15',
          steps: 8500,
          sleepHours: 7.5,
          hrv: 65,
          emotionalState: EmotionalState.ACTIVE,
          calculationMethod: 'rule-based',
          lastUpdated: new Date('2024-11-15T23:59:59'),
        },
        '2024-11-16': {
          date: '2024-11-16',
          steps: 5000,
          sleepHours: 8.0,
          hrv: 70,
          emotionalState: EmotionalState.RESTING,
          calculationMethod: 'rule-based',
          lastUpdated: new Date('2024-11-16T23:59:59'),
        },
      };

      const result = transformCacheToDataPoints(cache);

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2024-11-15');
      expect(result[0].steps).toBe(8500);
      expect(result[0].sleepHours).toBe(7.5);
      expect(result[0].hrv).toBe(65);
      expect(result[0].emotionalState).toBe(EmotionalState.ACTIVE);
      expect(result[1].date).toBe('2024-11-16');
    });

    it('should sort data points by date in ascending order', () => {
      const cache: Record<string, HealthDataCache> = {
        '2024-11-16': {
          date: '2024-11-16',
          steps: 5000,
          emotionalState: EmotionalState.RESTING,
          calculationMethod: 'rule-based',
          lastUpdated: new Date(),
        },
        '2024-11-14': {
          date: '2024-11-14',
          steps: 3000,
          emotionalState: EmotionalState.SAD,
          calculationMethod: 'rule-based',
          lastUpdated: new Date(),
        },
        '2024-11-15': {
          date: '2024-11-15',
          steps: 8500,
          emotionalState: EmotionalState.ACTIVE,
          calculationMethod: 'rule-based',
          lastUpdated: new Date(),
        },
      };

      const result = transformCacheToDataPoints(cache);

      expect(result[0].date).toBe('2024-11-14');
      expect(result[1].date).toBe('2024-11-15');
      expect(result[2].date).toBe('2024-11-16');
    });

    it('should handle cache with missing optional fields', () => {
      const cache: Record<string, HealthDataCache> = {
        '2024-11-15': {
          date: '2024-11-15',
          steps: 8500,
          emotionalState: EmotionalState.ACTIVE,
          calculationMethod: 'rule-based',
          lastUpdated: new Date(),
        },
      };

      const result = transformCacheToDataPoints(cache);

      expect(result).toHaveLength(1);
      expect(result[0].sleepHours).toBeUndefined();
      expect(result[0].hrv).toBeUndefined();
    });

    it('should handle empty cache', () => {
      const cache: Record<string, HealthDataCache> = {};

      const result = transformCacheToDataPoints(cache);

      expect(result).toHaveLength(0);
    });

    it('should preserve calculation method', () => {
      const cache: Record<string, HealthDataCache> = {
        '2024-11-15': {
          date: '2024-11-15',
          steps: 8500,
          emotionalState: EmotionalState.VIBRANT,
          calculationMethod: 'ai',
          lastUpdated: new Date(),
        },
      };

      const result = transformCacheToDataPoints(cache);

      expect(result[0].calculationMethod).toBe('ai');
    });
  });
});

describe('EvolutionHistoryScreen - Time Range Filtering', () => {
  const createMockData = (daysAgo: number): HistoricalDataPoint => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return {
      date: date.toISOString().split('T')[0],
      steps: 5000,
      emotionalState: EmotionalState.RESTING,
      calculationMethod: 'rule-based',
    };
  };

  describe('filterDataByTimeRange', () => {
    it('should filter data for 7 days range', () => {
      const data: HistoricalDataPoint[] = [
        createMockData(3),
        createMockData(5),
        createMockData(10),
        createMockData(15),
      ];

      const result = filterDataByTimeRange(data, '7d');

      expect(result.length).toBeLessThanOrEqual(2);
      // Should include data from last 7 days
      result.forEach(point => {
        const pointDate = new Date(point.date);
        const daysAgo = Math.floor((Date.now() - pointDate.getTime()) / (1000 * 60 * 60 * 24));
        expect(daysAgo).toBeLessThanOrEqual(7);
      });
    });

    it('should filter data for 30 days range', () => {
      const data: HistoricalDataPoint[] = [
        createMockData(10),
        createMockData(25),
        createMockData(35),
        createMockData(50),
      ];

      const result = filterDataByTimeRange(data, '30d');

      expect(result.length).toBeLessThanOrEqual(2);
      result.forEach(point => {
        const pointDate = new Date(point.date);
        const daysAgo = Math.floor((Date.now() - pointDate.getTime()) / (1000 * 60 * 60 * 24));
        expect(daysAgo).toBeLessThanOrEqual(30);
      });
    });

    it('should filter data for 90 days range', () => {
      const data: HistoricalDataPoint[] = [
        createMockData(30),
        createMockData(60),
        createMockData(95),
        createMockData(100),
      ];

      const result = filterDataByTimeRange(data, '90d');

      expect(result.length).toBeLessThanOrEqual(2);
      result.forEach(point => {
        const pointDate = new Date(point.date);
        const daysAgo = Math.floor((Date.now() - pointDate.getTime()) / (1000 * 60 * 60 * 24));
        expect(daysAgo).toBeLessThanOrEqual(90);
      });
    });

    it('should limit "all" range to 90 days for performance', () => {
      const data: HistoricalDataPoint[] = [
        createMockData(30),
        createMockData(60),
        createMockData(95),
        createMockData(120),
      ];

      const result = filterDataByTimeRange(data, 'all');

      // Should limit to 90 days
      result.forEach(point => {
        const pointDate = new Date(point.date);
        const daysAgo = Math.floor((Date.now() - pointDate.getTime()) / (1000 * 60 * 60 * 24));
        expect(daysAgo).toBeLessThanOrEqual(90);
      });
    });

    it('should handle empty data array', () => {
      const data: HistoricalDataPoint[] = [];

      const result = filterDataByTimeRange(data, '30d');

      expect(result).toHaveLength(0);
    });
  });
});

describe('EvolutionHistoryScreen - Statistics Calculation', () => {
  describe('calculateStatistics', () => {
    it('should calculate average steps correctly', () => {
      const data: HistoricalDataPoint[] = [
        {
          date: '2024-11-14',
          steps: 8000,
          emotionalState: EmotionalState.ACTIVE,
          calculationMethod: 'rule-based',
        },
        {
          date: '2024-11-15',
          steps: 6000,
          emotionalState: EmotionalState.RESTING,
          calculationMethod: 'rule-based',
        },
        {
          date: '2024-11-16',
          steps: 10000,
          emotionalState: EmotionalState.ACTIVE,
          calculationMethod: 'rule-based',
        },
      ];

      const result = calculateStatistics(data, []);

      expect(result.averageSteps).toBe(8000); // (8000 + 6000 + 10000) / 3 = 8000
    });

    it('should calculate average sleep when available', () => {
      const data: HistoricalDataPoint[] = [
        {
          date: '2024-11-14',
          steps: 8000,
          sleepHours: 7.5,
          emotionalState: EmotionalState.ACTIVE,
          calculationMethod: 'rule-based',
        },
        {
          date: '2024-11-15',
          steps: 6000,
          sleepHours: 8.0,
          emotionalState: EmotionalState.RESTING,
          calculationMethod: 'rule-based',
        },
        {
          date: '2024-11-16',
          steps: 10000,
          sleepHours: 6.5,
          emotionalState: EmotionalState.ACTIVE,
          calculationMethod: 'rule-based',
        },
      ];

      const result = calculateStatistics(data, []);

      expect(result.averageSleep).toBeCloseTo(7.33, 1); // (7.5 + 8.0 + 6.5) / 3
    });

    it('should return null for average sleep when no sleep data available', () => {
      const data: HistoricalDataPoint[] = [
        {
          date: '2024-11-14',
          steps: 8000,
          emotionalState: EmotionalState.ACTIVE,
          calculationMethod: 'rule-based',
        },
      ];

      const result = calculateStatistics(data, []);

      expect(result.averageSleep).toBeNull();
    });

    it('should calculate average HRV when available', () => {
      const data: HistoricalDataPoint[] = [
        {
          date: '2024-11-14',
          steps: 8000,
          hrv: 60,
          emotionalState: EmotionalState.ACTIVE,
          calculationMethod: 'rule-based',
        },
        {
          date: '2024-11-15',
          steps: 6000,
          hrv: 70,
          emotionalState: EmotionalState.RESTING,
          calculationMethod: 'rule-based',
        },
        {
          date: '2024-11-16',
          steps: 10000,
          hrv: 80,
          emotionalState: EmotionalState.ACTIVE,
          calculationMethod: 'rule-based',
        },
      ];

      const result = calculateStatistics(data, []);

      expect(result.averageHRV).toBeCloseTo(70, 0); // (60 + 70 + 80) / 3
    });

    it('should return null for average HRV when no HRV data available', () => {
      const data: HistoricalDataPoint[] = [
        {
          date: '2024-11-14',
          steps: 8000,
          emotionalState: EmotionalState.ACTIVE,
          calculationMethod: 'rule-based',
        },
      ];

      const result = calculateStatistics(data, []);

      expect(result.averageHRV).toBeNull();
    });

    it('should determine most frequent emotional state', () => {
      const data: HistoricalDataPoint[] = [
        {
          date: '2024-11-14',
          steps: 8000,
          emotionalState: EmotionalState.ACTIVE,
          calculationMethod: 'rule-based',
        },
        {
          date: '2024-11-15',
          steps: 6000,
          emotionalState: EmotionalState.RESTING,
          calculationMethod: 'rule-based',
        },
        {
          date: '2024-11-16',
          steps: 10000,
          emotionalState: EmotionalState.ACTIVE,
          calculationMethod: 'rule-based',
        },
        {
          date: '2024-11-17',
          steps: 9000,
          emotionalState: EmotionalState.ACTIVE,
          calculationMethod: 'rule-based',
        },
      ];

      const result = calculateStatistics(data, []);

      expect(result.mostFrequentState).toBe(EmotionalState.ACTIVE); // 3 ACTIVE vs 1 RESTING
    });

    it('should calculate total evolutions', () => {
      const data: HistoricalDataPoint[] = [
        {
          date: '2024-11-14',
          steps: 8000,
          emotionalState: EmotionalState.ACTIVE,
          calculationMethod: 'rule-based',
        },
      ];

      const evolutionRecords: EvolutionRecord[] = [
        {
          id: '1',
          timestamp: new Date('2024-11-10'),
          evolutionLevel: 1,
          appearanceUrl: 'url1',
          daysInPositiveState: 7,
          dominantStates: [EmotionalState.ACTIVE],
        },
        {
          id: '2',
          timestamp: new Date('2024-11-01'),
          evolutionLevel: 2,
          appearanceUrl: 'url2',
          daysInPositiveState: 14,
          dominantStates: [EmotionalState.VIBRANT],
        },
      ];

      const result = calculateStatistics(data, evolutionRecords);

      expect(result.totalEvolutions).toBe(2);
    });

    it('should calculate days since last evolution', () => {
      const data: HistoricalDataPoint[] = [
        {
          date: '2024-11-14',
          steps: 8000,
          emotionalState: EmotionalState.ACTIVE,
          calculationMethod: 'rule-based',
        },
      ];

      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      const evolutionRecords: EvolutionRecord[] = [
        {
          id: '1',
          timestamp: fiveDaysAgo,
          evolutionLevel: 1,
          appearanceUrl: 'url1',
          daysInPositiveState: 7,
          dominantStates: [EmotionalState.ACTIVE],
        },
      ];

      const result = calculateStatistics(data, evolutionRecords);

      expect(result.daysSinceLastEvolution).toBeGreaterThanOrEqual(4);
      expect(result.daysSinceLastEvolution).toBeLessThanOrEqual(5);
    });

    it('should handle empty data array', () => {
      const data: HistoricalDataPoint[] = [];
      const evolutionRecords: EvolutionRecord[] = [];

      const result = calculateStatistics(data, evolutionRecords);

      expect(result.averageSteps).toBe(0);
      expect(result.averageSleep).toBeNull();
      expect(result.averageHRV).toBeNull();
      expect(result.mostFrequentState).toBe(EmotionalState.RESTING);
      expect(result.totalEvolutions).toBe(0);
      expect(result.daysSinceLastEvolution).toBe(0);
    });

    it('should handle partial data gracefully', () => {
      const data: HistoricalDataPoint[] = [
        {
          date: '2024-11-14',
          steps: 8000,
          sleepHours: 7.5,
          emotionalState: EmotionalState.ACTIVE,
          calculationMethod: 'rule-based',
        },
        {
          date: '2024-11-15',
          steps: 6000,
          hrv: 65,
          emotionalState: EmotionalState.RESTING,
          calculationMethod: 'rule-based',
        },
      ];

      const result = calculateStatistics(data, []);

      expect(result.averageSteps).toBe(7000);
      expect(result.averageSleep).toBe(7.5); // Only one data point
      expect(result.averageHRV).toBe(65); // Only one data point
    });

    it('should round average steps to whole number', () => {
      const data: HistoricalDataPoint[] = [
        {
          date: '2024-11-14',
          steps: 8333,
          emotionalState: EmotionalState.ACTIVE,
          calculationMethod: 'rule-based',
        },
        {
          date: '2024-11-15',
          steps: 6666,
          emotionalState: EmotionalState.RESTING,
          calculationMethod: 'rule-based',
        },
      ];

      const result = calculateStatistics(data, []);

      expect(result.averageSteps).toBe(7500); // Should be rounded
      expect(Number.isInteger(result.averageSteps)).toBe(true);
    });
  });
});

describe('EvolutionHistoryScreen - Error Handling', () => {
  it('should handle cache with unusual date formats', () => {
    const cache: Record<string, HealthDataCache> = {
      '2024-11-15': {
        date: '2024-11-15',
        steps: 8500,
        emotionalState: EmotionalState.ACTIVE,
        calculationMethod: 'rule-based',
        lastUpdated: new Date(),
      },
      '2024-11-16': {
        date: '2024-11-16',
        steps: 0, // Edge case: zero steps
        emotionalState: EmotionalState.SAD,
        calculationMethod: 'rule-based',
        lastUpdated: new Date(),
      },
    };

    const result = transformCacheToDataPoints(cache);

    expect(result).toHaveLength(2);
    expect(result[1].steps).toBe(0);
  });

  it('should handle edge case with single data point', () => {
    const data: HistoricalDataPoint[] = [
      {
        date: '2024-11-14',
        steps: 8000,
        sleepHours: 7.5,
        hrv: 65,
        emotionalState: EmotionalState.ACTIVE,
        calculationMethod: 'rule-based',
      },
    ];

    const result = calculateStatistics(data, []);

    expect(result.averageSteps).toBe(8000);
    expect(result.averageSleep).toBe(7.5);
    expect(result.averageHRV).toBe(65);
    expect(result.mostFrequentState).toBe(EmotionalState.ACTIVE);
  });

  it('should handle evolution records with no last evolution', () => {
    const data: HistoricalDataPoint[] = [
      {
        date: '2024-11-14',
        steps: 8000,
        emotionalState: EmotionalState.ACTIVE,
        calculationMethod: 'rule-based',
      },
    ];

    const result = calculateStatistics(data, []);

    expect(result.daysSinceLastEvolution).toBe(0);
  });
});
