import { test } from 'node:test';
import assert from 'node:assert';
import type { MetricType } from '../../../src/observability/types';
import { Counter } from '../../../src/observability/metrics/counter';

// Basic increment tests
test('Counter: increment by default value 1', () => {
  const counter = new Counter('test_counter', 'Test counter');
  counter.inc();
  assert.strictEqual(counter.getValue(), 1);
});

test('Counter: increment by custom value', () => {
  const counter = new Counter('test_counter', 'Test counter');
  counter.inc(5);
  assert.strictEqual(counter.getValue(), 5);
});

test('Counter: increment multiple times accumulates', () => {
  const counter = new Counter('test_counter', 'Test counter');
  counter.inc(2);
  counter.inc(3);
  counter.inc(1);
  assert.strictEqual(counter.getValue(), 6);
});

// Error handling tests
test('Counter: reject negative increment', () => {
  const counter = new Counter('test_counter', 'Test counter');
  assert.throws(
    () => counter.inc(-1),
    /non-negative/i,
  );
});

test('Counter: accept zero increment', () => {
  const counter = new Counter('test_counter', 'Test counter');
  counter.inc(0);
  assert.strictEqual(counter.getValue(), 0);
});

// Prometheus format tests
test('Counter: toPrometheusFormat without labels', () => {
  const counter = new Counter('http_requests_total', 'Total HTTP requests');
  counter.inc(42);
  const output = counter.toPrometheusFormat();

  assert.ok(output.includes('# HELP http_requests_total Total HTTP requests'));
  assert.ok(output.includes('# TYPE http_requests_total counter'));
  assert.ok(output.includes('http_requests_total 42'));
});

test('Counter: toPrometheusFormat with labels', () => {
  const counter = new Counter('http_requests_total', 'Total HTTP requests', {
    method: 'GET',
    path: '/api/users',
  });
  counter.inc(42);
  const output = counter.toPrometheusFormat();

  assert.ok(output.includes('# HELP http_requests_total Total HTTP requests'));
  assert.ok(output.includes('# TYPE http_requests_total counter'));
  assert.ok(output.includes('http_requests_total{method="GET",path="/api/users"} 42'));
});

test('Counter: labels format correctly in Prometheus output', () => {
  const counter = new Counter('metric', 'Help', {
    environment: 'production',
    region: 'us-east-1',
  });
  counter.inc(100);
  const output = counter.toPrometheusFormat();

  // Should have both labels
  assert.ok(output.includes('environment="production"'));
  assert.ok(output.includes('region="us-east-1"'));
});

// Properties and metadata tests
test('Counter: name property is readable', () => {
  const counter = new Counter('my_counter', 'Help text');
  assert.strictEqual(counter.name, 'my_counter');
});

test('Counter: help property is readable', () => {
  const counter = new Counter('metric', 'My help text');
  assert.strictEqual(counter.help, 'My help text');
});

test('Counter: type property returns counter', () => {
  const counter = new Counter('metric', 'Help');
  assert.strictEqual(counter.type, 'counter' as MetricType);
});

test('Counter: labels property is readable', () => {
  const counter = new Counter('metric', 'Help', { env: 'prod' });
  assert.deepStrictEqual(counter.labels, { env: 'prod' });
});

test('Counter: empty labels by default', () => {
  const counter = new Counter('metric', 'Help');
  assert.deepStrictEqual(counter.labels, {});
});

// Edge cases
test('Counter: handles large numbers', () => {
  const counter = new Counter('large_counter', 'Test large numbers');
  counter.inc(Number.MAX_SAFE_INTEGER - 1);
  assert.strictEqual(counter.getValue(), Number.MAX_SAFE_INTEGER - 1);
});

test('Counter: handles decimal increments', () => {
  const counter = new Counter('decimal_counter', 'Test decimal');
  counter.inc(1.5);
  counter.inc(2.3);
  assert.ok(Math.abs(counter.getValue() - 3.8) < 0.0001);
});

test('Counter: handles fractional values', () => {
  const counter = new Counter('fractional', 'Test fractional');
  counter.inc(0.1);
  counter.inc(0.2);
  assert.ok(Math.abs(counter.getValue() - 0.3) < 0.0001);
});

// Multiple instances are independent
test('Counter: multiple instances maintain separate values', () => {
  const counter1 = new Counter('counter1', 'First counter');
  const counter2 = new Counter('counter2', 'Second counter');

  counter1.inc(5);
  counter2.inc(10);

  assert.strictEqual(counter1.getValue(), 5);
  assert.strictEqual(counter2.getValue(), 10);
});

test('Counter: Prometheus output is idempotent', () => {
  const counter = new Counter('metric', 'Help', { a: '1' });
  counter.inc(5);

  const output1 = counter.toPrometheusFormat();
  const output2 = counter.toPrometheusFormat();

  assert.strictEqual(output1, output2);
});
