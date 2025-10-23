/**
 * RollingWindow Test Suite
 *
 * Tests for the circular buffer-based RollingWindow data structure.
 * RollingWindow is used by CircuitBreaker to efficiently track metrics
 * over a sliding time window with O(1) add and calculation operations.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
// @ts-ignore - RollingWindow will be implemented in Phase 3.1.2
import { RollingWindow } from '../../src/resilience/rollingWindow.js';

test('RollingWindow', async (t) => {
  await t.test('should initialize with correct size', () => {
    const window = new RollingWindow(5);
    assert.strictEqual(window.getSize?.(), 5, 'Size should be 5');
    assert.strictEqual(window.getCount(), 0, 'Initial count should be 0');
    assert.strictEqual(window.getSum(), 0, 'Initial sum should be 0');
    assert.strictEqual(window.isFull(), false, 'New window should not be full');
  });

  await t.test('should throw when initialized with invalid size', () => {
    assert.throws(
      () => new RollingWindow(0),
      /Window size must be positive/,
      'Should throw on size 0'
    );

    assert.throws(
      () => new RollingWindow(-5),
      /Window size must be positive/,
      'Should throw on negative size'
    );

    assert.throws(
      () => new RollingWindow(Infinity),
      /Window size must be positive/,
      'Should throw on Infinity'
    );
  });

  await t.test('should add values and track count correctly', () => {
    const window = new RollingWindow(5);

    window.add(10);
    assert.strictEqual(window.getCount(), 1, 'Count should be 1 after one add');

    window.add(20);
    assert.strictEqual(window.getCount(), 2, 'Count should be 2 after two adds');

    window.add(30);
    assert.strictEqual(window.getCount(), 3, 'Count should be 3 after three adds');
  });

  await t.test('should maintain running sum correctly', () => {
    const window = new RollingWindow(5);

    window.add(10);
    assert.strictEqual(window.getSum(), 10, 'Sum should be 10 after adding 10');

    window.add(20);
    assert.strictEqual(window.getSum(), 30, 'Sum should be 30 after adding 20');

    window.add(5);
    assert.strictEqual(window.getSum(), 35, 'Sum should be 35 after adding 5');

    window.add(15);
    assert.strictEqual(window.getSum(), 50, 'Sum should be 50 after adding 15');
  });

  await t.test('should correctly identify full state', () => {
    const window = new RollingWindow(3);

    assert.strictEqual(window.isFull(), false, 'Should not be full initially');

    window.add(1);
    assert.strictEqual(window.isFull(), false, 'Should not be full with 1 element');

    window.add(2);
    assert.strictEqual(window.isFull(), false, 'Should not be full with 2 elements');

    window.add(3);
    assert.strictEqual(window.isFull(), true, 'Should be full with 3 elements');
  });

  await t.test('should overwrite oldest value when full and subtract from sum', () => {
    const window = new RollingWindow(3);

    // Fill the window: [10, 20, 30]
    window.add(10);
    window.add(20);
    window.add(30);
    assert.strictEqual(window.getSum(), 60, 'Sum should be 60 for [10,20,30]');
    assert.strictEqual(window.getCount(), 3, 'Count should be 3');

    // Add new value, overwrite oldest: [20, 30, 40]
    window.add(40);
    assert.strictEqual(window.getSum(), 90, 'Sum should be 90 for [20,30,40]');
    assert.strictEqual(window.getCount(), 3, 'Count should remain 3');

    // Add another: [30, 40, 50]
    window.add(50);
    assert.strictEqual(window.getSum(), 120, 'Sum should be 120 for [30,40,50]');
    assert.strictEqual(window.getCount(), 3, 'Count should remain 3');
  });

  await t.test('should calculate average correctly', () => {
    const window = new RollingWindow(4);

    window.add(10);
    window.add(20);
    window.add(30);
    window.add(40);

    const average = window.getAverage();
    assert.strictEqual(average, 25, 'Average of [10,20,30,40] should be 25');
  });

  await t.test('should calculate average as sum/count', () => {
    const window = new RollingWindow(5);

    window.add(5);
    assert.strictEqual(window.getAverage(), 5, 'Average of [5] should be 5');

    window.add(15);
    assert.strictEqual(window.getAverage(), 10, 'Average of [5,15] should be 10');

    window.add(20);
    assert.strictEqual(window.getAverage(), 13.333333333333334, 'Average of [5,15,20] should be ~13.33');
  });

  await t.test('should return 0 average for empty window', () => {
    const window = new RollingWindow(5);
    assert.strictEqual(window.getAverage(), 0, 'Average of empty window should be 0');
  });

  await t.test('should clear all data and reset state', () => {
    const window = new RollingWindow(3);

    window.add(10);
    window.add(20);
    window.add(30);
    assert.strictEqual(window.getCount(), 3, 'Count should be 3 before clear');
    assert.strictEqual(window.getSum(), 60, 'Sum should be 60 before clear');

    window.clear();
    assert.strictEqual(window.getCount(), 0, 'Count should be 0 after clear');
    assert.strictEqual(window.getSum(), 0, 'Sum should be 0 after clear');
    assert.strictEqual(window.getAverage(), 0, 'Average should be 0 after clear');
    assert.strictEqual(window.isFull(), false, 'Should not be full after clear');
  });

  await t.test('should handle window size of 1', () => {
    const window = new RollingWindow(1);

    window.add(100);
    assert.strictEqual(window.getCount(), 1, 'Count should be 1');
    assert.strictEqual(window.getSum(), 100, 'Sum should be 100');
    assert.strictEqual(window.isFull(), true, 'Should be full with size 1');

    // Add another value, should overwrite
    window.add(50);
    assert.strictEqual(window.getCount(), 1, 'Count should remain 1');
    assert.strictEqual(window.getSum(), 50, 'Sum should be 50 after overwrite');
    assert.strictEqual(window.getAverage(), 50, 'Average should be 50');
  });

  await t.test('should handle negative values', () => {
    const window = new RollingWindow(4);

    window.add(10);
    window.add(-5);
    window.add(20);
    window.add(-15);

    assert.strictEqual(window.getSum(), 10, 'Sum of [10,-5,20,-15] should be 10');
    assert.strictEqual(window.getCount(), 4, 'Count should be 4');
    assert.strictEqual(window.getAverage(), 2.5, 'Average should be 2.5');
  });

  await t.test('should handle zero values', () => {
    const window = new RollingWindow(3);

    window.add(0);
    window.add(0);
    window.add(0);

    assert.strictEqual(window.getSum(), 0, 'Sum of zeros should be 0');
    assert.strictEqual(window.getCount(), 3, 'Count should be 3');
    assert.strictEqual(window.getAverage(), 0, 'Average should be 0');
  });

  await t.test('should maintain O(1) complexity for add operation', () => {
    const window = new RollingWindow(1000);
    const startTime = Date.now();

    // Add 10,000 values - should complete very quickly if O(1)
    for (let i = 0; i < 10000; i++) {
      window.add(Math.random() * 100);
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    assert.ok(duration < 100, `Adding 10,000 values should take < 100ms, took ${duration}ms`);
  });

  await t.test('should handle sequential overwrites correctly', () => {
    const window = new RollingWindow(2);

    // Fill: [10, 20]
    window.add(10);
    window.add(20);
    assert.strictEqual(window.getSum(), 30);

    // Overwrite 10 with 30: [30, 20]
    window.add(30);
    assert.strictEqual(window.getSum(), 50);

    // Overwrite 20 with 40: [30, 40]
    window.add(40);
    assert.strictEqual(window.getSum(), 70);

    // Overwrite 30 with 50: [40, 50]
    window.add(50);
    assert.strictEqual(window.getSum(), 90);

    // Overwrite 40 with 60: [50, 60]
    window.add(60);
    assert.strictEqual(window.getSum(), 110);
  });

  await t.test('should handle large window sizes', () => {
    const window = new RollingWindow(10000);

    // Add sequential values
    for (let i = 0; i < 10000; i++) {
      window.add(i);
    }

    assert.strictEqual(window.getCount(), 10000, 'Count should be 10000');
    // Sum of 0..9999 = 9999*10000/2 = 49,995,000
    assert.strictEqual(window.getSum(), 49995000, 'Sum should be correct for 0..9999');
    assert.strictEqual(window.isFull(), true, 'Should be full');

    // Add one more value
    window.add(10000);
    assert.strictEqual(window.getCount(), 10000, 'Count should remain 10000');
    // Old sum - 0 + 10000 = 49,995,000 - 0 + 10,000 = 50,005,000
    assert.strictEqual(window.getSum(), 50005000, 'Sum should be updated correctly');
  });

  await t.test('should work with fractional values', () => {
    const window = new RollingWindow(3);

    window.add(1.5);
    window.add(2.7);
    window.add(3.2);

    assert.strictEqual(window.getSum(), 7.4, 'Sum of [1.5, 2.7, 3.2] should be 7.4');
    const average = window.getAverage();
    assert.ok(
      Math.abs(average - 7.4 / 3) < 0.0001,
      `Average should be ~${7.4 / 3}, got ${average}`
    );
  });
});
