import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { EmotionalState } from '../types';

interface HistoricalDataPoint {
  date: string;
  steps: number;
  sleepHours?: number;
  hrv?: number;
  emotionalState: EmotionalState;
}

interface HealthDataTableProps {
  data: HistoricalDataPoint[];
  maxHeight: number;
}

const HALLOWEEN_COLORS = {
  primary: '#7C3AED',
  primaryDark: '#5B21B6',
  primaryLight: '#9333EA',
  cardBg: '#16213e',
  darkBg: '#1a1a2e',
  ghostWhite: '#F3F4F6',
  rowEven: '#1a1a2e',
  rowOdd: '#16213e',
};

const STATE_COLORS: Record<string, string> = {
  sad: '#DC2626',
  resting: '#7C3AED',
  active: '#10B981',
  vibrant: '#F59E0B',
  calm: '#3B82F6',
  tired: '#6B7280',
  stressed: '#EF4444',
  anxious: '#F97316',
  rested: '#8B5CF6',
};

const STATE_DISPLAY_NAMES: Record<EmotionalState, string> = {
  [EmotionalState.SAD]: 'Sad',
  [EmotionalState.RESTING]: 'Resting',
  [EmotionalState.ACTIVE]: 'Active',
  [EmotionalState.VIBRANT]: 'Vibrant',
  [EmotionalState.CALM]: 'Calm',
  [EmotionalState.TIRED]: 'Tired',
  [EmotionalState.STRESSED]: 'Stressed',
  [EmotionalState.ANXIOUS]: 'Anxious',
  [EmotionalState.RESTED]: 'Rested',
};

export const HealthDataTable: React.FC<HealthDataTableProps> = ({ data, maxHeight }) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text
          style={styles.emptyText}
          accessibilityLabel="No data to display"
          accessibilityRole="text">
          👻 No data to display
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header" accessibilityLabel="Data Table">
        📊 Data Table
      </Text>
      <ScrollView
        style={[styles.tableContainer, { maxHeight }]}
        horizontal
        showsHorizontalScrollIndicator={true}
        accessible={true}
        accessibilityLabel={`Health data table with ${data.length} rows`}
        accessibilityHint="Scrollable table showing date, steps, sleep, HRV, and emotional state data">
        <View>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={[styles.cell, styles.dateCell]}>
              <Text style={styles.headerText} accessibilityRole="header">
                Date
              </Text>
            </View>
            <View style={[styles.cell, styles.stepsCell]}>
              <Text style={styles.headerText} accessibilityRole="header">
                Steps
              </Text>
            </View>
            <View style={[styles.cell, styles.sleepCell]}>
              <Text style={styles.headerText} accessibilityRole="header">
                Sleep (h)
              </Text>
            </View>
            <View style={[styles.cell, styles.hrvCell]}>
              <Text style={styles.headerText} accessibilityRole="header">
                HRV (ms)
              </Text>
            </View>
            <View style={[styles.cell, styles.stateCell]}>
              <Text style={styles.headerText} accessibilityRole="header">
                State
              </Text>
            </View>
          </View>

          {/* Data Rows */}
          <ScrollView
            style={{ maxHeight: maxHeight - 50 }}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled>
            {data.map((item, index) => {
              const isEven = index % 2 === 0;
              const rowStyle = isEven ? styles.rowEven : styles.rowOdd;
              const stateColor = STATE_COLORS[item.emotionalState] || HALLOWEEN_COLORS.primary;
              const rowAccessibilityLabel = `${formatDate(item.date)}, ${item.steps.toLocaleString()} steps, ${item.sleepHours !== undefined ? `${item.sleepHours.toFixed(1)} hours sleep` : 'no sleep data'}, ${item.hrv !== undefined ? `${item.hrv.toFixed(0)} milliseconds HRV` : 'no HRV data'}, ${STATE_DISPLAY_NAMES[item.emotionalState]} state`;

              return (
                <View
                  key={`${item.date}-${index}`}
                  style={[styles.dataRow, rowStyle]}
                  accessible={true}
                  accessibilityLabel={rowAccessibilityLabel}>
                  <View style={[styles.cell, styles.dateCell]}>
                    <Text style={styles.cellText}>{formatDate(item.date)}</Text>
                  </View>
                  <View style={[styles.cell, styles.stepsCell]}>
                    <Text style={styles.cellText}>{item.steps.toLocaleString()}</Text>
                  </View>
                  <View style={[styles.cell, styles.sleepCell]}>
                    <Text style={styles.cellText}>
                      {item.sleepHours !== undefined ? item.sleepHours.toFixed(1) : '-'}
                    </Text>
                  </View>
                  <View style={[styles.cell, styles.hrvCell]}>
                    <Text style={styles.cellText}>
                      {item.hrv !== undefined ? item.hrv.toFixed(0) : '-'}
                    </Text>
                  </View>
                  <View style={[styles.cell, styles.stateCell]}>
                    <View style={styles.stateContainer}>
                      <View
                        style={[styles.stateIndicator, { backgroundColor: stateColor }]}
                        accessibilityElementsHidden={true}
                      />
                      <Text style={[styles.cellText, styles.stateText]}>
                        {STATE_DISPLAY_NAMES[item.emotionalState]}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
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
    marginBottom: 12,
    marginLeft: 16,
    textShadowColor: HALLOWEEN_COLORS.primary,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  tableContainer: {
    backgroundColor: HALLOWEEN_COLORS.cardBg,
    borderRadius: 12,
    marginHorizontal: 16,
    borderWidth: 2,
    borderColor: HALLOWEEN_COLORS.primaryDark,
    // Enhanced purple glow shadow
    shadowColor: HALLOWEEN_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: HALLOWEEN_COLORS.primary,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    // Purple glow on header
    shadowColor: HALLOWEEN_COLORS.primaryLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: HALLOWEEN_COLORS.primaryDark,
  },
  rowEven: {
    backgroundColor: HALLOWEEN_COLORS.rowEven,
  },
  rowOdd: {
    backgroundColor: HALLOWEEN_COLORS.rowOdd,
  },
  cell: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateCell: {
    width: 80,
  },
  stepsCell: {
    width: 100,
  },
  sleepCell: {
    width: 90,
  },
  hrvCell: {
    width: 90,
  },
  stateCell: {
    width: 120,
  },
  headerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.ghostWhite,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cellText: {
    fontSize: 14,
    color: HALLOWEEN_COLORS.ghostWhite,
    fontWeight: '500',
  },
  stateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stateIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stateText: {
    fontSize: 13,
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
