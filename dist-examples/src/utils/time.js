/**
 * SystemTimeProvider implementation using the system clock
 *
 * This is the production implementation that uses `Date.now()` to return
 * the actual current system time. It should be used in all non-test scenarios.
 */
export class SystemTimeProvider {
    /**
     * Returns the current system timestamp in milliseconds since epoch
     * @returns Current timestamp from Date.now()
     */
    now() {
        return Date.now();
    }
}
