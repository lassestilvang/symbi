import { EvolutionSystem } from '../EvolutionSystem';
import { StorageService } from '../StorageService';
import { EmotionalState } from '../../types';

// Mock StorageService
jest.mock('../StorageService');

describe('EvolutionSystem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('trackDailyState', () => {
    it('should track a daily emotional state', async () => {
      const mockGet = jest.fn().mockResolvedValue([]);
      const mockSet = jest.fn().mockResolvedValue(true);
      (StorageService.get as jest.Mock) = mockGet;
      (StorageService.set as jest.Mock) = mockSet;

      await EvolutionSystem.trackDailyState(EmotionalState.ACTIVE);

      expect(mockSet).toHaveBeenCalled();
      const setCall = mockSet.mock.calls[0];
      expect(setCall[1]).toHaveLength(1);
      expect(setCall[1][0].state).toBe(EmotionalState.ACTIVE);
    });

    it('should update existing state for the same day', async () => {
      const today = new Date().toISOString().split('T')[0];
      const mockGet = jest.fn().mockResolvedValue([
        { date: today, state: EmotionalState.RESTING }
      ]);
      const mockSet = jest.fn().mockResolvedValue(true);
      (StorageService.get as jest.Mock) = mockGet;
      (StorageService.set as jest.Mock) = mockSet;

      await EvolutionSystem.trackDailyState(EmotionalState.ACTIVE);

      expect(mockSet).toHaveBeenCalled();
      const setCall = mockSet.mock.calls[0];
      expect(setCall[1]).toHaveLength(1);
      expect(setCall[1][0].state).toBe(EmotionalState.ACTIVE);
    });
  });

  describe('checkEvolutionEligibility', () => {
    it('should return eligible when 30 days in positive states', async () => {
      const mockStates = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        state: EmotionalState.ACTIVE
      }));

      const mockGet = jest.fn().mockResolvedValue(mockStates);
      const mockGetUserProfile = jest.fn().mockResolvedValue({
        evolutionLevel: 0
      });
      (StorageService.get as jest.Mock) = mockGet;
      (StorageService.getUserProfile as jest.Mock) = mockGetUserProfile;

      const eligibility = await EvolutionSystem.checkEvolutionEligibility();

      expect(eligibility.eligible).toBe(true);
      expect(eligibility.daysInPositiveState).toBe(30);
      expect(eligibility.daysRequired).toBe(30);
    });

    it('should return not eligible when less than 30 days', async () => {
      const mockStates = Array.from({ length: 15 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        state: EmotionalState.ACTIVE
      }));

      const mockGet = jest.fn().mockResolvedValue(mockStates);
      const mockGetUserProfile = jest.fn().mockResolvedValue({
        evolutionLevel: 0
      });
      (StorageService.get as jest.Mock) = mockGet;
      (StorageService.getUserProfile as jest.Mock) = mockGetUserProfile;

      const eligibility = await EvolutionSystem.checkEvolutionEligibility();

      expect(eligibility.eligible).toBe(false);
      expect(eligibility.daysInPositiveState).toBe(15);
    });

    it('should not be eligible if max evolution level reached', async () => {
      const mockStates = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        state: EmotionalState.VIBRANT
      }));

      const mockGet = jest.fn().mockResolvedValue(mockStates);
      const mockGetUserProfile = jest.fn().mockResolvedValue({
        evolutionLevel: 5 // Max level
      });
      (StorageService.get as jest.Mock) = mockGet;
      (StorageService.getUserProfile as jest.Mock) = mockGetUserProfile;

      const eligibility = await EvolutionSystem.checkEvolutionEligibility();

      expect(eligibility.eligible).toBe(false);
    });
  });

  describe('getEvolutionHistory', () => {
    it('should return evolution records sorted by timestamp', async () => {
      const mockRecords = [
        {
          id: '1',
          timestamp: new Date('2024-01-01'),
          evolutionLevel: 1,
          appearanceUrl: 'url1',
          daysInPositiveState: 30,
          dominantStates: [EmotionalState.ACTIVE]
        },
        {
          id: '2',
          timestamp: new Date('2024-02-01'),
          evolutionLevel: 2,
          appearanceUrl: 'url2',
          daysInPositiveState: 30,
          dominantStates: [EmotionalState.VIBRANT]
        }
      ];

      const mockGetEvolutionRecords = jest.fn().mockResolvedValue(mockRecords);
      (StorageService.getEvolutionRecords as jest.Mock) = mockGetEvolutionRecords;

      const history = await EvolutionSystem.getEvolutionHistory();

      expect(history).toHaveLength(2);
      // Should be sorted newest first
      expect(history[0].evolutionLevel).toBe(2);
      expect(history[1].evolutionLevel).toBe(1);
    });
  });

  describe('getDominantStates', () => {
    it('should return top 3 most frequent states', async () => {
      const mockStates = [
        ...Array.from({ length: 15 }, (_, i) => ({ 
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
          state: EmotionalState.ACTIVE 
        })),
        ...Array.from({ length: 10 }, (_, i) => ({ 
          date: new Date(Date.now() - (i + 15) * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
          state: EmotionalState.VIBRANT 
        })),
        ...Array.from({ length: 5 }, (_, i) => ({ 
          date: new Date(Date.now() - (i + 25) * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
          state: EmotionalState.CALM 
        }))
      ];

      const mockGet = jest.fn().mockResolvedValue(mockStates);
      (StorageService.get as jest.Mock) = mockGet;

      const dominantStates = await EvolutionSystem.getDominantStates(30);

      expect(dominantStates).toHaveLength(3);
      expect(dominantStates[0]).toBe(EmotionalState.ACTIVE);
      expect(dominantStates[1]).toBe(EmotionalState.VIBRANT);
      expect(dominantStates[2]).toBe(EmotionalState.CALM);
    });
  });

  describe('triggerEvolution', () => {
    it('should trigger evolution when eligible', async () => {
      const mockAIService = {
        generateEvolvedAppearance: jest.fn().mockResolvedValue('data:image/png;base64,test')
      };

      const mockGet = jest.fn().mockResolvedValue(
        Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          state: EmotionalState.ACTIVE
        }))
      );
      const mockGetUserProfile = jest.fn().mockResolvedValue({
        id: 'test',
        evolutionLevel: 0,
        createdAt: new Date(),
        preferences: {},
        thresholds: {},
        goals: {},
        totalDaysActive: 30
      });
      const mockSetUserProfile = jest.fn().mockResolvedValue(true);
      const mockAddEvolutionRecord = jest.fn().mockResolvedValue(true);
      const mockSet = jest.fn().mockResolvedValue(true);

      (StorageService.get as jest.Mock) = mockGet;
      (StorageService.getUserProfile as jest.Mock) = mockGetUserProfile;
      (StorageService.setUserProfile as jest.Mock) = mockSetUserProfile;
      (StorageService.addEvolutionRecord as jest.Mock) = mockAddEvolutionRecord;
      (StorageService.set as jest.Mock) = mockSet;

      const result = await EvolutionSystem.triggerEvolution(mockAIService);

      expect(result.success).toBe(true);
      expect(result.evolutionLevel).toBe(1);
      expect(result.newAppearanceUrl).toBe('data:image/png;base64,test');
      expect(mockAIService.generateEvolvedAppearance).toHaveBeenCalled();
      expect(mockAddEvolutionRecord).toHaveBeenCalled();
      expect(mockSetUserProfile).toHaveBeenCalled();
    });

    it('should not trigger evolution when not eligible', async () => {
      const mockAIService = {
        generateEvolvedAppearance: jest.fn()
      };

      const mockGet = jest.fn().mockResolvedValue([]);
      const mockGetUserProfile = jest.fn().mockResolvedValue({
        evolutionLevel: 0
      });

      (StorageService.get as jest.Mock) = mockGet;
      (StorageService.getUserProfile as jest.Mock) = mockGetUserProfile;

      const result = await EvolutionSystem.triggerEvolution(mockAIService);

      expect(result.success).toBe(false);
      expect(mockAIService.generateEvolvedAppearance).not.toHaveBeenCalled();
    });
  });
});
