/**
 * Unit tests for ManualTimeProvider
 *
 * These tests verify that the ManualTimeProvider correctly implements
 * the TimeProvider interface and provides reliable manual time control
 * for deterministic testing scenarios.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ManualTimeProvider } from './time.js';

test('ManualTimeProvider', async (t) => {
  await t.test('should initialize with default start time of 0', () => {
    const provider = new ManualTimeProvider();
    assert.strictEqual(provider.now(), 0);
  });

  await t.test('should initialize with custom start time', () => {
    const provider = new ManualTimeProvider(1000);
    assert.strictEqual(provider.now(), 1000);
  });

  await t.test('should advance time by specified milliseconds', () => {
    const provider = new ManualTimeProvider(0);
    provider.advance(100);
    assert.strictEqual(provider.now(), 100);

    provider.advance(50);
    assert.strictEqual(provider.now(), 150);
  });

  await t.test('should handle multiple advances correctly', () => {
    const provider = new ManualTimeProvider(0);
    const advances = [10, 20, 30, 40, 50];
    let expected = 0;

    for (const advance of advances) {
      provider.advance(advance);
      expected += advance;
      assert.strictEqual(provider.now(), expected);
    }
  });

  await t.test('should set time to specific absolute value', () => {
    const provider = new ManualTimeProvider(100);
    assert.strictEqual(provider.now(), 100);

    provider.setTime(500);
    assert.strictEqual(provider.now(), 500);

    provider.setTime(1000);
    assert.strictEqual(provider.now(), 1000);
  });

  await t.test('should allow negative advances', () => {
    const provider = new ManualTimeProvider(100);
    provider.advance(-50);
    assert.strictEqual(provider.now(), 50);
  });

  await t.test('should allow setting to zero', () => {
    const provider = new ManualTimeProvider(1000);
    provider.setTime(0);
    assert.strictEqual(provider.now(), 0);
  });

  await t.test('should reset time to zero', () => {
    const provider = new ManualTimeProvider(100);
    provider.advance(50);
    assert.strictEqual(provider.now(), 150);

    provider.reset();
    assert.strictEqual(provider.now(), 0);
  });

  await t.test('should calculate elapsed time correctly', () => {
    const provider = new ManualTimeProvider(0);
    assert.strictEqual(provider.elapsed(), 0);

    provider.advance(100);
    assert.strictEqual(provider.elapsed(), 100);

    provider.advance(50);
    assert.strictEqual(provider.elapsed(), 150);
  });

  await t.test('should handle large timestamp values', () => {
    const largeTime = Date.now();
    const provider = new ManualTimeProvider(largeTime);
    assert.strictEqual(provider.now(), largeTime);

    provider.advance(1000);
    assert.strictEqual(provider.now(), largeTime + 1000);
  });

  await t.test('should support chaining operations conceptually', () => {
    const provider = new ManualTimeProvider(0);
    provider.advance(100);
    assert.strictEqual(provider.now(), 100);

    provider.setTime(500);
    assert.strictEqual(provider.now(), 500);

    provider.advance(200);
    assert.strictEqual(provider.now(), 700);

    provider.reset();
    assert.strictEqual(provider.now(), 0);
  });

  await t.test('should maintain state independence between instances', () => {
    const provider1 = new ManualTimeProvider(0);
    const provider2 = new ManualTimeProvider(0);

    provider1.advance(100);
    assert.strictEqual(provider1.now(), 100);
    assert.strictEqual(provider2.now(), 0);

    provider2.advance(200);
    assert.strictEqual(provider1.now(), 100);
    assert.strictEqual(provider2.now(), 200);
  });
});
