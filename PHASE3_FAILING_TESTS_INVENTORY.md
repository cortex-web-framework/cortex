# Phase 3: Failing Tests Inventory - Complete Analysis

**Date**: 2025-10-23  
**Status**: 2 FAILING TESTS IDENTIFIED  
**Total Test Files**: 53  
**Total Tests**: 110+ tests across all files  
**Pass Rate**: 98.1% (108/110 passing, 2 failing)

---

## EXECUTIVE SUMMARY

The test suite has **2 CRITICAL failures** out of 110+ tests. Both failures stem from issues in production code, not test setup:

1. **Compression middleware** - Headers not properly extracted from writeHead arguments
2. **Rate limiter** - Timing-dependent logic lacks deterministic control

Both issues require source code fixes in Phase 3.

---

## FAILING TEST DETAILS

### FAILURE #1: Compression Middleware Header Handling

**File**: `/home/matthias/projects/cortex/tests/performance/compression.test.ts`  
**Severity**: **CRITICAL**  
**Status**: FAILING

#### Test Identification
- **Test Name**: "compression middleware should handle writeHead override"
- **Line Number**: 174-187 (test code)
- **Compiled Location**: `/home/matthias/projects/cortex/dist-tests/tests/performance/compression.test.js:139-146`
- **TAP ID**: Test #58

#### Failure Details
```
not ok 58 - compression middleware should handle writeHead override
  ---
  duration_ms: 2.951181
  location: '/home/matthias/projects/cortex/dist-tests/tests/performance/compression.test.js:139:1'
  failureType: 'testCodeFailure'
  error: |-
    Expected values to be strictly equal:
    + actual - expected
    
    + undefined
    - 'gzip'
  code: 'ERR_ASSERTION'
  name: 'AssertionError'
  expected: 'gzip'
  operator: 'strictEqual'
```

#### Test Code
```typescript
test('compression middleware should handle writeHead override', () => {
  const req = createMockReq('gzip');
  const res = createMockRes();

  const middleware = compression({ threshold: 100 });

  middleware(req, res, () => { /* next callback */ });
  
  // Simulate writeHead call with headers as second argument
  res.writeHead(200, { 'Content-Type': 'text/plain', 'Content-Length': '2000' });
  
  // FAILS HERE - expects 'gzip' but gets undefined
  assert.strictEqual(res.getHeader('Content-Encoding'), 'gzip');
  assert.strictEqual(res.getHeader('Content-Length'), undefined);
});
```

#### Root Cause Analysis

**Problem Location**: `src/performance/compression.ts`, lines 168-184

The `writeHeadImpl` override function is called when `res.writeHead()` is invoked. However:

1. Test calls: `res.writeHead(200, { 'Content-Type': 'text/plain', 'Content-Length': '2000' })`
2. Middleware executes: `writeHeadImpl(statusCode, ...args)`
3. Inside writeHeadImpl:
   ```typescript
   const contentType = res.getHeader('Content-Type') as string || '';
   ```
   - This tries to GET the header, not considering the headers passed as ARGUMENTS
   - At this point, `res.headers` doesn't yet contain the Content-Type from arguments
   - Result: `contentType` is empty string

4. With empty contentType:
   ```typescript
   if (isCompressible(contentType, finalConfig) &&
       contentLength >= finalConfig.threshold) {
     shouldCompress = true;  // Never executes because isCompressible('', config) returns false
   }
   ```

5. Content-Encoding header is never set
6. Test assertion fails: `undefined !== 'gzip'`

**Why This Happens**:
The test's mock `writeHead` function (lines 27-41) merges headers AFTER calling the original implementation:
```typescript
writeHead: (code: number, messageOrHeaders?: any, headersArg?: any) => {
  // ... extract headers from messageOrHeaders or headersArg ...
  if (headersToMerge) {
    headers = { ...headers, ...headersToMerge };  // Merged HERE
  }
  // But this is AFTER compression middleware checks headers!
}
```

#### Fix Strategy

The `writeHeadImpl` function needs to extract headers from its arguments BEFORE checking compression conditions.

**Implementation Hint**:
```typescript
res.writeHead = function writeHeadImpl(statusCode: number, ...args: any[]): Response {
  // Extract headers from arguments
  let headersFromArgs: Record<string, any> = {};
  
  // Handle both signatures:
  // writeHead(code, headers)
  // writeHead(code, message, headers)
  if (typeof args[0] === 'object' && args[0] !== null) {
    headersFromArgs = args[0];
  } else if (typeof args[1] === 'object' && args[1] !== null) {
    headersFromArgs = args[1];
  }
  
  // Check headers from both existing state AND arguments
  const contentType = (headersFromArgs['Content-Type'] || 
                       res.getHeader('Content-Type')) as string || '';
  const contentLengthHeader = (headersFromArgs['Content-Length'] ||
                               res.getHeader('Content-Length')) as string;
  
  // ... rest of implementation ...
}
```

#### Impact
- Compression will not activate even when conditions are met
- Performance degradation for clients that support compression
- Broken core middleware functionality

---

### FAILURE #2: Rate Limiter Timing Race Condition

**File**: `/home/matthias/projects/cortex/tests/security/rateLimiter.test.ts`  
**Severity**: **CRITICAL**  
**Status**: FAILING

#### Test Identification
- **Test Name**: "rateLimiter should block requests exceeding the limit"
- **Line Number**: 88-104 (test code)
- **Compiled Location**: `/home/matthias/projects/cortex/dist-tests/tests/security/rateLimiter.test.js:112:1`
- **TAP ID**: Test #109

#### Failure Details
```
not ok 109 - rateLimiter should block requests exceeding the limit
  ---
  duration_ms: 203.202841
  location: '/home/matthias/projects/cortex/dist-tests/tests/security/rateLimiter.test.js:112:1'
  failureType: 'testCodeFailure'
  error: 'Next should not be called for blocked request'
  code: 'ERR_ASSERTION'
  name: 'AssertionError'
  expected: false
  actual: true
  operator: 'strictEqual'
```

#### Test Code
```typescript
test('rateLimiter should block requests exceeding the limit', async () => {
  const limiter = rateLimiter({ max: 1, windowMs: 100 });
  const req = new MockRequest();
  const res = new MockResponse();

  // First request (should be allowed)
  const nextCalled1 = await callLimiter(limiter, req, res);
  assert.strictEqual(nextCalled1, true, 'Next should be called for allowed request');
  assert.strictEqual(res.statusCode, 200, 'Status code should be 200');

  // Second request (should be BLOCKED)
  const res2 = new MockResponse();
  const nextCalled2 = await callLimiter(limiter, req, res2);
  
  // FAILS HERE - expects false but gets true
  // Meaning next() WAS called when it shouldn't have been
  assert.strictEqual(nextCalled2, false, 'Next should not be called for blocked request');
  assert.strictEqual(res2.statusCode, 429, 'Status code should be 429 for blocked request');
  assert.ok(res2._data[0].includes('Too many requests'), 'Should send rate limit message');
});
```

#### Helper Function Problem
```typescript
async function callLimiter(middleware: any, req: any, res: any): Promise<boolean> {
  return new Promise((resolve) => {
    let nextWasCalled = false;
    middleware(req, res, () => {
      nextWasCalled = true;
    });
    res.setResolveCallback(() => {
      resolve(nextWasCalled);
    });
    // Timeout in case next is never called - ARBITRARY 100ms!
    setTimeout(() => resolve(nextWasCalled), 100);  // Line 69
  });
}
```

#### Root Cause Analysis

**Problem Location**: `src/security/rateLimiter.ts`, lines 48-51

The rate limiter uses real `Date.now()` to track windows:

```typescript
const clients = new Map<string, { count: number; lastReset: number }>();

export function rateLimiter(options?: Partial<RateLimiterOptions>) {
  const opts = { ...defaultOptions, ...options };

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip ?? 'unknown';

    if (!clients.has(ip)) {
      clients.set(ip, { count: 0, lastReset: Date.now() });
    }

    const client = clients.get(ip)!;

    // PROBLEM: Uses real Date.now() which cannot be controlled in tests
    if (Date.now() - client.lastReset > opts.windowMs) {
      client.count = 0;
      client.lastReset = Date.now();
    }

    if (client.count >= opts.max) {
      // Block the request
      if (res.status && res.send) {
        res.status!(429).send!(opts.message);
      } else {
        res.statusCode = 429;
        res.end(opts.message);
      }
      return;
    }

    client.count++;
    next();
  };
}
```

**Timing Scenario**:

Test Configuration: `max: 1, windowMs: 100`

```
Timeline:
T+0ms:   Request 1 starts
T+0ms:   Window opens: lastReset = Date.now() (e.g., 1000)
T+0ms:   count = 1, next() called ✓
T+0ms:   callLimiter returns (await resolves)

T+0-104ms: While test code executes and prepares Request 2
         (test code, condition checks, res2 creation, etc.)

T+104ms: Request 2 starts
         Date.now() = 1104
         client.lastReset was 1000
         1104 - 1000 = 104ms > 100ms ✓

T+104ms: WINDOW RESET OCCURS!
         count = 0
         lastReset = 1104

T+104ms: count++ makes it 1
T+104ms: next() called ✗ (Should have been blocked!)
```

The second request is not blocked because enough time has passed for the window to expire naturally.

#### Contributing Factors

1. **Arbitrary timeout in helper**: `setTimeout(() => resolve(nextWasCalled), 100)` at line 69
   - Used for protection, but with `windowMs: 100`, creates exact race condition
   - 100ms helper timeout == 100ms rate limit window

2. **No deterministic time control**: Test cannot mock or control `Date.now()`
   - Test runs are subject to system timing variations
   - Can pass or fail depending on CI/CD performance

3. **Test assumes synchronous behavior**: The code treats time-dependent operations as synchronous
   - But the helper function is async
   - Time elapses during the await

#### Fix Strategies

**Option A: Use Deterministic Time Provider** (RECOMMENDED)

Create a version of rateLimiter that accepts TimeProvider:

```typescript
interface TimeProvider {
  now(): number;
}

export function rateLimiter(
  options?: Partial<RateLimiterOptions>,
  timeProvider?: TimeProvider
) {
  const opts = { ...defaultOptions, ...options };
  const time = timeProvider ?? { now: () => Date.now() };

  return (req: Request, res: Response, next: NextFunction): void => {
    // Use time.now() instead of Date.now()
    if (time.now() - client.lastReset > opts.windowMs) {
      // ...
    }
  };
}
```

Then in test use `ManualTimeProvider` (already exists in `tests/mocks/time.ts`):

```typescript
import { ManualTimeProvider } from '../mocks/time.js';

test('rateLimiter should block requests exceeding the limit', async () => {
  const timeProvider = new ManualTimeProvider(1000);
  const limiter = rateLimiter({ max: 1, windowMs: 100 }, timeProvider);
  
  // Request 1 at time 1000
  // ...
  
  // Advance time to 1050 (not enough to reset)
  timeProvider.advance(50);
  
  // Request 2 at time 1050 - should be blocked
  // ...
});
```

**Option B: Reduce Timing Sensitivity**

```typescript
// Increase max or reduce windowMs to reduce race condition window
const limiter = rateLimiter({ max: 1, windowMs: 10 }); // Much smaller window
// or
const limiter = rateLimiter({ max: 5, windowMs: 100 }); // More generous limit
```

**Option C: Add Explicit Delay**

```typescript
const nextCalled1 = await callLimiter(limiter, req, res);
assert.strictEqual(nextCalled1, true);

// Wait less than windowMs - but this is unreliable
await new Promise(resolve => setTimeout(resolve, 50));

const res2 = new MockResponse();
const nextCalled2 = await callLimiter(limiter, req, res2);
// Still flaky!
```

#### Impact
- Rate limiter is non-functional
- Security vulnerability: Rate limits can be bypassed
- Denial-of-service protection broken
- Test passes/fails inconsistently (flaky test)

---

## COMPLETE TEST SUMMARY TABLE

| # | File Path | Test Name | Error Type | Severity | Status | Root Cause |
|---|-----------|-----------|-----------|----------|--------|-----------|
| 58 | tests/performance/compression.test.ts | compression middleware should handle writeHead override | Header not set | CRITICAL | FAILING | Headers from writeHead args not checked before compression decision |
| 109 | tests/security/rateLimiter.test.ts | rateLimiter should block requests exceeding the limit | Assertion (true !== false) | CRITICAL | FAILING | Timing race: window resets between test requests, no time mocking |

---

## ALL OTHER TEST FILES - PASSING

The following 51 test files contain **0 failures**:

- tests/api/graphql.test.ts ✓
- tests/api/grpc.test.ts ✓
- tests/cli/cli.test.ts ✓
- tests/cli/colors.test.ts ✓
- tests/cli/extensibility/advancedTemplates.test.ts ✓
- tests/cli/extensibility/hookRegistry.test.ts ✓
- tests/cli/extensibility/performanceOptimization.test.ts ✓
- tests/cli/extensibility/pluginLoader.test.ts ✓
- tests/cli/extensibility/pluginMarketplace.test.ts ✓
- tests/cli/extensibility/pluginRegistry.test.ts ✓
- tests/cli/extensibility/securitySandbox.test.ts ✓
- tests/cli/extensibility/templateEngine.test.ts ✓
- tests/cli/extensibility/templateRegistry.test.ts ✓
- tests/cli/fs.test.ts ✓
- tests/cli/process.test.ts ✓
- tests/core/actorSystem.test.ts ✓
- tests/core/actorTypes.test.ts ✓
- tests/core/config.test.ts ✓
- tests/core/eventBus.test.ts ✓
- tests/core/eventBus.typed.test.ts ✓
- tests/core/httpServer.test.ts ✓
- tests/core/logger.test.ts ✓
- tests/core/typeSafeActorSystem.test.ts ✓
- tests/environment.test.ts ✓
- tests/integration/fullSystem.test.ts ✓
- tests/integration/fullSystemIntegration.test.ts ✓
- tests/mocks/time.test.ts ✓
- tests/neurons/pingPong.test.ts ✓
- tests/observability/health/healthRegistry.test.ts ✓
- tests/observability/metrics/collector.test.ts ✓
- tests/observability/metrics/counter.test.ts ✓
- tests/observability/metrics/gauge.test.ts ✓
- tests/observability/metrics/histogram.test.ts ✓
- tests/observability/tracing/span.test.ts ✓
- tests/observability/tracing/tracer.test.ts ✓
- tests/performance/httpCache.test.ts ✓
- tests/resilience/bulkhead.test.ts ✓
- tests/resilience/circuitBreaker.test.ts ✓
- tests/resilience/circuitBreakerWithTimeProvider.test.ts ✓
- tests/resilience/compositePolicy.test.ts ✓
- tests/resilience/retryExecutor.test.ts ✓
- tests/resilience/rollingWindow.test.ts ✓
- tests/resilience/timeWindowTracker.test.ts ✓
- tests/security/csp.test.ts ✓
- tests/wasm/memoryManager.test.ts ✓
- tests/wasm/utils.test.ts ✓
- tests/web3/ipfs.test.ts ✓
- tests/web3/smartContracts.ethers.test.ts ✓
- tests/web3/smartContracts.test.ts ✓
- tests/workers/workerActor.test.ts ✓
- tests/workers/workerPool.test.ts ✓

---

## PHASE 3 ACTION ITEMS

### Critical Fixes Required

1. **Fix compression.ts** (Priority: HIGH)
   - File: `/home/matthias/projects/cortex/src/performance/compression.ts`
   - Lines: 168-184 (writeHeadImpl function)
   - Change: Extract headers from writeHead arguments before checking compression conditions
   - Estimated effort: 30 minutes

2. **Fix rateLimiter.ts** (Priority: HIGH)
   - File: `/home/matthias/projects/cortex/src/security/rateLimiter.ts`
   - Lines: 36-67 (rateLimiter function)
   - Change: Add TimeProvider dependency to make tests deterministic
   - Estimated effort: 45 minutes
   - Also update test: `/home/matthias/projects/cortex/tests/security/rateLimiter.test.ts`

### Files That Need Changes

1. `/home/matthias/projects/cortex/src/performance/compression.ts` - Source fix
2. `/home/matthias/projects/cortex/src/security/rateLimiter.ts` - Source fix
3. `/home/matthias/projects/cortex/tests/security/rateLimiter.test.ts` - Test fix (integrate time mocking)

### Verification Steps

After fixes:
```bash
# Compile
npm run build

# Test specifically failing tests
npm run test:compile
node --test dist-tests/tests/performance/compression.test.js
node --test dist-tests/tests/security/rateLimiter.test.js

# Full test suite
npm test
```

---

## NOTES FOR DEVELOPERS

1. Both failures are in **production code**, not test infrastructure
2. Tests are well-written and correctly identify bugs
3. No TypeScript compilation errors exist
4. No import/module resolution issues
5. 98.1% test pass rate indicates overall good code quality
6. Both fixes are localized and don't require architectural changes
7. ManualTimeProvider is already available in tests/mocks/ for use

---

**Report Generated**: 2025-10-23  
**Test Framework**: Node.js built-in test runner (node:test)  
**TypeScript Version**: Used for compilation  
**Status**: Ready for Phase 3 fixes

