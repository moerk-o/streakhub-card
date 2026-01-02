/**
 * Formatting utilities for StreakHub Card
 */

import type { Translations } from '../types';

// =============================================================================
// Days Formatting
// =============================================================================

/**
 * Format a day count with proper singular/plural form
 *
 * @example
 * formatDays(0, translations) // "0 days" / "0 Tage"
 * formatDays(1, translations) // "1 day" / "1 Tag"
 * formatDays(47, translations) // "47 days" / "47 Tage"
 */
export function formatDays(count: number, translations: Translations): string {
  const unit = count === 1 ? translations.day : translations.days;
  return `${count} ${unit}`;
}

// =============================================================================
// Date Utilities
// =============================================================================

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0] as string;
}

/**
 * Convert a Date object to ISO date string (YYYY-MM-DD)
 */
export function toDateString(date: Date): string {
  return date.toISOString().split('T')[0] as string;
}

/**
 * Parse an ISO date string to a Date object (at midnight local time)
 */
export function parseDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year!, month! - 1, day!);
}

/**
 * Add days to a date (returns new Date)
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Subtract days from a date (returns new Date)
 */
export function subtractDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

/**
 * Get the date for "days ago" from today
 *
 * @example
 * getDaysAgo(0) // today
 * getDaysAgo(1) // yesterday
 * getDaysAgo(2) // day before yesterday
 */
export function getDaysAgo(daysAgo: number): Date {
  return subtractDays(new Date(), daysAgo);
}

/**
 * Calculate the streak start date (day after the event)
 *
 * When a user reports an event on a specific day, the new streak
 * starts on the following day.
 *
 * @param eventDate The date the event occurred
 * @returns The date the new streak should start (day after event)
 */
export function calculateStreakStart(eventDate: Date): Date {
  return addDays(eventDate, 1);
}

/**
 * Check if a date is before another date (date comparison only, ignores time)
 */
export function isDateBefore(date: Date, compareTo: Date): boolean {
  return toDateString(date) < toDateString(compareTo);
}

/**
 * Check if a date is after another date (date comparison only, ignores time)
 */
export function isDateAfter(date: Date, compareTo: Date): boolean {
  return toDateString(date) > toDateString(compareTo);
}

/**
 * Check if a date is within a range (inclusive)
 */
export function isDateInRange(
  date: Date,
  minDate: Date | undefined,
  maxDate: Date | undefined
): boolean {
  const dateStr = toDateString(date);

  if (minDate && dateStr < toDateString(minDate)) {
    return false;
  }

  if (maxDate && dateStr > toDateString(maxDate)) {
    return false;
  }

  return true;
}

// =============================================================================
// Calendar Utilities
// =============================================================================

/**
 * Get the first day of a month
 */
export function getFirstDayOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

/**
 * Get the last day of a month
 */
export function getLastDayOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0);
}

/**
 * Get the number of days in a month
 */
export function getDaysInMonth(year: number, month: number): number {
  return getLastDayOfMonth(year, month).getDate();
}

/**
 * Get the day of the week (0-6) for a date, adjusted for week start
 *
 * @param date The date to check
 * @param weekStart 0 for Sunday, 1 for Monday
 * @returns 0-6 where 0 is the first day of the week
 */
export function getAdjustedDayOfWeek(date: Date, weekStart: number): number {
  const dayOfWeek = date.getDay();
  return (dayOfWeek - weekStart + 7) % 7;
}

/**
 * Get week day names based on week start
 *
 * @param weekStart 0 for Sunday, 1 for Monday
 * @param locale Locale for formatting (defaults to 'en')
 */
export function getWeekDayNames(
  weekStart: number,
  locale: string = 'en'
): string[] {
  const days: string[] = [];
  const baseDate = new Date(2024, 0, 7 + weekStart); // Jan 7, 2024 was a Sunday

  for (let i = 0; i < 7; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    days.push(
      date.toLocaleDateString(locale, { weekday: 'short' }).slice(0, 2)
    );
  }

  return days;
}

/**
 * Get month name for display
 */
export function getMonthName(year: number, month: number, locale: string = 'en'): string {
  const date = new Date(year, month, 1);
  return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}
