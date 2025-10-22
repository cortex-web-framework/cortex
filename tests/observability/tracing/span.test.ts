import { test } from 'node:test';
import assert from 'node:assert';
import { SpanImpl } from '../../../src/observability/tracing/span.js';
import { SpanKind, SpanStatusCode } from '../../../src/observability/types.js';

test('Span should be created with correct properties', () => {
  const span = new SpanImpl({
    traceId: 'trace123',
    spanId: 'span456',
    name: 'test-operation',
    kind: SpanKind.INTERNAL,
    startTime: Date.now(),
  });

  assert.strictEqual(span.traceId, 'trace123');
  assert.strictEqual(span.spanId, 'span456');
  assert.strictEqual(span.name, 'test-operation');
  assert.strictEqual(span.kind, SpanKind.INTERNAL);
  assert.strictEqual(span.status.code, SpanStatusCode.UNSET);
  assert.strictEqual(span.isEnded(), false);
});

test('Span should set attributes correctly', () => {
  const span = new SpanImpl({
    traceId: 'trace123',
    spanId: 'span456',
    name: 'test-operation',
    kind: SpanKind.INTERNAL,
    startTime: Date.now(),
  });

  span.setAttribute('http.method', 'GET');
  span.setAttribute('http.url', '/api/users');

  assert.strictEqual(span.attributes['http.method'], 'GET');
  assert.strictEqual(span.attributes['http.url'], '/api/users');
});

test('Span should add events correctly', () => {
  const span = new SpanImpl({
    traceId: 'trace123',
    spanId: 'span456',
    name: 'test-operation',
    kind: SpanKind.INTERNAL,
    startTime: Date.now(),
  });

  span.addEvent('user.login', { 'user.id': '123' });
  span.addEvent('database.query');

  assert.strictEqual(span.events.length, 2);
  assert.strictEqual(span.events[0].name, 'user.login');
  assert.strictEqual(span.events[0].attributes?.['user.id'], '123');
  assert.strictEqual(span.events[1].name, 'database.query');
});

test('Span should set status correctly', () => {
  const span = new SpanImpl({
    traceId: 'trace123',
    spanId: 'span456',
    name: 'test-operation',
    kind: SpanKind.INTERNAL,
    startTime: Date.now(),
  });

  span.setStatus({ code: SpanStatusCode.OK, message: 'Success' });

  assert.strictEqual(span.status.code, SpanStatusCode.OK);
  assert.strictEqual(span.status.message, 'Success');
});

test('Span should record exceptions correctly', () => {
  const span = new SpanImpl({
    traceId: 'trace123',
    spanId: 'span456',
    name: 'test-operation',
    kind: SpanKind.INTERNAL,
    startTime: Date.now(),
  });

  const error = new Error('Test error');
  error.stack = 'Error: Test error\n    at test.js:1:1';
  span.recordException(error);

  assert.strictEqual(span.events.length, 1);
  assert.strictEqual(span.events[0].name, 'exception');
  assert.strictEqual(span.events[0].attributes?.['exception.type'], 'Error');
  assert.strictEqual(span.events[0].attributes?.['exception.message'], 'Test error');
});

test('Span should end correctly', () => {
  const startTime = Date.now();
  const span = new SpanImpl({
    traceId: 'trace123',
    spanId: 'span456',
    name: 'test-operation',
    kind: SpanKind.INTERNAL,
    startTime,
  });

  assert.strictEqual(span.isEnded(), false);

  const endTime = startTime + 100;
  span.end(endTime);

  assert.strictEqual(span.isEnded(), true);
  assert.strictEqual(span.endTime, endTime);
  assert.strictEqual(span.getDuration(), 100);
});
