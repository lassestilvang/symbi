/**
 * Performance Monitor Tests
 * 
 * Tests for performance monitoring and validation against targets.
 * Requirements: 10.1, 10.2, 10.3, 10.4
 */

import { PerformanceMonitor } from '../PerformanceMonitor';
import { MemoryMonitor } from '../MemoryMonitor';

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    PerformanceMonitor.clearData();
  });

  describe('Battery Usage Monitoring', () => {
    it('should track battery drain over 24 hours', () => {
      // Requirement 10.1: Measure battery drain over 24 hours (target <5%)
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Simulate battery readings
      PerformanceMonitor.recordBatteryLevel(100); // 24 hours ago
      PerformanceMonitor.recordBatteryLevel(96); // Now (4% drain)

      const drain = PerformanceMonitor.calculateBatteryDrain24h();
      
      expect(drain).toBe(4);
      expect(drain).toBeLessThan(5); // Within target
    });

    it('should detect excessive battery drain', () => {
      // Simulate excessive drain (>5%)
      PerformanceMonitor.recordBatteryLevel(100);
      PerformanceMonitor.recordBatteryLevel(93); // 7% drain

      const drain = PerformanceMonitor.calculateBatteryDrain24h();
      
      expect(drain).toBe(7);
      expect(drain).toBeGreaterThan(5); // Exceeds target
    });
  });

  describe('Memory Usage Monitoring', () => {
    it('should validate memory usage is under 100MB target', () => {
      // Requirement 10.4: Monitor memory footprint (target <100MB)
      const metrics = PerformanceMonitor.getPerformanceMetrics();
      
      expect(metrics.memoryUsageMB).toBeDefined();
      expect(metrics.isWithinMemoryTarget).toBe(true);
      
      // In a real test, this would check actual memory usage
      // For now, we're testing the monitoring infrastructure
    });

    it('should detect memory leaks', () => {
      const report = MemoryMonitor.getMemoryReport();
      
      expect(report.potentialLeak).toBe(false);
    });
  });

  describe('API Performance Monitoring', () => {
    it('should track API response times', () => {
      // Requirement 6.3, 8.3: Measure Gemini API response times
      PerformanceMonitor.recordAPICall('gemini-analysis', 2000, true);
      PerformanceMonitor.recordAPICall('gemini-analysis', 3000, true);
      PerformanceMonitor.recordAPICall('gemini-analysis', 4000, true);

      const avgTime = PerformanceMonitor.calculateAverageAPIResponseTime();
      
      expect(avgTime).toBe(3000);
    });

    it('should calculate 95th percentile response time', () => {
      // Requirement 10.2, 10.3: Target <5s for 95th percentile
      // Add 100 API calls with varying response times
      for (let i = 0; i < 95; i++) {
        PerformanceMonitor.recordAPICall('gemini-analysis', 2000 + i * 10, true);
      }
      // Add 5 slower calls
      for (let i = 0; i < 5; i++) {
        PerformanceMonitor.recordAPICall('gemini-analysis', 4000, true);
      }

      const p95 = PerformanceMonitor.calculateAPIResponseTimeP95();
      
      expect(p95).toBeDefined();
      expect(p95).toBeLessThan(5000); // Within target
    });

    it('should detect slow API calls', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Record a slow API call (>5s)
      PerformanceMonitor.recordAPICall('gemini-analysis', 6000, true);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Slow API call')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Animation Performance Monitoring', () => {
    it('should track foreground animation FPS', () => {
      // Requirement 10.3: Test animation frame rates
      PerformanceMonitor.recordAnimationFPS(30, false); // Foreground
      PerformanceMonitor.recordAnimationFPS(29, false);
      PerformanceMonitor.recordAnimationFPS(31, false);

      const avgFPS = PerformanceMonitor.calculateAverageFPS(false);
      
      expect(avgFPS).toBeCloseTo(30, 1);
      expect(avgFPS).toBeGreaterThanOrEqual(24); // Allow 20% tolerance
    });

    it('should track background animation FPS', () => {
      // Requirement 10.3: Reduce animation frame rate when backgrounded (10 FPS)
      PerformanceMonitor.recordAnimationFPS(10, true); // Background
      PerformanceMonitor.recordAnimationFPS(9, true);
      PerformanceMonitor.recordAnimationFPS(11, true);

      const avgFPS = PerformanceMonitor.calculateAverageFPS(true);
      
      expect(avgFPS).toBeCloseTo(10, 1);
    });

    it('should detect low FPS', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Record low FPS (below 80% of target)
      PerformanceMonitor.recordAnimationFPS(20, false); // Foreground target is 30

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Low FPS')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Performance Report Generation', () => {
    it('should generate comprehensive performance report', () => {
      // Add some test data
      PerformanceMonitor.recordBatteryLevel(100);
      PerformanceMonitor.recordBatteryLevel(96);
      PerformanceMonitor.recordAPICall('gemini-analysis', 3000, true);
      PerformanceMonitor.recordAnimationFPS(30, false);

      const report = PerformanceMonitor.generatePerformanceReport();
      
      expect(report).toContain('Performance Report');
      expect(report).toContain('Battery Usage');
      expect(report).toContain('Memory Usage');
      expect(report).toContain('API Performance');
      expect(report).toContain('Animation Performance');
    });

    it('should indicate overall pass/fail status', () => {
      // Add data that meets all targets
      PerformanceMonitor.recordBatteryLevel(100);
      PerformanceMonitor.recordBatteryLevel(97); // 3% drain
      PerformanceMonitor.recordAPICall('gemini-analysis', 3000, true);
      PerformanceMonitor.recordAnimationFPS(30, false);

      const metrics = PerformanceMonitor.getPerformanceMetrics();
      
      expect(metrics.isWithinBatteryTarget).toBe(true);
      expect(metrics.isWithinMemoryTarget).toBe(true);
      expect(metrics.isWithinApiTarget).toBe(true);
      expect(metrics.isWithinFPSTarget).toBe(true);
    });
  });

  describe('Data Export', () => {
    it('should export all performance data', () => {
      PerformanceMonitor.recordAPICall('gemini-analysis', 3000, true);
      PerformanceMonitor.recordAnimationFPS(30, false);
      PerformanceMonitor.recordBatteryLevel(100);

      const data = PerformanceMonitor.exportData();
      
      expect(data.apiCalls).toHaveLength(1);
      expect(data.animations).toHaveLength(1);
      expect(data.battery).toHaveLength(1);
      expect(data.memory).toBeDefined();
    });
  });
});
