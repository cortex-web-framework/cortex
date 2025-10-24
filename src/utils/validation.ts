/**
 * Form validation utilities - NO external dependencies
 * Pure TypeScript validation functions
 */

/**
 * Validates email format
 * @param email Email address
 * @returns True if valid email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 * Returns error message if invalid, null if valid
 * @param password Password to validate
 * @returns Error message or null if valid
 *
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }

  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }

  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'Password must contain at least one special character';
  }

  return null;
}

/**
 * Validates phone number format
 * @param phone Phone number
 * @param format Format: 'US' or 'INTL'
 * @returns True if valid
 */
export function validatePhone(phone: string, format: 'US' | 'INTL' = 'US'): boolean {
  const cleanPhone = phone.replace(/\D/g, '');

  if (format === 'US') {
    // US format: 10 digits
    return cleanPhone.length === 10;
  }

  // International format: 7-15 digits
  return cleanPhone.length >= 7 && cleanPhone.length <= 15;
}

/**
 * Validates URL format
 * @param url URL to validate
 * @returns True if valid URL
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates that a value is not empty
 * @param value Value to check
 * @returns True if not empty
 */
export function validateRequired(value: any): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return true;
}

/**
 * Validates minimum length
 * @param value String value
 * @param min Minimum length
 * @returns True if valid
 */
export function validateMinLength(value: string, min: number): boolean {
  return value.length >= min;
}

/**
 * Validates maximum length
 * @param value String value
 * @param max Maximum length
 * @returns True if valid
 */
export function validateMaxLength(value: string, max: number): boolean {
  return value.length <= max;
}

/**
 * Validates exact length
 * @param value String value
 * @param length Required length
 * @returns True if valid
 */
export function validateLength(value: string, length: number): boolean {
  return value.length === length;
}

/**
 * Validates that value matches a pattern
 * @param value String value
 * @param pattern Regular expression
 * @returns True if matches
 */
export function validatePattern(value: string, pattern: RegExp): boolean {
  return pattern.test(value);
}

/**
 * Validates number is within range
 * @param value Number value
 * @param min Minimum value
 * @param max Maximum value
 * @returns True if valid
 */
export function validateNumberRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validates that number is minimum value
 * @param value Number value
 * @param min Minimum value
 * @returns True if valid
 */
export function validateMin(value: number, min: number): boolean {
  return value >= min;
}

/**
 * Validates that number is maximum value
 * @param value Number value
 * @param max Maximum value
 * @returns True if valid
 */
export function validateMax(value: number, max: number): boolean {
  return value <= max;
}

/**
 * Validates credit card number (basic Luhn algorithm)
 * @param cardNumber Credit card number
 * @returns True if valid
 */
export function validateCreditCard(cardNumber: string): boolean {
  const cleanNumber = cardNumber.replace(/\D/g, '');

  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    return false;
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i], 10);

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
 * Validates date format (YYYY-MM-DD)
 * @param dateString Date string
 * @returns True if valid
 */
export function validateDateFormat(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validates that date is in the future
 * @param dateString Date string (YYYY-MM-DD)
 * @returns True if date is in future
 */
export function validateFutureDate(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  return date > now;
}

/**
 * Validates that date is in the past
 * @param dateString Date string (YYYY-MM-DD)
 * @returns True if date is in past
 */
export function validatePastDate(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  return date < now;
}

/**
 * Validates username format
 * Username must be 3-20 characters, alphanumeric and underscore only
 * @param username Username
 * @returns True if valid
 */
export function validateUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Validates slug format (lowercase alphanumeric and hyphens)
 * @param slug Slug
 * @returns True if valid
 */
export function validateSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Validates that string contains uppercase letter
 * @param value String value
 * @returns True if contains uppercase
 */
export function hasUppercase(value: string): boolean {
  return /[A-Z]/.test(value);
}

/**
 * Validates that string contains lowercase letter
 * @param value String value
 * @returns True if contains lowercase
 */
export function hasLowercase(value: string): boolean {
  return /[a-z]/.test(value);
}

/**
 * Validates that string contains number
 * @param value String value
 * @returns True if contains number
 */
export function hasNumber(value: string): boolean {
  return /[0-9]/.test(value);
}

/**
 * Validates that string contains special character
 * @param value String value
 * @returns True if contains special character
 */
export function hasSpecialChar(value: string): boolean {
  return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
}

/**
 * Validates that two values match (for password confirmation, etc.)
 * @param value1 First value
 * @param value2 Second value
 * @returns True if values match
 */
export function validateMatch(value1: any, value2: any): boolean {
  return value1 === value2;
}

/**
 * Create a custom validator
 * @param predicate Function that returns true if valid
 * @param errorMessage Error message if invalid
 * @returns Validation function
 */
export function createValidator(
  predicate: (value: any) => boolean,
  errorMessage: string
): (value: any) => string | null {
  return (value: any) => {
    return predicate(value) ? null : errorMessage;
  };
}

/**
 * Chain multiple validators
 * @param value Value to validate
 * @param validators Array of validator functions
 * @returns First error message or null
 */
export function validateWith(
  value: any,
  validators: ((value: any) => string | null)[]
): string | null {
  for (const validator of validators) {
    const error = validator(value);
    if (error) {
      return error;
    }
  }
  return null;
}
