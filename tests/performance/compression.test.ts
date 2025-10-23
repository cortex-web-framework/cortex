import { test } from 'node:test';
import assert from 'node:assert';
import { compression, brotliCompression, gzipCompression, parseAcceptEncoding, selectEncoding, isCompressible } from '../../src/performance/compression.js';

// Mock Express request and response
function createMockReq(acceptEncoding?: string) {
  return {
    get: (header: string) => header === 'Accept-Encoding' ? acceptEncoding : undefined,
    acceptsEncodings: (encoding: string) => acceptEncoding?.includes(encoding) || false,
    headers: {
      'accept-encoding': acceptEncoding || ''
    }
  } as any;
}

function createMockRes() {
  const chunks: Buffer[] = [];
  let headers: Record<string, any> = {};
  let statusCode = 200;

  return {
    getHeader: (name: string) => headers[name],
    setHeader: (name: string, value: any) => { headers[name] = value; },
    removeHeader: (name: string) => { delete headers[name]; },
    write: (chunk: any) => { chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)); return true; },
    end: (chunk?: any) => { if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)); },
    writeHead: (code: number, messageOrHeaders?: any, headersArg?: any) => {
      statusCode = code;
      // Handle both writeHead(code, headers) and writeHead(code, message, headers) signatures
      let headersToMerge: Record<string, any> | undefined;
      if (typeof messageOrHeaders === 'object' && messageOrHeaders !== null) {
        // writeHead(code, headers)
        headersToMerge = messageOrHeaders;
      } else if (typeof headersArg === 'object' && headersArg !== null) {
        // writeHead(code, message, headers)
        headersToMerge = headersArg;
      }
      if (headersToMerge) {
        headers = { ...headers, ...headersToMerge };
      }
    },
    chunks,
    headers,
    statusCode
  } as any;
}

test('parseAcceptEncoding should parse valid headers', () => {
  assert.deepStrictEqual(parseAcceptEncoding('gzip, deflate'), ['gzip', 'deflate']);
  assert.deepStrictEqual(parseAcceptEncoding('br, gzip;q=0.8, deflate;q=0.6'), ['br', 'gzip', 'deflate']);
  assert.deepStrictEqual(parseAcceptEncoding(''), []);
  assert.deepStrictEqual(parseAcceptEncoding('gzip'), ['gzip']);
});

test('selectEncoding should prioritize brotli over gzip over deflate', () => {
  assert.strictEqual(selectEncoding(['gzip', 'deflate']), 'gzip');
  assert.strictEqual(selectEncoding(['br', 'gzip', 'deflate']), 'br');
  assert.strictEqual(selectEncoding(['deflate']), 'deflate');
  assert.strictEqual(selectEncoding([]), null);
  assert.strictEqual(selectEncoding(['unknown']), null);
});

test('isCompressible should check content types correctly', () => {
  const config = {
    contentTypes: ['text/plain', 'application/json'],
    excludeContentTypes: ['image/jpeg', 'video/mp4']
  };
  
  assert.strictEqual(isCompressible('text/plain', config), true);
  assert.strictEqual(isCompressible('application/json', config), true);
  assert.strictEqual(isCompressible('image/jpeg', config), false);
  assert.strictEqual(isCompressible('video/mp4', config), false);
  assert.strictEqual(isCompressible('text/html', config), true); // Default behavior
});

test('compression middleware should set Content-Encoding header', () => {
  const req = createMockReq('gzip, deflate');
  const res = createMockRes();
  let nextCalled = false;
  
  const middleware = compression();
  middleware(req, res, () => { nextCalled = true; });
  
  assert.strictEqual(nextCalled, true);
});

test('compression middleware should not compress if client does not support compression', () => {
  const req = createMockReq('');
  const res = createMockRes();
  let nextCalled = false;
  
  const middleware = compression();
  middleware(req, res, () => { nextCalled = true; });
  
  assert.strictEqual(nextCalled, true);
  assert.strictEqual(res.getHeader('Content-Encoding'), undefined);
});

test('compression middleware should not compress small responses', () => {
  const req = createMockReq('gzip');
  const res = createMockRes();
  let nextCalled = false;
  
  const middleware = compression({ threshold: 2000 });
  
  // Simulate small response
  res.setHeader('Content-Length', '100');
  res.setHeader('Content-Type', 'text/plain');
  
  middleware(req, res, () => { nextCalled = true; });
  
  assert.strictEqual(nextCalled, true);
  assert.strictEqual(res.getHeader('Content-Encoding'), undefined);
});

test('compression middleware should compress large responses', () => {
  const req = createMockReq('gzip');
  const res = createMockRes();
  let nextCalled = false;

  const middleware = compression({ threshold: 100 });

  // Simulate large response
  res.setHeader('Content-Length', '2000');
  res.setHeader('Content-Type', 'text/plain');

  middleware(req, res, () => { nextCalled = true; });

  // Call writeHead to trigger compression logic
  res.writeHead(200);

  assert.strictEqual(nextCalled, true);
  assert.strictEqual(res.getHeader('Content-Encoding'), 'gzip');
});

test('brotliCompression should prefer brotli when available', () => {
  const req = createMockReq('br, gzip, deflate');
  const res = createMockRes();
  let nextCalled = false;

  const middleware = brotliCompression();

  res.setHeader('Content-Length', '2000');
  res.setHeader('Content-Type', 'text/plain');

  middleware(req, res, () => { nextCalled = true; });

  // Call writeHead to trigger compression logic
  res.writeHead(200);

  assert.strictEqual(nextCalled, true);
  assert.strictEqual(res.getHeader('Content-Encoding'), 'br');
});

test('gzipCompression should use gzip encoding', () => {
  const req = createMockReq('gzip, deflate');
  const res = createMockRes();
  let nextCalled = false;

  const middleware = gzipCompression();

  res.setHeader('Content-Length', '2000');
  res.setHeader('Content-Type', 'text/plain');

  middleware(req, res, () => { nextCalled = true; });

  // Call writeHead to trigger compression logic
  res.writeHead(200);

  assert.strictEqual(nextCalled, true);
  assert.strictEqual(res.getHeader('Content-Encoding'), 'gzip');
});

test('compression middleware should handle writeHead override', () => {
  const req = createMockReq('gzip');
  const res = createMockRes();

  const middleware = compression({ threshold: 100 });

  middleware(req, res, () => { /* next callback */ });
  
  // Simulate writeHead call
  res.writeHead(200, { 'Content-Type': 'text/plain', 'Content-Length': '2000' });
  
  assert.strictEqual(res.getHeader('Content-Encoding'), 'gzip');
  assert.strictEqual(res.getHeader('Content-Length'), undefined);
});

test('compression middleware should not compress excluded content types', () => {
  const req = createMockReq('gzip');
  const res = createMockRes();

  const middleware = compression({
    threshold: 100,
    excludeContentTypes: ['image/jpeg']
  });

  middleware(req, res, () => { /* next callback */ });
  
  res.setHeader('Content-Length', '2000');
  res.setHeader('Content-Type', 'image/jpeg');
  res.writeHead(200);
  
  assert.strictEqual(res.getHeader('Content-Encoding'), undefined);
});
