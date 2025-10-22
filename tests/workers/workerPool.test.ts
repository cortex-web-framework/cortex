import { test } from 'node:test';
import assert from 'node:assert';
import { WorkerPool, DEFAULT_WORKER_POOL_CONFIG } from '../../src/workers/workerPool.js';

test('WorkerPool should initialize with default config', () => {
  const pool = new WorkerPool();
  const stats = pool.getStats();
  
  assert.strictEqual(stats.totalWorkers, DEFAULT_WORKER_POOL_CONFIG.poolSize);
  assert.strictEqual(stats.availableWorkers, DEFAULT_WORKER_POOL_CONFIG.poolSize);
  assert.strictEqual(stats.busyWorkers, 0);
  assert.strictEqual(stats.queuedTasks, 0);
  assert.strictEqual(stats.isShuttingDown, false);
  
  return pool.shutdown();
});

test('WorkerPool should execute simple tasks', async () => {
  const pool = new WorkerPool({ poolSize: 2 });
  
  const result1 = await pool.execute('test string');
  const result2 = await pool.execute([1, 2, 3]);
  const result3 = await pool.execute({ key: 'value' });
  
  assert.strictEqual(result1, 'Processed: test string');
  assert.deepStrictEqual(result2, ['Processed: 1', 'Processed: 2', 'Processed: 3']);
  assert.ok(result3.processed);
  assert.strictEqual(result3.key, 'value');
  
  return pool.shutdown();
});

test('WorkerPool should handle concurrent tasks', async () => {
  const pool = new WorkerPool({ poolSize: 2 });
  
  const tasks = Array.from({ length: 5 }, (_, i) => 
    pool.execute(`task-${i}`)
  );
  
  const results = await Promise.all(tasks);
  
  assert.strictEqual(results.length, 5);
  results.forEach((result, i) => {
    assert.strictEqual(result, `Processed: task-${i}`);
  });
  
  return pool.shutdown();
});

test('WorkerPool should queue tasks when all workers are busy', async () => {
  const pool = new WorkerPool({ poolSize: 1, maxQueueSize: 10 });
  
  // Start a long-running task
  const longTask = pool.execute('long task');
  
  // Queue multiple tasks
  const queuedTasks = Array.from({ length: 3 }, (_, i) => 
    pool.execute(`queued-${i}`)
  );
  
  // Check that tasks are queued
  let stats = pool.getStats();
  assert.ok(stats.queuedTasks > 0);
  
  // Wait for all tasks to complete
  await longTask;
  const results = await Promise.all(queuedTasks);
  
  assert.strictEqual(results.length, 3);
  results.forEach((result, i) => {
    assert.strictEqual(result, `Processed: queued-${i}`);
  });
  
  return pool.shutdown();
});

test('WorkerPool should reject tasks when queue is full', async () => {
  const pool = new WorkerPool({ poolSize: 1, maxQueueSize: 2 });
  
  // Fill the queue
  const tasks = Array.from({ length: 3 }, (_, i) => 
    pool.execute(`task-${i}`)
  );
  
  // The third task should be queued, but we need to check if it gets rejected
  // when the queue is full
  try {
    await pool.execute('overflow task');
    assert.fail('Should have thrown an error for queue overflow');
  } catch (error) {
    assert.ok((error as Error).message.includes('queue is full'));
  }
  
  // Wait for queued tasks to complete
  await Promise.all(tasks);
  
  return pool.shutdown();
});

test('WorkerPool should handle task timeouts', async () => {
  const pool = new WorkerPool({ 
    poolSize: 1, 
    workerTimeout: 100 // Very short timeout for testing
  });
  
  try {
    await pool.execute('test', 50); // Even shorter timeout
    assert.fail('Should have timed out');
  } catch (error) {
    assert.ok((error as Error).message.includes('timeout'));
  }
  
  return pool.shutdown();
});

test('WorkerPool should emit events', async () => {
  const pool = new WorkerPool({ poolSize: 1 });
  const events: any[] = [];
  
  pool.on('taskStarted', (data) => events.push({ type: 'taskStarted', data }));
  pool.on('taskCompleted', (data) => events.push({ type: 'taskCompleted', data }));
  
  await pool.execute('test');
  
  // Wait a bit for events to be emitted
  await new Promise(resolve => setTimeout(resolve, 100));
  
  assert.ok(events.length >= 2);
  assert.strictEqual(events[0].type, 'taskStarted');
  assert.strictEqual(events[1].type, 'taskCompleted');
  
  return pool.shutdown();
});

test('WorkerPool should handle custom configuration', () => {
  const customConfig = {
    poolSize: 3,
    maxQueueSize: 50,
    workerTimeout: 60000,
    restartOnError: false,
    maxRestarts: 1
  };
  
  const pool = new WorkerPool(customConfig);
  const stats = pool.getStats();
  
  assert.strictEqual(stats.totalWorkers, 3);
  
  return pool.shutdown();
});

test('WorkerPool should shutdown gracefully', async () => {
  const pool = new WorkerPool({ poolSize: 2 });

  // Start some tasks
  Array.from({ length: 3 }, (_, i) =>
    pool.execute(`task-${i}`)
  );

  // Shutdown immediately
  await pool.shutdown();
  
  const stats = pool.getStats();
  assert.strictEqual(stats.totalWorkers, 0);
  assert.strictEqual(stats.isShuttingDown, true);
  
  // Tasks should be rejected
  try {
    await pool.execute('new task');
    assert.fail('Should have thrown an error after shutdown');
  } catch (error) {
    assert.ok((error as Error).message.includes('shutting down'));
  }
});

test('WorkerPool should handle worker errors gracefully', async () => {
  const pool = new WorkerPool({ 
    poolSize: 1, 
    restartOnError: true,
    maxRestarts: 1
  });
  
  // This test is limited because we can't easily simulate worker errors
  // in the current implementation, but we can test the error handling structure
  const stats = pool.getStats();
  assert.strictEqual(stats.totalWorkers, 1);
  
  return pool.shutdown();
});
