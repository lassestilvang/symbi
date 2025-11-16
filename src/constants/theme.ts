/**
 * Halloween Theme Constants
 *
 * Centralized color palette and theme values used throughout the app.
 * See docs/halloween-theme-colors.md for full documentation.
 */

export const HALLOWEEN_COLORS = {
  // Primary purple shades
  primary: '#7C3AED',
  primaryDark: '#5B21B6',
  primaryLight: '#9333EA',

  // Accent colors
  orange: '#F97316',
  green: '#10B981',

  // Background colors
  darkBg: '#1a1a2e',
  cardBg: '#16213e',
  ghostWhite: '#F3F4F6',

  // Table row colors
  rowEven: '#1a1a2e',
  rowOdd: '#16213e',
} as const;

export const STATE_COLORS: Record<string, string> = {
  sad: '#DC2626',
  resting: '#7C3AED',
  active: '#10B981',
  vibrant: '#F59E0B',
  calm: '#3B82F6',
  tired: '#6B7280',
  stressed: '#EF4444',
  anxious: '#F97316',
  rested: '#8B5CF6',
} as const;

export const METRIC_CONFIG = {
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
} as const;

export const DECORATION_ICONS = {
  ghost: '👻',
  pumpkin: '🎃',
  tombstone: '🪦',
  bat: '🦇',
} as const;
