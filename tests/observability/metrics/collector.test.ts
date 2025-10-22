import { test } from 'node:test';
import assert from 'node:assert';
import type { MetricType } from '../../../src/observability/types';
import { MetricsCollector } from '../../../src/observability/metrics/collector';

// Counter creation and retrieval
test('MetricsCollector: create counter metric', () => {
  const collector = new MetricsCollector();
  const counter = collector.createCounter('http_requests_total', 'Total HTTP requests');

  assert.strictEqual(counter.name, 'http_requests_total');
  assert.strictEqual(counter.type, 'counter' as MetricType);

  counter.inc(5);
  assert.strictEqual(counter.getValue(), 5);
});

test('MetricsCollector: create counter with labels', () => {
  const collector = new MetricsCollector();
  const counter = collector.createCounter('http_requests_total', 'Total requests', {
    method: 'GET',
    endpoint: '/api',
  });

  assert.deepStrictEqual(counter.labels, { method: 'GET', endpoint: '/api' });
  counter.inc(1);
  assert.strictEqual(counter.getValue(), 1);
});

// Gauge creation and retrieval
test('MetricsCollector: create gauge metric', () => {
  const collector = new MetricsCollector();
  const gauge = collector.createGauge('memory_usage_bytes', 'Memory usage');

  assert.strictEqual(gauge.name, 'memory_usage_bytes');
  assert.strictEqual(gauge.type, 'gauge' as MetricType);

  gauge.set(1024);
  assert.strictEqual(gauge.getValue(), 1024);
});

test('MetricsCollector: create gauge with labels', () => {
  const collector = new MetricsCollector();
  const gauge = collector.createGauge('memory_usage_bytes', 'Memory usage', {
    instance: 'server-1',
  });

  assert.deepStrictEqual(gauge.labels, { instance: 'server-1' });
  gauge.set(2048);
  assert.strictEqual(gauge.getValue(), 2048);
});

// Histogram creation and retrieval
test('MetricsCollector: create histogram metric', () => {
  const collector = new MetricsCollector();
  const histogram = collector.createHistogram('http_request_duration_seconds', 'HTTP request duration');

  assert.strictEqual(histogram.name, 'http_request_duration_seconds');
  assert.strictEqual(histogram.type, 'histogram' as MetricType);

  histogram.observe(0.5);
  const value = histogram.getValue();
  assert.strictEqual(value.count, 1);
  assert.strictEqual(value.sum, 0.5);
});

test('MetricsCollector: create histogram with custom buckets', () => {
  const collector = new MetricsCollector();
  const histogram = collector.createHistogram('test', 'Help', [0.1, 0.5, 1.0]);

  assert.ok(histogram.getValue().buckets.has(0.1));
  assert.ok(histogram.getValue().buckets.has(0.5));
  assert.ok(histogram.getValue().buckets.has(1.0));
});

test('MetricsCollector: create histogram with labels', () => {
  const collector = new MetricsCollector();
  const histogram = collector.createHistogram('http_request_duration_seconds', 'Duration', undefined, {
    method: 'GET',
  });

  assert.deepStrictEqual(histogram.labels, { method: 'GET' });
  histogram.observe(0.5);
  assert.strictEqual(histogram.getValue().count, 1);
});

// Metric retrieval and reuse
test('MetricsCollector: return existing metric when created again', () => {
  const collector = new MetricsCollector();
  const counter1 = collector.createCounter('test_counter', 'Test counter');
  const counter2 = collector.createCounter('test_counter', 'Test counter');

  assert.strictEqual(counter1, counter2);
});

test('MetricsCollector: getMetric retrieves by name', () => {
  const collector = new MetricsCollector();
  const counter = collector.createCounter('my_counter', 'Help');

  const retrieved = collector.getMetric('my_counter');
  assert.strictEqual(retrieved, counter);
});

test('MetricsCollector: getMetric returns undefined for nonexistent', () => {
  const collector = new MetricsCollector();

  const retrieved = collector.getMetric('nonexistent');
  assert.strictEqual(retrieved, undefined);
});

// Error handling
test('MetricsCollector: reject conflicting metric types', () => {
  const collector = new MetricsCollector();
  collector.createCounter('test_metric', 'Test metric');

  assert.throws(
    () => collector.createGauge('test_metric', 'Test metric'),
    /already exists with type/i,
  );
});

test('MetricsCollector: reject counter after gauge', () => {
  const collector = new MetricsCollector();
  collector.createGauge('test', 'Help');

  assert.throws(
    () => collector.createCounter('test', 'Help'),
    /already exists with type/i,
  );
});

test('MetricsCollector: reject histogram after counter', () => {
  const collector = new MetricsCollector();
  collector.createCounter('test', 'Help');

  assert.throws(
    () => collector.createHistogram('test', 'Help'),
    /already exists with type/i,
  );
});

// Prometheus format export
test('MetricsCollector: export empty metrics', () => {
  const collector = new MetricsCollector();
  const output = collector.toPrometheusFormat();
  assert.strictEqual(output, '');
});

test('MetricsCollector: export single counter', () => {
  const collector = new MetricsCollector();
  const counter = collector.createCounter('test_counter', 'Test counter');
  counter.inc(42);

  const output = collector.toPrometheusFormat();
  assert.ok(output.includes('# HELP test_counter Test counter'));
  assert.ok(output.includes('# TYPE test_counter counter'));
  assert.ok(output.includes('test_counter 42'));
});

test('MetricsCollector: export multiple metric types', () => {
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
  assert.ok(output.includes('http_request_duration_seconds_sum 0.5'));
});

test('MetricsCollector: Prometheus output includes HELP and TYPE for each metric', () => {
  const collector = new MetricsCollector();
  collector.createCounter('counter', 'Counter help');
  collector.createGauge('gauge', 'Gauge help');
  collector.createHistogram('histogram', 'Histogram help');

  const output = collector.toPrometheusFormat();

  assert.ok(output.includes('# HELP counter Counter help'));
  assert.ok(output.includes('# TYPE counter counter'));
  assert.ok(output.includes('# HELP gauge Gauge help'));
  assert.ok(output.includes('# TYPE gauge gauge'));
  assert.ok(output.includes('# HELP histogram Histogram help'));
  assert.ok(output.includes('# TYPE histogram histogram'));
});

// Collection and clearing
test('MetricsCollector: getMetrics returns all registered metrics', () => {
  const collector = new MetricsCollector();
  const counter = collector.createCounter('counter', 'Help');
  const gauge = collector.createGauge('gauge', 'Help');
  const histogram = collector.createHistogram('histogram', 'Help');

  const metrics = collector.getMetrics();
  assert.strictEqual(metrics.length, 3);
  assert.ok(metrics.includes(counter));
  assert.ok(metrics.includes(gauge));
  assert.ok(metrics.includes(histogram));
});

test('MetricsCollector: clear removes all metrics', () => {
  const collector = new MetricsCollector();
  collector.createCounter('counter', 'Help');
  collector.createGauge('gauge', 'Help');
  collector.createHistogram('histogram', 'Help');

  assert.strictEqual(collector.getMetrics().length, 3);

  collector.clear();
  assert.strictEqual(collector.getMetrics().length, 0);
});

test('MetricsCollector: can recreate metrics after clear', () => {
  const collector = new MetricsCollector();
  collector.createCounter('counter', 'Help');
  collector.clear();

  const counter = collector.createCounter('counter', 'New help');
  assert.strictEqual(counter.name, 'counter');
  assert.strictEqual(counter.getValue(), 0);
});

// Independent collectors
test('MetricsCollector: multiple instances are independent', () => {
  const collector1 = new MetricsCollector();
  const collector2 = new MetricsCollector();

  const counter1 = collector1.createCounter('counter', 'Help');
  const counter2 = collector2.createCounter('counter', 'Help');

  counter1.inc(5);
  counter2.inc(10);

  assert.strictEqual(counter1.getValue(), 5);
  assert.strictEqual(counter2.getValue(), 10);
  assert.strictEqual(collector1.getMetrics().length, 1);
  assert.strictEqual(collector2.getMetrics().length, 1);
});
