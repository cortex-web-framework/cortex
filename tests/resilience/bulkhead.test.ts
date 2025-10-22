import { test } from 'node:test';
import assert from 'node:assert';
import { Bulkhead } from '../../src/resilience/bulkhead.js';

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

  const op1 = bulkhead.execute(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return 'first';
  });

  const op2 = bulkhead.execute(async () => {
    await new Promise(resolve => setTimeout(resolve, 50)); // Shorter delay
    return 'second';
  });

  const op3 = bulkhead.execute(async () => {
    return 'third';
  });

  const results = await Promise.all([op1, op2, op3]);

  assert.deepStrictEqual(results, ['first', 'second', 'third'], 'Operations should complete in order');
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
  }, /Semaphore waiting queue is full/);
  
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

test('Bulkhead should check availability correctly', async () => {
  const bulkhead = new Bulkhead({ maxConcurrent: 1, maxQueueSize: 2, queueTimeout: 1000 });

  assert.strictEqual(bulkhead.isAvailable(), true);

  // Fill the queue
  const op1 = bulkhead.execute(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return 'first';
  });

  const op2 = bulkhead.execute(async () => 'second');

  // Wait for op1 to acquire the permit, so op2 is queued
  await new Promise(resolve => setTimeout(resolve, 10));

  // Now op2 should be in the queue, so isAvailable should still be true
  assert.strictEqual(bulkhead.isAvailable(), true);

  // Fill the queue completely
  const op3 = bulkhead.execute(async () => 'third');

  // Now op3 should be rejected, so isAvailable should be false
  await new Promise(resolve => setTimeout(resolve, 10));

  assert.strictEqual(bulkhead.isAvailable(), false);

  await Promise.allSettled([op1, op2, op3]);
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
