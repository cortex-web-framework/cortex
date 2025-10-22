import { test } from 'node:test';
import assert from 'node:assert';
import { Tracer } from '../../../src/observability/tracing/tracer.js';
import { SpanKind } from '../../../src/observability/types.js';
import { AlwaysOnSampler, AlwaysOffSampler } from '../../../src/observability/tracing/sampler.js';

test('Tracer should create spans correctly', () => {
  const tracer = new Tracer({ serviceName: 'test-service' });
  const span = tracer.startSpan('test-operation', { kind: SpanKind.INTERNAL });

  assert.strictEqual(span.name, 'test-operation');
  assert.strictEqual(span.kind, SpanKind.INTERNAL);
  assert.strictEqual(span.attributes['service.name'], 'test-service');
  assert.ok(span.traceId);
  assert.ok(span.spanId);
});

test('Tracer should track active spans', () => {
  const tracer = new Tracer({ serviceName: 'test-service' });
  const span = tracer.startSpan('test-operation');

  assert.strictEqual(tracer.getActiveSpans().length, 1);
  assert.strictEqual(tracer.getSpan(span.spanId), span);
});

test('Tracer should end spans correctly', () => {
  const tracer = new Tracer({ serviceName: 'test-service' });
  const span = tracer.startSpan('test-operation');

  tracer.endSpan(span.spanId);

  assert.strictEqual(span.endTime !== undefined, true);
  assert.strictEqual(tracer.getActiveSpans().length, 0);
});

test('Tracer should create child spans with parent context', () => {
  const tracer = new Tracer({ serviceName: 'test-service' });
  const parentSpan = tracer.startSpan('parent-operation');
  
  const childSpan = tracer.startSpan('child-operation', {
    parent: {
      traceId: parentSpan.traceId,
      spanId: parentSpan.spanId,
      traceFlags: 1,
    },
  });

  assert.strictEqual(childSpan.traceId, parentSpan.traceId);
  assert.strictEqual(childSpan.parentSpanId, parentSpan.spanId);
});

test('Tracer should use custom sampler', () => {
  const tracer = new Tracer({ 
    serviceName: 'test-service',
    sampler: new AlwaysOnSampler(),
  });

  const span = tracer.startSpan('test-operation');
  assert.strictEqual(tracer.getActiveSpans().length, 1);
});

test('Tracer should not track spans when sampler drops them', () => {
  const tracer = new Tracer({ 
    serviceName: 'test-service',
    sampler: new AlwaysOffSampler(),
  });

  tracer.startSpan('test-operation');
  assert.strictEqual(tracer.getActiveSpans().length, 0);
});

test('Tracer should export completed spans', () => {
  const tracer = new Tracer({ serviceName: 'test-service' });
  const span = tracer.startSpan('test-operation');
  
  span.end();
  const exported = tracer.exportSpans();
  
  assert.strictEqual(exported.length, 1);
  assert.strictEqual(exported[0], span);
});

test('Tracer should handle span attributes', () => {
  const tracer = new Tracer({ serviceName: 'test-service' });
  const span = tracer.startSpan('test-operation', {
    attributes: { 'custom.attr': 'value' },
  });

  assert.strictEqual(span.attributes['custom.attr'], 'value');
  assert.strictEqual(span.attributes['service.name'], 'test-service');
});
