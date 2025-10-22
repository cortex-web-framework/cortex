import { test } from 'node:test';
import assert from 'node:assert';
import type { MetricType } from '../../../src/observability/types';
import { Histogram } from '../../../src/observability/metrics/histogram';

// Basic observation tests
test('Histogram: observe single value', () => {
  const histogram = new Histogram('test', 'Help');
  histogram.observe(0.5);
  const value = histogram.getValue();
  assert.strictEqual(value.count, 1);
  assert.strictEqual(value.sum, 0.5);
});

test('Histogram: observe multiple values accumulates count and sum', () => {
  const histogram = new Histogram('test', 'Help');
  histogram.observe(0.5);
  histogram.observe(1.0);
  histogram.observe(1.5);
  const value = histogram.getValue();
  assert.strictEqual(value.count, 3);
  assert.strictEqual(value.sum, 3.0);
});

test('Histogram: observe zero value is valid', () => {
  const histogram = new Histogram('test', 'Help');
  histogram.observe(0);
  const value = histogram.getValue();
  assert.strictEqual(value.count, 1);
  assert.strictEqual(value.sum, 0);
});

// Error handling
test('Histogram: reject negative values', () => {
  const histogram = new Histogram('test', 'Help');
  assert.throws(
    () => histogram.observe(-1.0),
    /non-negative/i,
  );
});

// Default buckets
test('Histogram: uses default buckets when not provided', () => {
  const histogram = new Histogram('test', 'Help');
  histogram.observe(0.005);
  histogram.observe(0.01);
  histogram.observe(0.1);
  histogram.observe(1.0);
  histogram.observe(10.0);

  const value = histogram.getValue();
  assert.ok(value.buckets.size >= 10); // At least default buckets
  assert.ok(value.buckets.has(Number.POSITIVE_INFINITY));
});

// Custom buckets
test('Histogram: uses custom buckets when provided', () => {
  const histogram = new Histogram('test', 'Help', [0.1, 0.5, 1.0]);

  const value = histogram.getValue();
  assert.ok(value.buckets.has(0.1));
  assert.ok(value.buckets.has(0.5));
  assert.ok(value.buckets.has(1.0));
  assert.ok(value.buckets.has(Number.POSITIVE_INFINITY));
});

// Bucket distribution
test('Histogram: buckets are cumulative', () => {
  const histogram = new Histogram('test', 'Help', [0.1, 0.5, 1.0]);

  histogram.observe(0.05); // < 0.1
  histogram.observe(0.05); // < 0.1
  histogram.observe(0.3);  // < 0.5 but >= 0.1
  histogram.observe(0.8);  // < 1.0 but >= 0.5
  histogram.observe(2.0);  // >= 1.0

  const value = histogram.getValue();
  // Cumulative: 0.1 bucket has all <= 0.1
  assert.strictEqual(value.buckets.get(0.1), 2);
  // 0.5 bucket has all <= 0.5
  assert.strictEqual(value.buckets.get(0.5), 3);
  // 1.0 bucket has all <= 1.0
  assert.strictEqual(value.buckets.get(1.0), 4);
  // +Inf has all values
  assert.strictEqual(value.buckets.get(Number.POSITIVE_INFINITY), 5);
});

test('Histogram: values on bucket boundaries', () => {
  const histogram = new Histogram('test', 'Help', [0.5, 1.0, 2.0]);

  histogram.observe(0.5);   // Equal to bucket boundary
  histogram.observe(1.0);   // Equal to bucket boundary
  histogram.observe(2.0);   // Equal to bucket boundary
  histogram.observe(1.999); // Just under boundary

  const value = histogram.getValue();
  // All values should be in their appropriate buckets
  assert.strictEqual(value.buckets.get(0.5), 1);  // 0.5
  assert.strictEqual(value.buckets.get(1.0), 2);  // 0.5, 1.0
  assert.strictEqual(value.buckets.get(2.0), 4);  // 0.5, 1.0, 1.999, 2.0
});

// Sum calculation
test('Histogram: tracks sum of all observations', () => {
  const histogram = new Histogram('test', 'Help');
  histogram.observe(1.5);
  histogram.observe(2.5);
  histogram.observe(3.0);
  const value = histogram.getValue();
  assert.strictEqual(value.sum, 7.0);
});

test('Histogram: handles sum with decimal precision', () => {
  const histogram = new Histogram('test', 'Help');
  histogram.observe(0.1);
  histogram.observe(0.2);
  histogram.observe(0.3);
  const value = histogram.getValue();
  assert.ok(Math.abs(value.sum - 0.6) < 0.0001);
});

// Prometheus format
test('Histogram: toPrometheusFormat without labels', () => {
  const histogram = new Histogram('request_duration', 'Request duration', [0.1, 1.0]);
  histogram.observe(0.05);
  histogram.observe(0.5);

  const output = histogram.toPrometheusFormat();
  assert.ok(output.includes('# HELP request_duration Request duration'));
  assert.ok(output.includes('# TYPE request_duration histogram'));
  assert.ok(output.includes('request_duration_bucket{le="0.1"}'));
  assert.ok(output.includes('request_duration_bucket{le="1"}'));
  assert.ok(output.includes('request_duration_bucket{le="+Inf"}'));
  assert.ok(output.includes('request_duration_sum'));
  assert.ok(output.includes('request_duration_count'));
});

test('Histogram: toPrometheusFormat with labels', () => {
  const histogram = new Histogram('request_duration', 'Request duration', [0.5, 1.0], {
    method: 'GET',
    path: '/api',
  });
  histogram.observe(0.3);

  const output = histogram.toPrometheusFormat();
  assert.ok(output.includes('method="GET"'));
  assert.ok(output.includes('path="/api"'));
  assert.ok(output.includes('request_duration_bucket{le="0.5",method="GET",path="/api"}'));
});

test('Histogram: Prometheus output includes all buckets', () => {
  const histogram = new Histogram('test', 'Help', [0.1, 0.5, 1.0]);
  histogram.observe(0.05);

  const output = histogram.toPrometheusFormat();
  assert.ok(output.includes('le="0.1"'));
  assert.ok(output.includes('le="0.5"'));
  assert.ok(output.includes('le="1"'));
  assert.ok(output.includes('le="+Inf"'));
});

// Properties and metadata
test('Histogram: name property is readable', () => {
  const histogram = new Histogram('my_histogram', 'Help');
  assert.strictEqual(histogram.name, 'my_histogram');
});

test('Histogram: help property is readable', () => {
  const histogram = new Histogram('metric', 'My help text');
  assert.strictEqual(histogram.help, 'My help text');
});

test('Histogram: type property returns histogram', () => {
  const histogram = new Histogram('metric', 'Help');
  assert.strictEqual(histogram.type, 'histogram' as MetricType);
});

test('Histogram: labels property is readable', () => {
  const histogram = new Histogram('metric', 'Help', undefined, { env: 'prod' });
  assert.deepStrictEqual(histogram.labels, { env: 'prod' });
});

test('Histogram: empty labels by default', () => {
  const histogram = new Histogram('metric', 'Help');
  assert.deepStrictEqual(histogram.labels, {});
});

// Edge cases
test('Histogram: handles very large values', () => {
  const histogram = new Histogram('test', 'Help');
  histogram.observe(1e6);
  const value = histogram.getValue();
  assert.strictEqual(value.count, 1);
  assert.strictEqual(value.sum, 1e6);
});

test('Histogram: handles very small values', () => {
  const histogram = new Histogram('test', 'Help');
  histogram.observe(1e-6);
  const value = histogram.getValue();
  assert.strictEqual(value.count, 1);
  assert.ok(Math.abs(value.sum - 1e-6) < 1e-7);
});

// Multiple instances
test('Histogram: multiple instances maintain separate values', () => {
  const h1 = new Histogram('h1', 'Help');
  const h2 = new Histogram('h2', 'Help');

  h1.observe(1.0);
  h1.observe(2.0);
  h2.observe(5.0);

  const v1 = h1.getValue();
  const v2 = h2.getValue();
  assert.strictEqual(v1.count, 2);
  assert.strictEqual(v1.sum, 3.0);
  assert.strictEqual(v2.count, 1);
  assert.strictEqual(v2.sum, 5.0);
});

test('Histogram: Prometheus output is idempotent', () => {
  const histogram = new Histogram('metric', 'Help', [0.1, 1.0]);
  histogram.observe(0.5);

  const output1 = histogram.toPrometheusFormat();
  const output2 = histogram.toPrometheusFormat();

  assert.strictEqual(output1, output2);
});
