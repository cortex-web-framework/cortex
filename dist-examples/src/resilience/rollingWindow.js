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
    /**
     * Creates a new RollingWindow
     * @param size The fixed size of the window - must be positive
     * @throws Error if size <= 0
     */
    constructor(size) {
        this.head = 0;
        this.count = 0;
        this.sum = 0;
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
    getSize() {
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
    add(value) {
        // If window is full, subtract the value we're about to overwrite
        if (this.isFull()) {
            this.sum -= this.window[this.head];
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
    getSum() {
        return this.sum;
    }
    /**
     * Returns the number of values currently in the window
     *
     * Time Complexity: O(1)
     *
     * @returns The count of values (0 to size)
     */
    getCount() {
        return this.count;
    }
    /**
     * Returns the average of all values currently in the window
     *
     * Time Complexity: O(1)
     *
     * @returns The average (sum / count), or 0 if empty
     */
    getAverage() {
        return this.count === 0 ? 0 : this.sum / this.count;
    }
    /**
     * Checks if the window is at full capacity
     *
     * Time Complexity: O(1)
     *
     * @returns true if the window contains size elements, false otherwise
     */
    isFull() {
        return this.count === this.size;
    }
    /**
     * Clears all values from the window and resets to initial state
     *
     * Time Complexity: O(n) where n = size
     */
    clear() {
        this.window.fill(0);
        this.head = 0;
        this.count = 0;
        this.sum = 0;
    }
}
export class TimeWindowTracker {
    /**
     * Creates a new TimeWindowTracker
     * @param config Configuration for the time window
     * @param timeProvider TimeProvider for getting current time (injected)
     */
    constructor(config, timeProvider) {
        this.buckets = [];
        this.currentBucketIndex = 0;
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
    recordSuccess() {
        this.updateCurrentBucket();
        const current = this.buckets[this.currentBucketIndex];
        if (current) {
            current.successes++;
        }
    }
    /**
     * Records a failed operation
     */
    recordFailure() {
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
    getTotalRequests() {
        return this.buckets.reduce((sum, b) => sum + b.successes + b.failures, 0);
    }
    /**
     * Returns the error rate as a percentage (0-100)
     * @returns Error rate percentage, or 0 if no requests
     */
    getErrorRate() {
        const total = this.getTotalRequests();
        if (total === 0)
            return 0;
        const failures = this.buckets.reduce((sum, b) => sum + b.failures, 0);
        return (failures / total) * 100;
    }
    /**
     * Clears all bucket data
     */
    clear() {
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
    updateCurrentBucket() {
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
