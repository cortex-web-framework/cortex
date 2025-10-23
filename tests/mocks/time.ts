import type { TimeProvider } from '../../src/utils/time.js';

/**
 * ManualTimeProvider for deterministic testing
 *
 * This test double allows manual control of time advancement, enabling
 * tests to run instantly without relying on actual system delays. This is
 * essential for testing time-sensitive logic like circuit breakers, timeouts,
 * and retry delays in a fast and deterministic manner.
 */
export class ManualTimeProvider implements TimeProvider {
  private currentTime: number;

  /**
   * Creates a new ManualTimeProvider
   * @param startTime Optional starting timestamp (default: 0)
   */
  constructor(startTime: number = 0) {
    this.currentTime = startTime;
  }

  /**
   * Returns the current manually-set timestamp
   * @returns The manually-controlled current timestamp
   */
  now(): number {
    return this.currentTime;
  }

  /**
   * Advances the clock by the specified number of milliseconds
   *
   * This method allows tests to simulate the passage of time without
   * actually waiting. For example, to simulate a 100ms delay that should
   * trigger a circuit breaker transition, call `timeProvider.advance(101)`.
   *
   * @param milliseconds The number of milliseconds to advance
   */
  advance(milliseconds: number): void {
    this.currentTime += milliseconds;
  }

  /**
   * Sets the clock to a specific timestamp
   *
   * This method allows resetting time to a specific point or jumping
   * to a known moment in time for testing specific scenarios.
   *
   * @param timestamp The absolute timestamp to set the clock to
   */
  setTime(timestamp: number): void {
    this.currentTime = timestamp;
  }

  /**
   * Resets the clock back to zero
   *
   * This is useful for resetting state between tests.
   */
  reset(): void {
    this.currentTime = 0;
  }

  /**
   * Gets the current elapsed time since construction (or last reset)
   * @returns The number of milliseconds elapsed
   */
  elapsed(): number {
    return this.currentTime;
  }
}
