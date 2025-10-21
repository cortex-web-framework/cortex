import { test } from 'node:test';
import assert from 'node:assert';
import { rateLimiter } from '../../src/security/rateLimiter';
import { IncomingMessage, ServerResponse } from 'node:http';

// Mock Request and Response objects for middleware testing
class MockRequest extends IncomingMessage {
  public ip: string = '127.0.0.1';
  constructor() {
    super({} as any);
  }
}

class MockResponse extends ServerResponse {
  public statusCode: number = 200;
  public _endCalled: boolean = false;
  public _data: any[] = [];

  constructor() {
    super({} as any);
  }

  status(code: number): this {
    this.statusCode = code;
    return this;
  }

  send(data: any): void {
    this._data.push(data);
    this._endCalled = true;
  }

  override end(chunk?: any, ...args: any[]): this {
    this._endCalled = true;
    if (chunk) {
      this._data.push(chunk);
    }
    const callback = args.find(arg => typeof arg === 'function');
    if (callback) {
      callback();
    }
    return this;
  }
}

test('rateLimiter should allow requests within the limit', async () => {
  const limiter = rateLimiter({ max: 2, windowMs: 1000 });
  const req = new MockRequest();
  const res = new MockResponse();
  let nextCalled = false;

  await new Promise<void>((resolve) => {
    limiter(req as any, res as any, () => {
      nextCalled = true;
      resolve();
    });
  });
  assert.strictEqual(nextCalled, true, 'Next should be called for allowed request');
  assert.strictEqual(res.statusCode, 200, 'Status code should be 200');
});

test('rateLimiter should block requests exceeding the limit', async () => {
  const limiter = rateLimiter({ max: 1, windowMs: 100 });
  const req = new MockRequest();
  const res = new MockResponse();
  let nextCalledCount = 0;

  // First request (allowed)
  await new Promise<void>((resolve) => {
    limiter(req as any, res as any, () => {
      nextCalledCount++;
      resolve();
    });
  });

  // Second request (blocked)
  const res2 = new MockResponse();
  await new Promise<void>((resolve) => {
    limiter(req as any, res2 as any, () => {
      nextCalledCount++;
      resolve();
    });
  });

  assert.strictEqual(nextCalledCount, 1, 'Next should be called only once');
  assert.strictEqual(res2.statusCode, 429, 'Status code should be 429 for blocked request');
  assert.ok(res2._data[0].includes('Too many requests'), 'Should send rate limit message');
});

test('rateLimiter should reset count after windowMs', async () => {
  const limiter = rateLimiter({ max: 1, windowMs: 50 });
  const req = new MockRequest();
  const res = new MockResponse();
  let nextCalledCount = 0;

  // First request (allowed)
  await new Promise<void>((resolve) => {
    limiter(req as any, res as any, () => {
      nextCalledCount++;
      resolve();
    });
  });

  // Wait for windowMs to pass
  await new Promise(resolve => setTimeout(resolve, 60));

  // Second request (should be allowed after reset)
  const res2 = new MockResponse();
  await new Promise<void>((resolve) => {
    limiter(req as any, res2 as any, () => {
      nextCalledCount++;
      resolve();
    });
  });

  assert.strictEqual(nextCalledCount, 2, 'Next should be called twice after reset');
  assert.strictEqual(res2.statusCode, 200, 'Status code should be 200 for second allowed request');
});
