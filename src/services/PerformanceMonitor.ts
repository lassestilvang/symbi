/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * PerformanceMonitor
 *
 * Comprehensive performance monitoring for battery, memory, API response times,
 * and animation frame rates.
 *
 * Requirements: 10.1, 10.2, 10.3, 10.4
 */

// import { Platform } from 'react-native';
import { MemoryMonitor } from './MemoryMonitor';

export interface PerformanceMetrics {
  // Battery metrics (Requirement 10.1)
  batteryDrainPercent24h?: number;
  isWithinBatteryTarget: boolean; // Target: <5%

  // Memory metrics (Requirement 10.4)
  memoryUsageMB: number;
  isWithinMemoryTarget: boolean; // Target: <100MB

  // API metrics (Requirements 6.3, 8.3)
  geminiApiResponseTimeMs?: number;
  geminiApiP95ResponseTimeMs?: number;
  isWithinApiTarget: boolean; // Target: <5s for 95th percentile

  // Animation metrics (Requirement 10.3)
  animationFPS?: number;
  isWithinFPSTarget: boolean; // Target: 30 FPS foreground, 10 FPS background

  timestamp: Date;
}

export interface APICallMetric {
  endpoint: string;
  responseTimeMs: number;
  success: boolean;
  timestamp: Date;
}

export interface AnimationMetric {
  fps: number;
  isBackground: boolean;
  timestamp: Date;
}

export class PerformanceMonitor {
  // Targets
  private static readonly BATTERY_TARGET_PERCENT = 5; // <5% per 24 hours
  private static readonly MEMORY_TARGET_MB = 100; // <100MB
  private static readonly API_P95_TARGET_MS = 5000; // <5s for 95th percentile
  private static readonly FPS_TARGET_FOREGROUND = 30;
  private static readonly FPS_TARGET_BACKGROUND = 10;

  // Metrics storage
  private static apiCallHistory: APICallMetric[] = [];
  private static animationHistory: AnimationMetric[] = [];
  private static batteryHistory: { level: number; timestamp: Date }[] = [];

  // Max history sizes
  private static readonly MAX_API_HISTORY = 100;
  private static readonly MAX_ANIMATION_HISTORY = 100;
  private static readonly MAX_BATTERY_HISTORY = 48; // 48 hours of hourly readings

  /**
   * Record an API call
   */
  static recordAPICall(endpoint: string, responseTimeMs: number, success: boolean): void {
    const metric: APICallMetric = {
      endpoint,
      responseTimeMs,
      success,
      timestamp: new Date(),
    };

    this.apiCallHistory.push(metric);

    // Trim history
    if (this.apiCallHistory.length > this.MAX_API_HISTORY) {
      this.apiCallHistory.shift();
    }

    // Log slow API calls
    if (responseTimeMs > this.API_P95_TARGET_MS) {
      console.warn(`⚠️ Slow API call: ${endpoint} took ${responseTimeMs}ms`);
    }
  }

  /**
   * Record animation frame rate
   */
  static recordAnimationFPS(fps: number, isBackground: boolean): void {
    const metric: AnimationMetric = {
      fps,
      isBackground,
      timestamp: new Date(),
    };

    this.animationHistory.push(metric);

    // Trim history
    if (this.animationHistory.length > this.MAX_ANIMATION_HISTORY) {
      this.animationHistory.shift();
    }

    // Check if FPS is within target
    const target = isBackground ? this.FPS_TARGET_BACKGROUND : this.FPS_TARGET_FOREGROUND;

    if (fps < target * 0.8) {
      // Allow 20% tolerance
      console.warn(
        `⚠️ Low FPS: ${fps.toFixed(1)} (target: ${target}, background: ${isBackground})`
      );
    }
  }

  /**
   * Record battery level
   */
  static recordBatteryLevel(level: number): void {
    this.batteryHistory.push({
      level,
      timestamp: new Date(),
    });

    // Trim history
    if (this.batteryHistory.length > this.MAX_BATTERY_HISTORY) {
      this.batteryHistory.shift();
    }
  }

  /**
   * Calculate battery drain over 24 hours
   */
  static calculateBatteryDrain24h(): number | null {
    if (this.batteryHistory.length < 2) {
      return null;
    }

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Find readings closest to 24 hours ago and now
    const oldReading = this.batteryHistory.find(reading => reading.timestamp >= twentyFourHoursAgo);
    const latestReading = this.batteryHistory[this.batteryHistory.length - 1];

    if (!oldReading) {
      return null;
    }

    return oldReading.level - latestReading.level;
  }

  /**
   * Calculate 95th percentile API response time
   */
  static calculateAPIResponseTimeP95(): number | null {
    if (this.apiCallHistory.length === 0) {
      return null;
    }

    const responseTimes = this.apiCallHistory
      .filter(call => call.success)
      .map(call => call.responseTimeMs)
      .sort((a, b) => a - b);

    if (responseTimes.length === 0) {
      return null;
    }

    const p95Index = Math.floor(responseTimes.length * 0.95);
    return responseTimes[p95Index];
  }

  /**
   * Calculate average API response time
   */
  static calculateAverageAPIResponseTime(): number | null {
    const successfulCalls = this.apiCallHistory.filter(call => call.success);

    if (successfulCalls.length === 0) {
      return null;
    }

    const sum = successfulCalls.reduce((acc, call) => acc + call.responseTimeMs, 0);
    return sum / successfulCalls.length;
  }

  /**
   * Calculate average animation FPS
   */
  static calculateAverageFPS(isBackground?: boolean): number | null {
    let metrics = this.animationHistory;

    if (isBackground !== undefined) {
      metrics = metrics.filter(m => m.isBackground === isBackground);
    }

    if (metrics.length === 0) {
      return null;
    }

    const sum = metrics.reduce((acc, m) => acc + m.fps, 0);
    return sum / metrics.length;
  }

  /**
   * Get comprehensive performance metrics
   */
  static getPerformanceMetrics(): PerformanceMetrics {
    const memoryStats = MemoryMonitor.getCurrentMemoryStats();
    const batteryDrain = this.calculateBatteryDrain24h();
    const apiP95 = this.calculateAPIResponseTimeP95();
    const avgFPS = this.calculateAverageFPS();

    return {
      batteryDrainPercent24h: batteryDrain ?? undefined,
      isWithinBatteryTarget:
        batteryDrain !== null ? batteryDrain < this.BATTERY_TARGET_PERCENT : true,

      memoryUsageMB: memoryStats.usedMemoryMB,
      isWithinMemoryTarget: memoryStats.isWithinTarget,

      geminiApiP95ResponseTimeMs: apiP95 ?? undefined,
      isWithinApiTarget: apiP95 !== null ? apiP95 < this.API_P95_TARGET_MS : true,

      animationFPS: avgFPS ?? undefined,
      isWithinFPSTarget: avgFPS !== null ? avgFPS >= this.FPS_TARGET_FOREGROUND * 0.8 : true,

      timestamp: new Date(),
    };
  }

  /**
   * Generate performance report
   */
  static generatePerformanceReport(): string {
    const metrics = this.getPerformanceMetrics();
    const memoryReport = MemoryMonitor.getMemoryReport();

    let report = '=== Performance Report ===\n\n';

    // Battery
    report += '📱 Battery Usage:\n';
    if (metrics.batteryDrainPercent24h !== undefined) {
      report += `  Drain (24h): ${metrics.batteryDrainPercent24h.toFixed(2)}%\n`;
      report += `  Target: <${this.BATTERY_TARGET_PERCENT}%\n`;
      report += `  Status: ${metrics.isWithinBatteryTarget ? '✓ PASS' : '✗ FAIL'}\n`;
    } else {
      report += '  No data available (need 24h of monitoring)\n';
    }
    report += '\n';

    // Memory
    report += '💾 Memory Usage:\n';
    report += `  Current: ${memoryReport.current.toFixed(2)}MB\n`;
    report += `  Average: ${memoryReport.average.toFixed(2)}MB\n`;
    report += `  Peak: ${memoryReport.peak.toFixed(2)}MB\n`;
    report += `  Target: <${memoryReport.target}MB\n`;
    report += `  Status: ${metrics.isWithinMemoryTarget ? '✓ PASS' : '✗ FAIL'}\n`;
    if (memoryReport.potentialLeak) {
      report += '  ⚠️ Potential memory leak detected!\n';
    }
    report += '\n';

    // API Performance
    report += '🌐 API Performance:\n';
    const avgAPI = this.calculateAverageAPIResponseTime();
    if (avgAPI !== null) {
      report += `  Average: ${avgAPI.toFixed(0)}ms\n`;
    }
    if (metrics.geminiApiP95ResponseTimeMs !== undefined) {
      report += `  P95: ${metrics.geminiApiP95ResponseTimeMs.toFixed(0)}ms\n`;
      report += `  Target: <${this.API_P95_TARGET_MS}ms\n`;
      report += `  Status: ${metrics.isWithinApiTarget ? '✓ PASS' : '✗ FAIL'}\n`;
    } else {
      report += '  No API calls recorded yet\n';
    }
    report += '\n';

    // Animation Performance
    report += '🎬 Animation Performance:\n';
    const fgFPS = this.calculateAverageFPS(false);
    const bgFPS = this.calculateAverageFPS(true);
    if (fgFPS !== null) {
      report += `  Foreground: ${fgFPS.toFixed(1)} FPS (target: ${this.FPS_TARGET_FOREGROUND})\n`;
    }
    if (bgFPS !== null) {
      report += `  Background: ${bgFPS.toFixed(1)} FPS (target: ${this.FPS_TARGET_BACKGROUND})\n`;
    }
    if (metrics.animationFPS !== undefined) {
      report += `  Status: ${metrics.isWithinFPSTarget ? '✓ PASS' : '✗ FAIL'}\n`;
    } else {
      report += '  No animation data recorded yet\n';
    }
    report += '\n';

    // Overall Status
    const allPassing =
      metrics.isWithinBatteryTarget &&
      metrics.isWithinMemoryTarget &&
      metrics.isWithinApiTarget &&
      metrics.isWithinFPSTarget;

    report += '📊 Overall Status:\n';
    report += `  ${allPassing ? '✓ ALL TARGETS MET' : '✗ SOME TARGETS NOT MET'}\n`;

    return report;
  }

  /**
   * Clear all performance data
   */
  static clearData(): void {
    this.apiCallHistory = [];
    this.animationHistory = [];
    this.batteryHistory = [];
    MemoryMonitor.clearHistory();
    console.log('Performance data cleared');
  }

  /**
   * Export performance data for analysis
   */
  static exportData(): {
    apiCalls: APICallMetric[];
    animations: AnimationMetric[];
    battery: { level: number; timestamp: Date }[];
    memory: any;
  } {
    return {
      apiCalls: [...this.apiCallHistory],
      animations: [...this.animationHistory],
      battery: [...this.batteryHistory],
      memory: MemoryMonitor.getMemoryHistory(),
    };
  }
}
