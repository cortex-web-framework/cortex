/**
 * TimeProvider interface for dependency injection of time-based operations
 *
 * This interface allows decoupling from the system clock, enabling deterministic
 * testing and flexible time management across the application.
 */
export interface TimeProvider {
    /**
     * Returns the current timestamp in milliseconds since epoch
     * @returns Current timestamp in milliseconds
     */
    now(): number;
}
/**
 * SystemTimeProvider implementation using the system clock
 *
 * This is the production implementation that uses `Date.now()` to return
 * the actual current system time. It should be used in all non-test scenarios.
 */
export declare class SystemTimeProvider implements TimeProvider {
    /**
     * Returns the current system timestamp in milliseconds since epoch
     * @returns Current timestamp from Date.now()
     */
    now(): number;
}
