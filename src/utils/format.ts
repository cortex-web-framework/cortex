/**
 * Format utilities - NO external dependencies
 * Number, date, and value formatting functions
 */

/**
 * Formats number as currency
 * @param amount Amount to format
 * @param currency Currency code (default: 'USD')
 * @param locale Locale for formatting (default: 'en-US')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD', locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Formats number as percentage
 * @param value Value to format (0-1 or 0-100)
 * @param decimals Number of decimal places (default: 0)
 * @param asDecimal If true, expects 0-1 value (default: false)
 * @returns Formatted percentage string
 */
export function formatPercent(value: number, decimals: number = 0, asDecimal: boolean = false): string {
  const num = asDecimal ? value * 100 : value;
  return num.toFixed(decimals) + '%';
}

/**
 * Formats number with thousands separator
 * @param num Number to format
 * @param decimals Number of decimal places (default: 0)
 * @param separator Thousands separator (default: ',')
 * @returns Formatted number string
 */
export function formatNumber(num: number, decimals: number = 0, separator: string = ','): string {
  const fixed = num.toFixed(decimals);
  const parts = fixed.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return decimalPart ? formatted + '.' + decimalPart : formatted;
}

/**
 * Formats bytes to human-readable size
 * @param bytes Number of bytes
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * Formats date to string
 * @param date Date to format
 * @param format Format string (default: 'YYYY-MM-DD')
 *   Supported tokens: YYYY, YY, MM, DD, HH, mm, ss, ms
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | number, format: string = 'YYYY-MM-DD'): string {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    throw new Error('Invalid date');
  }

  const tokens: Record<string, string> = {
    YYYY: d.getFullYear().toString(),
    YY: d.getFullYear().toString().slice(-2),
    MM: String(d.getMonth() + 1).padStart(2, '0'),
    DD: String(d.getDate()).padStart(2, '0'),
    HH: String(d.getHours()).padStart(2, '0'),
    mm: String(d.getMinutes()).padStart(2, '0'),
    ss: String(d.getSeconds()).padStart(2, '0'),
    ms: String(d.getMilliseconds()).padStart(3, '0'),
  };

  let result = format;
  for (const [token, value] of Object.entries(tokens)) {
    result = result.replace(new RegExp(token, 'g'), value);
  }

  return result;
}

/**
 * Formats time to string
 * @param date Date to format time from
 * @param format Format string (default: 'HH:mm:ss')
 * @returns Formatted time string
 */
export function formatTime(date: Date | string | number = new Date(), format: string = 'HH:mm:ss'): string {
  return formatDate(date, format);
}

/**
 * Formats date in relative terms (e.g., "2 hours ago")
 * @param date Date to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 0) {
    return 'in the future';
  }

  const intervals: Array<[number, string, number]> = [
    [31536000, 'year', 1],
    [2592000, 'month', 1],
    [86400, 'day', 1],
    [3600, 'hour', 1],
    [60, 'minute', 1],
    [1, 'second', 1],
  ];

  for (const [secondsInInterval, intervalName, divider] of intervals) {
    const interval = Math.floor(seconds / secondsInInterval) / divider;

    if (interval >= 1) {
      const count = Math.floor(interval);
      return count === 1 ? `${count} ${intervalName} ago` : `${count} ${intervalName}s ago`;
    }
  }

  return 'just now';
}

/**
 * Formats duration in milliseconds to string
 * @param ms Duration in milliseconds
 * @param format Format: 'long', 'short', 'compact' (default: 'short')
 * @returns Formatted duration string
 */
export function formatDuration(ms: number, format: 'long' | 'short' | 'compact' = 'short'): string {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  const parts: string[] = [];

  if (format === 'long') {
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    if (seconds > 0) parts.push(`${seconds} second${seconds > 1 ? 's' : ''}`);
  } else if (format === 'short') {
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);
  } else {
    // compact format: HH:mm:ss or mm:ss or ss
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    if (minutes > 0) {
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return String(seconds).padStart(2, '0');
  }

  return parts.join(', ') || '0s';
}

/**
 * Formats phone number
 * @param phone Phone number string
 * @param format Format type: 'US' or 'INTL' (default: 'US')
 * @returns Formatted phone number
 */
export function formatPhone(phone: string, format: 'US' | 'INTL' = 'US'): string {
  const cleaned = phone.replace(/\D/g, '');

  if (format === 'US') {
    if (cleaned.length !== 10) {
      throw new Error('US phone number must be 10 digits');
    }
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  // International format
  if (cleaned.length < 7 || cleaned.length > 15) {
    throw new Error('International phone number must be 7-15 digits');
  }

  // Basic formatting: +1234567890
  return '+' + cleaned;
}

/**
 * Formats credit card number
 * @param cardNumber Card number
 * @param masked Whether to mask the number (default: false)
 * @returns Formatted card number
 */
export function formatCreditCard(cardNumber: string, masked: boolean = false): string {
  const cleaned = cardNumber.replace(/\D/g, '');

  if (cleaned.length < 13 || cleaned.length > 19) {
    throw new Error('Card number must be 13-19 digits');
  }

  if (masked) {
    const lastFour = cleaned.slice(-4);
    return `•••• •••• •••• ${lastFour}`;
  }

  // Format with spaces every 4 digits
  return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
}

/**
 * Formats number with ordinal suffix (1st, 2nd, 3rd, etc.)
 * @param num Number to format
 * @returns Number with ordinal suffix
 */
export function formatOrdinal(num: number): string {
  if (typeof num !== 'number' || num % 1 !== 0) {
    throw new Error('Input must be an integer');
  }

  const abs = Math.abs(num);
  const suffix =
    abs % 100 === 11 || abs % 100 === 12 || abs % 100 === 13
      ? 'th'
      : abs % 10 === 1
        ? 'st'
        : abs % 10 === 2
          ? 'nd'
          : abs % 10 === 3
            ? 'rd'
            : 'th';

  return num + suffix;
}

/**
 * Formats bytes as binary units (1024-based)
 * @param bytes Number of bytes
 * @param decimals Number of decimal places (default: 2)
 * @returns Binary units string
 */
export function formatBinary(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * Formats bytes as decimal units (1000-based)
 * @param bytes Number of bytes
 * @param decimals Number of decimal places (default: 2)
 * @returns Decimal units string
 */
export function formatDecimal(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B';

  const k = 1000;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * Truncates text to word boundary
 * @param text Text to truncate
 * @param maxLength Maximum length
 * @param suffix Suffix for truncated text (default: '...')
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) {
    return text;
  }

  let truncated = text.slice(0, maxLength - suffix.length).trim();
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > 0) {
    truncated = truncated.slice(0, lastSpace);
  }

  return truncated + suffix;
}

/**
 * Formats JSON with indentation
 * @param obj Object to format
 * @param indent Indentation spaces (default: 2)
 * @returns Formatted JSON string
 */
export function formatJSON(obj: any, indent: number = 2): string {
  return JSON.stringify(obj, null, indent);
}

/**
 * Formats value based on type
 * @param value Value to format
 * @param options Formatting options
 * @returns Formatted value
 */
export function format(
  value: any,
  options: {
    type?: 'number' | 'date' | 'currency' | 'percent' | 'filesize' | 'phone';
    decimals?: number;
    currency?: string;
    locale?: string;
    dateFormat?: string;
    phoneFormat?: 'US' | 'INTL';
  } = {}
): string {
  const { type, decimals = 2, currency = 'USD', locale = 'en-US', dateFormat = 'YYYY-MM-DD', phoneFormat = 'US' } =
    options;

  if (type === 'number') {
    return formatNumber(value, decimals);
  }

  if (type === 'date') {
    return formatDate(value, dateFormat);
  }

  if (type === 'currency') {
    return formatCurrency(value, currency, locale);
  }

  if (type === 'percent') {
    return formatPercent(value, decimals);
  }

  if (type === 'filesize') {
    return formatFileSize(value, decimals);
  }

  if (type === 'phone') {
    return formatPhone(value, phoneFormat);
  }

  return String(value);
}
