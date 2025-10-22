import { test } from 'node:test';
import assert from 'node:assert';
import { RetryExecutor, ErrorMatchers } from '../../src/resilience/retryExecutor.js';

test('RetryExecutor should succeed on first attempt', async () => {
  const retryExecutor = new RetryExecutor({ maxAttempts: 3, baseDelay: 10, maxDelay: 100, backoffMultiplier: 2, jitter: false, retryableErrors: [] });
  
  const result = await retryExecutor.execute(async () => 'success');
  
  assert.strictEqual(result, 'success');
});

test('RetryExecutor should retry on retryable errors', async () => {
  let attemptCount = 0;
  const retryExecutor = new RetryExecutor({ maxAttempts: 3, baseDelay: 10, maxDelay: 100, backoffMultiplier: 2, jitter: false, retryableErrors: ['Error'] });

  const result = await retryExecutor.execute(async () => {
    attemptCount++;
    if (attemptCount < 3) {
      throw new Error('TestError');
    }
    return 'success';
  });

  assert.strictEqual(result, 'success');
  assert.strictEqual(attemptCount, 3);
});

test('RetryExecutor should fail after max attempts', async () => {
  let attemptCount = 0;
  const retryExecutor = new RetryExecutor({ maxAttempts: 2, baseDelay: 10, maxDelay: 100, backoffMultiplier: 2, jitter: false, retryableErrors: ['Error'] });

  await assert.rejects(async () => {
    await retryExecutor.execute(async () => {
      attemptCount++;
      throw new Error('TestError');
    });
  });

  assert.strictEqual(attemptCount, 2);
});

class CustomRetryableError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'RetryableError';
  }
}

class CustomNonRetryableError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'NonRetryableError';
  }
}

test('RetryExecutor should not retry non-retryable errors', async () => {
  const retryExecutor = new RetryExecutor({ maxAttempts: 1, baseDelay: 10, maxDelay: 100, backoffMultiplier: 2, jitter: false, retryableErrors: ['CustomRetryableError'] });

  let attemptCount = 0;
  let caughtError: Error | undefined;

  try {
    await retryExecutor.execute(async () => {
      attemptCount++;
      throw new CustomNonRetryableError('This is a non-retryable error');
    });
  } catch (error) {
    caughtError = error as Error;
  }

  assert.ok(caughtError instanceof CustomNonRetryableError, 'Should throw CustomNonRetryableError');
  assert.strictEqual(attemptCount, 1, 'Should only attempt once for non-retryable error');
});

test('RetryExecutor should calculate exponential backoff delay', async () => {
  const retryExecutor = new RetryExecutor({ maxAttempts: 3, baseDelay: 100, maxDelay: 1000, backoffMultiplier: 2, jitter: false, retryableErrors: ['Error'] });

  let attemptCount = 0;
  const startTime = Date.now();

  await retryExecutor.execute(async () => {
    attemptCount++;
    if (attemptCount < 3) {
      throw new Error('TestError');
    }
    return 'success';
  });

  const duration = Date.now() - startTime;

  // Should have waited approximately 100ms + 200ms = 300ms
  assert.ok(duration >= 290 && duration <= 350);
  assert.strictEqual(attemptCount, 3);
});

test('RetryExecutor should respect max delay', async () => {
  const retryExecutor = new RetryExecutor({ maxAttempts: 3, baseDelay: 100, maxDelay: 1000, backoffMultiplier: 2, jitter: false, retryableErrors: ['Error'] });

  let attemptCount = 0;
  const startTime = Date.now();

  await retryExecutor.execute(async () => {
    attemptCount++;
    if (attemptCount < 3) {
      throw new Error('TestError');
    }
    return 'success';
  });

  const duration = Date.now() - startTime;

  // Should have waited approximately 100ms + 200ms = 300ms (capped at maxDelay)
  assert.ok(duration >= 290 && duration <= 350);
  assert.strictEqual(attemptCount, 3);
});

test('ErrorMatchers should match by name', () => {
  const matcher = ErrorMatchers.byName(['TestError', 'AnotherError']);
  
  assert.strictEqual(matcher(new Error('TestError')), true);
  assert.strictEqual(matcher(new Error('AnotherError')), true);
  assert.strictEqual(matcher(new Error('DifferentError')), false);
});

test('ErrorMatchers should match by message pattern', () => {
  const matcher = ErrorMatchers.byMessage(/timeout|network/i);
  
  assert.strictEqual(matcher(new Error('Request timeout')), true);
  assert.strictEqual(matcher(new Error('Network error')), true);
  assert.strictEqual(matcher(new Error('Database error')), false);
});

test('ErrorMatchers should match network errors', () => {
  const matcher = ErrorMatchers.networkErrors();
  
  assert.strictEqual(matcher(new Error('NetworkError')), true);
  assert.strictEqual(matcher(new Error('TimeoutError')), true);
  assert.strictEqual(matcher(new Error('ECONNRESET')), true);
  assert.strictEqual(matcher(new Error('ENOTFOUND')), true);
  assert.strictEqual(matcher(new Error('Database error')), false);
});

test('ErrorMatchers should match server errors', () => {
  const matcher = ErrorMatchers.serverErrors();
  
  assert.strictEqual(matcher(new Error('HTTP 500 Internal Server Error')), true);
  assert.strictEqual(matcher(new Error('HTTP 502 Bad Gateway')), true);
  assert.strictEqual(matcher(new Error('HTTP 503 Service Unavailable')), true);
  assert.strictEqual(matcher(new Error('HTTP 504 Gateway Timeout')), true);
  assert.strictEqual(matcher(new Error('HTTP 400 Bad Request')), false);
});

test('RetryExecutor should validate configuration', () => {
  assert.throws(() => {
    new RetryExecutor({ maxAttempts: 0, baseDelay: 100, maxDelay: 1000, backoffMultiplier: 2, jitter: false, retryableErrors: [] });
  }, /maxAttempts must be greater than 0/);
  
  assert.throws(() => {
    new RetryExecutor({ maxAttempts: 3, baseDelay: -1, maxDelay: 1000, backoffMultiplier: 2, jitter: false, retryableErrors: [] });
  }, /baseDelay must be non-negative/);
  
  assert.throws(() => {
    new RetryExecutor({ maxAttempts: 3, baseDelay: 100, maxDelay: -1, backoffMultiplier: 2, jitter: false, retryableErrors: [] });
  }, /maxDelay must be non-negative/);
  
  assert.throws(() => {
    new RetryExecutor({ maxAttempts: 3, baseDelay: 100, maxDelay: 1000, backoffMultiplier: 0, jitter: false, retryableErrors: [] });
  }, /backoffMultiplier must be greater than 0/);
  
  assert.throws(() => {
    new RetryExecutor({ maxAttempts: 3, baseDelay: 1000, maxDelay: 100, backoffMultiplier: 2, jitter: false, retryableErrors: [] });
  }, /maxDelay must be greater than or equal to baseDelay/);
});
