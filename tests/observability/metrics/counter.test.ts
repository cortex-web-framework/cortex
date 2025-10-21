import { test } from 'node:test';
import assert from 'node:assert';
import { Counter } from '../../../src/observability/metrics/counter';

test('Counter should increment correctly', () => {
  const counter = new Counter('test_counter', 'Test counter');

  counter.inc();
  assert.strictEqual(counter.getValue(), 1);

  counter.inc(5);
  assert.strictEqual(counter.getValue(), 6);
});

test('Counter should reject negative increments', () => {
  const counter = new Counter('test_counter', 'Test counter');

  assert.throws(() => {
    counter.inc(-1);
  }, /non-negative/);
});

test('Counter should format Prometheus output correctly', () => {
  const counter = new Counter('http_requests_total', 'Total requests', {
    method: 'GET',
    path: '/api/users',
  });

  counter.inc(42);

  const output = counter.toPrometheusFormat();
  assert.ok(output.includes('# HELP http_requests_total Total requests'));
  assert.ok(output.includes('# TYPE http_requests_total counter'));
  assert.ok(output.includes('http_requests_total{method="GET",path="/api/users"} 42'));
});
