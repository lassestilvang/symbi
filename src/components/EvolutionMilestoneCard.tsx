import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { EvolutionRecord, EmotionalState } from '../types';

interface EvolutionMilestoneCardProps {
  record: EvolutionRecord;
  badgeIcon: 'tombstone' | 'jack-o-lantern' | 'crystal-ball' | 'cauldron';
}

const BADGE_ICONS = {
  tombstone: '🪦',
  'jack-o-lantern': '🎃',
  'crystal-ball': '🔮',
  cauldron: '🧙',
};

const HALLOWEEN_COLORS = {
  primary: '#7C3AED',
  primaryDark: '#5B21B6',
  primaryLight: '#9333EA',
  orange: '#F97316',
  cardBg: '#16213e',
  darkBg: '#1a1a2e',
  ghostWhite: '#F3F4F6',
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

export const EvolutionMilestoneCard: React.FC<EvolutionMilestoneCardProps> = ({
  record,
  badgeIcon,
}) => {
  const formatDate = (date: Date): string => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDominantStatesText = (): string => {
    return record.dominantStates.map(state => STATE_DISPLAY_NAMES[state]).join(', ');
  };

  return (
    <View style={styles.card}>
      <View style={styles.badgeContainer}>
        <Text style={styles.badge}>{BADGE_ICONS[badgeIcon]}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.level}>✨ Level {record.evolutionLevel}</Text>
          <Text style={styles.date}>{formatDate(record.timestamp)}</Text>
        </View>
        {record.appearanceUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: record.appearanceUrl }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        )}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Trigger:</Text>
            <Text style={styles.detailValue}>
              {record.daysInPositiveState} days of positive states
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Dominant States:</Text>
            <Text style={styles.detailValue}>{getDominantStatesText()}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: HALLOWEEN_COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    position: 'relative',
    shadowColor: HALLOWEEN_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: HALLOWEEN_COLORS.primaryDark,
  },
  badgeContainer: {
    position: 'absolute',
    top: -12,
    right: 16,
    backgroundColor: HALLOWEEN_COLORS.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: HALLOWEEN_COLORS.darkBg,
    zIndex: 1,
  },
  badge: {
    fontSize: 20,
  },
  content: {
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  level: {
    fontSize: 20,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.primaryLight,
  },
  date: {
    fontSize: 14,
    color: HALLOWEEN_COLORS.ghostWhite,
    opacity: 0.7,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: HALLOWEEN_COLORS.darkBg,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 12,
    color: HALLOWEEN_COLORS.ghostWhite,
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginRight: 8,
    minWidth: 100,
  },
  detailValue: {
    fontSize: 14,
    color: HALLOWEEN_COLORS.ghostWhite,
    flex: 1,
  },
});
