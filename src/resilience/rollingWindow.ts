/**
 * RollingWindow - Circular Buffer Implementation
 *
 * Provides O(1) performance for all operations by using a circular buffer pattern.
 * This allows efficient tracking of metrics over a sliding window without iterating
 * over historical data.
 *
 * Used by CircuitBreaker and other components for efficient metric aggregation.
 */

/**
 * RollingWindow - A fixed-size circular buffer for efficient metric tracking
 *
 * This data structure maintains a fixed-size window of numeric values with O(1)
 * add operations and O(1) sum/average calculations.
 *
 * @example
 * ```typescript
 * const window = new RollingWindow(10); // Track 10 values
 * window.add(5);
 * window.add(10);
 * console.log(window.getSum());     // 15
 * console.log(window.getAverage()); // 7.5
 * console.log(window.getCount());   // 2
 * ```
 */
export class RollingWindow {
  private readonly window: number[];
  private readonly size: number;
  private head: number = 0;
  private count: number = 0;
  private sum: number = 0;

  /**
   * Creates a new RollingWindow
   * @param size The fixed size of the window - must be positive
   * @throws Error if size <= 0
   */
  constructor(size: number) {
    if (size <= 0 || !Number.isFinite(size)) {
      throw new Error('Window size must be positive.');
    }
    this.size = size;
    this.window = new Array(size).fill(0);
  }

  /**
   * Returns the fixed size of this window
   * @returns The configured window size
   */
  getSize(): number {
    return this.size;
  }

  /**
   * Adds a value to the window, overwriting the oldest value if the window is full
   *
   * Time Complexity: O(1)
   * Space Complexity: O(1)
   *
   * When the window is full, this operation:
   * 1. Subtracts the value being overwritten from the running sum
   * 2. Stores the new value at the head position
   * 3. Advances the head pointer (with wraparound)
   * 4. Adds the new value to the running sum
   *
   * @param value The numeric value to add
   */
  add(value: number): void {
    // If window is full, subtract the value we're about to overwrite
    if (this.isFull()) {
      this.sum -= this.window[this.head]!;
    }

    // Store the new value
    this.window[this.head] = value;

    // Advance head pointer with wraparound
    this.head = (this.head + 1) % this.size;

    // Update sum with new value
    this.sum += value;

    // Increment count if not yet full
    if (!this.isFull()) {
      this.count++;
    }
  }

  /**
   * Returns the sum of all values currently in the window
   *
   * Time Complexity: O(1)
   *
   * @returns The sum of all values in the window
   */
  getSum(): number {
    return this.sum;
  }

  /**
   * Returns the number of values currently in the window
   *
   * Time Complexity: O(1)
   *
   * @returns The count of values (0 to size)
   */
  getCount(): number {
    return this.count;
  }

  /**
   * Returns the average of all values currently in the window
   *
   * Time Complexity: O(1)
   *
   * @returns The average (sum / count), or 0 if empty
   */
  getAverage(): number {
    return this.count === 0 ? 0 : this.sum / this.count;
  }

  /**
   * Checks if the window is at full capacity
   *
   * Time Complexity: O(1)
   *
   * @returns true if the window contains size elements, false otherwise
   */
  isFull(): boolean {
    return this.count === this.size;
  }

  /**
   * Clears all values from the window and resets to initial state
   *
   * Time Complexity: O(n) where n = size
   */
  clear(): void {
    this.window.fill(0);
    this.head = 0;
    this.count = 0;
    this.sum = 0;
  }
}

/**
 * TimeWindowTracker - Tracks successes and failures over a rolling time window
 *
 * This is used by CircuitBreaker to determine if the error rate exceeds thresholds.
 * Uses a fixed number of time buckets to track metrics efficiently.
 *
 * @example
 * ```typescript
 * const timeProvider = new SystemTimeProvider();
 * const tracker = new TimeWindowTracker(
 *   { windowSizeMs: 10000, bucketCount: 10 },
 *   timeProvider
 * );
 *
 * tracker.recordSuccess();
 * tracker.recordSuccess();
 * tracker.recordFailure();
 *
 * console.log(tracker.getTotalRequests()); // 3
 * console.log(tracker.getErrorRate());     // 33.33
 * ```
 */
export interface TimeWindowConfig {
  /** Size of the time window in milliseconds */
  windowSizeMs: number;
  /** Number of time buckets to divide the window into */
  bucketCount: number;
}

/**
 * Bucket for storing success/failure counts in a specific time period
 */
interface TimeBucket {
  timestamp: number;
  successes: number;
  failures: number;
}

export class TimeWindowTracker {
  private buckets: TimeBucket[] = [];
  private currentBucketIndex: number = 0;
  private readonly config: TimeWindowConfig;
  private readonly timeProvider: any; // TimeProvider type

  /**
   * Creates a new TimeWindowTracker
   * @param config Configuration for the time window
   * @param timeProvider TimeProvider for getting current time (injected)
   */
  constructor(config: TimeWindowConfig, timeProvider: any) {
    this.config = config;
    this.timeProvider = timeProvider;

    // Initialize buckets
    for (let i = 0; i < config.bucketCount; i++) {
      this.buckets.push({
        timestamp: 0,
        successes: 0,
        failures: 0,
      });
    }
  }

  /**
   * Records a successful operation
   */
  recordSuccess(): void {
    this.updateCurrentBucket();
    const current = this.buckets[this.currentBucketIndex];
    if (current) {
      current.successes++;
    }
  }

  /**
   * Records a failed operation
   */
  recordFailure(): void {
    this.updateCurrentBucket();
    const current = this.buckets[this.currentBucketIndex];
    if (current) {
      current.failures++;
    }
  }

  /**
   * Returns the total number of requests in the window
   * @returns Total successes + failures
   */
  getTotalRequests(): number {
    return this.buckets.reduce((sum, b) => sum + b.successes + b.failures, 0);
  }

  /**
   * Returns the error rate as a percentage (0-100)
   * @returns Error rate percentage, or 0 if no requests
   */
  getErrorRate(): number {
    const total = this.getTotalRequests();
    if (total === 0) return 0;

    const failures = this.buckets.reduce((sum, b) => sum + b.failures, 0);
    return (failures / total) * 100;
  }

  /**
   * Clears all bucket data
   */
  clear(): void {
    for (const bucket of this.buckets) {
      bucket.successes = 0;
      bucket.failures = 0;
      bucket.timestamp = 0;
    }
    this.currentBucketIndex = 0;
  }

  /**
   * Updates the current bucket based on elapsed time
   * This expires old buckets that have fallen outside the time window
   */
  private updateCurrentBucket(): void {
    const now = this.timeProvider.now();
    const bucketDurationMs = this.config.windowSizeMs / this.config.bucketCount;

    // Calculate which bucket should be current based on time
    const bucketIndex = Math.floor((now / bucketDurationMs) % this.config.bucketCount) || 0;

    // If we've moved to a new bucket, reset it
    if (bucketIndex !== this.currentBucketIndex) {
      this.currentBucketIndex = bucketIndex;
      const bucket = this.buckets[this.currentBucketIndex];
      if (bucket) {
        bucket.successes = 0;
        bucket.failures = 0;
        bucket.timestamp = now;
      }
    }
  }
}
