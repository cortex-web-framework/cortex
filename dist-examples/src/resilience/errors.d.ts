/**
 * Error thrown when a circuit breaker is open
 * Indicates that the service is temporarily unavailable
 */
export declare class CircuitBreakerOpenError extends Error {
    nextAttemptTime?: number;
    constructor(message: string, nextAttemptTime?: number);
}
/**
 * Error thrown when a bulkhead rejects a request
 * Indicates that concurrency or queue limits have been exceeded
 */
export declare class BulkheadRejectError extends Error {
    details?: Record<string, any>;
    constructor(message: string, details?: Record<string, any>);
}
/**
 * Error thrown when an operation exceeds its timeout
 * Indicates that an async operation took too long to complete
 */
export declare class TimeoutError extends Error {
    constructor(message: string);
}
