/**
 * String Utilities - TDD Test Suite
 * Zero Dependencies | Strict TypeScript | Comprehensive Coverage
 */

import { test } from '../../test-framework';
import {
  // Case transformations
  capitalize,
  camelCase,
  kebabCase,
  snakeCase,
  pascalCase,
  // Text manipulation
  truncate,
  slugify,
  stripHtml,
  escapeHtml,
  unescapeHtml,
  // String analysis
  wordCount,
  characterCount,
  // Padding/spacing
  padStart,
  padEnd,
  // String testing
  isEmpty,
  isEmail,
  isUrl,
  startsWith,
  endsWith,
  includes,
  // Repetition
  repeat,
  reverse
} from './string';

// ============================================================================
// Case Transformations - 15 tests
// ============================================================================

test.describe('Case Transformations', () => {
  // capitalize - 3 tests
  test.it('capitalize: should capitalize empty string', () => {
    test.expect(capitalize('')).toBe('');
  });

  test.it('capitalize: should capitalize single word', () => {
    test.expect(capitalize('hello')).toBe('Hello');
    test.expect(capitalize('HELLO')).toBe('HELLO');
    test.expect(capitalize('h')).toBe('H');
  });

  test.it('capitalize: should capitalize only first letter of multiple words', () => {
    test.expect(capitalize('hello world')).toBe('Hello world');
    test.expect(capitalize('hello WORLD')).toBe('Hello WORLD');
  });

  // camelCase - 3 tests
  test.it('camelCase: should convert to camelCase from various formats', () => {
    test.expect(camelCase('hello world')).toBe('helloWorld');
    test.expect(camelCase('hello-world')).toBe('helloWorld');
    test.expect(camelCase('hello_world')).toBe('helloWorld');
    test.expect(camelCase('Hello World')).toBe('helloWorld');
  });

  test.it('camelCase: should handle edge cases', () => {
    test.expect(camelCase('')).toBe('');
    test.expect(camelCase('a')).toBe('a');
    test.expect(camelCase('A')).toBe('a');
  });

  test.it('camelCase: should handle special characters', () => {
    test.expect(camelCase('hello!world')).toBe('helloWorld');
    test.expect(camelCase('hello  world')).toBe('helloWorld');
    test.expect(camelCase('hello123world')).toBe('hello123world');
  });

  // kebabCase - 3 tests
  test.it('kebabCase: should convert to kebab-case from various formats', () => {
    test.expect(kebabCase('hello world')).toBe('hello-world');
    test.expect(kebabCase('helloWorld')).toBe('hello-world');
    test.expect(kebabCase('hello_world')).toBe('hello-world');
    test.expect(kebabCase('Hello World')).toBe('hello-world');
  });

  test.it('kebabCase: should handle edge cases', () => {
    test.expect(kebabCase('')).toBe('');
    test.expect(kebabCase('a')).toBe('a');
    test.expect(kebabCase('A')).toBe('a');
  });

  test.it('kebabCase: should handle special characters', () => {
    test.expect(kebabCase('hello!world')).toBe('hello-world');
    test.expect(kebabCase('hello  world')).toBe('hello-world');
  });

  // snakeCase - 3 tests
  test.it('snakeCase: should convert to snake_case from various formats', () => {
    test.expect(snakeCase('hello world')).toBe('hello_world');
    test.expect(snakeCase('helloWorld')).toBe('hello_world');
    test.expect(snakeCase('hello-world')).toBe('hello_world');
    test.expect(snakeCase('Hello World')).toBe('hello_world');
  });

  test.it('snakeCase: should handle edge cases', () => {
    test.expect(snakeCase('')).toBe('');
    test.expect(snakeCase('a')).toBe('a');
    test.expect(snakeCase('A')).toBe('a');
  });

  test.it('snakeCase: should handle special characters', () => {
    test.expect(snakeCase('hello!world')).toBe('hello_world');
    test.expect(snakeCase('hello  world')).toBe('hello_world');
  });

  // pascalCase - 3 tests
  test.it('pascalCase: should convert to PascalCase from various formats', () => {
    test.expect(pascalCase('hello world')).toBe('HelloWorld');
    test.expect(pascalCase('hello-world')).toBe('HelloWorld');
    test.expect(pascalCase('hello_world')).toBe('HelloWorld');
    test.expect(pascalCase('helloWorld')).toBe('HelloWorld');
  });

  test.it('pascalCase: should handle edge cases', () => {
    test.expect(pascalCase('')).toBe('');
    test.expect(pascalCase('a')).toBe('A');
    test.expect(pascalCase('A')).toBe('A');
  });

  test.it('pascalCase: should handle special characters', () => {
    test.expect(pascalCase('hello!world')).toBe('HelloWorld');
    test.expect(pascalCase('hello  world')).toBe('HelloWorld');
  });
});

// ============================================================================
// Text Manipulation - 12 tests
// ============================================================================

test.describe('Text Manipulation', () => {
  // truncate - 4 tests
  test.it('truncate: should truncate string to max length', () => {
    test.expect(truncate('hello world', 5)).toBe('hello...');
    test.expect(truncate('hello', 5)).toBe('hello');
    test.expect(truncate('hello', 10)).toBe('hello');
  });

  test.it('truncate: should use custom suffix', () => {
    test.expect(truncate('hello world', 5, '…')).toBe('hello…');
    test.expect(truncate('hello world', 5, ' [more]')).toBe('hello [more]');
  });

  test.it('truncate: should handle edge cases', () => {
    test.expect(truncate('', 5)).toBe('');
    test.expect(truncate('hello', 0)).toBe('...');
    test.expect(truncate('h', 1)).toBe('h');
  });

  test.it('truncate: should handle suffix longer than maxLength', () => {
    test.expect(truncate('hello world', 2, '...')).toBe('...');
  });

  // slugify - 3 tests
  test.it('slugify: should convert to URL-friendly slug', () => {
    test.expect(slugify('Hello World')).toBe('hello-world');
    test.expect(slugify('Hello World!')).toBe('hello-world');
    test.expect(slugify('  Hello   World  ')).toBe('hello-world');
  });

  test.it('slugify: should handle special characters', () => {
    test.expect(slugify('Hello@World#123')).toBe('hello-world-123');
    test.expect(slugify('café')).toBe('cafe');
    test.expect(slugify('Hello & World')).toBe('hello-and-world');
  });

  test.it('slugify: should handle edge cases', () => {
    test.expect(slugify('')).toBe('');
    test.expect(slugify('!!!')).toBe('');
    test.expect(slugify('a')).toBe('a');
  });

  // stripHtml - 2 tests
  test.it('stripHtml: should remove HTML tags', () => {
    test.expect(stripHtml('<p>Hi</p>')).toBe('Hi');
    test.expect(stripHtml('<div><span>Hello</span> World</div>')).toBe('Hello World');
    test.expect(stripHtml('<a href="#">Link</a>')).toBe('Link');
  });

  test.it('stripHtml: should handle edge cases', () => {
    test.expect(stripHtml('')).toBe('');
    test.expect(stripHtml('No tags')).toBe('No tags');
    test.expect(stripHtml('<>')).toBe('');
  });

  // escapeHtml - 1 test
  test.it('escapeHtml: should escape all HTML special characters', () => {
    test.expect(escapeHtml('<')).toBe('&lt;');
    test.expect(escapeHtml('>')).toBe('&gt;');
    test.expect(escapeHtml('&')).toBe('&amp;');
    test.expect(escapeHtml('"')).toBe('&quot;');
    test.expect(escapeHtml("'")).toBe('&#39;');
    test.expect(escapeHtml('<script>alert("xss")</script>'))
      .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  // unescapeHtml - 2 tests
  test.it('unescapeHtml: should unescape HTML entities', () => {
    test.expect(unescapeHtml('&lt;')).toBe('<');
    test.expect(unescapeHtml('&gt;')).toBe('>');
    test.expect(unescapeHtml('&amp;')).toBe('&');
    test.expect(unescapeHtml('&quot;')).toBe('"');
    test.expect(unescapeHtml('&#39;')).toBe("'");
  });

  test.it('unescapeHtml: should handle mixed content', () => {
    test.expect(unescapeHtml('&lt;p&gt;Hello&lt;/p&gt;')).toBe('<p>Hello</p>');
    test.expect(unescapeHtml('No entities')).toBe('No entities');
  });
});

// ============================================================================
// String Analysis - 5 tests
// ============================================================================

test.describe('String Analysis', () => {
  // wordCount - 3 tests
  test.it('wordCount: should count words correctly', () => {
    test.expect(wordCount('hello world')).toBe(2);
    test.expect(wordCount('hello')).toBe(1);
    test.expect(wordCount('')).toBe(0);
  });

  test.it('wordCount: should handle multiple spaces', () => {
    test.expect(wordCount('hello  world')).toBe(2);
    test.expect(wordCount('  hello   world  ')).toBe(2);
  });

  test.it('wordCount: should handle special characters', () => {
    test.expect(wordCount('hello, world!')).toBe(2);
    test.expect(wordCount('hello-world')).toBe(1);
  });

  // characterCount - 2 tests
  test.it('characterCount: should count characters with spaces', () => {
    test.expect(characterCount('hello')).toBe(5);
    test.expect(characterCount('hello world')).toBe(11);
    test.expect(characterCount('')).toBe(0);
  });

  test.it('characterCount: should exclude spaces when requested', () => {
    test.expect(characterCount('hello world', true)).toBe(10);
    test.expect(characterCount('hello  world', true)).toBe(10);
    test.expect(characterCount('   ', true)).toBe(0);
  });
});

// ============================================================================
// Padding/Spacing - 2 tests
// ============================================================================

test.describe('Padding and Spacing', () => {
  test.it('padStart: should pad string at start', () => {
    test.expect(padStart('5', 3, '0')).toBe('005');
    test.expect(padStart('hello', 10, ' ')).toBe('     hello');
    test.expect(padStart('hello', 10)).toBe('     hello');
    test.expect(padStart('hello', 3)).toBe('hello');
  });

  test.it('padEnd: should pad string at end', () => {
    test.expect(padEnd('5', 3, '0')).toBe('500');
    test.expect(padEnd('hello', 10, ' ')).toBe('hello     ');
    test.expect(padEnd('hello', 10)).toBe('hello     ');
    test.expect(padEnd('hello', 3)).toBe('hello');
  });
});

// ============================================================================
// String Testing - 7 tests
// ============================================================================

test.describe('String Testing Functions', () => {
  // isEmpty - 1 test
  test.it('isEmpty: should detect empty strings', () => {
    test.expect(isEmpty('')).toBe(true);
    test.expect(isEmpty('   ')).toBe(true);
    test.expect(isEmpty('hello')).toBe(false);
    test.expect(isEmpty(' hello ')).toBe(false);
  });

  // isEmail - 2 tests
  test.it('isEmail: should validate basic email patterns', () => {
    test.expect(isEmail('test@example.com')).toBe(true);
    test.expect(isEmail('user.name@example.co.uk')).toBe(true);
    test.expect(isEmail('user+tag@example.com')).toBe(true);
  });

  test.it('isEmail: should reject invalid email patterns', () => {
    test.expect(isEmail('invalid')).toBe(false);
    test.expect(isEmail('invalid@')).toBe(false);
    test.expect(isEmail('@example.com')).toBe(false);
    test.expect(isEmail('')).toBe(false);
  });

  // isUrl - 2 tests
  test.it('isUrl: should validate basic URL patterns', () => {
    test.expect(isUrl('https://example.com')).toBe(true);
    test.expect(isUrl('http://example.com')).toBe(true);
    test.expect(isUrl('https://example.com/path')).toBe(true);
    test.expect(isUrl('https://example.com/path?query=value')).toBe(true);
  });

  test.it('isUrl: should reject invalid URL patterns', () => {
    test.expect(isUrl('example.com')).toBe(false);
    test.expect(isUrl('ftp://example.com')).toBe(false);
    test.expect(isUrl('')).toBe(false);
    test.expect(isUrl('not-a-url')).toBe(false);
  });

  // startsWith, endsWith, includes - 2 tests
  test.it('startsWith/endsWith/includes: should check string patterns', () => {
    test.expect(startsWith('hello world', 'hello')).toBe(true);
    test.expect(startsWith('hello world', 'world')).toBe(false);
    test.expect(endsWith('hello world', 'world')).toBe(true);
    test.expect(endsWith('hello world', 'hello')).toBe(false);
    test.expect(includes('hello world', 'lo wo')).toBe(true);
  });

  test.it('startsWith/endsWith/includes: should handle position parameters', () => {
    test.expect(startsWith('hello world', 'world', 6)).toBe(true);
    test.expect(endsWith('hello world', 'hello', 5)).toBe(true);
    test.expect(includes('hello world', 'world', 6)).toBe(true);
    test.expect(includes('hello world', 'hello', 6)).toBe(false);
  });
});

// ============================================================================
// Repetition and Reversal - 4 tests
// ============================================================================

test.describe('Repetition and Reversal', () => {
  // repeat - 2 tests
  test.it('repeat: should repeat string n times', () => {
    test.expect(repeat('ab', 3)).toBe('ababab');
    test.expect(repeat('x', 5)).toBe('xxxxx');
    test.expect(repeat('hello', 1)).toBe('hello');
  });

  test.it('repeat: should handle edge cases', () => {
    test.expect(repeat('ab', 0)).toBe('');
    test.expect(repeat('', 5)).toBe('');
    test.expect(repeat('a', -1)).toBe('');
  });

  // reverse - 2 tests
  test.it('reverse: should reverse string', () => {
    test.expect(reverse('hello')).toBe('olleh');
    test.expect(reverse('ab')).toBe('ba');
    test.expect(reverse('a')).toBe('a');
  });

  test.it('reverse: should handle edge cases', () => {
    test.expect(reverse('')).toBe('');
    test.expect(reverse('racecar')).toBe('racecar');
    test.expect(reverse('Hello World!')).toBe('!dlroW olleH');
  });
});
