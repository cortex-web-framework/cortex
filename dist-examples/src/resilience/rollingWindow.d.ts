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
export declare class RollingWindow {
    private readonly window;
    private readonly size;
    private head;
    private count;
    private sum;
    /**
     * Creates a new RollingWindow
     * @param size The fixed size of the window - must be positive
     * @throws Error if size <= 0
     */
    constructor(size: number);
    /**
     * Returns the fixed size of this window
     * @returns The configured window size
     */
    getSize(): number;
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
    add(value: number): void;
    /**
     * Returns the sum of all values currently in the window
     *
     * Time Complexity: O(1)
     *
     * @returns The sum of all values in the window
     */
    getSum(): number;
    /**
     * Returns the number of values currently in the window
     *
     * Time Complexity: O(1)
     *
     * @returns The count of values (0 to size)
     */
    getCount(): number;
    /**
     * Returns the average of all values currently in the window
     *
     * Time Complexity: O(1)
     *
     * @returns The average (sum / count), or 0 if empty
     */
    getAverage(): number;
    /**
     * Checks if the window is at full capacity
     *
     * Time Complexity: O(1)
     *
     * @returns true if the window contains size elements, false otherwise
     */
    isFull(): boolean;
    /**
     * Clears all values from the window and resets to initial state
     *
     * Time Complexity: O(n) where n = size
     */
    clear(): void;
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
export declare class TimeWindowTracker {
    private buckets;
    private currentBucketIndex;
    private readonly config;
    private readonly timeProvider;
    /**
     * Creates a new TimeWindowTracker
     * @param config Configuration for the time window
     * @param timeProvider TimeProvider for getting current time (injected)
     */
    constructor(config: TimeWindowConfig, timeProvider: any);
    /**
     * Records a successful operation
     */
    recordSuccess(): void;
    /**
     * Records a failed operation
     */
    recordFailure(): void;
    /**
     * Returns the total number of requests in the window
     * @returns Total successes + failures
     */
    getTotalRequests(): number;
    /**
     * Returns the error rate as a percentage (0-100)
     * @returns Error rate percentage, or 0 if no requests
     */
    getErrorRate(): number;
    /**
     * Clears all bucket data
     */
    clear(): void;
    /**
     * Updates the current bucket based on elapsed time
     * This expires old buckets that have fallen outside the time window
     */
    private updateCurrentBucket;
}
