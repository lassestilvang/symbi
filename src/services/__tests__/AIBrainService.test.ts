import { AIBrainService } from '../AIBrainService';
import { EmotionalState, HealthMetrics, HealthGoals } from '../../types';

/**
 * Unit tests for AIBrainService
 * 
 * Tests Gemini API integration, prompt construction, response parsing,
 * timeout and retry logic, and caching behavior.
 * 
 * Requirements: 5.3, 5.4, 6.1, 6.2, 6.3, 6.4
 */

// Mock fetch globally
global.fetch = jest.fn();

describe('AIBrainService', () => {
  let service: AIBrainService;
  const mockApiKey = 'test-api-key-12345';

  beforeEach(() => {
    service = new AIBrainService(mockApiKey);
    jest.clearAllMocks();
    // Clear any cached data
    jest.clearAllTimers();
  });

  describe('analyzeHealthData', () => {
    const mockMetrics: HealthMetrics = {
      steps: 8500,
      sleepHours: 7.5,
      hrv: 65,
    };

    const mockGoals: HealthGoals = {
      targetSteps: 10000,
      targetSleepHours: 8,
      targetHRV: 60,
    };

    it('should successfully analyze health data and return emotional state', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: 'Active',
                },
              ],
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.analyzeHealthData(mockMetrics, mockGoals);

      expect(result.emotionalState).toBe(EmotionalState.ACTIVE);
      expect(result.confidence).toBeGreaterThan(0);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle Vibrant state response', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: 'Vibrant',
                },
              ],
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.analyzeHealthData(mockMetrics, mockGoals);

      expect(result.emotionalState).toBe(EmotionalState.VIBRANT);
    });

    it('should handle Calm state response', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: 'Calm',
                },
              ],
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.analyzeHealthData(mockMetrics, mockGoals);

      expect(result.emotionalState).toBe(EmotionalState.CALM);
    });

    it('should handle Tired state response', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: 'Tired',
                },
              ],
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.analyzeHealthData(mockMetrics, mockGoals);

      expect(result.emotionalState).toBe(EmotionalState.TIRED);
    });

    it('should handle Stressed state response', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: 'Stressed',
                },
              ],
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.analyzeHealthData(mockMetrics, mockGoals);

      expect(result.emotionalState).toBe(EmotionalState.STRESSED);
    });

    it('should handle Anxious state response', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: 'Anxious',
                },
              ],
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.analyzeHealthData(mockMetrics, mockGoals);

      expect(result.emotionalState).toBe(EmotionalState.ANXIOUS);
    });

    it('should handle Rested state response', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: 'Rested',
                },
              ],
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.analyzeHealthData(mockMetrics, mockGoals);

      expect(result.emotionalState).toBe(EmotionalState.RESTED);
    });

    it('should retry on failure and succeed on second attempt', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: 'Active',
                },
              ],
            },
          },
        ],
      };

      // First call fails, second succeeds
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

      const result = await service.analyzeHealthData(mockMetrics, mockGoals);

      expect(result.emotionalState).toBe(EmotionalState.ACTIVE);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should throw error after max retries', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(service.analyzeHealthData(mockMetrics, mockGoals)).rejects.toThrow();
      
      // Should have tried 2 times (initial + 1 retry)
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle API error responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(service.analyzeHealthData(mockMetrics, mockGoals)).rejects.toThrow();
    });

    it('should handle invalid response format', async () => {
      const mockResponse = {
        candidates: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await expect(service.analyzeHealthData(mockMetrics, mockGoals)).rejects.toThrow();
    });

    it('should handle case-insensitive state names', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: 'VIBRANT',
                },
              ],
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.analyzeHealthData(mockMetrics, mockGoals);

      expect(result.emotionalState).toBe(EmotionalState.VIBRANT);
    });

    it('should include API key in request', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: 'Active',
                },
              ],
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await service.analyzeHealthData(mockMetrics, mockGoals);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[0]).toContain(mockApiKey);
    });

    it('should construct proper request body with metrics', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: 'Active',
                },
              ],
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await service.analyzeHealthData(mockMetrics, mockGoals);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      
      expect(requestBody.contents).toBeDefined();
      expect(requestBody.contents[0].parts[0].text).toContain('Steps: 8500');
      expect(requestBody.contents[0].parts[0].text).toContain('Sleep: 7.5 hours');
      expect(requestBody.contents[0].parts[0].text).toContain('HRV: 65ms');
    });

    it('should handle metrics without sleep data', async () => {
      const metricsWithoutSleep: HealthMetrics = {
        steps: 8500,
      };

      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: 'Active',
                },
              ],
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.analyzeHealthData(metricsWithoutSleep, mockGoals);

      expect(result.emotionalState).toBe(EmotionalState.ACTIVE);
      
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      expect(requestBody.contents[0].parts[0].text).toContain('not available');
    });
  });

  describe('prompt construction', () => {
    it('should include all health metrics in prompt', async () => {
      const metrics: HealthMetrics = {
        steps: 10000,
        sleepHours: 8,
        hrv: 70,
      };

      const goals: HealthGoals = {
        targetSteps: 10000,
        targetSleepHours: 8,
        targetHRV: 60,
      };

      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: 'Vibrant',
                },
              ],
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await service.analyzeHealthData(metrics, goals);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      const prompt = requestBody.contents[0].parts[0].text;

      expect(prompt).toContain('Steps: 10000');
      expect(prompt).toContain('goal: 10000');
      expect(prompt).toContain('Sleep: 8 hours');
      expect(prompt).toContain('goal: 8 hours');
      expect(prompt).toContain('HRV: 70ms');
    });
  });
});
