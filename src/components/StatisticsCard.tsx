import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatisticsCardProps {
  icon: string;
  label: string;
  value: string | number;
  subtitle?: string;
  halloweenDecoration: 'ghost' | 'pumpkin' | 'tombstone' | 'bat';
  width?: number;
}

const DECORATION_ICONS = {
  ghost: '👻',
  pumpkin: '🎃',
  tombstone: '🪦',
  bat: '🦇',
};

const HALLOWEEN_COLORS = {
  primary: '#7C3AED',
  primaryDark: '#5B21B6',
  primaryLight: '#9333EA',
  cardBg: '#16213e',
  ghostWhite: '#F3F4F6',
};

export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  icon,
  label,
  value,
  subtitle,
  halloweenDecoration,
  width,
}) => {
  return (
    <View style={[styles.card, width ? { width, minWidth: width } : undefined]}>
      <View style={styles.decorationContainer}>
        <Text style={styles.decoration}>{DECORATION_ICONS[halloweenDecoration]}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: HALLOWEEN_COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    minWidth: 150,
    minHeight: 120,
    position: 'relative',
    shadowColor: HALLOWEEN_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: HALLOWEEN_COLORS.primaryDark,
  },
  decorationContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    opacity: 0.3,
  },
  decoration: {
    fontSize: 24,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.primaryLight,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: HALLOWEEN_COLORS.ghostWhite,
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.8,
  },
  subtitle: {
    fontSize: 10,
    color: HALLOWEEN_COLORS.ghostWhite,
    marginTop: 4,
    opacity: 0.6,
  },
});
