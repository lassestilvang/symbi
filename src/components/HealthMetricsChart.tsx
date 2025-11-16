import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface HistoricalDataPoint {
  date: string;
  steps: number;
  sleepHours?: number;
  hrv?: number;
  emotionalState: string;
}

interface HealthMetricsChartProps {
  data: HistoricalDataPoint[];
  metricType: 'steps' | 'sleep' | 'hrv';
  color: string;
  onDataPointPress?: (point: HistoricalDataPoint) => void;
}

const HALLOWEEN_COLORS = {
  primary: '#7C3AED',
  orange: '#F97316',
  green: '#10B981',
  darkBg: '#1a1a2e',
  cardBg: '#16213e',
  ghostWhite: '#F3F4F6',
};

const METRIC_CONFIG = {
  steps: {
    label: 'Steps',
    color: HALLOWEEN_COLORS.primary,
    suffix: '',
    decimals: 0,
  },
  sleep: {
    label: 'Sleep (hours)',
    color: HALLOWEEN_COLORS.orange,
    suffix: 'h',
    decimals: 1,
  },
  hrv: {
    label: 'HRV (ms)',
    color: HALLOWEEN_COLORS.green,
    suffix: 'ms',
    decimals: 0,
  },
};

export const HealthMetricsChart: React.FC<HealthMetricsChartProps> = ({
  data,
  metricType,
  color,
  onDataPointPress,
}) => {
  const [selectedPoint, setSelectedPoint] = useState<HistoricalDataPoint | null>(null);
  const [chartWidth, setChartWidth] = useState(Dimensions.get('window').width - 32);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setChartWidth(window.width - 32);
    });

    return () => subscription?.remove();
  }, []);

  const getMetricValue = (point: HistoricalDataPoint): number => {
    switch (metricType) {
      case 'steps':
        return point.steps;
      case 'sleep':
        return point.sleepHours ?? 0;
      case 'hrv':
        return point.hrv ?? 0;
      default:
        return 0;
    }
  };

  const filteredData = data.filter(point => {
    const value = getMetricValue(point);
    return value > 0;
  });

  if (filteredData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>👻 No data available</Text>
      </View>
    );
  }

  const chartData = {
    labels: filteredData.map(point => {
      const date = new Date(point.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        data: filteredData.map(getMetricValue),
        color: (_opacity = 1) => color || METRIC_CONFIG[metricType].color,
        strokeWidth: 3,
      },
    ],
  };

  const config = METRIC_CONFIG[metricType];

  const handleDataPointClick = (data: { index?: number }) => {
    if (data.index !== undefined && filteredData[data.index]) {
      const point = filteredData[data.index];
      setSelectedPoint(point);
      onDataPointPress?.(point);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{config.label}</Text>
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
      {selectedPoint && (
        <TouchableOpacity
          style={styles.tooltip}
          onPress={() => setSelectedPoint(null)}
          activeOpacity={0.9}>
          <Text style={styles.tooltipDate}>{selectedPoint.date}</Text>
          <Text style={styles.tooltipValue}>
            {getMetricValue(selectedPoint).toFixed(config.decimals)}
            {config.suffix}
          </Text>
          <Text style={styles.tooltipState}>{selectedPoint.emotionalState}</Text>
        </TouchableOpacity>
      )}
    </View>
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
    backgroundColor: HALLOWEEN_COLORS.primary,
    padding: 12,
    borderRadius: 8,
    shadowColor: HALLOWEEN_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  tooltipDate: {
    fontSize: 12,
    color: HALLOWEEN_COLORS.ghostWhite,
    opacity: 0.8,
    marginBottom: 4,
  },
  tooltipValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.ghostWhite,
    marginBottom: 4,
  },
  tooltipState: {
    fontSize: 12,
    color: HALLOWEEN_COLORS.ghostWhite,
    opacity: 0.8,
  },
});
