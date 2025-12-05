import { ManualHealthDataService } from '../ManualHealthDataService';
import { StorageService } from '../StorageService';
import { HealthDataType } from '../../types';
import { AuthStatus } from '../HealthDataService';

jest.mock('../StorageService');

describe('ManualHealthDataService', () => {
  let service: ManualHealthDataService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ManualHealthDataService();
  });

  describe('Initialization', () => {
    it('should initialize successfully without permissions', async () => {
      const result = await service.initialize({
        read: [HealthDataType.STEPS],
        write: [],
      });

      expect(result.success).toBe(true);
      expect(result.grantedPermissions).toEqual([HealthDataType.STEPS]);
    });

    it('should always return authorized status', async () => {
      const status = await service.checkAuthorizationStatus({
        read: [HealthDataType.STEPS],
        write: [],
      });

      expect(status).toBe(AuthStatus.AUTHORIZED);
    });
  });

  describe('Step Count Validation', () => {
    it('should accept valid step count', async () => {
      const result = await service.saveStepCount(5000);
      expect(result).toBe(true);
      expect(StorageService.set).toHaveBeenCalled();
    });

    it('should reject step count below minimum', async () => {
      await expect(service.saveStepCount(-100)).rejects.toThrow(
        'Step count must be between 0 and 100000'
      );
    });

    it('should reject step count above maximum', async () => {
      await expect(service.saveStepCount(150000)).rejects.toThrow(
        'Step count must be between 0 and 100000'
      );
    });

    it('should accept step count at minimum boundary', async () => {
      const result = await service.saveStepCount(0);
      expect(result).toBe(true);
    });

    it('should accept step count at maximum boundary', async () => {
      const result = await service.saveStepCount(100000);
      expect(result).toBe(true);
    });
  });

  describe('Data Retrieval', () => {
    beforeEach(() => {
      const mockData = {
        '2024-01-01': { steps: 5000, sleepHours: 7, hrv: 50 },
        '2024-01-02': { steps: 8000, sleepHours: 8, hrv: 60 },
      };
      (StorageService.get as jest.Mock).mockResolvedValue(mockData);
    });

    it('should retrieve step count for date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-02');

      const steps = await service.getStepCount(startDate, endDate);
      expect(steps).toBe(13000); // 5000 + 8000
    });

    it('should retrieve average sleep duration', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-02');

      const sleep = await service.getSleepDuration(startDate, endDate);
      expect(sleep).toBe(7.5); // (7 + 8) / 2
    });

    it('should retrieve average HRV', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-02');

      const hrv = await service.getHeartRateVariability(startDate, endDate);
      expect(hrv).toBe(55); // (50 + 60) / 2
    });

    it('should return 0 for empty date range', async () => {
      (StorageService.get as jest.Mock).mockResolvedValue({});

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-02');

      const steps = await service.getStepCount(startDate, endDate);
      expect(steps).toBe(0);
    });
  });

  describe('Data Writing', () => {
    it('should write mindful minutes', async () => {
      (StorageService.get as jest.Mock).mockResolvedValue({});

      const result = await service.writeMindfulMinutes(10, new Date('2024-01-01'));
      expect(result).toBe(true);
      expect(StorageService.set).toHaveBeenCalled();
    });

    it('should accumulate mindful minutes for same day', async () => {
      const existingData = {
        '2024-01-01': { mindfulMinutes: 5 },
      };
      (StorageService.get as jest.Mock).mockResolvedValue(existingData);

      await service.writeMindfulMinutes(10, new Date('2024-01-01'));

      const setCall = (StorageService.set as jest.Mock).mock.calls[0];
      expect(setCall[1]['2024-01-01'].mindfulMinutes).toBe(15);
    });
  });

  describe('Error Handling', () => {
    it('should handle storage errors gracefully', async () => {
      (StorageService.set as jest.Mock).mockRejectedValue(new Error('Storage error'));

      // The service now throws on storage errors instead of returning false
      await expect(service.saveStepCount(5000)).rejects.toThrow('Storage error');
    });

    it('should handle retrieval errors', async () => {
      (StorageService.get as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await expect(service.getStepCount(new Date(), new Date())).rejects.toThrow();
    });
  });

  describe('Subscription System', () => {
    it('should notify subscribers on data update', async () => {
      (StorageService.get as jest.Mock).mockResolvedValue({});
      (StorageService.set as jest.Mock).mockResolvedValue(true);

      const callback = jest.fn();
      service.subscribeToUpdates(HealthDataType.STEPS, callback);

      await service.saveStepCount(5000);

      // The callback now receives {value, timestamp} format
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          value: 5000,
          timestamp: expect.any(Date),
        })
      );
    });

    it('should not notify after unsubscribe', async () => {
      (StorageService.get as jest.Mock).mockResolvedValue({});
      (StorageService.set as jest.Mock).mockResolvedValue(true);

      const callback = jest.fn();
      service.subscribeToUpdates(HealthDataType.STEPS, callback);
      service.unsubscribeFromUpdates(HealthDataType.STEPS);

      await service.saveStepCount(5000);

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
