import { Metric, MetricType, Labels } from '../types';
import { Counter } from './counter';
import { Gauge } from './gauge';
import { Histogram } from './histogram';

/**
 * MetricsCollector aggregates and exposes metrics in Prometheus format
 *
 * @example
 * ```typescript
 * const collector = new MetricsCollector();
 * const counter = collector.createCounter('http_requests_total', 'Total HTTP requests');
 * counter.inc({ method: 'GET', path: '/api/users' });
 * console.log(collector.toPrometheusFormat());
 * ```
 */
export class MetricsCollector {
  private metrics: Map<string, Metric> = new Map();

  /**
   * Create a counter metric
   *
   * @param name - Metric name (should use underscores, e.g., 'http_requests_total')
   * @param help - Human-readable description
   * @param labels - Optional default labels
   * @returns Counter instance
   */
  public createCounter(name: string, help: string, labels: Labels = {}): Counter {
    if (this.metrics.has(name)) {
      const existing = this.metrics.get(name)!;
      if (existing.type !== MetricType.COUNTER) {
        throw new Error(`Metric ${name} already exists with type ${existing.type}`);
      }
      return existing as Counter;
    }

    const counter = new Counter(name, help, labels);
    this.metrics.set(name, counter);
    return counter;
  }

  /**
   * Create a gauge metric
   *
   * @param name - Metric name
   * @param help - Human-readable description
   * @param labels - Optional default labels
   * @returns Gauge instance
   */
  public createGauge(name: string, help: string, labels: Labels = {}): Gauge {
    if (this.metrics.has(name)) {
      const existing = this.metrics.get(name)!;
      if (existing.type !== MetricType.GAUGE) {
        throw new Error(`Metric ${name} already exists with type ${existing.type}`);
      }
      return existing as Gauge;
    }

    const gauge = new Gauge(name, help, labels);
    this.metrics.set(name, gauge);
    return gauge;
  }

  /**
   * Create a histogram metric
   *
   * @param name - Metric name
   * @param help - Human-readable description
   * @param buckets - Bucket boundaries (default: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10])
   * @param labels - Optional default labels
   * @returns Histogram instance
   */
  public createHistogram(
    name: string,
    help: string,
    buckets?: number[],
    labels: Labels = {}
  ): Histogram {
    if (this.metrics.has(name)) {
      const existing = this.metrics.get(name)!;
      if (existing.type !== MetricType.HISTOGRAM) {
        throw new Error(`Metric ${name} already exists with type ${existing.type}`);
      }
      return existing as Histogram;
    }

    const histogram = new Histogram(name, help, buckets, labels);
    this.metrics.set(name, histogram);
    return histogram;
  }

  /**
   * Get an existing metric by name
   *
   * @param name - Metric name
   * @returns Metric instance or undefined
   */
  public getMetric(name: string): Metric | undefined {
    return this.metrics.get(name);
  }

  /**
   * Get all registered metrics
   *
   * @returns Array of all metrics
   */
  public getMetrics(): Metric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Export all metrics in Prometheus text format
   *
   * @returns Prometheus-formatted metrics string
   */
  public toPrometheusFormat(): string {
    return Array.from(this.metrics.values())
      .map(m => m.toPrometheusFormat())
      .join('\n\n');
  }

  /**
   * Clear all metrics (useful for testing)
   */
  public clear(): void {
    this.metrics.clear();
  }
}
