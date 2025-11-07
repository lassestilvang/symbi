import { InteractiveSessionManager, SessionType } from '../InteractiveSessionManager';
import { HealthDataService } from '../HealthDataService';
import { EmotionalState } from '../../types';

import { AuthStatus, HealthPermissions, InitResult } from '../HealthDataService';

// Mock HealthDataService
class MockHealthDataService extends HealthDataService {
  async initialize(_permissions: HealthPermissions): Promise<InitResult> {
    return { success: true, grantedPermissions: [] };
  }

  async checkAuthorizationStatus(_permissions: HealthPermissions): Promise<AuthStatus> {
    return AuthStatus.AUTHORIZED;
  }

  async getStepCount(_startDate: Date, _endDate: Date): Promise<number> {
    return 5000;
  }

  async getSleepDuration(_startDate: Date, _endDate: Date): Promise<number> {
    return 7;
  }

  async getHeartRateVariability(_startDate: Date, _endDate: Date): Promise<number> {
    return 50;
  }

  async writeMindfulMinutes(_duration: number, _timestamp: Date): Promise<boolean> {
    return true;
  }
}

describe('InteractiveSessionManager', () => {
  let sessionManager: InteractiveSessionManager;
  let mockHealthService: MockHealthDataService;

  beforeEach(() => {
    mockHealthService = new MockHealthDataService();
    sessionManager = new InteractiveSessionManager(mockHealthService);
  });

  describe('startSession', () => {
    it('should start a breathing exercise session', async () => {
      await sessionManager.startSession(SessionType.BREATHING_EXERCISE, 5);

      expect(sessionManager.isSessionActive()).toBe(true);
      const activeSession = sessionManager.getActiveSession();
      expect(activeSession).not.toBeNull();
      expect(activeSession?.type).toBe(SessionType.BREATHING_EXERCISE);
      expect(activeSession?.duration).toBe(5);
    });

    it('should throw error if session already active', async () => {
      await sessionManager.startSession(SessionType.BREATHING_EXERCISE, 5);

      await expect(sessionManager.startSession(SessionType.MEDITATION, 3)).rejects.toThrow(
        'A session is already active'
      );
    });
  });

  describe('completeSession', () => {
    it('should complete session and write mindful minutes', async () => {
      const writeSpy = jest.spyOn(mockHealthService, 'writeMindfulMinutes');

      await sessionManager.startSession(SessionType.BREATHING_EXERCISE, 5);

      // Wait a bit to simulate session duration
      await new Promise(resolve => setTimeout(resolve, 100));

      const result = await sessionManager.completeSession();

      expect(result.success).toBe(true);
      expect(result.newEmotionalState).toBe(EmotionalState.CALM);
      expect(result.healthDataWritten).toBe(true);
      expect(writeSpy).toHaveBeenCalled();
      expect(sessionManager.isSessionActive()).toBe(false);
    });

    it('should throw error if no active session', async () => {
      await expect(sessionManager.completeSession()).rejects.toThrow(
        'No active session to complete'
      );
    });
  });

  describe('cancelSession', () => {
    it('should cancel active session without writing data', async () => {
      const writeSpy = jest.spyOn(mockHealthService, 'writeMindfulMinutes');

      await sessionManager.startSession(SessionType.BREATHING_EXERCISE, 5);
      sessionManager.cancelSession();

      expect(sessionManager.isSessionActive()).toBe(false);
      expect(writeSpy).not.toHaveBeenCalled();
    });

    it('should throw error if no active session', () => {
      expect(() => sessionManager.cancelSession()).toThrow('No active session to cancel');
    });
  });

  describe('pauseSession and resumeSession', () => {
    it('should pause and resume session', async () => {
      await sessionManager.startSession(SessionType.BREATHING_EXERCISE, 5);

      sessionManager.pauseSession();
      const pausedSession = sessionManager.getActiveSession();
      expect(pausedSession?.isPaused).toBe(true);

      sessionManager.resumeSession();
      const resumedSession = sessionManager.getActiveSession();
      expect(resumedSession?.isPaused).toBe(false);
    });

    it('should throw error when pausing non-existent session', () => {
      expect(() => sessionManager.pauseSession()).toThrow('No active session to pause');
    });

    it('should throw error when resuming non-paused session', async () => {
      await sessionManager.startSession(SessionType.BREATHING_EXERCISE, 5);

      expect(() => sessionManager.resumeSession()).toThrow('Session is not paused');
    });
  });

  describe('getElapsedTime and getRemainingTime', () => {
    it('should calculate elapsed and remaining time', async () => {
      await sessionManager.startSession(SessionType.BREATHING_EXERCISE, 1); // 1 minute

      // Wait a bit longer to ensure measurable elapsed time
      await new Promise(resolve => setTimeout(resolve, 1100));

      const elapsed = sessionManager.getElapsedTime();
      const remaining = sessionManager.getRemainingTime();

      expect(elapsed).toBeGreaterThanOrEqual(1);
      expect(remaining).toBeLessThanOrEqual(59);
      expect(elapsed + remaining).toBeCloseTo(60, 1);
    });

    it('should return 0 when no session active', () => {
      expect(sessionManager.getElapsedTime()).toBe(0);
      expect(sessionManager.getRemainingTime()).toBe(0);
    });
  });
});
