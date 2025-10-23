import { CircuitState } from './types.js';
import { CircuitBreakerOpenError } from './errors.js';
import { SystemTimeProvider } from '../utils/time.js';
/**
 * Default circuit breaker configuration
 */
export const DEFAULT_CIRCUIT_BREAKER_CONFIG = {
    failureThreshold: 5,
    successThreshold: 3,
    timeout: 60000, // 1 minute
    resetTimeout: 30000, // 30 seconds
};
/**
 * Circuit breaker implementation for fault tolerance
 *
 * @example
 * ```typescript
 * const circuitBreaker = new CircuitBreaker({
 *   failureThreshold: 5,
 *   successThreshold: 3,
 *   timeout: 60000
 * });
 *
 * try {
 *   const result = await circuitBreaker.execute(() => riskyOperation());
 * } catch (error) {
 *   // Handle circuit breaker or operation errors
 * }
 * ```
 */
export class CircuitBreaker {
    constructor(config = DEFAULT_CIRCUIT_BREAKER_CONFIG, timeProvider) {
        this.config = config;
        this.name = 'CircuitBreaker';
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.nextAttemptTime = 0;
        this.timeProvider = timeProvider ?? new SystemTimeProvider();
        this.validateConfig();
    }
    /**
     * Execute an operation with circuit breaker protection
     */
    async execute(operation) {
        if (this.state === CircuitState.OPEN) {
            if (this.timeProvider.now() < this.nextAttemptTime) {
                throw new CircuitBreakerOpenError('Circuit breaker is OPEN', this.nextAttemptTime);
            }
            this.state = CircuitState.HALF_OPEN;
            this.successCount = 0;
        }
        try {
            const result = await operation();
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure();
            throw error;
        }
    }
    /**
     * Get current circuit breaker state
     */
    getState() {
        return this.state;
    }
    /**
     * Get current failure count
     */
    getFailureCount() {
        return this.failureCount;
    }
    /**
     * Get current success count
     */
    getSuccessCount() {
        return this.successCount;
    }
    /**
     * Reset the circuit breaker to closed state
     */
    reset() {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.nextAttemptTime = 0;
    }
    /**
     * Check if circuit breaker is available for requests
     */
    isAvailable() {
        if (this.state === CircuitState.CLOSED) {
            return true;
        }
        if (this.state === CircuitState.OPEN) {
            return this.timeProvider.now() >= this.nextAttemptTime;
        }
        return true; // HALF_OPEN
    }
    /**
     * Handle successful operation
     */
    onSuccess() {
        this.failureCount = 0;
        if (this.state === CircuitState.HALF_OPEN) {
            this.successCount++;
            if (this.successCount >= this.config.successThreshold) {
                this.state = CircuitState.CLOSED;
                this.successCount = 0;
            }
        }
    }
    /**
     * Handle failed operation
     */
    onFailure() {
        this.failureCount++;
        if (this.state === CircuitState.HALF_OPEN) {
            this.state = CircuitState.OPEN;
            this.nextAttemptTime = this.timeProvider.now() + this.config.timeout;
        }
        else if (this.failureCount >= this.config.failureThreshold) {
            this.state = CircuitState.OPEN;
            this.nextAttemptTime = this.timeProvider.now() + this.config.timeout;
        }
    }
    /**
     * Validate configuration
     */
    validateConfig() {
        if (this.config.failureThreshold <= 0) {
            throw new Error('failureThreshold must be greater than 0');
        }
        if (this.config.successThreshold <= 0) {
            throw new Error('successThreshold must be greater than 0');
        }
        if (this.config.timeout <= 0) {
            throw new Error('timeout must be greater than 0');
        }
        if (this.config.resetTimeout <= 0) {
            throw new Error('resetTimeout must be greater than 0');
        }
    }
}
