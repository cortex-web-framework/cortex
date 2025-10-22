import { test } from 'node:test';
import assert from 'node:assert';
import { Gauge } from '../../../src/observability/metrics/gauge.js';

test('Gauge should set value correctly', () => {
  const gauge = new Gauge('memory_usage_bytes', 'Memory usage in bytes');
  
  gauge.set(1024);
  assert.strictEqual(gauge.getValue(), 1024);
  
  gauge.set(2048);
  assert.strictEqual(gauge.getValue(), 2048);
});

test('Gauge should increment correctly', () => {
  const gauge = new Gauge('queue_size', 'Queue size');
  
  gauge.set(10);
  gauge.inc(5);
  assert.strictEqual(gauge.getValue(), 15);
  
  gauge.inc();
  assert.strictEqual(gauge.getValue(), 16);
});

test('Gauge should decrement correctly', () => {
  const gauge = new Gauge('queue_size', 'Queue size');
  
  gauge.set(20);
  gauge.dec(5);
  assert.strictEqual(gauge.getValue(), 15);
  
  gauge.dec();
  assert.strictEqual(gauge.getValue(), 14);
});

test('Gauge should format Prometheus output correctly', () => {
  const gauge = new Gauge('memory_usage_bytes', 'Memory usage', {
    instance: 'server-1',
    type: 'heap',
  });
  
  gauge.set(1024 * 1024);
  
  const output = gauge.toPrometheusFormat();
  assert.ok(output.includes('# HELP memory_usage_bytes Memory usage'));
  assert.ok(output.includes('# TYPE memory_usage_bytes gauge'));
  assert.ok(output.includes('memory_usage_bytes{instance="server-1",type="heap"} 1048576'));
});
