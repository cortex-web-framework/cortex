# Quick Reference Guide: Cortex Framework Best Practices

## Actor System Quick Reference

### Supervision Strategy Selection

```typescript
// Independent workers (HTTP handlers, task processors)
const strategy = new OneForOneStrategy({
  maxRetries: 3,
  withinTimeRange: 60000 // 1 minute
});

// Coordinated subsystems (database pool, cache cluster)
const strategy = new AllForOneStrategy({
  maxRetries: 3,
  withinTimeRange: 60000
});
```

### Mailbox Configuration

```typescript
// Metrics/Logs (lossy OK)
const mailbox = new BoundedMailbox(1000, RejectionPolicy.DROP_OLDEST);

// Critical operations (never drop)
const mailbox = new BoundedMailbox(1000, RejectionPolicy.FAIL);

// Flow control (backpressure)
const mailbox = new BoundedMailbox(1000, RejectionPolicy.BACKPRESSURE);
```

### Actor Lifecycle Hooks

```typescript
class MyActor extends Actor {
  async onStart() {
    // Initialize resources (connections, timers)
  }

  async onStop() {
    // Cleanup resources (close connections, cancel timers)
  }

  async receive(message: Message) {
    // Process message
  }
}
```

## Observability Quick Reference

### Trace Context Setup

```typescript
// HTTP Request
app.use((req, res, next) => {
  const traceContext = parseTraceParent(req.headers['traceparent']);
  req.traceContext = traceContext || generateTraceContext();
  next();
});

// Actor Message
class TracedActor extends Actor {
  async receive(message: ActorMessage) {
    const span = tracer.startSpan('actor.receive', {
      parent: message.traceContext,
      attributes: {
        'actor.id': this.id,
        'actor.type': this.constructor.name,
      },
    });

    try {
      await this.handleMessage(message.payload);
      span.setStatus({code: SpanStatusCode.OK});
    } catch (error) {
      span.recordException(error);
      span.setStatus({code: SpanStatusCode.ERROR});
      throw error;
    } finally {
      span.end();
    }
  }
}
```

### Metrics Collection

```typescript
// Counter (monotonic)
const requestCounter = new Counter(
  'http_requests_total',
  'Total HTTP requests',
  {service: 'api'}
);
requestCounter.inc();

// Gauge (up/down)
const activeConnections = new Gauge(
  'http_active_connections',
  'Active HTTP connections'
);
activeConnections.set(100);

// Histogram (distribution)
const requestDuration = new Histogram(
  'http_request_duration_seconds',
  'HTTP request duration',
  [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
);
requestDuration.observe(0.123);
```

### Structured Logging

```typescript
logger.log('info', 'User action', {
  userId: '123',
  action: 'login',
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  traceId: req.traceContext?.traceId,
});
```

## Resilience Quick Reference

### Circuit Breaker

```typescript
// Create circuit breaker
const breaker = new CircuitBreaker({
  failureThreshold: 5,           // Failures before opening
  successThreshold: 2,           // Successes to close
  timeout: 60000,                // 60s in OPEN state
  volumeThreshold: 10,           // Min requests to evaluate
  errorThresholdPercentage: 50,  // 50% error rate triggers
  rollingWindowSize: 10000,      // 10s rolling window
});

// Use circuit breaker
async function callExternalAPI() {
  return await breaker.execute(async () => {
    const response = await fetch('https://api.example.com/data');
    if (!response.ok) throw new Error('Request failed');
    return response.json();
  });
}
```

### Retry Policy

```typescript
// Create retry policy
const retry = new RetryPolicy({
  maxAttempts: 3,
  initialDelay: 100,
  maxDelay: 30000,
  multiplier: 2,
  jitterFactor: 0.1,
  retryableErrors: [isNetworkError, isServerError],
});

// Use retry policy
const data = await retry.execute(() =>
  fetch('https://api.example.com/data')
);
```

### Bulkhead

```typescript
// Semaphore-based bulkhead
const apiCallBulkhead = new Bulkhead(100, 200); // 100 concurrent, 200 queue

await apiCallBulkhead.execute(async () => {
  return await fetch('https://api.example.com/data');
});

// Actor-based bulkhead
const workerPool = new ActorBulkhead(10, WorkerActor);

await workerPool.execute(new ProcessJobMessage(jobData));
```

### Timeout

```typescript
// Simple timeout
const timeoutPolicy = new TimeoutPolicy();
const result = await timeoutPolicy.execute(
  () => fetch('https://api.example.com/data'),
  5000 // 5 second timeout
);

// Hierarchical timeouts
const hierarchical = new HierarchicalTimeout();
const result = await hierarchical.executeWithTimeouts(
  () => fetch('https://api.example.com/data'),
  {
    connection: 5000,   // 5s connection timeout
    request: 30000,     // 30s request timeout
    total: 60000,       // 60s total timeout
  }
);
```

## Performance Quick Reference

### Compression

```typescript
// Decision matrix
function shouldCompress(contentType: string, contentLength: number): boolean {
  // Don't compress if already compressed
  const precompressed = ['image/', 'video/', 'audio/', 'application/zip'];
  if (precompressed.some(t => contentType.startsWith(t))) return false;

  // Don't compress if too small (< 1KB)
  if (contentLength < 1024) return false;

  // Compress text formats
  const compressible = ['text/', 'application/json', 'application/javascript'];
  return compressible.some(t => contentType.startsWith(t));
}

// Adaptive level selection
function selectCompressionLevel(size: number, encoding: string): number {
  if (encoding === 'br') {
    if (size < 10 * 1024) return 4;     // < 10KB: fast
    if (size < 100 * 1024) return 6;    // < 100KB: balanced
    if (size < 1024 * 1024) return 8;   // < 1MB: good
    return 11;                          // > 1MB: best
  }

  if (encoding === 'gzip') {
    if (size < 10 * 1024) return 3;     // < 10KB: fast
    if (size < 100 * 1024) return 6;    // < 100KB: balanced
    return 9;                           // > 100KB: best
  }

  return 6; // Default
}
```

### Caching

```typescript
// Static assets (hashed filenames)
const staticCache = buildCacheControl({
  public: true,
  maxAge: 31536000,  // 1 year
  immutable: true,
});
// Output: "public, max-age=31536000, immutable"

// API responses (short-lived)
const apiCache = buildCacheControl({
  private: true,
  maxAge: 300,       // 5 minutes
  staleWhileRevalidate: 60,
});
// Output: "private, max-age=300, stale-while-revalidate=60"

// HTML pages (always validate)
const htmlCache = buildCacheControl({
  public: true,
  maxAge: 0,
  mustRevalidate: true,
});
// Output: "public, max-age=0, must-revalidate"

// Sensitive data (no cache)
const sensitiveCache = buildCacheControl({
  private: true,
  noStore: true,
  maxAge: 0,
});
// Output: "private, no-store, max-age=0"
```

### ETags

```typescript
// Strong ETag (content-based)
const etag = generateStrongETag(fileContent);
res.setHeader('ETag', etag);

// Weak ETag (metadata-based)
const etag = generateWeakETag(lastModified, fileSize);
res.setHeader('ETag', etag);

// Conditional request handling
if (handleConditionalRequest(req, res, etag, lastModified)) {
  return; // 304 Not Modified sent
}

// Send full response
res.setHeader('ETag', etag);
res.setHeader('Last-Modified', lastModified.toUTCString());
res.send(content);
```

## Zero-Dependency Quick Reference

### Implement vs Use Library

```typescript
// IMPLEMENT: Simple, stable, core utilities
✓ UUID v4 generation           (10 lines)
✓ Event emitter                (50 lines)
✓ Email validator              (5 lines)
✓ URL parser                   (100 lines)
✓ JSON parser                  (300 lines)
✓ Deep clone (simple)          (30 lines)

// USE LIBRARY: Complex, security-critical, evolving
✗ JWT signing/verification     (use jsonwebtoken)
✗ HTTP/2 server                (use Node.js http2)
✗ Compression                  (use Node.js zlib)
✗ JSON Schema validation       (use ajv)
✗ Markdown parsing             (use marked)
✗ OAuth2 flows                 (use passport)
```

### Common Polyfills

```typescript
// Promise.allSettled
if (!Promise.allSettled) {
  Promise.allSettled = function<T>(promises: Promise<T>[]) {
    return Promise.all(
      promises.map(p =>
        p.then(v => ({status: 'fulfilled', value: v}))
         .catch(r => ({status: 'rejected', reason: r}))
      )
    );
  };
}

// Array.prototype.at
if (!Array.prototype.at) {
  Array.prototype.at = function<T>(this: T[], index: number) {
    const len = this.length;
    const relativeIndex = index >= 0 ? index : len + index;
    if (relativeIndex < 0 || relativeIndex >= len) return undefined;
    return this[relativeIndex];
  };
}

// Object.fromEntries
if (!Object.fromEntries) {
  Object.fromEntries = function<T>(entries: Iterable<[string, T]>) {
    const obj: Record<string, T> = {};
    for (const [key, value] of entries) {
      obj[key] = value;
    }
    return obj;
  };
}
```

### Utility Functions

```typescript
// UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Debounce
function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Throttle
function throttle<T extends (...args: any[]) => void>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastRun = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastRun >= limit) {
      fn(...args);
      lastRun = now;
    }
  };
}

// Deep clone (simple, no circular refs)
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (obj instanceof Object) {
    const cloned: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  return obj;
}
```

## Configuration Templates

### Actor System

```typescript
const actorSystemConfig = {
  // Supervision
  supervision: {
    strategy: 'one-for-one',
    maxRetries: 3,
    withinTimeRange: 60000,
  },

  // Mailbox
  mailbox: {
    type: 'bounded',
    capacity: 1000,
    rejectionPolicy: 'drop_oldest',
  },

  // Message ordering
  ordering: 'fifo-per-sender',

  // Metrics
  metrics: {
    enabled: true,
    mailboxDepthThreshold: 500,
    processingTimeThreshold: 1000,
  },
};
```

### Observability

```typescript
const observabilityConfig = {
  // Tracing
  tracing: {
    enabled: true,
    sampler: 'adaptive',
    baseSamplingRate: 0.01,      // 1%
    errorSamplingRate: 1.0,       // 100%
    slowRequestThreshold: 1000,   // 1s
  },

  // Metrics
  metrics: {
    enabled: true,
    endpoint: '/metrics',
    format: 'prometheus',
    exportInterval: 10000,        // 10s
  },

  // Logging
  logging: {
    level: 'info',
    format: 'json',
    includeTraceContext: true,
  },
};
```

### Resilience

```typescript
const resilienceConfig = {
  // Circuit breaker
  circuitBreaker: {
    enabled: true,
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 60000,
    volumeThreshold: 10,
    errorThresholdPercentage: 50,
  },

  // Retry
  retry: {
    enabled: true,
    maxAttempts: 3,
    initialDelay: 100,
    maxDelay: 30000,
    multiplier: 2,
    jitterFactor: 0.1,
  },

  // Timeout
  timeout: {
    connection: 5000,
    request: 30000,
    total: 60000,
  },

  // Rate limiting
  rateLimit: {
    enabled: true,
    capacity: 100,
    refillRate: 10,  // per second
  },
};
```

### Performance

```typescript
const performanceConfig = {
  // Compression
  compression: {
    enabled: true,
    encoding: 'br',              // brotli
    level: 4,                     // dynamic compression
    threshold: 1024,              // 1KB minimum
    precompress: true,            // static assets
  },

  // Caching
  caching: {
    enabled: true,
    staticMaxAge: 31536000,       // 1 year
    apiMaxAge: 300,               // 5 minutes
    etagEnabled: true,
    etagType: 'strong',
  },

  // HTTP/2
  http2: {
    enabled: true,
    pushEnabled: false,           // server push
  },
};
```

## Troubleshooting Guide

### High Mailbox Depth

**Symptoms:**
- Mailbox depth > 500 messages
- Increasing latency
- Memory usage growing

**Solutions:**
1. Increase actor pool size
2. Implement backpressure (reject new messages)
3. Optimize message processing
4. Use bounded mailbox with DROP_OLDEST

### Circuit Breaker Stuck Open

**Symptoms:**
- Circuit breaker remains OPEN
- No traffic reaching downstream service

**Solutions:**
1. Check error threshold (too low?)
2. Verify timeout duration (too short?)
3. Ensure downstream service recovered
4. Monitor success threshold (too high?)

### High Compression Latency

**Symptoms:**
- Compression taking > 100ms
- High CPU usage
- Request timeouts

**Solutions:**
1. Lower compression level (Brotli 11 → 4, Gzip 9 → 6)
2. Increase threshold (compress only > 10KB)
3. Pre-compress static assets
4. Stream large responses

### Missing Trace Data

**Symptoms:**
- Incomplete traces
- Missing spans
- No correlation between services

**Solutions:**
1. Verify traceparent header propagation
2. Check sampling rate (too low?)
3. Ensure all actors propagate trace context
4. Monitor span creation/ending

### Memory Leak in Actors

**Symptoms:**
- Memory usage continuously increasing
- No garbage collection
- Eventually OOM

**Solutions:**
1. Check for circular references
2. Implement onStop() cleanup
3. Use weak references for caches
4. Monitor actor lifecycle (creation/destruction)

## Performance Benchmarks

### Actor System

```
Message throughput:    100,000 msg/sec (single node)
Message latency:       < 1ms P99
Mailbox depth:         < 100 messages P99
Actor creation:        < 1ms
Actor destruction:     < 1ms
Memory per actor:      ~1KB
```

### Observability

```
Trace overhead:        < 1% latency increase
Metric collection:     10-50ns per operation
Log serialization:     100-500ns per log
Export interval:       10-60 seconds
Memory overhead:       < 10MB
```

### Resilience

```
Circuit breaker:       10-50ns overhead
Retry backoff:         100μs timer creation
Timeout check:         10-50ns
Rate limiting:         50-200ns token bucket
```

### Performance

```
Brotli-4 (100KB):     8ms compression
Gzip-6 (100KB):       5ms compression
ETag generation:      1-5ms (MD5 hash)
Cache lookup:         10-100ns (in-memory)
Compression ratio:    75-85% reduction
```

## Best Practices Checklist

### Actor System
- [ ] Use bounded mailboxes to prevent memory exhaustion
- [ ] Implement supervision for all production actors
- [ ] Configure rejection policy based on message criticality
- [ ] Monitor mailbox depth and processing time
- [ ] Use actor pools for CPU-intensive work

### Observability
- [ ] Propagate trace context in all actor messages
- [ ] Use adaptive sampling (1% baseline + errors/slow)
- [ ] Export metrics in Prometheus format
- [ ] Use structured JSON logging
- [ ] Correlate logs with trace IDs

### Resilience
- [ ] Wrap external API calls in circuit breakers
- [ ] Use exponential backoff + jitter for retries
- [ ] Set hierarchical timeouts (connection < request < total)
- [ ] Implement rate limiting for public APIs
- [ ] Test resilience patterns under load

### Performance
- [ ] Compress responses > 1KB
- [ ] Use Brotli-4 for dynamic, Brotli-11 for static
- [ ] Set appropriate Cache-Control headers
- [ ] Generate ETags for cacheable content
- [ ] Pre-compress static assets at build time

### Zero-Dependency
- [ ] Implement simple utilities (UUID, validators)
- [ ] Use Node.js built-ins (crypto, zlib, Buffer)
- [ ] Document trade-offs and limitations
- [ ] Test thoroughly (TDD approach)
- [ ] Benchmark against library alternatives
