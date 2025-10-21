import { test } from 'node:test';
import assert from 'node:assert';
import { Histogram } from '../../../src/observability/metrics/histogram';

test('Histogram should observe values correctly', () => {
  const histogram = new Histogram('http_request_duration_seconds', 'HTTP request duration');
  
  histogram.observe(0.5);
  histogram.observe(1.0);
  histogram.observe(1.5);
  
  const value = histogram.getValue();
  assert.strictEqual(value.count, 3);
  assert.strictEqual(value.sum, 3.0);
});

test('Histogram should reject negative values', () => {
  const histogram = new Histogram('test_histogram', 'Test histogram');
  
  assert.throws(() => {
    histogram.observe(-1.0);
  }, /non-negative/);
});

test('Histogram should update bucket counts correctly', () => {
  const histogram = new Histogram('test_histogram', 'Test histogram', [0.1, 0.5, 1.0]);
  
  histogram.observe(0.05); // Should go to 0.1 bucket
  histogram.observe(0.3);  // Should go to 0.5 bucket
  histogram.observe(0.8);  // Should go to 1.0 bucket
  histogram.observe(2.0);  // Should go to +Inf bucket
  
  const value = histogram.getValue();
  assert.strictEqual(value.buckets.get(0.1), 1);
  assert.strictEqual(value.buckets.get(0.5), 2);
  assert.strictEqual(value.buckets.get(1.0), 3);
  assert.strictEqual(value.buckets.get(Number.POSITIVE_INFINITY), 4);
});

test('Histogram should format Prometheus output correctly', () => {
  const histogram = new Histogram('http_request_duration_seconds', 'HTTP request duration', [0.1, 0.5, 1.0], {
    method: 'GET',
    path: '/api/users',
  });
  
  histogram.observe(0.3);
  histogram.observe(0.8);
  
  const output = histogram.toPrometheusFormat();
  assert.ok(output.includes('# HELP http_request_duration_seconds HTTP request duration'));
  assert.ok(output.includes('# TYPE http_request_duration_seconds histogram'));
  assert.ok(output.includes('http_request_duration_seconds_bucket{le="0.1"'));
  assert.ok(output.includes('http_request_duration_seconds_bucket{le="0.5"'));
  assert.ok(output.includes('http_request_duration_seconds_bucket{le="1"'));
  assert.ok(output.includes('http_request_duration_seconds_bucket{le="+Inf"'));
  assert.ok(output.includes('http_request_duration_seconds_sum{method="GET",path="/api/users"}'));
  assert.ok(output.includes('http_request_duration_seconds_count{method="GET",path="/api/users"}'));
});
