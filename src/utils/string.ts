/**
 * String utilities - NO external dependencies
 * Pure TypeScript string manipulation functions
 */

/**
 * Converts first character to uppercase
 * @param str String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts string to camelCase
 * @param str String to convert
 * @returns camelCase string
 */
export function camelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/^[A-Z]/, (char) => char.toLowerCase());
}

/**
 * Converts string to PascalCase
 * @param str String to convert
 * @returns PascalCase string
 */
export function pascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/^[a-z]/, (char) => char.toUpperCase());
}

/**
 * Converts string to kebab-case
 * @param str String to convert
 * @returns kebab-case string
 */
export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase()
    .replace(/^-|-$/g, '');
}

/**
 * Converts string to snake_case
 * @param str String to convert
 * @returns snake_case string
 */
export function snakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .toLowerCase()
    .replace(/^_|_$/g, '');
}

/**
 * Converts string to CONSTANT_CASE
 * @param str String to convert
 * @returns CONSTANT_CASE string
 */
export function constantCase(str: string): string {
  return snakeCase(str).toUpperCase();
}

/**
 * Truncates string to specified length with ellipsis
 * @param str String to truncate
 * @param length Maximum length including ellipsis
 * @param suffix Suffix to add (default: '...')
 * @returns Truncated string
 */
export function truncate(str: string, length: number, suffix: string = '...'): string {
  if (str.length <= length) return str;
  return str.slice(0, length - suffix.length) + suffix;
}

/**
 * Repeats string specified number of times
 * @param str String to repeat
 * @param count Number of times to repeat
 * @returns Repeated string
 */
export function repeat(str: string, count: number): string {
  if (count < 0) throw new Error('Count must be non-negative');
  return str.repeat(count);
}

/**
 * Pads string to specified length on the left
 * @param str String to pad
 * @param length Target length
 * @param padChar Character to pad with (default: ' ')
 * @returns Padded string
 */
export function padLeft(str: string, length: number, padChar: string = ' '): string {
  if (padChar.length !== 1) throw new Error('padChar must be single character');
  return padChar.repeat(Math.max(0, length - str.length)) + str;
}

/**
 * Pads string to specified length on the right
 * @param str String to pad
 * @param length Target length
 * @param padChar Character to pad with (default: ' ')
 * @returns Padded string
 */
export function padRight(str: string, length: number, padChar: string = ' '): string {
  if (padChar.length !== 1) throw new Error('padChar must be single character');
  return str + padChar.repeat(Math.max(0, length - str.length));
}

/**
 * Removes whitespace from both ends
 * @param str String to trim
 * @returns Trimmed string
 */
export function trim(str: string): string {
  return str.trim();
}

/**
 * Removes whitespace from left
 * @param str String to trim
 * @returns Left-trimmed string
 */
export function trimLeft(str: string): string {
  return str.replace(/^\s+/, '');
}

/**
 * Removes whitespace from right
 * @param str String to trim
 * @returns Right-trimmed string
 */
export function trimRight(str: string): string {
  return str.replace(/\s+$/, '');
}

/**
 * Reverses a string
 * @param str String to reverse
 * @returns Reversed string
 */
export function reverse(str: string): string {
  return str.split('').reverse().join('');
}

/**
 * Checks if string starts with prefix
 * @param str String to check
 * @param prefix Prefix to look for
 * @returns True if starts with prefix
 */
export function startsWith(str: string, prefix: string): boolean {
  return str.startsWith(prefix);
}

/**
 * Checks if string ends with suffix
 * @param str String to check
 * @param suffix Suffix to look for
 * @returns True if ends with suffix
 */
export function endsWith(str: string, suffix: string): boolean {
  return str.endsWith(suffix);
}

/**
 * Checks if string includes substring
 * @param str String to check
 * @param substring Substring to look for
 * @returns True if includes substring
 */
export function includes(str: string, substring: string): boolean {
  return str.includes(substring);
}

/**
 * Finds index of substring
 * @param str String to search in
 * @param substring Substring to find
 * @returns Index or -1
 */
export function indexOf(str: string, substring: string): number {
  return str.indexOf(substring);
}

/**
 * Finds last index of substring
 * @param str String to search in
 * @param substring Substring to find
 * @returns Last index or -1
 */
export function lastIndexOf(str: string, substring: string): number {
  return str.lastIndexOf(substring);
}

/**
 * Splits string by delimiter
 * @param str String to split
 * @param delimiter Delimiter to split by
 * @param limit Maximum number of splits
 * @returns Array of strings
 */
export function split(str: string, delimiter: string | RegExp, limit?: number): string[] {
  return str.split(delimiter, limit);
}

/**
 * Joins array of strings with separator
 * @param arr Array to join
 * @param separator Separator between items
 * @returns Joined string
 */
export function join(arr: string[], separator: string = ''): string {
  return arr.join(separator);
}

/**
 * Replaces first occurrence of substring
 * @param str String to search in
 * @param search Substring to find
 * @param replace Replacement string
 * @returns Modified string
 */
export function replaceFirst(str: string, search: string, replace: string): string {
  const index = str.indexOf(search);
  if (index === -1) return str;
  return str.slice(0, index) + replace + str.slice(index + search.length);
}

/**
 * Replaces last occurrence of substring
 * @param str String to search in
 * @param search Substring to find
 * @param replace Replacement string
 * @returns Modified string
 */
export function replaceLast(str: string, search: string, replace: string): string {
  const index = str.lastIndexOf(search);
  if (index === -1) return str;
  return str.slice(0, index) + replace + str.slice(index + search.length);
}

/**
 * Replaces all occurrences of substring
 * @param str String to search in
 * @param search Substring to find
 * @param replace Replacement string
 * @returns Modified string
 */
export function replaceAll(str: string, search: string, replace: string): string {
  return str.split(search).join(replace);
}

/**
 * Extracts substring between two strings
 * @param str String to search in
 * @param start Start delimiter
 * @param end End delimiter
 * @returns Extracted substring or empty string
 */
export function between(str: string, start: string, end: string): string {
  const startIndex = str.indexOf(start);
  if (startIndex === -1) return '';

  const contentStart = startIndex + start.length;
  const endIndex = str.indexOf(end, contentStart);
  if (endIndex === -1) return '';

  return str.slice(contentStart, endIndex);
}

/**
 * Counts occurrences of substring
 * @param str String to search in
 * @param substring Substring to count
 * @returns Number of occurrences
 */
export function countOccurrences(str: string, substring: string): number {
  if (substring.length === 0) return 0;
  return str.split(substring).length - 1;
}

/**
 * Checks if string is empty or whitespace only
 * @param str String to check
 * @returns True if empty or whitespace
 */
export function isEmpty(str: string): boolean {
  return str.trim().length === 0;
}

/**
 * Checks if string is not empty or whitespace
 * @param str String to check
 * @returns True if not empty or whitespace
 */
export function isNotEmpty(str: string): boolean {
  return str.trim().length > 0;
}

/**
 * Escapes HTML special characters
 * @param str String to escape
 * @returns Escaped string safe for HTML
 */
export function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Unescapes HTML special characters
 * @param str String to unescape
 * @returns Unescaped string
 */
export function unescapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
  };
  return str.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, (match) => map[match]);
}

/**
 * Slugifies a string (for URLs)
 * @param str String to slugify
 * @returns URL-safe slug
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s]+/g, '-') // Replace spaces with hyphens
    .replace(/[-]+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Creates initials from a name
 * @param str Name string
 * @returns Initials in uppercase
 */
export function initials(str: string): string {
  return str
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

/**
 * Checks if string contains only digits
 * @param str String to check
 * @returns True if only digits
 */
export function isNumeric(str: string): boolean {
  return /^\d+$/.test(str);
}

/**
 * Checks if string contains only alphabetic characters
 * @param str String to check
 * @returns True if only letters
 */
export function isAlpha(str: string): boolean {
  return /^[a-zA-Z]+$/.test(str);
}

/**
 * Checks if string contains only alphanumeric characters
 * @param str String to check
 * @returns True if only alphanumeric
 */
export function isAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(str);
}

/**
 * Converts string to title case
 * @param str String to convert
 * @returns Title Case string
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/\s+/)
    .map((word) => capitalize(word))
    .join(' ');
}
