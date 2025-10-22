import type { BulkheadConfig, ResiliencePolicy } from './types.js';
import { BulkheadRejectError } from './errors.js';

/**
 * Default bulkhead configuration
 */
export const DEFAULT_BULKHEAD_CONFIG: BulkheadConfig = {
  maxConcurrent: 10,
  maxQueueSize: 100,
  queueTimeout: 5000, // 5 seconds
};

class Semaphore {
  private permits: number;
  private waitingQueue: Array<() => void> = [];
  private maxQueueSize: number;

  constructor(permits: number, maxQueueSize: number) {
    this.permits = permits;
    this.maxQueueSize = maxQueueSize;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    if (this.waitingQueue.length >= this.maxQueueSize) {
      throw new BulkheadRejectError('Semaphore waiting queue is full', {
        queueLength: this.waitingQueue.length,
        maxQueueSize: this.maxQueueSize,
      });
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

export class Bulkhead implements ResiliencePolicy {
  public readonly name = 'Bulkhead';
  private semaphore: Semaphore;

  constructor(private config: BulkheadConfig = DEFAULT_BULKHEAD_CONFIG) {
    this.validateConfig();
    this.semaphore = new Semaphore(config.maxConcurrent, config.maxQueueSize);
  }

  public async execute<T>(operation: () => Promise<T>): Promise<T> {
    try {
      await this.semaphore.acquire();
      const result = await operation();
      return result;
    } finally {
      this.semaphore.release();
    }
  }

  public getStats() {
    return {
      availablePermits: this.semaphore.getAvailablePermits(),
      queueLength: this.semaphore.getQueueLength(),
      maxConcurrent: this.config.maxConcurrent,
      maxQueueSize: this.config.maxQueueSize,
    };
  }

  public isAvailable(): boolean {
    return this.semaphore.getQueueLength() < this.config.maxQueueSize;
  }

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
