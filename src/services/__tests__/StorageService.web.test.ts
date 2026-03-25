/**
 * Web-specific storage tests to verify AsyncStorage persistence
 */
import { StorageService } from '../StorageService';
import { EmotionalState } from '../../types';

describe('StorageService - Web Persistence', () => {
  beforeEach(async () => {
    // Clear storage before each test
    await StorageService.clear();
  });

  it('should persist data across get/set calls', async () => {
    const testKey = 'test_key';
    const testData = { value: 'test', number: 123 };

    // Save data
    const saveResult = await StorageService.set(testKey, testData);
    expect(saveResult).toBe(true);

    // Retrieve data
    const retrievedData = await StorageService.get(testKey);
    expect(retrievedData).toEqual(testData);
  });

  it('should persist manual health data', async () => {
    const manualDataKey = 'manual_health_data';
    const healthData = {
      '2025-11-16': { steps: 5000, sleepHours: 7.5 },
      '2025-11-15': { steps: 8000 },
    };

    // Save manual health data
    await StorageService.set(manualDataKey, healthData);

    // Retrieve it
    const retrieved = await StorageService.get(manualDataKey);
    expect(retrieved).toEqual(healthData);
  });

  it('should persist health data cache', async () => {
    const cacheData = {
      '2025-11-16': {
        date: '2025-11-16',
        steps: 5000,
        emotionalState: EmotionalState.RESTING,
        calculationMethod: 'rule-based' as const,
        lastUpdated: new Date('2025-11-16T12:00:00Z'),
      },
    };

    await StorageService.setHealthDataCache(cacheData);

    const retrieved = await StorageService.getHealthDataCache();
    expect(retrieved).toBeTruthy();
    expect(retrieved?.['2025-11-16'].steps).toBe(5000);
  });
});
