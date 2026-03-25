import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LineChart } from 'react-native-chart-kit';
import { HistoricalDataPoint } from '../types';
import { useUserPreferencesStore } from '../stores/userPreferencesStore';
import { HALLOWEEN_COLORS } from '../constants/theme';
import {
  MetricType,
  getMetricValue,
  filterByMetric,
  formatMetricValue,
  getMetricConfig,
} from '../utils/metricHelpers';
import { formatShortDate, formatDisplayDate } from '../utils/dateHelpers';

interface HealthMetricsChartProps {
  data: HistoricalDataPoint[];
  metricType: MetricType;
  color: string;
  onDataPointPress?: (point: HistoricalDataPoint) => void;
}

export const HealthMetricsChart: React.FC<HealthMetricsChartProps> = ({
  data,
  metricType,
  color,
  onDataPointPress,
}) => {
  const [selectedPoint, setSelectedPoint] = useState<HistoricalDataPoint | null>(null);
  const [chartWidth, setChartWidth] = useState(Dimensions.get('window').width - 32);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const { profile } = useUserPreferencesStore();

  // Memoize filtered data to prevent unnecessary recalculations
  const filteredData = useMemo(() => filterByMetric(data, metricType), [data, metricType]);

  // Memoize metric configuration
  const config = useMemo(() => getMetricConfig(metricType), [metricType]);

  // Memoize chart data transformation
  const chartData = useMemo(
    () => ({
      labels: filteredData.map(point => formatShortDate(point.date)),
      datasets: [
        {
          data: filteredData.map(point => getMetricValue(point, metricType)),
          color: (_opacity = 1) => color || config.color,
          strokeWidth: 3,
        },
      ],
    }),
    [filteredData, metricType, color, config.color]
  );

  // Handle dimension changes
  // Use container width if available, otherwise fall back to window width
  useEffect(() => {
    if (containerWidth !== null) {
      setChartWidth(containerWidth - 32);
    }
  }, [containerWidth]);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      if (containerWidth === null) {
        setChartWidth(window.width - 32);
      }
    });

    return () => subscription?.remove();
  }, []);

  // Early return for empty data
  if (filteredData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText} accessibilityLabel={`No ${config.label} data available`}>
          👻 No data available
        </Text>
      </View>
    );
  }

  // Memoize haptic feedback handler
  const triggerHapticFeedback = useCallback(async () => {
    if (profile?.preferences.hapticFeedbackEnabled) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.log('Haptic feedback not available:', error);
      }
    }
  }, [profile?.preferences.hapticFeedbackEnabled]);

  // Handle data point selection
  const handleDataPointClick = useCallback(
    async (data: { index?: number }) => {
      if (data.index !== undefined && filteredData[data.index]) {
        const point = filteredData[data.index];
        await triggerHapticFeedback();
        setSelectedPoint(point);
        onDataPointPress?.(point);
      }
    },
    [filteredData, triggerHapticFeedback, onDataPointPress]
  );

  // Handle tooltip close
  const handleCloseTooltip = useCallback(async () => {
    await triggerHapticFeedback();
    setSelectedPoint(null);
  }, [triggerHapticFeedback]);

  // Generate accessibility label for chart
  const chartAccessibilityLabel = useMemo(() => {
    const values = filteredData.map(point => getMetricValue(point, metricType));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    return `${config.label} chart showing ${filteredData.length} data points. Range from ${formatMetricValue(min, metricType)} to ${formatMetricValue(max, metricType)}, average ${formatMetricValue(avg, metricType)}. Tap on data points for details.`;
  }, [filteredData, metricType, config.label]);

  return (
    <View
      style={styles.container}
      onLayout={event => {
        const { width } = event.nativeEvent.layout;
        setContainerWidth(width);
      }}>
      <Text style={styles.title} accessibilityRole="header">
        {config.label}
      </Text>
      <View
        accessible={true}
        accessibilityLabel={chartAccessibilityLabel}
        accessibilityRole="image"
        accessibilityHint="Interactive chart. Tap on data points to see detailed information">
        <LineChart
          data={chartData}
          width={chartWidth}
          height={220}
          chartConfig={{
            backgroundColor: HALLOWEEN_COLORS.cardBg,
            backgroundGradientFrom: HALLOWEEN_COLORS.cardBg,
            backgroundGradientTo: HALLOWEEN_COLORS.darkBg,
            decimalPlaces: config.decimals,
            color: (_opacity = 1) => color || config.color,
            labelColor: (_opacity = 1) => HALLOWEEN_COLORS.ghostWhite,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: color || config.color,
            },
            propsForBackgroundLines: {
              strokeDasharray: '',
              stroke: HALLOWEEN_COLORS.primary,
              strokeOpacity: 0.1,
            },
          }}
          bezier
          style={styles.chart}
          onDataPointClick={handleDataPointClick}
          withInnerLines
          withOuterLines
          withVerticalLabels
          withHorizontalLabels
          withDots
          withShadow={false}
        />
      </View>
      {selectedPoint && (
        <Tooltip point={selectedPoint} metricType={metricType} onClose={handleCloseTooltip} />
      )}
    </View>
  );
};

/**
 * Tooltip Component - Extracted for better separation of concerns
 */
interface TooltipProps {
  point: HistoricalDataPoint;
  metricType: MetricType;
  onClose: () => void;
}

const Tooltip: React.FC<TooltipProps> = ({ point, metricType, onClose }) => {
  const tooltipAccessibilityLabel = `Data point details for ${formatDisplayDate(new Date(point.date))}. ${formatMetricValue(getMetricValue(point, metricType), metricType)}. Emotional state: ${point.emotionalState}. ${point.steps > 0 && metricType !== 'steps' ? `Steps: ${point.steps.toLocaleString()}.` : ''} ${point.sleepHours !== undefined && metricType !== 'sleep' ? `Sleep: ${point.sleepHours.toFixed(1)} hours.` : ''} ${point.hrv !== undefined && metricType !== 'hrv' ? `HRV: ${point.hrv.toFixed(0)} milliseconds.` : ''}`;

  return (
    <TouchableOpacity
      style={styles.tooltip}
      onPress={onClose}
      activeOpacity={0.9}
      accessible={true}
      accessibilityLabel={tooltipAccessibilityLabel}
      accessibilityRole="button"
      accessibilityHint="Tap to close tooltip">
      <View style={styles.tooltipHeader}>
        <Text style={styles.tooltipDate}>{formatDisplayDate(new Date(point.date))}</Text>
        <Text style={styles.tooltipClose} accessibilityElementsHidden={true}>
          ✕
        </Text>
      </View>
      <Text style={styles.tooltipValue}>
        {formatMetricValue(getMetricValue(point, metricType), metricType)}
      </Text>
      <View style={styles.tooltipDivider} accessibilityElementsHidden={true} />
      <View style={styles.tooltipDetails}>
        <Text style={styles.tooltipLabel}>Emotional State</Text>
        <Text style={styles.tooltipState}>
          <Text accessibilityElementsHidden={true}>👻 </Text>
          {point.emotionalState.charAt(0).toUpperCase() + point.emotionalState.slice(1)}
        </Text>
      </View>
      {point.steps > 0 && metricType !== 'steps' && (
        <View style={styles.tooltipDetails}>
          <Text style={styles.tooltipLabel}>Steps</Text>
          <Text style={styles.tooltipDetailValue}>
            <Text accessibilityElementsHidden={true}>👣 </Text>
            {point.steps.toLocaleString()}
          </Text>
        </View>
      )}
      {point.sleepHours !== undefined && metricType !== 'sleep' && (
        <View style={styles.tooltipDetails}>
          <Text style={styles.tooltipLabel}>Sleep</Text>
          <Text style={styles.tooltipDetailValue}>
            <Text accessibilityElementsHidden={true}>😴 </Text>
            {point.sleepHours.toFixed(1)}h
          </Text>
        </View>
      )}
      {point.hrv !== undefined && metricType !== 'hrv' && (
        <View style={styles.tooltipDetails}>
          <Text style={styles.tooltipLabel}>HRV</Text>
          <Text style={styles.tooltipDetailValue}>
            <Text accessibilityElementsHidden={true}>❤️ </Text>
            {point.hrv.toFixed(0)}ms
          </Text>
        </View>
      )}
      <Text style={styles.tooltipHint} accessibilityElementsHidden={true}>
        Tap to close
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.ghostWhite,
    marginBottom: 12,
    alignSelf: 'flex-start',
    marginLeft: 16,
    textShadowColor: HALLOWEEN_COLORS.primary,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HALLOWEEN_COLORS.cardBg,
    borderRadius: 16,
    marginVertical: 16,
  },
  emptyText: {
    fontSize: 16,
    color: HALLOWEEN_COLORS.ghostWhite,
    opacity: 0.6,
  },
  tooltip: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: HALLOWEEN_COLORS.primary,
    padding: 16,
    borderRadius: 12,
    // Enhanced purple glow shadow
    shadowColor: HALLOWEEN_COLORS.primaryLight,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 16,
    borderWidth: 2,
    borderColor: HALLOWEEN_COLORS.ghostWhite,
  },
  tooltipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tooltipDate: {
    fontSize: 14,
    color: HALLOWEEN_COLORS.ghostWhite,
    fontWeight: '600',
  },
  tooltipClose: {
    fontSize: 18,
    color: HALLOWEEN_COLORS.ghostWhite,
    fontWeight: 'bold',
  },
  tooltipValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.ghostWhite,
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tooltipDivider: {
    height: 1,
    backgroundColor: HALLOWEEN_COLORS.ghostWhite,
    opacity: 0.3,
    marginVertical: 8,
  },
  tooltipDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tooltipLabel: {
    fontSize: 12,
    color: HALLOWEEN_COLORS.ghostWhite,
    opacity: 0.7,
    textTransform: 'uppercase',
  },
  tooltipState: {
    fontSize: 14,
    color: HALLOWEEN_COLORS.ghostWhite,
    fontWeight: '600',
  },
  tooltipDetailValue: {
    fontSize: 14,
    color: HALLOWEEN_COLORS.ghostWhite,
    fontWeight: '600',
  },
  tooltipHint: {
    fontSize: 11,
    color: HALLOWEEN_COLORS.ghostWhite,
    opacity: 0.5,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
