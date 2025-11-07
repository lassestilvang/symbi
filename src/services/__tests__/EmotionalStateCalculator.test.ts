import { EmotionalStateCalculator } from '../EmotionalStateCalculator';
import { EmotionalState, StepThresholds } from '../../types';

/**
 * Unit tests for EmotionalStateCalculator
 * 
 * Tests threshold logic with various step counts and edge cases.
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */
describe('EmotionalStateCalculator', () => {
  describe('calculateStateFromSteps', () => {
    const defaultThresholds: StepThresholds = {
      sadThreshold: 2000,
      activeThreshold: 8000,
    };

    describe('with default thresholds', () => {
      it('should return SAD for 0 steps', () => {
        const result = EmotionalStateCalculator.calculateStateFromSteps(0, defaultThresholds);
        expect(result).toBe(EmotionalState.SAD);
      });

      it('should return SAD for 1000 steps', () => {
        const result = EmotionalStateCalculator.calculateStateFromSteps(1000, defaultThresholds);
        expect(result).toBe(EmotionalState.SAD);
      });

      it('should return SAD for steps just below sad threshold', () => {
        const result = EmotionalStateCalculator.calculateStateFromSteps(1999, defaultThresholds);
        expect(result).toBe(EmotionalState.SAD);
      });

      it('should return RESTING for steps at sad threshold', () => {
        const result = EmotionalStateCalculator.calculateStateFromSteps(2000, defaultThresholds);
        expect(result).toBe(EmotionalState.RESTING);
      });

      it('should return RESTING for 5000 steps', () => {
        const result = EmotionalStateCalculator.calculateStateFromSteps(5000, defaultThresholds);
        expect(result).toBe(EmotionalState.RESTING);
      });

      it('should return RESTING for steps just below active threshold', () => {
        const result = EmotionalStateCalculator.calculateStateFromSteps(7999, defaultThresholds);
        expect(result).toBe(EmotionalState.RESTING);
      });

      it('should return ACTIVE for steps at active threshold', () => {
        const result = EmotionalStateCalculator.calculateStateFromSteps(8000, defaultThresholds);
        expect(result).toBe(EmotionalState.ACTIVE);
      });

      it('should return ACTIVE for 10000 steps', () => {
        const result = EmotionalStateCalculator.calculateStateFromSteps(10000, defaultThresholds);
        expect(result).toBe(EmotionalState.ACTIVE);
      });

      it('should return ACTIVE for extremely high step count', () => {
        const result = EmotionalStateCalculator.calculateStateFromSteps(100000, defaultThresholds);
        expect(result).toBe(EmotionalState.ACTIVE);
      });
    });

    describe('edge cases', () => {
      it('should handle negative steps by treating as 0', () => {
        const result = EmotionalStateCalculator.calculateStateFromSteps(-100, defaultThresholds);
        expect(result).toBe(EmotionalState.SAD);
      });

      it('should handle very large negative numbers', () => {
        const result = EmotionalStateCalculator.calculateStateFromSteps(-999999, defaultThresholds);
        expect(result).toBe(EmotionalState.SAD);
      });

      it('should handle decimal step counts', () => {
        const result = EmotionalStateCalculator.calculateStateFromSteps(5000.5, defaultThresholds);
        expect(result).toBe(EmotionalState.RESTING);
      });
    });

    describe('with custom thresholds', () => {
      const customThresholds: StepThresholds = {
        sadThreshold: 5000,
        activeThreshold: 12000,
      };

      it('should return SAD for steps below custom sad threshold', () => {
        const result = EmotionalStateCalculator.calculateStateFromSteps(3000, customThresholds);
        expect(result).toBe(EmotionalState.SAD);
      });

      it('should return RESTING for steps between custom thresholds', () => {
        const result = EmotionalStateCalculator.calculateStateFromSteps(8000, customThresholds);
        expect(result).toBe(EmotionalState.RESTING);
      });

      it('should return ACTIVE for steps above custom active threshold', () => {
        const result = EmotionalStateCalculator.calculateStateFromSteps(15000, customThresholds);
        expect(result).toBe(EmotionalState.ACTIVE);
      });

      it('should handle very low custom thresholds', () => {
        const lowThresholds: StepThresholds = {
          sadThreshold: 100,
          activeThreshold: 500,
        };
        
        expect(EmotionalStateCalculator.calculateStateFromSteps(50, lowThresholds))
          .toBe(EmotionalState.SAD);
        expect(EmotionalStateCalculator.calculateStateFromSteps(300, lowThresholds))
          .toBe(EmotionalState.RESTING);
        expect(EmotionalStateCalculator.calculateStateFromSteps(600, lowThresholds))
          .toBe(EmotionalState.ACTIVE);
      });

      it('should handle very high custom thresholds', () => {
        const highThresholds: StepThresholds = {
          sadThreshold: 15000,
          activeThreshold: 25000,
        };
        
        expect(EmotionalStateCalculator.calculateStateFromSteps(10000, highThresholds))
          .toBe(EmotionalState.SAD);
        expect(EmotionalStateCalculator.calculateStateFromSteps(20000, highThresholds))
          .toBe(EmotionalState.RESTING);
        expect(EmotionalStateCalculator.calculateStateFromSteps(30000, highThresholds))
          .toBe(EmotionalState.ACTIVE);
      });
    });

    describe('state transitions', () => {
      it('should transition from SAD to RESTING at threshold boundary', () => {
        const thresholds: StepThresholds = {
          sadThreshold: 2000,
          activeThreshold: 8000,
        };

        const sadResult = EmotionalStateCalculator.calculateStateFromSteps(1999, thresholds);
        const restingResult = EmotionalStateCalculator.calculateStateFromSteps(2000, thresholds);

        expect(sadResult).toBe(EmotionalState.SAD);
        expect(restingResult).toBe(EmotionalState.RESTING);
      });

      it('should transition from RESTING to ACTIVE at threshold boundary', () => {
        const thresholds: StepThresholds = {
          sadThreshold: 2000,
          activeThreshold: 8000,
        };

        const restingResult = EmotionalStateCalculator.calculateStateFromSteps(7999, thresholds);
        const activeResult = EmotionalStateCalculator.calculateStateFromSteps(8000, thresholds);

        expect(restingResult).toBe(EmotionalState.RESTING);
        expect(activeResult).toBe(EmotionalState.ACTIVE);
      });
    });
  });

  describe('calculateStateFromMultipleMetrics', () => {
    it('should fallback to rule-based calculation in Phase 1', async () => {
      const metrics = {
        steps: 5000,
      };
      
      const goals = {
        targetSteps: 10000,
        targetSleepHours: 8,
      };

      const result = await EmotionalStateCalculator.calculateStateFromMultipleMetrics(
        metrics,
        goals
      );

      expect(result).toBe(EmotionalState.RESTING);
    });
  });
});
