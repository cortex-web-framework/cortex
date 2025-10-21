# Cortex Implementation Quick Start Guide

## Priority 1: Start Here - Observability

### Step 1: Create Basic Metrics (30 minutes)

```bash
# Create directory structure
mkdir -p src/observability/metrics tests/observability/metrics
```

**File 1:** `src/observability/types.ts`
```typescript
export type Labels = Record<string, string>;

export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
}

export interface Metric {
  readonly name: string;
  readonly type: MetricType;
  readonly help: string;
  getValue(): number | any;
  toPrometheusFormat(): string;
}
```

**File 2:** `src/observability/metrics/counter.ts` (Copy from spec, lines 149-215)

**Test 1:** `tests/observability/metrics/counter.test.ts`
```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import { Counter } from '../../../src/observability/metrics/counter';

test('Counter increments correctly', () => {
  const counter = new Counter('test', 'Test counter');
  counter.inc();
  assert.strictEqual(counter.getValue(), 1);
});

test('Counter rejects negative values', () => {
  const counter = new Counter('test', 'Test counter');
  assert.throws(() => counter.inc(-1));
});
```

**Run test:**
```bash
npm test -- tests/observability/metrics/counter.test.ts
```

### Step 2: Add Metrics to ActorSystem (30 minutes)

**File:** `src/core/actorSystem.ts` (Add these imports and modifications)

```typescript
// At top of file
import { Counter } from '../observability/metrics/counter';

export class ActorSystem {
  // Add new properties
  private messageCounter?: Counter;

  constructor(
    private eventBus: EventBus,
    options?: { enableMetrics?: boolean }
  ) {
    if (options?.enableMetrics) {
      this.messageCounter = new Counter(
        'cortex_actor_messages_total',
        'Total actor messages'
      );
    }
  }

  // Modify dispatch method
  public dispatch(actorId: string, message: any): void {
    this.messageCounter?.inc(); // Add this line

    const actor = this.actors.get(actorId);
    if (actor) {
      actor.postMessage(message);
    } else {
      throw new ActorNotFound(actorId);
    }
  }

  // Add getter
  public getMetrics(): { messages: number } {
    return {
      messages: this.messageCounter?.getValue() || 0,
    };
  }
}
```

**Test:**
```typescript
test('ActorSystem tracks metrics', async () => {
  const eventBus = EventBus.getInstance();
  const system = new ActorSystem(eventBus, { enableMetrics: true });
  const actor = system.createActor(TestActor, 'test');

  system.dispatch('test', 'msg1');
  system.dispatch('test', 'msg2');

  await new Promise(resolve => setTimeout(resolve, 50));

  const metrics = system.getMetrics();
  assert.strictEqual(metrics.messages, 2);
});
```

### Step 3: Add Metrics Endpoint (20 minutes)

**File:** `examples/metrics-example.ts`
```typescript
import { ActorSystem } from '../src/core/actorSystem';
import { EventBus } from '../src/core/eventBus';
import { CortexHttpServer } from '../src/core/httpServer';
import { Counter } from '../src/observability/metrics/counter';

const eventBus = EventBus.getInstance();
const system = new ActorSystem(eventBus, { enableMetrics: true });
const server = new CortexHttpServer(3000);

// Create HTTP request counter
const httpCounter = new Counter('http_requests_total', 'Total HTTP requests');

// Metrics middleware
server.use((req, res, next) => {
  httpCounter.inc();
  next();
});

// Metrics endpoint
server.get('/metrics', (req, res) => {
  const actorMetrics = system.getMetrics();

  const output = [
    httpCounter.toPrometheusFormat(),
    '',
    `# HELP cortex_actor_messages_total Total actor messages`,
    `# TYPE cortex_actor_messages_total counter`,
    `cortex_actor_messages_total ${actorMetrics.messages}`,
  ].join('\n');

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(output);
});

server.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World');
});

server.start().then(() => {
  console.log('Server running on http://localhost:3000');
  console.log('Metrics: http://localhost:3000/metrics');
});
```

**Test it:**
```bash
npx ts-node examples/metrics-example.ts
curl http://localhost:3000/metrics
```

---

## Priority 2: Circuit Breaker (Quick Win)

### Step 1: Implement Circuit Breaker (1 hour)

```bash
mkdir -p src/resilience tests/resilience
```

**File 1:** `src/resilience/types.ts`
```typescript
export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open',
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
}
```

**File 2:** `src/resilience/errors.ts`
```typescript
export class CircuitBreakerOpenError extends Error {
  constructor(message: string, public nextAttemptTime?: number) {
    super(message);
    this.name = 'CircuitBreakerOpenError';
  }
}
```

**File 3:** `src/resilience/circuitBreaker.ts`
```typescript
import { CircuitState, CircuitBreakerConfig } from './types';
import { CircuitBreakerOpenError } from './errors';

export class CircuitBreaker {
  private state = CircuitState.CLOSED;
  private failures = 0;
  private successes = 0;
  private nextAttemptTime?: number;

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if open
    if (this.state === CircuitState.OPEN) {
      if (Date.now() >= (this.nextAttemptTime || 0)) {
        this.state = CircuitState.HALF_OPEN;
        this.successes = 0;
      } else {
        throw new CircuitBreakerOpenError('Circuit is open', this.nextAttemptTime);
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

  getState() {
    return this.state;
  }

  reset() {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
  }

  private onSuccess() {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.reset();
      }
    }
  }

  private onFailure() {
    this.failures++;

    if (this.state === CircuitState.HALF_OPEN) {
      this.trip();
      return;
    }

    if (this.failures >= this.config.failureThreshold) {
      this.trip();
    }
  }

  private trip() {
    this.state = CircuitState.OPEN;
    this.nextAttemptTime = Date.now() + this.config.timeout;
  }
}
```

### Step 2: Test Circuit Breaker (30 minutes)

**File:** `tests/resilience/circuitBreaker.test.ts`
```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import { CircuitBreaker } from '../../src/resilience/circuitBreaker';
import { CircuitState } from '../../src/resilience/types';
import { CircuitBreakerOpenError } from '../../src/resilience/errors';

test('Circuit breaker starts closed', () => {
  const breaker = new CircuitBreaker({
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 1000,
  });

  assert.strictEqual(breaker.getState(), CircuitState.CLOSED);
});

test('Circuit breaker opens after failures', async () => {
  const breaker = new CircuitBreaker({
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 1000,
  });

  // Cause 3 failures
  for (let i = 0; i < 3; i++) {
    try {
      await breaker.execute(async () => {
        throw new Error('Test failure');
      });
    } catch (e) {
      // Expected
    }
  }

  assert.strictEqual(breaker.getState(), CircuitState.OPEN);
});

test('Circuit breaker rejects when open', async () => {
  const breaker = new CircuitBreaker({
    failureThreshold: 1,
    successThreshold: 2,
    timeout: 1000,
  });

  // Open circuit
  try {
    await breaker.execute(async () => {
      throw new Error('Failure');
    });
  } catch (e) {}

  // Should reject immediately
  await assert.rejects(
    async () => {
      await breaker.execute(async () => 'success');
    },
    CircuitBreakerOpenError
  );
});

test('Circuit breaker transitions to half-open', async () => {
  const breaker = new CircuitBreaker({
    failureThreshold: 1,
    successThreshold: 2,
    timeout: 100, // Short timeout
  });

  // Open circuit
  try {
    await breaker.execute(async () => {
      throw new Error('Failure');
    });
  } catch (e) {}

  assert.strictEqual(breaker.getState(), CircuitState.OPEN);

  // Wait for timeout
  await new Promise(resolve => setTimeout(resolve, 150));

  // Next call should try half-open
  try {
    await breaker.execute(async () => 'success');
  } catch (e) {}

  assert.ok(
    breaker.getState() === CircuitState.HALF_OPEN ||
    breaker.getState() === CircuitState.CLOSED
  );
});
```

**Run:**
```bash
npm test -- tests/resilience/circuitBreaker.test.ts
```

### Step 3: Use Circuit Breaker (15 minutes)

**Example:**
```typescript
// examples/circuit-breaker-example.ts
import { CircuitBreaker } from '../src/resilience/circuitBreaker';
import { CircuitBreakerOpenError } from '../src/resilience/errors';

const breaker = new CircuitBreaker({
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60000, // 1 minute
});

// Monitor state changes
let currentState = breaker.getState();
setInterval(() => {
  const newState = breaker.getState();
  if (newState !== currentState) {
    console.log(`Circuit breaker: ${currentState} -> ${newState}`);
    currentState = newState;
  }
}, 1000);

async function callExternalAPI() {
  try {
    const result = await breaker.execute(async () => {
      const response = await fetch('https://api.example.com/data');
      if (!response.ok) throw new Error('API error');
      return response.json();
    });
    console.log('Success:', result);
  } catch (error) {
    if (error instanceof CircuitBreakerOpenError) {
      console.log('Circuit open, using cached data');
      return { cached: true };
    }
    console.error('Error:', error);
  }
}

// Test it
(async () => {
  for (let i = 0; i < 10; i++) {
    await callExternalAPI();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
})();
```

---

## Priority 3: Fix Compression (Critical Fix)

### Step 1: Replace Placeholder (45 minutes)

**File:** `src/performance/compression.ts`

```typescript
import { IncomingMessage, ServerResponse } from 'node:http';
import { createBrotliCompress, createGzip, BrotliOptions, ZlibOptions } from 'node:zlib';
import { Transform } from 'node:stream';

interface CompressionConfig {
  threshold: number;
  brotliQuality: number;
  gzipLevel: number;
}

const DEFAULT_CONFIG: CompressionConfig = {
  threshold: 1024,
  brotliQuality: 4,
  gzipLevel: 6,
};

function selectEncoding(acceptHeader: string): string | null {
  const accepted = acceptHeader.split(',').map(e => e.trim().split(';')[0]);
  const priority = ['br', 'gzip', 'deflate'];

  for (const enc of priority) {
    if (accepted.includes(enc)) return enc;
  }
  return null;
}

export function compression(config: Partial<CompressionConfig> = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const encoding = selectEncoding(req.headers['accept-encoding'] || '');

    if (!encoding || encoding === 'identity') {
      return next();
    }

    const originalEnd = res.end.bind(res);
    const chunks: Buffer[] = [];

    // Collect response data
    res.write = function(chunk: any): boolean {
      chunks.push(Buffer.from(chunk));
      return true;
    } as any;

    res.end = function(chunk?: any): any {
      if (chunk) chunks.push(Buffer.from(chunk));

      const data = Buffer.concat(chunks);

      // Check threshold
      if (data.length < cfg.threshold) {
        // Too small, don't compress
        return originalEnd(data);
      }

      // Create compression stream
      let compressor: Transform;
      if (encoding === 'br') {
        compressor = createBrotliCompress({
          params: {
            [require('zlib').constants.BROTLI_PARAM_QUALITY]: cfg.brotliQuality,
          },
        });
      } else {
        compressor = createGzip({ level: cfg.gzipLevel });
      }

      const compressed: Buffer[] = [];
      compressor.on('data', (chunk: Buffer) => compressed.push(chunk));
      compressor.on('end', () => {
        res.setHeader('Content-Encoding', encoding);
        res.setHeader('Content-Length', Buffer.concat(compressed).length);
        originalEnd(Buffer.concat(compressed));
      });

      compressor.end(data);
      return res;
    } as any;

    next();
  };
}
```

### Step 2: Test Compression (30 minutes)

**File:** `tests/performance/compression.test.ts`

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import { compression } from '../../src/performance/compression';
import { createGunzip } from 'node:zlib';

test('Compression compresses gzip response', async () => {
  const chunks: Buffer[] = [];
  let headers: any = {};

  const mockReq = {
    headers: { 'accept-encoding': 'gzip' },
  } as any;

  const mockRes = {
    setHeader: (k: string, v: any) => { headers[k] = v; },
    write: (chunk: any) => { chunks.push(Buffer.from(chunk)); return true; },
    end: (chunk?: any) => {
      if (chunk) chunks.push(Buffer.from(chunk));
    },
  } as any;

  const middleware = compression({ threshold: 0 });

  middleware(mockReq, mockRes, () => {
    mockRes.write('Hello, World!');
    mockRes.end();
  });

  // Wait for async compression
  await new Promise(resolve => setTimeout(resolve, 100));

  // Verify compression header
  assert.strictEqual(headers['Content-Encoding'], 'gzip');

  // Verify data is compressed (decompress and check)
  const compressed = Buffer.concat(chunks);
  const decompressed = await new Promise<string>((resolve, reject) => {
    const gunzip = createGunzip();
    const output: Buffer[] = [];

    gunzip.on('data', chunk => output.push(chunk));
    gunzip.on('end', () => resolve(Buffer.concat(output).toString()));
    gunzip.on('error', reject);

    gunzip.write(compressed);
    gunzip.end();
  });

  assert.strictEqual(decompressed, 'Hello, World!');
});

test('Compression skips small responses', async () => {
  const chunks: Buffer[] = [];
  let headers: any = {};

  const mockReq = {
    headers: { 'accept-encoding': 'gzip' },
  } as any;

  const mockRes = {
    setHeader: (k: string, v: any) => { headers[k] = v; },
    end: (chunk?: any) => {
      if (chunk) chunks.push(Buffer.from(chunk));
    },
  } as any;

  const middleware = compression({ threshold: 100 }); // Threshold 100 bytes

  middleware(mockReq, mockRes, () => {
    mockRes.end('Hi'); // Only 2 bytes
  });

  await new Promise(resolve => setTimeout(resolve, 50));

  // Should not have compression header
  assert.strictEqual(headers['Content-Encoding'], undefined);

  // Data should be uncompressed
  assert.strictEqual(Buffer.concat(chunks).toString(), 'Hi');
});
```

**Run:**
```bash
npm test -- tests/performance/compression.test.ts
```

---

## Development Workflow

### 1. Before Starting Any Task

```bash
# Pull latest changes
git pull origin feature/advanced-web-tech-todo

# Create feature branch
git checkout -b feature/observability-metrics

# Install dependencies
npm install
```

### 2. TDD Cycle (Red-Green-Refactor)

```bash
# 1. Write failing test
# Create test file
touch tests/observability/metrics/counter.test.ts

# Write test that fails
npm test -- tests/observability/metrics/counter.test.ts

# 2. Write minimal code to pass
# Create implementation
touch src/observability/metrics/counter.ts

# 3. Run test until green
npm test -- tests/observability/metrics/counter.test.ts

# 4. Refactor
# Clean up code, improve design

# 5. Run all tests
npm test
```

### 3. Commit Changes

```bash
# Stage changes
git add src/observability/metrics/counter.ts
git add tests/observability/metrics/counter.test.ts

# Commit with meaningful message
git commit -m "feat(observability): Implement Counter metric

- Add Counter class with inc() method
- Add Prometheus format export
- Add comprehensive unit tests
- Follows OpenTelemetry conventions"

# Push to remote
git push origin feature/observability-metrics
```

### 4. Integration Testing

```bash
# Run full test suite
npm test

# Run specific integration tests
npm test -- tests/observability/integration/

# Check TypeScript compilation
npx tsc --noEmit
```

---

## Common Issues & Solutions

### Issue 1: TypeScript Errors
```bash
# Check for type errors
npx tsc --noEmit

# Fix import paths (use absolute paths from project root)
import { Counter } from '../../src/observability/metrics/counter';
```

### Issue 2: Tests Timeout
```typescript
// Increase timeout for async tests
test('Long running test', { timeout: 5000 }, async () => {
  await longOperation();
});
```

### Issue 3: Mock EventBus in Tests
```typescript
// Use singleton pattern correctly
import { EventBus } from '../../src/core/eventBus';

const eventBus = EventBus.getInstance();
// Use same instance in tests
```

---

## Next Steps Checklist

- [ ] Implement Counter metric (30 min)
- [ ] Implement Gauge metric (20 min)
- [ ] Implement Histogram metric (45 min)
- [ ] Create MetricsCollector (30 min)
- [ ] Add metrics to ActorSystem (30 min)
- [ ] Create metrics HTTP endpoint (20 min)
- [ ] Implement Circuit Breaker (1 hour)
- [ ] Implement Retry Executor (45 min)
- [ ] Fix compression middleware (45 min)
- [ ] Write integration tests (2 hours)

**Estimated Total Time:** ~8-10 hours for Priority 1 & 2

---

## Resources

- **Full Spec:** `/home/matthias/projects/cortex/IMPLEMENTATION_SPEC.md`
- **Research:** `/home/matthias/projects/cortex/RESEARCH.md`
- **Examples:** `/home/matthias/projects/cortex/examples/`
- **Tests:** `/home/matthias/projects/cortex/tests/`

## Questions?

If you encounter issues:
1. Check the full specification document
2. Review existing test patterns in `tests/core/`
3. Look at existing implementations in `src/core/`
4. Consult research document for architecture decisions
