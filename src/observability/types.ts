/**
 * Metric value types supported by the framework
 */
export type MetricValue = number | string | boolean;

/**
 * Label key-value pairs for dimensional metrics
 */
export type Labels = Record<string, string>;

/**
 * Metric types following Prometheus conventions
 */
export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  SUMMARY = 'summary',
}

/**
 * Base metric interface
 */
export interface Metric {
  readonly name: string;
  readonly type: MetricType;
  readonly help: string;
  readonly labels: Labels;
  getValue(): MetricValue | HistogramValue;
  toPrometheusFormat(): string;
}

/**
 * Histogram bucket structure
 */
export interface HistogramValue {
  buckets: Map<number, number>;
  sum: number;
  count: number;
}

/**
 * Trace context following W3C Trace Context spec
 */
export interface TraceContext {
  traceId: string;      // 32 hex chars (128 bits)
  spanId: string;       // 16 hex chars (64 bits)
  traceFlags: number;   // 8 bits (sampled flag)
  traceState?: string;  // Vendor-specific data
}

/**
 * Span attribute value types
 */
export type AttributeValue = string | number | boolean | string[] | number[] | boolean[];

/**
 * Span kinds following OpenTelemetry spec
 */
export enum SpanKind {
  INTERNAL = 0,
  SERVER = 1,
  CLIENT = 2,
  PRODUCER = 3,
  CONSUMER = 4,
}

/**
 * Span status codes
 */
export enum SpanStatusCode {
  UNSET = 0,
  OK = 1,
  ERROR = 2,
}

/**
 * Span status
 */
export interface SpanStatus {
  code: SpanStatusCode;
  message?: string;
}

/**
 * Span event
 */
export interface SpanEvent {
  name: string;
  timestamp: number;
  attributes?: Record<string, AttributeValue>;
}

/**
 * Span interface
 */
export interface Span {
  readonly traceId: string;
  readonly spanId: string;
  readonly parentSpanId?: string;

  name: string;
  kind: SpanKind;
  startTime: number;
  endTime?: number;

  attributes: Record<string, AttributeValue>;
  events: SpanEvent[];
  status: SpanStatus;

  setAttribute(key: string, value: AttributeValue): void;
  addEvent(name: string, attributes?: Record<string, AttributeValue>): void;
  setStatus(status: SpanStatus): void;
  recordException(error: Error): void;
  end(endTime?: number): void;
}

/**
 * Sampling decision
 */
export enum SamplingDecision {
  DROP = 0,
  RECORD_ONLY = 1,
  RECORD_AND_SAMPLE = 2,
}

/**
 * Sampling context
 */
export interface SamplingContext {
  traceId: string;
  spanId: string;
  parentContext?: TraceContext;
  attributes: Record<string, AttributeValue>;
}

/**
 * Sampling result
 */
export interface SamplingResult {
  decision: SamplingDecision;
  attributes: Record<string, AttributeValue>;
}

/**
 * Health check status
 */
export enum HealthStatus {
  UP = 'up',
  DOWN = 'down',
  DEGRADED = 'degraded',
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  status: HealthStatus;
  message?: string;
  timestamp: number;
  details?: Record<string, any>;
}

/**
 * Health check interface
 */
export interface HealthCheck {
  readonly name: string;
  check(): Promise<HealthCheckResult>;
}
