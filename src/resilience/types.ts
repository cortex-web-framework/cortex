/**
 * Circuit breaker states
 */
export enum CircuitState {
  CLOSED = 'closed',     // Normal operation
  OPEN = 'open',         // Circuit is open, requests fail fast
  HALF_OPEN = 'half-open', // Testing if service has recovered
}

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  failureThreshold: number;        // Number of failures before opening circuit
  successThreshold: number;        // Number of successes to close circuit from half-open
  timeout: number;                 // Time in ms before trying half-open state
  resetTimeout: number;            // Time in ms before resetting failure count
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;             // Maximum number of retry attempts
  baseDelay: number;              // Base delay in milliseconds
  maxDelay: number;               // Maximum delay in milliseconds
  backoffMultiplier: number;      // Exponential backoff multiplier
  jitter: boolean;                // Whether to add jitter to delays
  retryableErrors: string[];      // Error types to retry on
}

/**
 * Error matcher function type
 */
export type ErrorMatcher = (error: Error) => boolean;

/**
 * Bulkhead configuration
 */
export interface BulkheadConfig {
  maxConcurrent: number;          // Maximum concurrent executions
  maxQueueSize: number;           // Maximum queue size
  queueTimeout: number;           // Timeout for queue operations
}

/**
 * Timeout configuration
 */
export interface TimeoutConfig {
  timeout: number;                // Timeout in milliseconds
  onTimeout?: () => void;         // Callback on timeout
}

/**
 * Resilience policy interface
 */
export interface ResiliencePolicy {
  name: string;
  execute<T>(operation: () => Promise<T>): Promise<T>;
}
