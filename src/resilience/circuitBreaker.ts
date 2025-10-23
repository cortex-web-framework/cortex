import type { CircuitBreakerConfig, ResiliencePolicy } from './types.js';
import { CircuitState } from './types.js';
import { CircuitBreakerOpenError } from './errors.js';
import type { TimeProvider } from '../utils/time.js';
import { SystemTimeProvider } from '../utils/time.js';

/**
 * Default circuit breaker configuration
 */
export const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
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
export class CircuitBreaker implements ResiliencePolicy {
  public readonly name = 'CircuitBreaker';
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private nextAttemptTime = 0;
  private timeProvider: TimeProvider;

  constructor(
    private config: CircuitBreakerConfig = DEFAULT_CIRCUIT_BREAKER_CONFIG,
    timeProvider?: TimeProvider
  ) {
    this.timeProvider = timeProvider ?? new SystemTimeProvider();
    this.validateConfig();
  }

  /**
   * Execute an operation with circuit breaker protection
   */
  public async execute<T>(operation: () => Promise<T>): Promise<T> {
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
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Get current circuit breaker state
   */
  public getState(): CircuitState {
    return this.state;
  }

  /**
   * Get current failure count
   */
  public getFailureCount(): number {
    return this.failureCount;
  }

  /**
   * Get current success count
   */
  public getSuccessCount(): number {
    return this.successCount;
  }

  /**
   * Reset the circuit breaker to closed state
   */
  public reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttemptTime = 0;
  }

  /**
   * Check if circuit breaker is available for requests
   */
  public isAvailable(): boolean {
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
  private onSuccess(): void {
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
  private onFailure(): void {
    this.failureCount++;

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = this.timeProvider.now() + this.config.timeout;
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = this.timeProvider.now() + this.config.timeout;
    }
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
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
