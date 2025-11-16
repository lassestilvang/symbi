import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HALLOWEEN_COLORS, DECORATION_ICONS } from '../constants/theme';

interface StatisticsCardProps {
  icon: string;
  label: string;
  value: string | number;
  subtitle?: string;
  halloweenDecoration: keyof typeof DECORATION_ICONS;
  width?: number;
  testID?: string;
}

/**
 * Formats numeric values with locale-specific thousand separators
 */
const formatValue = (val: string | number): string => {
  if (typeof val === 'number') {
    return val.toLocaleString();
  }
  return val;
};

export const StatisticsCard: React.FC<StatisticsCardProps> = React.memo(
  ({ icon, label, value, subtitle, halloweenDecoration, width, testID }) => {
    const dynamicStyle = React.useMemo(
      () => (width ? { width, minWidth: width } : undefined),
      [width]
    );

    const accessibilityLabel = `${label}: ${value}${subtitle ? `, ${subtitle}` : ''}`;

    return (
      <View
        style={[styles.card, dynamicStyle]}
        accessible={true}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="summary"
        testID={testID}>
        <View style={styles.decorationContainer}>
          <Text style={styles.decoration}>{DECORATION_ICONS[halloweenDecoration]}</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.value}>{formatValue(value)}</Text>
          <Text style={styles.label}>{label}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: HALLOWEEN_COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    minWidth: 150,
    minHeight: 120,
    position: 'relative',
    // Enhanced purple glow shadow
    shadowColor: HALLOWEEN_COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 2,
    borderColor: HALLOWEEN_COLORS.primaryDark,
  },
  decorationContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    opacity: 0.2,
  },
  decoration: {
    fontSize: 28,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 36,
    marginBottom: 8,
    textShadowColor: HALLOWEEN_COLORS.primary,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    color: HALLOWEEN_COLORS.primaryLight,
    marginBottom: 4,
    textShadowColor: HALLOWEEN_COLORS.primary,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  label: {
    fontSize: 12,
    color: HALLOWEEN_COLORS.ghostWhite,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '600',
    opacity: 0.9,
  },
  subtitle: {
    fontSize: 10,
    color: HALLOWEEN_COLORS.ghostWhite,
    marginTop: 4,
    opacity: 0.7,
    fontStyle: 'italic',
  },
});
