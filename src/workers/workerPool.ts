import { Worker } from 'node:worker_threads';
import { EventEmitter } from 'node:events';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/**
 * Worker pool configuration
 */
export interface WorkerPoolConfig {
  poolSize: number;           // Number of workers in the pool
  maxQueueSize: number;       // Maximum queue size
  workerTimeout: number;      // Worker execution timeout (ms)
  restartOnError: boolean;    // Whether to restart workers on error
  maxRestarts: number;        // Maximum number of restarts per worker
}

/**
 * Default worker pool configuration
 */
export const DEFAULT_WORKER_POOL_CONFIG: Required<WorkerPoolConfig> = {
  poolSize: 4,
  maxQueueSize: 100,
  workerTimeout: 30000,       // 30 seconds
  restartOnError: true,
  maxRestarts: 3
};

/**
 * Worker task
 */
interface WorkerTask {
  id: string;
  data: any;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  timeout: NodeJS.Timeout;
  startTime: number;
}

/**
 * Worker information
 */
interface WorkerInfo {
  worker: Worker;
  id: string;
  isBusy: boolean;
  currentTask?: WorkerTask | undefined;
  restartCount: number;
  lastUsed: number;
}

/**
 * Real Web Worker Pool implementation
 * Uses Node.js worker_threads for true parallel execution
 */
export class WorkerPool extends EventEmitter {
  private workers: Map<string, WorkerInfo> = new Map();
  private availableWorkers: string[] = [];
  private busyWorkers: Map<string, string> = new Map(); // taskId -> workerId
  private taskQueue: WorkerTask[] = [];
  private config: Required<WorkerPoolConfig>;
  private taskCounter = 0;
  private isShuttingDown = false;

  constructor(config: Partial<WorkerPoolConfig> = {}) {
    super();
    this.config = { ...DEFAULT_WORKER_POOL_CONFIG, ...config };
    this.initializeWorkers();
  }

  /**
   * Execute a task in the worker pool
   */
  public async execute(data: any, timeout?: number): Promise<any> {
    if (this.isShuttingDown) {
      throw new Error('Worker pool is shutting down');
    }

    if (this.taskQueue.length >= this.config.maxQueueSize) {
      throw new Error('Worker pool queue is full');
    }

    return new Promise((resolve, reject) => {
      const taskId = `task-${++this.taskCounter}`;
      const taskTimeout = timeout || this.config.workerTimeout;
      
      const task: WorkerTask = {
        id: taskId,
        data,
        resolve,
        reject,
        timeout: setTimeout(() => {
          this.handleTaskTimeout(taskId);
        }, taskTimeout),
        startTime: Date.now()
      };

      this.taskQueue.push(task);
      this.processQueue();
    });
  }

  /**
   * Get pool statistics
   */
  public getStats() {
    return {
      totalWorkers: this.workers.size,
      availableWorkers: this.availableWorkers.length,
      busyWorkers: this.busyWorkers.size,
      queuedTasks: this.taskQueue.length,
      isShuttingDown: this.isShuttingDown
    };
  }

  /**
   * Shutdown the worker pool
   */
  public async shutdown(): Promise<void> {
    this.isShuttingDown = true;
    
    // Reject all queued tasks
    this.taskQueue.forEach(task => {
      clearTimeout(task.timeout);
      task.reject(new Error('Worker pool is shutting down'));
    });
    this.taskQueue = [];

    // Terminate all workers
    const terminationPromises = Array.from(this.workers.values()).map(workerInfo => {
      return new Promise<void>((resolve) => {
        workerInfo.worker.terminate().then(() => resolve()).catch(() => resolve());
      });
    });

    await Promise.all(terminationPromises);
    this.workers.clear();
    this.availableWorkers = [];
    this.busyWorkers.clear();
  }

  /**
   * Initialize worker pool
   */
  private initializeWorkers(): void {
    for (let i = 0; i < this.config.poolSize; i++) {
      this.createWorker(`worker-${i}`);
    }
  }

  /**
   * Create a new worker
   */
  private createWorker(workerId: string): void {
    // Get the path to the worker file
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const workerPath = join(__dirname, 'poolWorker.js');

    const worker = new Worker(workerPath);

    const workerInfo: WorkerInfo = {
      worker,
      id: workerId,
      isBusy: false,
      restartCount: 0,
      lastUsed: Date.now()
    };

    this.workers.set(workerId, workerInfo);
    this.availableWorkers.push(workerId);

    // Handle worker messages
    worker.on('message', (message) => {
      this.handleWorkerMessage(workerId, message);
    });

    // Handle worker errors
    worker.on('error', (error) => {
      this.handleWorkerError(workerId, error);
    });

    // Handle worker exit
    worker.on('exit', (code) => {
      this.handleWorkerExit(workerId, code);
    });
  }

  /**
   * Process the task queue
   */
  private processQueue(): void {
    while (this.taskQueue.length > 0 && this.availableWorkers.length > 0) {
      const task = this.taskQueue.shift()!;
      const workerId = this.availableWorkers.shift()!;
      const workerInfo = this.workers.get(workerId)!;

      // Mark worker as busy
      workerInfo.isBusy = true;
      workerInfo.currentTask = task;
      workerInfo.lastUsed = Date.now();
      this.busyWorkers.set(task.id, workerId);

      // Send task to worker
      workerInfo.worker.postMessage({
        taskId: task.id,
        data: task.data
      });

      this.emit('taskStarted', { taskId: task.id, workerId });
    }
  }

  /**
   * Handle worker message
   */
  private handleWorkerMessage(workerId: string, message: any): void {
    const workerInfo = this.workers.get(workerId);
    if (!workerInfo || !workerInfo.currentTask) {
      return;
    }

    const { taskId, result, error, success } = message;
    const task = workerInfo.currentTask;

    // Clear timeout
    clearTimeout(task.timeout);

    // Mark worker as available
    workerInfo.isBusy = false;
    workerInfo.currentTask = undefined;
    this.busyWorkers.delete(taskId);
    this.availableWorkers.push(workerId);

    // Resolve or reject task
    if (success) {
      task.resolve(result);
      this.emit('taskCompleted', { taskId, workerId, duration: Date.now() - task.startTime });
    } else {
      task.reject(new Error(error));
      this.emit('taskFailed', { taskId, workerId, error });
    }

    // Process next task
    this.processQueue();
  }

  /**
   * Handle worker error
   */
  private handleWorkerError(workerId: string, error: Error): void {
    const workerInfo = this.workers.get(workerId);
    if (!workerInfo) return;

    this.emit('workerError', { workerId, error });

    // If worker has a current task, reject it
    if (workerInfo.currentTask) {
      clearTimeout(workerInfo.currentTask.timeout);
      workerInfo.currentTask.reject(error);
      this.busyWorkers.delete(workerInfo.currentTask.id);
    }

    // Restart worker if configured
    if (this.config.restartOnError && workerInfo.restartCount < this.config.maxRestarts) {
      this.restartWorker(workerId);
    } else {
      this.removeWorker(workerId);
    }
  }

  /**
   * Handle worker exit
   */
  private handleWorkerExit(workerId: string, code: number): void {
    this.emit('workerExit', { workerId, code });
    
    if (code !== 0) {
      // Worker exited unexpectedly
      const workerInfo = this.workers.get(workerId);
      if (workerInfo && workerInfo.currentTask) {
        clearTimeout(workerInfo.currentTask.timeout);
        workerInfo.currentTask.reject(new Error(`Worker exited with code ${code}`));
        this.busyWorkers.delete(workerInfo.currentTask.id);
      }
    }

    this.removeWorker(workerId);
  }

  /**
   * Handle task timeout
   */
  private handleTaskTimeout(taskId: string): void {
    const workerId = this.busyWorkers.get(taskId);
    if (workerId) {
      const workerInfo = this.workers.get(workerId);
      if (workerInfo && workerInfo.currentTask) {
        workerInfo.currentTask.reject(new Error('Task timeout'));
        this.busyWorkers.delete(taskId);
        workerInfo.isBusy = false;
        workerInfo.currentTask = undefined as WorkerTask | undefined;
        this.availableWorkers.push(workerId);
        this.processQueue();
      }
    }
  }

  /**
   * Restart a worker
   */
  private restartWorker(workerId: string): void {
    const workerInfo = this.workers.get(workerId);
    if (!workerInfo) return;

    // Terminate old worker
    workerInfo.worker.terminate().catch(() => {
      // Ignore termination errors
    });

    // Create new worker
    workerInfo.restartCount++;
    this.createWorker(workerId);
    
    this.emit('workerRestarted', { workerId, restartCount: workerInfo.restartCount });
  }

  /**
   * Remove a worker
   */
  private removeWorker(workerId: string): void {
    const workerInfo = this.workers.get(workerId);
    if (!workerInfo) return;

    // Remove from available workers
    const availableIndex = this.availableWorkers.indexOf(workerId);
    if (availableIndex !== -1) {
      this.availableWorkers.splice(availableIndex, 1);
    }

    // Remove from busy workers
    for (const [taskId, busyWorkerId] of this.busyWorkers.entries()) {
      if (busyWorkerId === workerId) {
        this.busyWorkers.delete(taskId);
      }
    }

    this.workers.delete(workerId);
    this.emit('workerRemoved', { workerId });
  }
}