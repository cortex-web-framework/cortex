/**
 * Observability Module
 * Unified interface for tracing, metrics, and health checks
 */

import { MetricsCollector } from './metrics/collector.js';
import { Tracer } from './tracing/tracer.js';
import { ProbabilitySampler } from './tracing/sampler.js';
import { HealthCheckRegistry } from './health/healthRegistry.js';

export * from './types.js';

// Metrics exports
export { MetricsCollector } from './metrics/collector.js';
export { Counter } from './metrics/counter.js';
export { Gauge } from './metrics/gauge.js';
export { Histogram } from './metrics/histogram.js';

// Tracing exports
export { Tracer } from './tracing/tracer.js';
export { SpanImpl } from './tracing/span.js';
export type { Sampler } from './tracing/sampler.js';
export { ProbabilitySampler } from './tracing/sampler.js';
export { generateTraceId, generateSpanId } from './tracing/ids.js';

// Health check exports
export { HealthCheckRegistry } from './health/healthRegistry.js';
export {
  MemoryHealthCheck,
  UptimeHealthCheck,
  CpuHealthCheck,
  ApplicationHealthCheck,
  getDefaultHealthChecks
} from './health/defaultChecks.js';

/**
 * Factory for creating a unified observability setup
 */
export class ObservabilityFactory {
  public static createMetricsCollector(): MetricsCollector {
    return new MetricsCollector();
  }

  public static createTracer(serviceName: string, sampleRate: number = 0.1): Tracer {
    return new Tracer({
      serviceName,
      sampler: new ProbabilitySampler(sampleRate),
    });
  }

  public static createHealthCheckRegistry(): HealthCheckRegistry {
    return new HealthCheckRegistry();
  }
}
