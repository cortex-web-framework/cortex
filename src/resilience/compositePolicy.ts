import type { ResiliencePolicy } from './types.js';
import { CircuitBreaker } from './circuitBreaker.js';
import { RetryExecutor } from './retryExecutor.js';
import { Bulkhead } from './bulkhead.js';

/**
 * Composite policy that combines multiple resilience patterns
 *
 * @example
 * ```typescript
 * const policy = new CompositePolicy()
 *   .withCircuitBreaker(circuitBreaker)
 *   .withRetry(retryExecutor)
 *   .withBulkhead(bulkhead);
 * 
 * const result = await policy.execute(() => riskyOperation());
 * ```
 */
export class CompositePolicy implements ResiliencePolicy {
  public readonly name = 'CompositePolicy';
  private policies: ResiliencePolicy[] = [];

  /**
   * Add a circuit breaker to the policy chain
   */
  public withCircuitBreaker(circuitBreaker: CircuitBreaker): this {
    this.policies.push(circuitBreaker);
    return this;
  }

  /**
   * Add a retry executor to the policy chain
   */
  public withRetry(retryExecutor: RetryExecutor): this {
    this.policies.push(retryExecutor);
    return this;
  }

  /**
   * Add a bulkhead to the policy chain
   */
  public withBulkhead(bulkhead: Bulkhead): this {
    this.policies.push(bulkhead);
    return this;
  }

  /**
   * Add a custom policy to the chain
   */
  public withPolicy(policy: ResiliencePolicy): this {
    this.policies.push(policy);
    return this;
  }

  /**
   * Execute an operation through all policies in sequence
   */
  public async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.policies.length === 0) {
      return operation();
    }

    // Execute policies in reverse order (last added is first executed)
    // This allows for proper nesting: bulkhead -> retry -> circuit breaker
    let currentOperation = operation;
    
    for (let i = this.policies.length - 1; i >= 0; i--) {
      const policy = this.policies[i];
      const wrappedOperation = currentOperation;
      currentOperation = () => policy.execute(wrappedOperation);
    }

    return currentOperation();
  }

  /**
   * Get all policies in the chain
   */
  public getPolicies(): ResiliencePolicy[] {
    return [...this.policies];
  }

  /**
   * Clear all policies
   */
  public clear(): this {
    this.policies = [];
    return this;
  }

  /**
   * Get policy by name
   */
  public getPolicy(name: string): ResiliencePolicy | undefined {
    return this.policies.find(policy => policy.name === name);
  }
}
