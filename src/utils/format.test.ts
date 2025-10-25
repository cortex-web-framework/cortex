/**
 * TDD Test for Format Utilities
 * Zero Dependencies - Super Clean Code - Strict TypeScript
 */

import { test } from '../../test-framework';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatOrdinal,
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatFileSize,
  formatPhone,
  formatCreditCard,
  formatDuration
} from './format';

class FormatUtilsTest {
  runTests(): void {
    test.describe('Format Utilities - Currency Formatting', () => {
      test.it('should format USD currency with default locale', () => {
        const result = formatCurrency(1000);
        test.expect(result).toBe('$1,000.00');
      });

      test.it('should format USD currency with explicit locale', () => {
        const result = formatCurrency(1000, 'USD', 'en-US');
        test.expect(result).toBe('$1,000.00');
      });

      test.it('should format EUR currency', () => {
        const result = formatCurrency(1000, 'EUR', 'de-DE');
        // EUR formatting includes non-breaking space before currency symbol
        test.expect(result).toContain('1.000,00');
        test.expect(result).toContain('€');
      });

      test.it('should format GBP currency', () => {
        const result = formatCurrency(1000, 'GBP', 'en-GB');
        test.expect(result).toBe('£1,000.00');
      });

      test.it('should format negative currency', () => {
        const result = formatCurrency(-500, 'USD', 'en-US');
        test.expect(result).toBe('-$500.00');
      });

      test.it('should format zero currency', () => {
        const result = formatCurrency(0, 'USD', 'en-US');
        test.expect(result).toBe('$0.00');
      });

      test.it('should format decimal currency', () => {
        const result = formatCurrency(1234.56, 'USD', 'en-US');
        test.expect(result).toBe('$1,234.56');
      });

      test.it('should format very large currency', () => {
        const result = formatCurrency(1000000, 'USD', 'en-US');
        test.expect(result).toBe('$1,000,000.00');
      });
    });

    test.describe('Format Utilities - Number Formatting', () => {
      test.it('should format number with default decimals', () => {
        const result = formatNumber(1234.5678);
        test.expect(result).toBe('1,234.57');
      });

      test.it('should format number with custom decimals', () => {
        const result = formatNumber(1234.5678, 3);
        test.expect(result).toBe('1,234.568');
      });

      test.it('should format number with zero decimals', () => {
        const result = formatNumber(1234.5678, 0);
        test.expect(result).toBe('1,235');
      });

      test.it('should format negative number', () => {
        const result = formatNumber(-1234.56);
        test.expect(result).toBe('-1,234.56');
      });

      test.it('should format zero', () => {
        const result = formatNumber(0);
        test.expect(result).toBe('0.00');
      });

      test.it('should format large number', () => {
        const result = formatNumber(1000000);
        test.expect(result).toBe('1,000,000.00');
      });

      test.it('should format number with German locale', () => {
        const result = formatNumber(1234.56, 2, 'de-DE');
        test.expect(result).toBe('1.234,56');
      });

      test.it('should format small decimal number', () => {
        const result = formatNumber(0.123456, 4);
        test.expect(result).toBe('0.1235');
      });
    });

    test.describe('Format Utilities - Percent Formatting', () => {
      test.it('should format percent with default decimals', () => {
        const result = formatPercent(0.456);
        test.expect(result).toBe('45.60%');
      });

      test.it('should format percent with custom decimals', () => {
        const result = formatPercent(0.456, 1);
        test.expect(result).toBe('45.6%');
      });

      test.it('should format percent with zero decimals', () => {
        const result = formatPercent(0.456, 0);
        test.expect(result).toBe('46%');
      });

      test.it('should format 100 percent', () => {
        const result = formatPercent(1);
        test.expect(result).toBe('100.00%');
      });

      test.it('should format negative percent', () => {
        const result = formatPercent(-0.25);
        test.expect(result).toBe('-25.00%');
      });

      test.it('should format zero percent', () => {
        const result = formatPercent(0);
        test.expect(result).toBe('0.00%');
      });
    });

    test.describe('Format Utilities - Ordinal Formatting', () => {
      test.it('should format 1st', () => {
        test.expect(formatOrdinal(1)).toBe('1st');
      });

      test.it('should format 2nd', () => {
        test.expect(formatOrdinal(2)).toBe('2nd');
      });

      test.it('should format 3rd', () => {
        test.expect(formatOrdinal(3)).toBe('3rd');
      });

      test.it('should format 4th', () => {
        test.expect(formatOrdinal(4)).toBe('4th');
      });

      test.it('should format 11th (teen special case)', () => {
        test.expect(formatOrdinal(11)).toBe('11th');
      });

      test.it('should format 12th (teen special case)', () => {
        test.expect(formatOrdinal(12)).toBe('12th');
      });

      test.it('should format 13th (teen special case)', () => {
        test.expect(formatOrdinal(13)).toBe('13th');
      });

      test.it('should format 21st', () => {
        test.expect(formatOrdinal(21)).toBe('21st');
      });

      test.it('should format 22nd', () => {
        test.expect(formatOrdinal(22)).toBe('22nd');
      });

      test.it('should format 23rd', () => {
        test.expect(formatOrdinal(23)).toBe('23rd');
      });

      test.it('should format 100th', () => {
        test.expect(formatOrdinal(100)).toBe('100th');
      });

      test.it('should format 101st', () => {
        test.expect(formatOrdinal(101)).toBe('101st');
      });
    });

    test.describe('Format Utilities - Date Formatting', () => {
      test.it('should format date with YYYY-MM-DD', () => {
        const date = new Date(2024, 5, 15); // June 15, 2024
        const result = formatDate(date, 'YYYY-MM-DD');
        test.expect(result).toBe('2024-06-15');
      });

      test.it('should format date with default format', () => {
        const date = new Date(2024, 5, 15);
        const result = formatDate(date);
        test.expect(result).toBe('2024-06-15');
      });

      test.it('should format date with DD/MM/YYYY', () => {
        const date = new Date(2024, 5, 15);
        const result = formatDate(date, 'DD/MM/YYYY');
        test.expect(result).toBe('15/06/2024');
      });

      test.it('should format date from string', () => {
        const result = formatDate('2024-06-15', 'YYYY-MM-DD');
        test.expect(result).toBe('2024-06-15');
      });

      test.it('should pad single digit months', () => {
        const date = new Date(2024, 0, 5); // January 5, 2024
        const result = formatDate(date, 'YYYY-MM-DD');
        test.expect(result).toBe('2024-01-05');
      });

      test.it('should pad single digit days', () => {
        const date = new Date(2024, 11, 5); // December 5, 2024
        const result = formatDate(date, 'YYYY-MM-DD');
        test.expect(result).toBe('2024-12-05');
      });
    });

    test.describe('Format Utilities - Time Formatting', () => {
      test.it('should format time with hh:mm:ss', () => {
        const date = new Date(2024, 5, 15, 14, 5, 30);
        const result = formatTime(date, 'hh:mm:ss');
        test.expect(result).toBe('02:05:30');
      });

      test.it('should format time with AM/PM', () => {
        const date = new Date(2024, 5, 15, 14, 5, 30);
        const result = formatTime(date, 'hh:mm:ss A');
        test.expect(result).toBe('02:05:30 PM');
      });

      test.it('should format morning time', () => {
        const date = new Date(2024, 5, 15, 9, 30, 15);
        const result = formatTime(date, 'hh:mm:ss A');
        test.expect(result).toBe('09:30:15 AM');
      });

      test.it('should format midnight', () => {
        const date = new Date(2024, 5, 15, 0, 0, 0);
        const result = formatTime(date, 'hh:mm:ss A');
        test.expect(result).toBe('12:00:00 AM');
      });

      test.it('should format noon', () => {
        const date = new Date(2024, 5, 15, 12, 0, 0);
        const result = formatTime(date, 'hh:mm:ss A');
        test.expect(result).toBe('12:00:00 PM');
      });

      test.it('should format time with default format', () => {
        const date = new Date(2024, 5, 15, 14, 5, 30);
        const result = formatTime(date);
        test.expect(result).toBe('14:05:30');
      });
    });

    test.describe('Format Utilities - DateTime Formatting', () => {
      test.it('should format datetime with default format', () => {
        const date = new Date(2024, 5, 15, 14, 5, 30);
        const result = formatDateTime(date);
        test.expect(result).toBe('2024-06-15 14:05:30');
      });

      test.it('should format datetime with custom format', () => {
        const date = new Date(2024, 5, 15, 14, 5, 30);
        const result = formatDateTime(date, 'YYYY-MM-DD hh:mm:ss A');
        test.expect(result).toBe('2024-06-15 02:05:30 PM');
      });

      test.it('should format datetime from string', () => {
        const result = formatDateTime('2024-06-15T14:05:30', 'YYYY-MM-DD hh:mm:ss');
        test.expect(result).toContain('2024-06-15');
      });
    });

    test.describe('Format Utilities - Relative Time Formatting', () => {
      test.it('should format just now', () => {
        const now = new Date();
        const result = formatRelativeTime(now);
        test.expect(result).toBe('just now');
      });

      test.it('should format seconds ago', () => {
        const past = new Date(Date.now() - 30000); // 30 seconds ago
        const result = formatRelativeTime(past);
        test.expect(result).toBe('30 seconds ago');
      });

      test.it('should format minutes ago', () => {
        const past = new Date(Date.now() - 120000); // 2 minutes ago
        const result = formatRelativeTime(past);
        test.expect(result).toBe('2 minutes ago');
      });

      test.it('should format hours ago', () => {
        const past = new Date(Date.now() - 7200000); // 2 hours ago
        const result = formatRelativeTime(past);
        test.expect(result).toBe('2 hours ago');
      });

      test.it('should format days ago', () => {
        const past = new Date(Date.now() - 172800000); // 2 days ago
        const result = formatRelativeTime(past);
        test.expect(result).toBe('2 days ago');
      });

      test.it('should format in future (minutes)', () => {
        const future = new Date(Date.now() + 300000); // 5 minutes from now
        const result = formatRelativeTime(future);
        test.expect(result).toBe('in 5 minutes');
      });

      test.it('should format in future (hours)', () => {
        const future = new Date(Date.now() + 3600000); // 1 hour from now
        const result = formatRelativeTime(future);
        test.expect(result).toBe('in 1 hour');
      });
    });

    test.describe('Format Utilities - File Size Formatting', () => {
      test.it('should format bytes', () => {
        test.expect(formatFileSize(500)).toBe('500 B');
      });

      test.it('should format kilobytes', () => {
        test.expect(formatFileSize(1024)).toBe('1.00 KB');
      });

      test.it('should format megabytes', () => {
        test.expect(formatFileSize(1048576)).toBe('1.00 MB');
      });

      test.it('should format gigabytes', () => {
        test.expect(formatFileSize(1073741824)).toBe('1.00 GB');
      });

      test.it('should format terabytes', () => {
        test.expect(formatFileSize(1099511627776)).toBe('1.00 TB');
      });

      test.it('should format decimal KB', () => {
        test.expect(formatFileSize(1536)).toBe('1.50 KB');
      });

      test.it('should format zero bytes', () => {
        test.expect(formatFileSize(0)).toBe('0 B');
      });
    });

    test.describe('Format Utilities - Phone Formatting', () => {
      test.it('should format US phone number', () => {
        const result = formatPhone('1234567890', 'US');
        test.expect(result).toBe('(123) 456-7890');
      });

      test.it('should format international phone number', () => {
        const result = formatPhone('1234567890', 'INTL');
        test.expect(result).toBe('+1 123-456-7890');
      });

      test.it('should format default phone number', () => {
        const result = formatPhone('1234567890');
        test.expect(result).toBe('(123) 456-7890');
      });

      test.it('should handle phone with special characters', () => {
        const result = formatPhone('(123) 456-7890', 'US');
        test.expect(result).toBe('(123) 456-7890');
      });
    });

    test.describe('Format Utilities - Credit Card Formatting', () => {
      test.it('should format 16-digit card', () => {
        const result = formatCreditCard('4532015112830366');
        test.expect(result).toBe('4532 0151 1283 0366');
      });

      test.it('should format 15-digit card (Amex)', () => {
        const result = formatCreditCard('378282246310005');
        test.expect(result).toBe('3782 822463 10005');
      });

      test.it('should handle card with spaces', () => {
        const result = formatCreditCard('4532 0151 1283 0366');
        test.expect(result).toBe('4532 0151 1283 0366');
      });

      test.it('should handle card with dashes', () => {
        const result = formatCreditCard('4532-0151-1283-0366');
        test.expect(result).toBe('4532 0151 1283 0366');
      });
    });

    test.describe('Format Utilities - Duration Formatting', () => {
      test.it('should format duration in short format', () => {
        const result = formatDuration(3661000, 'short');
        test.expect(result).toBe('1h 1m 1s');
      });

      test.it('should format duration in long format', () => {
        const result = formatDuration(3661000, 'long');
        test.expect(result).toBe('1 hour 1 minute 1 second');
      });

      test.it('should format hours only', () => {
        const result = formatDuration(7200000, 'short');
        test.expect(result).toBe('2h');
      });

      test.it('should format minutes only', () => {
        const result = formatDuration(180000, 'short');
        test.expect(result).toBe('3m');
      });

      test.it('should format seconds only', () => {
        const result = formatDuration(45000, 'short');
        test.expect(result).toBe('45s');
      });

      test.it('should format zero duration', () => {
        const result = formatDuration(0, 'short');
        test.expect(result).toBe('0s');
      });

      test.it('should format complex duration in long format', () => {
        const result = formatDuration(3723000, 'long'); // 1h 2m 3s
        test.expect(result).toBe('1 hour 2 minutes 3 seconds');
      });

      test.it('should default to short format', () => {
        const result = formatDuration(3661000);
        test.expect(result).toBe('1h 1m 1s');
      });
    });
  }
}

// Run the tests
const formatTest = new FormatUtilsTest();
formatTest.runTests();
