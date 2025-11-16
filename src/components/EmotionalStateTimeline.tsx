import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useUserPreferencesStore } from '../stores/userPreferencesStore';

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

export const EmotionalStateTimeline: React.FC<EmotionalStateTimelineProps> = React.memo(
  ({ data, onItemPress }) => {
    const [selectedItem, setSelectedItem] = useState<HistoricalDataPoint | null>(null);
    const { profile } = useUserPreferencesStore();

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

    const formatFullDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    };

    const handleItemPress = async (item: HistoricalDataPoint) => {
      // Trigger haptic feedback if enabled
      if (profile?.preferences.hapticFeedbackEnabled) {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (error) {
          console.log('Haptic feedback not available:', error);
        }
      }

      setSelectedItem(item);
      onItemPress?.(item);
    };

    const closeModal = async () => {
      // Trigger haptic feedback if enabled
      if (profile?.preferences.hapticFeedbackEnabled) {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
          console.log('Haptic feedback not available:', error);
        }
      }

      setSelectedItem(null);
    };

    if (data.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text
            style={styles.emptyText}
            accessibilityLabel="No emotional states recorded yet"
            accessibilityRole="text">
            👻 No emotional states recorded yet
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Text
          style={styles.title}
          accessibilityRole="header"
          accessibilityLabel="Emotional Timeline">
          🕰️ Emotional Timeline
        </Text>
        <ScrollView
          style={styles.timeline}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          accessibilityRole="list">
          {data.map((item, index) => {
            const stateColor = STATE_COLORS[item.emotionalState] || HALLOWEEN_COLORS.primary;
            const isLast = index === data.length - 1;
            const accessibilityLabel = `${item.emotionalState} state on ${formatDate(item.date)}, ${formatTime(item.date)}. ${item.steps.toLocaleString()} steps${item.sleepHours !== undefined ? `, ${item.sleepHours.toFixed(1)} hours sleep` : ''}${item.hrv !== undefined ? `, ${item.hrv.toFixed(0)} milliseconds HRV` : ''}. Tap for details.`;

            return (
              <TouchableOpacity
                key={`${item.date}-${index}`}
                style={styles.timelineItem}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.7}
                accessible={true}
                accessibilityLabel={accessibilityLabel}
                accessibilityRole="button"
                accessibilityHint="Opens detailed view of this emotional state">
                <View style={styles.timelineLeft} accessibilityElementsHidden={true}>
                  <View style={[styles.dot, { backgroundColor: stateColor }]} />
                  {!isLast && <View style={styles.line} />}
                </View>
                <View style={[styles.timelineCard, { borderLeftColor: stateColor }]}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.ghost} accessibilityElementsHidden={true}>
                      👻
                    </Text>
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
                    <Text style={styles.metricText}>
                      <Text accessibilityElementsHidden={true}>👣 </Text>
                      {item.steps.toLocaleString()} steps
                    </Text>
                    {item.sleepHours !== undefined && (
                      <Text style={styles.metricText}>
                        <Text accessibilityElementsHidden={true}>😴 </Text>
                        {item.sleepHours.toFixed(1)}h sleep
                      </Text>
                    )}
                    {item.hrv !== undefined && (
                      <Text style={styles.metricText}>
                        <Text accessibilityElementsHidden={true}>❤️ </Text>
                        {item.hrv.toFixed(0)}ms HRV
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Expanded State Information Modal */}
        <Modal
          visible={selectedItem !== null}
          transparent
          animationType="fade"
          onRequestClose={closeModal}
          accessibilityViewIsModal={true}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={closeModal}
            accessible={false}>
            <TouchableOpacity
              style={styles.modalContent}
              activeOpacity={1}
              onPress={e => e.stopPropagation()}
              accessible={true}
              accessibilityRole="alert"
              accessibilityLabel={
                selectedItem
                  ? `Emotional state details for ${selectedItem.emotionalState} on ${formatFullDate(selectedItem.date)}`
                  : 'Emotional state details'
              }>
              {selectedItem && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle} accessibilityRole="header">
                      Emotional State Details
                    </Text>
                    <TouchableOpacity
                      onPress={closeModal}
                      style={styles.modalCloseButton}
                      accessibilityLabel="Close details"
                      accessibilityRole="button"
                      accessibilityHint="Closes the emotional state details dialog">
                      <Text style={styles.modalCloseText} accessibilityElementsHidden={true}>
                        ✕
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalBody}>
                    <View style={styles.modalStateHeader}>
                      <Text style={styles.modalGhost} accessibilityElementsHidden={true}>
                        👻
                      </Text>
                      <View style={styles.modalStateInfo}>
                        <Text
                          style={[
                            styles.modalStateName,
                            {
                              color:
                                STATE_COLORS[selectedItem.emotionalState] ||
                                HALLOWEEN_COLORS.primary,
                            },
                          ]}
                          accessibilityRole="header">
                          {selectedItem.emotionalState}
                        </Text>
                        <Text style={styles.modalDate}>{formatFullDate(selectedItem.date)}</Text>
                      </View>
                    </View>

                    <View style={styles.modalDivider} accessibilityElementsHidden={true} />

                    <View style={styles.modalMetrics}>
                      <View style={styles.modalMetricRow}>
                        <View
                          style={styles.modalMetricCard}
                          accessible={true}
                          accessibilityLabel={`Steps: ${selectedItem.steps.toLocaleString()}`}
                          accessibilityRole="summary">
                          <Text style={styles.modalMetricIcon} accessibilityElementsHidden={true}>
                            👣
                          </Text>
                          <Text style={styles.modalMetricLabel}>Steps</Text>
                          <Text style={styles.modalMetricValue}>
                            {selectedItem.steps.toLocaleString()}
                          </Text>
                        </View>

                        {selectedItem.sleepHours !== undefined && (
                          <View
                            style={styles.modalMetricCard}
                            accessible={true}
                            accessibilityLabel={`Sleep: ${selectedItem.sleepHours.toFixed(1)} hours`}
                            accessibilityRole="summary">
                            <Text style={styles.modalMetricIcon} accessibilityElementsHidden={true}>
                              😴
                            </Text>
                            <Text style={styles.modalMetricLabel}>Sleep</Text>
                            <Text style={styles.modalMetricValue}>
                              {selectedItem.sleepHours.toFixed(1)}h
                            </Text>
                          </View>
                        )}
                      </View>

                      {selectedItem.hrv !== undefined && (
                        <View style={styles.modalMetricRow}>
                          <View
                            style={styles.modalMetricCard}
                            accessible={true}
                            accessibilityLabel={`Heart Rate Variability: ${selectedItem.hrv.toFixed(0)} milliseconds`}
                            accessibilityRole="summary">
                            <Text style={styles.modalMetricIcon} accessibilityElementsHidden={true}>
                              ❤️
                            </Text>
                            <Text style={styles.modalMetricLabel}>Heart Rate Variability</Text>
                            <Text style={styles.modalMetricValue}>
                              {selectedItem.hrv.toFixed(0)}ms
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>

                    <View style={styles.modalFooter}>
                      <Text style={styles.modalFooterText} accessibilityElementsHidden={true}>
                        Tap outside to close
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }
);

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
    textShadowColor: HALLOWEEN_COLORS.primary,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
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
    // Enhanced purple glow shadow
    shadowColor: HALLOWEEN_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
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
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  dateText: {
    fontSize: 12,
    color: HALLOWEEN_COLORS.ghostWhite,
    opacity: 0.7,
    fontWeight: '500',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: HALLOWEEN_COLORS.cardBg,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: HALLOWEEN_COLORS.primary,
    // Enhanced purple glow shadow for modal
    shadowColor: HALLOWEEN_COLORS.primaryLight,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: HALLOWEEN_COLORS.primary,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.primaryLight,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: HALLOWEEN_COLORS.darkBg,
  },
  modalCloseText: {
    fontSize: 20,
    color: HALLOWEEN_COLORS.ghostWhite,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  modalStateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalGhost: {
    fontSize: 48,
    marginRight: 16,
  },
  modalStateInfo: {
    flex: 1,
  },
  modalStateName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  modalDate: {
    fontSize: 14,
    color: HALLOWEEN_COLORS.ghostWhite,
    opacity: 0.7,
  },
  modalDivider: {
    height: 1,
    backgroundColor: HALLOWEEN_COLORS.primary,
    opacity: 0.3,
    marginVertical: 16,
  },
  modalMetrics: {
    marginBottom: 16,
  },
  modalMetricRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  modalMetricCard: {
    flex: 1,
    backgroundColor: HALLOWEEN_COLORS.darkBg,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: HALLOWEEN_COLORS.primary,
  },
  modalMetricIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  modalMetricLabel: {
    fontSize: 12,
    color: HALLOWEEN_COLORS.ghostWhite,
    opacity: 0.7,
    marginBottom: 4,
    textAlign: 'center',
  },
  modalMetricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.primaryLight,
    textShadowColor: HALLOWEEN_COLORS.primary,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  modalFooter: {
    alignItems: 'center',
    paddingTop: 8,
  },
  modalFooterText: {
    fontSize: 12,
    color: HALLOWEEN_COLORS.ghostWhite,
    opacity: 0.5,
    fontStyle: 'italic',
  },
});
