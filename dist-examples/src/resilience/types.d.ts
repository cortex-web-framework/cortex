/**
 * Circuit breaker states
 */
export declare enum CircuitState {
    CLOSED = "closed",// Normal operation
    OPEN = "open",// Circuit is open, requests fail fast
    HALF_OPEN = "half-open"
}
/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
    failureThreshold: number;
    successThreshold: number;
    timeout: number;
    resetTimeout: number;
}
/**
 * Retry configuration
 */
export interface RetryConfig {
    maxAttempts: number;
    baseDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
    jitter: boolean;
    retryableErrors: string[];
}
/**
 * Error matcher function type
 */
export type ErrorMatcher = (error: Error) => boolean;
/**
 * Bulkhead configuration
 */
export interface BulkheadConfig {
    maxConcurrent: number;
    maxQueueSize: number;
    queueTimeout: number;
}
/**
 * Timeout configuration
 */
export interface TimeoutConfig {
    timeout: number;
    onTimeout?: () => void;
}
/**
 * Resilience policy interface
 */
export interface ResiliencePolicy {
    name: string;
    execute<T>(operation: () => Promise<T>): Promise<T>;
}
