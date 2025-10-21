import { BulkheadConfig, ResiliencePolicy } from './types';

/**
 * Default bulkhead configuration
 */
export const DEFAULT_BULKHEAD_CONFIG: BulkheadConfig = {
  maxConcurrent: 10,
  maxQueueSize: 100,
  queueTimeout: 5000, // 5 seconds
};

/**
 * Semaphore implementation for resource control
 */
class Semaphore {
  private permits: number;
  private waitingQueue: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    return new Promise((resolve) => {
      this.waitingQueue.push(resolve);
    });
  }

  release(): void {
    this.permits++;
    if (this.waitingQueue.length > 0) {
      const next = this.waitingQueue.shift();
      if (next) {
        this.permits--;
        next();
      }
    }
  }

  getAvailablePermits(): number {
    return this.permits;
  }

  getQueueLength(): number {
    return this.waitingQueue.length;
  }
}

/**
 * Bulkhead implementation for resource isolation
 *
 * @example
 * ```typescript
 * const bulkhead = new Bulkhead({
 *   maxConcurrent: 5,
 *   maxQueueSize: 50
 * });
 * 
 * const result = await bulkhead.execute(() => resourceIntensiveOperation());
 * ```
 */
export class Bulkhead implements ResiliencePolicy {
  public readonly name = 'Bulkhead';
  private semaphore: Semaphore;
  private queue: Array<() => Promise<any>> = [];
  private isProcessing = false;

  constructor(private config: BulkheadConfig = DEFAULT_BULKHEAD_CONFIG) {
    this.validateConfig();
    this.semaphore = new Semaphore(config.maxConcurrent);
  }

  /**
   * Execute an operation with bulkhead protection
   */
  public async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Check if queue is full
    if (this.queue.length >= this.config.maxQueueSize) {
      throw new Error('Bulkhead queue is full');
    }

    return new Promise((resolve, reject) => {
      const wrappedOperation = async () => {
        try {
          await this.semaphore.acquire();
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.semaphore.release();
        }
      };

      this.queue.push(wrappedOperation);
      
      // Process queue asynchronously
      setImmediate(() => this.processQueue());
    });
  }

  /**
   * Get current statistics
   */
  public getStats() {
    return {
      availablePermits: this.semaphore.getAvailablePermits(),
      queueLength: this.queue.length,
      maxConcurrent: this.config.maxConcurrent,
      maxQueueSize: this.config.maxQueueSize,
    };
  }

  /**
   * Check if bulkhead is available for new operations
   */
  public isAvailable(): boolean {
    return this.queue.length < this.config.maxQueueSize;
  }

  /**
   * Process the operation queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const operation = this.queue.shift();
      if (operation) {
        // Execute operation asynchronously
        operation().catch(() => {
          // Error handling is done in the wrapped operation
        });
      }
    }

    this.isProcessing = false;
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (this.config.maxConcurrent <= 0) {
      throw new Error('maxConcurrent must be greater than 0');
    }
    if (this.config.maxQueueSize <= 0) {
      throw new Error('maxQueueSize must be greater than 0');
    }
    if (this.config.queueTimeout <= 0) {
      throw new Error('queueTimeout must be greater than 0');
    }
  }
}
