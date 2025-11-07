import { Platform } from 'react-native';
import { createHealthDataService, AuthStatus } from '../HealthDataService';
import { HealthDataType } from '../../types';
import { HealthKitService } from '../HealthKitService';
import { GoogleFitService } from '../GoogleFitService';
import { ManualHealthDataService } from '../ManualHealthDataService';

describe('HealthDataService Factory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Platform Detection', () => {
    it('should create HealthKitService on iOS', () => {
      (Platform as any).OS = 'ios';
      const service = createHealthDataService();
      expect(service).toBeInstanceOf(HealthKitService);
    });

    it('should create GoogleFitService on Android', () => {
      (Platform as any).OS = 'android';
      const service = createHealthDataService();
      expect(service).toBeInstanceOf(GoogleFitService);
    });

    it('should create ManualHealthDataService when manual is specified', () => {
      const service = createHealthDataService('manual');
      expect(service).toBeInstanceOf(ManualHealthDataService);
    });

    it('should create ManualHealthDataService for unsupported platforms', () => {
      (Platform as any).OS = 'web';
      const service = createHealthDataService();
      expect(service).toBeInstanceOf(ManualHealthDataService);
    });
  });

  describe('Service Instantiation', () => {
    it('should create a service with subscription capabilities', () => {
      const service = createHealthDataService('manual');
      expect(service.subscribeToUpdates).toBeDefined();
      expect(service.unsubscribeFromUpdates).toBeDefined();
    });

    it('should create a service with all required methods', () => {
      const service = createHealthDataService('manual');
      expect(service.initialize).toBeDefined();
      expect(service.checkAuthorizationStatus).toBeDefined();
      expect(service.getStepCount).toBeDefined();
      expect(service.getSleepDuration).toBeDefined();
      expect(service.getHeartRateVariability).toBeDefined();
      expect(service.writeMindfulMinutes).toBeDefined();
    });
  });
});
