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

const monthLongFormatter = new Intl.DateTimeFormat('nl-NL', {
  month: 'long'
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
  if (dateValue instanceof Date) return Number.isNaN(dateValue.getTime()) ? new Date() : dateValue;
  if (dateValue?.toDate && typeof dateValue.toDate === 'function') return dateValue.toDate();
  if (dateValue?.seconds) return new Date(dateValue.seconds * 1000);
  const parsed = new Date(dateValue);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
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

  return dayName.charAt(0).toUpperCase() + dayName.slice(1) + " " + date.getDate() + " " + monthLongFormatter.format(date);
}

/**
 * Returns a sortable day key (YYYY-MM-DD) from a date/timestamp
 * @param {any} dateValue
 */
export function getDayKey(dateValue) {
  const d = toDate(dateValue);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Parse localized decimal input safely ("12,50", "1.234,56", "1234.56").
 * Returns NaN when parsing fails.
 * @param {string | number | null | undefined} raw
 */
export function parseLocalizedNumber(raw) {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : NaN;
  if (typeof raw !== 'string') return NaN;

  let normalized = raw.trim().replace(/\s+/g, '').replace(/[€]/g, '');
  if (!normalized) return NaN;

  const hasComma = normalized.includes(',');
  const hasDot = normalized.includes('.');

  if (hasComma && hasDot) {
    // Last separator is decimal separator, the other is thousands separator.
    if (normalized.lastIndexOf(',') > normalized.lastIndexOf('.')) {
      normalized = normalized.replace(/\./g, '').replace(',', '.');
    } else {
      normalized = normalized.replace(/,/g, '');
    }
  } else if (hasComma) {
    normalized = normalized.replace(/\./g, '').replace(',', '.');
  } else if (hasDot && /^\d{1,3}(\.\d{3})+$/.test(normalized)) {
    // 1.234.567 -> 1234567
    normalized = normalized.replace(/\./g, '');
  }

  normalized = normalized.replace(/[^0-9.-]/g, '');
  if (!normalized || normalized === '-' || normalized === '.') return NaN;
  if (normalized.indexOf('-') > 0 || normalized.split('-').length > 2) return NaN;

  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : NaN;
}
