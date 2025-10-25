/**
 * Validation Utility Library - Test Suite
 * Following strict TDD methodology
 */

import { test } from '../../test-framework';
import {
  validateEmail,
  validateURL,
  validatePhone,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validatePattern,
  validateNumberRange,
  validatePasswordStrength,
  validateCreditCard,
  validateDate,
  createValidator,
  type ValidationRule,
  type ValidationResult,
} from './validation';

test.describe('Validation Utility Library', () => {
  // Email Validation Tests
  test.it('should validate correct email addresses', () => {
    test.expect(validateEmail('test@example.com')).toBe(true);
    test.expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    test.expect(validateEmail('first+last@example.com')).toBe(true);
    test.expect(validateEmail('test123@test-domain.com')).toBe(true);
  });

  test.it('should reject invalid email addresses', () => {
    test.expect(validateEmail('invalid')).toBe(false);
    test.expect(validateEmail('@example.com')).toBe(false);
    test.expect(validateEmail('test@')).toBe(false);
    test.expect(validateEmail('test..test@example.com')).toBe(false);
    test.expect(validateEmail('test @example.com')).toBe(false);
    test.expect(validateEmail('')).toBe(false);
  });

  // URL Validation Tests
  test.it('should validate correct URLs', () => {
    test.expect(validateURL('https://www.example.com')).toBe(true);
    test.expect(validateURL('http://example.com')).toBe(true);
    test.expect(validateURL('https://example.com/path/to/resource')).toBe(true);
    test.expect(validateURL('https://example.com:8080')).toBe(true);
    test.expect(validateURL('https://sub.example.com')).toBe(true);
  });

  test.it('should reject invalid URLs', () => {
    test.expect(validateURL('not-a-url')).toBe(false);
    test.expect(validateURL('ftp://example.com')).toBe(false);
    test.expect(validateURL('https://')).toBe(false);
    test.expect(validateURL('')).toBe(false);
    test.expect(validateURL('http:/example.com')).toBe(false);
  });

  // Phone Validation Tests
  test.it('should validate international phone numbers', () => {
    test.expect(validatePhone('+1234567890')).toBe(true);
    test.expect(validatePhone('+44 20 7946 0958')).toBe(true);
    test.expect(validatePhone('+1 (555) 123-4567')).toBe(true);
    test.expect(validatePhone('+49 30 12345678')).toBe(true);
  });

  test.it('should reject invalid phone numbers', () => {
    test.expect(validatePhone('123')).toBe(false);
    test.expect(validatePhone('abc')).toBe(false);
    test.expect(validatePhone('')).toBe(false);
    test.expect(validatePhone('123-456')).toBe(false);
  });

  // Required Field Validation Tests
  test.it('should validate required fields correctly', () => {
    test.expect(validateRequired('text')).toBe(true);
    test.expect(validateRequired(123)).toBe(true);
    test.expect(validateRequired(false)).toBe(true);
    test.expect(validateRequired(0)).toBe(true);
    test.expect(validateRequired([])).toBe(true);
    test.expect(validateRequired({})).toBe(true);
  });

  test.it('should reject empty required fields', () => {
    test.expect(validateRequired('')).toBe(false);
    test.expect(validateRequired(null)).toBe(false);
    test.expect(validateRequired(undefined)).toBe(false);
    test.expect(validateRequired('   ')).toBe(false);
  });

  // Min Length Validation Tests
  test.it('should validate minimum length correctly', () => {
    test.expect(validateMinLength('hello', 5)).toBe(true);
    test.expect(validateMinLength('hello', 3)).toBe(true);
    test.expect(validateMinLength('test', 0)).toBe(true);
  });

  test.it('should reject strings below minimum length', () => {
    test.expect(validateMinLength('hi', 3)).toBe(false);
    test.expect(validateMinLength('', 1)).toBe(false);
  });

  // Max Length Validation Tests
  test.it('should validate maximum length correctly', () => {
    test.expect(validateMaxLength('hello', 5)).toBe(true);
    test.expect(validateMaxLength('hi', 5)).toBe(true);
    test.expect(validateMaxLength('', 10)).toBe(true);
  });

  test.it('should reject strings above maximum length', () => {
    test.expect(validateMaxLength('hello world', 5)).toBe(false);
    test.expect(validateMaxLength('test', 3)).toBe(false);
  });

  // Pattern Validation Tests
  test.it('should validate patterns correctly', () => {
    test.expect(validatePattern('abc123', /^[a-z0-9]+$/)).toBe(true);
    test.expect(validatePattern('test', '^[a-z]+$')).toBe(true);
    test.expect(validatePattern('123-456', /^\d{3}-\d{3}$/)).toBe(true);
  });

  test.it('should reject non-matching patterns', () => {
    test.expect(validatePattern('ABC', /^[a-z]+$/)).toBe(false);
    test.expect(validatePattern('test!', '^[a-z]+$')).toBe(false);
  });

  // Number Range Validation Tests
  test.it('should validate number ranges correctly', () => {
    test.expect(validateNumberRange(5, 1, 10)).toBe(true);
    test.expect(validateNumberRange(1, 1, 10)).toBe(true);
    test.expect(validateNumberRange(10, 1, 10)).toBe(true);
    test.expect(validateNumberRange(5, 1)).toBe(true);
    test.expect(validateNumberRange(5, undefined, 10)).toBe(true);
    test.expect(validateNumberRange(5)).toBe(true);
  });

  test.it('should reject out-of-range numbers', () => {
    test.expect(validateNumberRange(0, 1, 10)).toBe(false);
    test.expect(validateNumberRange(11, 1, 10)).toBe(false);
    test.expect(validateNumberRange(5, 6)).toBe(false);
    test.expect(validateNumberRange(15, undefined, 10)).toBe(false);
  });

  // Password Strength Validation Tests
  test.it('should identify weak passwords', () => {
    const result1 = validatePasswordStrength('abc');
    test.expect(result1.valid).toBe(false);
    test.expect(result1.strength).toBe('weak');
    test.expect(result1.issues.length).toBeGreaterThan(0);

    const result2 = validatePasswordStrength('password');
    test.expect(result2.strength).toBe('weak');
  });

  test.it('should identify medium strength passwords', () => {
    const result = validatePasswordStrength('Pass123!');
    test.expect(result.valid).toBe(true);
    test.expect(result.strength).toBe('medium');
  });

  test.it('should identify strong passwords', () => {
    const result = validatePasswordStrength('MyP@ssw0rd123!');
    test.expect(result.valid).toBe(true);
    test.expect(result.strength).toBe('strong');
    test.expect(result.issues.length).toBe(0);
  });

  test.it('should report specific password issues', () => {
    const result = validatePasswordStrength('short');
    test.expect(result.issues).toContain('Password must be at least 8 characters long');
  });

  // Credit Card Validation Tests (Luhn Algorithm)
  test.it('should validate correct credit card numbers', () => {
    test.expect(validateCreditCard('4532015112830366')).toBe(true); // Visa
    test.expect(validateCreditCard('6011111111111117')).toBe(true); // Discover
    test.expect(validateCreditCard('5555555555554444')).toBe(true); // Mastercard
    test.expect(validateCreditCard('378282246310005')).toBe(true); // Amex
  });

  test.it('should reject invalid credit card numbers', () => {
    test.expect(validateCreditCard('1234567890123456')).toBe(false);
    test.expect(validateCreditCard('0000000000000000')).toBe(false);
    test.expect(validateCreditCard('123')).toBe(false);
    test.expect(validateCreditCard('')).toBe(false);
    test.expect(validateCreditCard('abcd1234efgh5678')).toBe(false);
  });

  test.it('should handle credit card numbers with spaces and dashes', () => {
    test.expect(validateCreditCard('4532-0151-1283-0366')).toBe(true);
    test.expect(validateCreditCard('4532 0151 1283 0366')).toBe(true);
  });

  // Date Validation Tests
  test.it('should validate correct dates', () => {
    const now = new Date();
    test.expect(validateDate(now)).toBe(true);
    test.expect(validateDate('2024-01-01')).toBe(true);
    test.expect(validateDate(new Date('2024-01-01'))).toBe(true);
  });

  test.it('should validate dates within range', () => {
    const min = new Date('2024-01-01');
    const max = new Date('2024-12-31');
    test.expect(validateDate('2024-06-15', min, max)).toBe(true);
    test.expect(validateDate(new Date('2024-01-01'), min, max)).toBe(true);
  });

  test.it('should reject dates outside range', () => {
    const min = new Date('2024-01-01');
    const max = new Date('2024-12-31');
    test.expect(validateDate('2023-12-31', min, max)).toBe(false);
    test.expect(validateDate('2025-01-01', min, max)).toBe(false);
  });

  test.it('should reject invalid dates', () => {
    test.expect(validateDate('invalid')).toBe(false);
    test.expect(validateDate('2024-13-01')).toBe(false);
    test.expect(validateDate('')).toBe(false);
  });

  // Custom Validator Tests
  test.it('should create custom validator with single rule', () => {
    const rules: ValidationRule[] = [
      {
        name: 'required',
        validate: (value: unknown) => value !== null && value !== undefined && value !== '',
        message: 'Field is required',
      },
    ];

    const validator = createValidator(rules);
    const result1 = validator('test');
    test.expect(result1.valid).toBe(true);
    test.expect(result1.errors.length).toBe(0);

    const result2 = validator('');
    test.expect(result2.valid).toBe(false);
    test.expect(result2.errors.length).toBe(1);
    test.expect(result2.errors[0]).toBe('Field is required');
  });

  test.it('should create custom validator with multiple rules', () => {
    const rules: ValidationRule[] = [
      {
        name: 'required',
        validate: (value: unknown) => typeof value === 'string' && value.length > 0,
        message: 'Field is required',
      },
      {
        name: 'minLength',
        validate: (value: unknown) => typeof value === 'string' && value.length >= 5,
        message: 'Minimum length is 5',
      },
    ];

    const validator = createValidator(rules);
    const result = validator('hi');
    test.expect(result.valid).toBe(false);
    test.expect(result.errors.length).toBe(1);
    test.expect(result.errors[0]).toBe('Minimum length is 5');
  });

  test.it('should return all errors from custom validator', () => {
    const rules: ValidationRule[] = [
      {
        name: 'hasUpper',
        validate: (value: unknown) => typeof value === 'string' && /[A-Z]/.test(value),
        message: 'Must contain uppercase letter',
      },
      {
        name: 'hasNumber',
        validate: (value: unknown) => typeof value === 'string' && /\d/.test(value),
        message: 'Must contain number',
      },
    ];

    const validator = createValidator(rules);
    const result = validator('test');
    test.expect(result.valid).toBe(false);
    test.expect(result.errors.length).toBe(2);
  });

  test.it('should handle empty rules array', () => {
    const validator = createValidator([]);
    const result = validator('anything');
    test.expect(result.valid).toBe(true);
    test.expect(result.errors.length).toBe(0);
  });

  // Additional Edge Case Tests
  test.it('should handle email with multiple dots in domain', () => {
    test.expect(validateEmail('test@sub.domain.example.com')).toBe(true);
  });

  test.it('should reject email with leading/trailing spaces', () => {
    test.expect(validateEmail(' test@example.com')).toBe(false);
    test.expect(validateEmail('test@example.com ')).toBe(false);
  });

  test.it('should validate URL with query parameters', () => {
    test.expect(validateURL('https://example.com/path?param=value&other=123')).toBe(true);
  });

  test.it('should validate URL with hash', () => {
    test.expect(validateURL('https://example.com/path#section')).toBe(true);
  });

  test.it('should reject URL without protocol', () => {
    test.expect(validateURL('www.example.com')).toBe(false);
  });

  test.it('should handle phone numbers with country code variations', () => {
    test.expect(validatePhone('+1-555-123-4567')).toBe(true);
    test.expect(validatePhone('(555) 123-4567')).toBe(true); // US format without country code
  });

  test.it('should validate number with zero as minimum', () => {
    test.expect(validateNumberRange(0, 0, 10)).toBe(true);
  });

  test.it('should validate negative numbers in range', () => {
    test.expect(validateNumberRange(-5, -10, 0)).toBe(true);
    test.expect(validateNumberRange(-15, -10, 0)).toBe(false);
  });

  test.it('should reject NaN in number range validation', () => {
    test.expect(validateNumberRange(NaN, 1, 10)).toBe(false);
  });

  test.it('should handle pattern validation with special regex characters', () => {
    test.expect(validatePattern('test@example', /^[\w@]+$/)).toBe(true);
    test.expect(validatePattern('test@example!', /^[\w@]+$/)).toBe(false);
  });

  test.it('should validate pattern with string regex', () => {
    test.expect(validatePattern('abc', '^[a-z]{3}$')).toBe(true);
  });

  test.it('should handle min/max length edge cases', () => {
    test.expect(validateMinLength('', 0)).toBe(true);
    test.expect(validateMaxLength('', 0)).toBe(true);
  });

  test.it('should validate required with boolean false', () => {
    test.expect(validateRequired(false)).toBe(true);
  });

  test.it('should validate required with number zero', () => {
    test.expect(validateRequired(0)).toBe(true);
  });

  test.it('should validate required with empty array', () => {
    test.expect(validateRequired([])).toBe(true);
  });

  test.it('should validate required with empty object', () => {
    test.expect(validateRequired({})).toBe(true);
  });

  test.it('should handle password with only special characters', () => {
    const result = validatePasswordStrength('!@#$%^&*');
    test.expect(result.valid).toBe(false);
    test.expect(result.strength).toBe('weak');
  });

  test.it('should validate date with Date object', () => {
    const date = new Date('2024-06-15');
    test.expect(validateDate(date)).toBe(true);
  });

  test.it('should validate date at exact min boundary', () => {
    const min = new Date('2024-01-01');
    test.expect(validateDate('2024-01-01', min)).toBe(true);
  });

  test.it('should validate date at exact max boundary', () => {
    const max = new Date('2024-12-31');
    test.expect(validateDate('2024-12-31', undefined, max)).toBe(true);
  });

  test.it('should reject invalid date string format', () => {
    test.expect(validateDate('32-13-2024')).toBe(false);
  });

  test.it('should reject empty string date', () => {
    test.expect(validateDate('   ')).toBe(false);
  });

  test.it('should validate credit card with varying lengths', () => {
    test.expect(validateCreditCard('4111111111111111')).toBe(true); // 16 digits
    test.expect(validateCreditCard('378282246310005')).toBe(true); // 15 digits
  });

  test.it('should reject credit card with letters mixed in', () => {
    test.expect(validateCreditCard('411111111111111A')).toBe(false);
  });

  test.it('should reject credit card that is too short', () => {
    test.expect(validateCreditCard('123456789012')).toBe(false);
  });

  test.it('should reject credit card that is too long', () => {
    test.expect(validateCreditCard('12345678901234567890')).toBe(false);
  });

  test.it('should create validator that passes all rules', () => {
    const rules: ValidationRule[] = [
      {
        name: 'length',
        validate: (v: unknown) => typeof v === 'string' && v.length >= 5,
        message: 'Too short',
      },
      {
        name: 'alphanumeric',
        validate: (v: unknown) => typeof v === 'string' && /^[a-z0-9]+$/i.test(v),
        message: 'Must be alphanumeric',
      },
    ];

    const validator = createValidator(rules);
    const result = validator('test123');
    test.expect(result.valid).toBe(true);
    test.expect(result.errors.length).toBe(0);
  });

  test.it('should handle non-string input in validateMinLength', () => {
    test.expect(validateMinLength(123 as unknown as string, 5)).toBe(false);
  });

  test.it('should handle non-string input in validateMaxLength', () => {
    test.expect(validateMaxLength(null as unknown as string, 5)).toBe(false);
  });

  test.it('should handle non-string input in validatePattern', () => {
    test.expect(validatePattern(undefined as unknown as string, /test/)).toBe(false);
  });
});
