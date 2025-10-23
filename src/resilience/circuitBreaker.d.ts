import type { CircuitBreakerConfig, ResiliencePolicy } from './types.js';
import { CircuitState } from './types.js';
import type { TimeProvider } from '../utils/time.js';
/**
 * Default circuit breaker configuration
 */
export declare const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig;
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
export declare class CircuitBreaker implements ResiliencePolicy {
    private config;
    readonly name = "CircuitBreaker";
    private state;
    private failureCount;
    private successCount;
    private nextAttemptTime;
    private timeProvider;
    constructor(config?: CircuitBreakerConfig, timeProvider?: TimeProvider);
    /**
     * Execute an operation with circuit breaker protection
     */
    execute<T>(operation: () => Promise<T>): Promise<T>;
    /**
     * Get current circuit breaker state
     */
    getState(): CircuitState;
    /**
     * Get current failure count
     */
    getFailureCount(): number;
    /**
     * Get current success count
     */
    getSuccessCount(): number;
    /**
     * Reset the circuit breaker to closed state
     */
    reset(): void;
    /**
     * Check if circuit breaker is available for requests
     */
    isAvailable(): boolean;
    /**
     * Handle successful operation
     */
    private onSuccess;
    /**
     * Handle failed operation
     */
    private onFailure;
    /**
     * Validate configuration
     */
    private validateConfig;
}
//# sourceMappingURL=circuitBreaker.d.ts.map