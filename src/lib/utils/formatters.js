/**
 * Centralized formatting utilities for the Reis naar Frankrijk app.
 * Uses Intl for consistent, high-performance formatting.
 */

// --- CURRENCY FORMATTING ---
const euroFormatter = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

const euroGrootFormatter = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

/** @param {number | null | undefined} val */
export const formatEuro = (val) => euroFormatter.format(val || 0);
/** @param {number | null | undefined} val */
export const formatEuroGroot = (val) => euroGrootFormatter.format(val || 0);

// --- DATE & TIME FORMATTING ---
const fullDateFormatter = new Intl.DateTimeFormat('nl-NL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});

const shortDateFormatter = new Intl.DateTimeFormat('nl-NL', {
  day: 'numeric',
  month: 'short'
});

const dayNameFormatter = new Intl.DateTimeFormat('nl-NL', {
  weekday: 'long'
});

const timeFormatter = new Intl.DateTimeFormat('nl-NL', {
  hour: '2-digit',
  minute: '2-digit'
});

/**
 * @param {any} dateValue
 * @returns {Date}
 */
function toDate(dateValue) {
  if (!dateValue) return new Date();
  if (dateValue instanceof Date) return dateValue;
  if (dateValue?.toDate && typeof dateValue.toDate === 'function') return dateValue.toDate();
  if (dateValue?.seconds) return new Date(dateValue.seconds * 1000);
  return new Date(dateValue);
}

/** @param {any} date */
export const formatFullDate = (date) => fullDateFormatter.format(toDate(date));
/** @param {any} date */
export const formatShortDate = (date) => shortDateFormatter.format(toDate(date));
/** @param {any} date */
export const formatTime = (date) => timeFormatter.format(toDate(date));

/**
 * Returns a human-friendly label for a date key (YYYY-MM-DD or Firestore timestamp)
 * @param {any} dateValue
 */
export function getFriendlyDayLabel(dateValue) {
  const date = toDate(dateValue);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (target.getTime() === today.getTime()) return "Vandaag";
  if (target.getTime() === yesterday.getTime()) return "Gisteren";

  const dayName = dayNameFormatter.format(date);

  return dayName.charAt(0).toUpperCase() + dayName.slice(1) + " " + date.getDate() + " " + new Intl.DateTimeFormat('nl-NL', { month: 'long' }).format(date);
}

/**
 * Returns a sortable day key (YYYY-MM-DD) from a date/timestamp
 * @param {any} dateValue
 */
export function getDayKey(dateValue) {
  const d = toDate(dateValue);
  return d.toISOString().split('T')[0];
}
