/**
 * Example test file - demonstrates the custom test runner
 */

import {
  describe,
  test,
  assertEquals,
  assertTrue,
  assertFalse,
  assertArrayEquals,
  assertThrows,
} from './index.js';

describe('Basic Assertions', () => {
  test('assertEquals works with primitives', () => {
    assertEquals(5, 5);
    assertEquals('hello', 'hello');
    assertEquals(true, true);
  });

  test('assertEquals fails with different values', () => {
    assertThrows(
      () => assertEquals(5, 6),
      'Expected 6'
    );
  });

  test('assertTrue works', () => {
    assertTrue(true);
    assertTrue(1 + 1 === 2);
  });

  test('assertFalse works', () => {
    assertFalse(false);
    assertFalse(1 + 1 === 3);
  });

  test('assertArrayEquals works', () => {
    assertArrayEquals([1, 2, 3], [1, 2, 3]);
    assertArrayEquals(['a', 'b'], ['a', 'b']);
  });

  test('assertArrayEquals fails with different arrays', () => {
    assertThrows(
      () => assertArrayEquals([1, 2], [1, 3]),
      'Array mismatch'
    );
  });

  test('assertThrows works', () => {
    assertThrows(() => {
      throw new Error('test error');
    });
  });

  test('assertThrows checks error message', () => {
    assertThrows(
      () => {
        throw new Error('specific error');
      },
      'specific'
    );
  });
});

describe('Object and Array Operations', () => {
  test('can test array operations', () => {
    const arr = [1, 2, 3, 4, 5];
    const doubled = arr.map((x) => x * 2);
    assertArrayEquals(doubled, [2, 4, 6, 8, 10]);
  });

  test('can test string operations', () => {
    const str = 'hello world';
    assertTrue(str.includes('world'));
    assertEquals(str.length, 11);
  });

  test('can test object operations', () => {
    const obj = { a: 1, b: 2 };
    assertEquals(obj.a, 1);
    assertEquals(obj.b, 2);
  });
});

describe('Error Handling', () => {
  test('catches synchronous errors', () => {
    assertThrows(() => {
      throw new Error('sync error');
    });
  });

  test('error message can be custom', () => {
    assertThrows(
      () => {
        throw new Error('test');
      },
      'test',
      'Custom error message'
    );
  });
});

describe('Conditional Tests', () => {
  test('basic math operations', () => {
    assertEquals(2 + 2, 4);
    assertEquals(10 - 5, 5);
    assertEquals(3 * 4, 12);
    assertEquals(20 / 4, 5);
  });

  test('can check boolean logic', () => {
    assertTrue(true && true);
    assertTrue(true || false);
    assertFalse(true && false);
  });
});
