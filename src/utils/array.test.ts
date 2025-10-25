/**
 * Array Utilities Test Suite
 * TDD approach with comprehensive coverage
 */

import { test } from '../../test-framework';
import {
  chunk,
  flatten,
  unique,
  compact,
  groupBy,
  sortBy,
  findIndex,
  findLastIndex,
  pluck,
  partition,
  uniq,
  without,
  intersection,
  difference,
  shuffle,
  sample,
  range,
  fill,
} from './array';

test.describe('Array Utilities - TDD Suite', () => {
  // ============================================
  // MANIPULATION TESTS (12 tests)
  // ============================================

  test.it('chunk: splits array into chunks of specified size', () => {
    const result = chunk([1, 2, 3, 4, 5], 2);
    test.expect(result).toEqual([[1, 2], [3, 4], [5]]);
  });

  test.it('chunk: handles empty array', () => {
    const result = chunk([], 2);
    test.expect(result).toEqual([]);
  });

  test.it('chunk: handles chunk size larger than array', () => {
    const result = chunk([1, 2], 5);
    test.expect(result).toEqual([[1, 2]]);
  });

  test.it('chunk: throws error for invalid chunk size', () => {
    test.expect(() => chunk([1, 2, 3], 0)).toThrow('positive');
  });

  test.it('flatten: flattens nested arrays', () => {
    const result = flatten([[1, 2], [3], [4, 5]]);
    test.expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  test.it('flatten: handles empty nested arrays', () => {
    const result = flatten([[], [1], [], [2, 3]]);
    test.expect(result).toEqual([1, 2, 3]);
  });

  test.it('unique: removes duplicate primitives', () => {
    const result = unique([1, 2, 2, 3, 1, 4]);
    test.expect(result).toEqual([1, 2, 3, 4]);
  });

  test.it('unique: removes duplicates by key function', () => {
    const arr = [
      { id: 1, name: 'a' },
      { id: 1, name: 'b' },
      { id: 2, name: 'c' }
    ];
    const result = unique(arr, (item) => item.id);
    test.expect(result.length).toBe(2);
    test.expect(result[0].id).toBe(1);
    test.expect(result[1].id).toBe(2);
  });

  test.it('compact: removes null and undefined values', () => {
    const result = compact([1, null, 2, undefined, 3, false, 0]);
    test.expect(result).toEqual([1, 2, 3, false, 0]);
  });

  test.it('compact: handles empty array', () => {
    const result = compact([]);
    test.expect(result).toEqual([]);
  });

  test.it('compact: handles array with only nulls', () => {
    const result = compact([null, undefined, null]);
    test.expect(result).toEqual([]);
  });

  test.it('unique: handles empty array', () => {
    const result = unique([]);
    test.expect(result).toEqual([]);
  });

  // ============================================
  // ANALYSIS TESTS (10 tests)
  // ============================================

  test.it('groupBy: groups by function key', () => {
    const users = [
      { name: 'Alice', role: 'admin' },
      { name: 'Bob', role: 'user' },
      { name: 'Charlie', role: 'admin' }
    ];
    const result = groupBy(users, (u) => u.role);
    test.expect(result.admin.length).toBe(2);
    test.expect(result.user.length).toBe(1);
  });

  test.it('groupBy: groups by property key', () => {
    const items = [
      { type: 'fruit', name: 'apple' },
      { type: 'vegetable', name: 'carrot' },
      { type: 'fruit', name: 'banana' }
    ];
    const result = groupBy(items, 'type');
    test.expect((result as any).fruit.length).toBe(2);
    test.expect((result as any).vegetable.length).toBe(1);
  });

  test.it('sortBy: sorts by function ascending', () => {
    const items = [{ age: 30 }, { age: 20 }, { age: 25 }];
    const result = sortBy(items, (item) => item.age);
    test.expect(result[0].age).toBe(20);
    test.expect(result[2].age).toBe(30);
  });

  test.it('sortBy: sorts by property descending', () => {
    const items = [{ id: 3 }, { id: 1 }, { id: 2 }];
    const result = sortBy(items, 'id', 'desc');
    test.expect(result[0].id).toBe(3);
    test.expect(result[2].id).toBe(1);
  });

  test.it('sortBy: handles string sorting', () => {
    const items = [{ name: 'charlie' }, { name: 'alice' }, { name: 'bob' }];
    const result = sortBy(items, 'name');
    test.expect(result[0].name).toBe('alice');
    test.expect(result[2].name).toBe('charlie');
  });

  test.it('findIndex: finds index of matching element', () => {
    const result = findIndex([1, 2, 3, 4], (item) => item === 3);
    test.expect(result).toBe(2);
  });

  test.it('findIndex: returns -1 when not found', () => {
    const result = findIndex([1, 2, 3], (item) => item === 5);
    test.expect(result).toBe(-1);
  });

  test.it('findIndex: receives index in predicate', () => {
    const result = findIndex([10, 20, 30], (item, index) => index === 1);
    test.expect(result).toBe(1);
  });

  test.it('findLastIndex: finds last matching index', () => {
    const result = findLastIndex([1, 2, 3, 2, 4], (item) => item === 2);
    test.expect(result).toBe(3);
  });

  test.it('findLastIndex: returns -1 when not found', () => {
    const result = findLastIndex([1, 2, 3], (item) => item === 5);
    test.expect(result).toBe(-1);
  });

  // ============================================
  // TRANSFORMATION TESTS (8 tests)
  // ============================================

  test.it('pluck: extracts property values', () => {
    const items = [
      { id: 1, name: 'apple' },
      { id: 2, name: 'banana' }
    ];
    const result = pluck(items, 'name');
    test.expect(result).toEqual(['apple', 'banana']);
  });

  test.it('pluck: handles empty array', () => {
    const result = pluck([], 'name');
    test.expect(result).toEqual([]);
  });

  test.it('partition: splits array by predicate', () => {
    const result = partition([1, 2, 3, 4, 5], (item) => item % 2 === 1);
    test.expect(result[0]).toEqual([1, 3, 5]);
    test.expect(result[1]).toEqual([2, 4]);
  });

  test.it('partition: handles all passing predicate', () => {
    const result = partition([2, 4, 6], (item) => item % 2 === 0);
    test.expect(result[0]).toEqual([2, 4, 6]);
    test.expect(result[1]).toEqual([]);
  });

  test.it('uniq: removes duplicates (alias for unique)', () => {
    const result = uniq([1, 2, 2, 3, 3, 3]);
    test.expect(result).toEqual([1, 2, 3]);
  });

  test.it('without: removes specified values', () => {
    const result = without([1, 2, 3, 4, 5], 2, 4);
    test.expect(result).toEqual([1, 3, 5]);
  });

  test.it('intersection: finds common elements', () => {
    const result = intersection([1, 2, 3], [2, 3, 4]);
    test.expect(result).toEqual([2, 3]);
  });

  test.it('difference: finds elements only in first array', () => {
    const result = difference([1, 2, 3], [2, 3, 4]);
    test.expect(result).toEqual([1]);
  });

  // ============================================
  // SAMPLING TESTS (5 tests)
  // ============================================

  test.it('shuffle: returns array with same length', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle(arr);
    test.expect(result.length).toBe(5);
    // Check all elements are present
    arr.forEach(item => {
      test.expect(result).toContain(item);
    });
  });

  test.it('shuffle: does not modify original array', () => {
    const arr = [1, 2, 3];
    const original = [...arr];
    shuffle(arr);
    test.expect(arr).toEqual(original);
  });

  test.it('sample: returns single element when count not specified', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = sample(arr);
    test.expect(arr).toContain(result);
  });

  test.it('sample: returns multiple elements when count specified', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = sample(arr, 3);
    test.expect(Array.isArray(result)).toBeTruthy();
    test.expect((result as number[]).length).toBe(3);
  });

  test.it('sample: handles count larger than array', () => {
    const arr = [1, 2];
    const result = sample(arr, 5);
    test.expect((result as number[]).length).toBe(2);
  });

  // ============================================
  // UTILITY TESTS (6 tests)
  // ============================================

  test.it('range: creates inclusive range', () => {
    const result = range(1, 5);
    test.expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  test.it('range: creates range with step', () => {
    const result = range(0, 10, 2);
    test.expect(result).toEqual([0, 2, 4, 6, 8, 10]);
  });

  test.it('range: handles negative step', () => {
    const result = range(5, 1, -1);
    test.expect(result).toEqual([5, 4, 3, 2, 1]);
  });

  test.it('fill: creates array with static value', () => {
    const result = fill(3, 'x');
    test.expect(result).toEqual(['x', 'x', 'x']);
  });

  test.it('fill: creates array with function-generated values', () => {
    let counter = 0;
    const result = fill(3, () => counter++);
    test.expect(result).toEqual([0, 1, 2]);
  });

  test.it('fill: handles zero length', () => {
    const result = fill(0, 'x');
    test.expect(result).toEqual([]);
  });

  // ============================================
  // EDGE CASES (5 additional tests)
  // ============================================

  test.it('intersection: handles empty arrays', () => {
    const result = intersection([], [1, 2, 3]);
    test.expect(result).toEqual([]);
  });

  test.it('difference: handles no differences', () => {
    const result = difference([1, 2], [1, 2, 3]);
    test.expect(result).toEqual([]);
  });

  test.it('without: handles no matches', () => {
    const result = without([1, 2, 3], 4, 5);
    test.expect(result).toEqual([1, 2, 3]);
  });

  test.it('groupBy: handles empty array', () => {
    const result = groupBy([], (x) => x);
    test.expect(result).toEqual({});
  });

  test.it('flatten: handles deeply nested arrays', () => {
    const result = flatten([[1, [2]], [3, [4, [5]]]]);
    test.expect(result).toEqual([1, [2], 3, [4, [5]]]);
  });
});
