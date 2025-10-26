/**
 * Comprehensive test suite for middleware functions
 * Tests JSON body parser, size limits, error handling, and edge cases
 */

import test from 'node:test';
import assert from 'node:assert';
import * as http from 'node:http';
import { Readable } from 'node:stream';

import { jsonBodyParser } from '../../src/core/middleware.js';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create a mock IncomingMessage with specified method and body data
 */
function createMockRequest(
  method: string = 'POST',
  bodyData?: string
): http.IncomingMessage {
  const req = new Readable() as http.IncomingMessage;
  req.method = method;
  req.headers = {};

  if (bodyData) {
    req.push(bodyData);
  }
  req.push(null);

  return req;
}

/**
 * Create a mock ServerResponse
 */
function createMockResponse(): http.ServerResponse {
  const res = new http.ServerResponse({ method: 'GET' } as any);
  return res;
}

// ============================================
// JSON BODY PARSER TESTS
// ============================================

test('JSON body parser middleware', async (t) => {
  await t.test('should parse valid JSON for POST requests', (done) => {
    const parser = jsonBodyParser();
    const req = createMockRequest('POST', '{"name":"test"}');
    const res = createMockResponse();

    let nextCalled = false;
    const next = () => {
      nextCalled = true;
      assert(nextCalled);
      assert.deepStrictEqual(req.body, { name: 'test' });
      done();
    };

    parser(req, res, next);
  });

  await t.test('should parse valid JSON for PUT requests', (done) => {
    const parser = jsonBodyParser();
    const req = createMockRequest('PUT', '{"updated":true}');
    const res = createMockResponse();

    const next = () => {
      assert.deepStrictEqual(req.body, { updated: true });
      done();
    };

    parser(req, res, next);
  });

  await t.test('should parse valid JSON for PATCH requests', (done) => {
    const parser = jsonBodyParser();
    const req = createMockRequest('PATCH', '{"partial":"update"}');
    const res = createMockResponse();

    const next = () => {
      assert.deepStrictEqual(req.body, { partial: 'update' });
      done();
    };

    parser(req, res, next);
  });

  await t.test('should skip parsing for GET requests', (done) => {
    const parser = jsonBodyParser();
    const req = createMockRequest('GET', '{"ignored":"data"}');
    const res = createMockResponse();

    const next = () => {
      assert.strictEqual(req.body, undefined);
      done();
    };

    parser(req, res, next);
  });

  await t.test('should skip parsing for DELETE requests without body', (done) => {
    const parser = jsonBodyParser();
    const req = createMockRequest('DELETE');
    const res = createMockResponse();

    const next = () => {
      assert.strictEqual(req.body, undefined);
      done();
    };

    parser(req, res, next);
  });

  await t.test('should handle empty JSON object', (done) => {
    const parser = jsonBodyParser();
    const req = createMockRequest('POST', '{}');
    const res = createMockResponse();

    const next = () => {
      assert.deepStrictEqual(req.body, {});
      done();
    };

    parser(req, res, next);
  });

  await t.test('should handle empty JSON array', (done) => {
    const parser = jsonBodyParser();
    const req = createMockRequest('POST', '[]');
    const res = createMockResponse();

    const next = () => {
      assert.deepStrictEqual(req.body, []);
      done();
    };

    parser(req, res, next);
  });

  await t.test('should handle nested JSON structures', (done) => {
    const parser = jsonBodyParser();
    const data = {
      user: {
        name: 'John',
        address: {
          street: '123 Main St',
          city: 'NYC',
        },
      },
    };
    const req = createMockRequest('POST', JSON.stringify(data));
    const res = createMockResponse();

    const next = () => {
      assert.deepStrictEqual(req.body, data);
      done();
    };

    parser(req, res, next);
  });

  await t.test('should handle JSON arrays of objects', (done) => {
    const parser = jsonBodyParser();
    const data = [{ id: 1, name: 'item1' }, { id: 2, name: 'item2' }];
    const req = createMockRequest('POST', JSON.stringify(data));
    const res = createMockResponse();

    const next = () => {
      assert.deepStrictEqual(req.body, data);
      done();
    };

    parser(req, res, next);
  });

  await t.test('should handle JSON null value', (done) => {
    const parser = jsonBodyParser();
    const req = createMockRequest('POST', 'null');
    const res = createMockResponse();

    const next = () => {
      assert.strictEqual(req.body, null);
      done();
    };

    parser(req, res, next);
  });

  await t.test('should handle JSON boolean values', (done) => {
    const parser = jsonBodyParser();
    const req = createMockRequest('POST', 'true');
    const res = createMockResponse();

    const next = () => {
      assert.strictEqual(req.body, true);
      done();
    };

    parser(req, res, next);
  });

  await t.test('should handle JSON number values', (done) => {
    const parser = jsonBodyParser();
    const req = createMockRequest('POST', '42');
    const res = createMockResponse();

    const next = () => {
      assert.strictEqual(req.body, 42);
      done();
    };

    parser(req, res, next);
  });

  await t.test('should handle JSON string values', (done) => {
    const parser = jsonBodyParser();
    const req = createMockRequest('POST', '"hello"');
    const res = createMockResponse();

    const next = () => {
      assert.strictEqual(req.body, 'hello');
      done();
    };

    parser(req, res, next);
  });
});

// ============================================
// ERROR HANDLING TESTS
// ============================================

test('JSON body parser error handling', async (t) => {
  await t.test('should reject invalid JSON with 400 status', (done) => {
    const parser = jsonBodyParser();
    const req = createMockRequest('POST', '{invalid json}');
    const res = createMockResponse();

    let headersWritten = false;
    let statusCode = 0;

    res.writeHead = function (code: number) {
      headersWritten = true;
      statusCode = code;
      return this;
    };

    res.end = function () {
      assert.strictEqual(statusCode, 400);
      assert(headersWritten);
      done();
      return this;
    };

    parser(req, res, () => {
      throw new Error('next should not be called on parse error');
    });
  });

  await t.test('should reject malformed JSON', (done) => {
    const parser = jsonBodyParser();
    const req = createMockRequest('POST', '{"key": undefined}');
    const res = createMockResponse();

    let statusCode = 0;
    res.writeHead = function (code: number) {
      statusCode = code;
      return this;
    };

    res.end = function () {
      assert.strictEqual(statusCode, 400);
      done();
      return this;
    };

    parser(req, res, () => {});
  });

  await t.test('should reject incomplete JSON', (done) => {
    const parser = jsonBodyParser();
    const req = createMockRequest('POST', '{"incomplete":');
    const res = createMockResponse();

    let statusCode = 0;
    res.writeHead = function (code: number) {
      statusCode = code;
      return this;
    };

    res.end = function () {
      assert.strictEqual(statusCode, 400);
      done();
      return this;
    };

    parser(req, res, () => {});
  });

  await t.test('should handle request stream errors', (done) => {
    const parser = jsonBodyParser();
    const req = createMockRequest('POST');
    const res = createMockResponse();

    let statusCode = 0;
    res.writeHead = function (code: number) {
      statusCode = code;
      return this;
    };

    res.end = function () {
      assert.strictEqual(statusCode, 500);
      done();
      return this;
    };

    parser(req, res, () => {});

    // Simulate stream error
    req.emit('error', new Error('Stream error'));
  });
});

// ============================================
// SIZE LIMIT TESTS
// ============================================

test('JSON body parser size limits', async (t) => {
  await t.test('should enforce default 1MB limit', (done) => {
    const parser = jsonBodyParser();
    const largeData = '{"data":"' + 'x'.repeat(1024 * 1024 + 1) + '"}';
    const req = createMockRequest('POST', largeData);
    const res = createMockResponse();

    let statusCode = 0;
    res.writeHead = function (code: number) {
      statusCode = code;
      return this;
    };

    res.end = function () {
      assert.strictEqual(statusCode, 413);
      done();
      return this;
    };

    parser(req, res, () => {});
  });

  await t.test('should respect custom numeric size limit', (done) => {
    const parser = jsonBodyParser({ limit: 100 });
    const largeData = '{"data":"' + 'x'.repeat(150) + '"}';
    const req = createMockRequest('POST', largeData);
    const res = createMockResponse();

    let statusCode = 0;
    res.writeHead = function (code: number) {
      statusCode = code;
      return this;
    };

    res.end = function () {
      assert.strictEqual(statusCode, 413);
      done();
      return this;
    };

    parser(req, res, () => {});
  });

  await t.test('should accept data under size limit', (done) => {
    const parser = jsonBodyParser({ limit: 1000 });
    const data = '{"small":"data"}';
    const req = createMockRequest('POST', data);
    const res = createMockResponse();

    const next = () => {
      assert.deepStrictEqual(req.body, { small: 'data' });
      done();
    };

    parser(req, res, next);
  });

  await t.test('should destroy request on size limit exceeded', (done) => {
    const parser = jsonBodyParser({ limit: 10 });
    const largeData = '{"oversized":"' + 'x'.repeat(100) + '"}';
    const req = createMockRequest('POST', largeData);
    const res = createMockResponse();

    let destroyed = false;
    req.destroy = function () {
      destroyed = true;
      return this;
    };

    res.writeHead = function () {
      return this;
    };

    res.end = function () {
      assert(destroyed);
      done();
      return this;
    };

    parser(req, res, () => {});
  });
});

// ============================================
// CONTENT-TYPE TESTS
// ============================================

test('JSON body parser content-type handling', async (t) => {
  await t.test('should set correct content-type on errors', (done) => {
    const parser = jsonBodyParser();
    const req = createMockRequest('POST', '{bad}');
    const res = createMockResponse();

    let contentType = '';
    res.writeHead = function (code: number, headers?: any) {
      if (headers && headers['Content-Type']) {
        contentType = headers['Content-Type'];
      }
      return this;
    };

    res.end = function () {
      assert.strictEqual(contentType, 'text/plain');
      done();
      return this;
    };

    parser(req, res, () => {});
  });

  await t.test('should handle various content-type formats', (done) => {
    const parser = jsonBodyParser();
    const req = createMockRequest('POST', '{"test":true}');
    req.headers['content-type'] = 'application/json; charset=utf-8';
    const res = createMockResponse();

    const next = () => {
      assert.deepStrictEqual(req.body, { test: true });
      done();
    };

    parser(req, res, next);
  });
});

// ============================================
// INTEGRATION TESTS
// ============================================

test('JSON body parser integration scenarios', async (t) => {
  await t.test('should handle multiple consecutive requests', (done) => {
    const parser = jsonBodyParser();
    let completed = 0;

    const testRequest = (data: string) => {
      return new Promise<void>((resolve) => {
        const req = createMockRequest('POST', data);
        const res = createMockResponse();

        const next = () => {
          completed++;
          resolve();
        };

        parser(req, res, next);
      });
    };

    Promise.all([
      testRequest('{"a":1}'),
      testRequest('{"b":2}'),
      testRequest('{"c":3}'),
    ]).then(() => {
      assert.strictEqual(completed, 3);
      done();
    });
  });

  await t.test('should preserve request body for subsequent middleware', (done) => {
    const parser = jsonBodyParser();
    const req = createMockRequest('POST', '{"user":"alice"}');
    const res = createMockResponse();

    const next = () => {
      // Verify body is accessible to next middleware
      assert.ok(req.body);
      assert.strictEqual(req.body.user, 'alice');
      done();
    };

    parser(req, res, next);
  });
});
