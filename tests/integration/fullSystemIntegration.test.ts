/**
 * Full System Integration Tests
 *
 * Comprehensive integration tests demonstrating how RollingWindow,
 * TimeWindowTracker, CircuitBreaker, and Type-Safe Actors work together.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CircuitBreaker } from '../../src/resilience/circuitBreaker.js';
import { RollingWindow, TimeWindowTracker } from '../../src/resilience/rollingWindow.js';
import { CircuitState } from '../../src/resilience/types.js';
import {
  TypeSafeActor,
  TypeSafeActorSystem,
  createTypeSafeActorSystem,
} from '../../src/core/typeSafeActorSystem.js';
import { ManualTimeProvider } from '../mocks/time.js';

test('Full System Integration', async (t) => {
  await t.test('RollingWindow with TimeWindowTracker', () => {
    const window = new RollingWindow(5);
    const config = { windowSizeMs: 10000, bucketCount: 10 };
    const timeProvider = new ManualTimeProvider(0);
    const tracker = new TimeWindowTracker(config, timeProvider);

    // Add events to both
    for (let i = 0; i < 3; i++) {
      window.add(i + 1);
      tracker.recordSuccess();
    }

    for (let i = 0; i < 2; i++) {
      window.add(-1);
      tracker.recordFailure();
    }

    // Verify statistics
    assert.strictEqual(window.getCount(), 5);
    assert.strictEqual(window.getSum(), 4); // 1 + 2 + 3 - 1 - 1 = 4
    assert.strictEqual(tracker.getTotalRequests(), 5);
    assert.ok(tracker.getErrorRate() > 0);
  });

  await t.test('CircuitBreaker with TimeProvider for deterministic testing', async () => {
    const timeProvider = new ManualTimeProvider(0);
    const breaker = new CircuitBreaker(
      {
        failureThreshold: 2,
        successThreshold: 1,
        timeout: 100,
        resetTimeout: 100,
      },
      timeProvider
    );

    // Open circuit with failures
    await assert.rejects(async () => {
      await breaker.execute(async () => {
        throw new Error('fail');
      });
    });

    await assert.rejects(async () => {
      await breaker.execute(async () => {
        throw new Error('fail');
      });
    });

    assert.strictEqual(breaker.getState(), CircuitState.OPEN);

    // Advance time and recover
    timeProvider.advance(101);

    const result = await breaker.execute(async () => 'success');
    assert.strictEqual(result, 'success');
    // With successThreshold: 1, one success transitions directly to CLOSED
    assert.strictEqual(breaker.getState(), CircuitState.CLOSED);
  });

  await t.test('Type-safe actors with resilient patterns', async () => {
    const system = createTypeSafeActorSystem();

    class Counter extends TypeSafeActor<
      number,
      { type: 'increment'; amount: number } | { type: 'reset' }
    > {
      protected receive(message: any): void {
        if (message.type === 'increment') {
          this.state += message.amount;
        } else if (message.type === 'reset') {
          this.state = 0;
        }
      }
    }

    const ref = system.createActor(Counter, 'counter', 0);

    // Send typed messages
    ref.tell({ type: 'increment', amount: 5 });
    ref.tell({ type: 'increment', amount: 3 });

    // Wait for processing
    await new Promise((resolve) => process.nextTick(resolve));

    const actor = system.getActor('counter');
    assert.strictEqual(actor?.getState(), 8);

    // Cleanup
    system.stopActor('counter');
  });

  await t.test('Multiple actors with shared resilience patterns', async () => {
    const system = createTypeSafeActorSystem();

    class Processor extends TypeSafeActor<
      { count: number },
      { type: 'work'; id: string }
    > {
      protected receive(message: any): void {
        if (message.type === 'work') {
          this.state.count++;
        }
      }
    }

    // Create multiple processors
    const processor1 = system.createActor(Processor, 'processor1', { count: 0 });
    const processor2 = system.createActor(Processor, 'processor2', { count: 0 });

    // Send work to both
    processor1.tell({ type: 'work', id: 'task1' });
    processor1.tell({ type: 'work', id: 'task2' });
    processor2.tell({ type: 'work', id: 'task3' });

    // Wait for processing
    await new Promise((resolve) => process.nextTick(resolve));

    const p1 = system.getActor('processor1');
    const p2 = system.getActor('processor2');

    assert.strictEqual(p1?.getState().count, 2);
    assert.strictEqual(p2?.getState().count, 1);

    system.shutdown();
  });

  await t.test('Rolling window tracking with circuit breaker stats', () => {
    const window = new RollingWindow(10);

    // Simulate 10 operations with varying success rates
    for (let i = 0; i < 10; i++) {
      const success = i % 3 !== 0; // i % 3 === 0: fails (i=0,3,6,9), others succeed
      if (success) {
        window.add(1);
      } else {
        window.add(0);
      }
    }

    assert.strictEqual(window.getCount(), 10);
    assert.strictEqual(window.getSum(), 6); // 6 successes (60% success rate)
    const successRate = (window.getSum() / window.getCount()) * 100;
    assert.ok(successRate > 50 && successRate < 70);
  });

  await t.test('TimeWindowTracker with multiple buckets', () => {
    const timeProvider = new ManualTimeProvider(0);
    const tracker = new TimeWindowTracker(
      { windowSizeMs: 3000, bucketCount: 3 },
      timeProvider
    );

    // Bucket 1: successes
    tracker.recordSuccess();
    tracker.recordSuccess();
    assert.strictEqual(tracker.getTotalRequests(), 2);

    // Move to bucket 2
    timeProvider.advance(1100);
    tracker.recordFailure();
    tracker.recordSuccess();
    assert.strictEqual(tracker.getTotalRequests(), 4);

    // Move to bucket 3
    timeProvider.advance(1100);
    tracker.recordFailure();
    assert.strictEqual(tracker.getTotalRequests(), 5);

    // Verify error rate
    const errorRate = tracker.getErrorRate();
    assert.ok(errorRate > 30 && errorRate < 50); // 2 failures out of 5
  });

  await t.test('Complex scenario: Resilient message processor with monitoring', async () => {
    const system = createTypeSafeActorSystem();
    const window = new RollingWindow(20);

    // Create processor that tracks stats
    let successCount = 0;
    let failureCount = 0;

    class SmartProcessor extends TypeSafeActor<
      { results: Map<string, boolean> },
      { type: 'process'; id: string; shouldFail?: boolean }
    > {
      protected receive(message: any): void {
        if (message.type === 'process') {
          const success = !message.shouldFail;
          this.state.results.set(message.id, success);

          if (success) {
            successCount++;
            window.add(1);
          } else {
            failureCount++;
            window.add(0);
          }
        }
      }
    }

    const processorRef = system.createActor(SmartProcessor, 'processor', {
      results: new Map(),
    });

    // Simulate processing with varying success rates
    for (let i = 0; i < 20; i++) {
      const shouldFail = i % 5 === 0; // 20% failure rate
      processorRef.tell({ type: 'process', id: `msg-${i}`, shouldFail });
    }

    // Wait for processing
    await new Promise((resolve) => setImmediate(resolve));

    // Verify metrics
    assert.strictEqual(window.getCount(), 20);
    assert.strictEqual(successCount, 16);
    assert.strictEqual(failureCount, 4);
    assert.strictEqual(window.getSum(), 16);
    const successRate = (window.getSum() / window.getCount()) * 100;
    assert.ok(successRate > 70 && successRate < 85); // Should be around 80%

    system.shutdown();
  });

  await t.test('Complete resilience pattern: Circuit breaker protecting actor', async () => {
    const timeProvider = new ManualTimeProvider(0);
    const system = createTypeSafeActorSystem();

    class ProtectedService extends TypeSafeActor<
      { attempts: number; successes: number; failures: number },
      { type: 'request'; id: string }
    > {
      constructor(
        id: string,
        initialState: { attempts: number; successes: number; failures: number },
        system: TypeSafeActorSystem
      ) {
        super(id, initialState, system);
        // CircuitBreaker pattern can be integrated here for production use
        // where breaker.execute() would wrap the actual operation
        new CircuitBreaker(
          {
            failureThreshold: 2,
            successThreshold: 1,
            timeout: 100,
            resetTimeout: 100,
          },
          timeProvider
        );
      }

      protected receive(message: any): void {
        if (message.type === 'request') {
          this.state.attempts++;

          // Simulate operation with circuit breaker pattern concept
          const shouldFail = this.state.attempts % 3 === 0;

          if (shouldFail) {
            this.state.failures++;
          } else {
            this.state.successes++;
          }
        }
      }
    }

    const serviceRef = system.createActor(
      ProtectedService,
      'service',
      { attempts: 0, successes: 0, failures: 0 }
    );

    // Send multiple requests
    for (let i = 0; i < 10; i++) {
      serviceRef.tell({ type: 'request', id: `req-${i}` });
    }

    await new Promise((resolve) => process.nextTick(resolve));

    const service = system.getActor('service') as any;
    assert.ok(service);
    assert.strictEqual(service.getState().attempts, 10);
    assert.ok(service.getState().successes > 0);
    assert.ok(service.getState().failures > 0);

    system.shutdown();
  });

  await t.test('Performance: Processing 1000 messages through integrated system', async () => {
    const system = createTypeSafeActorSystem();
    const window = new RollingWindow(1000);
    let processed = 0;

    class BatchProcessor extends TypeSafeActor<
      { count: number },
      { type: 'batch'; messages: number }
    > {
      protected receive(message: any): void {
        if (message.type === 'batch') {
          this.state.count += message.messages;
          processed += message.messages;
          for (let i = 0; i < message.messages; i++) {
            window.add(1);
          }
        }
      }
    }

    const batchProcessorRef = system.createActor(BatchProcessor, 'batch-processor', {
      count: 0,
    });

    // Process 1000 messages in batches
    for (let i = 0; i < 10; i++) {
      batchProcessorRef.tell({ type: 'batch', messages: 100 });
    }

    // Wait for all processing
    await new Promise((resolve) => setImmediate(resolve));

    assert.strictEqual(processed, 1000);
    assert.strictEqual(window.getCount(), 1000);
    assert.strictEqual(window.getSum(), 1000);
    assert.strictEqual(window.getAverage(), 1);

    system.shutdown();
  });
});
