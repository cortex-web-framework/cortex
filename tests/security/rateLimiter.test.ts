import { test } from 'node:test';
import assert from 'node:assert';
import { rateLimiter, __testing__ } from '../../src/security/rateLimiter.js';
import { IncomingMessage, ServerResponse } from 'node:http';

// Mock Request and Response objects for middleware testing
class MockRequest extends IncomingMessage {
  public ip: string = '127.0.0.1';
  constructor() {
    super({} as any);
  }
}

class MockResponse extends ServerResponse {
  public override statusCode: number = 200;
  public _endCalled: boolean = false;
  public _data: any[] = [];
  private _resolveCallback: (() => void) | null = null;

  constructor() {
    super({} as any);
  }

  status(code: number): this {
    this.statusCode = code;
    return this;
  }

  send(data: any): this {
    this._data.push(data);
    this._endCalled = true;
    if (this._resolveCallback) {
      this._resolveCallback();
    }
    return this;
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
    if (this._resolveCallback) {
      this._resolveCallback();
    }
    return this;
  }

  setResolveCallback(callback: () => void) {
    this._resolveCallback = callback;
  }
}

// Helper function to call the limiter and return whether next was called
async function callLimiter(middleware: any, req: any, res: any): Promise<boolean> {
  return new Promise((resolve) => {
    let nextWasCalled = false;
    middleware(req, res, () => {
      nextWasCalled = true;
    });
    res.setResolveCallback(() => {
      resolve(nextWasCalled);
    });
    // Timeout in case next is never called
    setTimeout(() => resolve(nextWasCalled), 100);
  });
}

test.beforeEach(() => {
  // Clear the clients map for test isolation
  __testing__.clearClients();
});

test('rateLimiter should allow requests within the limit', async () => {
  const limiter = rateLimiter({ max: 2, windowMs: 1000 });
  const req = new MockRequest();
  const res = new MockResponse();

  const nextCalled = await callLimiter(limiter, req, res);
  assert.strictEqual(nextCalled, true, 'Next should be called for allowed request');
  assert.strictEqual(res.statusCode, 200, 'Status code should be 200');
});

test('rateLimiter should block requests exceeding the limit', async () => {
  const limiter = rateLimiter({ max: 1, windowMs: 100 });
  const req = new MockRequest();
  const res = new MockResponse();

  // First request (allowed)
  const nextCalled1 = await callLimiter(limiter, req, res);
  assert.strictEqual(nextCalled1, true, 'Next should be called for allowed request');
  assert.strictEqual(res.statusCode, 200, 'Status code should be 200');

  // Second request (blocked)
  const res2 = new MockResponse();
  const nextCalled2 = await callLimiter(limiter, req, res2);
  assert.strictEqual(nextCalled2, false, 'Next should not be called for blocked request');
  assert.strictEqual(res2.statusCode, 429, 'Status code should be 429 for blocked request');
  assert.ok(res2._data[0].includes('Too many requests'), 'Should send rate limit message');
});

test('rateLimiter should reset count after windowMs', async () => {
  const limiter = rateLimiter({ max: 1, windowMs: 50 });
  const req = new MockRequest();
  const res = new MockResponse();

  // First request (allowed)
  const nextCalled1 = await callLimiter(limiter, req, res);
  assert.strictEqual(nextCalled1, true, 'Next should be called for allowed request');

  // Wait for windowMs to pass
  await new Promise(resolve => setTimeout(resolve, 60));

  // Second request (should be allowed after reset)
  const res2 = new MockResponse();
  const nextCalled2 = await callLimiter(limiter, req, res2);
  assert.strictEqual(nextCalled2, true, 'Next should be called for second allowed request');
  assert.strictEqual(res2.statusCode, 200, 'Status code should be 200 for second allowed request');
});
