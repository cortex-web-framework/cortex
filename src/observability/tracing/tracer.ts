import type { Span, TraceContext, SamplingContext } from '../types.js';
import { SpanKind } from '../types.js';
import { SpanImpl } from './span.js';
import type { Sampler } from './sampler.js';
import { ProbabilitySampler } from './sampler.js';
import { generateTraceId, generateSpanId } from './ids.js';

/**
 * Configuration options for Tracer
 */
export interface TracerConfig {
  serviceName: string;
  sampler?: Sampler;
  maxSpansPerTrace?: number;
}

/**
 * Tracer creates and manages spans for distributed tracing
 *
 * @example
 * ```typescript
 * const tracer = new Tracer({ serviceName: 'api-server' });
 * const span = tracer.startSpan('handle_request', { kind: SpanKind.SERVER });
 * span.setAttribute('http.method', 'GET');
 * span.end();
 * ```
 */
export class Tracer {
  private config: Required<TracerConfig>;
  private activeSpans: Map<string, Span> = new Map();

  constructor(config: TracerConfig) {
    this.config = {
      serviceName: config.serviceName,
      sampler: config.sampler || new ProbabilitySampler(1.0),
      maxSpansPerTrace: config.maxSpansPerTrace || 1000,
    };
  }

  /**
   * Start a new span
   *
   * @param name - Span name (operation name)
   * @param options - Span options
   * @returns Span instance
   */
  public startSpan(
    name: string,
    options: {
      kind?: SpanKind;
      parent?: TraceContext;
      attributes?: Record<string, any>;
    } = {}
  ): Span {
    const traceId = options.parent?.traceId || generateTraceId();
    const spanId = generateSpanId();
    const parentSpanId = options.parent?.spanId;

    // Check if we should sample this span
    const samplingContext: SamplingContext = {
      traceId,
      spanId,
      parentContext: options.parent || undefined,
      attributes: options.attributes || {},
    };

    const samplingResult = this.config.sampler.shouldSample(samplingContext);

    const span = new SpanImpl({
      traceId,
      spanId,
      parentSpanId,
      name,
      kind: options.kind || SpanKind.INTERNAL,
      startTime: Date.now(),
      attributes: {
        'service.name': this.config.serviceName,
        ...(options.attributes || {}),
        ...samplingResult.attributes,
      },
    });

    // Only track active spans if we're sampling
    if (samplingResult.decision !== 0) { // Not DROP
      this.activeSpans.set(spanId, span);
    }

    return span;
  }

  /**
   * Get active span by ID
   */
  public getSpan(spanId: string): Span | undefined {
    return this.activeSpans.get(spanId);
  }

  /**
   * End a span and remove from active spans
   */
  public endSpan(spanId: string): void {
    const span = this.activeSpans.get(spanId);
    if (span && !span.endTime) {
      span.end();
    }
    this.activeSpans.delete(spanId);
  }

  /**
   * Get all active spans
   */
  public getActiveSpans(): Span[] {
    return Array.from(this.activeSpans.values());
  }

  /**
   * Export completed spans (for testing/debugging)
   */
  public exportSpans(): Span[] {
    return this.getActiveSpans().filter(s => s.endTime !== undefined);
  }

  /**
   * Get tracer configuration
   */
  public getConfig(): Required<TracerConfig> {
    return { ...this.config };
  }
}
