import { test } from 'node:test';
import assert from 'node:assert';
import { CSPBuilder } from '../../src/security/csp.js';
import { IncomingMessage, ServerResponse } from 'node:http';

// Mock Request and Response objects for middleware testing
class MockRequest extends IncomingMessage {
  constructor() {
    super({} as any);
  }
}

class MockResponse extends ServerResponse {
  public headers: Record<string, string> = {};
  public override statusCode: number = 200;
  public _endCalled: boolean = false;
  public _data: any[] = [];

  constructor() {
    super({} as any);
  }

  override setHeader(name: string, value: string | number | readonly string[]): this {
    this.headers[name] = value.toString();
    return this;
  }

  override getHeader(name: string): string | undefined {
    return this.headers[name];
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

test('CSPBuilder should build a default CSP header', () => {
  const csp = new CSPBuilder().build();
  assert.strictEqual(csp, "default-src 'self'", 'Default CSP should be correct');
});

test('CSPBuilder should add custom policies', () => {
  const csp = new CSPBuilder()
    .addPolicy("script-src 'self' cdn.example.com")
    .addPolicy("img-src 'self' data:")
    .build();
  assert.strictEqual(csp, "default-src 'self'; script-src 'self' cdn.example.com; img-src 'self' data:", 'Custom policies should be added');
});

test('CSPBuilder.middleware should set the CSP header', (_t, done) => {
  const builder = new CSPBuilder().addPolicy("script-src 'self'");
  const middleware = CSPBuilder.middleware(builder);

  const req = new MockRequest();
  const res = new MockResponse();

  middleware(req as any, res as any, () => {
    assert.strictEqual(res.getHeader('Content-Security-Policy'), "default-src 'self'; script-src 'self'", 'CSP header should be set');
    done();
  });
});
