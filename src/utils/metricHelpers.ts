/**
 * Metric Helper Utilities
 *
 * Type-safe utilities for working with health metrics.
 */

import { HistoricalDataPoint } from '../types';
import { METRIC_CONFIG } from '../constants/theme';

export type MetricType = 'steps' | 'sleep' | 'hrv';

/**
 * Get the numeric value for a specific metric from a data point
 */
export const getMetricValue = (point: HistoricalDataPoint, metricType: MetricType): number => {
  switch (metricType) {
    case 'steps':
      return point.steps;
    case 'sleep':
      return point.sleepHours ?? 0;
    case 'hrv':
      return point.hrv ?? 0;
  }
};

/**
 * Check if a data point has a valid value for the given metric
 */
export const hasMetricValue = (point: HistoricalDataPoint, metricType: MetricType): boolean => {
  const value = getMetricValue(point, metricType);
  return value > 0;
};

/**
 * Filter data points that have valid values for the given metric
 */
export const filterByMetric = (
  data: HistoricalDataPoint[],
  metricType: MetricType
): HistoricalDataPoint[] => {
  return data.filter(point => hasMetricValue(point, metricType));
};

/**
 * Format a metric value with appropriate precision and suffix
 */
export const formatMetricValue = (value: number, metricType: MetricType): string => {
  const config = METRIC_CONFIG[metricType];
  return `${value.toFixed(config.decimals)}${config.suffix}`;
};

/**
 * Get the configuration for a specific metric type
 */
export const getMetricConfig = (metricType: MetricType) => {
  return METRIC_CONFIG[metricType];
};
