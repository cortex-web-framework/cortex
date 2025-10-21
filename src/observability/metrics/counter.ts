import { Metric, MetricType, Labels } from '../types';

/**
 * Counter is a monotonically increasing metric
 * Use for counting events: requests, errors, tasks completed, etc.
 *
 * @example
 * ```typescript
 * const requestCounter = new Counter('http_requests_total', 'Total HTTP requests');
 * requestCounter.inc(); // increment by 1
 * requestCounter.inc(5); // increment by 5
 * ```
 */
export class Counter implements Metric {
  public readonly name: string;
  public readonly type = MetricType.COUNTER;
  public readonly help: string;
  public readonly labels: Labels;
  private value: number = 0;

  constructor(name: string, help: string, labels: Labels = {}) {
    this.name = name;
    this.help = help;
    this.labels = labels;
  }

  /**
   * Increment the counter
   *
   * @param value - Amount to increment (must be non-negative, default: 1)
   * @throws Error if value is negative
   */
  public inc(value: number = 1): void {
    if (value < 0) {
      throw new Error('Counter can only be incremented with non-negative values');
    }
    this.value += value;
  }

  /**
   * Get current counter value
   */
  public getValue(): number {
    return this.value;
  }

  /**
   * Export in Prometheus format
   *
   * @returns Prometheus-formatted metric string
   */
  public toPrometheusFormat(): string {
    const labelStr = this.formatLabels(this.labels);
    return `# HELP ${this.name} ${this.help}\n# TYPE ${this.name} counter\n${this.name}${labelStr} ${this.value}`;
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
