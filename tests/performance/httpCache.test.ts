import { test } from 'node:test';
import assert from 'node:assert';
import { setCacheControl, setEtag, setLastModified, conditionalGet } from '../../src/performance/httpCache.js';
import { IncomingMessage } from 'node:http';

// Mock Request and Response objects for middleware testing
class MockRequest extends IncomingMessage {
  public headers: Record<string, string> = {};
  constructor() {
    super({} as any);
  }
}

class MockResponse {
  public headers: Record<string, string> = {};
  public statusCode: number = 200;
  public _endCalled: boolean = false;
  public _data: any[] = [];

  setHeader(name: string, value: string | number | readonly string[]): this {
    this.headers[name] = value.toString();
    return this;
  }

  getHeader(name: string): string | undefined {
    return this.headers[name];
  }

  status(code: number): this {
    this.statusCode = code;
    console.log('MockResponse.status called with:', code); // Debug log
    return this;
  }

  send(data: any): this {
    this._data.push(data);
    this._endCalled = true;
    return this;
  }

  end(chunk?: any, ...args: any[]): this {
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

test('setCacheControl should set Cache-Control header', () => {
  const res = new MockResponse();
  setCacheControl(res as any, 3600, true);
  assert.strictEqual(res.getHeader('Cache-Control'), 'public, max-age=3600', 'Cache-Control header should be set correctly');
});

test('setEtag should set ETag header', () => {
  const res = new MockResponse();
  const data = 'test data';
  setEtag(res as any, data);
  assert.ok(res.getHeader('ETag')?.startsWith('W/"'), 'ETag header should be set and start with W/"');
});

test('setLastModified should set Last-Modified header', () => {
  const res = new MockResponse();
  const date = new Date();
  setLastModified(res as any, date);
  assert.strictEqual(res.getHeader('Last-Modified'), date.toUTCString(), 'Last-Modified header should be set correctly');
});

test('conditionalGet should return 304 if ETag matches', (_t, done) => {
  const req = new MockRequest();
  const res = new MockResponse();
  const data = 'some data';
  const etag = 'W/"mock-etag"';

  req.headers['if-none-match'] = etag;

  const middleware = conditionalGet(data, undefined, etag);
  middleware(req as any, res as any, () => {
    assert.fail('Next should not be called if 304 is sent');
  });

  setTimeout(() => {
    assert.strictEqual(res.statusCode, 304, 'Status code should be 304');
    assert.strictEqual(res._endCalled, true, 'Response should be ended');
    done();
  }, 10);
});

test('conditionalGet should return 304 if Last-Modified matches', async () => {
  const req = new MockRequest();
  const res = new MockResponse();
  const data = 'some data';
  const lastModified = new Date();

  req.headers['if-modified-since'] = lastModified.toUTCString();

  const middleware = conditionalGet(data, lastModified, undefined);

  let nextCalled = false;
  await new Promise<void>((resolve) => {
    middleware(req as any, res as any, () => {
      nextCalled = true;
      resolve();
    });
    setTimeout(resolve, 100);
  });

  assert.strictEqual(res.statusCode, 304, 'Status code should be 304');
  assert.strictEqual(res._endCalled, true, 'Response should be ended');
  assert.strictEqual(nextCalled, false, 'Next should not be called if 304 is sent');
});

test('conditionalGet should call next if no match', (_t, done) => {
  const req = new MockRequest();
  const res = new MockResponse();
  const data = 'some data';
  const etag = 'W/"mock-etag"';
  const lastModified = new Date();

  req.headers['if-none-match'] = 'W/"different-etag"';
  req.headers['if-modified-since'] = new Date(0).toUTCString(); // Very old date

  const middleware = conditionalGet(data, lastModified, etag);
  middleware(req as any, res as any, () => {
    assert.strictEqual(res.statusCode, 200, 'Status code should be 200');
    assert.strictEqual(res._endCalled, false, 'Response should not be ended');
    done();
  });
});
