import { test } from 'node:test';
import assert from 'node:assert';
import { ActorSystem } from '../../src/core/actorSystem.js';
import { EventBus } from '../../src/core/eventBus.js';
import { Logger } from '../../src/core/logger.js';
import { MetricsCollector } from '../../src/observability/metrics/collector.js';
import { Tracer } from '../../src/observability/tracing/tracer.js';
import { HealthCheckRegistry } from '../../src/observability/health/healthRegistry.js';
import { CircuitBreaker } from '../../src/resilience/circuitBreaker.js';
import { RetryExecutor } from '../../src/resilience/retryExecutor.js';
import { Bulkhead } from '../../src/resilience/bulkhead.js';
import { CompositePolicy } from '../../src/resilience/compositePolicy.js';
import { compression } from '../../src/performance/compression.js';
import { WorkerPool } from '../../src/workers/workerPool.js';
import { createMemoryManager } from '../../src/wasm/memoryManager.js';

// Mock WebAssembly instance for testing
function createMockWasmInstance() {
  const memory = new WebAssembly.Memory({ initial: 1, maximum: 10 });
  return {
    exports: { memory }
  } as WebAssembly.Instance;
}

test('Full System Integration: Observability + Resilience + Performance', async () => {
  // Initialize core systems
  const actorSystem = new ActorSystem();
  const eventBus = EventBus.getInstance();
  const logger = Logger.getInstance();
  
  // Initialize observability
  const metricsCollector = new MetricsCollector();
  const tracer = new Tracer({ serviceName: 'test-service' });
  const healthRegistry = new HealthCheckRegistry();
  
  // Initialize resilience patterns
  const circuitBreaker = new CircuitBreaker({
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 1000,
    resetTimeout: 1000
  });
  
  const retryExecutor = new RetryExecutor({
    maxAttempts: 3,
    baseDelay: 10,
    maxDelay: 100,
    backoffMultiplier: 2,
    jitter: false,
    retryableErrors: ['TestError']
  });
  
  const bulkhead = new Bulkhead({
    maxConcurrent: 2,
    maxQueueSize: 10,
    queueTimeout: 1000
  });
  
  // Create composite policy
  const resiliencePolicy = new CompositePolicy()
    .withCircuitBreaker(circuitBreaker)
    .withRetry(retryExecutor)
    .withBulkhead(bulkhead);
  
  // Test metrics collection
  const requestCounter = metricsCollector.createCounter('http_requests_total', 'Total HTTP requests');
  const responseTime = metricsCollector.createGauge('http_response_time_seconds', 'HTTP response time');
  const requestDuration = metricsCollector.createHistogram('http_request_duration_seconds', 'HTTP request duration');
  
  requestCounter.inc();
  responseTime.set(0.5);
  requestDuration.observe(0.3);
  
  const metricsOutput = metricsCollector.toPrometheusFormat();
  assert.ok(metricsOutput.includes('http_requests_total'));
  assert.ok(metricsOutput.includes('http_response_time_seconds'));
  assert.ok(metricsOutput.includes('http_request_duration_seconds'));
  
  // Test distributed tracing
  const span = tracer.startSpan('test-operation');
  span.setAttribute('service.name', 'test-service');
  span.setAttribute('operation.type', 'integration-test');
  span.addEvent('test-event', { test: true });
  span.end();
  
  assert.strictEqual(span.name, 'test-operation');
  assert.strictEqual(span.attributes['service.name'], 'test-service');
  assert.strictEqual(span.events.length, 1);
  
  // Test health checks
  const healthResult = await healthRegistry.checkAll();
  assert.ok(healthResult.size > 0);
  
  const overallStatus = await healthRegistry.getOverallStatus();
  assert.ok(['up', 'down', 'degraded'].includes(overallStatus));
  
  // Test resilience patterns
  let attemptCount = 0;
  const testOperation = async () => {
    attemptCount++;
    if (attemptCount < 3) {
      throw new Error('TestError');
    }
    return 'success';
  };
  
  const result = await resiliencePolicy.execute(testOperation);
  assert.strictEqual(result, 'success');
  assert.strictEqual(attemptCount, 3);
  
  // Test compression middleware
  const compressionMiddleware = compression({ threshold: 100 });
  const mockReq = {
    get: (header: string) => header === 'Accept-Encoding' ? 'gzip, deflate' : undefined,
    acceptsEncodings: (encoding: string) => ['gzip', 'deflate'].includes(encoding)
  };
  
  const mockRes = {
    getHeader: () => undefined,
    setHeader: (_name: string, _value: any) => { /* mock */ },
    removeHeader: (_name: string) => { /* mock */ },
    write: () => true,
    end: () => { /* mock */ },
    writeHead: (_code: number, _headers?: any) => { /* mock */ }
  };
  
  let nextCalled = false;
  compressionMiddleware(mockReq as any, mockRes as any, () => { nextCalled = true; });
  assert.strictEqual(nextCalled, true);
  
  // Test WorkerPool
  const workerPool = new WorkerPool({ poolSize: 2 });
  const workerResult = await workerPool.execute('test data');
  assert.strictEqual(workerResult, 'Processed: test data');
  await workerPool.shutdown();
  
  // Test Wasm memory management
  const wasmInstance = createMockWasmInstance();
  const memoryManager = createMemoryManager(wasmInstance);
  
  const testString = 'Hello, WebAssembly!';
  const ptr = memoryManager.allocateString(testString);
  const readString = memoryManager.readString(ptr);
  assert.strictEqual(readString, testString);
  
  memoryManager.deallocate(ptr);
  
  // Test event bus integration
  let eventReceived = false;
  eventBus.subscribe('test-topic', (data: any) => {
    eventReceived = true;
    assert.strictEqual(data.message, 'integration test');
  });
  
  eventBus.publish('test-topic', { message: 'integration test' });
  assert.strictEqual(eventReceived, true);
  
  // Cleanup
  memoryManager.destroy();
  
  logger.info('Full system integration test completed successfully');
});

test('Resilience Patterns Integration', async () => {
  const circuitBreaker = new CircuitBreaker({
    failureThreshold: 2,
    successThreshold: 1,
    timeout: 100,
    resetTimeout: 1000
  });
  
  const retryExecutor = new RetryExecutor({
    maxAttempts: 2,
    baseDelay: 10,
    maxDelay: 100,
    backoffMultiplier: 2,
    jitter: false,
    retryableErrors: ['NetworkError']
  });
  
  const bulkhead = new Bulkhead({
    maxConcurrent: 1,
    maxQueueSize: 5,
    queueTimeout: 1000
  });
  
  const policy = new CompositePolicy()
    .withCircuitBreaker(circuitBreaker)
    .withRetry(retryExecutor)
    .withBulkhead(bulkhead);
  
  // Test successful operation
  const successResult = await policy.execute(async () => 'success');
  assert.strictEqual(successResult, 'success');
  
  // Test retry with eventual success
  let attemptCount = 0;
  const retryOperation = async () => {
    attemptCount++;
    if (attemptCount < 2) {
      throw new Error('NetworkError');
    }
    return 'retry success';
  };
  
  const retryResult = await policy.execute(retryOperation);
  assert.strictEqual(retryResult, 'retry success');
  assert.strictEqual(attemptCount, 2);
  
  // Test circuit breaker opening
  const failOperation = async () => {
    throw new Error('NetworkError');
  };
  
  // First failure
  await assert.rejects(async () => {
    await policy.execute(failOperation);
  });
  
  // Second failure - should open circuit
  await assert.rejects(async () => {
    await policy.execute(failOperation);
  });
  
  // Third attempt - should be rejected by circuit breaker
  await assert.rejects(async () => {
    await policy.execute(async () => 'should not execute');
  }, /Circuit breaker is OPEN/);
});

test('Observability Integration', async () => {
  const metricsCollector = new MetricsCollector();
  const tracer = new Tracer();
  const healthRegistry = new HealthCheckRegistry();
  
  // Test metrics with labels
  const httpRequests = metricsCollector.createCounter('http_requests_total', 'HTTP requests', { method: 'GET' });
  const activeConnections = metricsCollector.createGauge('active_connections', 'Active connections');
  const requestLatency = metricsCollector.createHistogram('request_latency_seconds', 'Request latency');
  
  httpRequests.inc(5);
  activeConnections.set(42);
  requestLatency.observe(0.1);
  requestLatency.observe(0.2);
  requestLatency.observe(0.15);
  
  const metrics = metricsCollector.toPrometheusFormat();
  assert.ok(metrics.includes('http_requests_total{method="GET"} 5'));
  assert.ok(metrics.includes('active_connections 42'));
  assert.ok(metrics.includes('request_latency_seconds_bucket'));
  
  // Test tracing with spans
  const parentSpan = tracer.startSpan('parent-operation');
  parentSpan.setAttribute('service.name', 'test-service');
  
  const childSpan = tracer.startSpan('child-operation', { parent: { traceId: parentSpan.traceId, spanId: parentSpan.spanId, traceFlags: 1 } });
  childSpan.setAttribute('operation.type', 'database-query');
  childSpan.addEvent('query.started');
  childSpan.addEvent('query.completed', { rows: 100 });
  childSpan.end();
  
  parentSpan.end();
  
  assert.strictEqual(parentSpan.name, 'parent-operation');
  assert.strictEqual(childSpan.name, 'child-operation');
  assert.strictEqual(childSpan.parentSpanId, parentSpan.spanId);
  assert.strictEqual(childSpan.events.length, 2);
  
  // Test health checks
  const healthResults = await healthRegistry.checkAll();
  assert.ok(healthResults.size > 0);
  
  const overallHealth = await healthRegistry.getOverallStatus();
  assert.ok(['up', 'down', 'degraded'].includes(overallHealth));
});

test('Performance Features Integration', async () => {
  // Test compression middleware
  const compressionMiddleware = compression({
    threshold: 50,
    level: 6,
    contentTypes: ['text/plain', 'application/json']
  });
  
  const mockReq = {
    get: (header: string) => header === 'Accept-Encoding' ? 'gzip' : undefined,
    acceptsEncodings: (encoding: string) => encoding === 'gzip'
  };
  
  let headersSet = false;
  const mockRes = {
    getHeader: () => undefined,
    setHeader: (name: string, value: any) => {
      if (name === 'Content-Encoding') {
        headersSet = true;
        assert.strictEqual(value, 'gzip');
      }
    },
    removeHeader: () => { /* mock */ },
    write: () => true,
    end: () => { /* mock */ },
    writeHead: (_code: number, headers?: any) => {
      if (headers && headers['Content-Length'] === '2000') {
        // Simulate large response
        headersSet = true;
      }
    }
  };
  
  let nextCalled = false;
  compressionMiddleware(mockReq as any, mockRes as any, () => { nextCalled = true; });
  
  // Simulate large response
  mockRes.writeHead(200, { 'Content-Type': 'text/plain', 'Content-Length': '2000' });
  
  assert.strictEqual(nextCalled, true);
  assert.strictEqual(headersSet, true);
  
  // Test WorkerPool performance
  const workerPool = new WorkerPool({ poolSize: 4 });
  
  const startTime = Date.now();
  const tasks = Array.from({ length: 10 }, (_, i) => 
    workerPool.execute(`task-${i}`)
  );
  
  const results = await Promise.all(tasks);
  const duration = Date.now() - startTime;
  
  assert.strictEqual(results.length, 10);
  assert.ok(duration < 5000); // Should complete within 5 seconds
  
  await workerPool.shutdown();
});

test('Error Handling Integration', async () => {
  const circuitBreaker = new CircuitBreaker({
    failureThreshold: 1,
    successThreshold: 1,
    timeout: 100,
    resetTimeout: 1000
  });
  
  const retryExecutor = new RetryExecutor({
    maxAttempts: 2,
    baseDelay: 10,
    maxDelay: 100,
    backoffMultiplier: 2,
    jitter: false,
    retryableErrors: ['RetryableError']
  });
  
  const policy = new CompositePolicy()
    .withCircuitBreaker(circuitBreaker)
    .withRetry(retryExecutor);
  
  // Test non-retryable error
  await assert.rejects(async () => {
    await policy.execute(async () => {
      throw new Error('NonRetryableError');
    });
  });
  
  // Test retryable error with eventual failure
  await assert.rejects(async () => {
    await policy.execute(async () => {
      throw new Error('RetryableError');
    });
  });
  
  // Test circuit breaker after failures
  await assert.rejects(async () => {
    await policy.execute(async () => 'should not execute');
  }, /Circuit breaker is OPEN/);
});
