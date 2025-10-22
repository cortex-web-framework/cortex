# Cortex Framework - Detailed Implementation Breakdown

**Document Version:** 1.0
**Date:** 2025-10-22
**Purpose:** File-by-file implementation guide with step-by-step instructions

---

## Table of Contents

1. [Overview & Strategy](#overview--strategy)
2. [Priority 1: Observability - Phase Breakdown](#priority-1-observability---phase-breakdown)
3. [Priority 2: Resilience - Phase Breakdown](#priority-2-resilience---phase-breakdown)
4. [Priority 3: Fix Placeholders - Phase Breakdown](#priority-3-fix-placeholders---phase-breakdown)
5. [Integration Tasks](#integration-tasks)
6. [Testing Verification Checklist](#testing-verification-checklist)

---

## Overview & Strategy

### Work Phases
- **Phase 1:** Observability Metrics (Days 1-2)
- **Phase 2:** Observability Tracing + Health (Days 3-4)
- **Phase 3:** Resilience Patterns (Days 5-7)
- **Phase 4:** Fix Placeholders (Days 8-10)
- **Phase 5:** Integration & Polish (Days 11+)

### File Structure to Create
```
src/
├── observability/
│   ├── index.ts
│   ├── types.ts
│   ├── metrics/
│   │   ├── index.ts
│   │   ├── counter.ts
│   │   ├── gauge.ts
│   │   ├── histogram.ts
│   │   └── collector.ts
│   ├── tracing/
│   │   ├── index.ts
│   │   ├── span.ts
│   │   ├── tracer.ts
│   │   └── sampler.ts
│   └── health/
│       ├── index.ts
│       ├── healthRegistry.ts
│       └── defaultChecks.ts
├── resilience/
│   ├── index.ts
│   ├── types.ts
│   ├── errors.ts
│   ├── circuitBreaker.ts
│   ├── retryExecutor.ts
│   ├── bulkhead.ts
│   ├── timeout.ts
│   └── policies/
│       └── compositePolicy.ts
└── [other existing files...]

tests/
├── observability/
│   ├── metrics/
│   │   ├── counter.test.ts
│   │   ├── gauge.test.ts
│   │   ├── histogram.test.ts
│   │   └── collector.test.ts
│   ├── tracing/
│   │   ├── span.test.ts
│   │   └── tracer.test.ts
│   └── health/
│       └── healthRegistry.test.ts
├── resilience/
│   ├── circuitBreaker.test.ts
│   ├── retryExecutor.test.ts
│   ├── bulkhead.test.ts
│   └── compositePolicy.test.ts
└── [other tests...]
```

---

## Priority 1: Observability - Phase Breakdown

### **Step 1.1: Create Type Definitions** (15 minutes)

**File:** `src/observability/types.ts`

**What to do:**
1. Create the file with metric types (Counter, Gauge, Histogram)
2. Add trace context and span interfaces
3. Add health check types
4. Source: IMPLEMENTATION_SPEC.md lines 68-243

**Checklist:**
- [ ] File created with all type definitions
- [ ] Enums for MetricType, SpanKind, SpanStatusCode, HealthStatus
- [ ] All interfaces properly documented with JSDoc

---

### **Step 1.2: Implement Counter Metric** (30 minutes)

**File:** `src/observability/metrics/counter.ts`

**What to do:**
1. Copy Counter implementation from IMPLEMENTATION_SPEC.md lines 380-449
2. Implement inc() method with validation
3. Implement getValue() and toPrometheusFormat() methods
4. Verify it handles labels correctly

**Validation:**
```bash
npm test -- tests/observability/metrics/counter.test.ts
```

**Checklist:**
- [ ] Counter class created
- [ ] inc() method works with default (1) and custom values
- [ ] inc() rejects negative values
- [ ] toPrometheusFormat() outputs valid Prometheus text
- [ ] Labels are properly formatted

**Expected output format:**
```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",path="/api"} 42
```

---

### **Step 1.3: Implement Gauge Metric** (20 minutes)

**File:** `src/observability/metrics/gauge.ts`

**What to do:**
1. Create Gauge class similar to Counter
2. Implement set(value), inc(amount), dec(amount) methods
3. Implement getValue() and toPrometheusFormat()
4. Gauge can increase/decrease, unlike Counter

**Key difference from Counter:**
- Counter is monotonically increasing only
- Gauge can go up and down

**Validation:**
```bash
npm test -- tests/observability/metrics/gauge.test.ts
```

**Checklist:**
- [ ] Gauge class created
- [ ] set() overwrites value
- [ ] inc() increases by amount (default 1)
- [ ] dec() decreases by amount (default 1)
- [ ] toPrometheusFormat() outputs correctly

---

### **Step 1.4: Implement Histogram Metric** (45 minutes)

**File:** `src/observability/metrics/histogram.ts`

**What to do:**
1. Create Histogram class with bucket support
2. Default buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
3. Implement observe(value) to record observations
4. Implement bucket calculation logic
5. Implement toPrometheusFormat() with bucket output

**Complexity:**
- Must maintain bucket counts
- Must track sum and count for calculating average
- Buckets must be cumulative

**Prometheus format:**
```
# HELP http_request_duration_seconds HTTP request duration
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.005"} 0
http_request_duration_seconds_bucket{le="0.01"} 1
...
http_request_duration_seconds_bucket{le="+Inf"} 42
http_request_duration_seconds_sum 156.234
http_request_duration_seconds_count 42
```

**Validation:**
```bash
npm test -- tests/observability/metrics/histogram.test.ts
```

**Checklist:**
- [ ] Histogram class created with buckets
- [ ] observe() properly increments buckets
- [ ] Bucket counts are cumulative (not individual)
- [ ] sum and count tracked
- [ ] toPrometheusFormat() valid
- [ ] Custom bucket support works

---

### **Step 1.5: Create MetricsCollector** (30 minutes)

**File:** `src/observability/metrics/collector.ts`

**What to do:**
1. Copy MetricsCollector from IMPLEMENTATION_SPEC.md lines 247-378
2. Implement createCounter(), createGauge(), createHistogram()
3. Prevent duplicate metric names with different types
4. Implement getMetrics() and toPrometheusFormat()
5. Implement clear() for testing

**Key features:**
- Registry pattern (centralized metrics)
- Type safety (can't create counter and gauge with same name)
- Prometheus export format

**Validation:**
```bash
npm test -- tests/observability/metrics/collector.test.ts
```

**Checklist:**
- [ ] MetricsCollector class created
- [ ] createCounter() works and prevents duplicates
- [ ] createGauge() works and prevents duplicates
- [ ] createHistogram() works and prevents duplicates
- [ ] toPrometheusFormat() combines all metrics
- [ ] getMetrics() returns array of metrics
- [ ] clear() resets all metrics

---

### **Step 1.6: Create Metrics Module Exports** (5 minutes)

**File:** `src/observability/metrics/index.ts`

**What to do:**
```typescript
export { Counter } from './counter';
export { Gauge } from './gauge';
export { Histogram } from './histogram';
export { MetricsCollector } from './collector';
export type { Metric, Labels, MetricType } from '../types';
```

---

### **Step 1.7: Implement Span Class** (1 hour)

**File:** `src/observability/tracing/span.ts`

**What to do:**
1. Implement SpanImpl class from IMPLEMENTATION_SPEC.md lines 451-559
2. Implement setAttribute(key, value)
3. Implement addEvent(name, attributes)
4. Implement setStatus(status)
5. Implement recordException(error)
6. Implement end(endTime?)

**Key features:**
- Immutable traceId, spanId, parentSpanId
- Mutable attributes, events, status
- Auto-timestamp for events
- Exception recording with stack trace

**Validation:**
```bash
npm test -- tests/observability/tracing/span.test.ts
```

**Checklist:**
- [ ] SpanImpl class created
- [ ] Constructor sets traceId, spanId, name, kind, startTime
- [ ] setAttribute() adds/updates attributes
- [ ] addEvent() with auto-timestamp
- [ ] setStatus() sets status code
- [ ] recordException() adds error event and error status
- [ ] end() sets endTime
- [ ] Can't set attributes after end()

---

### **Step 1.8: Implement Tracer Class** (45 minutes)

**File:** `src/observability/tracing/tracer.ts`

**What to do:**
1. Copy Tracer from IMPLEMENTATION_SPEC.md lines 451-559
2. Implement startSpan() with parent context support
3. Implement getSpan() to retrieve active spans
4. Implement getActiveSpans()
5. Implement exportSpans() for completed spans
6. Add sampling support

**Key features:**
- Trace ID generation (128-bit hex)
- Span ID generation (64-bit hex)
- Parent-child relationships
- Active span tracking
- Sampling decision support

**Validation:**
```bash
npm test -- tests/observability/tracing/tracer.test.ts
```

**Checklist:**
- [ ] Tracer class created
- [ ] startSpan() generates unique IDs
- [ ] startSpan() creates parent-child links
- [ ] getSpan() retrieves by spanId
- [ ] endSpan() removes from active
- [ ] getActiveSpans() returns all active
- [ ] exportSpans() returns completed
- [ ] Service name added to attributes

---

### **Step 1.9: Implement Sampling Strategies** (30 minutes)

**File:** `src/observability/tracing/sampler.ts`

**What to do:**
1. Implement Sampler interface
2. Implement ProbabilitySampler (samples N% of traces)
3. Implement AdaptiveSampler (samples errors + slow requests)
4. Add shouldSample() logic

**Sampling types:**
- **Probability:** Always sample (1.0), never (0.0), or percentage
- **Adaptive:** Sample errors always, slow responses (>1s), drop rest

**Validation:**
```bash
npm test -- tests/observability/tracing/sampler.test.ts
```

**Checklist:**
- [ ] Sampler interface defined
- [ ] ProbabilitySampler works at different rates
- [ ] AdaptiveSampler detects errors
- [ ] AdaptiveSampler detects slow (>threshold)
- [ ] shouldSample() returns SamplingDecision

---

### **Step 1.10: Implement HealthCheckRegistry** (30 minutes)

**File:** `src/observability/health/healthRegistry.ts`

**What to do:**
1. Copy from IMPLEMENTATION_SPEC.md lines 561-684
2. Implement register() to add health checks
3. Implement check() to run individual check
4. Implement checkAll() to run all checks in parallel
5. Implement getOverallStatus()

**Key features:**
- Register multiple health checks
- Run checks in parallel
- Aggregate status (DOWN > DEGRADED > UP)
- Error handling

**Validation:**
```bash
npm test -- tests/observability/health/healthRegistry.test.ts
```

**Checklist:**
- [ ] HealthCheckRegistry class created
- [ ] register() adds checks
- [ ] check() runs single check
- [ ] checkAll() runs all in parallel
- [ ] getOverallStatus() aggregates correctly
- [ ] Error in one check doesn't stop others
- [ ] getChecks() returns all registered

---

### **Step 1.11: Create Default Health Checks** (20 minutes)

**File:** `src/observability/health/defaultChecks.ts`

**What to do:**
1. Create MemoryHealthCheck (checks memory usage)
2. Create UptimeHealthCheck (tracks uptime)
3. Create basic examples that can be extended
4. Implement check() async method

**Example:**
```typescript
export class MemoryHealthCheck implements HealthCheck {
  name = 'memory';

  async check(): Promise<HealthCheckResult> {
    const used = process.memoryUsage().heapUsed;
    const total = process.memoryUsage().heapTotal;
    const percentage = (used / total) * 100;

    return {
      status: percentage > 90 ? HealthStatus.DEGRADED : HealthStatus.UP,
      message: `Memory usage: ${percentage.toFixed(2)}%`,
      timestamp: Date.now(),
      details: { used, total, percentage },
    };
  }
}
```

**Checklist:**
- [ ] MemoryHealthCheck implemented
- [ ] UptimeHealthCheck implemented
- [ ] Both return proper HealthCheckResult
- [ ] Status transitions work (UP/DEGRADED/DOWN)

---

### **Step 1.12: Create Observability Module Exports** (5 minutes)

**File:** `src/observability/index.ts`

**What to do:**
```typescript
export * from './metrics';
export * from './tracing';
export * from './health';
export * from './types';
```

---

### **Step 1.13: Write Metrics System Tests** (1.5 hours)

**Files:** `tests/observability/metrics/*.test.ts`

**What to do:**
1. Write counter.test.ts (10 test cases)
   - Basic increment
   - Reject negative
   - Labels work
   - Prometheus format

2. Write gauge.test.ts (12 test cases)
   - set/inc/dec operations
   - Labels
   - Prometheus format

3. Write histogram.test.ts (20 test cases)
   - Bucket calculation
   - Cumulative counts
   - Sum and count
   - Custom buckets
   - Prometheus format

4. Write collector.test.ts (15 test cases)
   - Create metrics
   - Prevent duplicates
   - Get metrics
   - Export to Prometheus

**Pattern:**
```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import { Counter } from '../../src/observability/metrics/counter';

test('Counter should increment', () => {
  const counter = new Counter('test', 'Test counter');
  counter.inc();
  assert.strictEqual(counter.getValue(), 1);
});
```

**Run:**
```bash
npm test -- tests/observability/metrics/counter.test.ts
npm test -- tests/observability/metrics/gauge.test.ts
npm test -- tests/observability/metrics/histogram.test.ts
npm test -- tests/observability/metrics/collector.test.ts
```

---

### **Step 1.14: Write Tracing System Tests** (1 hour)

**Files:** `tests/observability/tracing/*.test.ts`

**What to do:**
1. Write span.test.ts (10 test cases)
   - setAttribute works
   - addEvent works
   - recordException works
   - end() prevents modification

2. Write tracer.test.ts (15 test cases)
   - startSpan generates IDs
   - Parent-child links
   - getActiveSpans works
   - exportSpans returns completed
   - Service name set

**Run:**
```bash
npm test -- tests/observability/tracing/span.test.ts
npm test -- tests/observability/tracing/tracer.test.ts
```

---

### **Step 1.15: Write Health Check Tests** (45 minutes)

**File:** `tests/observability/health/healthRegistry.test.ts`

**What to do:**
1. 15 test cases for HealthCheckRegistry
2. Test register/unregister
3. Test check() individual
4. Test checkAll() parallel
5. Test getOverallStatus()
6. Test error handling

**Run:**
```bash
npm test -- tests/observability/health/healthRegistry.test.ts
```

---

### **Step 1.16: Add Metrics Endpoint to HttpServer** (30 minutes)

**File:** `src/core/httpServer.ts` (modifications)

**What to do:**
1. Add MetricsCollector instance to CortexHttpServer
2. Create /metrics GET endpoint
3. Return Prometheus text format
4. Set Content-Type: text/plain; version=0.0.4

**Code:**
```typescript
import { MetricsCollector } from '../observability/metrics/collector';

export class CortexHttpServer {
  private metrics = new MetricsCollector();

  constructor(port: number) {
    // ... existing code ...

    // Add metrics endpoint
    this.get('/metrics', (req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain; version=0.0.4' });
      res.end(this.metrics.toPrometheusFormat());
    });
  }

  public getMetrics(): MetricsCollector {
    return this.metrics;
  }
}
```

**Test:**
```bash
curl http://localhost:3000/metrics
```

---

### **Step 1.17: Add Health Endpoint to HttpServer** (30 minutes)

**File:** `src/core/httpServer.ts` (modifications)

**What to do:**
1. Add HealthCheckRegistry instance
2. Create /health GET endpoint
3. Return JSON with status and checks
4. Set status code 200 if UP, 503 if DOWN

**Code:**
```typescript
import { HealthCheckRegistry, HealthStatus } from '../observability/health/healthRegistry';

// In constructor:
this.healthRegistry = new HealthCheckRegistry();

// Add health endpoint
this.get('/health', async (req, res) => {
  const results = await this.healthRegistry.checkAll();
  const overallStatus = await this.healthRegistry.getOverallStatus();

  const statusCode = overallStatus === HealthStatus.UP ? 200 : 503;

  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: overallStatus,
    checks: Object.fromEntries(results),
  }));
});
```

---

### **Step 1.18: Integrate Metrics with ActorSystem** (1 hour)

**File:** `src/core/actorSystem.ts` (modifications)

**What to do:**
1. Add optional MetricsCollector parameter
2. Track actor messages sent (counter)
3. Track actor errors (counter)
4. Track actor restarts (counter)
5. Create HTTP middleware for request metrics

**Code additions:**
```typescript
import { MetricsCollector } from '../observability/metrics/collector';

export class ActorSystem {
  private metrics?: MetricsCollector;
  private messageCounter?: Counter;
  private errorCounter?: Counter;
  private restartCounter?: Counter;

  constructor(
    eventBus: EventBus,
    options?: {
      enableMetrics?: boolean;
      serviceName?: string;
    }
  ) {
    if (options?.enableMetrics) {
      this.metrics = new MetricsCollector();
      this.messageCounter = this.metrics.createCounter(
        'cortex_actor_messages_total',
        'Total actor messages'
      );
      this.errorCounter = this.metrics.createCounter(
        'cortex_actor_errors_total',
        'Total actor errors'
      );
      this.restartCounter = this.metrics.createCounter(
        'cortex_actor_restarts_total',
        'Total actor restarts'
      );
    }
  }

  dispatch(actorId: string, message: any): void {
    this.messageCounter?.inc();
    // ... rest of dispatch logic
  }

  public getMetrics(): MetricsCollector | undefined {
    return this.metrics;
  }
}
```

**Checklist:**
- [ ] MetricsCollector integrated
- [ ] Message counter incremented on dispatch
- [ ] Error counter incremented on failure
- [ ] Restart counter incremented on restart
- [ ] getMetrics() exposes metrics

---

## Priority 2: Resilience - Phase Breakdown

### **Step 2.1: Create Resilience Types** (20 minutes)

**File:** `src/resilience/types.ts`

**What to do:**
1. Copy from IMPLEMENTATION_SPEC.md lines 1114-1258
2. Define CircuitState enum (CLOSED, OPEN, HALF_OPEN)
3. Define CircuitBreakerConfig interface
4. Define RetryConfig interface
5. Define BulkheadConfig interface
6. Define TimeoutConfig interface
7. Define ResiliencePolicy interface

**Checklist:**
- [ ] All enums defined
- [ ] All config interfaces with defaults documented
- [ ] ResiliencePolicy interface defined
- [ ] JSDoc complete

---

### **Step 2.2: Create Resilience Errors** (10 minutes)

**File:** `src/resilience/errors.ts`

**What to do:**
```typescript
export class CircuitBreakerOpenError extends Error {
  constructor(message: string, public nextAttemptTime?: number) {
    super(message);
    this.name = 'CircuitBreakerOpenError';
  }
}

export class BulkheadRejectError extends Error {
  constructor(message: string, public details?: Record<string, any>) {
    super(message);
    this.name = 'BulkheadRejectError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}
```

---

### **Step 2.3: Implement Circuit Breaker** (1 hour)

**File:** `src/resilience/circuitBreaker.ts`

**What to do:**
1. Copy from IMPLEMENTATION_SPEC.md lines 1262-1485
2. Implement state machine (CLOSED → OPEN → HALF_OPEN)
3. Implement execute() with state logic
4. Implement rolling window statistics
5. Implement state change listeners
6. Implement reset()
7. Implement getStats()

**Key logic:**
- CLOSED: Pass through, track failures
- Open after N failures or % error rate
- OPEN: Reject immediately with CircuitBreakerOpenError
- After timeout, try HALF_OPEN
- HALF_OPEN: Allow limited requests
- Success → CLOSED, Failure → OPEN

**Validation:**
```bash
npm test -- tests/resilience/circuitBreaker.test.ts
```

**Checklist:**
- [ ] Starts in CLOSED state
- [ ] Tracks failures in window
- [ ] Opens after threshold
- [ ] Transitions to HALF_OPEN after timeout
- [ ] Closes on success from HALF_OPEN
- [ ] Reopens on failure from HALF_OPEN
- [ ] getStats() returns metrics
- [ ] State change events fire

---

### **Step 2.4: Implement Retry Executor** (45 minutes)

**File:** `src/resilience/retryExecutor.ts`

**What to do:**
1. Copy from IMPLEMENTATION_SPEC.md lines 1487-1637
2. Implement exponential backoff: delay = initialDelay * (multiplier ^ attempt)
3. Implement jitter: ± jitterFactor * delay
4. Implement error matchers for selective retry
5. Implement retry loop with max attempts
6. Export error matchers (network, server, timeout)

**Backoff formula:**
```
delay = initialDelay * (multiplier ^ attempt)
delay = min(delay, maxDelay)
jitter = delay * jitterFactor * (random -1 to 1)
final = delay + jitter
```

**Validation:**
```bash
npm test -- tests/resilience/retryExecutor.test.ts
```

**Checklist:**
- [ ] Retries on error (up to maxAttempts)
- [ ] Exponential backoff correct
- [ ] Jitter applied
- [ ] Max delay capped
- [ ] Error matchers work
- [ ] Non-retryable errors thrown immediately
- [ ] Logs retry attempts

---

### **Step 2.5: Implement Bulkhead** (45 minutes)

**File:** `src/resilience/bulkhead.ts`

**What to do:**
1. Copy from IMPLEMENTATION_SPEC.md lines 1639-1759
2. Implement Semaphore class (permits mechanism)
3. Implement Bulkhead using semaphore
4. Implement queue management
5. Implement rejection when queue full
6. Implement getStats()

**Key concepts:**
- Semaphore limits concurrent executions
- Queue holds waiting requests
- Reject if queue full
- Release permit after execution
- Thread-safe operations

**Validation:**
```bash
npm test -- tests/resilience/bulkhead.test.ts
```

**Checklist:**
- [ ] Limits concurrent executions
- [ ] Queues excess requests
- [ ] Rejects when queue full
- [ ] Releases permits
- [ ] getStats() shows queue size
- [ ] Thread-safe

---

### **Step 2.6: Implement Timeout Executor** (20 minutes)

**File:** `src/resilience/timeout.ts`

**What to do:**
```typescript
export class TimeoutExecutor implements ResiliencePolicy {
  constructor(private timeoutMs: number, private fallback?: () => any) {}

  public getName(): string {
    return 'TimeoutExecutor';
  }

  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) => {
        setTimeout(() => {
          if (this.fallback) {
            reject(this.fallback());
          } else {
            reject(new TimeoutError(`Operation timed out after ${this.timeoutMs}ms`));
          }
        }, this.timeoutMs);
      }),
    ]);
  }
}
```

**Checklist:**
- [ ] Timeout rejects after N ms
- [ ] Fallback used if provided
- [ ] Promise.race implementation
- [ ] CleanUp on timeout

---

### **Step 2.7: Implement Policy Composition** (30 minutes)

**File:** `src/resilience/policies/compositePolicy.ts`

**What to do:**
1. Copy from IMPLEMENTATION_SPEC.md lines 1762-1817
2. Implement CompositePolicy combining multiple policies
3. Policies wrap in reverse order
4. Each policy wraps the next one
5. Implement getName() showing chain

**Example:**
```typescript
const policy = new CompositePolicy([
  new CircuitBreaker(),    // Applied first
  new RetryExecutor(),     // Applied second
  new Bulkhead(),          // Applied third
  new TimeoutExecutor(),   // Applied last
]);
```

Execution order: Bulkhead → Timeout → Retry → CircuitBreaker → Function

**Validation:**
```bash
npm test -- tests/resilience/compositePolicy.test.ts
```

**Checklist:**
- [ ] Policies compose correctly
- [ ] Order is preserved
- [ ] Each policy wraps next
- [ ] getName() shows chain

---

### **Step 2.8: Create Resilience Module Exports** (5 minutes)

**File:** `src/resilience/index.ts`

**What to do:**
```typescript
export * from './types';
export * from './errors';
export { CircuitBreaker } from './circuitBreaker';
export { RetryExecutor, ErrorMatchers } from './retryExecutor';
export { Bulkhead } from './bulkhead';
export { TimeoutExecutor } from './timeout';
export { CompositePolicy } from './policies/compositePolicy';
```

---

### **Step 2.9: Write Resilience Tests** (3 hours)

**Files:** `tests/resilience/*.test.ts`

**What to do:**

**circuitBreaker.test.ts (35 tests):**
- State transitions
- Failure threshold
- Error percentage
- Volume threshold
- Metrics
- Concurrent safety

**retryExecutor.test.ts (20 tests):**
- Exponential backoff
- Jitter
- Error matchers
- Max attempts
- Retry timing

**bulkhead.test.ts (15 tests):**
- Concurrency limiting
- Queue management
- Rejection on full
- Metrics

**compositePolicy.test.ts (10 tests):**
- Policy chaining
- Error propagation
- State sharing

**Run all:**
```bash
npm test -- tests/resilience/
```

---

## Priority 3: Fix Placeholders - Phase Breakdown

### **Step 3.1: Fix Compression Middleware** (1 hour)

**File:** `src/performance/compression.ts`

**What to do:**
1. Replace entire file with real implementation
2. Copy from IMPLEMENTATION_SPEC.md lines 2112-2356
3. Use Node.js zlib for real compression
4. Implement Brotli and Gzip support
5. Add threshold for minimum size
6. Handle backpressure correctly

**Key features:**
- Accept-Encoding header parsing
- Select best encoding (prefer Brotli)
- Stream compression
- Threshold detection (min 1KB)
- Vary header for caching

**Test:**
```bash
npm test -- tests/performance/compression.test.ts
```

**Verification:**
```bash
# Test with curl
curl -H "Accept-Encoding: gzip" http://localhost:3000/api/data > /dev/null
# Should see Content-Encoding: gzip header
```

**Checklist:**
- [ ] Brotli compression works
- [ ] Gzip compression works
- [ ] Threshold respected (< 1KB not compressed)
- [ ] Accept-Encoding parsed correctly
- [ ] Vary header set
- [ ] Content-Encoding header set
- [ ] Content-Length removed (streaming)
- [ ] Backpressure handled

---

### **Step 3.2: Fix WorkerPool Message Passing** (1.5 hours)

**File:** `src/workers/workerPool.ts`

**What to do:**
1. Replace entire file with real implementation
2. Copy from IMPLEMENTATION_SPEC.md lines 2655-2951
3. Use Node.js Worker threads
4. Implement real postMessage communication
5. Implement worker lifecycle
6. Implement queue management
7. Handle worker errors

**Key features:**
- Real Worker threads (not setTimeout)
- Message passing with postMessage
- Worker pool management
- Task queue
- Worker restart on error
- Timeout handling

**Test:**
```bash
npm test -- tests/workers/workerPool.test.ts
```

**Checklist:**
- [ ] Worker threads created
- [ ] postMessage sends messages
- [ ] Message responses received
- [ ] Queue manages tasks
- [ ] Queue size limits respected
- [ ] Worker errors handled
- [ ] Shutdown cleans up
- [ ] No deadlocks

---

### **Step 3.3: Fix Wasm Memory Management** (1.5 hours)

**File:** `src/wasm/utils.ts`

**What to do:**
1. Replace placeholder with real implementation
2. Copy from IMPLEMENTATION_SPEC.md lines 2440-2642
3. Implement WasmMemoryManager class
4. Implement alloc() and free() for memory
5. Implement write() and read() operations
6. Implement memory growth
7. Add boundary checking

**Key features:**
- Real memory allocation in Wasm
- Proper deallocation
- Free list management
- Memory growth when needed
- Boundary checks
- Statistics tracking

**Test:**
```bash
npm test -- tests/wasm/memoryManager.test.ts
```

**Checklist:**
- [ ] alloc() allocates memory
- [ ] free() deallocates memory
- [ ] write() writes to memory
- [ ] read() reads from memory
- [ ] Memory grows when needed
- [ ] Boundary checks work
- [ ] getStats() accurate
- [ ] No memory leaks

---

## Integration Tasks

### **Step 4.1: Update Main Index** (10 minutes)

**File:** `src/index.ts`

**What to do:**
```typescript
// Add exports for new modules
export * from './observability';
export * from './resilience';
```

---

### **Step 4.2: Update Package.json** (5 minutes)

**What to do:**
1. Add test scripts if not present
2. Add build scripts if needed
3. Verify no new dependencies added (zero-dependency constraint)

---

### **Step 4.3: Create Example Files** (1 hour)

**Create:** `examples/observability-example.ts`
- Setup metrics
- Create /metrics endpoint
- Setup health checks
- Create /health endpoint

**Create:** `examples/resilience-example.ts`
- Circuit breaker with failure simulation
- Retry with exponential backoff
- Bulkhead with load
- Policy composition

**Create:** `examples/compression-example.ts`
- Setup compression middleware
- Show before/after sizes
- Test with curl

---

### **Step 4.4: Update README** (30 minutes)

**What to do:**
1. Add Observability section
   - Metrics overview
   - Health checks usage
   - Tracing setup

2. Add Resilience section
   - Circuit breaker patterns
   - Retry strategies
   - Bulkhead usage

3. Add examples section linking to example files

---

## Testing Verification Checklist

### **Run All Tests**
```bash
npm test
```

**Must pass:**
- [ ] All unit tests (metrics, tracing, health, circuit breaker, etc.)
- [ ] All integration tests
- [ ] Coverage >= 90% on new code

### **Coverage Report**
```bash
npm run test:coverage
```

**Must achieve:**
- [ ] Observability: 95%+
- [ ] Resilience: 95%+
- [ ] Placeholders: 90%+
- [ ] Overall: 90%+

### **Integration Tests**
- [ ] ActorSystem + Metrics works
- [ ] HttpServer /metrics endpoint works
- [ ] HttpServer /health endpoint works
- [ ] Circuit Breaker prevents cascade failures
- [ ] Retry policy recovers from transient failures
- [ ] Bulkhead limits concurrent load
- [ ] Compression actually compresses
- [ ] WorkerPool executes tasks
- [ ] Wasm memory allocates/deallocates

### **Performance Verification**
```bash
# Metrics performance (< 1μs per operation)
npm test -- tests/observability/metrics/collector.test.ts --grep "performance"

# Circuit breaker throughput (> 10,000 ops/ms)
npm test -- tests/resilience/circuitBreaker.test.ts --grep "throughput"
```

### **Type Checking**
```bash
npx tsc --noEmit
```

**Must pass:** No TypeScript errors

---

## Summary Table

| Phase | Task | Duration | Files | Tests | Status |
|-------|------|----------|-------|-------|--------|
| 1.1 | Types | 15 min | 1 | - | TODO |
| 1.2 | Counter | 30 min | 1 | 1 | TODO |
| 1.3 | Gauge | 20 min | 1 | 1 | TODO |
| 1.4 | Histogram | 45 min | 1 | 1 | TODO |
| 1.5 | Collector | 30 min | 1 | 1 | TODO |
| 1.6 | Metrics Export | 5 min | 1 | - | TODO |
| 1.7 | Span | 1 hr | 1 | 1 | TODO |
| 1.8 | Tracer | 45 min | 1 | 1 | TODO |
| 1.9 | Sampler | 30 min | 1 | 1 | TODO |
| 1.10 | Health Registry | 30 min | 1 | 1 | TODO |
| 1.11 | Default Checks | 20 min | 1 | - | TODO |
| 1.12 | Observability Export | 5 min | 1 | - | TODO |
| 1.13 | Metrics Tests | 1.5 hr | - | 4 | TODO |
| 1.14 | Tracing Tests | 1 hr | - | 2 | TODO |
| 1.15 | Health Tests | 45 min | - | 1 | TODO |
| 1.16 | /metrics Endpoint | 30 min | 1 | - | TODO |
| 1.17 | /health Endpoint | 30 min | 1 | - | TODO |
| 1.18 | ActorSystem Integration | 1 hr | 1 | - | TODO |
| **Phase 1 Total** | **Observability** | **~10 hours** | **16** | **10** | TODO |
| | | | | | |
| 2.1 | Resilience Types | 20 min | 1 | - | TODO |
| 2.2 | Resilience Errors | 10 min | 1 | - | TODO |
| 2.3 | Circuit Breaker | 1 hr | 1 | 1 | TODO |
| 2.4 | Retry Executor | 45 min | 1 | 1 | TODO |
| 2.5 | Bulkhead | 45 min | 1 | 1 | TODO |
| 2.6 | Timeout | 20 min | 1 | - | TODO |
| 2.7 | Composite Policy | 30 min | 1 | 1 | TODO |
| 2.8 | Resilience Export | 5 min | 1 | - | TODO |
| 2.9 | Resilience Tests | 3 hrs | - | 4 | TODO |
| **Phase 2 Total** | **Resilience** | **~7 hours** | **8** | **4** | TODO |
| | | | | | |
| 3.1 | Fix Compression | 1 hr | 1 | 1 | TODO |
| 3.2 | Fix WorkerPool | 1.5 hr | 1 | 1 | TODO |
| 3.3 | Fix Wasm | 1.5 hr | 1 | 1 | TODO |
| **Phase 3 Total** | **Placeholders** | **~4 hours** | **3** | **3** | TODO |
| | | | | | |
| 4.1 | Main Index | 10 min | 1 | - | TODO |
| 4.2 | Package.json | 5 min | 1 | - | TODO |
| 4.3 | Examples | 1 hr | 3 | - | TODO |
| 4.4 | README | 30 min | 1 | - | TODO |
| **Phase 4 Total** | **Integration** | **~2 hours** | **6** | **-** | TODO |
| | | | | | |
| **GRAND TOTAL** | **All Work** | **~23 hours** | **36 files** | **21 test files** | TODO |

---

## Next Steps

1. **Start with Phase 1.1** - Create type definitions
2. **Follow the checklist** for each step
3. **Run tests after each step** to validate
4. **Update TodoWrite** as you complete items
5. **Commit work** regularly to git

Good luck! 🚀

