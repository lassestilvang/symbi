import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface HistoricalDataPoint {
  date: string;
  steps: number;
  sleepHours?: number;
  hrv?: number;
  emotionalState: string;
}

interface EmotionalStateTimelineProps {
  data: HistoricalDataPoint[];
  onItemPress?: (item: HistoricalDataPoint) => void;
}

const HALLOWEEN_COLORS = {
  primary: '#7C3AED',
  primaryDark: '#5B21B6',
  primaryLight: '#9333EA',
  cardBg: '#16213e',
  darkBg: '#1a1a2e',
  ghostWhite: '#F3F4F6',
};

const STATE_COLORS: Record<string, string> = {
  Sad: '#DC2626',
  Resting: '#7C3AED',
  Active: '#10B981',
  Vibrant: '#F59E0B',
  Calm: '#3B82F6',
  Tired: '#6B7280',
  Stressed: '#EF4444',
  Anxious: '#F97316',
  Rested: '#8B5CF6',
};

export const EmotionalStateTimeline: React.FC<EmotionalStateTimelineProps> = ({
  data,
  onItemPress,
}) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>👻 No emotional states recorded yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🕰️ Emotional Timeline</Text>
      <ScrollView style={styles.timeline} showsVerticalScrollIndicator={false} nestedScrollEnabled>
        {data.map((item, index) => {
          const stateColor = STATE_COLORS[item.emotionalState] || HALLOWEEN_COLORS.primary;
          const isLast = index === data.length - 1;

          return (
            <TouchableOpacity
              key={`${item.date}-${index}`}
              style={styles.timelineItem}
              onPress={() => onItemPress?.(item)}
              activeOpacity={0.7}>
              <View style={styles.timelineLeft}>
                <View style={[styles.dot, { backgroundColor: stateColor }]} />
                {!isLast && <View style={styles.line} />}
              </View>
              <View style={[styles.timelineCard, { borderLeftColor: stateColor }]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.ghost}>👻</Text>
                  <View style={styles.cardHeaderText}>
                    <Text style={[styles.stateName, { color: stateColor }]}>
                      {item.emotionalState}
                    </Text>
                    <Text style={styles.dateText}>
                      {formatDate(item.date)} • {formatTime(item.date)}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardMetrics}>
                  <Text style={styles.metricText}>👣 {item.steps.toLocaleString()} steps</Text>
                  {item.sleepHours !== undefined && (
                    <Text style={styles.metricText}>😴 {item.sleepHours.toFixed(1)}h sleep</Text>
                  )}
                  {item.hrv !== undefined && (
                    <Text style={styles.metricText}>❤️ {item.hrv.toFixed(0)}ms HRV</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.ghostWhite,
    marginBottom: 16,
    marginLeft: 16,
  },
  timeline: {
    maxHeight: 400,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 12,
    width: 20,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: HALLOWEEN_COLORS.darkBg,
    zIndex: 1,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: HALLOWEEN_COLORS.primary,
    opacity: 0.3,
    marginTop: 4,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: HALLOWEEN_COLORS.cardBg,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    shadowColor: HALLOWEEN_COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ghost: {
    fontSize: 24,
    marginRight: 8,
  },
  cardHeaderText: {
    flex: 1,
  },
  stateName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: HALLOWEEN_COLORS.ghostWhite,
    opacity: 0.6,
  },
  cardMetrics: {
    marginTop: 4,
  },
  metricText: {
    fontSize: 12,
    color: HALLOWEEN_COLORS.ghostWhite,
    opacity: 0.8,
    marginBottom: 2,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HALLOWEEN_COLORS.cardBg,
    borderRadius: 16,
    marginVertical: 16,
    marginHorizontal: 16,
  },
  emptyText: {
    fontSize: 16,
    color: HALLOWEEN_COLORS.ghostWhite,
    opacity: 0.6,
  },
});
