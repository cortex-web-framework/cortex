import { Metric, MetricType, Labels } from '../types';

/**
 * Gauge is a metric that can go up and down
 * Use for values that can increase or decrease: memory usage, queue size, temperature, etc.
 *
 * @example
 * ```typescript
 * const memoryGauge = new Gauge('memory_usage_bytes', 'Memory usage in bytes');
 * memoryGauge.set(1024 * 1024); // Set to 1MB
 * memoryGauge.inc(512); // Add 512 bytes
 * memoryGauge.dec(256); // Subtract 256 bytes
 * ```
 */
export class Gauge implements Metric {
  public readonly name: string;
  public readonly type = MetricType.GAUGE;
  public readonly help: string;
  public readonly labels: Labels;
  private value: number = 0;

  constructor(name: string, help: string, labels: Labels = {}) {
    this.name = name;
    this.help = help;
    this.labels = labels;
  }

  /**
   * Set the gauge to a specific value
   *
   * @param value - Value to set
   */
  public set(value: number): void {
    this.value = value;
  }

  /**
   * Increment the gauge by a specific amount
   *
   * @param value - Amount to increment (default: 1)
   */
  public inc(value: number = 1): void {
    this.value += value;
  }

  /**
   * Decrement the gauge by a specific amount
   *
   * @param value - Amount to decrement (default: 1)
   */
  public dec(value: number = 1): void {
    this.value -= value;
  }

  /**
   * Get current gauge value
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
    return `# HELP ${this.name} ${this.help}\n# TYPE ${this.name} gauge\n${this.name}${labelStr} ${this.value}`;
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
