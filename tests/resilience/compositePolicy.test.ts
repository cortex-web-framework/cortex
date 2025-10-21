import { test } from 'node:test';
import assert from 'node:assert';
import { CompositePolicy } from '../../src/resilience/compositePolicy';
import { CircuitBreaker } from '../../src/resilience/circuitBreaker';
import { RetryExecutor } from '../../src/resilience/retryExecutor';
import { Bulkhead } from '../../src/resilience/bulkhead';

test('CompositePolicy should execute operation without policies', async () => {
  const policy = new CompositePolicy();
  
  const result = await policy.execute(async () => 'success');
  
  assert.strictEqual(result, 'success');
});

test('CompositePolicy should execute with single policy', async () => {
  const circuitBreaker = new CircuitBreaker({ failureThreshold: 5, successThreshold: 1, timeout: 1000, resetTimeout: 1000 });
  const policy = new CompositePolicy().withCircuitBreaker(circuitBreaker);
  
  const result = await policy.execute(async () => 'success');
  
  assert.strictEqual(result, 'success');
});

test('CompositePolicy should execute with multiple policies', async () => {
  const circuitBreaker = new CircuitBreaker({ failureThreshold: 5, successThreshold: 1, timeout: 1000, resetTimeout: 1000 });
  const retryExecutor = new RetryExecutor({ maxAttempts: 2, baseDelay: 10, maxDelay: 100, backoffMultiplier: 2, jitter: false, retryableErrors: [] });
  const bulkhead = new Bulkhead({ maxConcurrent: 5, maxQueueSize: 10, queueTimeout: 1000 });
  
  const policy = new CompositePolicy()
    .withCircuitBreaker(circuitBreaker)
    .withRetry(retryExecutor)
    .withBulkhead(bulkhead);
  
  const result = await policy.execute(async () => 'success');
  
  assert.strictEqual(result, 'success');
});

test('CompositePolicy should handle policy failures', async () => {
  const circuitBreaker = new CircuitBreaker({ failureThreshold: 1, successThreshold: 1, timeout: 1000, resetTimeout: 1000 });
  const policy = new CompositePolicy().withCircuitBreaker(circuitBreaker);
  
  // Open the circuit breaker
  await assert.rejects(async () => {
    await policy.execute(async () => { throw new Error('Test error'); });
  });
  
  // Should reject immediately due to open circuit
  await assert.rejects(async () => {
    await policy.execute(async () => 'should not execute');
  }, /Circuit breaker is OPEN/);
});

test('CompositePolicy should retry with circuit breaker', async () => {
  const circuitBreaker = new CircuitBreaker({ failureThreshold: 3, successThreshold: 1, timeout: 1000, resetTimeout: 1000 });
  const retryExecutor = new RetryExecutor({ maxAttempts: 2, baseDelay: 10, maxDelay: 100, backoffMultiplier: 2, jitter: false, retryableErrors: ['TestError'] });
  
  const policy = new CompositePolicy()
    .withCircuitBreaker(circuitBreaker)
    .withRetry(retryExecutor);
  
  let attemptCount = 0;
  
  const result = await policy.execute(async () => {
    attemptCount++;
    if (attemptCount < 2) {
      throw new Error('TestError');
    }
    return 'success';
  });
  
  assert.strictEqual(result, 'success');
  assert.strictEqual(attemptCount, 2);
});

test('CompositePolicy should get policies', () => {
  const circuitBreaker = new CircuitBreaker();
  const retryExecutor = new RetryExecutor();
  const bulkhead = new Bulkhead();
  
  const policy = new CompositePolicy()
    .withCircuitBreaker(circuitBreaker)
    .withRetry(retryExecutor)
    .withBulkhead(bulkhead);
  
  const policies = policy.getPolicies();
  
  assert.strictEqual(policies.length, 3);
  assert.strictEqual(policies[0].name, 'CircuitBreaker');
  assert.strictEqual(policies[1].name, 'RetryExecutor');
  assert.strictEqual(policies[2].name, 'Bulkhead');
});

test('CompositePolicy should get policy by name', () => {
  const circuitBreaker = new CircuitBreaker();
  const retryExecutor = new RetryExecutor();
  
  const policy = new CompositePolicy()
    .withCircuitBreaker(circuitBreaker)
    .withRetry(retryExecutor);
  
  const foundCircuitBreaker = policy.getPolicy('CircuitBreaker');
  const foundRetryExecutor = policy.getPolicy('RetryExecutor');
  const notFound = policy.getPolicy('NonExistent');
  
  assert.ok(foundCircuitBreaker);
  assert.strictEqual(foundCircuitBreaker.name, 'CircuitBreaker');
  assert.ok(foundRetryExecutor);
  assert.strictEqual(foundRetryExecutor.name, 'RetryExecutor');
  assert.strictEqual(notFound, undefined);
});

test('CompositePolicy should clear policies', () => {
  const circuitBreaker = new CircuitBreaker();
  const retryExecutor = new RetryExecutor();
  
  const policy = new CompositePolicy()
    .withCircuitBreaker(circuitBreaker)
    .withRetry(retryExecutor);
  
  assert.strictEqual(policy.getPolicies().length, 2);
  
  policy.clear();
  
  assert.strictEqual(policy.getPolicies().length, 0);
});

test('CompositePolicy should chain method calls', () => {
  const circuitBreaker = new CircuitBreaker();
  const retryExecutor = new RetryExecutor();
  const bulkhead = new Bulkhead();
  
  const policy = new CompositePolicy()
    .withCircuitBreaker(circuitBreaker)
    .withRetry(retryExecutor)
    .withBulkhead(bulkhead)
    .clear()
    .withCircuitBreaker(circuitBreaker);
  
  assert.strictEqual(policy.getPolicies().length, 1);
  assert.strictEqual(policy.getPolicies()[0].name, 'CircuitBreaker');
});
