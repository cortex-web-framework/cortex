/**
 * TimeWindowTracker Test Suite
 *
 * Tests for the time-window based failure tracking data structure.
 * TimeWindowTracker is used by CircuitBreaker to determine if the error rate
 * exceeds thresholds over a specific time window.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TimeWindowTracker } from '../../src/resilience/rollingWindow.js';
import { ManualTimeProvider } from '../mocks/time.js';

test('TimeWindowTracker', async (t) => {
  await t.test('should initialize with correct configuration', () => {
    const timeProvider = new ManualTimeProvider(0);
    const tracker = new TimeWindowTracker(
      { windowSizeMs: 10000, bucketCount: 10 },
      timeProvider
    );

    assert.strictEqual(tracker.getTotalRequests(), 0, 'Initial total should be 0');
    assert.strictEqual(tracker.getErrorRate(), 0, 'Initial error rate should be 0');
  });

  await t.test('should record successful operations', () => {
    const timeProvider = new ManualTimeProvider(0);
    const tracker = new TimeWindowTracker(
      { windowSizeMs: 10000, bucketCount: 10 },
      timeProvider
    );

    tracker.recordSuccess();
    assert.strictEqual(
      tracker.getTotalRequests(),
      1,
      'Total should be 1 after one success'
    );
    assert.strictEqual(tracker.getErrorRate(), 0, 'Error rate should be 0');

    tracker.recordSuccess();
    assert.strictEqual(
      tracker.getTotalRequests(),
      2,
      'Total should be 2 after two successes'
    );
  });

  await t.test('should record failed operations', () => {
    const timeProvider = new ManualTimeProvider(0);
    const tracker = new TimeWindowTracker(
      { windowSizeMs: 10000, bucketCount: 10 },
      timeProvider
    );

    tracker.recordFailure();
    assert.strictEqual(
      tracker.getTotalRequests(),
      1,
      'Total should be 1 after one failure'
    );
    assert.strictEqual(tracker.getErrorRate(), 100, 'Error rate should be 100%');

    tracker.recordFailure();
    assert.strictEqual(
      tracker.getTotalRequests(),
      2,
      'Total should be 2 after two failures'
    );
    assert.strictEqual(tracker.getErrorRate(), 100, 'Error rate should be 100%');
  });

  await t.test('should calculate error rate correctly with mixed operations', () => {
    const timeProvider = new ManualTimeProvider(0);
    const tracker = new TimeWindowTracker(
      { windowSizeMs: 10000, bucketCount: 10 },
      timeProvider
    );

    tracker.recordSuccess();
    tracker.recordSuccess();
    tracker.recordFailure();

    assert.strictEqual(
      tracker.getTotalRequests(),
      3,
      'Total should be 3 (2 successes + 1 failure)'
    );
    const expectedRate = (1 / 3) * 100;
    assert.ok(
      Math.abs(tracker.getErrorRate() - expectedRate) < 0.01,
      `Error rate should be ~${expectedRate}%, got ${tracker.getErrorRate()}%`
    );
  });

  await t.test('should return 0 error rate when no requests recorded', () => {
    const timeProvider = new ManualTimeProvider(0);
    const tracker = new TimeWindowTracker(
      { windowSizeMs: 10000, bucketCount: 10 },
      timeProvider
    );

    assert.strictEqual(tracker.getErrorRate(), 0, 'Error rate should be 0 when empty');
  });

  await t.test('should handle transitions between time buckets', () => {
    const timeProvider = new ManualTimeProvider(0);
    const config = { windowSizeMs: 10000, bucketCount: 10 }; // 1000ms per bucket
    const tracker = new TimeWindowTracker(config, timeProvider);

    // Record 2 successes in first bucket
    tracker.recordSuccess();
    tracker.recordSuccess();
    assert.strictEqual(tracker.getTotalRequests(), 2);
    assert.strictEqual(tracker.getErrorRate(), 0);

    // Advance to next bucket
    timeProvider.advance(1100);
    tracker.recordFailure();
    assert.strictEqual(tracker.getTotalRequests(), 3);
    const expectedRate = (1 / 3) * 100;
    assert.ok(
      Math.abs(tracker.getErrorRate() - expectedRate) < 0.01,
      `Error rate should be ~${expectedRate}%`
    );

    // Advance to third bucket
    timeProvider.advance(1100);
    tracker.recordSuccess();
    assert.strictEqual(tracker.getTotalRequests(), 4);
  });

  await t.test('should handle advancing time and recording in different buckets', () => {
    const timeProvider = new ManualTimeProvider(0);
    const config = { windowSizeMs: 10000, bucketCount: 10 }; // 1000ms per bucket
    const tracker = new TimeWindowTracker(config, timeProvider);

    // Record in first bucket
    tracker.recordFailure();
    tracker.recordFailure();
    assert.strictEqual(tracker.getTotalRequests(), 2);

    // Advance and record in different bucket
    timeProvider.advance(1100);
    tracker.recordSuccess();
    assert.strictEqual(tracker.getTotalRequests(), 3);

    // Can continue advancing and recording
    timeProvider.advance(1100);
    tracker.recordSuccess();
    assert.strictEqual(tracker.getTotalRequests(), 4);
  });

  await t.test('should handle clear operation', () => {
    const timeProvider = new ManualTimeProvider(0);
    const tracker = new TimeWindowTracker(
      { windowSizeMs: 10000, bucketCount: 10 },
      timeProvider
    );

    tracker.recordSuccess();
    tracker.recordFailure();
    tracker.recordFailure();
    assert.strictEqual(tracker.getTotalRequests(), 3);

    tracker.clear();
    assert.strictEqual(
      tracker.getTotalRequests(),
      0,
      'Total should be 0 after clear'
    );
    assert.strictEqual(
      tracker.getErrorRate(),
      0,
      'Error rate should be 0 after clear'
    );
  });

  await t.test('should track data across multiple time windows', () => {
    const timeProvider = new ManualTimeProvider(0);
    const config = { windowSizeMs: 3000, bucketCount: 3 }; // 1000ms per bucket
    const tracker = new TimeWindowTracker(config, timeProvider);

    // Record some data at the start
    tracker.recordSuccess();
    tracker.recordFailure();
    assert.strictEqual(tracker.getTotalRequests(), 2);
    assert.strictEqual(tracker.getErrorRate(), 50);

    // Move to next time bucket and record more
    timeProvider.advance(1100);
    tracker.recordSuccess();
    tracker.recordSuccess();
    assert.strictEqual(tracker.getTotalRequests(), 4);

    // Move to third time bucket
    timeProvider.advance(1100);
    tracker.recordFailure();
    assert.strictEqual(tracker.getTotalRequests(), 5);

    // Verify error rate is 2 failures / 5 total = 40%
    const errorRate = tracker.getErrorRate();
    assert.ok(
      Math.abs(errorRate - 40) < 1,
      `Error rate should be ~40%, got ${errorRate}%`
    );
  });

  await t.test('should handle rapid successive records in same bucket', () => {
    const timeProvider = new ManualTimeProvider(0);
    const tracker = new TimeWindowTracker(
      { windowSizeMs: 10000, bucketCount: 10 },
      timeProvider
    );

    // Rapid-fire successes and failures
    for (let i = 0; i < 100; i++) {
      if (i % 3 === 0) {
        tracker.recordFailure();
      } else {
        tracker.recordSuccess();
      }
    }

    assert.strictEqual(tracker.getTotalRequests(), 100);
    const expectedFailures = 34; // Math.ceil(100/3)
    const expectedErrorRate = (expectedFailures / 100) * 100;
    assert.ok(
      Math.abs(tracker.getErrorRate() - expectedErrorRate) < 1,
      `Error rate should be ~${expectedErrorRate}%, got ${tracker.getErrorRate()}%`
    );
  });

  await t.test('should support different window and bucket configurations', () => {
    const timeProvider = new ManualTimeProvider(0);
    const configs = [
      { windowSizeMs: 1000, bucketCount: 1 },
      { windowSizeMs: 5000, bucketCount: 5 },
      { windowSizeMs: 60000, bucketCount: 60 },
    ];

    for (const config of configs) {
      const tracker = new TimeWindowTracker(config, timeProvider);
      tracker.recordSuccess();
      tracker.recordFailure();
      assert.strictEqual(tracker.getTotalRequests(), 2);
      assert.strictEqual(tracker.getErrorRate(), 50);
    }
  });

  await t.test('should handle error rate calculation with large numbers', () => {
    const timeProvider = new ManualTimeProvider(0);
    const tracker = new TimeWindowTracker(
      { windowSizeMs: 10000, bucketCount: 10 },
      timeProvider
    );

    // Record 10,000 operations
    for (let i = 0; i < 10000; i++) {
      if (i % 100 === 0) {
        tracker.recordFailure();
      } else {
        tracker.recordSuccess();
      }
    }

    assert.strictEqual(tracker.getTotalRequests(), 10000);
    const expectedFailures = 100;
    const expectedErrorRate = (expectedFailures / 10000) * 100;
    assert.ok(
      Math.abs(tracker.getErrorRate() - expectedErrorRate) < 0.1,
      `Error rate should be ~${expectedErrorRate}%, got ${tracker.getErrorRate()}%`
    );
  });

  await t.test('should reset to new bucket when wrapping around', () => {
    const timeProvider = new ManualTimeProvider(0);
    const config = { windowSizeMs: 2000, bucketCount: 2 }; // 1000ms per bucket
    const tracker = new TimeWindowTracker(config, timeProvider);

    // Bucket 0: 2 successes
    tracker.recordSuccess();
    tracker.recordSuccess();
    assert.strictEqual(tracker.getTotalRequests(), 2);

    // Bucket 1: 1 failure
    timeProvider.advance(1100);
    tracker.recordFailure();
    assert.strictEqual(tracker.getTotalRequests(), 3);

    // Wrap back to bucket 0 (data should be reset)
    timeProvider.advance(1100);
    tracker.recordSuccess();
    assert.strictEqual(
      tracker.getTotalRequests(),
      2,
      'Should have 1 old failure + 1 new success after wrap'
    );
  });

  await t.test('should calculate correct error rates as buckets are reused', () => {
    const timeProvider = new ManualTimeProvider(0);
    const config = { windowSizeMs: 3000, bucketCount: 3 }; // 1000ms per bucket
    const tracker = new TimeWindowTracker(config, timeProvider);

    // Fill all buckets with data
    tracker.recordFailure(); // Bucket 0: 1 failure
    timeProvider.advance(1100);

    tracker.recordSuccess();
    tracker.recordSuccess(); // Bucket 1: 2 successes
    timeProvider.advance(1100);

    tracker.recordFailure(); // Bucket 2: 1 failure
    assert.strictEqual(tracker.getTotalRequests(), 4);
    const errorRate1 = tracker.getErrorRate(); // 2 failures / 4 total = 50%

    // Advance to reuse bucket 0 and record success
    timeProvider.advance(1100);
    tracker.recordSuccess(); // This resets bucket 0 with 1 success
    assert.strictEqual(
      tracker.getTotalRequests(),
      4,
      'Should have 4 total (2 from new bucket 0, 2 from bucket 1, 1 from bucket 2 minus the old 1)'
    );
    const errorRate2 = tracker.getErrorRate(); // 1 failure / 4 total = 25%
    assert.ok(
      errorRate2 < errorRate1,
      'Error rate should decrease as old failure bucket is replaced'
    );
  });
});
