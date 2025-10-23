import type { Span, SpanStatus, SpanEvent, AttributeValue } from '../types.js';
import { SpanKind, SpanStatusCode } from '../types.js';

/**
 * Span implementation for distributed tracing
 */
export class SpanImpl implements Span {
  public readonly traceId: string;
  public readonly spanId: string;
  public readonly parentSpanId?: string | undefined;

  public name: string;
  public kind: SpanKind;
  public startTime: number;
  public endTime?: number;

  public attributes: Record<string, AttributeValue> = {};
  public events: SpanEvent[] = [];
  public status: SpanStatus = { code: SpanStatusCode.UNSET };

  constructor(options: {
    traceId: string;
    spanId: string;
    parentSpanId?: string | undefined;
    name: string;
    kind: SpanKind;
    startTime: number;
    attributes?: Record<string, AttributeValue>;
  }) {
    this.traceId = options.traceId;
    this.spanId = options.spanId;
    this.parentSpanId = options.parentSpanId;
    this.name = options.name;
    this.kind = options.kind;
    this.startTime = options.startTime;
    this.attributes = { ...options.attributes };
  }

  /**
   * Set an attribute on the span
   */
  public setAttribute(key: string, value: AttributeValue): void {
    this.attributes[key] = value;
  }

  /**
   * Add an event to the span
   */
  public addEvent(name: string, attributes?: Record<string, AttributeValue>): void {
    this.events.push({
      name,
      timestamp: Date.now(),
      attributes: attributes || {},
    });
  }

  /**
   * Set the status of the span
   */
  public setStatus(status: SpanStatus): void {
    this.status = status;
  }

  /**
   * Record an exception on the span
   */
  public recordException(error: Error): void {
    this.addEvent('exception', {
      'exception.type': error.constructor.name,
      'exception.message': error.message,
      'exception.stacktrace': error.stack || '',
    });
  }

  /**
   * End the span
   */
  public end(endTime?: number): void {
    this.endTime = endTime || Date.now();
  }

  /**
   * Get the duration of the span in milliseconds
   */
  public getDuration(): number {
    if (!this.endTime) {
      return Date.now() - this.startTime;
    }
    return this.endTime - this.startTime;
  }

  /**
   * Check if the span is ended
   */
  public isEnded(): boolean {
    return this.endTime !== undefined;
  }
}
