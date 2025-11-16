/**
 * Date Formatting Utilities
 *
 * Centralized date formatting functions used across components.
 */

/**
 * Format date as "M/D" (e.g., "11/16")
 */
export const formatShortDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

/**
 * Format date as "Mon DD" (e.g., "Nov 16")
 */
export const formatMediumDate = (dateString: string): string => {
  const date = new Date(dateString);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
};

/**
 * Format date as full date (e.g., "Monday, November 16, 2025")
 */
export const formatFullDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format date as weekday (e.g., "Mon")
 */
export const formatWeekday = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

/**
 * Format date for display with month, day, and year (e.g., "Nov 16, 2025")
 */
export const formatDisplayDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};
