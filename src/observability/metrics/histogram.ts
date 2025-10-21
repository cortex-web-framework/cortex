import { Metric, MetricType, Labels, HistogramValue } from '../types';

/**
 * Histogram observes the distribution of values
 * Use for measuring durations, sizes, counts, etc.
 *
 * @example
 * ```typescript
 * const durationHistogram = new Histogram('http_request_duration_seconds', 'HTTP request duration');
 * durationHistogram.observe(0.5); // Record 0.5 seconds
 * durationHistogram.observe(1.2); // Record 1.2 seconds
 * ```
 */
export class Histogram implements Metric {
  public readonly name: string;
  public readonly type = MetricType.HISTOGRAM;
  public readonly help: string;
  public readonly labels: Labels;
  private buckets: Map<number, number> = new Map();
  private sum: number = 0;
  private count: number = 0;
  private bucketBoundaries: number[];

  constructor(
    name: string,
    help: string,
    buckets: number[] = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    labels: Labels = {}
  ) {
    this.name = name;
    this.help = help;
    this.labels = labels;
    this.bucketBoundaries = [...buckets].sort((a, b) => a - b);
    
    // Initialize bucket counts
    for (const boundary of this.bucketBoundaries) {
      this.buckets.set(boundary, 0);
    }
    // Add +Inf bucket
    this.buckets.set(Number.POSITIVE_INFINITY, 0);
  }

  /**
   * Observe a value and update histogram
   *
   * @param value - Value to observe
   */
  public observe(value: number): void {
    if (value < 0) {
      throw new Error('Histogram values must be non-negative');
    }

    this.count++;
    this.sum += value;

    // Update bucket counts - increment all buckets that the value falls into
    for (const boundary of this.bucketBoundaries) {
      if (value <= boundary) {
        this.buckets.set(boundary, (this.buckets.get(boundary) || 0) + 1);
      }
    }
    
    // Always increment +Inf bucket
    this.buckets.set(Number.POSITIVE_INFINITY, (this.buckets.get(Number.POSITIVE_INFINITY) || 0) + 1);
  }

  /**
   * Get histogram value with buckets, sum, and count
   */
  public getValue(): HistogramValue {
    return {
      buckets: new Map(this.buckets),
      sum: this.sum,
      count: this.count,
    };
  }

  /**
   * Export in Prometheus format
   *
   * @returns Prometheus-formatted metric string
   */
  public toPrometheusFormat(): string {
    const labelStr = this.formatLabels(this.labels);
    const lines: string[] = [];

    // Add help and type
    lines.push(`# HELP ${this.name} ${this.help}`);
    lines.push(`# TYPE ${this.name} histogram`);

    // Add bucket lines
    for (const boundary of this.bucketBoundaries) {
      const count = this.buckets.get(boundary) || 0;
      lines.push(`${this.name}_bucket{le="${boundary}"${labelStr ? ',' + labelStr.slice(1, -1) : ''}} ${count}`);
    }
    
    // Add +Inf bucket
    const infCount = this.buckets.get(Number.POSITIVE_INFINITY) || 0;
    lines.push(`${this.name}_bucket{le="+Inf"${labelStr ? ',' + labelStr.slice(1, -1) : ''}} ${infCount}`);

    // Add sum and count
    lines.push(`${this.name}_sum${labelStr} ${this.sum}`);
    lines.push(`${this.name}_count${labelStr} ${this.count}`);

    return lines.join('\n');
  }

  /**
   * Format labels for Prometheus output
   */
  private formatLabels(labels: Labels): string {
    const pairs = Object.entries(labels)
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return pairs ? `{${pairs}}` : '';
  }
}
