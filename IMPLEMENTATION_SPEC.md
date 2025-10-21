# Cortex Framework - Implementation Specification
## Coder Agent Detailed Implementation Guide

**Document Version:** 1.0
**Date:** 2025-10-20
**Purpose:** Provide comprehensive, actionable implementation specifications for Priority 1-3 areas

---

## Table of Contents

1. [Priority 1: Observability & Monitoring](#priority-1-observability--monitoring)
2. [Priority 2: Resilience & Reliability](#priority-2-resilience--reliability)
3. [Priority 3: Fix Existing Placeholders](#priority-3-fix-existing-placeholders)
4. [Integration Strategy](#integration-strategy)
5. [Testing Strategy](#testing-strategy)

---

## Priority 1: Observability & Monitoring

### Overview
Implement production-grade observability following OpenTelemetry standards with zero external dependencies. Focus on metrics collection, distributed tracing, health checks, and structured logging.

### 1.1 File Structure

```
src/observability/
├── index.ts                    # Public API exports
├── metrics/
│   ├── index.ts               # Metrics module exports
│   ├── collector.ts           # MetricsCollector class
│   ├── counter.ts             # Counter metric implementation
│   ├── gauge.ts               # Gauge metric implementation
│   ├── histogram.ts           # Histogram metric implementation
│   └── registry.ts            # MetricsRegistry singleton
├── tracing/
│   ├── index.ts               # Tracing module exports
│   ├── tracer.ts              # Tracer class
│   ├── span.ts                # Span implementation
│   ├── context.ts             # TraceContext and propagation
│   └── sampler.ts             # Sampling strategies
├── health/
│   ├── index.ts               # Health module exports
│   ├── healthCheck.ts         # HealthCheck base class
│   ├── healthRegistry.ts      # HealthCheckRegistry
│   └── defaultChecks.ts       # Default health checks
└── middleware/
    ├── metricsMiddleware.ts   # HTTP metrics middleware
    └── tracingMiddleware.ts   # HTTP tracing middleware

tests/observability/
├── metrics/
│   ├── counter.test.ts
│   ├── gauge.test.ts
│   ├── histogram.test.ts
│   └── collector.test.ts
├── tracing/
│   ├── tracer.test.ts
│   ├── span.test.ts
│   └── context.test.ts
├── health/
│   └── healthCheck.test.ts
└── integration/
    └── observability.integration.test.ts
```

### 1.2 Type Definitions

#### Core Types (`src/observability/types.ts`)

```typescript
/**
 * Metric value types supported by the framework
 */
export type MetricValue = number | string | boolean;

/**
 * Label key-value pairs for dimensional metrics
 */
export type Labels = Record<string, string>;

/**
 * Metric types following Prometheus conventions
 */
export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  SUMMARY = 'summary',
}

/**
 * Base metric interface
 */
export interface Metric {
  readonly name: string;
  readonly type: MetricType;
  readonly help: string;
  readonly labels: Labels;
  getValue(): MetricValue | HistogramValue;
  toPrometheusFormat(): string;
}

/**
 * Histogram bucket structure
 */
export interface HistogramValue {
  buckets: Map<number, number>;
  sum: number;
  count: number;
}

/**
 * Trace context following W3C Trace Context spec
 */
export interface TraceContext {
  traceId: string;      // 32 hex chars (128 bits)
  spanId: string;       // 16 hex chars (64 bits)
  traceFlags: number;   // 8 bits (sampled flag)
  traceState?: string;  // Vendor-specific data
}

/**
 * Span attribute value types
 */
export type AttributeValue = string | number | boolean | string[] | number[] | boolean[];

/**
 * Span kinds following OpenTelemetry spec
 */
export enum SpanKind {
  INTERNAL = 0,
  SERVER = 1,
  CLIENT = 2,
  PRODUCER = 3,
  CONSUMER = 4,
}

/**
 * Span status codes
 */
export enum SpanStatusCode {
  UNSET = 0,
  OK = 1,
  ERROR = 2,
}

/**
 * Span status
 */
export interface SpanStatus {
  code: SpanStatusCode;
  message?: string;
}

/**
 * Span event
 */
export interface SpanEvent {
  name: string;
  timestamp: number;
  attributes?: Record<string, AttributeValue>;
}

/**
 * Span interface
 */
export interface Span {
  readonly traceId: string;
  readonly spanId: string;
  readonly parentSpanId?: string;

  name: string;
  kind: SpanKind;
  startTime: number;
  endTime?: number;

  attributes: Record<string, AttributeValue>;
  events: SpanEvent[];
  status: SpanStatus;

  setAttribute(key: string, value: AttributeValue): void;
  addEvent(name: string, attributes?: Record<string, AttributeValue>): void;
  setStatus(status: SpanStatus): void;
  recordException(error: Error): void;
  end(endTime?: number): void;
}

/**
 * Sampling decision
 */
export enum SamplingDecision {
  DROP = 0,
  RECORD_ONLY = 1,
  RECORD_AND_SAMPLE = 2,
}

/**
 * Sampling context
 */
export interface SamplingContext {
  traceId: string;
  spanId: string;
  parentContext?: TraceContext;
  attributes: Record<string, AttributeValue>;
}

/**
 * Sampling result
 */
export interface SamplingResult {
  decision: SamplingDecision;
  attributes: Record<string, AttributeValue>;
}

/**
 * Health check status
 */
export enum HealthStatus {
  UP = 'up',
  DOWN = 'down',
  DEGRADED = 'degraded',
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  status: HealthStatus;
  message?: string;
  timestamp: number;
  details?: Record<string, any>;
}

/**
 * Health check interface
 */
export interface HealthCheck {
  readonly name: string;
  check(): Promise<HealthCheckResult>;
}
```

### 1.3 Class Skeletons

#### MetricsCollector (`src/observability/metrics/collector.ts`)

```typescript
import { Metric, MetricType, Labels } from '../types';
import { Counter } from './counter';
import { Gauge } from './gauge';
import { Histogram } from './histogram';

/**
 * MetricsCollector aggregates and exposes metrics in Prometheus format
 *
 * @example
 * ```typescript
 * const collector = new MetricsCollector();
 * const counter = collector.createCounter('http_requests_total', 'Total HTTP requests');
 * counter.inc({ method: 'GET', path: '/api/users' });
 * console.log(collector.toPrometheusFormat());
 * ```
 */
export class MetricsCollector {
  private metrics: Map<string, Metric> = new Map();

  /**
   * Create a counter metric
   *
   * @param name - Metric name (should use underscores, e.g., 'http_requests_total')
   * @param help - Human-readable description
   * @param labels - Optional default labels
   * @returns Counter instance
   */
  public createCounter(name: string, help: string, labels: Labels = {}): Counter {
    if (this.metrics.has(name)) {
      const existing = this.metrics.get(name)!;
      if (existing.type !== MetricType.COUNTER) {
        throw new Error(`Metric ${name} already exists with type ${existing.type}`);
      }
      return existing as Counter;
    }

    const counter = new Counter(name, help, labels);
    this.metrics.set(name, counter);
    return counter;
  }

  /**
   * Create a gauge metric
   *
   * @param name - Metric name
   * @param help - Human-readable description
   * @param labels - Optional default labels
   * @returns Gauge instance
   */
  public createGauge(name: string, help: string, labels: Labels = {}): Gauge {
    if (this.metrics.has(name)) {
      const existing = this.metrics.get(name)!;
      if (existing.type !== MetricType.GAUGE) {
        throw new Error(`Metric ${name} already exists with type ${existing.type}`);
      }
      return existing as Gauge;
    }

    const gauge = new Gauge(name, help, labels);
    this.metrics.set(name, gauge);
    return gauge;
  }

  /**
   * Create a histogram metric
   *
   * @param name - Metric name
   * @param help - Human-readable description
   * @param buckets - Bucket boundaries (default: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10])
   * @param labels - Optional default labels
   * @returns Histogram instance
   */
  public createHistogram(
    name: string,
    help: string,
    buckets?: number[],
    labels: Labels = {}
  ): Histogram {
    if (this.metrics.has(name)) {
      const existing = this.metrics.get(name)!;
      if (existing.type !== MetricType.HISTOGRAM) {
        throw new Error(`Metric ${name} already exists with type ${existing.type}`);
      }
      return existing as Histogram;
    }

    const histogram = new Histogram(name, help, buckets, labels);
    this.metrics.set(name, histogram);
    return histogram;
  }

  /**
   * Get an existing metric by name
   *
   * @param name - Metric name
   * @returns Metric instance or undefined
   */
  public getMetric(name: string): Metric | undefined {
    return this.metrics.get(name);
  }

  /**
   * Get all registered metrics
   *
   * @returns Array of all metrics
   */
  public getMetrics(): Metric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Export all metrics in Prometheus text format
   *
   * @returns Prometheus-formatted metrics string
   */
  public toPrometheusFormat(): string {
    return Array.from(this.metrics.values())
      .map(m => m.toPrometheusFormat())
      .join('\n\n');
  }

  /**
   * Clear all metrics (useful for testing)
   */
  public clear(): void {
    this.metrics.clear();
  }
}
```

#### Counter (`src/observability/metrics/counter.ts`)

```typescript
import { Metric, MetricType, Labels } from '../types';

/**
 * Counter is a monotonically increasing metric
 * Use for counting events: requests, errors, tasks completed, etc.
 *
 * @example
 * ```typescript
 * const requestCounter = new Counter('http_requests_total', 'Total HTTP requests');
 * requestCounter.inc(); // increment by 1
 * requestCounter.inc(5); // increment by 5
 * ```
 */
export class Counter implements Metric {
  public readonly name: string;
  public readonly type = MetricType.COUNTER;
  public readonly help: string;
  public readonly labels: Labels;
  private value: number = 0;

  constructor(name: string, help: string, labels: Labels = {}) {
    this.name = name;
    this.help = help;
    this.labels = labels;
  }

  /**
   * Increment the counter
   *
   * @param value - Amount to increment (must be non-negative, default: 1)
   * @throws Error if value is negative
   */
  public inc(value: number = 1): void {
    if (value < 0) {
      throw new Error('Counter can only be incremented with non-negative values');
    }
    this.value += value;
  }

  /**
   * Get current counter value
   */
  public getValue(): number {
    return this.value;
  }

  /**
   * Export in Prometheus format
   *
   * @returns Prometheus-formatted metric string
   */
  public toPrometheusFormat(): string {
    const labelStr = this.formatLabels(this.labels);
    return `# HELP ${this.name} ${this.help}\n# TYPE ${this.name} counter\n${this.name}${labelStr} ${this.value}`;
  }

  /**
   * Format labels for Prometheus output
   */
  private formatLabels(labels: Labels): string {
    const pairs = Object.entries(labels)
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return pairs ? `{${pairs}}` : '';
  }
}
```

#### Tracer (`src/observability/tracing/tracer.ts`)

```typescript
import { Span, SpanKind, TraceContext, SpanStatusCode } from '../types';
import { SpanImpl } from './span';
import { Sampler, ProbabilitySampler } from './sampler';
import { generateTraceId, generateSpanId } from './ids';

/**
 * Configuration options for Tracer
 */
export interface TracerConfig {
  serviceName: string;
  sampler?: Sampler;
  maxSpansPerTrace?: number;
}

/**
 * Tracer creates and manages spans for distributed tracing
 *
 * @example
 * ```typescript
 * const tracer = new Tracer({ serviceName: 'api-server' });
 * const span = tracer.startSpan('handle_request', { kind: SpanKind.SERVER });
 * span.setAttribute('http.method', 'GET');
 * span.end();
 * ```
 */
export class Tracer {
  private config: Required<TracerConfig>;
  private activeSpans: Map<string, Span> = new Map();

  constructor(config: TracerConfig) {
    this.config = {
      serviceName: config.serviceName,
      sampler: config.sampler || new ProbabilitySampler(1.0),
      maxSpansPerTrace: config.maxSpansPerTrace || 1000,
    };
  }

  /**
   * Start a new span
   *
   * @param name - Span name (operation name)
   * @param options - Span options
   * @returns Span instance
   */
  public startSpan(
    name: string,
    options: {
      kind?: SpanKind;
      parent?: TraceContext;
      attributes?: Record<string, any>;
    } = {}
  ): Span {
    const traceId = options.parent?.traceId || generateTraceId();
    const spanId = generateSpanId();
    const parentSpanId = options.parent?.spanId;

    const span = new SpanImpl({
      traceId,
      spanId,
      parentSpanId,
      name,
      kind: options.kind || SpanKind.INTERNAL,
      startTime: Date.now(),
      attributes: {
        'service.name': this.config.serviceName,
        ...(options.attributes || {}),
      },
    });

    this.activeSpans.set(spanId, span);
    return span;
  }

  /**
   * Get active span by ID
   */
  public getSpan(spanId: string): Span | undefined {
    return this.activeSpans.get(spanId);
  }

  /**
   * End a span and remove from active spans
   */
  public endSpan(spanId: string): void {
    const span = this.activeSpans.get(spanId);
    if (span && !span.endTime) {
      span.end();
    }
    this.activeSpans.delete(spanId);
  }

  /**
   * Get all active spans
   */
  public getActiveSpans(): Span[] {
    return Array.from(this.activeSpans.values());
  }

  /**
   * Export completed spans (for testing/debugging)
   */
  public exportSpans(): Span[] {
    return this.getActiveSpans().filter(s => s.endTime !== undefined);
  }
}
```

#### HealthCheckRegistry (`src/observability/health/healthRegistry.ts`)

```typescript
import { HealthCheck, HealthCheckResult, HealthStatus } from '../types';

/**
 * HealthCheckRegistry manages and executes health checks
 *
 * @example
 * ```typescript
 * const registry = new HealthCheckRegistry();
 * registry.register(new DatabaseHealthCheck());
 * registry.register(new CacheHealthCheck());
 * const results = await registry.checkAll();
 * ```
 */
export class HealthCheckRegistry {
  private checks: Map<string, HealthCheck> = new Map();

  /**
   * Register a health check
   *
   * @param check - HealthCheck instance
   * @throws Error if check with same name already exists
   */
  public register(check: HealthCheck): void {
    if (this.checks.has(check.name)) {
      throw new Error(`Health check '${check.name}' is already registered`);
    }
    this.checks.set(check.name, check);
  }

  /**
   * Unregister a health check
   *
   * @param name - Health check name
   */
  public unregister(name: string): void {
    this.checks.delete(name);
  }

  /**
   * Execute a specific health check
   *
   * @param name - Health check name
   * @returns Health check result
   * @throws Error if check not found
   */
  public async check(name: string): Promise<HealthCheckResult> {
    const check = this.checks.get(name);
    if (!check) {
      throw new Error(`Health check '${name}' not found`);
    }

    try {
      return await check.check();
    } catch (error) {
      return {
        status: HealthStatus.DOWN,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
        details: { error: String(error) },
      };
    }
  }

  /**
   * Execute all health checks
   *
   * @returns Map of check names to results
   */
  public async checkAll(): Promise<Map<string, HealthCheckResult>> {
    const results = new Map<string, HealthCheckResult>();

    const promises = Array.from(this.checks.entries()).map(async ([name, check]) => {
      try {
        const result = await check.check();
        results.set(name, result);
      } catch (error) {
        results.set(name, {
          status: HealthStatus.DOWN,
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now(),
          details: { error: String(error) },
        });
      }
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Get overall health status
   *
   * @returns Overall status (UP if all checks pass, DOWN if any fail, DEGRADED if any degraded)
   */
  public async getOverallStatus(): Promise<HealthStatus> {
    const results = await this.checkAll();

    let hasDown = false;
    let hasDegraded = false;

    for (const result of results.values()) {
      if (result.status === HealthStatus.DOWN) {
        hasDown = true;
      } else if (result.status === HealthStatus.DEGRADED) {
        hasDegraded = true;
      }
    }

    if (hasDown) return HealthStatus.DOWN;
    if (hasDegraded) return HealthStatus.DEGRADED;
    return HealthStatus.UP;
  }

  /**
   * Get all registered health checks
   */
  public getChecks(): HealthCheck[] {
    return Array.from(this.checks.values());
  }
}
```

### 1.4 Integration with ActorSystem

#### Enhanced ActorSystem with Observability

```typescript
// src/core/actorSystem.ts (additions)

import { Tracer } from '../observability/tracing/tracer';
import { MetricsCollector } from '../observability/metrics/collector';

export class ActorSystem {
  private actors: Map<string, Actor> = new Map();
  private static readonly MAX_RESTARTS = 3;

  // NEW: Observability components
  private tracer?: Tracer;
  private metrics?: MetricsCollector;
  private actorMessageCounter?: Counter;
  private actorErrorCounter?: Counter;
  private actorRestartCounter?: Counter;

  constructor(
    private eventBus: EventBus,
    options?: {
      enableTracing?: boolean;
      enableMetrics?: boolean;
      serviceName?: string;
    }
  ) {
    // Initialize observability if enabled
    if (options?.enableMetrics) {
      this.metrics = new MetricsCollector();
      this.actorMessageCounter = this.metrics.createCounter(
        'cortex_actor_messages_total',
        'Total number of messages processed by actors',
        { system: options.serviceName || 'cortex' }
      );
      this.actorErrorCounter = this.metrics.createCounter(
        'cortex_actor_errors_total',
        'Total number of actor errors',
        { system: options.serviceName || 'cortex' }
      );
      this.actorRestartCounter = this.metrics.createCounter(
        'cortex_actor_restarts_total',
        'Total number of actor restarts',
        { system: options.serviceName || 'cortex' }
      );
    }

    if (options?.enableTracing) {
      this.tracer = new Tracer({
        serviceName: options.serviceName || 'cortex-actor-system',
      });
    }
  }

  public dispatch(actorId: string, message: any): void {
    const actor = this.actors.get(actorId);
    if (actor) {
      // Increment message counter
      this.actorMessageCounter?.inc();

      // Create span if tracing enabled
      const span = this.tracer?.startSpan('actor.dispatch', {
        kind: SpanKind.INTERNAL,
        attributes: {
          'actor.id': actorId,
          'message.type': typeof message,
        },
      });

      try {
        actor.postMessage(message);
        span?.setStatus({ code: SpanStatusCode.OK });
      } catch (error) {
        span?.setStatus({ code: SpanStatusCode.ERROR });
        span?.recordException(error as Error);
        throw error;
      } finally {
        span?.end();
      }
    } else {
      throw new ActorNotFound(actorId);
    }
  }

  public handleFailure(actor: Actor, error: any): void {
    console.error(`Actor '${actor.id}' failed:`, error);

    // Increment error counter
    this.actorErrorCounter?.inc();

    (actor as any).restartCount++;

    if ((actor as any).restartCount > ActorSystem.MAX_RESTARTS) {
      console.error(`Actor '${actor.id}' exceeded max restarts. Stopping actor.`);
      this.stopActor(actor.id);
    } else {
      console.warn(`Restarting actor '${actor.id}' (restart count: ${(actor as any).restartCount}).`);

      // Increment restart counter
      this.actorRestartCounter?.inc();

      actor.preRestart(error);
      const ActorClass = (actor as any)._ActorClass;
      const ActorArgs = (actor as any)._ActorArgs;
      this.stopActor(actor.id);
      const newActor = this.createActor(ActorClass, actor.id, ...ActorArgs);
      newActor.postRestart(error);
    }
  }

  /**
   * Get metrics collector (if enabled)
   */
  public getMetrics(): MetricsCollector | undefined {
    return this.metrics;
  }

  /**
   * Get tracer (if enabled)
   */
  public getTracer(): Tracer | undefined {
    return this.tracer;
  }
}
```

### 1.5 Configuration Schema

```typescript
// src/observability/config.ts

/**
 * Observability configuration
 */
export interface ObservabilityConfig {
  /**
   * Service name for identification in traces and metrics
   * @default 'cortex-service'
   */
  serviceName: string;

  /**
   * Metrics configuration
   */
  metrics: {
    /**
     * Enable metrics collection
     * @default true
     */
    enabled: boolean;

    /**
     * Metrics endpoint path
     * @default '/metrics'
     */
    endpoint: string;

    /**
     * Default histogram buckets (in seconds)
     * @default [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
     */
    defaultHistogramBuckets: number[];
  };

  /**
   * Tracing configuration
   */
  tracing: {
    /**
     * Enable distributed tracing
     * @default true
     */
    enabled: boolean;

    /**
     * Sampling probability (0.0 to 1.0)
     * @default 1.0 (sample all traces)
     */
    samplingProbability: number;

    /**
     * Maximum spans per trace
     * @default 1000
     */
    maxSpansPerTrace: number;
  };

  /**
   * Health check configuration
   */
  health: {
    /**
     * Enable health checks
     * @default true
     */
    enabled: boolean;

    /**
     * Health check endpoint path
     * @default '/health'
     */
    endpoint: string;

    /**
     * Health check timeout (ms)
     * @default 5000
     */
    timeout: number;
  };
}

/**
 * Default observability configuration
 */
export const DEFAULT_OBSERVABILITY_CONFIG: ObservabilityConfig = {
  serviceName: 'cortex-service',
  metrics: {
    enabled: true,
    endpoint: '/metrics',
    defaultHistogramBuckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  },
  tracing: {
    enabled: true,
    samplingProbability: 1.0,
    maxSpansPerTrace: 1000,
  },
  health: {
    enabled: true,
    endpoint: '/health',
    timeout: 5000,
  },
};
```

### 1.6 Example Usage

```typescript
// examples/observability-example.ts

import { ActorSystem } from './core/actorSystem';
import { EventBus } from './core/eventBus';
import { CortexHttpServer } from './core/httpServer';
import { MetricsCollector } from './observability/metrics/collector';
import { Tracer } from './observability/tracing/tracer';
import { HealthCheckRegistry } from './observability/health/healthRegistry';
import { metricsMiddleware } from './observability/middleware/metricsMiddleware';
import { tracingMiddleware } from './observability/middleware/tracingMiddleware';

// 1. Create ActorSystem with observability
const eventBus = EventBus.getInstance();
const actorSystem = new ActorSystem(eventBus, {
  enableMetrics: true,
  enableTracing: true,
  serviceName: 'my-api-server',
});

// 2. Create HTTP server with observability middleware
const server = new CortexHttpServer(3000);

// Create metrics collector
const metrics = new MetricsCollector();
const httpRequestDuration = metrics.createHistogram(
  'http_request_duration_seconds',
  'HTTP request duration in seconds'
);
const httpRequestsTotal = metrics.createCounter(
  'http_requests_total',
  'Total HTTP requests'
);

// Create tracer
const tracer = new Tracer({ serviceName: 'my-api-server' });

// Add middleware
server.use(metricsMiddleware(metrics));
server.use(tracingMiddleware(tracer));

// 3. Add metrics endpoint
server.get('/metrics', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; version=0.0.4' });
  res.end(metrics.toPrometheusFormat());
});

// 4. Setup health checks
const healthRegistry = new HealthCheckRegistry();

// Add custom health check
class DatabaseHealthCheck implements HealthCheck {
  name = 'database';

  async check(): Promise<HealthCheckResult> {
    // Check database connection
    const isConnected = await checkDatabaseConnection();
    return {
      status: isConnected ? HealthStatus.UP : HealthStatus.DOWN,
      timestamp: Date.now(),
      details: { connectionPool: { active: 5, idle: 10 } },
    };
  }
}

healthRegistry.register(new DatabaseHealthCheck());

// Add health endpoint
server.get('/health', async (req, res) => {
  const results = await healthRegistry.checkAll();
  const overallStatus = await healthRegistry.getOverallStatus();

  const statusCode = overallStatus === HealthStatus.UP ? 200 : 503;

  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: overallStatus,
    checks: Object.fromEntries(results),
  }));
});

// 5. Use observability in handlers
server.get('/api/users/:id', async (req, res) => {
  // Metrics are automatically tracked by middleware
  const span = tracer.startSpan('get_user', {
    kind: SpanKind.INTERNAL,
    attributes: { 'user.id': req.params?.id },
  });

  try {
    const user = await getUserById(req.params?.id);
    span.setAttribute('user.found', user !== null);
    span.setStatus({ code: SpanStatusCode.OK });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(user));
  } catch (error) {
    span.recordException(error as Error);
    span.setStatus({ code: SpanStatusCode.ERROR });

    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  } finally {
    span.end();
  }
});

await server.start();
console.log('Server started with observability enabled');
console.log('Metrics: http://localhost:3000/metrics');
console.log('Health: http://localhost:3000/health');
```

### 1.7 Testing Approach

```typescript
// tests/observability/metrics/counter.test.ts

import { test } from 'node:test';
import assert from 'node:assert';
import { Counter } from '../../../src/observability/metrics/counter';

test('Counter should increment correctly', () => {
  const counter = new Counter('test_counter', 'Test counter');

  counter.inc();
  assert.strictEqual(counter.getValue(), 1);

  counter.inc(5);
  assert.strictEqual(counter.getValue(), 6);
});

test('Counter should reject negative increments', () => {
  const counter = new Counter('test_counter', 'Test counter');

  assert.throws(() => {
    counter.inc(-1);
  }, /non-negative/);
});

test('Counter should format Prometheus output correctly', () => {
  const counter = new Counter('http_requests_total', 'Total requests', {
    method: 'GET',
    path: '/api/users',
  });

  counter.inc(42);

  const output = counter.toPrometheusFormat();
  assert.ok(output.includes('# HELP http_requests_total Total requests'));
  assert.ok(output.includes('# TYPE http_requests_total counter'));
  assert.ok(output.includes('http_requests_total{method="GET",path="/api/users"} 42'));
});
```

---

## Priority 2: Resilience & Reliability

### Overview
Implement production-grade resilience patterns: Circuit Breaker, Retry with exponential backoff, Bulkhead isolation, and Timeout handling. These patterns prevent cascading failures and improve system stability.

### 2.1 File Structure

```
src/resilience/
├── index.ts                      # Public API exports
├── circuitBreaker.ts             # Circuit Breaker implementation
├── retry.ts                      # Retry executor with strategies
├── bulkhead.ts                   # Bulkhead pattern for isolation
├── timeout.ts                    # Timeout wrapper
├── policies/
│   ├── index.ts                  # Policy composition
│   ├── compositePolicy.ts        # Combine multiple policies
│   └── policyRegistry.ts         # Global policy registry
├── errors.ts                     # Resilience-specific errors
└── types.ts                      # Type definitions

tests/resilience/
├── circuitBreaker.test.ts
├── retry.test.ts
├── bulkhead.test.ts
├── timeout.test.ts
├── compositePolicy.test.ts
└── integration/
    └── resilience.integration.test.ts
```

### 2.2 Type Definitions

```typescript
// src/resilience/types.ts

/**
 * Circuit breaker states
 */
export enum CircuitState {
  CLOSED = 'closed',        // Normal operation
  OPEN = 'open',            // Failing, reject requests
  HALF_OPEN = 'half_open',  // Testing if service recovered
}

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  /**
   * Number of failures before opening circuit
   * @default 5
   */
  failureThreshold: number;

  /**
   * Number of successes to close from half-open
   * @default 2
   */
  successThreshold: number;

  /**
   * Time in OPEN before trying HALF_OPEN (ms)
   * @default 60000
   */
  timeout: number;

  /**
   * Minimum requests before evaluation
   * @default 10
   */
  volumeThreshold: number;

  /**
   * Error percentage to open circuit
   * @default 50
   */
  errorThresholdPercentage: number;

  /**
   * Rolling window size for statistics (ms)
   * @default 10000
   */
  rollingWindowSize: number;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  /**
   * Maximum retry attempts
   * @default 3
   */
  maxAttempts: number;

  /**
   * Initial delay in ms
   * @default 100
   */
  initialDelay: number;

  /**
   * Maximum delay in ms
   * @default 30000
   */
  maxDelay: number;

  /**
   * Backoff multiplier
   * @default 2
   */
  multiplier: number;

  /**
   * Jitter randomization factor
   * @default 0.1
   */
  jitterFactor: number;

  /**
   * Error matchers to determine if error is retryable
   */
  retryableErrors?: ErrorMatcher[];
}

/**
 * Error matcher function
 */
export type ErrorMatcher = (error: Error) => boolean;

/**
 * Bulkhead configuration
 */
export interface BulkheadConfig {
  /**
   * Maximum concurrent executions
   * @default 10
   */
  maxConcurrent: number;

  /**
   * Maximum queue size
   * @default Infinity
   */
  maxQueueSize: number;
}

/**
 * Timeout configuration
 */
export interface TimeoutConfig {
  /**
   * Timeout duration in ms
   */
  timeoutMs: number;

  /**
   * Fallback function if timeout occurs
   */
  fallback?: () => any;
}

/**
 * Resilience policy interface
 */
export interface ResiliencePolicy {
  /**
   * Execute function with resilience policy
   */
  execute<T>(fn: () => Promise<T>): Promise<T>;

  /**
   * Get policy name
   */
  getName(): string;
}
```

### 2.3 Class Skeletons

#### CircuitBreaker (`src/resilience/circuitBreaker.ts`)

```typescript
import { CircuitState, CircuitBreakerConfig, ResiliencePolicy } from './types';
import { CircuitBreakerOpenError } from './errors';

/**
 * Default circuit breaker configuration
 */
const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60000,
  volumeThreshold: 10,
  errorThresholdPercentage: 50,
  rollingWindowSize: 10000,
};

/**
 * CircuitBreaker prevents cascading failures by stopping requests to failing services
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Service is failing, requests are rejected immediately
 * - HALF_OPEN: Testing if service recovered, limited requests allowed
 *
 * @example
 * ```typescript
 * const breaker = new CircuitBreaker({
 *   failureThreshold: 5,
 *   timeout: 60000,
 * });
 *
 * try {
 *   const result = await breaker.execute(async () => {
 *     return await fetch('https://api.example.com/data');
 *   });
 * } catch (error) {
 *   if (error instanceof CircuitBreakerOpenError) {
 *     // Circuit is open, service is down
 *     console.log('Service temporarily unavailable');
 *   }
 * }
 * ```
 */
export class CircuitBreaker implements ResiliencePolicy {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime?: number;
  private nextAttemptTime?: number;
  private requests: Array<{ timestamp: number; success: boolean }> = [];
  private config: CircuitBreakerConfig;
  private stateChangeListeners: Array<(state: CircuitState) => void> = [];

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get policy name
   */
  public getName(): string {
    return 'CircuitBreaker';
  }

  /**
   * Get current circuit state
   */
  public getState(): CircuitState {
    return this.state;
  }

  /**
   * Execute function with circuit breaker protection
   *
   * @param fn - Async function to execute
   * @returns Promise with function result
   * @throws CircuitBreakerOpenError if circuit is open
   */
  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.transitionTo(CircuitState.HALF_OPEN);
        this.successes = 0;
      } else {
        throw new CircuitBreakerOpenError(
          'Circuit breaker is OPEN',
          this.nextAttemptTime
        );
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Register listener for state changes
   */
  public onStateChange(listener: (state: CircuitState) => void): void {
    this.stateChangeListeners.push(listener);
  }

  /**
   * Reset circuit breaker to CLOSED state
   */
  public reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.requests = [];
    this.lastFailureTime = undefined;
    this.nextAttemptTime = undefined;
  }

  /**
   * Get circuit breaker statistics
   */
  public getStats() {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      recentRequests: this.getRecentRequests().length,
      errorRate: this.calculateErrorRate(),
    };
  }

  private onSuccess(): void {
    this.recordRequest(true);

    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.reset();
        this.transitionTo(CircuitState.CLOSED);
      }
    }
  }

  private onFailure(): void {
    this.recordRequest(false);
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      // Immediately reopen on failure in half-open state
      this.trip();
      return;
    }

    // Check if we should trip the circuit
    if (this.shouldTrip()) {
      this.trip();
    }
  }

  private shouldTrip(): boolean {
    const recentRequests = this.getRecentRequests();

    // Need minimum volume
    if (recentRequests.length < this.config.volumeThreshold) {
      return false;
    }

    // Calculate error rate
    const errorRate = this.calculateErrorRate();
    return errorRate >= this.config.errorThresholdPercentage;
  }

  private calculateErrorRate(): number {
    const recentRequests = this.getRecentRequests();
    if (recentRequests.length === 0) return 0;

    const failures = recentRequests.filter(r => !r.success).length;
    return (failures / recentRequests.length) * 100;
  }

  private trip(): void {
    this.transitionTo(CircuitState.OPEN);
    this.nextAttemptTime = Date.now() + this.config.timeout;
  }

  private shouldAttemptReset(): boolean {
    return (
      this.nextAttemptTime !== undefined &&
      Date.now() >= this.nextAttemptTime
    );
  }

  private recordRequest(success: boolean): void {
    this.requests.push({ timestamp: Date.now(), success });
    this.cleanOldRequests();
  }

  private getRecentRequests(): Array<{ timestamp: number; success: boolean }> {
    this.cleanOldRequests();
    return this.requests;
  }

  private cleanOldRequests(): void {
    const cutoff = Date.now() - this.config.rollingWindowSize;
    this.requests = this.requests.filter(r => r.timestamp > cutoff);
  }

  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;

    // Notify listeners
    this.stateChangeListeners.forEach(listener => listener(newState));

    console.log(`Circuit breaker: ${oldState} -> ${newState}`);
  }
}
```

#### RetryExecutor (`src/resilience/retry.ts`)

```typescript
import { RetryConfig, ErrorMatcher, ResiliencePolicy } from './types';

/**
 * Default retry configuration
 */
const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 100,
  maxDelay: 30000,
  multiplier: 2,
  jitterFactor: 0.1,
};

/**
 * RetryExecutor retries failed operations with exponential backoff
 *
 * @example
 * ```typescript
 * const retry = new RetryExecutor({
 *   maxAttempts: 3,
 *   initialDelay: 100,
 *   retryableErrors: [isNetworkError, isServerError],
 * });
 *
 * const result = await retry.execute(async () => {
 *   return await fetch('https://api.example.com/data');
 * });
 * ```
 */
export class RetryExecutor implements ResiliencePolicy {
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get policy name
   */
  public getName(): string {
    return 'RetryExecutor';
  }

  /**
   * Execute function with retry logic
   *
   * @param fn - Async function to execute
   * @returns Promise with function result
   * @throws Last error if all retries exhausted
   */
  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < this.config.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // Check if error is retryable
        if (!this.isRetryable(error as Error)) {
          throw error;
        }

        // Don't delay after last attempt
        if (attempt < this.config.maxAttempts - 1) {
          const delay = this.calculateDelay(attempt);
          await this.sleep(delay);
          console.log(`Retry attempt ${attempt + 1}/${this.config.maxAttempts} after ${delay}ms`);
        }
      }
    }

    throw lastError!;
  }

  /**
   * Calculate delay for retry attempt with exponential backoff and jitter
   *
   * @param attempt - Attempt number (0-indexed)
   * @returns Delay in milliseconds
   */
  private calculateDelay(attempt: number): number {
    // Exponential backoff: initialDelay * (multiplier ^ attempt)
    let delay = this.config.initialDelay * Math.pow(this.config.multiplier, attempt);

    // Cap at maxDelay
    delay = Math.min(delay, this.config.maxDelay);

    // Add jitter: randomize ± jitterFactor
    const jitter = delay * this.config.jitterFactor * (Math.random() * 2 - 1);
    delay = delay + jitter;

    return Math.max(0, delay);
  }

  /**
   * Check if error is retryable
   */
  private isRetryable(error: Error): boolean {
    // If no matchers specified, retry all errors
    if (!this.config.retryableErrors || this.config.retryableErrors.length === 0) {
      return true;
    }

    // Check if any matcher matches
    return this.config.retryableErrors.some(matcher => matcher(error));
  }

  /**
   * Sleep for specified duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Common error matchers
 */
export const ErrorMatchers = {
  /**
   * Match network errors
   */
  isNetworkError: (error: Error): boolean => {
    return (
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('ENOTFOUND') ||
      error.message.includes('network')
    );
  },

  /**
   * Match HTTP 5xx errors
   */
  isServerError: (error: Error): boolean => {
    return error.message.includes('5') && error.message.includes('status');
  },

  /**
   * Match timeout errors
   */
  isTimeoutError: (error: Error): boolean => {
    return error.message.toLowerCase().includes('timeout');
  },
};
```

#### Bulkhead (`src/resilience/bulkhead.ts`)

```typescript
import { BulkheadConfig, ResiliencePolicy } from './types';
import { BulkheadRejectError } from './errors';

/**
 * Semaphore for limiting concurrent executions
 */
class Semaphore {
  private permits: number;
  private waiting: Array<() => void> = [];

  constructor(private maxPermits: number) {
    this.permits = maxPermits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    // Wait for permit
    return new Promise<void>(resolve => {
      this.waiting.push(resolve);
    });
  }

  release(): void {
    const next = this.waiting.shift();
    if (next) {
      next();
    } else {
      this.permits++;
    }
  }

  getAvailablePermits(): number {
    return this.permits;
  }
}

/**
 * Bulkhead isolates resources to prevent cascading failures
 *
 * @example
 * ```typescript
 * const bulkhead = new Bulkhead({
 *   maxConcurrent: 10,
 *   maxQueueSize: 20,
 * });
 *
 * const result = await bulkhead.execute(async () => {
 *   return await processHeavyTask();
 * });
 * ```
 */
export class Bulkhead implements ResiliencePolicy {
  private semaphore: Semaphore;
  private queue: number = 0;
  private config: BulkheadConfig;

  constructor(config: BulkheadConfig) {
    this.config = config;
    this.semaphore = new Semaphore(config.maxConcurrent);
  }

  /**
   * Get policy name
   */
  public getName(): string {
    return 'Bulkhead';
  }

  /**
   * Execute function with bulkhead protection
   *
   * @param fn - Async function to execute
   * @returns Promise with function result
   * @throws BulkheadRejectError if queue is full
   */
  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check queue size
    if (this.queue >= this.config.maxQueueSize) {
      throw new BulkheadRejectError('Queue is full', {
        queueSize: this.queue,
        maxQueueSize: this.config.maxQueueSize,
      });
    }

    this.queue++;

    try {
      await this.semaphore.acquire();
      this.queue--;

      try {
        return await fn();
      } finally {
        this.semaphore.release();
      }
    } catch (error) {
      this.queue--;
      throw error;
    }
  }

  /**
   * Get bulkhead statistics
   */
  public getStats() {
    return {
      queueSize: this.queue,
      maxQueueSize: this.config.maxQueueSize,
      availablePermits: this.semaphore.getAvailablePermits(),
      maxConcurrent: this.config.maxConcurrent,
    };
  }
}
```

### 2.4 Policy Composition

```typescript
// src/resilience/policies/compositePolicy.ts

import { ResiliencePolicy } from '../types';

/**
 * CompositePolicy combines multiple resilience policies
 * Policies are applied in order: first wraps second wraps third, etc.
 *
 * @example
 * ```typescript
 * const policy = new CompositePolicy([
 *   new CircuitBreaker({ failureThreshold: 5 }),
 *   new RetryExecutor({ maxAttempts: 3 }),
 *   new Bulkhead({ maxConcurrent: 10 }),
 *   new TimeoutExecutor({ timeoutMs: 5000 }),
 * ]);
 *
 * const result = await policy.execute(async () => {
 *   return await callExternalService();
 * });
 * ```
 */
export class CompositePolicy implements ResiliencePolicy {
  constructor(private policies: ResiliencePolicy[]) {
    if (policies.length === 0) {
      throw new Error('CompositePolicy requires at least one policy');
    }
  }

  /**
   * Get policy name
   */
  public getName(): string {
    const names = this.policies.map(p => p.getName()).join(' -> ');
    return `CompositePolicy(${names})`;
  }

  /**
   * Execute function with all policies applied
   */
  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Build nested execution by applying policies in reverse order
    let wrappedFn = fn;

    for (let i = this.policies.length - 1; i >= 0; i--) {
      const policy = this.policies[i];
      const currentFn = wrappedFn;
      wrappedFn = () => policy.execute(currentFn);
    }

    return wrappedFn();
  }
}
```

### 2.5 Configuration Schema

```typescript
// src/resilience/config.ts

/**
 * Resilience configuration
 */
export interface ResilienceConfig {
  /**
   * Enable resilience features
   * @default true
   */
  enabled: boolean;

  /**
   * Circuit breaker configuration
   */
  circuitBreaker: {
    enabled: boolean;
    failureThreshold: number;
    successThreshold: number;
    timeout: number;
    volumeThreshold: number;
    errorThresholdPercentage: number;
    rollingWindowSize: number;
  };

  /**
   * Retry configuration
   */
  retry: {
    enabled: boolean;
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
    multiplier: number;
    jitterFactor: number;
  };

  /**
   * Bulkhead configuration
   */
  bulkhead: {
    enabled: boolean;
    maxConcurrent: number;
    maxQueueSize: number;
  };

  /**
   * Timeout configuration
   */
  timeout: {
    enabled: boolean;
    defaultTimeout: number;
  };
}

/**
 * Default resilience configuration
 */
export const DEFAULT_RESILIENCE_CONFIG: ResilienceConfig = {
  enabled: true,
  circuitBreaker: {
    enabled: true,
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 60000,
    volumeThreshold: 10,
    errorThresholdPercentage: 50,
    rollingWindowSize: 10000,
  },
  retry: {
    enabled: true,
    maxAttempts: 3,
    initialDelay: 100,
    maxDelay: 30000,
    multiplier: 2,
    jitterFactor: 0.1,
  },
  bulkhead: {
    enabled: true,
    maxConcurrent: 10,
    maxQueueSize: 100,
  },
  timeout: {
    enabled: true,
    defaultTimeout: 30000,
  },
};
```

### 2.6 Example Usage

```typescript
// examples/resilience-example.ts

import { CircuitBreaker } from './resilience/circuitBreaker';
import { RetryExecutor, ErrorMatchers } from './resilience/retry';
import { Bulkhead } from './resilience/bulkhead';
import { CompositePolicy } from './resilience/policies/compositePolicy';

// 1. Circuit Breaker only
const breaker = new CircuitBreaker({
  failureThreshold: 5,
  timeout: 60000,
});

breaker.onStateChange(state => {
  console.log(`Circuit breaker state changed to: ${state}`);
});

async function callWithCircuitBreaker() {
  try {
    return await breaker.execute(async () => {
      const response = await fetch('https://api.example.com/data');
      if (!response.ok) throw new Error('API error');
      return response.json();
    });
  } catch (error) {
    if (error instanceof CircuitBreakerOpenError) {
      console.log('Service temporarily unavailable, using fallback');
      return { cached: true, data: [] };
    }
    throw error;
  }
}

// 2. Retry with Circuit Breaker
const retry = new RetryExecutor({
  maxAttempts: 3,
  initialDelay: 100,
  retryableErrors: [ErrorMatchers.isNetworkError, ErrorMatchers.isServerError],
});

const resilientPolicy = new CompositePolicy([breaker, retry]);

async function callWithRetryAndCircuitBreaker() {
  return await resilientPolicy.execute(async () => {
    const response = await fetch('https://api.example.com/data');
    if (!response.ok) throw new Error('API error');
    return response.json();
  });
}

// 3. Full protection: Circuit Breaker + Retry + Bulkhead + Timeout
const bulkhead = new Bulkhead({
  maxConcurrent: 10,
  maxQueueSize: 20,
});

const timeout = new TimeoutExecutor({
  timeoutMs: 5000,
  fallback: () => ({ timeout: true, data: [] }),
});

const fullProtection = new CompositePolicy([
  breaker,   // First: Stop requests to failing services
  retry,     // Second: Retry transient failures
  bulkhead,  // Third: Limit concurrent executions
  timeout,   // Fourth: Enforce timeout
]);

async function callWithFullProtection() {
  return await fullProtection.execute(async () => {
    const response = await fetch('https://api.example.com/data');
    if (!response.ok) throw new Error('API error');
    return response.json();
  });
}

// 4. Actor integration
class ResilientActor extends Actor {
  private policy: CompositePolicy;

  constructor(id: string, system: ActorSystem) {
    super(id, system);
    this.policy = new CompositePolicy([
      new CircuitBreaker({ failureThreshold: 3 }),
      new RetryExecutor({ maxAttempts: 2 }),
    ]);
  }

  async receive(message: any): Promise<void> {
    if (message.type === 'FETCH_DATA') {
      const result = await this.policy.execute(async () => {
        return await this.fetchData(message.url);
      });
      // Process result...
    }
  }

  private async fetchData(url: string): Promise<any> {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Fetch failed');
    return response.json();
  }
}
```

### 2.7 Testing Approach

```typescript
// tests/resilience/circuitBreaker.test.ts

import { test } from 'node:test';
import assert from 'node:assert';
import { CircuitBreaker } from '../../src/resilience/circuitBreaker';
import { CircuitState } from '../../src/resilience/types';

test('Circuit breaker should start in CLOSED state', () => {
  const breaker = new CircuitBreaker();
  assert.strictEqual(breaker.getState(), CircuitState.CLOSED);
});

test('Circuit breaker should open after failure threshold', async () => {
  const breaker = new CircuitBreaker({
    failureThreshold: 3,
    volumeThreshold: 3,
    errorThresholdPercentage: 50,
  });

  // Cause 3 failures
  for (let i = 0; i < 3; i++) {
    try {
      await breaker.execute(async () => {
        throw new Error('Simulated failure');
      });
    } catch (error) {
      // Expected
    }
  }

  assert.strictEqual(breaker.getState(), CircuitState.OPEN);
});

test('Circuit breaker should transition to HALF_OPEN after timeout', async () => {
  const breaker = new CircuitBreaker({
    failureThreshold: 1,
    volumeThreshold: 1,
    timeout: 100, // Short timeout for testing
  });

  // Cause failure to open circuit
  try {
    await breaker.execute(async () => {
      throw new Error('Failure');
    });
  } catch (error) {
    // Expected
  }

  assert.strictEqual(breaker.getState(), CircuitState.OPEN);

  // Wait for timeout
  await new Promise(resolve => setTimeout(resolve, 150));

  // Next execution should transition to HALF_OPEN
  try {
    await breaker.execute(async () => {
      return 'success';
    });
  } catch (error) {
    // May fail
  }

  // Check that state is now HALF_OPEN or CLOSED
  assert.ok(
    breaker.getState() === CircuitState.HALF_OPEN ||
    breaker.getState() === CircuitState.CLOSED
  );
});
```

---

## Priority 3: Fix Existing Placeholders

### Overview
Replace placeholder implementations with production-ready code for:
1. Compression middleware (streaming compression)
2. Wasm memory management (real allocation/deallocation)
3. WorkerPool (real message passing)

### 3.1 Compression Middleware - Real Implementation

#### Problem Analysis
Current implementation only sets headers without actual compression. Need streaming compression that:
- Actually compresses response data
- Works with native Node.js http.ServerResponse
- Handles backpressure correctly
- Supports both Brotli and Gzip

#### File: `src/performance/compression.ts`

```typescript
import { IncomingMessage, ServerResponse } from 'node:http';
import { createBrotliCompress, createGzip, BrotliOptions, ZlibOptions } from 'node:zlib';
import { Transform } from 'node:stream';

/**
 * Compression configuration
 */
export interface CompressionConfig {
  /**
   * Minimum response size to compress (bytes)
   * @default 1024
   */
  threshold: number;

  /**
   * Brotli compression quality (0-11)
   * @default 4
   */
  brotliQuality: number;

  /**
   * Gzip compression level (0-9)
   * @default 6
   */
  gzipLevel: number;

  /**
   * Content types to compress
   * @default text/*, application/json, application/javascript, application/xml
   */
  compressibleTypes: string[];
}

const DEFAULT_CONFIG: CompressionConfig = {
  threshold: 1024,
  brotliQuality: 4,
  gzipLevel: 6,
  compressibleTypes: [
    'text/',
    'application/json',
    'application/javascript',
    'application/xml',
    'application/x-www-form-urlencoded',
    'image/svg+xml',
  ],
};

/**
 * Parse Accept-Encoding header
 */
function parseAcceptEncoding(header: string): string[] {
  return header
    .split(',')
    .map(enc => enc.trim().split(';')[0])
    .filter(Boolean);
}

/**
 * Select best encoding based on Accept-Encoding header
 */
function selectEncoding(acceptedEncodings: string[]): string | null {
  const priority = ['br', 'gzip', 'deflate', 'identity'];

  for (const encoding of priority) {
    if (acceptedEncodings.includes(encoding)) {
      return encoding;
    }
  }

  return null;
}

/**
 * Check if content type is compressible
 */
function isCompressible(contentType: string, compressibleTypes: string[]): boolean {
  return compressibleTypes.some(type => contentType.startsWith(type));
}

/**
 * Compression middleware with real streaming compression
 *
 * @example
 * ```typescript
 * const server = new CortexHttpServer(3000);
 * server.use(compression({
 *   threshold: 1024,
 *   brotliQuality: 4,
 * }));
 * ```
 */
export function compression(config: Partial<CompressionConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const acceptEncoding = req.headers['accept-encoding'] || '';
    const accepted = parseAcceptEncoding(acceptEncoding);
    const encoding = selectEncoding(accepted);

    // No compression needed
    if (!encoding || encoding === 'identity') {
      return next();
    }

    // Store original methods
    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);
    const originalWriteHead = res.writeHead.bind(res);

    let compressionStream: Transform | null = null;
    let headersSent = false;
    const chunks: Buffer[] = [];

    // Override writeHead to intercept headers
    res.writeHead = function(statusCode: number, statusMessage?: string | any, headers?: any) {
      // Handle overload: writeHead(statusCode, headers)
      if (typeof statusMessage === 'object') {
        headers = statusMessage;
        statusMessage = undefined;
      }

      const finalHeaders = headers || {};
      const contentType = finalHeaders['content-type'] || res.getHeader('content-type') as string || '';
      const contentEncoding = finalHeaders['content-encoding'] || res.getHeader('content-encoding');

      // Skip if already encoded or not compressible
      if (contentEncoding || !isCompressible(contentType, finalConfig.compressibleTypes)) {
        return originalWriteHead(statusCode, statusMessage as string, finalHeaders);
      }

      // Setup compression stream
      if (encoding === 'br') {
        const options: BrotliOptions = {
          params: {
            [require('zlib').constants.BROTLI_PARAM_QUALITY]: finalConfig.brotliQuality,
          },
        };
        compressionStream = createBrotliCompress(options);
      } else if (encoding === 'gzip') {
        compressionStream = createGzip({ level: finalConfig.gzipLevel });
      }

      if (compressionStream) {
        // Set compression headers
        finalHeaders['content-encoding'] = encoding;
        finalHeaders['vary'] = 'Accept-Encoding';
        delete finalHeaders['content-length']; // Will change after compression

        // Pipe compression stream to response
        compressionStream.on('data', (chunk: Buffer) => {
          originalWrite(chunk);
        });

        compressionStream.on('end', () => {
          originalEnd();
        });
      }

      headersSent = true;
      return originalWriteHead(statusCode, statusMessage as string, finalHeaders);
    } as any;

    // Override write to collect data
    res.write = function(chunk: any, encoding?: any, callback?: any): boolean {
      if (compressionStream) {
        // Check threshold
        chunks.push(Buffer.from(chunk));
        const totalSize = chunks.reduce((sum, c) => sum + c.length, 0);

        if (totalSize >= finalConfig.threshold) {
          // Start compression
          if (!headersSent) {
            res.writeHead(res.statusCode);
          }
          chunks.forEach(c => compressionStream!.write(c));
          chunks.length = 0;
          compressionStream.write(chunk, encoding, callback);
        }
        return true;
      }

      return originalWrite(chunk, encoding, callback);
    } as any;

    // Override end to finalize compression
    res.end = function(chunk?: any, encoding?: any, callback?: any): typeof res {
      if (compressionStream) {
        const totalSize = chunks.reduce((sum, c) => sum + c.length, 0) + (chunk ? Buffer.from(chunk).length : 0);

        // Check if we should compress
        if (totalSize < finalConfig.threshold) {
          // Too small, don't compress
          compressionStream = null;
          if (!headersSent) {
            res.writeHead(res.statusCode);
          }
          chunks.forEach(c => originalWrite(c));
          if (chunk) originalWrite(chunk, encoding);
          return originalEnd(callback);
        }

        // Compress and send
        if (!headersSent) {
          res.writeHead(res.statusCode);
        }
        chunks.forEach(c => compressionStream!.write(c));
        chunks.length = 0;

        if (chunk) {
          compressionStream.write(chunk, encoding);
        }
        compressionStream.end(callback);
        return res;
      }

      return originalEnd(chunk, encoding, callback);
    } as any;

    next();
  };
}

/**
 * Brotli compression middleware (convenience function)
 */
export function brotliCompression(quality: number = 4) {
  return compression({
    brotliQuality: quality,
    gzipLevel: 0, // Prefer Brotli
  });
}

/**
 * Gzip compression middleware (convenience function)
 */
export function gzipCompression(level: number = 6) {
  return compression({
    brotliQuality: 0, // Prefer Gzip
    gzipLevel: level,
  });
}
```

#### Why Fix This First?
- **High Impact**: Compression significantly reduces bandwidth and improves performance
- **Production Critical**: Most production apps need compression
- **Existing Placeholder**: Already has structure, just needs real implementation
- **Zero Dependencies**: Uses only Node.js built-in zlib

#### Testing Strategy

```typescript
// tests/performance/compression.test.ts

import { test } from 'node:test';
import assert from 'node:assert';
import { compression } from '../../src/performance/compression';
import { createGunzip, createBrotliDecompress } from 'node:zlib';
import { pipeline } from 'node:stream/promises';

test('Compression should compress gzip response', async () => {
  const mockReq = {
    headers: { 'accept-encoding': 'gzip' },
  } as any;

  const chunks: Buffer[] = [];
  const mockRes = createMockResponse(chunks);

  const middleware = compression({ threshold: 0 }); // No threshold for testing

  middleware(mockReq, mockRes, () => {
    mockRes.writeHead(200, { 'content-type': 'text/plain' });
    mockRes.end('Hello, World!');
  });

  // Wait for compression to complete
  await new Promise(resolve => setTimeout(resolve, 100));

  // Verify Content-Encoding header
  assert.strictEqual(mockRes.getHeader('content-encoding'), 'gzip');

  // Decompress and verify content
  const compressed = Buffer.concat(chunks);
  const decompressed = await decompressGzip(compressed);
  assert.strictEqual(decompressed.toString(), 'Hello, World!');
});

function createMockResponse(chunks: Buffer[]) {
  const headers: Record<string, any> = {};
  return {
    statusCode: 200,
    write: (chunk: any) => { chunks.push(Buffer.from(chunk)); return true; },
    end: (chunk?: any) => { if (chunk) chunks.push(Buffer.from(chunk)); },
    writeHead: function(code: number, hdrs: any) {
      this.statusCode = code;
      Object.assign(headers, hdrs);
    },
    getHeader: (name: string) => headers[name],
    setHeader: (name: string, value: any) => { headers[name] = value; },
  };
}

async function decompressGzip(data: Buffer): Promise<Buffer> {
  const gunzip = createGunzip();
  const chunks: Buffer[] = [];
  gunzip.on('data', chunk => chunks.push(chunk));
  return new Promise((resolve, reject) => {
    gunzip.on('end', () => resolve(Buffer.concat(chunks)));
    gunzip.on('error', reject);
    gunzip.end(data);
  });
}
```

### 3.2 Wasm Memory Management - Real Implementation

#### Problem Analysis
Current implementation uses placeholders for memory allocation. Need real memory management that:
- Allocates memory in Wasm linear memory
- Properly deallocates memory
- Handles data serialization/deserialization
- Prevents memory leaks

#### File: `src/wasm/utils.ts`

```typescript
/**
 * WebAssembly memory manager for zero-copy data passing
 */
export class WasmMemoryManager {
  private memory: WebAssembly.Memory;
  private allocations: Map<number, number> = new Map(); // ptr -> size
  private freeList: Array<{ ptr: number; size: number }> = [];

  constructor(memory: WebAssembly.Memory) {
    this.memory = memory;
  }

  /**
   * Allocate memory in Wasm linear memory
   *
   * @param size - Number of bytes to allocate
   * @returns Pointer to allocated memory
   */
  public alloc(size: number): number {
    // Try to reuse freed memory
    const freeIndex = this.freeList.findIndex(block => block.size >= size);
    if (freeIndex !== -1) {
      const block = this.freeList[freeIndex];
      this.freeList.splice(freeIndex, 1);
      this.allocations.set(block.ptr, size);
      return block.ptr;
    }

    // Allocate new memory
    const currentSize = this.memory.buffer.byteLength;
    const ptr = currentSize;

    // Grow memory if needed
    const requiredPages = Math.ceil(size / 65536); // 64KB per page
    if (ptr + size > currentSize) {
      this.memory.grow(requiredPages);
    }

    this.allocations.set(ptr, size);
    return ptr;
  }

  /**
   * Deallocate memory
   *
   * @param ptr - Pointer to memory to free
   */
  public free(ptr: number): void {
    const size = this.allocations.get(ptr);
    if (size === undefined) {
      throw new Error(`Invalid pointer: ${ptr}`);
    }

    this.allocations.delete(ptr);
    this.freeList.push({ ptr, size });

    // Merge adjacent free blocks
    this.mergeFreeBlocks();
  }

  /**
   * Write data to Wasm memory
   *
   * @param ptr - Pointer to write to
   * @param data - Uint8Array to write
   */
  public write(ptr: number, data: Uint8Array): void {
    const size = this.allocations.get(ptr);
    if (size === undefined || data.length > size) {
      throw new Error(`Invalid write: ptr=${ptr}, size=${data.length}`);
    }

    const view = new Uint8Array(this.memory.buffer, ptr, data.length);
    view.set(data);
  }

  /**
   * Read data from Wasm memory
   *
   * @param ptr - Pointer to read from
   * @param length - Number of bytes to read
   * @returns Uint8Array with data
   */
  public read(ptr: number, length: number): Uint8Array {
    const size = this.allocations.get(ptr);
    if (size === undefined || length > size) {
      throw new Error(`Invalid read: ptr=${ptr}, length=${length}`);
    }

    const view = new Uint8Array(this.memory.buffer, ptr, length);
    return new Uint8Array(view); // Copy to prevent external modification
  }

  /**
   * Get memory statistics
   */
  public getStats() {
    const allocated = Array.from(this.allocations.values()).reduce((sum, size) => sum + size, 0);
    const free = this.freeList.reduce((sum, block) => sum + block.size, 0);

    return {
      totalSize: this.memory.buffer.byteLength,
      allocated,
      free,
      allocations: this.allocations.size,
      freeBlocks: this.freeList.length,
    };
  }

  private mergeFreeBlocks(): void {
    // Sort by pointer address
    this.freeList.sort((a, b) => a.ptr - b.ptr);

    // Merge adjacent blocks
    for (let i = 0; i < this.freeList.length - 1; i++) {
      const current = this.freeList[i];
      const next = this.freeList[i + 1];

      if (current.ptr + current.size === next.ptr) {
        current.size += next.size;
        this.freeList.splice(i + 1, 1);
        i--;
      }
    }
  }
}

/**
 * Load Wasm module from URL or buffer
 */
export async function loadWasmModule(source: string | BufferSource): Promise<WebAssembly.Module> {
  if (typeof source === 'string') {
    // Load from URL (Node.js)
    if (typeof fetch !== 'undefined') {
      const response = await fetch(source);
      const buffer = await response.arrayBuffer();
      return WebAssembly.compile(buffer);
    } else {
      // Node.js without fetch
      const fs = await import('fs/promises');
      const buffer = await fs.readFile(source);
      return WebAssembly.compile(buffer);
    }
  } else {
    return WebAssembly.compile(source);
  }
}

/**
 * Instantiate Wasm module with memory management
 */
export async function instantiateWasmModule(
  module: WebAssembly.Module,
  imports?: WebAssembly.Imports
): Promise<{ instance: WebAssembly.Instance; memoryManager: WasmMemoryManager }> {
  const memory = new WebAssembly.Memory({ initial: 1 }); // 1 page = 64KB

  const finalImports = {
    ...imports,
    env: {
      memory,
      ...(imports?.env || {}),
    },
  };

  const instance = await WebAssembly.instantiate(module, finalImports);
  const memoryManager = new WasmMemoryManager(memory);

  return { instance, memoryManager };
}

/**
 * Serialize JavaScript data to Wasm memory
 */
export function jsToWasm(
  data: any,
  memoryManager: WasmMemoryManager
): { ptr: number; length: number } {
  const jsonString = JSON.stringify(data);
  const encoder = new TextEncoder();
  const encoded = encoder.encode(jsonString);

  const ptr = memoryManager.alloc(encoded.length);
  memoryManager.write(ptr, encoded);

  return { ptr, length: encoded.length };
}

/**
 * Deserialize data from Wasm memory to JavaScript
 */
export function wasmToJs(
  ptr: number,
  length: number,
  memoryManager: WasmMemoryManager
): any {
  const data = memoryManager.read(ptr, length);
  const decoder = new TextDecoder();
  const jsonString = decoder.decode(data);
  return JSON.parse(jsonString);
}
```

### 3.3 WorkerPool - Real Message Passing

#### Problem Analysis
Current implementation simulates message passing with setTimeout. Need real Web Worker integration that:
- Uses actual worker threads
- Implements proper message passing with postMessage
- Handles worker lifecycle correctly
- Supports transferable objects

#### File: `src/workers/workerPool.ts`

```typescript
import { Worker } from 'node:worker_threads';
import { EventEmitter } from 'node:events';

/**
 * Worker pool message types
 */
interface WorkerMessage {
  id: string;
  type: 'execute' | 'result' | 'error';
  payload?: any;
  error?: string;
}

/**
 * Worker wrapper with message handling
 */
class PooledWorker extends EventEmitter {
  private worker: Worker;
  private busy: boolean = false;
  private currentTaskId?: string;

  constructor(workerScript: string) {
    super();
    this.worker = new Worker(workerScript);

    this.worker.on('message', (message: WorkerMessage) => {
      this.handleMessage(message);
    });

    this.worker.on('error', (error) => {
      this.emit('error', error);
    });

    this.worker.on('exit', (code) => {
      if (code !== 0) {
        this.emit('error', new Error(`Worker stopped with exit code ${code}`));
      }
    });
  }

  public isBusy(): boolean {
    return this.busy;
  }

  public async execute(taskId: string, payload: any): Promise<any> {
    if (this.busy) {
      throw new Error('Worker is busy');
    }

    this.busy = true;
    this.currentTaskId = taskId;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.busy = false;
        this.currentTaskId = undefined;
        reject(new Error('Worker task timeout'));
      }, 30000); // 30 second timeout

      const handleResult = (message: WorkerMessage) => {
        if (message.id === taskId) {
          clearTimeout(timeout);
          this.removeListener('result', handleResult);
          this.removeListener('error', handleError);
          this.busy = false;
          this.currentTaskId = undefined;

          if (message.type === 'result') {
            resolve(message.payload);
          } else {
            reject(new Error(message.error || 'Unknown error'));
          }
        }
      };

      const handleError = (error: Error) => {
        clearTimeout(timeout);
        this.removeListener('result', handleResult);
        this.removeListener('error', handleError);
        this.busy = false;
        this.currentTaskId = undefined;
        reject(error);
      };

      this.on('result', handleResult);
      this.on('error', handleError);

      // Send task to worker
      this.worker.postMessage({
        id: taskId,
        type: 'execute',
        payload,
      } as WorkerMessage);
    });
  }

  public terminate(): void {
    this.worker.terminate();
  }

  private handleMessage(message: WorkerMessage): void {
    if (message.type === 'result' || message.type === 'error') {
      this.emit('result', message);
    }
  }
}

/**
 * Worker pool configuration
 */
export interface WorkerPoolConfig {
  /**
   * Number of workers in pool
   * @default 4
   */
  poolSize: number;

  /**
   * Path to worker script
   */
  workerScript: string;

  /**
   * Maximum queue size
   * @default Infinity
   */
  maxQueueSize: number;
}

/**
 * Task in queue
 */
interface QueuedTask {
  id: string;
  payload: any;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}

/**
 * WorkerPool manages a pool of worker threads for parallel execution
 *
 * @example
 * ```typescript
 * const pool = new WorkerPool({
 *   poolSize: 4,
 *   workerScript: './worker.js',
 * });
 *
 * const result = await pool.execute({ task: 'heavy_computation', data: [1, 2, 3] });
 *
 * await pool.shutdown();
 * ```
 */
export class WorkerPool {
  private workers: PooledWorker[] = [];
  private queue: QueuedTask[] = [];
  private config: WorkerPoolConfig;
  private taskIdCounter: number = 0;

  constructor(config: WorkerPoolConfig) {
    this.config = config;

    // Create worker pool
    for (let i = 0; i < config.poolSize; i++) {
      const worker = new PooledWorker(config.workerScript);

      worker.on('error', (error) => {
        console.error(`Worker ${i} error:`, error);
        // TODO: Implement worker restart logic
      });

      this.workers.push(worker);
    }
  }

  /**
   * Execute task in worker pool
   *
   * @param payload - Task payload to send to worker
   * @returns Promise with task result
   */
  public async execute(payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const taskId = `task-${++this.taskIdCounter}`;

      // Check queue size
      if (this.queue.length >= this.config.maxQueueSize) {
        reject(new Error('Worker pool queue is full'));
        return;
      }

      // Add to queue
      this.queue.push({ id: taskId, payload, resolve, reject });

      // Process queue
      this.processQueue();
    });
  }

  /**
   * Get worker pool statistics
   */
  public getStats() {
    return {
      poolSize: this.workers.length,
      busyWorkers: this.workers.filter(w => w.isBusy()).length,
      availableWorkers: this.workers.filter(w => !w.isBusy()).length,
      queueSize: this.queue.length,
      maxQueueSize: this.config.maxQueueSize,
    };
  }

  /**
   * Shutdown worker pool
   */
  public async shutdown(): Promise<void> {
    // Clear queue
    this.queue.forEach(task => {
      task.reject(new Error('Worker pool shutting down'));
    });
    this.queue = [];

    // Terminate all workers
    await Promise.all(
      this.workers.map(worker => {
        return new Promise<void>((resolve) => {
          worker.terminate();
          resolve();
        });
      })
    );

    this.workers = [];
  }

  private processQueue(): void {
    // Find available worker
    const availableWorker = this.workers.find(w => !w.isBusy());

    if (!availableWorker || this.queue.length === 0) {
      return;
    }

    // Get next task from queue
    const task = this.queue.shift()!;

    // Execute task
    availableWorker
      .execute(task.id, task.payload)
      .then(result => {
        task.resolve(result);
        // Process next task
        this.processQueue();
      })
      .catch(error => {
        task.reject(error);
        // Process next task even on error
        this.processQueue();
      });
  }
}

/**
 * Example worker script template (save as worker.js)
 *
 * ```javascript
 * const { parentPort } = require('worker_threads');
 *
 * parentPort.on('message', (message) => {
 *   try {
 *     // Process task
 *     const result = processTask(message.payload);
 *
 *     // Send result back
 *     parentPort.postMessage({
 *       id: message.id,
 *       type: 'result',
 *       payload: result,
 *     });
 *   } catch (error) {
 *     parentPort.postMessage({
 *       id: message.id,
 *       type: 'error',
 *       error: error.message,
 *     });
 *   }
 * });
 *
 * function processTask(payload) {
 *   // Heavy computation here
 *   return payload.data.reduce((a, b) => a + b, 0);
 * }
 * ```
 */
```

#### Priority Order for Fixing
1. **Compression Middleware** - Highest priority
   - Most commonly needed feature
   - Clear performance impact
   - Existing tests to update

2. **WorkerPool** - Medium priority
   - Needed for multi-threading features
   - Affects performance features
   - Moderate complexity

3. **Wasm Memory Management** - Lower priority
   - Niche use case
   - Fewer immediate use cases
   - Higher complexity

---

## Integration Strategy

### Phase 1: Observability Foundation (Week 1)
1. Implement metrics system (Counter, Gauge, Histogram)
2. Add metrics endpoints to HttpServer
3. Write comprehensive tests
4. Update documentation

### Phase 2: Tracing System (Week 2)
1. Implement tracing infrastructure
2. Add trace context propagation
3. Integrate with ActorSystem
4. Add tracing middleware

### Phase 3: Health Checks (Week 3)
1. Implement health check registry
2. Add default health checks
3. Create health endpoint
4. Integration testing

### Phase 4: Resilience Patterns (Week 4)
1. Implement Circuit Breaker
2. Implement Retry Executor
3. Implement Bulkhead
4. Create policy composition

### Phase 5: Fix Placeholders (Week 5)
1. Fix compression middleware
2. Fix WorkerPool
3. Fix Wasm memory management
4. Integration testing

---

## Testing Strategy

### Unit Tests
- Test each class in isolation
- Mock dependencies
- Cover edge cases
- Aim for 90%+ coverage

### Integration Tests
- Test component interactions
- Real HTTP requests
- Actor system integration
- End-to-end scenarios

### Performance Tests
- Benchmark metrics collection overhead
- Measure tracing impact
- Test resilience patterns under load
- Compare compression algorithms

### TDD Approach
1. Write failing test first
2. Implement minimal code to pass
3. Refactor for clean code
4. Repeat

---

## Summary

This specification provides:
- ✅ Complete file structures
- ✅ Type definitions with JSDoc
- ✅ Class skeletons with method signatures
- ✅ Integration points with existing code
- ✅ Configuration schemas
- ✅ Example usage patterns
- ✅ Testing strategies
- ✅ Priority ordering for implementation

The team can now start implementing immediately, following TDD principles and maintaining zero-dependency constraints.
