# Cortex Framework - Complete Test Code Examples

## Table of Contents
1. [Priority 1: Observability Test Examples](#priority-1-observability-test-examples)
2. [Priority 2: Resilience Test Examples](#priority-2-resilience-test-examples)
3. [Priority 3: Placeholder Fixes Test Examples](#priority-3-placeholder-fixes-test-examples)
4. [Test Utilities Library](#test-utilities-library)
5. [Integration Test Examples](#integration-test-examples)
6. [Performance Test Examples](#performance-test-examples)

---

## Priority 1: Observability Test Examples

### 1. Metrics System Tests

#### File: `tests/observability/metrics.test.ts`

```typescript
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  MetricsRegistry,
  Counter,
  Gauge,
  Histogram,
  Summary
} from '../../src/observability/metrics';

describe('MetricsRegistry', () => {
  let registry: MetricsRegistry;

  beforeEach(() => {
    registry = new MetricsRegistry();
  });

  describe('Counter Metrics', () => {
    test('should create counter with default value of 0', () => {
      const counter = registry.counter('test_counter');
      assert.strictEqual(counter.value(), 0);
    });

    test('should increment counter by 1 when no value specified', () => {
      const counter = registry.counter('requests_total');
      counter.inc();
      counter.inc();
      counter.inc();

      assert.strictEqual(counter.value(), 3);
    });

    test('should increment counter by specified value', () => {
      const counter = registry.counter('bytes_transferred');
      counter.inc(1024);
      counter.inc(2048);

      assert.strictEqual(counter.value(), 3072);
    });

    test('should throw error on negative increment', () => {
      const counter = registry.counter('test_counter');

      assert.throws(
        () => counter.inc(-5),
        {
          name: 'Error',
          message: 'Counter can only be incremented by non-negative values'
        }
      );
    });

    test('should handle labels correctly', () => {
      const getCounter = registry.counter('http_requests_total', {
        method: 'GET',
        status: '200'
      });
      const postCounter = registry.counter('http_requests_total', {
        method: 'POST',
        status: '201'
      });

      getCounter.inc(5);
      postCounter.inc(3);

      assert.strictEqual(getCounter.value(), 5);
      assert.strictEqual(postCounter.value(), 3);
    });

    test('should reuse counter with same name and labels', () => {
      const counter1 = registry.counter('test', { env: 'prod' });
      const counter2 = registry.counter('test', { env: 'prod' });

      counter1.inc();
      counter2.inc();

      assert.strictEqual(counter1.value(), 2);
      assert.strictEqual(counter2.value(), 2);
      assert.strictEqual(counter1, counter2);
    });

    test('should validate metric name', () => {
      assert.throws(
        () => registry.counter('invalid-name!'),
        { message: /Metric name must match/ }
      );
    });

    test('should validate label names', () => {
      assert.throws(
        () => registry.counter('test', { 'invalid-label!': 'value' }),
        { message: /Label name must match/ }
      );
    });

    test('should export in Prometheus text format', () => {
      const counter = registry.counter('http_requests_total', {
        method: 'GET',
        status: '200'
      });
      counter.inc(42);

      const output = counter.toPrometheusFormat();

      assert.ok(output.includes('# HELP http_requests_total'));
      assert.ok(output.includes('# TYPE http_requests_total counter'));
      assert.ok(output.includes('http_requests_total{method="GET",status="200"} 42'));
    });

    test('should handle concurrent increments safely', async () => {
      const counter = registry.counter('concurrent_test');
      const promises: Promise<void>[] = [];

      for (let i = 0; i < 1000; i++) {
        promises.push(
          Promise.resolve().then(() => counter.inc())
        );
      }

      await Promise.all(promises);
      assert.strictEqual(counter.value(), 1000);
    });
  });

  describe('Gauge Metrics', () => {
    test('should set gauge to specific value', () => {
      const gauge = registry.gauge('temperature');
      gauge.set(23.5);

      assert.strictEqual(gauge.value(), 23.5);
    });

    test('should increment and decrement gauge', () => {
      const gauge = registry.gauge('queue_size');

      gauge.set(10);
      gauge.inc(5);
      assert.strictEqual(gauge.value(), 15);

      gauge.dec(3);
      assert.strictEqual(gauge.value(), 12);
    });

    test('should allow negative values', () => {
      const gauge = registry.gauge('temperature_celsius');
      gauge.set(-15.5);

      assert.strictEqual(gauge.value(), -15.5);
    });

    test('should set to current time', () => {
      const gauge = registry.gauge('last_update_timestamp');
      const before = Date.now() / 1000;

      gauge.setToCurrentTime();

      const after = Date.now() / 1000;
      const value = gauge.value();

      assert.ok(value >= before && value <= after);
    });

    test('should track function execution time', async () => {
      const gauge = registry.gauge('last_duration_seconds');

      await gauge.trackInProgress(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      const duration = gauge.value();
      assert.ok(duration >= 0.1 && duration <= 0.15);
    });
  });

  describe('Histogram Metrics', () => {
    test('should observe values and bucket correctly', () => {
      const histogram = registry.histogram('request_duration_seconds', {
        buckets: [0.1, 0.5, 1, 5]
      });

      histogram.observe(0.05);  // < 0.1
      histogram.observe(0.3);   // < 0.5
      histogram.observe(0.8);   // < 1
      histogram.observe(3);     // < 5
      histogram.observe(10);    // > 5

      const output = histogram.toPrometheusFormat();

      assert.ok(output.includes('le="0.1"} 1'));
      assert.ok(output.includes('le="0.5"} 2'));
      assert.ok(output.includes('le="1"} 3'));
      assert.ok(output.includes('le="5"} 4'));
      assert.ok(output.includes('le="+Inf"} 5'));
    });

    test('should calculate sum and count correctly', () => {
      const histogram = registry.histogram('test_histogram');

      histogram.observe(1.5);
      histogram.observe(2.5);
      histogram.observe(3.5);

      const output = histogram.toPrometheusFormat();

      assert.ok(output.includes('_sum 7.5'));
      assert.ok(output.includes('_count 3'));
    });

    test('should use default buckets if none specified', () => {
      const histogram = registry.histogram('default_buckets');

      const output = histogram.toPrometheusFormat();

      // Default buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
      assert.ok(output.includes('le="0.005"'));
      assert.ok(output.includes('le="10"'));
      assert.ok(output.includes('le="+Inf"'));
    });

    test('should time async function execution', async () => {
      const histogram = registry.histogram('function_duration_seconds');

      await histogram.time(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      const output = histogram.toPrometheusFormat();
      assert.ok(output.includes('_count 1'));

      // Check that sum is approximately 0.1 seconds
      const sumMatch = output.match(/_sum ([\d.]+)/);
      assert.ok(sumMatch);
      const sum = parseFloat(sumMatch[1]);
      assert.ok(sum >= 0.09 && sum <= 0.15);
    });

    test('should validate bucket configuration', () => {
      assert.throws(
        () => registry.histogram('test', { buckets: [5, 1, 10] }),
        { message: /Buckets must be sorted/ }
      );

      assert.throws(
        () => registry.histogram('test', { buckets: [-1, 0, 1] }),
        { message: /Buckets must be positive/ }
      );
    });
  });

  describe('Registry Operations', () => {
    test('should collect all registered metrics', () => {
      const counter = registry.counter('test_counter');
      const gauge = registry.gauge('test_gauge');
      const histogram = registry.histogram('test_histogram');

      counter.inc(5);
      gauge.set(10);
      histogram.observe(1.5);

      const output = registry.collect();

      assert.ok(output.includes('test_counter 5'));
      assert.ok(output.includes('test_gauge 10'));
      assert.ok(output.includes('test_histogram'));
    });

    test('should clear all metrics', () => {
      registry.counter('test1').inc();
      registry.gauge('test2').set(42);

      registry.clear();

      const output = registry.collect();
      assert.strictEqual(output, '');
    });

    test('should get metrics by name', () => {
      const counter = registry.counter('my_counter');
      const retrieved = registry.getMetric('my_counter');

      assert.strictEqual(counter, retrieved);
    });

    test('should list all metric names', () => {
      registry.counter('counter1');
      registry.gauge('gauge1');
      registry.histogram('histogram1');

      const names = registry.getMetricNames();

      assert.ok(names.includes('counter1'));
      assert.ok(names.includes('gauge1'));
      assert.ok(names.includes('histogram1'));
    });
  });

  describe('Performance', () => {
    test('counter increment should be fast', () => {
      const counter = registry.counter('perf_test');
      const iterations = 100000;

      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        counter.inc();
      }

      const duration = performance.now() - start;
      const opsPerMs = iterations / duration;

      // Should be able to do at least 10,000 increments per millisecond
      assert.ok(opsPerMs > 10000, `Performance too slow: ${opsPerMs} ops/ms`);
    });

    test('histogram observation should be fast', () => {
      const histogram = registry.histogram('perf_histogram');
      const iterations = 50000;

      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        histogram.observe(Math.random() * 10);
      }

      const duration = performance.now() - start;
      const opsPerMs = iterations / duration;

      // Should be able to do at least 5,000 observations per millisecond
      assert.ok(opsPerMs > 5000, `Performance too slow: ${opsPerMs} ops/ms`);
    });

    test('collection should be fast', () => {
      // Create 100 metrics
      for (let i = 0; i < 100; i++) {
        registry.counter(`counter_${i}`).inc(i);
      }

      const start = performance.now();
      const output = registry.collect();
      const duration = performance.now() - start;

      assert.ok(output.length > 0);
      assert.ok(duration < 50, `Collection too slow: ${duration}ms`);
    });
  });
});
```

### 2. Tracing System Tests

#### File: `tests/observability/tracing.test.ts`

```typescript
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  Tracer,
  Span,
  SpanKind,
  SpanStatusCode,
  TraceContext,
  TraceContextPropagator
} from '../../src/observability/tracing';

describe('Tracing System', () => {
  let tracer: Tracer;

  beforeEach(() => {
    tracer = new Tracer();
  });

  describe('TraceContext', () => {
    test('should generate valid trace ID', () => {
      const ctx = TraceContext.generate();

      assert.strictEqual(ctx.traceId.length, 32, 'Trace ID should be 32 hex chars');
      assert.ok(/^[0-9a-f]{32}$/.test(ctx.traceId), 'Trace ID should be valid hex');
      assert.notStrictEqual(ctx.traceId, '00000000000000000000000000000000');
    });

    test('should generate valid span ID', () => {
      const ctx = TraceContext.generate();

      assert.strictEqual(ctx.spanId.length, 16, 'Span ID should be 16 hex chars');
      assert.ok(/^[0-9a-f]{16}$/.test(ctx.spanId), 'Span ID should be valid hex');
      assert.notStrictEqual(ctx.spanId, '0000000000000000');
    });

    test('should generate unique trace IDs', () => {
      const ctx1 = TraceContext.generate();
      const ctx2 = TraceContext.generate();
      const ctx3 = TraceContext.generate();

      assert.notStrictEqual(ctx1.traceId, ctx2.traceId);
      assert.notStrictEqual(ctx2.traceId, ctx3.traceId);
      assert.notStrictEqual(ctx1.traceId, ctx3.traceId);
    });

    test('should parse valid W3C traceparent header', () => {
      const header = '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01';
      const ctx = TraceContext.fromTraceparent(header);

      assert.strictEqual(ctx.traceId, '4bf92f3577b34da6a3ce929d0e0e4736');
      assert.strictEqual(ctx.spanId, '00f067aa0ba902b7');
      assert.strictEqual(ctx.traceFlags, 0x01);
    });

    test('should throw on invalid traceparent format', () => {
      const invalidHeaders = [
        'invalid',
        '00-invalid-trace-id-00f067aa0ba902b7-01',
        '00-4bf92f3577b34da6a3ce929d0e0e4736-invalid-span-01',
        '99-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01', // invalid version
      ];

      for (const header of invalidHeaders) {
        assert.throws(
          () => TraceContext.fromTraceparent(header),
          { message: /Invalid traceparent/ }
        );
      }
    });

    test('should format W3C traceparent header', () => {
      const ctx = new TraceContext(
        '4bf92f3577b34da6a3ce929d0e0e4736',
        '00f067aa0ba902b7',
        0x01
      );

      const header = ctx.toTraceparent();
      assert.strictEqual(header, '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01');
    });

    test('should handle tracestate header', () => {
      const ctx = new TraceContext(
        '4bf92f3577b34da6a3ce929d0e0e4736',
        '00f067aa0ba902b7',
        0x01,
        'vendor1=value1,vendor2=value2'
      );

      assert.strictEqual(ctx.traceState, 'vendor1=value1,vendor2=value2');
    });
  });

  describe('Span Creation', () => {
    test('should create root span', () => {
      const span = tracer.startSpan('root-operation');

      assert.ok(span.traceId);
      assert.ok(span.spanId);
      assert.strictEqual(span.parentSpanId, undefined);
      assert.strictEqual(span.name, 'root-operation');
      assert.strictEqual(span.kind, SpanKind.INTERNAL);
    });

    test('should create child span', () => {
      const parentSpan = tracer.startSpan('parent');
      const childSpan = tracer.startSpan('child', { parent: parentSpan });

      assert.strictEqual(childSpan.traceId, parentSpan.traceId);
      assert.strictEqual(childSpan.parentSpanId, parentSpan.spanId);
      assert.notStrictEqual(childSpan.spanId, parentSpan.spanId);
    });

    test('should set span kind', () => {
      const span = tracer.startSpan('operation', {
        kind: SpanKind.CLIENT
      });

      assert.strictEqual(span.kind, SpanKind.CLIENT);
    });

    test('should set initial attributes', () => {
      const span = tracer.startSpan('operation', {
        attributes: {
          'service.name': 'my-service',
          'service.version': '1.0.0'
        }
      });

      assert.strictEqual(span.getAttribute('service.name'), 'my-service');
      assert.strictEqual(span.getAttribute('service.version'), '1.0.0');
    });

    test('should record start time', () => {
      const before = Date.now() * 1000000; // nanoseconds
      const span = tracer.startSpan('operation');
      const after = Date.now() * 1000000;

      assert.ok(span.startTime >= before && span.startTime <= after);
    });
  });

  describe('Span Operations', () => {
    test('should set attributes', () => {
      const span = tracer.startSpan('operation');

      span.setAttribute('http.method', 'GET');
      span.setAttribute('http.url', 'https://example.com/api');
      span.setAttribute('http.status_code', 200);

      assert.strictEqual(span.getAttribute('http.method'), 'GET');
      assert.strictEqual(span.getAttribute('http.url'), 'https://example.com/api');
      assert.strictEqual(span.getAttribute('http.status_code'), 200);
    });

    test('should add events', () => {
      const span = tracer.startSpan('operation');

      span.addEvent('cache-miss');
      span.addEvent('database-query', {
        'db.statement': 'SELECT * FROM users',
        'db.rows_affected': 5
      });

      const events = span.getEvents();
      assert.strictEqual(events.length, 2);
      assert.strictEqual(events[0].name, 'cache-miss');
      assert.strictEqual(events[1].name, 'database-query');
      assert.strictEqual(events[1].attributes['db.statement'], 'SELECT * FROM users');
    });

    test('should record exceptions', () => {
      const span = tracer.startSpan('operation');
      const error = new Error('Something went wrong');

      span.recordException(error);

      const events = span.getEvents();
      assert.strictEqual(events.length, 1);
      assert.strictEqual(events[0].name, 'exception');
      assert.strictEqual(events[0].attributes['exception.type'], 'Error');
      assert.strictEqual(events[0].attributes['exception.message'], 'Something went wrong');
      assert.ok(events[0].attributes['exception.stacktrace']);
    });

    test('should set status', () => {
      const span = tracer.startSpan('operation');

      span.setStatus({ code: SpanStatusCode.OK });
      assert.strictEqual(span.getStatus().code, SpanStatusCode.OK);

      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: 'Operation failed'
      });
      assert.strictEqual(span.getStatus().code, SpanStatusCode.ERROR);
      assert.strictEqual(span.getStatus().message, 'Operation failed');
    });

    test('should end span', () => {
      const span = tracer.startSpan('operation');
      const before = Date.now() * 1000000;

      span.end();

      const after = Date.now() * 1000000;

      assert.ok(span.endTime);
      assert.ok(span.endTime >= before && span.endTime <= after);
      assert.ok(span.endTime > span.startTime);
    });

    test('should calculate duration', () => {
      const span = tracer.startSpan('operation');

      // Simulate some work
      const start = Date.now();
      while (Date.now() - start < 50) {} // Busy wait 50ms

      span.end();

      const durationMs = span.getDuration() / 1000000;
      assert.ok(durationMs >= 45 && durationMs <= 100);
    });
  });

  describe('Context Propagation', () => {
    test('should inject context into HTTP headers', () => {
      const span = tracer.startSpan('http-request');
      const propagator = new TraceContextPropagator();
      const headers: Record<string, string> = {};

      propagator.inject(span.context(), headers);

      assert.ok(headers['traceparent']);
      assert.ok(headers['traceparent'].startsWith('00-'));
      assert.ok(headers['traceparent'].includes(span.traceId));
      assert.ok(headers['traceparent'].includes(span.spanId));
    });

    test('should extract context from HTTP headers', () => {
      const headers = {
        'traceparent': '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01'
      };
      const propagator = new TraceContextPropagator();

      const ctx = propagator.extract(headers);

      assert.ok(ctx);
      assert.strictEqual(ctx.traceId, '4bf92f3577b34da6a3ce929d0e0e4736');
      assert.strictEqual(ctx.spanId, '00f067aa0ba902b7');
      assert.strictEqual(ctx.traceFlags, 0x01);
    });

    test('should propagate tracestate', () => {
      const headers = {
        'traceparent': '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01',
        'tracestate': 'vendor1=value1,vendor2=value2'
      };
      const propagator = new TraceContextPropagator();

      const ctx = propagator.extract(headers);

      assert.strictEqual(ctx?.traceState, 'vendor1=value1,vendor2=value2');
    });
  });

  describe('Semantic Conventions', () => {
    test('should set HTTP span attributes', () => {
      const span = tracer.startSpan('GET /api/users', {
        kind: SpanKind.SERVER,
        attributes: {
          'http.method': 'GET',
          'http.url': 'https://api.example.com/api/users',
          'http.target': '/api/users',
          'http.host': 'api.example.com',
          'http.scheme': 'https',
          'http.status_code': 200,
          'http.user_agent': 'Mozilla/5.0...'
        }
      });

      assert.strictEqual(span.getAttribute('http.method'), 'GET');
      assert.strictEqual(span.getAttribute('http.status_code'), 200);
    });

    test('should set database span attributes', () => {
      const span = tracer.startSpan('SELECT users', {
        kind: SpanKind.CLIENT,
        attributes: {
          'db.system': 'postgresql',
          'db.connection_string': 'postgresql://localhost:5432/mydb',
          'db.user': 'app_user',
          'db.name': 'mydb',
          'db.statement': 'SELECT * FROM users WHERE id = $1',
          'db.operation': 'SELECT'
        }
      });

      assert.strictEqual(span.getAttribute('db.system'), 'postgresql');
      assert.strictEqual(span.getAttribute('db.operation'), 'SELECT');
    });
  });

  describe('Span Exporter', () => {
    test('should export span in correct format', () => {
      const span = tracer.startSpan('test-operation', {
        attributes: { 'test.attr': 'value' }
      });
      span.addEvent('test-event');
      span.end();

      const exported = span.toJSON();

      assert.strictEqual(exported.name, 'test-operation');
      assert.ok(exported.traceId);
      assert.ok(exported.spanId);
      assert.ok(exported.startTime);
      assert.ok(exported.endTime);
      assert.ok(exported.attributes);
      assert.ok(exported.events);
      assert.strictEqual(exported.attributes['test.attr'], 'value');
    });
  });
});
```

### 3. Health Check System Tests

#### File: `tests/observability/health-checks.test.ts`

```typescript
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  HealthCheck,
  HealthStatus,
  HealthAggregator,
  HealthCheckResult
} from '../../src/observability/health-checks';

describe('Health Check System', () => {
  describe('Individual Health Checks', () => {
    test('should return healthy status', async () => {
      const check = new SimpleHealthCheck('test-service', async () => ({
        status: 'healthy',
        message: 'Service is running'
      }));

      const result = await check.check();

      assert.strictEqual(result.status, 'healthy');
      assert.strictEqual(result.message, 'Service is running');
      assert.ok(result.timestamp > 0);
    });

    test('should return unhealthy status', async () => {
      const check = new SimpleHealthCheck('test-service', async () => ({
        status: 'unhealthy',
        message: 'Service is down'
      }));

      const result = await check.check();

      assert.strictEqual(result.status, 'unhealthy');
      assert.strictEqual(result.message, 'Service is down');
    });

    test('should return degraded status', async () => {
      const check = new SimpleHealthCheck('test-service', async () => ({
        status: 'degraded',
        message: 'Service is slow',
        details: { latency: 5000 }
      }));

      const result = await check.check();

      assert.strictEqual(result.status, 'degraded');
      assert.ok(result.details);
      assert.strictEqual(result.details.latency, 5000);
    });

    test('should timeout if check takes too long', async () => {
      const slowCheck = new SimpleHealthCheck('slow-service', async () => {
        await new Promise(resolve => setTimeout(resolve, 5000));
        return { status: 'healthy' };
      });

      const aggregator = new HealthAggregator({ timeout: 100 });
      aggregator.registerCheck(slowCheck);

      const start = Date.now();
      const result = await aggregator.checkAll();
      const duration = Date.now() - start;

      assert.ok(duration < 200, 'Should timeout quickly');
      assert.strictEqual(result.checks['slow-service'].status, 'unhealthy');
      assert.ok(result.checks['slow-service'].message?.includes('timeout'));
    });

    test('should handle check errors gracefully', async () => {
      const failingCheck = new SimpleHealthCheck('failing-service', async () => {
        throw new Error('Check failed');
      });

      const result = await failingCheck.check();

      assert.strictEqual(result.status, 'unhealthy');
      assert.ok(result.message?.includes('Check failed'));
    });
  });

  describe('Database Health Check', () => {
    test('should check database connection', async () => {
      const mockDb = {
        query: async () => [{ result: 1 }]
      };

      const check = new DatabaseHealthCheck('postgres', mockDb);
      const result = await check.check();

      assert.strictEqual(result.status, 'healthy');
    });

    test('should report unhealthy on connection failure', async () => {
      const mockDb = {
        query: async () => {
          throw new Error('Connection refused');
        }
      };

      const check = new DatabaseHealthCheck('postgres', mockDb);
      const result = await check.check();

      assert.strictEqual(result.status, 'unhealthy');
      assert.ok(result.message?.includes('Connection refused'));
    });
  });

  describe('HTTP Health Check', () => {
    test('should check HTTP endpoint', async () => {
      const mockFetch = async () => ({
        ok: true,
        status: 200
      });

      const check = new HttpHealthCheck('api-service', 'http://localhost:3000/health', {
        fetch: mockFetch as any
      });

      const result = await check.check();

      assert.strictEqual(result.status, 'healthy');
    });

    test('should report unhealthy on non-200 response', async () => {
      const mockFetch = async () => ({
        ok: false,
        status: 503
      });

      const check = new HttpHealthCheck('api-service', 'http://localhost:3000/health', {
        fetch: mockFetch as any
      });

      const result = await check.check();

      assert.strictEqual(result.status, 'unhealthy');
    });
  });

  describe('Memory Health Check', () => {
    test('should check memory usage', async () => {
      const check = new MemoryHealthCheck({
        thresholdPercent: 90
      });

      const result = await check.check();

      assert.ok(['healthy', 'degraded'].includes(result.status));
      assert.ok(result.details);
      assert.ok(result.details.heapUsed);
      assert.ok(result.details.heapTotal);
    });

    test('should report degraded when memory usage high', async () => {
      // Mock process.memoryUsage to return high values
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = () => ({
        rss: 1000000000,
        heapTotal: 1000000000,
        heapUsed: 950000000, // 95% usage
        external: 0,
        arrayBuffers: 0
      });

      const check = new MemoryHealthCheck({
        thresholdPercent: 90
      });

      const result = await check.check();

      assert.strictEqual(result.status, 'degraded');

      // Restore original
      process.memoryUsage = originalMemoryUsage;
    });
  });

  describe('Health Aggregator', () => {
    test('should aggregate multiple health checks', async () => {
      const aggregator = new HealthAggregator();

      aggregator.registerCheck(new SimpleHealthCheck('service1', async () => ({
        status: 'healthy'
      })));
      aggregator.registerCheck(new SimpleHealthCheck('service2', async () => ({
        status: 'healthy'
      })));

      const result = await aggregator.checkAll();

      assert.strictEqual(result.status, 'healthy');
      assert.strictEqual(Object.keys(result.checks).length, 2);
    });

    test('should report unhealthy if any check is unhealthy', async () => {
      const aggregator = new HealthAggregator();

      aggregator.registerCheck(new SimpleHealthCheck('service1', async () => ({
        status: 'healthy'
      })));
      aggregator.registerCheck(new SimpleHealthCheck('service2', async () => ({
        status: 'unhealthy',
        message: 'Service is down'
      })));

      const result = await aggregator.checkAll();

      assert.strictEqual(result.status, 'unhealthy');
    });

    test('should report degraded if any check is degraded but none unhealthy', async () => {
      const aggregator = new HealthAggregator();

      aggregator.registerCheck(new SimpleHealthCheck('service1', async () => ({
        status: 'healthy'
      })));
      aggregator.registerCheck(new SimpleHealthCheck('service2', async () => ({
        status: 'degraded',
        message: 'Service is slow'
      })));

      const result = await aggregator.checkAll();

      assert.strictEqual(result.status, 'degraded');
    });

    test('should run checks in parallel', async () => {
      const aggregator = new HealthAggregator();

      // Add 3 checks that each take 100ms
      for (let i = 0; i < 3; i++) {
        aggregator.registerCheck(new SimpleHealthCheck(`service${i}`, async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return { status: 'healthy' };
        }));
      }

      const start = Date.now();
      await aggregator.checkAll();
      const duration = Date.now() - start;

      // Should take ~100ms (parallel), not ~300ms (sequential)
      assert.ok(duration < 200, `Checks should run in parallel: ${duration}ms`);
    });

    test('should cache results for specified duration', async () => {
      const aggregator = new HealthAggregator({ cacheTtl: 1000 });
      let callCount = 0;

      aggregator.registerCheck(new SimpleHealthCheck('service', async () => {
        callCount++;
        return { status: 'healthy' };
      }));

      await aggregator.checkAll();
      await aggregator.checkAll();
      await aggregator.checkAll();

      // Should only call once due to caching
      assert.strictEqual(callCount, 1);

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      await aggregator.checkAll();

      // Should call again after cache expiration
      assert.strictEqual(callCount, 2);
    });
  });

  describe('Health Endpoint Integration', () => {
    test('should expose /health endpoint', async () => {
      const server = new CortexHttpServer({ port: 0 });
      const aggregator = new HealthAggregator();

      aggregator.registerCheck(new SimpleHealthCheck('test', async () => ({
        status: 'healthy'
      })));

      server.enableHealthChecks(aggregator);
      await server.start();

      const response = await fetch(`http://localhost:${server.port}/health`);
      const body = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(body.status, 'healthy');

      await server.stop();
    });

    test('should return 503 when unhealthy', async () => {
      const server = new CortexHttpServer({ port: 0 });
      const aggregator = new HealthAggregator();

      aggregator.registerCheck(new SimpleHealthCheck('test', async () => ({
        status: 'unhealthy',
        message: 'Service down'
      })));

      server.enableHealthChecks(aggregator);
      await server.start();

      const response = await fetch(`http://localhost:${server.port}/health`);

      assert.strictEqual(response.status, 503);

      await server.stop();
    });

    test('should expose /ready endpoint for readiness checks', async () => {
      const server = new CortexHttpServer({ port: 0 });
      const livenessAggregator = new HealthAggregator();
      const readinessAggregator = new HealthAggregator();

      livenessAggregator.registerCheck(new SimpleHealthCheck('basic', async () => ({
        status: 'healthy'
      })));

      readinessAggregator.registerCheck(new SimpleHealthCheck('database', async () => ({
        status: 'healthy'
      })));

      server.enableHealthChecks(livenessAggregator, readinessAggregator);
      await server.start();

      const healthResponse = await fetch(`http://localhost:${server.port}/health`);
      const readyResponse = await fetch(`http://localhost:${server.port}/ready`);

      assert.strictEqual(healthResponse.status, 200);
      assert.strictEqual(readyResponse.status, 200);

      await server.stop();
    });
  });
});

// Helper class for simple health checks
class SimpleHealthCheck implements HealthCheck {
  constructor(
    public name: string,
    private checkFn: () => Promise<Partial<HealthStatus>>
  ) {}

  async check(): Promise<HealthStatus> {
    try {
      const result = await this.checkFn();
      return {
        status: result.status || 'healthy',
        message: result.message,
        details: result.details,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
    }
  }
}
```

---

## Priority 2: Resilience Test Examples

### 1. Circuit Breaker Tests (Complete Suite)

#### File: `tests/resilience/circuit-breaker.test.ts`

```typescript
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  CircuitBreaker,
  CircuitState,
  CircuitBreakerConfig,
  CircuitBreakerOpenError
} from '../../src/resilience/circuit-breaker';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;
  let defaultConfig: CircuitBreakerConfig;

  beforeEach(() => {
    defaultConfig = {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000,
      volumeThreshold: 10,
      errorThresholdPercentage: 50,
      rollingWindowSize: 10000
    };
    breaker = new CircuitBreaker(defaultConfig);
  });

  describe('Initialization', () => {
    test('should start in CLOSED state', () => {
      assert.strictEqual(breaker.getState(), CircuitState.CLOSED);
    });

    test('should validate configuration', () => {
      assert.throws(
        () => new CircuitBreaker({ ...defaultConfig, failureThreshold: -1 }),
        { message: /failureThreshold must be positive/ }
      );

      assert.throws(
        () => new CircuitBreaker({ ...defaultConfig, timeout: 0 }),
        { message: /timeout must be positive/ }
      );

      assert.throws(
        () => new CircuitBreaker({ ...defaultConfig, errorThresholdPercentage: 150 }),
        { message: /errorThresholdPercentage must be between 0 and 100/ }
      );
    });
  });

  describe('CLOSED State Behavior', () => {
    test('should execute successful operations', async () => {
      const result = await breaker.execute(() => Promise.resolve('success'));
      assert.strictEqual(result, 'success');
      assert.strictEqual(breaker.getState(), CircuitState.CLOSED);
    });

    test('should track metrics for successful operations', async () => {
      await breaker.execute(() => Promise.resolve('ok'));
      await breaker.execute(() => Promise.resolve('ok'));

      const metrics = breaker.getMetrics();
      assert.strictEqual(metrics.totalSuccesses, 2);
      assert.strictEqual(metrics.totalFailures, 0);
    });

    test('should propagate errors', async () => {
      await assert.rejects(
        () => breaker.execute(() => Promise.reject(new Error('Operation failed'))),
        { message: 'Operation failed' }
      );
    });

    test('should track metrics for failed operations', async () => {
      try {
        await breaker.execute(() => Promise.reject(new Error('fail')));
      } catch (e) {}

      const metrics = breaker.getMetrics();
      assert.strictEqual(metrics.totalFailures, 1);
    });

    test('should remain CLOSED with low error rate', async () => {
      // 20 requests: 4 failures (20%) - below 50% threshold
      for (let i = 0; i < 20; i++) {
        try {
          if (i < 4) {
            await breaker.execute(() => Promise.reject(new Error('fail')));
          } else {
            await breaker.execute(() => Promise.resolve('ok'));
          }
        } catch (e) {}
      }

      assert.strictEqual(breaker.getState(), CircuitState.CLOSED);
    });
  });

  describe('CLOSED -> OPEN Transition', () => {
    test('should open after error threshold exceeded', async () => {
      // 20 requests: 11 failures (55%) - above 50% threshold
      for (let i = 0; i < 20; i++) {
        try {
          if (i < 11) {
            await breaker.execute(() => Promise.reject(new Error('fail')));
          } else {
            await breaker.execute(() => Promise.resolve('ok'));
          }
        } catch (e) {}
      }

      assert.strictEqual(breaker.getState(), CircuitState.OPEN);
    });

    test('should respect volume threshold', async () => {
      // Only 5 requests (below volumeThreshold of 10), all failures
      for (let i = 0; i < 5; i++) {
        try {
          await breaker.execute(() => Promise.reject(new Error('fail')));
        } catch (e) {}
      }

      // Should stay CLOSED due to low volume
      assert.strictEqual(breaker.getState(), CircuitState.CLOSED);
    });

    test('should emit stateChange event on opening', async () => {
      let eventReceived = false;
      let eventData: any = null;

      breaker.on('stateChange', (data) => {
        eventReceived = true;
        eventData = data;
      });

      // Trip the circuit
      for (let i = 0; i < 20; i++) {
        try {
          await breaker.execute(() => Promise.reject(new Error('fail')));
        } catch (e) {}
      }

      assert.ok(eventReceived);
      assert.strictEqual(eventData.from, CircuitState.CLOSED);
      assert.strictEqual(eventData.to, CircuitState.OPEN);
    });
  });

  describe('OPEN State Behavior', () => {
    beforeEach(async () => {
      // Trip the circuit
      for (let i = 0; i < 20; i++) {
        try {
          await breaker.execute(() => Promise.reject(new Error('fail')));
        } catch (e) {}
      }
      assert.strictEqual(breaker.getState(), CircuitState.OPEN);
    });

    test('should reject requests immediately', async () => {
      await assert.rejects(
        () => breaker.execute(() => Promise.resolve('success')),
        (error) => {
          assert.ok(error instanceof CircuitBreakerOpenError);
          assert.ok(error.message.includes('Circuit breaker is OPEN'));
          return true;
        }
      );
    });

    test('should not execute the function when OPEN', async () => {
      let executed = false;

      try {
        await breaker.execute(() => {
          executed = true;
          return Promise.resolve('ok');
        });
      } catch (e) {}

      assert.strictEqual(executed, false);
    });

    test('should track rejection metrics', async () => {
      const beforeRejections = breaker.getMetrics().totalRejections;

      try {
        await breaker.execute(() => Promise.resolve('ok'));
      } catch (e) {}

      const afterRejections = breaker.getMetrics().totalRejections;
      assert.strictEqual(afterRejections, beforeRejections + 1);
    });
  });

  describe('OPEN -> HALF_OPEN Transition', () => {
    test('should transition after timeout', async () => {
      const shortTimeoutBreaker = new CircuitBreaker({
        ...defaultConfig,
        timeout: 100
      });

      // Trip the circuit
      for (let i = 0; i < 20; i++) {
        try {
          await shortTimeoutBreaker.execute(() => Promise.reject(new Error('fail')));
        } catch (e) {}
      }

      assert.strictEqual(shortTimeoutBreaker.getState(), CircuitState.OPEN);

      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 150));

      // Next request should attempt execution
      try {
        await shortTimeoutBreaker.execute(() => Promise.resolve('ok'));
      } catch (e) {}

      assert.strictEqual(shortTimeoutBreaker.getState(), CircuitState.HALF_OPEN);
    });

    test('should emit stateChange event', async () => {
      const shortTimeoutBreaker = new CircuitBreaker({
        ...defaultConfig,
        timeout: 100
      });

      let transitionEvents: any[] = [];

      shortTimeoutBreaker.on('stateChange', (data) => {
        transitionEvents.push(data);
      });

      // Trip the circuit
      for (let i = 0; i < 20; i++) {
        try {
          await shortTimeoutBreaker.execute(() => Promise.reject(new Error('fail')));
        } catch (e) {}
      }

      await new Promise(resolve => setTimeout(resolve, 150));

      try {
        await shortTimeoutBreaker.execute(() => Promise.resolve('ok'));
      } catch (e) {}

      // Should have CLOSED->OPEN and OPEN->HALF_OPEN
      assert.ok(transitionEvents.length >= 2);
      assert.strictEqual(transitionEvents[transitionEvents.length - 1].to, CircuitState.HALF_OPEN);
    });
  });

  describe('HALF_OPEN State Behavior', () => {
    let halfOpenBreaker: CircuitBreaker;

    beforeEach(async () => {
      halfOpenBreaker = new CircuitBreaker({
        ...defaultConfig,
        timeout: 100
      });

      // Trip the circuit
      for (let i = 0; i < 20; i++) {
        try {
          await halfOpenBreaker.execute(() => Promise.reject(new Error('fail')));
        } catch (e) {}
      }

      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 150));

      // Transition to HALF_OPEN
      try {
        await halfOpenBreaker.execute(() => Promise.resolve('ok'));
      } catch (e) {}

      assert.strictEqual(halfOpenBreaker.getState(), CircuitState.HALF_OPEN);
    });

    test('should allow trial requests', async () => {
      const result = await halfOpenBreaker.execute(() => Promise.resolve('trial'));
      assert.strictEqual(result, 'trial');
    });

    test('should close after success threshold reached', async () => {
      await halfOpenBreaker.execute(() => Promise.resolve('ok'));
      await halfOpenBreaker.execute(() => Promise.resolve('ok'));

      // Should have closed after 2 successes (successThreshold: 2)
      assert.strictEqual(halfOpenBreaker.getState(), CircuitState.CLOSED);
    });

    test('should reopen immediately on failure', async () => {
      try {
        await halfOpenBreaker.execute(() => Promise.reject(new Error('fail again')));
      } catch (e) {}

      assert.strictEqual(halfOpenBreaker.getState(), CircuitState.OPEN);
    });
  });

  describe('Rolling Window', () => {
    test('should only consider requests within window', async () => {
      const shortWindowBreaker = new CircuitBreaker({
        ...defaultConfig,
        rollingWindowSize: 100 // 100ms window
      });

      // Old failures (outside window after we wait)
      for (let i = 0; i < 15; i++) {
        try {
          await shortWindowBreaker.execute(() => Promise.reject(new Error('fail')));
        } catch (e) {}
      }

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // New successes
      for (let i = 0; i < 15; i++) {
        await shortWindowBreaker.execute(() => Promise.resolve('ok'));
      }

      // Should be CLOSED because old failures are outside window
      assert.strictEqual(shortWindowBreaker.getState(), CircuitState.CLOSED);
    });

    test('should update metrics based on window', async () => {
      const shortWindowBreaker = new CircuitBreaker({
        ...defaultConfig,
        rollingWindowSize: 100
      });

      for (let i = 0; i < 10; i++) {
        try {
          await shortWindowBreaker.execute(() => Promise.reject(new Error('fail')));
        } catch (e) {}
      }

      let metrics = shortWindowBreaker.getMetrics();
      assert.strictEqual(metrics.recentRequests, 10);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      metrics = shortWindowBreaker.getMetrics();
      assert.strictEqual(metrics.recentRequests, 0);
    });
  });

  describe('Concurrent Execution', () => {
    test('should handle concurrent requests safely', async () => {
      const promises: Promise<any>[] = [];

      for (let i = 0; i < 100; i++) {
        promises.push(
          breaker.execute(() => Promise.resolve('ok')).catch(() => {})
        );
      }

      await Promise.all(promises);

      const metrics = breaker.getMetrics();
      assert.strictEqual(metrics.totalSuccesses, 100);
    });

    test('should handle mixed success/failure concurrently', async () => {
      const promises: Promise<any>[] = [];

      for (let i = 0; i < 100; i++) {
        const shouldFail = i % 2 === 0;
        promises.push(
          breaker.execute(() =>
            shouldFail
              ? Promise.reject(new Error('fail'))
              : Promise.resolve('ok')
          ).catch(() => {})
        );
      }

      await Promise.all(promises);

      const metrics = breaker.getMetrics();
      assert.strictEqual(metrics.totalSuccesses, 50);
      assert.strictEqual(metrics.totalFailures, 50);
    });
  });

  describe('Metrics', () => {
    test('should provide comprehensive metrics', async () => {
      await breaker.execute(() => Promise.resolve('ok'));

      try {
        await breaker.execute(() => Promise.reject(new Error('fail')));
      } catch (e) {}

      const metrics = breaker.getMetrics();

      assert.ok('totalSuccesses' in metrics);
      assert.ok('totalFailures' in metrics);
      assert.ok('totalRejections' in metrics);
      assert.ok('successRate' in metrics);
      assert.ok('failureRate' in metrics);
      assert.ok('state' in metrics);
      assert.ok('recentRequests' in metrics);
    });

    test('should calculate success rate correctly', async () => {
      for (let i = 0; i < 10; i++) {
        await breaker.execute(() => Promise.resolve('ok'));
      }

      for (let i = 0; i < 5; i++) {
        try {
          await breaker.execute(() => Promise.reject(new Error('fail')));
        } catch (e) {}
      }

      const metrics = breaker.getMetrics();
      assert.strictEqual(metrics.successRate, 10 / 15);
      assert.strictEqual(metrics.failureRate, 5 / 15);
    });
  });

  describe('Edge Cases', () => {
    test('should handle synchronous errors', async () => {
      await assert.rejects(
        () => breaker.execute(() => {
          throw new Error('Sync error');
        }),
        { message: 'Sync error' }
      );
    });

    test('should handle undefined return values', async () => {
      const result = await breaker.execute(() => Promise.resolve(undefined));
      assert.strictEqual(result, undefined);
    });

    test('should handle null return values', async () => {
      const result = await breaker.execute(() => Promise.resolve(null));
      assert.strictEqual(result, null);
    });

    test('should reset properly', () => {
      breaker.reset();

      assert.strictEqual(breaker.getState(), CircuitState.CLOSED);

      const metrics = breaker.getMetrics();
      assert.strictEqual(metrics.totalSuccesses, 0);
      assert.strictEqual(metrics.totalFailures, 0);
      assert.strictEqual(metrics.totalRejections, 0);
    });
  });

  describe('Performance', () => {
    test('circuit check should be fast', async () => {
      const iterations = 10000;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        await breaker.execute(() => Promise.resolve('ok'));
      }

      const duration = performance.now() - start;
      const opsPerMs = iterations / duration;

      // Should be able to handle at least 1000 ops/ms
      assert.ok(opsPerMs > 1000, `Performance too slow: ${opsPerMs} ops/ms`);
    });
  });
});
```

This is Part 1 of the TEST_EXAMPLES.md file. The file is quite large (would be 3000+ lines), so I've provided the foundational test examples for Priority 1 (Observability) with:

1. Complete Metrics System Tests
2. Complete Tracing System Tests
3. Complete Health Check Tests
4. Complete Circuit Breaker Tests

Would you like me to continue with:
- Part 2: More Priority 2 tests (Retry, Bulkhead, Timeout)
- Part 3: Priority 3 tests (Compression, WorkerPool, Wasm fixes)
- Part 4: Integration and Performance tests
- Part 5: Test utilities library

Or would you prefer I create the comprehensive final deliverables document summarizing everything?

