import { Platform } from 'react-native';
import { HealthKitService } from '../HealthKitService';
import { HealthDataType } from '../../types';
import { AuthStatus } from '../HealthDataService';

// Mock react-native-health
const mockHealthKit = {
  isAvailable: jest.fn(),
  initHealthKit: jest.fn(),
  getStepCount: jest.fn(),
  getSleepSamples: jest.fn(),
  getHeartRateVariabilitySamples: jest.fn(),
  saveMindfulSession: jest.fn(),
};

jest.mock('react-native-health', () => ({
  default: mockHealthKit,
}));

describe('HealthKitService', () => {
  let service: HealthKitService;

  beforeEach(() => {
    jest.clearAllMocks();
    (Platform as any).OS = 'ios';
    service = new HealthKitService();
  });

  describe('Initialization', () => {
    it('should initialize successfully on iOS', async () => {
      mockHealthKit.isAvailable.mockImplementation((callback) => callback(null, true));
      mockHealthKit.initHealthKit.mockImplementation((permissions, callback) => callback(null));

      const result = await service.initialize({
        read: [HealthDataType.STEPS],
        write: [],
      });

      expect(result.success).toBe(true);
      expect(mockHealthKit.initHealthKit).toHaveBeenCalled();
    });

    it('should fail on non-iOS platform', async () => {
      (Platform as any).OS = 'android';

      const result = await service.initialize({
        read: [HealthDataType.STEPS],
        write: [],
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('HealthKit is only available on iOS');
    });

    it('should handle HealthKit unavailable', async () => {
      mockHealthKit.isAvailable.mockImplementation((callback) => callback(null, false));

      const result = await service.initialize({
        read: [HealthDataType.STEPS],
        write: [],
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('HealthKit is not available on this device');
    });

    it('should handle initialization errors', async () => {
      mockHealthKit.isAvailable.mockImplementation((callback) => callback(null, true));
      mockHealthKit.initHealthKit.mockImplementation((permissions, callback) =>
        callback(new Error('Permission denied'))
      );

      const result = await service.initialize({
        read: [HealthDataType.STEPS],
        write: [],
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Data Retrieval', () => {
    beforeEach(async () => {
      mockHealthKit.isAvailable.mockImplementation((callback) => callback(null, true));
      mockHealthKit.initHealthKit.mockImplementation((permissions, callback) => callback(null));

      await service.initialize({
        read: [HealthDataType.STEPS, HealthDataType.SLEEP, HealthDataType.HRV],
        write: [],
      });
    });

    it('should retrieve step count', async () => {
      mockHealthKit.getStepCount.mockImplementation((options, callback) =>
        callback(null, { value: 8500 })
      );

      const steps = await service.getStepCount(new Date(), new Date());
      expect(steps).toBe(8500);
    });

    it('should return 0 for no step data', async () => {
      mockHealthKit.getStepCount.mockImplementation((options, callback) =>
        callback(null, { value: 0 })
      );

      const steps = await service.getStepCount(new Date(), new Date());
      expect(steps).toBe(0);
    });

    it('should handle step count errors', async () => {
      mockHealthKit.getStepCount.mockImplementation((options, callback) =>
        callback(new Error('No permission'))
      );

      await expect(service.getStepCount(new Date(), new Date())).rejects.toThrow();
    });

    it('should calculate sleep duration from samples', async () => {
      const sleepSamples = [
        {
          value: 'ASLEEP',
          startDate: '2024-01-01T22:00:00Z',
          endDate: '2024-01-02T06:00:00Z', // 8 hours
        },
      ];

      mockHealthKit.getSleepSamples.mockImplementation((options, callback) =>
        callback(null, sleepSamples)
      );

      const sleep = await service.getSleepDuration(new Date(), new Date());
      expect(sleep).toBe(8);
    });

    it('should calculate average HRV', async () => {
      const hrvSamples = [
        { value: 50 },
        { value: 60 },
        { value: 70 },
      ];

      mockHealthKit.getHeartRateVariabilitySamples.mockImplementation((options, callback) =>
        callback(null, hrvSamples)
      );

      const hrv = await service.getHeartRateVariability(new Date(), new Date());
      expect(hrv).toBe(60); // (50 + 60 + 70) / 3
    });
  });

  describe('Data Writing', () => {
    beforeEach(async () => {
      mockHealthKit.isAvailable.mockImplementation((callback) => callback(null, true));
      mockHealthKit.initHealthKit.mockImplementation((permissions, callback) => callback(null));

      await service.initialize({
        read: [],
        write: [HealthDataType.MINDFUL_MINUTES],
      });
    });

    it('should write mindful minutes', async () => {
      mockHealthKit.saveMindfulSession.mockImplementation((options, callback) => callback(null));

      const result = await service.writeMindfulMinutes(10, new Date());
      expect(result).toBe(true);
      expect(mockHealthKit.saveMindfulSession).toHaveBeenCalled();
    });

    it('should handle write errors', async () => {
      mockHealthKit.saveMindfulSession.mockImplementation((options, callback) =>
        callback(new Error('Write failed'))
      );

      const result = await service.writeMindfulMinutes(10, new Date());
      expect(result).toBe(false);
    });
  });

  describe('Permission Handling', () => {
    it('should map permissions correctly', async () => {
      mockHealthKit.isAvailable.mockImplementation((callback) => callback(null, true));
      mockHealthKit.initHealthKit.mockImplementation((permissions, callback) => {
        expect(permissions.permissions.read).toContain('StepCount');
        expect(permissions.permissions.read).toContain('SleepAnalysis');
        expect(permissions.permissions.write).toContain('MindfulSession');
        callback(null);
      });

      await service.initialize({
        read: [HealthDataType.STEPS, HealthDataType.SLEEP],
        write: [HealthDataType.MINDFUL_MINUTES],
      });
    });
  });
});
