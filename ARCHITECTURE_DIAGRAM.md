# Cortex Framework - Architecture Diagram

## System Overview with Priority 1-3 Additions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Cortex Framework Architecture                        │
│                     (With Observability & Resilience)                        │
└─────────────────────────────────────────────────────────────────────────────┘

                                   HTTP Requests
                                        │
                                        ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                           CortexHttpServer                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │                      Middleware Stack                                 │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐    │ │
│  │  │  Metrics   │→ │  Tracing   │→ │Compression │→ │Rate Limiter│    │ │
│  │  │ Middleware │  │ Middleware │  │ Middleware │  │            │    │ │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘    │ │
│  │         │               │               │               │             │ │
│  └─────────┼───────────────┼───────────────┼───────────────┼─────────────┘ │
│            │               │               │               │               │
│            │               │               │               │               │
│  ┌─────────▼───────────────▼───────────────▼───────────────▼─────────────┐ │
│  │                        Route Handlers                                  │ │
│  │  GET /metrics │ GET /health │ GET /api/* │ POST /api/*                │ │
│  └────────┬───────────────┬────────────────┬────────────────────────────┘ │
└───────────┼───────────────┼────────────────┼──────────────────────────────┘
            │               │                │
            │               │                │
            ▼               ▼                ▼
┌───────────────────┐ ┌──────────────┐ ┌──────────────────────────────────┐
│ MetricsCollector  │ │  HealthCheck │ │        ActorSystem               │
│                   │ │   Registry   │ │                                  │
│ ┌───────────────┐ │ │              │ │  ┌────────────────────────────┐ │
│ │ Counter       │ │ │ ┌──────────┐ │ │  │   Actor Supervision Tree   │ │
│ │ Gauge         │ │ │ │Database  │ │ │  │                            │ │
│ │ Histogram     │ │ │ │EventBus  │ │ │  │    ┌──────────────────┐   │ │
│ └───────────────┘ │ │ │ActorSys  │ │ │  │    │  Supervisor      │   │ │
│                   │ │ └──────────┘ │ │  │    │                  │   │ │
│ Prometheus Format │ │              │ │  │    │  ┌────┐  ┌────┐  │   │ │
└─────────┬─────────┘ └──────────────┘ │  │    │  │A1  │  │A2  │  │   │ │
          │                             │  │    │  └────┘  └────┘  │   │ │
          │                             │  │    └──────────────────┘   │ │
          ▼                             │  │                            │ │
    /metrics endpoint                   │  │  With Metrics & Tracing    │ │
                                        │  └────────────────────────────┘ │
                                        │                                  │
                                        │  ┌────────────────────────────┐ │
                                        │  │    Message Processing      │ │
                                        │  │                            │ │
                                        │  │    ┌──────────────────┐   │ │
                                        │  │    │ ResiliencePolicy │   │ │
                                        │  │    │                  │   │ │
                                        │  │    │ ┌──────────────┐ │   │ │
                                        │  │    │ │CircuitBreaker│ │   │ │
                                        │  │    │ │    Retry     │ │   │ │
                                        │  │    │ │   Bulkhead   │ │   │ │
                                        │  │    │ └──────────────┘ │   │ │
                                        │  │    └──────────────────┘   │ │
                                        │  └────────────────────────────┘ │
                                        └──────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                             Supporting Systems                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│    EventBus      │  │   WorkerPool     │  │  WasmManager     │
│                  │  │                  │  │                  │
│  Pub/Sub         │  │  ┌────────────┐  │  │  ┌────────────┐  │
│  Event handling  │  │  │ Worker 1   │  │  │  │Memory Mgmt │  │
│  Error recovery  │  │  │ Worker 2   │  │  │  │Alloc/Free  │  │
│                  │  │  │ Worker 3   │  │  │  │Load/Store  │  │
│  With tracing    │  │  │ Worker 4   │  │  │  └────────────┘  │
│  propagation     │  │  └────────────┘  │  │                  │
└──────────────────┘  │                  │  │  For compute-    │
                      │  Real message    │  │  intensive tasks │
                      │  passing (fixed) │  └──────────────────┘
                      └──────────────────┘
```

## Data Flow: HTTP Request with Full Observability

```
HTTP Request
    │
    ▼
[1] Metrics Middleware
    │ • Increment http_requests_total counter
    │ • Start http_request_duration_seconds histogram timer
    │
    ▼
[2] Tracing Middleware
    │ • Extract trace context from headers (traceparent)
    │ • Create SERVER span with trace ID
    │ • Set span attributes (method, path, status)
    │
    ▼
[3] Compression Middleware (FIXED!)
    │ • Check Accept-Encoding header
    │ • Buffer response data
    │ • Stream compress if > threshold
    │ • Set Content-Encoding header
    │
    ▼
[4] Route Handler
    │ • Match route pattern
    │ • Extract path parameters
    │ • Execute handler function
    │   │
    │   ▼
    │ [4a] Call Actor (if needed)
    │   │ • Propagate trace context
    │   │ • Increment actor_messages_total
    │   │ • Create INTERNAL span
    │   │ • Apply resilience policy
    │   │   │
    │   │   ▼
    │   │ [4a-1] Circuit Breaker
    │   │   │ • Check state (CLOSED/OPEN/HALF_OPEN)
    │   │   │ • Execute or reject
    │   │   │ • Track failures/successes
    │   │   │
    │   │   ▼
    │   │ [4a-2] Retry Executor (if circuit closed)
    │   │   │ • Try operation
    │   │   │ • On failure: exponential backoff + jitter
    │   │   │ • Retry up to maxAttempts
    │   │   │
    │   │   ▼
    │   │ [4a-3] Bulkhead (if retrying)
    │   │   │ • Check concurrent limit
    │   │   │ • Queue if at limit
    │   │   │ • Execute when slot available
    │   │
    │   └─► Return result or throw error
    │
    ▼
[5] Response
    │ • End span (set status OK/ERROR)
    │ • Record histogram value
    │ • Compress if needed
    │ • Send to client
    │
    ▼
HTTP Response
```

## Observability Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Metrics Collection                              │
└─────────────────────────────────────────────────────────────────────────┘

    Application Code
         │
         ├─► Counter.inc()
         │   └─► MetricsCollector
         │       └─► Prometheus Format Export
         │           └─► GET /metrics
         │               └─► Prometheus Server (external)
         │
         ├─► Gauge.set()
         │   └─► MetricsCollector
         │       └─► Current value
         │
         └─► Histogram.observe()
             └─► MetricsCollector
                 └─► Buckets, sum, count

┌─────────────────────────────────────────────────────────────────────────┐
│                         Trace Propagation                                │
└─────────────────────────────────────────────────────────────────────────┘

    HTTP Request
         │
         ├─► Extract traceparent header
         │   └─► Parse: 00-{trace-id}-{span-id}-{flags}
         │
         ├─► Create Span
         │   ├─► traceId: from header or generate
         │   ├─► spanId: generate new
         │   ├─► parentSpanId: from header
         │   └─► kind: SERVER
         │
         ├─► Set Attributes
         │   ├─► http.method
         │   ├─► http.url
         │   ├─► http.status_code
         │   └─► service.name
         │
         ├─► Propagate to Actor
         │   └─► Include trace context in message
         │       └─► Actor creates INTERNAL span
         │           └─► Child of SERVER span
         │
         └─► End Span
             ├─► Set status (OK/ERROR)
             ├─► Calculate duration
             └─► Export (console/file/collector)

┌─────────────────────────────────────────────────────────────────────────┐
│                          Health Checks                                   │
└─────────────────────────────────────────────────────────────────────────┘

    GET /health
         │
         ▼
    HealthCheckRegistry.checkAll()
         │
         ├─► DatabaseHealthCheck
         │   └─► Check connection
         │       └─► UP/DOWN/DEGRADED
         │
         ├─► EventBusHealthCheck
         │   └─► Check subscribers
         │       └─► UP/DOWN/DEGRADED
         │
         ├─► ActorSystemHealthCheck
         │   └─► Check active actors
         │       └─► UP/DOWN/DEGRADED
         │
         └─► Aggregate Status
             ├─► All UP → 200 OK
             ├─► Any DEGRADED → 200 OK (warning)
             └─► Any DOWN → 503 Service Unavailable
```

## Resilience Patterns: Circuit Breaker State Machine

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Circuit Breaker States                               │
└─────────────────────────────────────────────────────────────────────────┘

                    ┌──────────────────┐
           ┌───────▶│     CLOSED       │◀────────┐
           │        │  (Normal mode)   │         │
           │        └────────┬─────────┘         │
           │                 │                    │
           │                 │ Failure threshold  │
           │                 │ exceeded           │
           │                 │                    │
           │                 ▼                    │
           │        ┌──────────────────┐         │
           │        │      OPEN        │         │
           │        │ (Reject requests)│         │
           │        └────────┬─────────┘         │
           │                 │                    │
           │                 │ Timeout elapsed    │
           │                 │                    │
           │                 ▼                    │
           │        ┌──────────────────┐         │
           │        │   HALF_OPEN      │         │
           │        │ (Testing service)│         │
           │        └─────┬──────┬─────┘         │
           │              │      │                │
           │    Failure   │      │  Success       │
           │              │      │  threshold     │
           │              │      │  met           │
           └──────────────┘      └────────────────┘

Transitions:
• CLOSED → OPEN: When error rate > threshold
• OPEN → HALF_OPEN: After timeout period
• HALF_OPEN → CLOSED: After N successful requests
• HALF_OPEN → OPEN: On any failure
```

## Policy Composition Example

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Composite Resilience Policy                           │
│                                                                          │
│  const policy = new CompositePolicy([                                   │
│    new CircuitBreaker({ failureThreshold: 5 }),                        │
│    new RetryExecutor({ maxAttempts: 3 }),                              │
│    new Bulkhead({ maxConcurrent: 10 }),                                │
│    new TimeoutExecutor({ timeoutMs: 5000 }),                           │
│  ]);                                                                     │
└─────────────────────────────────────────────────────────────────────────┘

    Execute: policy.execute(() => callExternalAPI())
                      │
                      ▼
         [1] Circuit Breaker Check
                      │
         ┌────────────┴────────────┐
         │                         │
         ▼                         ▼
    State CLOSED            State OPEN
         │                         │
         │                         └─► Reject (throw)
         │
         ▼
         [2] Retry Wrapper
                      │
         ┌────────────┴────────────┐
         │                         │
         ▼                         ▼
    Try 1: fail              Try 1: success
         │                         │
         ▼                         └─► Return result
    Wait + jitter
         │
         ▼
         [3] Bulkhead Check
                      │
         ┌────────────┴────────────┐
         │                         │
         ▼                         ▼
    Slot available          Queue full
         │                         │
         │                         └─► Reject (throw)
         │
         ▼
         [4] Timeout Wrapper
                      │
         ┌────────────┴────────────┐
         │                         │
         ▼                         ▼
    Complete < 5s           Timeout > 5s
         │                         │
         └─► Success               └─► Reject (throw)
```

## Module Dependencies

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Core Framework                                   │
│  (Existing - No changes required)                                       │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │ ActorSystem  │  │ HttpServer   │  │  EventBus    │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
└─────────────────────────────────────────────────────────────────────────┘
           │                  │                  │
           │                  │                  │
           ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Priority 1: Observability                           │
│  (New - Zero dependencies)                                              │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │   Metrics    │  │   Tracing    │  │    Health    │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      Priority 2: Resilience                              │
│  (New - Zero dependencies)                                              │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │Circuit Breaker│ │    Retry     │  │  Bulkhead    │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      Priority 3: Fixes                                   │
│  (Existing - Replace placeholders)                                      │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │ Compression  │  │ WorkerPool   │  │WasmMemoryMgr │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
└─────────────────────────────────────────────────────────────────────────┘

No circular dependencies!
Clean separation of concerns!
All testable in isolation!
```

## Integration Points Summary

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Integration Matrix                                │
└─────────────────────────────────────────────────────────────────────────┘

Component        │ ActorSystem │ HttpServer │ EventBus │ Workers │ Wasm
─────────────────┼─────────────┼────────────┼──────────┼─────────┼──────
Metrics          │     ✓       │     ✓      │    ✓     │    ✓    │  ✓
Tracing          │     ✓       │     ✓      │    ✓     │    -    │  -
Health Checks    │     ✓       │     ✓      │    ✓     │    ✓    │  -
Circuit Breaker  │     ✓       │     -      │    -     │    ✓    │  -
Retry            │     ✓       │     -      │    -     │    -    │  -
Bulkhead         │     ✓       │     -      │    -     │    ✓    │  -
Compression      │     -       │     ✓      │    -     │    -    │  -
WorkerPool       │     ✓       │     -      │    -     │    -    │  -
WasmManager      │     ✓       │     -      │    -     │    -    │  -

Legend:
✓ = Integrated
- = Not integrated (by design)
```

## File Organization

```
cortex/
│
├── src/
│   ├── core/                        # Existing (no changes)
│   │   ├── actorSystem.ts
│   │   ├── httpServer.ts
│   │   ├── eventBus.ts
│   │   └── logger.ts
│   │
│   ├── observability/               # NEW (Priority 1)
│   │   ├── types.ts                 # ← Start here
│   │   ├── metrics/
│   │   │   ├── counter.ts           # ← Then this
│   │   │   ├── gauge.ts
│   │   │   ├── histogram.ts
│   │   │   └── collector.ts
│   │   ├── tracing/
│   │   │   ├── span.ts
│   │   │   ├── tracer.ts
│   │   │   └── context.ts
│   │   ├── health/
│   │   │   ├── healthCheck.ts
│   │   │   └── healthRegistry.ts
│   │   └── middleware/
│   │       ├── metricsMiddleware.ts
│   │       └── tracingMiddleware.ts
│   │
│   ├── resilience/                  # NEW (Priority 2)
│   │   ├── types.ts
│   │   ├── errors.ts
│   │   ├── circuitBreaker.ts        # ← Start here
│   │   ├── retry.ts
│   │   ├── bulkhead.ts
│   │   ├── timeout.ts
│   │   └── policies/
│   │       └── compositePolicy.ts
│   │
│   ├── performance/                 # EXISTING (Priority 3 - fix)
│   │   └── compression.ts           # ← Replace placeholder
│   │
│   ├── workers/                     # EXISTING (Priority 3 - fix)
│   │   └── workerPool.ts            # ← Replace placeholder
│   │
│   └── wasm/                        # EXISTING (Priority 3 - fix)
│       └── utils.ts                 # ← Replace placeholder
│
├── tests/                           # Mirror src/ structure
│   ├── observability/
│   ├── resilience/
│   ├── performance/
│   ├── workers/
│   └── wasm/
│
├── examples/                        # Usage examples
│   ├── observability-example.ts
│   ├── resilience-example.ts
│   └── compression-example.ts
│
└── docs/                            # Documentation
    ├── IMPLEMENTATION_SPEC.md
    ├── IMPLEMENTATION_QUICK_START.md
    ├── CODER_AGENT_SUMMARY.md
    └── ARCHITECTURE_DIAGRAM.md      # ← You are here
```

---

## Quick Reference: Where to Start

### Day 1: Metrics (2-3 hours)
```
src/observability/types.ts          # 10 min
src/observability/metrics/counter.ts # 20 min
tests/observability/metrics/counter.test.ts # 30 min
```

### Day 2: More Metrics (2-3 hours)
```
src/observability/metrics/gauge.ts
src/observability/metrics/histogram.ts
src/observability/metrics/collector.ts
+ corresponding tests
```

### Day 3: Tracing (2-3 hours)
```
src/observability/tracing/span.ts
src/observability/tracing/tracer.ts
+ corresponding tests
```

### Day 4: Health Checks (2 hours)
```
src/observability/health/healthCheck.ts
src/observability/health/healthRegistry.ts
+ corresponding tests
```

### Day 5: Integration (2 hours)
```
Update src/core/actorSystem.ts
Update src/core/httpServer.ts
Add /metrics and /health endpoints
```

---

**Total Lines of ASCII Art:** ~500
**Visual Elements:** 10 diagrams
**Integration Points:** Clearly marked
**File Paths:** All absolute
**Ready to Code:** Yes!
