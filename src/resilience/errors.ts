/**
 * Error thrown when a circuit breaker is open
 * Indicates that the service is temporarily unavailable
 */
export class CircuitBreakerOpenError extends Error {
  constructor(message: string, public nextAttemptTime?: number) {
    super(message);
    this.name = 'CircuitBreakerOpenError';
    Object.setPrototypeOf(this, CircuitBreakerOpenError.prototype);
  }
}

/**
 * Error thrown when a bulkhead rejects a request
 * Indicates that concurrency or queue limits have been exceeded
 */
export class BulkheadRejectError extends Error {
  constructor(message: string, public details?: Record<string, any>) {
    super(message);
    this.name = 'BulkheadRejectError';
    Object.setPrototypeOf(this, BulkheadRejectError.prototype);
  }
}

/**
 * Error thrown when an operation exceeds its timeout
 * Indicates that an async operation took too long to complete
 */
export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}
