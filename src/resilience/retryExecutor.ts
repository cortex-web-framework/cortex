import { RetryConfig, ErrorMatcher, ResiliencePolicy } from './types.js';

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  jitter: true,
  retryableErrors: ['NetworkError', 'TimeoutError', 'ServiceUnavailableError'],
};

/**
 * Common error matchers
 */
export class ErrorMatchers {
  /**
   * Match by error name (checks both error.name and error.message)
   */
  static byName(errorNames: string[]): ErrorMatcher {
    return (error: Error) => {
      return errorNames.some(name =>
        error.name === name ||
        error.constructor.name === name ||
        error.message.includes(name)
      );
    };
  }

  /**
   * Match by error message pattern
   */
  static byMessage(pattern: RegExp): ErrorMatcher {
    return (error: Error) => pattern.test(error.message);
  }

  /**
   * Match network-related errors
   */
  static networkErrors(): ErrorMatcher {
    return (error: Error) => {
      const networkErrors = ['NetworkError', 'TimeoutError', 'ECONNRESET', 'ENOTFOUND'];
      return networkErrors.some(name => 
        error.constructor.name === name || error.message.includes(name)
      );
    };
  }

  /**
   * Match HTTP 5xx errors
   */
  static serverErrors(): ErrorMatcher {
    return (error: Error) => {
      const message = error.message.toLowerCase();
      return message.includes('500') || message.includes('502') || 
             message.includes('503') || message.includes('504');
    };
  }

  /**
   * Match any error (retry everything)
   */
  static any(): ErrorMatcher {
    return () => true;
  }

  /**
   * Match no errors (never retry)
   */
  static none(): ErrorMatcher {
    return () => false;
  }
}

/**
 * Retry executor with exponential backoff and jitter
 *
 * @example
 * ```typescript
 * const retryExecutor = new RetryExecutor({
 *   maxAttempts: 3,
 *   baseDelay: 1000,
 *   backoffMultiplier: 2
 * });
 * 
 * const result = await retryExecutor.execute(() => unreliableOperation());
 * ```
 */
export class RetryExecutor implements ResiliencePolicy {
  public readonly name = 'RetryExecutor';
  private errorMatcher: ErrorMatcher;

  constructor(
    private config: RetryConfig = DEFAULT_RETRY_CONFIG,
    errorMatcher?: ErrorMatcher
  ) {
    this.validateConfig();
    this.errorMatcher = errorMatcher || ErrorMatchers.byName(config.retryableErrors);
  }

  /**
   * Execute an operation with retry logic
   */
  public async execute<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Check if we should retry this error
        if (!this.shouldRetry(lastError, attempt)) {
          throw lastError;
        }

        // Don't delay on the last attempt
        if (attempt < this.config.maxAttempts) {
          const delay = this.calculateDelay(attempt);
          await this.sleep(delay);
        }
      }
    }
    
    throw lastError!;
  }

  /**
   * Set a custom error matcher
   */
  public setErrorMatcher(matcher: ErrorMatcher): void {
    this.errorMatcher = matcher;
  }

  /**
   * Check if an error should be retried
   */
  private shouldRetry(error: Error, attempt: number): boolean {
    if (attempt >= this.config.maxAttempts) {
      return false;
    }
    const matcherResult = this.errorMatcher(error);
    return matcherResult;
  }

  /**
   * Calculate delay for the given attempt
   */
  private calculateDelay(attempt: number): number {
    let delay = this.config.baseDelay * Math.pow(this.config.backoffMultiplier, attempt - 1);
    
    // Apply maximum delay limit
    delay = Math.min(delay, this.config.maxDelay);
    
    // Add jitter if enabled
    if (this.config.jitter) {
      const jitterAmount = delay * 0.1; // 10% jitter
      const jitter = (Math.random() - 0.5) * 2 * jitterAmount;
      delay += jitter;
    }
    
    return Math.max(0, Math.floor(delay));
  }

  /**
   * Sleep for the specified duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (this.config.maxAttempts <= 0) {
      throw new Error('maxAttempts must be greater than 0');
    }
    if (this.config.baseDelay < 0) {
      throw new Error('baseDelay must be non-negative');
    }
    if (this.config.maxDelay < 0) {
      throw new Error('maxDelay must be non-negative');
    }
    if (this.config.backoffMultiplier <= 0) {
      throw new Error('backoffMultiplier must be greater than 0');
    }
    if (this.config.maxDelay < this.config.baseDelay) {
      throw new Error('maxDelay must be greater than or equal to baseDelay');
    }
  }
}
