/**
 * Validation Utility Library
 * Zero external dependencies, pure functions with strict TypeScript
 *
 * @module validation
 */

// Constants for validation
const EMAIL_REGEX = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;
const PHONE_REGEX = /^\+?[\d\s\-()]{10,}$/;
const MIN_PASSWORD_LENGTH = 8;
const STRONG_PASSWORD_LENGTH = 12;

/**
 * Validation rule interface for custom validators
 */
export interface ValidationRule {
  readonly name: string;
  readonly validate: (value: unknown) => boolean;
  readonly message: string;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

/**
 * Password strength result interface
 */
export interface PasswordStrengthResult {
  readonly valid: boolean;
  readonly strength: 'weak' | 'medium' | 'strong';
  readonly issues: readonly string[];
}

/**
 * Validates an email address using RFC 5322 simplified pattern
 *
 * @param email - The email address to validate
 * @returns True if the email is valid, false otherwise
 *
 * @example
 * validateEmail('user@example.com'); // true
 * validateEmail('invalid@'); // false
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Check for consecutive dots
  if (email.includes('..')) {
    return false;
  }

  // Check for spaces
  if (email.includes(' ')) {
    return false;
  }

  return EMAIL_REGEX.test(email);
}

/**
 * Validates a URL
 *
 * @param url - The URL to validate
 * @returns True if the URL is valid, false otherwise
 *
 * @example
 * validateURL('https://www.example.com'); // true
 * validateURL('not-a-url'); // false
 */
export function validateURL(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  return URL_REGEX.test(url);
}

/**
 * Validates an international phone number
 *
 * @param phone - The phone number to validate
 * @param region - Optional region code (for future expansion)
 * @returns True if the phone number is valid, false otherwise
 *
 * @example
 * validatePhone('+1234567890'); // true
 * validatePhone('123'); // false
 */
export function validatePhone(phone: string, region?: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Remove common formatting characters
  const cleaned = phone.replace(/[\s\-()]/g, '');

  // Must have at least 10 digits
  const digitCount = (cleaned.match(/\d/g) || []).length;
  if (digitCount < 10) {
    return false;
  }

  // Must only contain digits, +, spaces, hyphens, and parentheses
  return PHONE_REGEX.test(phone);
}

/**
 * Validates that a value is not empty
 *
 * @param value - The value to validate
 * @returns True if the value is not empty, false otherwise
 *
 * @example
 * validateRequired('text'); // true
 * validateRequired(''); // false
 * validateRequired(null); // false
 */
export function validateRequired(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  return true;
}

/**
 * Validates that a string meets minimum length requirement
 *
 * @param value - The string to validate
 * @param min - Minimum length required
 * @returns True if the string meets minimum length, false otherwise
 *
 * @example
 * validateMinLength('hello', 3); // true
 * validateMinLength('hi', 5); // false
 */
export function validateMinLength(value: string, min: number): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  return value.length >= min;
}

/**
 * Validates that a string does not exceed maximum length
 *
 * @param value - The string to validate
 * @param max - Maximum length allowed
 * @returns True if the string does not exceed maximum length, false otherwise
 *
 * @example
 * validateMaxLength('hello', 10); // true
 * validateMaxLength('hello world', 5); // false
 */
export function validateMaxLength(value: string, max: number): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  return value.length <= max;
}

/**
 * Validates that a string matches a given pattern
 *
 * @param value - The string to validate
 * @param pattern - Regular expression pattern (as RegExp or string)
 * @returns True if the string matches the pattern, false otherwise
 *
 * @example
 * validatePattern('abc123', /^[a-z0-9]+$/); // true
 * validatePattern('ABC', /^[a-z]+$/); // false
 */
export function validatePattern(value: string, pattern: RegExp | string): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
  return regex.test(value);
}

/**
 * Validates that a number falls within a specified range
 *
 * @param value - The number to validate
 * @param min - Optional minimum value (inclusive)
 * @param max - Optional maximum value (inclusive)
 * @returns True if the number is within range, false otherwise
 *
 * @example
 * validateNumberRange(5, 1, 10); // true
 * validateNumberRange(15, 1, 10); // false
 */
export function validateNumberRange(
  value: number,
  min?: number,
  max?: number
): boolean {
  if (typeof value !== 'number' || isNaN(value)) {
    return false;
  }

  if (min !== undefined && value < min) {
    return false;
  }

  if (max !== undefined && value > max) {
    return false;
  }

  return true;
}

/**
 * Validates password strength and returns detailed feedback
 *
 * @param password - The password to validate
 * @returns Object containing validity, strength level, and issues array
 *
 * @example
 * validatePasswordStrength('MyP@ssw0rd123');
 * // { valid: true, strength: 'strong', issues: [] }
 */
export function validatePasswordStrength(
  password: string
): PasswordStrengthResult {
  const issues: string[] = [];
  let score = 0;

  if (typeof password !== 'string') {
    return {
      valid: false,
      strength: 'weak',
      issues: ['Password must be a string'],
    };
  }

  // Check minimum length
  if (password.length < MIN_PASSWORD_LENGTH) {
    issues.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }

  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    issues.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    issues.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  // Check for numbers
  if (!/\d/.test(password)) {
    issues.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  // Check for special characters
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    issues.push('Password must contain at least one special character');
  } else {
    score += 1;
  }

  // Bonus for longer passwords
  if (password.length >= STRONG_PASSWORD_LENGTH) {
    score += 1;
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong';
  if (score <= 2) {
    strength = 'weak';
  } else if (score <= 5) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }

  // Valid if no issues
  const valid = issues.length === 0;

  return {
    valid,
    strength,
    issues,
  };
}

/**
 * Validates a credit card number using the Luhn algorithm
 *
 * @param cardNumber - The credit card number to validate (can include spaces/dashes)
 * @returns True if the card number is valid, false otherwise
 *
 * @example
 * validateCreditCard('4532015112830366'); // true
 * validateCreditCard('1234567890123456'); // false
 */
export function validateCreditCard(cardNumber: string): boolean {
  if (!cardNumber || typeof cardNumber !== 'string') {
    return false;
  }

  // Remove spaces and dashes
  const cleaned = cardNumber.replace(/[\s-]/g, '');

  // Check if it contains only digits
  if (!/^\d+$/.test(cleaned)) {
    return false;
  }

  // Check minimum length (typically 13-19 digits)
  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }

  // Reject all zeros or all same digit
  if (/^(.)\1+$/.test(cleaned)) {
    return false;
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  // Loop through digits from right to left
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Validates a date and optionally checks if it falls within a range
 *
 * @param date - The date to validate (string or Date object)
 * @param minDate - Optional minimum date
 * @param maxDate - Optional maximum date
 * @returns True if the date is valid and within range, false otherwise
 *
 * @example
 * validateDate('2024-01-01'); // true
 * validateDate('invalid'); // false
 */
export function validateDate(
  date: string | Date,
  minDate?: Date,
  maxDate?: Date
): boolean {
  let dateObj: Date;

  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    if (date.trim() === '') {
      return false;
    }
    dateObj = new Date(date);
  } else {
    return false;
  }

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return false;
  }

  // Check minimum date
  if (minDate && dateObj < minDate) {
    return false;
  }

  // Check maximum date
  if (maxDate && dateObj > maxDate) {
    return false;
  }

  return true;
}

/**
 * Creates a custom validator from an array of validation rules
 *
 * @param rules - Array of validation rules to apply
 * @returns Validator function that returns validation result
 *
 * @example
 * const validator = createValidator([
 *   { name: 'required', validate: (v) => v !== '', message: 'Required' }
 * ]);
 * const result = validator('test'); // { valid: true, errors: [] }
 */
export function createValidator(
  rules: ValidationRule[]
): (value: unknown) => ValidationResult {
  return (value: unknown): ValidationResult => {
    const errors: string[] = [];

    for (const rule of rules) {
      if (!rule.validate(value)) {
        errors.push(rule.message);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  };
}
