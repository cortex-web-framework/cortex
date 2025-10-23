/**
 * Error thrown when a circuit breaker is open
 * Indicates that the service is temporarily unavailable
 */
export class CircuitBreakerOpenError extends Error {
    constructor(message, nextAttemptTime) {
        super(message);
        this.nextAttemptTime = nextAttemptTime;
        this.name = 'CircuitBreakerOpenError';
        Object.setPrototypeOf(this, CircuitBreakerOpenError.prototype);
    }
}
/**
 * Error thrown when a bulkhead rejects a request
 * Indicates that concurrency or queue limits have been exceeded
 */
export class BulkheadRejectError extends Error {
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = 'BulkheadRejectError';
        Object.setPrototypeOf(this, BulkheadRejectError.prototype);
    }
}
/**
 * Error thrown when an operation exceeds its timeout
 * Indicates that an async operation took too long to complete
 */
export class TimeoutError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TimeoutError';
        Object.setPrototypeOf(this, TimeoutError.prototype);
    }
}
//# sourceMappingURL=errors.js.map