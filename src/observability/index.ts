/**
 * Observability Module
 * Unified interface for tracing, metrics, and health checks
 */

import { MetricsCollector } from './metrics/collector';
import { Tracer } from './tracing/tracer';
import { ProbabilitySampler } from './tracing/sampler';
import { HealthCheckRegistry } from './health/healthRegistry';

export * from './types';

// Metrics exports
export { MetricsCollector } from './metrics/collector';
export { Counter } from './metrics/counter';
export { Gauge } from './metrics/gauge';
export { Histogram } from './metrics/histogram';

// Tracing exports
export { Tracer } from './tracing/tracer';
export { SpanImpl } from './tracing/span';
export { Sampler, ProbabilitySampler } from './tracing/sampler';
export { generateTraceId, generateSpanId } from './tracing/ids';

// Health check exports
export { HealthCheckRegistry } from './health/healthRegistry';
export {
  MemoryHealthCheck,
  UptimeHealthCheck,
  CpuHealthCheck,
  ApplicationHealthCheck,
  getDefaultHealthChecks
} from './health/defaultChecks';

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
