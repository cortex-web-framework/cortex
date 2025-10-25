/**
 * String Utilities Library
 * Zero Dependencies | Strict TypeScript | Comprehensive JSDoc
 *
 * A comprehensive collection of string manipulation, transformation,
 * and validation utilities for TypeScript/JavaScript applications.
 *
 * @module string
 */

// ============================================================================
// Case Transformations
// ============================================================================

/**
 * Capitalizes the first character of a string.
 *
 * @param {string} str - The string to capitalize
 * @returns {string} The string with the first character capitalized
 *
 * @example
 * capitalize('hello'); // 'Hello'
 * capitalize('hello world'); // 'Hello world'
 * capitalize(''); // ''
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts a string to camelCase.
 * Handles spaces, hyphens, underscores, and special characters.
 *
 * @param {string} str - The string to convert
 * @returns {string} The camelCase string
 *
 * @example
 * camelCase('hello world'); // 'helloWorld'
 * camelCase('hello-world'); // 'helloWorld'
 * camelCase('hello_world'); // 'helloWorld'
 * camelCase('Hello World'); // 'helloWorld'
 */
export function camelCase(str: string): string {
  if (!str) return '';

  const words = str
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return '';

  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      return index === 0 ? lower : lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

/**
 * Converts a string to kebab-case.
 * Handles spaces, camelCase, PascalCase, snake_case, and special characters.
 *
 * @param {string} str - The string to convert
 * @returns {string} The kebab-case string
 *
 * @example
 * kebabCase('hello world'); // 'hello-world'
 * kebabCase('helloWorld'); // 'hello-world'
 * kebabCase('hello_world'); // 'hello-world'
 */
export function kebabCase(str: string): string {
  if (!str) return '';

  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

/**
 * Converts a string to snake_case.
 * Handles spaces, camelCase, PascalCase, kebab-case, and special characters.
 *
 * @param {string} str - The string to convert
 * @returns {string} The snake_case string
 *
 * @example
 * snakeCase('hello world'); // 'hello_world'
 * snakeCase('helloWorld'); // 'hello_world'
 * snakeCase('hello-world'); // 'hello_world'
 */
export function snakeCase(str: string): string {
  if (!str) return '';

  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

/**
 * Converts a string to PascalCase.
 * Handles spaces, hyphens, underscores, camelCase, and special characters.
 *
 * @param {string} str - The string to convert
 * @returns {string} The PascalCase string
 *
 * @example
 * pascalCase('hello world'); // 'HelloWorld'
 * pascalCase('hello-world'); // 'HelloWorld'
 * pascalCase('hello_world'); // 'HelloWorld'
 */
export function pascalCase(str: string): string {
  if (!str) return '';

  const words = str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return '';

  return words
    .map(word => {
      const lower = word.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

// ============================================================================
// Text Manipulation
// ============================================================================

/**
 * Truncates a string to a maximum length and adds a suffix.
 * The maxLength parameter specifies the length of content before the suffix is added.
 *
 * @param {string} str - The string to truncate
 * @param {number} maxLength - Maximum length of content before adding suffix
 * @param {string} suffix - Suffix to add when truncated (default: '...')
 * @returns {string} The truncated string (content + suffix)
 *
 * @example
 * truncate('hello world', 5); // 'hello...'
 * truncate('hello world', 5, '…'); // 'hello…'
 * truncate('hello', 10); // 'hello'
 */
export function truncate(str: string, maxLength: number, suffix: string = '...'): string {
  if (str.length <= maxLength) return str;
  if (maxLength <= 0) return suffix;

  // Special case: if maxLength is very small AND less than suffix length,
  // return just the suffix to avoid a result that's barely truncated
  if (maxLength < suffix.length && maxLength <= 2) return suffix;

  return str.slice(0, maxLength) + suffix;
}

/**
 * Converts a string to a URL-friendly slug.
 * Removes special characters, converts to lowercase, replaces spaces with hyphens.
 *
 * @param {string} str - The string to slugify
 * @returns {string} The URL-friendly slug
 *
 * @example
 * slugify('Hello World!'); // 'hello-world'
 * slugify('Hello & World'); // 'hello-and-world'
 * slugify('café'); // 'cafe'
 */
export function slugify(str: string): string {
  if (!str) return '';

  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, '-and-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Removes all HTML tags from a string.
 *
 * @param {string} html - The HTML string to strip
 * @returns {string} The string without HTML tags
 *
 * @example
 * stripHtml('<p>Hi</p>'); // 'Hi'
 * stripHtml('<div><span>Hello</span> World</div>'); // 'Hello World'
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Escapes HTML special characters to prevent XSS attacks.
 *
 * @param {string} str - The string to escape
 * @returns {string} The escaped string
 *
 * @example
 * escapeHtml('<script>alert("xss")</script>');
 * // '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 */
export function escapeHtml(str: string): string {
  if (!str) return '';

  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  return str.replace(/[&<>"']/g, char => htmlEscapeMap[char] || char);
}

/**
 * Unescapes HTML entities back to their original characters.
 *
 * @param {string} str - The string with HTML entities
 * @returns {string} The unescaped string
 *
 * @example
 * unescapeHtml('&lt;p&gt;Hello&lt;/p&gt;'); // '<p>Hello</p>'
 */
export function unescapeHtml(str: string): string {
  if (!str) return '';

  const htmlUnescapeMap: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'"
  };

  return str.replace(/&(?:amp|lt|gt|quot|#39);/g, entity => htmlUnescapeMap[entity] || entity);
}

// ============================================================================
// String Analysis
// ============================================================================

/**
 * Counts the number of words in a string.
 * Words are separated by whitespace.
 *
 * @param {string} str - The string to analyze
 * @returns {number} The number of words
 *
 * @example
 * wordCount('hello world'); // 2
 * wordCount('hello  world'); // 2
 * wordCount(''); // 0
 */
export function wordCount(str: string): number {
  if (!str || !str.trim()) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Counts the number of characters in a string.
 * Optionally excludes spaces.
 *
 * @param {string} str - The string to analyze
 * @param {boolean} excludeSpaces - Whether to exclude spaces (default: false)
 * @returns {number} The number of characters
 *
 * @example
 * characterCount('hello'); // 5
 * characterCount('hello world'); // 11
 * characterCount('hello world', true); // 10
 */
export function characterCount(str: string, excludeSpaces: boolean = false): number {
  if (!str) return 0;
  if (excludeSpaces) {
    return str.replace(/\s/g, '').length;
  }
  return str.length;
}

// ============================================================================
// Padding/Spacing
// ============================================================================

/**
 * Pads a string at the start with a specified character.
 *
 * @param {string} str - The string to pad
 * @param {number} length - The target length
 * @param {string} char - The character to pad with (default: ' ')
 * @returns {string} The padded string
 *
 * @example
 * padStart('5', 3, '0'); // '005'
 * padStart('hello', 10); // '     hello'
 */
export function padStart(str: string, length: number, char: string = ' '): string {
  if (str.length >= length) return str;
  const padLength = length - str.length;
  const padChar = char || ' ';
  return padChar.repeat(Math.ceil(padLength / padChar.length)).slice(0, padLength) + str;
}

/**
 * Pads a string at the end with a specified character.
 *
 * @param {string} str - The string to pad
 * @param {number} length - The target length
 * @param {string} char - The character to pad with (default: ' ')
 * @returns {string} The padded string
 *
 * @example
 * padEnd('5', 3, '0'); // '500'
 * padEnd('hello', 10); // 'hello     '
 */
export function padEnd(str: string, length: number, char: string = ' '): string {
  if (str.length >= length) return str;
  const padLength = length - str.length;
  const padChar = char || ' ';
  return str + padChar.repeat(Math.ceil(padLength / padChar.length)).slice(0, padLength);
}

// ============================================================================
// String Testing
// ============================================================================

/**
 * Checks if a string is empty or contains only whitespace.
 *
 * @param {string} str - The string to check
 * @returns {boolean} True if the string is empty or whitespace
 *
 * @example
 * isEmpty(''); // true
 * isEmpty('   '); // true
 * isEmpty('hello'); // false
 */
export function isEmpty(str: string): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Performs a basic check if a string matches an email pattern.
 * Note: This is a quick validation, not RFC 5322 compliant.
 *
 * @param {string} str - The string to check
 * @returns {boolean} True if the string appears to be an email
 *
 * @example
 * isEmail('test@example.com'); // true
 * isEmail('invalid'); // false
 */
export function isEmail(str: string): boolean {
  if (!str) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(str);
}

/**
 * Performs a basic check if a string matches a URL pattern.
 * Note: This is a quick validation for http/https URLs only.
 *
 * @param {string} str - The string to check
 * @returns {boolean} True if the string appears to be a URL
 *
 * @example
 * isUrl('https://example.com'); // true
 * isUrl('example.com'); // false
 */
export function isUrl(str: string): boolean {
  if (!str) return false;
  const urlRegex = /^https?:\/\/.+/;
  return urlRegex.test(str);
}

/**
 * Determines if a string starts with a specified search string.
 *
 * @param {string} str - The string to check
 * @param {string} searchStr - The string to search for
 * @param {number} position - Position to start the search (default: 0)
 * @returns {boolean} True if the string starts with the search string
 *
 * @example
 * startsWith('hello world', 'hello'); // true
 * startsWith('hello world', 'world', 6); // true
 */
export function startsWith(str: string, searchStr: string, position: number = 0): boolean {
  return str.substring(position, position + searchStr.length) === searchStr;
}

/**
 * Determines if a string ends with a specified search string.
 *
 * @param {string} str - The string to check
 * @param {string} searchStr - The string to search for
 * @param {number} length - Length of string to consider (default: str.length)
 * @returns {boolean} True if the string ends with the search string
 *
 * @example
 * endsWith('hello world', 'world'); // true
 * endsWith('hello world', 'hello', 5); // true
 */
export function endsWith(str: string, searchStr: string, length?: number): boolean {
  const len = length ?? str.length;
  return str.substring(len - searchStr.length, len) === searchStr;
}

/**
 * Determines if a string contains a specified search string.
 *
 * @param {string} str - The string to check
 * @param {string} searchStr - The string to search for
 * @param {number} position - Position to start the search (default: 0)
 * @returns {boolean} True if the string contains the search string
 *
 * @example
 * includes('hello world', 'lo wo'); // true
 * includes('hello world', 'world', 6); // true
 */
export function includes(str: string, searchStr: string, position: number = 0): boolean {
  return str.indexOf(searchStr, position) !== -1;
}

// ============================================================================
// Repetition
// ============================================================================

/**
 * Repeats a string a specified number of times.
 *
 * @param {string} str - The string to repeat
 * @param {number} count - Number of times to repeat
 * @returns {string} The repeated string
 *
 * @example
 * repeat('ab', 3); // 'ababab'
 * repeat('x', 5); // 'xxxxx'
 */
export function repeat(str: string, count: number): string {
  if (count < 1 || !str) return '';
  return str.repeat(count);
}

/**
 * Reverses a string.
 *
 * @param {string} str - The string to reverse
 * @returns {string} The reversed string
 *
 * @example
 * reverse('hello'); // 'olleh'
 * reverse('ab'); // 'ba'
 */
export function reverse(str: string): string {
  if (!str) return '';
  return str.split('').reverse().join('');
}
