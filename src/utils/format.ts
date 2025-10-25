/**
 * Format Utilities Library
 * Zero External Dependencies - Super Clean Code - Strict TypeScript
 *
 * Provides comprehensive formatting functions for:
 * - Currency (USD, EUR, GBP, etc.)
 * - Numbers with locale support
 * - Percentages
 * - Ordinal numbers (1st, 2nd, 3rd, etc.)
 * - Dates and times (no external libraries)
 * - Relative time (ago/in)
 * - File sizes
 * - Phone numbers
 * - Credit cards
 * - Time durations
 */

/**
 * Formats a number as currency with locale support.
 *
 * @param value - The numeric value to format
 * @param currency - ISO 4217 currency code (default: 'USD')
 * @param locale - BCP 47 locale code (default: 'en-US')
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1000) // "$1,000.00"
 * formatCurrency(1000, 'EUR', 'de-DE') // "1.000,00 €"
 * formatCurrency(-500, 'GBP') // "-£500.00"
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  } catch (error) {
    // Fallback for invalid currency/locale
    return `${value.toFixed(2)}`;
  }
}

/**
 * Formats a number with thousands separators and decimal places.
 *
 * @param value - The numeric value to format
 * @param decimals - Number of decimal places (default: 2)
 * @param locale - BCP 47 locale code (default: 'en-US')
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1234.5678) // "1,234.57"
 * formatNumber(1234.5678, 3) // "1,234.568"
 * formatNumber(1234.56, 2, 'de-DE') // "1.234,56"
 */
export function formatNumber(
  value: number,
  decimals: number = 2,
  locale: string = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  } catch (error) {
    return value.toFixed(decimals);
  }
}

/**
 * Formats a decimal value as a percentage.
 *
 * @param value - The decimal value (0.456 = 45.6%)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 *
 * @example
 * formatPercent(0.456) // "45.60%"
 * formatPercent(0.456, 0) // "46%"
 * formatPercent(1) // "100.00%"
 */
export function formatPercent(value: number, decimals: number = 2): string {
  const percentage = value * 100;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Formats a number as an ordinal (1st, 2nd, 3rd, etc.).
 *
 * @param num - The number to format
 * @returns Ordinal string
 *
 * @example
 * formatOrdinal(1) // "1st"
 * formatOrdinal(2) // "2nd"
 * formatOrdinal(21) // "21st"
 * formatOrdinal(11) // "11th" (special case)
 */
export function formatOrdinal(num: number): string {
  const lastDigit = num % 10;
  const lastTwoDigits = num % 100;

  // Special case for 11, 12, 13
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return `${num}th`;
  }

  // Standard cases
  switch (lastDigit) {
    case 1:
      return `${num}st`;
    case 2:
      return `${num}nd`;
    case 3:
      return `${num}rd`;
    default:
      return `${num}th`;
  }
}

/**
 * Pads a number with leading zeros.
 *
 * @param num - The number to pad
 * @param length - Target length (default: 2)
 * @returns Zero-padded string
 *
 * @internal
 */
function padZero(num: number, length: number = 2): string {
  return String(num).padStart(length, '0');
}

/**
 * Formats a date according to a pattern.
 * Supports: YYYY, MM, DD
 *
 * @param date - Date object or ISO date string
 * @param format - Format pattern (default: 'YYYY-MM-DD')
 * @returns Formatted date string
 *
 * @example
 * formatDate(new Date(2024, 5, 15)) // "2024-06-15"
 * formatDate(new Date(2024, 5, 15), 'DD/MM/YYYY') // "15/06/2024"
 */
export function formatDate(date: Date | string, format: string = 'YYYY-MM-DD'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }

  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  return format
    .replace('YYYY', String(year))
    .replace('MM', padZero(month))
    .replace('DD', padZero(day));
}

/**
 * Formats a time according to a pattern.
 * Supports: hh (12-hour), mm (minutes), ss (seconds), A (AM/PM), a (am/pm)
 *
 * @param date - Date object or ISO date string
 * @param format - Format pattern (default: 'HH:mm:ss' for 24-hour)
 * @returns Formatted time string
 *
 * @example
 * formatTime(new Date(2024, 5, 15, 14, 5, 30)) // "14:05:30"
 * formatTime(new Date(2024, 5, 15, 14, 5, 30), 'hh:mm:ss A') // "02:05:30 PM"
 */
export function formatTime(date: Date | string, format: string = 'HH:mm:ss'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return 'Invalid Time';
  }

  const hours24 = d.getHours();
  const hours12 = hours24 % 12 || 12;
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();
  const ampm = hours24 >= 12 ? 'PM' : 'AM';

  return format
    .replace('HH', padZero(hours24))
    .replace('hh', padZero(hours12))
    .replace('mm', padZero(minutes))
    .replace('ss', padZero(seconds))
    .replace('A', ampm)
    .replace('a', ampm.toLowerCase());
}

/**
 * Formats a date and time according to a pattern.
 * Combines date and time formatting.
 *
 * @param date - Date object or ISO date string
 * @param format - Format pattern (default: 'YYYY-MM-DD HH:mm:ss')
 * @returns Formatted datetime string
 *
 * @example
 * formatDateTime(new Date(2024, 5, 15, 14, 5, 30)) // "2024-06-15 14:05:30"
 * formatDateTime(new Date(2024, 5, 15, 14, 5, 30), 'YYYY-MM-DD hh:mm:ss A') // "2024-06-15 02:05:30 PM"
 */
export function formatDateTime(date: Date | string, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return 'Invalid DateTime';
  }

  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours24 = d.getHours();
  const hours12 = hours24 % 12 || 12;
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();
  const ampm = hours24 >= 12 ? 'PM' : 'AM';

  return format
    .replace('YYYY', String(year))
    .replace('MM', padZero(month))
    .replace('DD', padZero(day))
    .replace('HH', padZero(hours24))
    .replace('hh', padZero(hours12))
    .replace('mm', padZero(minutes))
    .replace('ss', padZero(seconds))
    .replace('A', ampm)
    .replace('a', ampm.toLowerCase());
}

/**
 * Formats a date as relative time (e.g., "2 hours ago", "in 5 minutes").
 *
 * @param date - Date object or ISO date string
 * @returns Relative time string
 *
 * @example
 * formatRelativeTime(new Date(Date.now() - 7200000)) // "2 hours ago"
 * formatRelativeTime(new Date(Date.now() + 300000)) // "in 5 minutes"
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }

  const now = Date.now();
  const then = d.getTime();
  const diff = now - then;
  const absDiff = Math.abs(diff);
  const isFuture = diff < 0;

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 10) {
    return 'just now';
  }

  if (seconds < 60) {
    return isFuture ? `in ${seconds} seconds` : `${seconds} seconds ago`;
  }

  if (minutes < 60) {
    const unit = minutes === 1 ? 'minute' : 'minutes';
    return isFuture ? `in ${minutes} ${unit}` : `${minutes} ${unit} ago`;
  }

  if (hours < 24) {
    const unit = hours === 1 ? 'hour' : 'hours';
    return isFuture ? `in ${hours} ${unit}` : `${hours} ${unit} ago`;
  }

  const unit = days === 1 ? 'day' : 'days';
  return isFuture ? `in ${days} ${unit}` : `${days} ${unit} ago`;
}

/**
 * Formats bytes as human-readable file size.
 *
 * @param bytes - Number of bytes
 * @returns Formatted file size string
 *
 * @example
 * formatFileSize(1024) // "1.00 KB"
 * formatFileSize(1048576) // "1.00 MB"
 * formatFileSize(1073741824) // "1.00 GB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  if (i === 0) {
    return `${bytes} ${units[i]}`;
  }

  const size = bytes / Math.pow(k, i);
  return `${size.toFixed(2)} ${units[i]}`;
}

/**
 * Formats a phone number according to region.
 *
 * @param phone - Phone number string (digits only or with formatting)
 * @param region - Region code ('US' or 'INTL', default: 'US')
 * @returns Formatted phone number
 *
 * @example
 * formatPhone('1234567890', 'US') // "(123) 456-7890"
 * formatPhone('1234567890', 'INTL') // "+1 123-456-7890"
 */
export function formatPhone(phone: string, region: string = 'US'): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  if (digits.length !== 10) {
    return phone; // Return original if not 10 digits
  }

  const areaCode = digits.slice(0, 3);
  const middle = digits.slice(3, 6);
  const last = digits.slice(6, 10);

  if (region === 'INTL') {
    return `+1 ${areaCode}-${middle}-${last}`;
  }

  // Default US format
  return `(${areaCode}) ${middle}-${last}`;
}

/**
 * Formats a credit card number with spaces.
 * Supports 15-digit (Amex) and 16-digit cards.
 *
 * @param card - Credit card number string
 * @returns Formatted credit card number
 *
 * @example
 * formatCreditCard('4532015112830366') // "4532 0151 1283 0366"
 * formatCreditCard('378282246310005') // "3782 822463 10005" (Amex)
 */
export function formatCreditCard(card: string): string {
  // Remove all non-digit characters
  const digits = card.replace(/\D/g, '');

  // Amex format (15 digits): 4-6-5
  if (digits.length === 15) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 10)} ${digits.slice(10, 15)}`;
  }

  // Standard format (16 digits): 4-4-4-4
  if (digits.length === 16) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)} ${digits.slice(12, 16)}`;
  }

  return card; // Return original if not standard length
}

/**
 * Formats milliseconds as a duration string.
 *
 * @param milliseconds - Duration in milliseconds
 * @param format - 'short' (1h 1m 1s) or 'long' (1 hour 1 minute 1 second), default: 'short'
 * @returns Formatted duration string
 *
 * @example
 * formatDuration(3661000, 'short') // "1h 1m 1s"
 * formatDuration(3661000, 'long') // "1 hour 1 minute 1 second"
 */
export function formatDuration(milliseconds: number, format: 'short' | 'long' = 'short'): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const s = seconds % 60;
  const m = minutes % 60;
  const h = hours;

  if (format === 'long') {
    const parts: string[] = [];

    if (h > 0) {
      parts.push(`${h} ${h === 1 ? 'hour' : 'hours'}`);
    }
    if (m > 0) {
      parts.push(`${m} ${m === 1 ? 'minute' : 'minutes'}`);
    }
    if (s > 0) {
      parts.push(`${s} ${s === 1 ? 'second' : 'seconds'}`);
    }

    return parts.length > 0 ? parts.join(' ') : '0 seconds';
  }

  // Short format
  const parts: string[] = [];

  if (h > 0) {
    parts.push(`${h}h`);
  }
  if (m > 0) {
    parts.push(`${m}m`);
  }
  if (s > 0 || parts.length === 0) {
    parts.push(`${s}s`);
  }

  return parts.join(' ');
}
