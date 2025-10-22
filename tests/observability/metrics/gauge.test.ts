import { test } from 'node:test';
import assert from 'node:assert';
import type { MetricType } from '../../../src/observability/types.js';
import { Gauge } from '../../../src/observability/metrics/gauge.js';

// Set operation tests
test('Gauge: set value overwrites previous', () => {
  const gauge = new Gauge('memory_usage_bytes', 'Memory usage');
  gauge.set(1024);
  assert.strictEqual(gauge.getValue(), 1024);
  gauge.set(2048);
  assert.strictEqual(gauge.getValue(), 2048);
});

test('Gauge: set can change to any number including negative', () => {
  const gauge = new Gauge('temperature', 'Temperature in Celsius');
  gauge.set(-10);
  assert.strictEqual(gauge.getValue(), -10);
  gauge.set(0);
  assert.strictEqual(gauge.getValue(), 0);
  gauge.set(50);
  assert.strictEqual(gauge.getValue(), 50);
});

test('Gauge: set to zero is valid', () => {
  const gauge = new Gauge('gauge', 'Help');
  gauge.set(0);
  assert.strictEqual(gauge.getValue(), 0);
});

// Increment tests
test('Gauge: increment by default value 1', () => {
  const gauge = new Gauge('queue_size', 'Queue size');
  gauge.set(10);
  gauge.inc();
  assert.strictEqual(gauge.getValue(), 11);
});

test('Gauge: increment by custom value', () => {
  const gauge = new Gauge('queue_size', 'Queue size');
  gauge.set(10);
  gauge.inc(5);
  assert.strictEqual(gauge.getValue(), 15);
});

test('Gauge: increment from zero', () => {
  const gauge = new Gauge('counter', 'Help');
  gauge.inc(5);
  assert.strictEqual(gauge.getValue(), 5);
});

test('Gauge: increment multiple times accumulates', () => {
  const gauge = new Gauge('counter', 'Help');
  gauge.inc(2);
  gauge.inc(3);
  gauge.inc(1);
  assert.strictEqual(gauge.getValue(), 6);
});

test('Gauge: increment by negative value decreases', () => {
  const gauge = new Gauge('gauge', 'Help');
  gauge.set(10);
  gauge.inc(-5);
  assert.strictEqual(gauge.getValue(), 5);
});

// Decrement tests
test('Gauge: decrement by default value 1', () => {
  const gauge = new Gauge('queue_size', 'Queue size');
  gauge.set(20);
  gauge.dec();
  assert.strictEqual(gauge.getValue(), 19);
});

test('Gauge: decrement by custom value', () => {
  const gauge = new Gauge('queue_size', 'Queue size');
  gauge.set(20);
  gauge.dec(5);
  assert.strictEqual(gauge.getValue(), 15);
});

test('Gauge: decrement can go negative', () => {
  const gauge = new Gauge('balance', 'Account balance');
  gauge.set(10);
  gauge.dec(20);
  assert.strictEqual(gauge.getValue(), -10);
});

test('Gauge: decrement multiple times accumulates', () => {
  const gauge = new Gauge('gauge', 'Help');
  gauge.set(100);
  gauge.dec(10);
  gauge.dec(20);
  gauge.dec(5);
  assert.strictEqual(gauge.getValue(), 65);
});

// Prometheus format tests
test('Gauge: toPrometheusFormat without labels', () => {
  const gauge = new Gauge('memory_usage_bytes', 'Memory usage in bytes');
  gauge.set(1024);
  const output = gauge.toPrometheusFormat();

  assert.ok(output.includes('# HELP memory_usage_bytes Memory usage in bytes'));
  assert.ok(output.includes('# TYPE memory_usage_bytes gauge'));
  assert.ok(output.includes('memory_usage_bytes 1024'));
});

test('Gauge: toPrometheusFormat with labels', () => {
  const gauge = new Gauge('memory_usage_bytes', 'Memory usage', {
    instance: 'server-1',
    type: 'heap',
  });
  gauge.set(1048576);
  const output = gauge.toPrometheusFormat();

  assert.ok(output.includes('# HELP memory_usage_bytes Memory usage'));
  assert.ok(output.includes('# TYPE memory_usage_bytes gauge'));
  assert.ok(output.includes('memory_usage_bytes{instance="server-1",type="heap"} 1048576'));
});

test('Gauge: toPrometheusFormat with negative value', () => {
  const gauge = new Gauge('temperature', 'Temperature');
  gauge.set(-15.5);
  const output = gauge.toPrometheusFormat();

  assert.ok(output.includes('temperature -15.5'));
});

// Properties and metadata tests
test('Gauge: name property is readable', () => {
  const gauge = new Gauge('my_gauge', 'Help text');
  assert.strictEqual(gauge.name, 'my_gauge');
});

test('Gauge: help property is readable', () => {
  const gauge = new Gauge('metric', 'My help text');
  assert.strictEqual(gauge.help, 'My help text');
});

test('Gauge: type property returns gauge', () => {
  const gauge = new Gauge('metric', 'Help');
  assert.strictEqual(gauge.type, 'gauge' as MetricType);
});

test('Gauge: labels property is readable', () => {
  const gauge = new Gauge('metric', 'Help', { env: 'prod' });
  assert.deepStrictEqual(gauge.labels, { env: 'prod' });
});

test('Gauge: empty labels by default', () => {
  const gauge = new Gauge('metric', 'Help');
  assert.deepStrictEqual(gauge.labels, {});
});

// Edge cases
test('Gauge: handles large numbers', () => {
  const gauge = new Gauge('large', 'Help');
  gauge.set(Number.MAX_SAFE_INTEGER);
  assert.strictEqual(gauge.getValue(), Number.MAX_SAFE_INTEGER);
});

test('Gauge: handles decimal values', () => {
  const gauge = new Gauge('decimal', 'Help');
  gauge.set(3.14159);
  assert.strictEqual(gauge.getValue(), 3.14159);
});

test('Gauge: handles very small numbers', () => {
  const gauge = new Gauge('small', 'Help');
  gauge.set(0.0001);
  assert.ok(Math.abs(gauge.getValue() - 0.0001) < 0.00001);
});

// Multiple instances are independent
test('Gauge: multiple instances maintain separate values', () => {
  const gauge1 = new Gauge('gauge1', 'First gauge');
  const gauge2 = new Gauge('gauge2', 'Second gauge');

  gauge1.set(100);
  gauge2.set(200);
  gauge1.inc(10);
  gauge2.dec(50);

  assert.strictEqual(gauge1.getValue(), 110);
  assert.strictEqual(gauge2.getValue(), 150);
});

test('Gauge: Prometheus output is idempotent', () => {
  const gauge = new Gauge('metric', 'Help', { a: '1' });
  gauge.set(42);

  const output1 = gauge.toPrometheusFormat();
  const output2 = gauge.toPrometheusFormat();

  assert.strictEqual(output1, output2);
});
