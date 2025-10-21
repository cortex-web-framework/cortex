import { test } from 'node:test';
import assert from 'node:assert';
import { Bulkhead } from '../../src/resilience/bulkhead';

test('Bulkhead should execute operations within concurrency limit', async () => {
  const bulkhead = new Bulkhead({ maxConcurrent: 2, maxQueueSize: 10, queueTimeout: 1000 });
  
  let concurrentCount = 0;
  let maxConcurrent = 0;
  
  const operations = Array.from({ length: 5 }, (_, i) => 
    bulkhead.execute(async () => {
      concurrentCount++;
      maxConcurrent = Math.max(maxConcurrent, concurrentCount);
      await new Promise(resolve => setTimeout(resolve, 50));
      concurrentCount--;
      return `result-${i}`;
    })
  );
  
  const results = await Promise.all(operations);
  
  assert.strictEqual(results.length, 5);
  assert.strictEqual(maxConcurrent, 2); // Should not exceed maxConcurrent
  assert.ok(results.every((result, i) => result === `result-${i}`));
});

test('Bulkhead should queue operations when at capacity', async () => {
  const bulkhead = new Bulkhead({ maxConcurrent: 1, maxQueueSize: 3, queueTimeout: 1000 });
  
  const startTime = Date.now();
  
  // First operation should start immediately
  const op1 = bulkhead.execute(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return 'first';
  });
  
  // These should be queued
  const op2 = bulkhead.execute(async () => 'second');
  const op3 = bulkhead.execute(async () => 'third');
  
  const results = await Promise.all([op1, op2, op3]);
  
  assert.strictEqual(results[0], 'first');
  assert.strictEqual(results[1], 'second');
  assert.strictEqual(results[2], 'third');
  
  // Should have taken at least 200ms (100ms per operation)
  assert.ok(Date.now() - startTime >= 200);
});

test('Bulkhead should reject when queue is full', async () => {
  const bulkhead = new Bulkhead({ maxConcurrent: 1, maxQueueSize: 1, queueTimeout: 1000 });
  
  // Fill the queue
  const op1 = bulkhead.execute(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return 'first';
  });
  
  const op2 = bulkhead.execute(async () => 'second');
  
  // This should be rejected
  await assert.rejects(async () => {
    await bulkhead.execute(async () => 'third');
  }, /Bulkhead queue is full/);
  
  await Promise.all([op1, op2]);
});

test('Bulkhead should provide correct statistics', async () => {
  const bulkhead = new Bulkhead({ maxConcurrent: 2, maxQueueSize: 5, queueTimeout: 1000 });
  
  const stats = bulkhead.getStats();
  
  assert.strictEqual(stats.availablePermits, 2);
  assert.strictEqual(stats.queueLength, 0);
  assert.strictEqual(stats.maxConcurrent, 2);
  assert.strictEqual(stats.maxQueueSize, 5);
});

test('Bulkhead should check availability correctly', () => {
  const bulkhead = new Bulkhead({ maxConcurrent: 1, maxQueueSize: 2, queueTimeout: 1000 });
  
  assert.strictEqual(bulkhead.isAvailable(), true);
  
  // Fill the queue
  bulkhead.execute(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return 'first';
  });
  
  bulkhead.execute(async () => 'second');
  
  // Should still be available (queue not full)
  assert.strictEqual(bulkhead.isAvailable(), true);
  
  // Fill the queue completely
  bulkhead.execute(async () => 'third');
  
  // Should not be available
  assert.strictEqual(bulkhead.isAvailable(), false);
});

test('Bulkhead should handle operation errors', async () => {
  const bulkhead = new Bulkhead({ maxConcurrent: 1, maxQueueSize: 5, queueTimeout: 1000 });
  
  await assert.rejects(async () => {
    await bulkhead.execute(async () => {
      throw new Error('Operation failed');
    });
  }, /Operation failed/);
  
  // Should still be available after error
  assert.strictEqual(bulkhead.isAvailable(), true);
});

test('Bulkhead should validate configuration', () => {
  assert.throws(() => {
    new Bulkhead({ maxConcurrent: 0, maxQueueSize: 5, queueTimeout: 1000 });
  }, /maxConcurrent must be greater than 0/);
  
  assert.throws(() => {
    new Bulkhead({ maxConcurrent: 1, maxQueueSize: 0, queueTimeout: 1000 });
  }, /maxQueueSize must be greater than 0/);
  
  assert.throws(() => {
    new Bulkhead({ maxConcurrent: 1, maxQueueSize: 5, queueTimeout: 0 });
  }, /queueTimeout must be greater than 0/);
});
