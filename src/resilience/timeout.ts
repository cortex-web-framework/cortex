import { ResiliencePolicy } from './types.js';
import { TimeoutError } from './errors.js';

/**
 * Timeout executor for enforcing operation time limits
 *
 * @example
 * ```typescript
 * const timeout = new TimeoutExecutor(5000); // 5 second timeout
 *
 * try {
 *   const result = await timeout.execute(async () => {
 *     return await fetch('https://api.example.com/slow-endpoint');
 *   });
 * } catch (error) {
 *   if (error instanceof TimeoutError) {
 *     console.log('Request took too long');
 *   }
 * }
 * ```
 */
export class TimeoutExecutor implements ResiliencePolicy {
  public readonly name = 'TimeoutExecutor';

  constructor(
    private timeoutMs: number,
    private fallback?: () => any
  ) {}

  /**
   * Execute an operation with timeout protection
   *
   * @param fn - Async function to execute
   * @returns Promise with function result or timeout error
   * @throws TimeoutError if operation exceeds timeout
   */
  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) => {
        const timeoutHandle = setTimeout(() => {
          if (this.fallback) {
            reject(this.fallback());
          } else {
            reject(new TimeoutError(`Operation timed out after ${this.timeoutMs}ms`));
          }
        }, this.timeoutMs);

        // Allow garbage collection if promise resolves
        fn().finally(() => clearTimeout(timeoutHandle));
      }),
    ]);
  }
}
