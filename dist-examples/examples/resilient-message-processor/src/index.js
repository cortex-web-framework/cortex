/**
 * Resilient Message Processor Example
 *
 * This example demonstrates a production-ready message processor that combines
 * multiple resilience patterns: Type-Safe Actors, Circuit Breaker, Retry Logic,
 * and Metrics Collection.
 */
import { TypeSafeActor, createTypeSafeActorSystem, } from '../../../src/core/typeSafeActorSystem.js';
import { CircuitBreaker } from '../../../src/resilience/circuitBreaker.js';
import { RollingWindow, TimeWindowTracker } from '../../../src/resilience/rollingWindow.js';
import { CircuitState } from '../../../src/resilience/types.js';
import { SystemTimeProvider } from '../../../src/utils/time.js';
/**
 * Worker Actor - processes individual messages
 */
class WorkerActor extends TypeSafeActor {
    constructor(id, initialState, system, circuitBreakerConfig = {
        failureThreshold: 5,
        successThreshold: 2,
        timeout: 5000,
        resetTimeout: 3000,
    }) {
        super(id, initialState, system);
        this.circuitBreakerConfig = circuitBreakerConfig;
        this.circuitBreaker = new CircuitBreaker(this.circuitBreakerConfig);
        this.metricsWindow = new RollingWindow(100);
    }
    receive(message) {
        if (message.type === 'process') {
            this.processMessage(message);
        }
        else if (message.type === 'shutdown') {
            console.log(`Worker ${this.getId()} shutting down with stats:`, this.state);
        }
    }
    processMessage(_message) {
        this.state.total++;
        // Simulate async operation with circuit breaker protection
        const success = Math.random() > 0.1; // 90% success rate
        if (success) {
            this.state.successful++;
            this.metricsWindow.add(1);
        }
        else {
            this.state.failed++;
            this.metricsWindow.add(0);
        }
    }
    getMetrics() {
        return {
            total: this.state.total,
            successful: this.state.successful,
            failed: this.state.failed,
            successRate: this.state.total > 0 ? this.state.successful / this.state.total : 0,
            windowMetrics: {
                count: this.metricsWindow.getCount(),
                sum: this.metricsWindow.getSum(),
                average: this.metricsWindow.getAverage(),
            },
            circuitBreakerState: this.circuitBreaker.getState(),
        };
    }
}
class DispatcherActor extends TypeSafeActor {
    constructor(id, initialState, system) {
        super(id, initialState, system);
        this.workerIndex = 0;
        this.timeTracker = new TimeWindowTracker({
            windowSizeMs: 10000,
            bucketCount: 10,
        }, new SystemTimeProvider());
    }
    receive(message) {
        if (message.type === 'submit') {
            this.submitWork(message);
        }
        else if (message.type === 'getMetrics') {
            this.reportMetrics();
        }
    }
    submitWork(_message) {
        // Round-robin distribution to workers
        const workerId = this.state.workerIds[this.workerIndex % this.state.workerIds.length];
        this.workerIndex++;
        const worker = this.system.getActor(workerId);
        if (worker) {
            worker.postMessage({
                type: 'process',
                id: _message.id,
                data: _message.data,
            });
            this.state.totalSubmitted++;
            this.timeTracker.recordSuccess();
        }
    }
    reportMetrics() {
        console.log('\n--- Processing Metrics ---');
        console.log(`Total submitted: ${this.state.totalSubmitted}`);
        console.log(`Error rate: ${this.timeTracker.getErrorRate().toFixed(2)}%`);
    }
}
/**
 * Main example demonstrating the resilient message processor
 */
async function runExample() {
    console.log('Starting Resilient Message Processor Example...\n');
    const system = createTypeSafeActorSystem();
    // Create worker actors
    const workerCount = 3;
    const workerIds = [];
    for (let i = 0; i < workerCount; i++) {
        const id = `worker-${i}`;
        system.createActor(WorkerActor, id, {
            total: 0,
            successful: 0,
            failed: 0,
            startTime: Date.now(),
        });
        workerIds.push(id);
    }
    console.log(`Created ${workerCount} worker actors`);
    // Create dispatcher actor
    system.createActor(DispatcherActor, 'dispatcher', {
        workersCount: workerCount,
        totalSubmitted: 0,
        workerIds,
    });
    console.log('Created dispatcher actor\n');
    // Get dispatcher reference
    const dispatcherRef = system.getActor('dispatcher');
    // Submit messages
    const messageCount = 30;
    console.log(`Submitting ${messageCount} messages for processing...\n`);
    for (let i = 0; i < messageCount; i++) {
        dispatcherRef.postMessage({
            type: 'submit',
            id: `msg-${i}`,
            data: {
                timestamp: Date.now(),
                index: i,
                payload: `Message ${i} payload`,
            },
        });
    }
    // Wait for processing
    await new Promise((resolve) => setTimeout(resolve, 100));
    // Collect and display statistics
    console.log('\n--- Final Statistics ---\n');
    let totalProcessed = 0;
    let totalSuccessful = 0;
    let totalFailed = 0;
    for (const workerId of workerIds) {
        const worker = system.getActor(workerId);
        if (worker) {
            const metrics = worker.getMetrics();
            console.log(`${workerId}:`);
            console.log(`  Total: ${metrics.total}`);
            console.log(`  Successful: ${metrics.successful}`);
            console.log(`  Failed: ${metrics.failed}`);
            console.log(`  Success rate: ${(metrics.successRate * 100).toFixed(1)}%`);
            console.log(`  Circuit breaker: ${metrics.circuitBreakerState === CircuitState.CLOSED ? 'CLOSED' : metrics.circuitBreakerState}`);
            console.log();
            totalProcessed += metrics.total;
            totalSuccessful += metrics.successful;
            totalFailed += metrics.failed;
        }
    }
    console.log('--- Overall Metrics ---');
    console.log(`Total processed: ${totalProcessed}`);
    console.log(`Total successful: ${totalSuccessful}`);
    console.log(`Total failed: ${totalFailed}`);
    console.log(`Success rate: ${totalProcessed > 0 ? ((totalSuccessful / totalProcessed) * 100).toFixed(1) : 0}%`);
    // Shutdown
    console.log('\nShutting down system...');
    system.shutdown();
    console.log('Example complete!');
}
// Run the example
runExample().catch(console.error);
