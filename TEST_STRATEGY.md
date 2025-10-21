# Cortex Framework - Comprehensive Test Strategy

## Executive Summary

This document outlines the comprehensive testing strategy for the Cortex Actor Framework, with a focus on three priority areas:
1. Observability & Monitoring
2. Resilience & Reliability
3. Fix Existing Placeholders (Compression, WorkerPool, Wasm)

**Key Principles:**
- Zero external testing dependencies (use Node.js built-in `assert` and `node:test`)
- TDD-first approach (tests before implementation)
- 90%+ code coverage target
- Fast test execution (< 5 seconds for unit test suite)
- Isolated tests with no side effects
- Real-world scenario testing

## Table of Contents

1. [Testing Pyramid](#testing-pyramid)
2. [Priority 1: Observability & Monitoring](#priority-1-observability--monitoring)
3. [Priority 2: Resilience & Reliability](#priority-2-resilience--reliability)
4. [Priority 3: Fix Existing Placeholders](#priority-3-fix-existing-placeholders)
5. [Test Coverage Targets](#test-coverage-targets)
6. [Test Tools & Frameworks](#test-tools--frameworks)
7. [Test Data & Fixtures](#test-data--fixtures)
8. [CI/CD Integration](#cicd-integration)
9. [Test Code Examples](#test-code-examples)

---

## Testing Pyramid

```
                    /\
                   /  \
                  /E2E \         10% - End-to-End (Full system scenarios)
                 /------\
                /        \
               /Integration\     30% - Integration (Module interactions)
              /------------\
             /              \
            /  Unit Tests    \   60% - Unit Tests (Individual components)
           /------------------\
```

### Test Distribution
- **Unit Tests (60%)**: 150-200 tests
  - Individual function/method testing
  - Isolated component behavior
  - Edge cases and error conditions
  - Fast execution (< 3 seconds total)

- **Integration Tests (30%)**: 75-100 tests
  - Module interaction testing
  - ActorSystem + EventBus integration
  - HTTP server + middleware integration
  - Moderate execution time (< 5 seconds total)

- **End-to-End Tests (10%)**: 25-35 tests
  - Full system scenarios
  - Real-world use cases
  - Performance benchmarks
  - Acceptable execution time (< 10 seconds total)

---

## Priority 1: Observability & Monitoring

### Overview
Implement comprehensive observability following OpenTelemetry standards with metrics, traces, and structured logging.

### 1.1 Metrics Collection

#### Components to Test

**MetricsRegistry**
```typescript
interface MetricsRegistry {
  counter(name: string, labels?: Record<string, string>): Counter;
  gauge(name: string, labels?: Record<string, string>): Gauge;
  histogram(name: string, buckets?: number[], labels?: Record<string, string>): Histogram;
  collect(): string; // Prometheus format
}
```

**Test Scenarios:**
1. ✓ Counter increments correctly
2. ✓ Counter with labels creates separate time series
3. ✓ Gauge sets and reports current value
4. ✓ Gauge can increase/decrease
5. ✓ Histogram observes values and buckets correctly
6. ✓ Histogram calculates sum and count
7. ✓ Metrics export in Prometheus format
8. ✓ Label validation (no duplicate labels)
9. ✓ Metric name validation (alphanumeric + underscore)
10. ✓ Thread-safety for concurrent metric updates

**Performance Requirements:**
- Counter increment: < 1μs
- Histogram observation: < 5μs
- Full metrics collection: < 10ms

#### Test Pattern: Counter
```typescript
// tests/observability/metrics.test.ts
import { test } from 'node:test';
import assert from 'node:assert';
import { MetricsRegistry, Counter } from '../../src/observability/metrics';

test('Counter should increment by 1 by default', () => {
  const registry = new MetricsRegistry();
  const counter = registry.counter('test_counter');

  counter.inc();
  assert.strictEqual(counter.value(), 1);

  counter.inc();
  assert.strictEqual(counter.value(), 2);
});

test('Counter should increment by specified value', () => {
  const registry = new MetricsRegistry();
  const counter = registry.counter('test_counter');

  counter.inc(5);
  assert.strictEqual(counter.value(), 5);
});

test('Counter with labels should create separate time series', () => {
  const registry = new MetricsRegistry();
  const counter = registry.counter('http_requests', { method: 'GET' });
  const counter2 = registry.counter('http_requests', { method: 'POST' });

  counter.inc();
  counter2.inc(2);

  assert.strictEqual(counter.value(), 1);
  assert.strictEqual(counter2.value(), 2);
});

test('Counter should export in Prometheus format', () => {
  const registry = new MetricsRegistry();
  const counter = registry.counter('test_total', { service: 'api' });
  counter.inc(42);

  const output = registry.collect();
  assert.ok(output.includes('# HELP test_total'));
  assert.ok(output.includes('# TYPE test_total counter'));
  assert.ok(output.includes('test_total{service="api"} 42'));
});
```

#### Test Pattern: Histogram
```typescript
test('Histogram should bucket observations correctly', () => {
  const registry = new MetricsRegistry();
  const histogram = registry.histogram('request_duration', [0.1, 0.5, 1, 5]);

  histogram.observe(0.05);  // < 0.1
  histogram.observe(0.3);   // < 0.5
  histogram.observe(0.8);   // < 1
  histogram.observe(3);     // < 5
  histogram.observe(10);    // > 5

  const metrics = histogram.toPrometheusFormat();
  assert.ok(metrics.includes('le="0.1"} 1'));
  assert.ok(metrics.includes('le="0.5"} 2'));
  assert.ok(metrics.includes('le="1"} 3'));
  assert.ok(metrics.includes('le="5"} 4'));
  assert.ok(metrics.includes('le="+Inf"} 5'));
  assert.ok(metrics.includes('_sum 14.15'));
  assert.ok(metrics.includes('_count 5'));
});
```

### 1.2 Trace Context Propagation

#### Components to Test

**TraceContext**
```typescript
interface TraceContext {
  traceId: string;      // 128-bit hex
  spanId: string;       // 64-bit hex
  traceFlags: number;   // Sampled flag
  traceState?: string;
}

interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  kind: SpanKind;
  startTime: number;
  endTime?: number;
  attributes: Record<string, AttributeValue>;
  events: SpanEvent[];
  status: SpanStatus;

  setAttribute(key: string, value: AttributeValue): void;
  addEvent(name: string, attributes?: Record<string, AttributeValue>): void;
  end(): void;
}
```

**Test Scenarios:**
1. ✓ Generate valid trace ID (128-bit)
2. ✓ Generate valid span ID (64-bit)
3. ✓ Parse W3C traceparent header
4. ✓ Format W3C traceparent header
5. ✓ Propagate trace context across actor messages
6. ✓ Create child spans with parent relationship
7. ✓ Span attributes follow semantic conventions
8. ✓ Span events recorded with timestamps
9. ✓ Span status set correctly (OK, ERROR)
10. ✓ Context extraction from HTTP headers
11. ✓ Context injection into HTTP headers
12. ✓ Invalid traceparent header handling

#### Test Pattern: Trace Context
```typescript
test('TraceContext should generate valid trace ID', () => {
  const ctx = TraceContext.generate();

  assert.strictEqual(ctx.traceId.length, 32, 'Trace ID should be 32 hex chars');
  assert.ok(/^[0-9a-f]{32}$/.test(ctx.traceId), 'Trace ID should be valid hex');
});

test('TraceContext should parse W3C traceparent header', () => {
  const header = '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01';
  const ctx = TraceContext.fromTraceparent(header);

  assert.strictEqual(ctx.traceId, '4bf92f3577b34da6a3ce929d0e0e4736');
  assert.strictEqual(ctx.spanId, '00f067aa0ba902b7');
  assert.strictEqual(ctx.traceFlags, 0x01);
});

test('Span should create parent-child relationship', () => {
  const tracer = new Tracer();
  const parentSpan = tracer.startSpan('parent-operation');
  const childSpan = tracer.startSpan('child-operation', { parent: parentSpan });

  assert.strictEqual(childSpan.traceId, parentSpan.traceId);
  assert.strictEqual(childSpan.parentSpanId, parentSpan.spanId);
  assert.notStrictEqual(childSpan.spanId, parentSpan.spanId);
});
```

#### Test Pattern: Actor Trace Propagation
```typescript
test('Actor should propagate trace context in messages', async () => {
  const tracer = new Tracer();
  const span = tracer.startSpan('test-operation');

  const eventBus = EventBus.getInstance();
  const system = new ActorSystem(eventBus);
  const actor = system.createActor(TracedTestActor, 'traced-actor');

  // Dispatch message with trace context
  system.dispatch('traced-actor', {
    type: 'TEST_MESSAGE',
    data: 'hello',
    traceContext: span.context()
  });

  await new Promise(resolve => setTimeout(resolve, 100));

  const receivedCtx = actor.lastReceivedContext;
  assert.strictEqual(receivedCtx.traceId, span.context().traceId);
});
```

### 1.3 Health Check System

#### Components to Test

**HealthCheck**
```typescript
interface HealthCheck {
  name: string;
  check(): Promise<HealthStatus>;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  details?: Record<string, any>;
  timestamp: number;
}

interface HealthAggregator {
  registerCheck(check: HealthCheck): void;
  checkAll(): Promise<AggregatedHealth>;
}
```

**Test Scenarios:**
1. ✓ Individual health check returns status
2. ✓ Health check timeout handling
3. ✓ Aggregate multiple health checks
4. ✓ Overall status calculation (all healthy, one degraded, one unhealthy)
5. ✓ Health check caching (avoid frequent checks)
6. ✓ Health check dependencies
7. ✓ Liveness vs readiness probes
8. ✓ HTTP endpoint integration (/health, /ready)

#### Test Pattern: Health Checks
```typescript
test('HealthCheck should return healthy status', async () => {
  const check = new DatabaseHealthCheck(mockDb);
  const status = await check.check();

  assert.strictEqual(status.status, 'healthy');
  assert.ok(status.timestamp > 0);
});

test('HealthAggregator should calculate overall status correctly', async () => {
  const aggregator = new HealthAggregator();

  aggregator.registerCheck(new AlwaysHealthyCheck('service-1'));
  aggregator.registerCheck(new AlwaysDegradedCheck('service-2'));

  const result = await aggregator.checkAll();

  assert.strictEqual(result.status, 'degraded', 'Should be degraded if any check is degraded');
  assert.strictEqual(Object.keys(result.checks).length, 2);
});

test('HealthCheck should timeout after specified duration', async () => {
  const slowCheck = new SlowHealthCheck(5000); // 5 second check
  const aggregator = new HealthAggregator({ timeout: 100 });

  aggregator.registerCheck(slowCheck);

  const startTime = Date.now();
  const result = await aggregator.checkAll();
  const duration = Date.now() - startTime;

  assert.ok(duration < 200, 'Should timeout within 200ms');
  assert.strictEqual(result.checks['slow-check'].status, 'unhealthy');
  assert.ok(result.checks['slow-check'].message?.includes('timeout'));
});
```

### 1.4 /metrics Endpoint

#### Test Scenarios
1. ✓ HTTP GET /metrics returns 200
2. ✓ Response content-type is text/plain
3. ✓ Response format matches Prometheus spec
4. ✓ Endpoint includes framework metrics (actor counts, message rates)
5. ✓ Endpoint includes custom application metrics
6. ✓ Performance: < 50ms response time

#### Test Pattern: Metrics Endpoint
```typescript
test('GET /metrics should return Prometheus formatted metrics', async () => {
  const server = new CortexHttpServer({ port: 0 });
  server.enableMetrics();
  await server.start();

  const response = await fetch(`http://localhost:${server.port}/metrics`);

  assert.strictEqual(response.status, 200);
  assert.strictEqual(response.headers.get('content-type'), 'text/plain; version=0.0.4');

  const body = await response.text();
  assert.ok(body.includes('# HELP'));
  assert.ok(body.includes('# TYPE'));

  await server.stop();
});
```

### 1.5 Sampling Strategies

#### Components to Test

**Sampler**
```typescript
interface Sampler {
  shouldSample(context: SamplingContext): SamplingResult;
}

class ProbabilitySampler implements Sampler {
  constructor(probability: number) {}
}

class AdaptiveSampler implements Sampler {
  constructor(config: AdaptiveSamplingConfig) {}
}
```

**Test Scenarios:**
1. ✓ Probability sampler samples correct percentage
2. ✓ Always sample errors regardless of probability
3. ✓ Always sample slow requests
4. ✓ Head sampling deterministic based on trace ID
5. ✓ Tail sampling after trace completion
6. ✓ Sampling decision propagated to child spans

#### Test Pattern: Sampling
```typescript
test('ProbabilitySampler should sample approximately correct percentage', () => {
  const sampler = new ProbabilitySampler(0.1); // 10%
  const iterations = 10000;
  let sampled = 0;

  for (let i = 0; i < iterations; i++) {
    const result = sampler.shouldSample({ traceId: generateTraceId() });
    if (result.decision === SamplingDecision.RECORD_AND_SAMPLE) {
      sampled++;
    }
  }

  const percentage = sampled / iterations;
  assert.ok(percentage > 0.08 && percentage < 0.12, 'Should be approximately 10%');
});

test('AdaptiveSampler should always sample errors', () => {
  const sampler = new AdaptiveSampler({ baseProbability: 0.01 });

  const result = sampler.shouldSample({
    traceId: generateTraceId(),
    attributes: { error: true }
  });

  assert.strictEqual(result.decision, SamplingDecision.RECORD_AND_SAMPLE);
  assert.strictEqual(result.attributes.sampling_reason, 'error');
});
```

### 1.6 Integration with ActorSystem

#### Test Scenarios
1. ✓ Actors automatically instrumented with metrics
2. ✓ Message processing duration tracked per actor type
3. ✓ Actor mailbox size reported as gauge
4. ✓ Actor restart count tracked as counter
5. ✓ Failed message count tracked
6. ✓ Trace context propagated between actors
7. ✓ EventBus events create spans

#### Test Pattern: Actor Instrumentation
```typescript
test('ActorSystem should track message processing duration', async () => {
  const registry = new MetricsRegistry();
  const eventBus = EventBus.getInstance();
  const system = new ActorSystem(eventBus, { metricsRegistry: registry });

  const actor = system.createActor(TestActor, 'instrumented-actor');

  system.dispatch('instrumented-actor', 'test-message');
  await new Promise(resolve => setTimeout(resolve, 100));

  const metrics = registry.collect();
  assert.ok(metrics.includes('actor_message_duration_seconds'));
  assert.ok(metrics.includes('actor_type="TestActor"'));
});
```

---

## Priority 2: Resilience & Reliability

### Overview
Implement comprehensive resilience patterns including circuit breakers, retries, bulkheads, and timeouts to prevent cascading failures.

### 2.1 Circuit Breaker

#### Components to Test

**CircuitBreaker**
```typescript
enum CircuitState {
  CLOSED,
  OPEN,
  HALF_OPEN
}

interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  volumeThreshold: number;
  errorThresholdPercentage: number;
  rollingWindowSize: number;
}

class CircuitBreaker {
  constructor(config: CircuitBreakerConfig);
  async execute<T>(fn: () => Promise<T>): Promise<T>;
  getState(): CircuitState;
  getMetrics(): CircuitBreakerMetrics;
}
```

**Test Scenarios:**
1. ✓ Circuit starts in CLOSED state
2. ✓ Circuit opens after failure threshold exceeded
3. ✓ Circuit rejects requests when OPEN
4. ✓ Circuit transitions to HALF_OPEN after timeout
5. ✓ Circuit closes after success threshold in HALF_OPEN
6. ✓ Circuit reopens on failure in HALF_OPEN
7. ✓ Rolling window statistics calculated correctly
8. ✓ Error percentage threshold respected
9. ✓ Volume threshold prevents premature opening
10. ✓ State change events emitted
11. ✓ Metrics tracked (success rate, failure rate, state duration)
12. ✓ Thread-safety for concurrent requests

**Performance Requirements:**
- Circuit check overhead: < 1μs
- State transition: < 10μs

#### Test Pattern: Circuit Breaker State Transitions
```typescript
test('CircuitBreaker should open after failure threshold exceeded', async () => {
  const breaker = new CircuitBreaker({
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 60000,
    volumeThreshold: 10,
    errorThresholdPercentage: 50,
    rollingWindowSize: 10000
  });

  assert.strictEqual(breaker.getState(), CircuitState.CLOSED);

  // Generate failures exceeding threshold
  for (let i = 0; i < 10; i++) {
    try {
      await breaker.execute(() => Promise.reject(new Error('Failure')));
    } catch (e) {
      // Expected
    }
  }

  assert.strictEqual(breaker.getState(), CircuitState.OPEN);
});

test('CircuitBreaker should reject requests when OPEN', async () => {
  const breaker = new CircuitBreaker({
    failureThreshold: 2,
    successThreshold: 2,
    timeout: 60000,
    volumeThreshold: 2,
    errorThresholdPercentage: 50,
    rollingWindowSize: 10000
  });

  // Trip the circuit
  for (let i = 0; i < 3; i++) {
    try {
      await breaker.execute(() => Promise.reject(new Error('Failure')));
    } catch (e) {}
  }

  assert.strictEqual(breaker.getState(), CircuitState.OPEN);

  // Should reject immediately
  await assert.rejects(
    () => breaker.execute(() => Promise.resolve('success')),
    { name: 'CircuitBreakerOpenError' }
  );
});

test('CircuitBreaker should transition to HALF_OPEN after timeout', async () => {
  const breaker = new CircuitBreaker({
    failureThreshold: 2,
    successThreshold: 2,
    timeout: 100, // Short timeout for testing
    volumeThreshold: 2,
    errorThresholdPercentage: 50,
    rollingWindowSize: 10000
  });

  // Trip the circuit
  for (let i = 0; i < 3; i++) {
    try {
      await breaker.execute(() => Promise.reject(new Error('Failure')));
    } catch (e) {}
  }

  assert.strictEqual(breaker.getState(), CircuitState.OPEN);

  // Wait for timeout
  await new Promise(resolve => setTimeout(resolve, 150));

  // Next request should attempt (HALF_OPEN)
  try {
    await breaker.execute(() => Promise.resolve('success'));
  } catch (e) {}

  assert.strictEqual(breaker.getState(), CircuitState.HALF_OPEN);
});
```

#### Test Pattern: Circuit Breaker Error Percentage
```typescript
test('CircuitBreaker should respect error percentage threshold', async () => {
  const breaker = new CircuitBreaker({
    failureThreshold: 10,
    successThreshold: 2,
    timeout: 60000,
    volumeThreshold: 10,
    errorThresholdPercentage: 30, // 30% error rate
    rollingWindowSize: 10000
  });

  // 20 requests: 5 failures (25%) - should stay CLOSED
  for (let i = 0; i < 20; i++) {
    try {
      if (i < 5) {
        await breaker.execute(() => Promise.reject(new Error('Failure')));
      } else {
        await breaker.execute(() => Promise.resolve('success'));
      }
    } catch (e) {}
  }

  assert.strictEqual(breaker.getState(), CircuitState.CLOSED);

  // 10 more requests: 4 failures (total 9/30 = 30%) - should stay CLOSED
  for (let i = 0; i < 10; i++) {
    try {
      if (i < 4) {
        await breaker.execute(() => Promise.reject(new Error('Failure')));
      } else {
        await breaker.execute(() => Promise.resolve('success'));
      }
    } catch (e) {}
  }

  assert.strictEqual(breaker.getState(), CircuitState.CLOSED);

  // 1 more failure (10/31 = 32%) - should OPEN
  try {
    await breaker.execute(() => Promise.reject(new Error('Failure')));
  } catch (e) {}

  assert.strictEqual(breaker.getState(), CircuitState.OPEN);
});
```

### 2.2 Retry Policy

#### Components to Test

**RetryPolicy**
```typescript
interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  multiplier: number;
  jitterFactor: number;
  retryableErrors?: ErrorMatcher[];
}

class RetryPolicy {
  constructor(config: RetryConfig);
  async execute<T>(fn: () => Promise<T>): Promise<T>;
  calculateDelay(attempt: number): number;
}
```

**Test Scenarios:**
1. ✓ Retry succeeds on second attempt
2. ✓ Retry exhausts max attempts and throws
3. ✓ Exponential backoff calculated correctly
4. ✓ Jitter adds randomness to delays
5. ✓ Max delay cap respected
6. ✓ Only retry on retryable errors
7. ✓ Non-retryable errors throw immediately
8. ✓ Retry metrics tracked (attempt count, success rate)
9. ✓ Decorrelated jitter implementation
10. ✓ Fixed delay strategy
11. ✓ Custom retry predicates

#### Test Pattern: Retry Backoff
```typescript
test('RetryPolicy should calculate exponential backoff correctly', () => {
  const retry = new RetryPolicy({
    maxAttempts: 5,
    initialDelay: 100,
    maxDelay: 30000,
    multiplier: 2,
    jitterFactor: 0
  });

  assert.strictEqual(retry.calculateDelay(0), 100);
  assert.strictEqual(retry.calculateDelay(1), 200);
  assert.strictEqual(retry.calculateDelay(2), 400);
  assert.strictEqual(retry.calculateDelay(3), 800);
});

test('RetryPolicy should add jitter to delays', () => {
  const retry = new RetryPolicy({
    maxAttempts: 5,
    initialDelay: 1000,
    maxDelay: 30000,
    multiplier: 2,
    jitterFactor: 0.1
  });

  const delays: number[] = [];
  for (let i = 0; i < 100; i++) {
    delays.push(retry.calculateDelay(1));
  }

  // Should have variation
  const min = Math.min(...delays);
  const max = Math.max(...delays);
  assert.ok(max > min, 'Jitter should create variation');
  assert.ok(min >= 1800 && max <= 2200, 'Jitter should be within 10%');
});

test('RetryPolicy should respect max delay cap', () => {
  const retry = new RetryPolicy({
    maxAttempts: 10,
    initialDelay: 100,
    maxDelay: 1000,
    multiplier: 2,
    jitterFactor: 0
  });

  assert.strictEqual(retry.calculateDelay(10), 1000);
  assert.strictEqual(retry.calculateDelay(20), 1000);
});
```

#### Test Pattern: Retry Execution
```typescript
test('RetryPolicy should succeed on second attempt', async () => {
  let attempts = 0;
  const flaky = async () => {
    attempts++;
    if (attempts === 1) {
      throw new Error('Temporary failure');
    }
    return 'success';
  };

  const retry = new RetryPolicy({
    maxAttempts: 3,
    initialDelay: 10,
    maxDelay: 1000,
    multiplier: 2,
    jitterFactor: 0
  });

  const result = await retry.execute(flaky);
  assert.strictEqual(result, 'success');
  assert.strictEqual(attempts, 2);
});

test('RetryPolicy should only retry retryable errors', async () => {
  const isNetworkError = (error: Error) => error.message.includes('ECONNREFUSED');

  const retry = new RetryPolicy({
    maxAttempts: 3,
    initialDelay: 10,
    maxDelay: 1000,
    multiplier: 2,
    jitterFactor: 0,
    retryableErrors: [isNetworkError]
  });

  let attempts = 0;

  // Should NOT retry non-network error
  await assert.rejects(
    () => retry.execute(async () => {
      attempts++;
      throw new Error('Not a network error');
    }),
    { message: 'Not a network error' }
  );
  assert.strictEqual(attempts, 1, 'Should not retry non-retryable error');

  // Should retry network error
  attempts = 0;
  await assert.rejects(
    () => retry.execute(async () => {
      attempts++;
      throw new Error('ECONNREFUSED');
    }),
    { message: 'ECONNREFUSED' }
  );
  assert.strictEqual(attempts, 3, 'Should retry retryable error');
});
```

### 2.3 Bulkhead Pattern

#### Components to Test

**Bulkhead**
```typescript
class Semaphore {
  constructor(maxPermits: number);
  async acquire(): Promise<void>;
  release(): void;
}

class Bulkhead {
  constructor(maxConcurrent: number, maxQueueSize?: number);
  async execute<T>(fn: () => Promise<T>): Promise<T>;
  getMetrics(): BulkheadMetrics;
}
```

**Test Scenarios:**
1. ✓ Limit concurrent executions to max
2. ✓ Queue requests when at capacity
3. ✓ Reject requests when queue full
4. ✓ Release permit after execution completes
5. ✓ Release permit even on error
6. ✓ Metrics track active count and queue size
7. ✓ Thread-safety for concurrent acquire/release
8. ✓ Timeout for waiting in queue
9. ✓ Fair vs LIFO queue strategies

#### Test Pattern: Bulkhead Concurrency
```typescript
test('Bulkhead should limit concurrent executions', async () => {
  const bulkhead = new Bulkhead(2, 10);
  let concurrent = 0;
  let maxConcurrent = 0;

  const task = async () => {
    concurrent++;
    maxConcurrent = Math.max(maxConcurrent, concurrent);
    await new Promise(resolve => setTimeout(resolve, 50));
    concurrent--;
    return 'done';
  };

  const promises = Array.from({ length: 10 }, () => bulkhead.execute(task));
  await Promise.all(promises);

  assert.strictEqual(maxConcurrent, 2, 'Should never exceed 2 concurrent executions');
});

test('Bulkhead should reject when queue is full', async () => {
  const bulkhead = new Bulkhead(1, 2);

  const longTask = () => new Promise(resolve => setTimeout(resolve, 1000));

  // Start 3 tasks (1 running, 2 queued)
  const task1 = bulkhead.execute(longTask);
  const task2 = bulkhead.execute(longTask);
  const task3 = bulkhead.execute(longTask);

  // 4th task should be rejected
  await assert.rejects(
    () => bulkhead.execute(longTask),
    { name: 'BulkheadRejectError' }
  );
});
```

### 2.4 Timeout Policy

#### Components to Test

**TimeoutPolicy**
```typescript
class TimeoutPolicy {
  async execute<T>(
    fn: () => Promise<T>,
    timeoutMs: number,
    fallback?: () => T
  ): Promise<T>;
}

class HierarchicalTimeout {
  async executeWithTimeouts<T>(
    fn: () => Promise<T>,
    config: TimeoutConfig
  ): Promise<T>;
}
```

**Test Scenarios:**
1. ✓ Timeout after specified duration
2. ✓ Return fallback value on timeout
3. ✓ Throw TimeoutError if no fallback
4. ✓ Hierarchical timeouts (connection, request, total)
5. ✓ Cleanup on timeout (abort signal)
6. ✓ Race condition handling

#### Test Pattern: Timeout
```typescript
test('TimeoutPolicy should timeout after specified duration', async () => {
  const timeout = new TimeoutPolicy();
  const slowTask = () => new Promise(resolve => setTimeout(() => resolve('done'), 1000));

  const start = Date.now();
  await assert.rejects(
    () => timeout.execute(slowTask, 100),
    { name: 'TimeoutError' }
  );
  const duration = Date.now() - start;

  assert.ok(duration < 200, 'Should timeout within 200ms');
});

test('TimeoutPolicy should return fallback on timeout', async () => {
  const timeout = new TimeoutPolicy();
  const slowTask = () => new Promise(resolve => setTimeout(() => resolve('done'), 1000));

  const result = await timeout.execute(slowTask, 100, () => 'fallback');
  assert.strictEqual(result, 'fallback');
});
```

### 2.5 Policy Composition

#### Test Scenarios
1. ✓ Compose retry + circuit breaker
2. ✓ Compose bulkhead + timeout
3. ✓ Compose retry + timeout + circuit breaker
4. ✓ Policy execution order matters
5. ✓ Metrics aggregated across policies

#### Test Pattern: Policy Composition
```typescript
test('Should compose retry with circuit breaker', async () => {
  const breaker = new CircuitBreaker({ /* config */ });
  const retry = new RetryPolicy({ /* config */ });

  const composed = PolicyComposer
    .wrap(retry)
    .wrap(breaker)
    .build();

  let attempts = 0;
  const result = await composed.execute(async () => {
    attempts++;
    if (attempts < 3) throw new Error('Fail');
    return 'success';
  });

  assert.strictEqual(result, 'success');
  assert.strictEqual(attempts, 3);
});
```

### 2.6 Failure Condition Testing

#### Test Scenarios
1. ✓ Handle network timeouts
2. ✓ Handle connection refused
3. ✓ Handle service unavailable (503)
4. ✓ Handle rate limiting (429)
5. ✓ Handle partial failures
6. ✓ Handle cascading failures

#### Test Pattern: Failure Scenarios
```typescript
test('Should handle cascading failures with circuit breaker', async () => {
  const service1 = new CircuitBreaker({ /* config */ });
  const service2 = new CircuitBreaker({ /* config */ });

  // Simulate service1 failing
  for (let i = 0; i < 10; i++) {
    try {
      await service1.execute(() => Promise.reject(new Error('Service 1 down')));
    } catch (e) {}
  }

  assert.strictEqual(service1.getState(), CircuitState.OPEN);

  // Service2 should NOT fail because it's isolated
  const result = await service2.execute(() => Promise.resolve('service2 ok'));
  assert.strictEqual(result, 'service2 ok');
  assert.strictEqual(service2.getState(), CircuitState.CLOSED);
});
```

### 2.7 Cascading Failure Prevention

#### Test Scenarios
1. ✓ Rate limiting prevents overload
2. ✓ Adaptive concurrency limiting
3. ✓ Token bucket algorithm
4. ✓ Load shedding under pressure

#### Test Pattern: Cascading Prevention
```typescript
test('Adaptive concurrency limiter should reduce limit on errors', async () => {
  const limiter = new AdaptiveConcurrencyLimiter({
    initialLimit: 10,
    minLimit: 1,
    maxLimit: 100
  });

  const initialLimit = limiter.getLimit();

  // Simulate errors
  for (let i = 0; i < 5; i++) {
    try {
      await limiter.execute(() => Promise.reject(new Error('Fail')));
    } catch (e) {}
  }

  const newLimit = limiter.getLimit();
  assert.ok(newLimit < initialLimit, 'Limit should decrease after errors');
});
```

---

## Priority 3: Fix Existing Placeholders

### 3.1 Compression Middleware

#### Current Issues
The current implementation only sets headers but doesn't actually compress the response.

#### Test Scenarios
1. ✓ Brotli compression actually compresses data
2. ✓ Gzip compression actually compresses data
3. ✓ Compression ratio measured (> 50% for JSON)
4. ✓ Small payloads not compressed (< 1KB)
5. ✓ Pre-compressed formats not re-compressed
6. ✓ Content-Encoding header set correctly
7. ✓ Vary: Accept-Encoding header set
8. ✓ Compression level configurable
9. ✓ Stream compression for large responses
10. ✓ Memory usage acceptable

#### Test Pattern: Compression Effectiveness
```typescript
test('Brotli compression should actually compress response data', async () => {
  const server = new CortexHttpServer({ port: 0 });
  server.use(brotliCompression({ level: 4 }));

  server.get('/data', (_req, res) => {
    const largeJson = JSON.stringify({
      data: Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        description: 'A very long description that will compress well'
      }))
    });
    res.json(largeJson);
  });

  await server.start();

  const response = await fetch(`http://localhost:${server.port}/data`, {
    headers: { 'Accept-Encoding': 'br' }
  });

  assert.strictEqual(response.headers.get('Content-Encoding'), 'br');

  const originalSize = JSON.stringify(/* original data */).length;
  const compressedSize = Number(response.headers.get('Content-Length'));
  const compressionRatio = compressedSize / originalSize;

  assert.ok(compressionRatio < 0.5, 'Should compress to less than 50%');

  await server.stop();
});

test('Should not compress small payloads', async () => {
  const server = new CortexHttpServer({ port: 0 });
  server.use(compressionMiddleware({ threshold: 1024 }));

  server.get('/small', (_req, res) => {
    res.json({ message: 'Small response' });
  });

  await server.start();

  const response = await fetch(`http://localhost:${server.port}/small`, {
    headers: { 'Accept-Encoding': 'gzip' }
  });

  assert.strictEqual(response.headers.get('Content-Encoding'), null);

  await server.stop();
});

test('Should not re-compress already compressed formats', async () => {
  const server = new CortexHttpServer({ port: 0 });
  server.use(compressionMiddleware());

  server.get('/image', (_req, res) => {
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(Buffer.from(/* JPEG data */));
  });

  await server.start();

  const response = await fetch(`http://localhost:${server.port}/image`, {
    headers: { 'Accept-Encoding': 'gzip' }
  });

  assert.strictEqual(response.headers.get('Content-Encoding'), null);

  await server.stop();
});
```

#### Implementation Checklist
- [ ] Implement actual Brotli compression stream
- [ ] Implement actual Gzip compression stream
- [ ] Add content-type detection
- [ ] Add size threshold check
- [ ] Add pre-compressed format detection
- [ ] Add compression level configuration
- [ ] Add streaming support
- [ ] Add memory buffering limits
- [ ] Add Vary header support
- [ ] Add compression metrics

### 3.2 WorkerPool Message Passing

#### Current Issues
The WorkerPool simulates message passing with setTimeout but doesn't use actual worker threads.

#### Test Scenarios
1. ✓ Messages actually sent to worker thread
2. ✓ Responses received from worker thread
3. ✓ Worker thread receives correct message format
4. ✓ Serialization/deserialization works correctly
5. ✓ Error handling across thread boundary
6. ✓ Worker termination cleanup
7. ✓ Worker restart on failure
8. ✓ Message queue persists during worker restart
9. ✓ Concurrent message handling
10. ✓ Memory isolation between workers

#### Test Pattern: Real Worker Communication
```typescript
test('WorkerPool should send messages to actual worker threads', async () => {
  const mockSystem = new MockActorSystem();
  const pool = new WorkerPool(mockSystem, 2);

  const result = await pool.execute('test-task', {
    type: 'COMPUTE',
    payload: { numbers: [1, 2, 3, 4, 5] }
  });

  assert.ok(result.computed, 'Should receive computed result from worker');
  assert.strictEqual(result.sum, 15);
});

test('WorkerPool should handle worker errors gracefully', async () => {
  const mockSystem = new MockActorSystem();
  const pool = new WorkerPool(mockSystem, 1);

  await assert.rejects(
    () => pool.execute('error-task', { type: 'THROW_ERROR' }),
    { message: 'Worker error' }
  );

  // Worker should still be functional after error
  const result = await pool.execute('valid-task', { type: 'COMPUTE' });
  assert.ok(result);
});

test('WorkerPool should restart failed workers', async () => {
  const mockSystem = new MockActorSystem();
  const pool = new WorkerPool(mockSystem, 1, { restartOnFailure: true });

  // Cause worker to crash
  try {
    await pool.execute('crash-task', { type: 'FATAL_ERROR' });
  } catch (e) {}

  // Should restart and handle new tasks
  const result = await pool.execute('recovery-task', { type: 'COMPUTE' });
  assert.ok(result);
});
```

#### Implementation Checklist
- [ ] Implement actual Worker thread creation
- [ ] Implement message serialization
- [ ] Implement postMessage/onmessage handlers
- [ ] Implement error propagation
- [ ] Implement worker termination
- [ ] Implement worker restart logic
- [ ] Add structured cloning validation
- [ ] Add message timeout handling
- [ ] Add worker health monitoring
- [ ] Add worker pool metrics

### 3.3 Wasm Memory Safety

#### Current Issues
The Wasm utility functions have placeholders for memory management.

#### Test Scenarios
1. ✓ Memory allocated correctly in Wasm
2. ✓ Memory freed after use (no leaks)
3. ✓ Boundary checks prevent buffer overflow
4. ✓ Data correctly written to Wasm memory
5. ✓ Data correctly read from Wasm memory
6. ✓ Large data transfers work correctly
7. ✓ Concurrent access handled safely
8. ✓ Memory growth handled correctly
9. ✓ Invalid pointer handling

#### Test Pattern: Wasm Memory Management
```typescript
test('jsToWasm should allocate memory and write data', () => {
  const instance = /* load test Wasm module with malloc/free */;
  const data = { test: 'Hello, Wasm!' };

  const ptr = jsToWasm(instance, data);
  assert.ok(ptr > 0, 'Should return valid pointer');

  // Verify data written to memory
  const memory = new Uint8Array(instance.exports.memory.buffer);
  const expectedBytes = new TextEncoder().encode(JSON.stringify(data));

  for (let i = 0; i < expectedBytes.length; i++) {
    assert.strictEqual(memory[ptr + i], expectedBytes[i]);
  }

  // Free memory
  instance.exports.free(ptr);
});

test('wasmToJs should read data from Wasm memory correctly', () => {
  const instance = /* load test Wasm module */;
  const data = { test: 'Hello from Wasm!' };
  const jsonString = JSON.stringify(data);
  const bytes = new TextEncoder().encode(jsonString);

  // Write to Wasm memory
  const ptr = instance.exports.malloc(bytes.length);
  const memory = new Uint8Array(instance.exports.memory.buffer);
  memory.set(bytes, ptr);

  // Read back
  const result = wasmToJs(instance, ptr, bytes.length);
  assert.deepStrictEqual(result, data);

  instance.exports.free(ptr);
});

test('Should handle memory growth correctly', () => {
  const instance = /* load test Wasm module */;
  const initialPages = instance.exports.memory.buffer.byteLength / 65536;

  // Allocate large amount of memory
  const largeData = new Array(100000).fill('x').join('');
  const ptr = jsToWasm(instance, { data: largeData });

  const newPages = instance.exports.memory.buffer.byteLength / 65536;
  assert.ok(newPages > initialPages, 'Memory should grow');

  instance.exports.free(ptr);
});

test('Should prevent buffer overflow', () => {
  const instance = /* load test Wasm module */;
  const memory = instance.exports.memory as WebAssembly.Memory;
  const maxSize = memory.buffer.byteLength;

  assert.throws(
    () => wasmToJs(instance, 0, maxSize + 1),
    { name: 'RangeError' }
  );
});
```

#### Implementation Checklist
- [ ] Implement memory allocation (malloc/free exports)
- [ ] Implement boundary checking
- [ ] Implement memory leak detection
- [ ] Add memory growth handling
- [ ] Add concurrent access protection
- [ ] Add memory usage metrics
- [ ] Add structured data serialization
- [ ] Add memory pool for frequent allocations
- [ ] Add memory debugging utilities

### 3.4 Error Handling in All Three

#### Test Scenarios
1. ✓ Compression errors don't crash server
2. ✓ Worker errors don't crash pool
3. ✓ Wasm errors don't corrupt memory
4. ✓ Proper error messages and stack traces
5. ✓ Error recovery mechanisms
6. ✓ Error metrics tracked

---

## Test Coverage Targets

### Overall Target: 90%+

#### Coverage by Component

| Component | Line Coverage | Branch Coverage | Function Coverage |
|-----------|--------------|-----------------|-------------------|
| Observability | 95%+ | 90%+ | 100% |
| Metrics | 95%+ | 90%+ | 100% |
| Tracing | 95%+ | 90%+ | 100% |
| Health Checks | 95%+ | 90%+ | 100% |
| Circuit Breaker | 95%+ | 95%+ | 100% |
| Retry Policy | 95%+ | 95%+ | 100% |
| Bulkhead | 95%+ | 90%+ | 100% |
| Timeout | 95%+ | 90%+ | 100% |
| Compression | 95%+ | 90%+ | 100% |
| WorkerPool | 90%+ | 85%+ | 100% |
| Wasm Utils | 90%+ | 85%+ | 100% |
| ActorSystem | 90%+ | 85%+ | 100% |
| EventBus | 90%+ | 85%+ | 100% |
| HTTP Server | 85%+ | 80%+ | 95% |

### Measuring Coverage

```bash
# Using Node.js built-in coverage (Node 20+)
node --test --experimental-test-coverage tests/**/*.test.ts

# Coverage report format
npx c8 --reporter=html --reporter=text node --test tests/**/*.test.ts
```

### Coverage Exclusions
- Type declarations (*.d.ts)
- Test files themselves
- Mock implementations
- Debug/logging statements
- Unreachable error branches

---

## Test Tools & Frameworks

### Zero External Dependencies Approach

**Primary Tools (Built-in Node.js):**
1. `node:test` - Native test runner (Node 18+)
2. `node:assert` - Assertion library
3. `node:util` - Utilities (inspect, promisify)
4. `node:perf_hooks` - Performance measurement

### Test Runner Configuration

```typescript
// tests/test-runner.config.ts
export default {
  concurrency: 4,
  timeout: 5000,
  files: ['tests/**/*.test.ts'],
  require: ['ts-node/register'],
  coverage: true,
  coverageDirectory: './coverage'
};
```

### Custom Test Utilities

**Timer Utilities:**
```typescript
// tests/utils/timer.ts
export async function waitFor(
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 50
): Promise<void> {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

export function measureExecutionTime<T>(
  fn: () => T | Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = Promise.resolve(fn());

  return result.then(value => ({
    result: value,
    duration: performance.now() - start
  }));
}
```

**Mock Utilities:**
```typescript
// tests/utils/mock.ts
export class MockFunction<T extends (...args: any[]) => any> {
  public calls: Parameters<T>[] = [];
  public results: ReturnType<T>[] = [];
  private implementation?: T;

  constructor(implementation?: T) {
    this.implementation = implementation;
  }

  public mock(impl: T): void {
    this.implementation = impl;
  }

  public call(...args: Parameters<T>): ReturnType<T> {
    this.calls.push(args);
    const result = this.implementation?.(...args);
    this.results.push(result);
    return result;
  }

  public reset(): void {
    this.calls = [];
    this.results = [];
  }

  public calledTimes(): number {
    return this.calls.length;
  }

  public calledWith(...args: Parameters<T>): boolean {
    return this.calls.some(call =>
      call.length === args.length &&
      call.every((arg, i) => arg === args[i])
    );
  }
}
```

**HTTP Test Utilities:**
```typescript
// tests/utils/http.ts
export async function makeRequest(
  url: string,
  options?: RequestInit
): Promise<{
  status: number;
  headers: Record<string, string>;
  body: any;
  duration: number;
}> {
  const start = performance.now();
  const response = await fetch(url, options);
  const body = await response.text();
  const duration = performance.now() - start;

  return {
    status: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    body: tryParseJSON(body),
    duration
  };
}

function tryParseJSON(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
```

---

## Test Data & Fixtures

### Fixture Management

**Fixture Structure:**
```
tests/
  fixtures/
    metrics/
      prometheus-output.txt
      sample-counters.json
      sample-histograms.json
    traces/
      w3c-traceparent-valid.json
      w3c-traceparent-invalid.json
      sample-spans.json
    wasm/
      test-module.wasm
      memory-test.wasm
    http/
      sample-requests.json
      sample-responses.json
```

**Fixture Loader:**
```typescript
// tests/utils/fixtures.ts
import { readFileSync } from 'fs';
import { join } from 'path';

export class FixtureLoader {
  private fixturesDir: string;

  constructor(fixturesDir: string = join(__dirname, '../fixtures')) {
    this.fixturesDir = fixturesDir;
  }

  load<T = any>(path: string): T {
    const fullPath = join(this.fixturesDir, path);
    const content = readFileSync(fullPath, 'utf-8');

    if (path.endsWith('.json')) {
      return JSON.parse(content);
    }
    return content as unknown as T;
  }

  loadBuffer(path: string): Buffer {
    const fullPath = join(this.fixturesDir, path);
    return readFileSync(fullPath);
  }
}

// Usage in tests
const fixtures = new FixtureLoader();
const sampleSpans = fixtures.load('traces/sample-spans.json');
const wasmModule = fixtures.loadBuffer('wasm/test-module.wasm');
```

### Test Data Generators

**Metrics Generators:**
```typescript
// tests/generators/metrics.ts
export function generateMetricSamples(count: number): number[] {
  return Array.from({ length: count }, () => Math.random() * 1000);
}

export function generateHistogramBuckets(): number[] {
  return [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
}

export function generatePrometheusOutput(
  metrics: Array<{ name: string; type: string; value: number; labels?: Record<string, string> }>
): string {
  return metrics.map(m => {
    const labels = m.labels
      ? `{${Object.entries(m.labels).map(([k, v]) => `${k}="${v}"`).join(',')}}`
      : '';
    return `# TYPE ${m.name} ${m.type}\n${m.name}${labels} ${m.value}`;
  }).join('\n\n');
}
```

**Trace Generators:**
```typescript
// tests/generators/traces.ts
export function generateTraceId(): string {
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

export function generateSpanId(): string {
  return Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

export function generateSpan(overrides?: Partial<Span>): Span {
  return {
    traceId: generateTraceId(),
    spanId: generateSpanId(),
    name: 'test-span',
    kind: SpanKind.INTERNAL,
    startTime: Date.now() * 1000000,
    attributes: {},
    events: [],
    status: { code: SpanStatusCode.OK },
    ...overrides
  };
}
```

**Mock Services:**
```typescript
// tests/mocks/services.ts
export class MockExternalService {
  private failureRate: number = 0;
  private latency: number = 0;
  private responseCount: number = 0;

  constructor(config?: { failureRate?: number; latency?: number }) {
    this.failureRate = config?.failureRate ?? 0;
    this.latency = config?.latency ?? 0;
  }

  async call(request: any): Promise<any> {
    this.responseCount++;

    // Simulate latency
    if (this.latency > 0) {
      await new Promise(resolve => setTimeout(resolve, this.latency));
    }

    // Simulate failures
    if (Math.random() < this.failureRate) {
      throw new Error('Service unavailable');
    }

    return { success: true, data: request };
  }

  getMetrics() {
    return {
      responseCount: this.responseCount,
      failureRate: this.failureRate,
      latency: this.latency
    };
  }

  reset() {
    this.responseCount = 0;
  }
}
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x, 22.x]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run unit tests
        run: npm run test:unit
        timeout-minutes: 2

      - name: Run integration tests
        run: npm run test:integration
        timeout-minutes: 3

      - name: Run e2e tests
        run: npm run test:e2e
        timeout-minutes: 5

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json
          fail_ci_if_error: true
          flags: unittests
          name: codecov-cortex

      - name: Check coverage threshold
        run: |
          COVERAGE=$(node -p "JSON.parse(require('fs').readFileSync('./coverage/coverage-summary.json')).total.lines.pct")
          if (( $(echo "$COVERAGE < 90" | bc -l) )); then
            echo "Coverage $COVERAGE% is below 90% threshold"
            exit 1
          fi

  benchmark:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20.x

      - name: Install dependencies
        run: npm ci

      - name: Run benchmarks
        run: npm run benchmark

      - name: Compare with baseline
        run: node scripts/compare-benchmarks.js
```

### Test Scripts in package.json

```json
{
  "scripts": {
    "test": "node --test tests/**/*.test.ts",
    "test:unit": "node --test tests/**/!(*.integration|*.e2e).test.ts",
    "test:integration": "node --test tests/**/*.integration.test.ts",
    "test:e2e": "node --test tests/**/*.e2e.test.ts",
    "test:coverage": "node --test --experimental-test-coverage tests/**/*.test.ts",
    "test:watch": "node --test --watch tests/**/*.test.ts",
    "benchmark": "node tests/benchmarks/run-all.ts",
    "lint": "eslint src tests --ext .ts",
    "lint:fix": "eslint src tests --ext .ts --fix"
  }
}
```

### Pre-commit Hook

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "Running tests before commit..."

# Run fast unit tests only
npm run test:unit

if [ $? -ne 0 ]; then
  echo "Tests failed. Commit aborted."
  exit 1
fi

echo "Tests passed. Proceeding with commit."
```

---

## Test Code Examples

### Complete Test Suite Example: Circuit Breaker

```typescript
// tests/resilience/circuit-breaker.test.ts
import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import {
  CircuitBreaker,
  CircuitState,
  CircuitBreakerConfig
} from '../../src/resilience/circuit-breaker';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;
  let config: CircuitBreakerConfig;

  beforeEach(() => {
    config = {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000,
      volumeThreshold: 10,
      errorThresholdPercentage: 50,
      rollingWindowSize: 10000
    };
    breaker = new CircuitBreaker(config);
  });

  describe('Initialization', () => {
    test('should start in CLOSED state', () => {
      assert.strictEqual(breaker.getState(), CircuitState.CLOSED);
    });

    test('should initialize with correct config', () => {
      const actualConfig = breaker.getConfig();
      assert.deepStrictEqual(actualConfig, config);
    });

    test('should throw on invalid config', () => {
      assert.throws(
        () => new CircuitBreaker({ ...config, failureThreshold: -1 }),
        { message: /failureThreshold must be positive/ }
      );
    });
  });

  describe('CLOSED state', () => {
    test('should execute function successfully', async () => {
      const result = await breaker.execute(() => Promise.resolve('success'));
      assert.strictEqual(result, 'success');
      assert.strictEqual(breaker.getState(), CircuitState.CLOSED);
    });

    test('should track successful executions', async () => {
      await breaker.execute(() => Promise.resolve('ok'));
      const metrics = breaker.getMetrics();
      assert.strictEqual(metrics.totalSuccesses, 1);
    });

    test('should track failed executions', async () => {
      try {
        await breaker.execute(() => Promise.reject(new Error('fail')));
      } catch (e) {}

      const metrics = breaker.getMetrics();
      assert.strictEqual(metrics.totalFailures, 1);
    });
  });

  describe('State transitions', () => {
    test('should transition CLOSED -> OPEN after failures', async () => {
      for (let i = 0; i < 10; i++) {
        try {
          await breaker.execute(() => Promise.reject(new Error('fail')));
        } catch (e) {}
      }

      assert.strictEqual(breaker.getState(), CircuitState.OPEN);
    });

    test('should transition OPEN -> HALF_OPEN after timeout', async () => {
      const shortTimeout = new CircuitBreaker({
        ...config,
        timeout: 100
      });

      // Trip the circuit
      for (let i = 0; i < 10; i++) {
        try {
          await shortTimeout.execute(() => Promise.reject(new Error('fail')));
        } catch (e) {}
      }

      assert.strictEqual(shortTimeout.getState(), CircuitState.OPEN);

      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 150));

      // Next execution should attempt
      try {
        await shortTimeout.execute(() => Promise.resolve('ok'));
      } catch (e) {}

      assert.strictEqual(shortTimeout.getState(), CircuitState.HALF_OPEN);
    });

    test('should transition HALF_OPEN -> CLOSED after successes', async () => {
      const shortTimeout = new CircuitBreaker({
        ...config,
        timeout: 100,
        successThreshold: 2
      });

      // Trip the circuit
      for (let i = 0; i < 10; i++) {
        try {
          await shortTimeout.execute(() => Promise.reject(new Error('fail')));
        } catch (e) {}
      }

      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 150));

      // Execute successful requests
      await shortTimeout.execute(() => Promise.resolve('ok'));
      await shortTimeout.execute(() => Promise.resolve('ok'));

      assert.strictEqual(shortTimeout.getState(), CircuitState.CLOSED);
    });

    test('should transition HALF_OPEN -> OPEN on failure', async () => {
      const shortTimeout = new CircuitBreaker({
        ...config,
        timeout: 100
      });

      // Trip the circuit
      for (let i = 0; i < 10; i++) {
        try {
          await shortTimeout.execute(() => Promise.reject(new Error('fail')));
        } catch (e) {}
      }

      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 150));

      // Execute one request that fails
      try {
        await shortTimeout.execute(() => Promise.reject(new Error('fail again')));
      } catch (e) {}

      assert.strictEqual(shortTimeout.getState(), CircuitState.OPEN);
    });
  });

  describe('Rolling window', () => {
    test('should only consider recent requests', async () => {
      const shortWindow = new CircuitBreaker({
        ...config,
        rollingWindowSize: 100
      });

      // Old failures (outside window)
      for (let i = 0; i < 10; i++) {
        try {
          await shortWindow.execute(() => Promise.reject(new Error('fail')));
        } catch (e) {}
      }

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // New successes
      for (let i = 0; i < 10; i++) {
        await shortWindow.execute(() => Promise.resolve('ok'));
      }

      assert.strictEqual(shortWindow.getState(), CircuitState.CLOSED);
    });
  });

  describe('Events', () => {
    test('should emit stateChange event', async () => {
      let eventEmitted = false;
      let newState: CircuitState | null = null;

      breaker.on('stateChange', (event) => {
        eventEmitted = true;
        newState = event.to;
      });

      // Trip the circuit
      for (let i = 0; i < 10; i++) {
        try {
          await breaker.execute(() => Promise.reject(new Error('fail')));
        } catch (e) {}
      }

      assert.ok(eventEmitted);
      assert.strictEqual(newState, CircuitState.OPEN);
    });
  });

  describe('Metrics', () => {
    test('should track comprehensive metrics', async () => {
      await breaker.execute(() => Promise.resolve('ok'));

      try {
        await breaker.execute(() => Promise.reject(new Error('fail')));
      } catch (e) {}

      const metrics = breaker.getMetrics();

      assert.strictEqual(metrics.totalSuccesses, 1);
      assert.strictEqual(metrics.totalFailures, 1);
      assert.strictEqual(metrics.state, CircuitState.CLOSED);
      assert.ok(metrics.successRate >= 0 && metrics.successRate <= 1);
    });
  });

  describe('Edge cases', () => {
    test('should handle synchronous errors', async () => {
      await assert.rejects(
        () => breaker.execute(() => {
          throw new Error('Sync error');
        }),
        { message: 'Sync error' }
      );
    });

    test('should handle concurrent executions', async () => {
      const promises = Array.from({ length: 100 }, () =>
        breaker.execute(() => Promise.resolve('ok'))
      );

      const results = await Promise.all(promises);
      assert.strictEqual(results.length, 100);
      assert.ok(results.every(r => r === 'ok'));
    });
  });
});
```

### Complete Test Suite Example: Metrics

```typescript
// tests/observability/metrics.test.ts
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  MetricsRegistry,
  Counter,
  Gauge,
  Histogram
} from '../../src/observability/metrics';

describe('MetricsRegistry', () => {
  let registry: MetricsRegistry;

  beforeEach(() => {
    registry = new MetricsRegistry();
  });

  describe('Counter', () => {
    test('should increment by 1 by default', () => {
      const counter = registry.counter('test_counter');
      counter.inc();
      assert.strictEqual(counter.value(), 1);
    });

    test('should increment by specified amount', () => {
      const counter = registry.counter('test_counter');
      counter.inc(5);
      assert.strictEqual(counter.value(), 5);
    });

    test('should handle labels correctly', () => {
      const counter1 = registry.counter('http_requests', { method: 'GET' });
      const counter2 = registry.counter('http_requests', { method: 'POST' });

      counter1.inc();
      counter2.inc(2);

      assert.strictEqual(counter1.value(), 1);
      assert.strictEqual(counter2.value(), 2);
    });

    test('should export in Prometheus format', () => {
      const counter = registry.counter('test_total', { service: 'api' });
      counter.inc(42);

      const output = counter.toPrometheusFormat();
      assert.ok(output.includes('# HELP test_total'));
      assert.ok(output.includes('# TYPE test_total counter'));
      assert.ok(output.includes('test_total{service="api"} 42'));
    });

    test('should throw on negative increment', () => {
      const counter = registry.counter('test_counter');
      assert.throws(
        () => counter.inc(-1),
        { message: /Counter can only increment/ }
      );
    });
  });

  describe('Gauge', () => {
    test('should set value', () => {
      const gauge = registry.gauge('test_gauge');
      gauge.set(42);
      assert.strictEqual(gauge.value(), 42);
    });

    test('should increment and decrement', () => {
      const gauge = registry.gauge('test_gauge');
      gauge.set(10);
      gauge.inc(5);
      assert.strictEqual(gauge.value(), 15);

      gauge.dec(3);
      assert.strictEqual(gauge.value(), 12);
    });

    test('should handle negative values', () => {
      const gauge = registry.gauge('test_gauge');
      gauge.set(-10);
      assert.strictEqual(gauge.value(), -10);
    });
  });

  describe('Histogram', () => {
    test('should observe values', () => {
      const histogram = registry.histogram('request_duration', [0.1, 0.5, 1]);

      histogram.observe(0.05);
      histogram.observe(0.3);
      histogram.observe(0.8);

      const metrics = histogram.toPrometheusFormat();
      assert.ok(metrics.includes('_count 3'));
      assert.ok(metrics.includes('_sum'));
    });

    test('should bucket correctly', () => {
      const histogram = registry.histogram('test_histogram', [1, 5, 10]);

      histogram.observe(0.5);  // < 1
      histogram.observe(3);    // < 5
      histogram.observe(7);    // < 10
      histogram.observe(15);   // > 10

      const output = histogram.toPrometheusFormat();
      assert.ok(output.includes('le="1"} 1'));
      assert.ok(output.includes('le="5"} 2'));
      assert.ok(output.includes('le="10"} 3'));
      assert.ok(output.includes('le="+Inf"} 4'));
    });

    test('should calculate sum correctly', () => {
      const histogram = registry.histogram('test_histogram');

      histogram.observe(1);
      histogram.observe(2);
      histogram.observe(3);

      const output = histogram.toPrometheusFormat();
      assert.ok(output.includes('_sum 6'));
    });
  });

  describe('Registry collection', () => {
    test('should collect all metrics', () => {
      const counter = registry.counter('test_counter');
      const gauge = registry.gauge('test_gauge');
      const histogram = registry.histogram('test_histogram');

      counter.inc(5);
      gauge.set(10);
      histogram.observe(1.5);

      const output = registry.collect();

      assert.ok(output.includes('test_counter'));
      assert.ok(output.includes('test_gauge'));
      assert.ok(output.includes('test_histogram'));
    });
  });
});
```

---

## Summary

This comprehensive test strategy provides:

1. **Clear test structure** following the testing pyramid
2. **Specific test scenarios** for each component
3. **Real-world test patterns** that are copy-paste ready
4. **Performance targets** and benchmarks
5. **Zero-dependency approach** using Node.js built-ins
6. **Coverage targets** of 90%+
7. **CI/CD integration** examples
8. **Test utilities** for common patterns

### Next Steps

1. Implement Priority 1 (Observability) tests first
2. Implement components to pass those tests (TDD)
3. Move to Priority 2 (Resilience) tests
4. Fix Priority 3 (Placeholders)
5. Run full test suite and measure coverage
6. Optimize for performance targets
7. Integrate into CI/CD pipeline

**Estimated Timeline:**
- Priority 1: 2-3 days (80-100 tests)
- Priority 2: 2-3 days (70-90 tests)
- Priority 3: 1-2 days (40-50 tests)
- Total: 5-8 days for complete test suite

**Key Success Metrics:**
- 90%+ code coverage
- All tests pass in < 10 seconds
- Zero flaky tests
- Clear error messages
- Easy to maintain and extend
