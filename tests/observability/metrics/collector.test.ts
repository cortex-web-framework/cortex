import { test } from 'node:test';
import assert from 'node:assert';
import { MetricsCollector } from '../../../src/observability/metrics/collector.js';
import { MetricType } from '../../../src/observability/types.js';

test('MetricsCollector should create counter metric', () => {
  const collector = new MetricsCollector();
  const counter = collector.createCounter('http_requests_total', 'Total HTTP requests');
  
  assert.strictEqual(counter.name, 'http_requests_total');
  assert.strictEqual(counter.type, MetricType.COUNTER);
  
  counter.inc(5);
  assert.strictEqual(counter.getValue(), 5);
});

test('MetricsCollector should create gauge metric', () => {
  const collector = new MetricsCollector();
  const gauge = collector.createGauge('memory_usage_bytes', 'Memory usage in bytes');
  
  assert.strictEqual(gauge.name, 'memory_usage_bytes');
  assert.strictEqual(gauge.type, MetricType.GAUGE);
  
  gauge.set(1024);
  assert.strictEqual(gauge.getValue(), 1024);
});

test('MetricsCollector should create histogram metric', () => {
  const collector = new MetricsCollector();
  const histogram = collector.createHistogram('http_request_duration_seconds', 'HTTP request duration');
  
  assert.strictEqual(histogram.name, 'http_request_duration_seconds');
  assert.strictEqual(histogram.type, MetricType.HISTOGRAM);
  
  histogram.observe(0.5);
  const value = histogram.getValue();
  assert.strictEqual(value.count, 1);
  assert.strictEqual(value.sum, 0.5);
});

test('MetricsCollector should return existing metric', () => {
  const collector = new MetricsCollector();
  const counter1 = collector.createCounter('test_counter', 'Test counter');
  const counter2 = collector.createCounter('test_counter', 'Test counter');
  
  assert.strictEqual(counter1, counter2);
});

test('MetricsCollector should throw error for conflicting metric types', () => {
  const collector = new MetricsCollector();
  collector.createCounter('test_metric', 'Test metric');
  
  assert.throws(() => {
    collector.createGauge('test_metric', 'Test metric');
  }, /already exists with type/);
});

test('MetricsCollector should export all metrics in Prometheus format', () => {
  const collector = new MetricsCollector();
  
  const counter = collector.createCounter('http_requests_total', 'Total HTTP requests');
  counter.inc(10);
  
  const gauge = collector.createGauge('memory_usage_bytes', 'Memory usage');
  gauge.set(1024);
  
  const histogram = collector.createHistogram('http_request_duration_seconds', 'HTTP request duration');
  histogram.observe(0.5);
  
  const output = collector.toPrometheusFormat();
  
  assert.ok(output.includes('http_requests_total 10'));
  assert.ok(output.includes('memory_usage_bytes 1024'));
  assert.ok(output.includes('http_request_duration_seconds_count 1'));
});

test('MetricsCollector should clear all metrics', () => {
  const collector = new MetricsCollector();
  collector.createCounter('test_counter', 'Test counter');
  
  assert.strictEqual(collector.getMetrics().length, 1);
  
  collector.clear();
  assert.strictEqual(collector.getMetrics().length, 0);
});
