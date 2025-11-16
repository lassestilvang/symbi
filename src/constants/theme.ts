/**
 * Halloween Theme Constants
 *
 * Centralized color palette and theme values used throughout the app.
 * See docs/halloween-theme-colors.md for full documentation.
 *
 * @example
 * ```tsx
 * import { HALLOWEEN_COLORS } from '../constants/theme';
 *
 * const styles = StyleSheet.create({
 *   container: {
 *     backgroundColor: HALLOWEEN_COLORS.darkBg,
 *     borderColor: HALLOWEEN_COLORS.primaryDark,
 *   },
 * });
 * ```
 */
export const HALLOWEEN_COLORS = {
  /** Main purple color for interactive elements and primary UI (#7C3AED) */
  primary: '#7C3AED',
  /** Dark purple for borders and shadows (#5B21B6) */
  primaryDark: '#5B21B6',
  /** Light purple for highlights and titles (#9333EA) */
  primaryLight: '#9333EA',

  /** Orange accent for sleep data and anxious state (#F97316) */
  orange: '#F97316',
  /** Green accent for HRV data and active state (#10B981) */
  green: '#10B981',

  /** Dark background for screens (#1a1a2e) */
  darkBg: '#1a1a2e',
  /** Card background color (#16213e) */
  cardBg: '#16213e',
  /** Light text color (#F3F4F6) */
  ghostWhite: '#F3F4F6',

  /** Even table row background (#1a1a2e) */
  rowEven: '#1a1a2e',
  /** Odd table row background (#16213e) */
  rowOdd: '#16213e',
} as const;

/**
 * Emotional State Colors
 *
 * Color mapping for each emotional state used in timeline indicators,
 * table rows, and state badges.
 *
 * @example
 * ```tsx
 * import { STATE_COLORS } from '../constants/theme';
 *
 * <View style={{ backgroundColor: STATE_COLORS.active }} />
 * ```
 */
export const STATE_COLORS: Record<string, string> = {
  /** Red for sad state (#DC2626) */
  sad: '#DC2626',
  /** Purple for resting state (#7C3AED) */
  resting: '#7C3AED',
  /** Green for active state (#10B981) */
  active: '#10B981',
  /** Amber for vibrant state (#F59E0B) */
  vibrant: '#F59E0B',
  /** Blue for calm state (#3B82F6) */
  calm: '#3B82F6',
  /** Gray for tired state (#6B7280) */
  tired: '#6B7280',
  /** Red-orange for stressed state (#EF4444) */
  stressed: '#EF4444',
  /** Orange for anxious state (#F97316) */
  anxious: '#F97316',
  /** Light purple for rested state (#8B5CF6) */
  rested: '#8B5CF6',
} as const;

/**
 * Metric Configuration
 *
 * Configuration for each health metric including display labels,
 * colors, suffixes, and decimal precision.
 *
 * @example
 * ```tsx
 * import { METRIC_CONFIG } from '../constants/theme';
 *
 * const config = METRIC_CONFIG.steps;
 * console.log(config.label); // "Steps"
 * console.log(config.color); // "#7C3AED"
 * ```
 */
export const METRIC_CONFIG = {
  /** Steps metric configuration (purple, no decimals) */
  steps: {
    label: 'Steps',
    color: HALLOWEEN_COLORS.primary,
    suffix: '',
    decimals: 0,
  },
  /** Sleep metric configuration (orange, 1 decimal) */
  sleep: {
    label: 'Sleep (hours)',
    color: HALLOWEEN_COLORS.orange,
    suffix: 'h',
    decimals: 1,
  },
  /** HRV metric configuration (green, no decimals) */
  hrv: {
    label: 'HRV (ms)',
    color: HALLOWEEN_COLORS.green,
    suffix: 'ms',
    decimals: 0,
  },
} as const;

/**
 * Decoration Icons
 *
 * Halloween-themed emoji icons used throughout the app for
 * decorative purposes and visual interest.
 *
 * @example
 * ```tsx
 * import { DECORATION_ICONS } from '../constants/theme';
 *
 * <Text>{DECORATION_ICONS.ghost}</Text>
 * ```
 */
export const DECORATION_ICONS = {
  /** Ghost emoji (👻) */
  ghost: '👻',
  /** Pumpkin emoji (🎃) */
  pumpkin: '🎃',
  /** Tombstone emoji (🪦) */
  tombstone: '🪦',
  /** Bat emoji (🦇) */
  bat: '🦇',
} as const;
