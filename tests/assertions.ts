/**
 * Simple, dependency-free assertion library for testing.
 * No external packages - pure TypeScript.
 */

export type AssertionResult = {
  passed: boolean;
  message: string;
};

/**
 * Compares two values for equality
 * @param actual The actual value
 * @param expected The expected value
 * @param message Optional custom message
 * @throws {AssertionError} If values don't match
 */
export function assertEquals<T>(
  actual: T,
  expected: T,
  message?: string
): void {
  if (!deepEqual(actual, expected)) {
    const customMsg = message ? `\n  ${message}` : '';
    throw new AssertionError(
      `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}${customMsg}`
    );
  }
}

/**
 * Asserts that a condition is true
 * @param condition The condition to check
 * @param message Optional custom message
 * @throws {AssertionError} If condition is false
 */
export function assertTrue(condition: boolean, message?: string): void {
  if (!condition) {
    const customMsg = message ? `\n  ${message}` : '';
    throw new AssertionError(`Expected true, but got false${customMsg}`);
  }
}

/**
 * Asserts that a condition is false
 * @param condition The condition to check
 * @param message Optional custom message
 * @throws {AssertionError} If condition is true
 */
export function assertFalse(condition: boolean, message?: string): void {
  if (condition) {
    const customMsg = message ? `\n  ${message}` : '';
    throw new AssertionError(`Expected false, but got true${customMsg}`);
  }
}

/**
 * Asserts that a value is null or undefined
 * @param value The value to check
 * @param message Optional custom message
 * @throws {AssertionError} If value is not null/undefined
 */
export function assertNull(value: any, message?: string): void {
  if (value !== null && value !== undefined) {
    const customMsg = message ? `\n  ${message}` : '';
    throw new AssertionError(
      `Expected null/undefined, but got ${JSON.stringify(value)}${customMsg}`
    );
  }
}

/**
 * Asserts that a value is not null or undefined
 * @param value The value to check
 * @param message Optional custom message
 * @throws {AssertionError} If value is null/undefined
 */
export function assertNotNull<T>(value: T | null | undefined, message?: string): asserts value is T {
  if (value === null || value === undefined) {
    const customMsg = message ? `\n  ${message}` : '';
    throw new AssertionError(`Expected non-null value${customMsg}`);
  }
}

/**
 * Asserts that a function throws an error
 * @param fn The function to execute
 * @param expectedMessage Optional expected error message substring
 * @param message Optional custom message
 * @throws {AssertionError} If function doesn't throw
 */
export function assertThrows(
  fn: () => void,
  expectedMessage?: string,
  message?: string
): void {
  let threw = false;
  let error: Error | null = null;

  try {
    fn();
  } catch (e) {
    threw = true;
    error = e as Error;
  }

  if (!threw) {
    const customMsg = message ? `\n  ${message}` : '';
    throw new AssertionError(`Expected function to throw an error${customMsg}`);
  }

  if (expectedMessage && error && !error.message.includes(expectedMessage)) {
    const customMsg = message ? `\n  ${message}` : '';
    throw new AssertionError(
      `Expected error message to include "${expectedMessage}", but got "${error.message}"${customMsg}`
    );
  }
}

/**
 * Asserts that two arrays are equal
 * @param actual The actual array
 * @param expected The expected array
 * @param message Optional custom message
 * @throws {AssertionError} If arrays don't match
 */
export function assertArrayEquals<T>(
  actual: T[],
  expected: T[],
  message?: string
): void {
  if (!Array.isArray(actual) || !Array.isArray(expected)) {
    const customMsg = message ? `\n  ${message}` : '';
    throw new AssertionError(`Expected arrays${customMsg}`);
  }

  if (actual.length !== expected.length) {
    const customMsg = message ? `\n  ${message}` : '';
    throw new AssertionError(
      `Expected array length ${expected.length}, but got ${actual.length}${customMsg}`
    );
  }

  for (let i = 0; i < actual.length; i++) {
    if (!deepEqual(actual[i], expected[i])) {
      const customMsg = message ? `\n  ${message}` : '';
      throw new AssertionError(
        `Array mismatch at index ${i}: expected ${JSON.stringify(
          expected[i]
        )}, got ${JSON.stringify(actual[i])}${customMsg}`
      );
    }
  }
}

/**
 * Asserts that an object contains specific properties
 * @param obj The object to check
 * @param expected The expected properties
 * @param message Optional custom message
 * @throws {AssertionError} If object doesn't contain properties
 */
export function assertObjectEquals(
  obj: any,
  expected: Record<string, any>,
  message?: string
): void {
  if (typeof obj !== 'object' || obj === null) {
    const customMsg = message ? `\n  ${message}` : '';
    throw new AssertionError(`Expected object${customMsg}`);
  }

  for (const [key, value] of Object.entries(expected)) {
    if (!(key in obj)) {
      const customMsg = message ? `\n  ${message}` : '';
      throw new AssertionError(`Expected property "${key}" not found${customMsg}`);
    }

    if (!deepEqual(obj[key], value)) {
      const customMsg = message ? `\n  ${message}` : '';
      throw new AssertionError(
        `Property "${key}": expected ${JSON.stringify(value)}, got ${JSON.stringify(
          obj[key]
        )}${customMsg}`
      );
    }
  }
}

/**
 * Asserts that a string includes a substring
 * @param actual The actual string
 * @param expected The expected substring
 * @param message Optional custom message
 * @throws {AssertionError} If substring not found
 */
export function assertStringIncludes(
  actual: string,
  expected: string,
  message?: string
): void {
  if (!actual.includes(expected)) {
    const customMsg = message ? `\n  ${message}` : '';
    throw new AssertionError(
      `Expected string to include "${expected}", but got "${actual}"${customMsg}`
    );
  }
}

/**
 * Asserts that a string matches a regular expression
 * @param actual The actual string
 * @param pattern The regex pattern
 * @param message Optional custom message
 * @throws {AssertionError} If pattern doesn't match
 */
export function assertStringMatches(
  actual: string,
  pattern: RegExp,
  message?: string
): void {
  if (!pattern.test(actual)) {
    const customMsg = message ? `\n  ${message}` : '';
    throw new AssertionError(
      `Expected string to match pattern ${pattern}, but got "${actual}"${customMsg}`
    );
  }
}

/**
 * Asserts that a value is of a specific type
 * @param value The value to check
 * @param expectedType The expected type
 * @param message Optional custom message
 * @throws {AssertionError} If type doesn't match
 */
export function assertType(
  value: any,
  expectedType: string,
  message?: string
): void {
  const actualType = typeof value;
  if (actualType !== expectedType) {
    const customMsg = message ? `\n  ${message}` : '';
    throw new AssertionError(
      `Expected type "${expectedType}", but got "${actualType}"${customMsg}`
    );
  }
}

/**
 * Custom assertion error class
 */
export class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AssertionError';
  }
}

/**
 * Deep equality check (handles objects, arrays, primitives)
 * @param a First value
 * @param b Second value
 * @returns True if values are deeply equal
 */
function deepEqual(a: any, b: any): boolean {
  // Check primitive equality
  if (a === b) {
    return true;
  }

  // Check types
  if (typeof a !== typeof b) {
    return false;
  }

  // Check null
  if (a === null || b === null) {
    return a === b;
  }

  // Check arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  // Check objects
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) {
      return false;
    }

    return keysA.every((key) => deepEqual(a[key], b[key]));
  }

  return false;
}
