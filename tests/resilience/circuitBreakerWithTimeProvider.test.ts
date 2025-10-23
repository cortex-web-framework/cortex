/**
 * CircuitBreaker Test Suite with TimeProvider
 *
 * Tests for CircuitBreaker using ManualTimeProvider for deterministic,
 * fast test execution without relying on actual system timing delays.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CircuitBreaker } from '../../src/resilience/circuitBreaker.js';
import { CircuitState } from '../../src/resilience/types.js';
import { ManualTimeProvider } from '../mocks/time.js';

test('CircuitBreaker with TimeProvider', async (t) => {
  await t.test('should start in CLOSED state', () => {
    const timeProvider = new ManualTimeProvider(0);
    const circuitBreaker = new CircuitBreaker(
      { failureThreshold: 2, successThreshold: 1, timeout: 1000, resetTimeout: 1000 },
      timeProvider
    );

    assert.strictEqual(circuitBreaker.getState(), CircuitState.CLOSED);
    assert.strictEqual(circuitBreaker.getFailureCount(), 0);
    assert.strictEqual(circuitBreaker.getSuccessCount(), 0);
  });

  await t.test('should execute successful operations', async () => {
    const timeProvider = new ManualTimeProvider(0);
    const circuitBreaker = new CircuitBreaker(
      { failureThreshold: 2, successThreshold: 1, timeout: 1000, resetTimeout: 1000 },
      timeProvider
    );

    const result = await circuitBreaker.execute(async () => 'success');

    assert.strictEqual(result, 'success');
    assert.strictEqual(circuitBreaker.getState(), CircuitState.CLOSED);
    assert.strictEqual(circuitBreaker.getFailureCount(), 0);
  });

  await t.test('should open after failure threshold', async () => {
    const timeProvider = new ManualTimeProvider(0);
    const circuitBreaker = new CircuitBreaker(
      { failureThreshold: 2, successThreshold: 1, timeout: 1000, resetTimeout: 1000 },
      timeProvider
    );

    // First failure
    await assert.rejects(async () => {
      await circuitBreaker.execute(async () => { throw new Error('Test error'); });
    });
    assert.strictEqual(circuitBreaker.getState(), CircuitState.CLOSED);
    assert.strictEqual(circuitBreaker.getFailureCount(), 1);

    // Second failure - should open circuit
    await assert.rejects(async () => {
      await circuitBreaker.execute(async () => { throw new Error('Test error'); });
    });
    assert.strictEqual(circuitBreaker.getState(), CircuitState.OPEN);
    assert.strictEqual(circuitBreaker.getFailureCount(), 2);
  });

  await t.test('should reject requests when OPEN', async () => {
    const timeProvider = new ManualTimeProvider(0);
    const circuitBreaker = new CircuitBreaker(
      { failureThreshold: 1, successThreshold: 1, timeout: 1000, resetTimeout: 1000 },
      timeProvider
    );

    // Open the circuit
    await assert.rejects(async () => {
      await circuitBreaker.execute(async () => { throw new Error('Test error'); });
    });

    // Should reject immediately without executing
    await assert.rejects(async () => {
      await circuitBreaker.execute(async () => 'should not execute');
    }, /Circuit breaker is OPEN/);
  });

  await t.test('should transition to HALF_OPEN after timeout', async () => {
    const timeProvider = new ManualTimeProvider(0);
    const circuitBreaker = new CircuitBreaker(
      { failureThreshold: 1, successThreshold: 1, timeout: 100, resetTimeout: 1000 },
      timeProvider
    );

    // Open the circuit
    await assert.rejects(async () => {
      await circuitBreaker.execute(async () => { throw new Error('Test error'); });
    });
    assert.strictEqual(circuitBreaker.getState(), CircuitState.OPEN);

    // Advance time by timeout
    timeProvider.advance(101);

    // Next execution should transition to HALF_OPEN
    const operationPromise = circuitBreaker.execute(async () => 'success');

    // State should be HALF_OPEN immediately
    assert.strictEqual(
      circuitBreaker.getState(),
      CircuitState.HALF_OPEN,
      'Circuit breaker should be HALF_OPEN after timeout'
    );

    const result = await operationPromise;
    assert.strictEqual(result, 'success');
  });

  await t.test('should close from HALF_OPEN after success threshold', async () => {
    const timeProvider = new ManualTimeProvider(0);
    const circuitBreaker = new CircuitBreaker(
      { failureThreshold: 1, successThreshold: 2, timeout: 100, resetTimeout: 1000 },
      timeProvider
    );

    // Open the circuit
    await assert.rejects(async () => {
      await circuitBreaker.execute(async () => { throw new Error('Test error'); });
    });
    assert.strictEqual(circuitBreaker.getState(), CircuitState.OPEN);

    // Advance time past timeout
    timeProvider.advance(101);

    // First success in HALF_OPEN
    await circuitBreaker.execute(async () => 'success1');
    assert.strictEqual(circuitBreaker.getState(), CircuitState.HALF_OPEN);
    assert.strictEqual(circuitBreaker.getSuccessCount(), 1);

    // Second success - should close
    await circuitBreaker.execute(async () => 'success2');
    assert.strictEqual(circuitBreaker.getState(), CircuitState.CLOSED);
    assert.strictEqual(circuitBreaker.getSuccessCount(), 0);
  });

  await t.test('should reset failure count on success', async () => {
    const timeProvider = new ManualTimeProvider(0);
    const circuitBreaker = new CircuitBreaker(
      { failureThreshold: 3, successThreshold: 1, timeout: 1000, resetTimeout: 1000 },
      timeProvider
    );

    // One failure
    await assert.rejects(async () => {
      await circuitBreaker.execute(async () => { throw new Error('Test error'); });
    });
    assert.strictEqual(circuitBreaker.getFailureCount(), 1);

    // Success should reset failure count
    await circuitBreaker.execute(async () => 'success');
    assert.strictEqual(circuitBreaker.getFailureCount(), 0);
  });

  await t.test('should reset to CLOSED state', () => {
    const timeProvider = new ManualTimeProvider(0);
    const circuitBreaker = new CircuitBreaker(
      { failureThreshold: 5, successThreshold: 1, timeout: 1000, resetTimeout: 1000 },
      timeProvider
    );

    // Manually set some state (for testing reset functionality)
    (circuitBreaker as any).state = CircuitState.OPEN;
    (circuitBreaker as any).failureCount = 5;
    (circuitBreaker as any).successCount = 2;

    circuitBreaker.reset();

    assert.strictEqual(circuitBreaker.getState(), CircuitState.CLOSED);
    assert.strictEqual(circuitBreaker.getFailureCount(), 0);
    assert.strictEqual(circuitBreaker.getSuccessCount(), 0);
  });

  await t.test('should validate configuration', () => {
    const timeProvider = new ManualTimeProvider(0);

    assert.throws(() => {
      new CircuitBreaker(
        { failureThreshold: 0, successThreshold: 1, timeout: 1000, resetTimeout: 1000 },
        timeProvider
      );
    }, /failureThreshold must be greater than 0/);

    assert.throws(() => {
      new CircuitBreaker(
        { failureThreshold: 1, successThreshold: 0, timeout: 1000, resetTimeout: 1000 },
        timeProvider
      );
    }, /successThreshold must be greater than 0/);
  });

  await t.test('should track state transitions over time', async () => {
    const timeProvider = new ManualTimeProvider(0);
    const circuitBreaker = new CircuitBreaker(
      { failureThreshold: 2, successThreshold: 3, timeout: 100, resetTimeout: 1000 },
      timeProvider
    );

    // Initial state
    assert.strictEqual(circuitBreaker.getState(), CircuitState.CLOSED);

    // Record two failures to open the circuit
    await assert.rejects(() => circuitBreaker.execute(async () => { throw new Error('fail'); }));
    await assert.rejects(() => circuitBreaker.execute(async () => { throw new Error('fail'); }));
    assert.strictEqual(circuitBreaker.getState(), CircuitState.OPEN);

    // Attempt while open should be rejected
    await assert.rejects(() => circuitBreaker.execute(async () => 'nope'));

    // Advance time to allow half-open
    timeProvider.advance(101);

    // Try to recover
    await circuitBreaker.execute(async () => 'success1');
    assert.strictEqual(circuitBreaker.getState(), CircuitState.HALF_OPEN);

    await circuitBreaker.execute(async () => 'success2');
    assert.strictEqual(circuitBreaker.getState(), CircuitState.HALF_OPEN);

    await circuitBreaker.execute(async () => 'success3');
    assert.strictEqual(circuitBreaker.getState(), CircuitState.CLOSED);
  });

  await t.test('should handle failure in HALF_OPEN state', async () => {
    const timeProvider = new ManualTimeProvider(0);
    const circuitBreaker = new CircuitBreaker(
      { failureThreshold: 1, successThreshold: 2, timeout: 100, resetTimeout: 1000 },
      timeProvider
    );

    // Open the circuit
    await assert.rejects(async () => {
      await circuitBreaker.execute(async () => { throw new Error('fail'); });
    });
    assert.strictEqual(circuitBreaker.getState(), CircuitState.OPEN);

    // Advance time and transition to HALF_OPEN
    timeProvider.advance(101);
    await circuitBreaker.execute(async () => 'success');
    assert.strictEqual(circuitBreaker.getState(), CircuitState.HALF_OPEN);

    // Failure in HALF_OPEN should reopen
    await assert.rejects(async () => {
      await circuitBreaker.execute(async () => { throw new Error('fail'); });
    });
    assert.strictEqual(circuitBreaker.getState(), CircuitState.OPEN);
  });

  await t.test('should be available for requests based on state', () => {
    const timeProvider = new ManualTimeProvider(0);
    const circuitBreaker = new CircuitBreaker(
      { failureThreshold: 1, successThreshold: 1, timeout: 100, resetTimeout: 1000 },
      timeProvider
    );

    // Available when closed
    assert.strictEqual(circuitBreaker.isAvailable(), true);

    // Simulate open state
    (circuitBreaker as any).state = CircuitState.OPEN;
    (circuitBreaker as any).nextAttemptTime = timeProvider.now() + 50;

    // Not available before timeout
    assert.strictEqual(circuitBreaker.isAvailable(), false);

    // Available after timeout
    timeProvider.advance(51);
    assert.strictEqual(circuitBreaker.isAvailable(), true);
  });
});
