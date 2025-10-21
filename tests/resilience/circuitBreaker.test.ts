import { test } from 'node:test';
import assert from 'node:assert';
import { CircuitBreaker } from '../../src/resilience/circuitBreaker';
import { CircuitState } from '../../src/resilience/types';

test('CircuitBreaker should start in CLOSED state', () => {
  const circuitBreaker = new CircuitBreaker();
  assert.strictEqual(circuitBreaker.getState(), CircuitState.CLOSED);
  assert.strictEqual(circuitBreaker.getFailureCount(), 0);
  assert.strictEqual(circuitBreaker.getSuccessCount(), 0);
});

test('CircuitBreaker should execute successful operations', async () => {
  const circuitBreaker = new CircuitBreaker({ failureThreshold: 2, successThreshold: 1, timeout: 1000, resetTimeout: 1000 });
  
  const result = await circuitBreaker.execute(async () => 'success');
  
  assert.strictEqual(result, 'success');
  assert.strictEqual(circuitBreaker.getState(), CircuitState.CLOSED);
  assert.strictEqual(circuitBreaker.getFailureCount(), 0);
});

test('CircuitBreaker should open after failure threshold', async () => {
  const circuitBreaker = new CircuitBreaker({ failureThreshold: 2, successThreshold: 1, timeout: 1000, resetTimeout: 1000 });
  
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

test('CircuitBreaker should reject requests when OPEN', async () => {
  const circuitBreaker = new CircuitBreaker({ failureThreshold: 1, successThreshold: 1, timeout: 1000, resetTimeout: 1000 });
  
  // Open the circuit
  await assert.rejects(async () => {
    await circuitBreaker.execute(async () => { throw new Error('Test error'); });
  });
  
  // Should reject immediately
  await assert.rejects(async () => {
    await circuitBreaker.execute(async () => 'should not execute');
  }, /Circuit breaker is OPEN/);
});

test('CircuitBreaker should transition to HALF_OPEN after timeout', async () => {
  const circuitBreaker = new CircuitBreaker({ failureThreshold: 1, successThreshold: 1, timeout: 100, resetTimeout: 1000 });
  
  // Open the circuit
  await assert.rejects(async () => {
    await circuitBreaker.execute(async () => { throw new Error('Test error'); });
  });
  
  // Wait for timeout
  await new Promise(resolve => setTimeout(resolve, 150));
  
  // Should be in HALF_OPEN state
  assert.strictEqual(circuitBreaker.getState(), CircuitState.HALF_OPEN);
});

test('CircuitBreaker should close from HALF_OPEN after success threshold', async () => {
  const circuitBreaker = new CircuitBreaker({ failureThreshold: 1, successThreshold: 2, timeout: 100, resetTimeout: 1000 });
  
  // Open the circuit
  await assert.rejects(async () => {
    await circuitBreaker.execute(async () => { throw new Error('Test error'); });
  });
  
  // Wait for timeout
  await new Promise(resolve => setTimeout(resolve, 150));
  
  // First success in HALF_OPEN
  await circuitBreaker.execute(async () => 'success1');
  assert.strictEqual(circuitBreaker.getState(), CircuitState.HALF_OPEN);
  assert.strictEqual(circuitBreaker.getSuccessCount(), 1);
  
  // Second success - should close
  await circuitBreaker.execute(async () => 'success2');
  assert.strictEqual(circuitBreaker.getState(), CircuitState.CLOSED);
  assert.strictEqual(circuitBreaker.getSuccessCount(), 0);
});

test('CircuitBreaker should reset failure count on success', async () => {
  const circuitBreaker = new CircuitBreaker({ failureThreshold: 3, successThreshold: 1, timeout: 1000, resetTimeout: 1000 });
  
  // One failure
  await assert.rejects(async () => {
    await circuitBreaker.execute(async () => { throw new Error('Test error'); });
  });
  assert.strictEqual(circuitBreaker.getFailureCount(), 1);
  
  // Success should reset failure count
  await circuitBreaker.execute(async () => 'success');
  assert.strictEqual(circuitBreaker.getFailureCount(), 0);
});

test('CircuitBreaker should reset to CLOSED state', () => {
  const circuitBreaker = new CircuitBreaker();
  
  // Manually set some state
  (circuitBreaker as any).state = CircuitState.OPEN;
  (circuitBreaker as any).failureCount = 5;
  (circuitBreaker as any).successCount = 2;
  
  circuitBreaker.reset();
  
  assert.strictEqual(circuitBreaker.getState(), CircuitState.CLOSED);
  assert.strictEqual(circuitBreaker.getFailureCount(), 0);
  assert.strictEqual(circuitBreaker.getSuccessCount(), 0);
});

test('CircuitBreaker should validate configuration', () => {
  assert.throws(() => {
    new CircuitBreaker({ failureThreshold: 0, successThreshold: 1, timeout: 1000, resetTimeout: 1000 });
  }, /failureThreshold must be greater than 0/);
  
  assert.throws(() => {
    new CircuitBreaker({ failureThreshold: 1, successThreshold: 0, timeout: 1000, resetTimeout: 1000 });
  }, /successThreshold must be greater than 0/);
  
  assert.throws(() => {
    new CircuitBreaker({ failureThreshold: 1, successThreshold: 1, timeout: 0, resetTimeout: 1000 });
  }, /timeout must be greater than 0/);
  
  assert.throws(() => {
    new CircuitBreaker({ failureThreshold: 1, successThreshold: 1, timeout: 1000, resetTimeout: 0 });
  }, /resetTimeout must be greater than 0/);
});
