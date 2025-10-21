import { HealthCheck, HealthCheckResult, HealthStatus } from '../types';

/**
 * HealthCheckRegistry manages and executes health checks
 *
 * @example
 * ```typescript
 * const registry = new HealthCheckRegistry();
 * registry.register(new DatabaseHealthCheck());
 * registry.register(new CacheHealthCheck());
 * const results = await registry.checkAll();
 * ```
 */
export class HealthCheckRegistry {
  private checks: Map<string, HealthCheck> = new Map();

  /**
   * Register a health check
   *
   * @param check - HealthCheck instance
   * @throws Error if check with same name already exists
   */
  public register(check: HealthCheck): void {
    if (this.checks.has(check.name)) {
      throw new Error(`Health check '${check.name}' is already registered`);
    }
    this.checks.set(check.name, check);
  }

  /**
   * Unregister a health check
   *
   * @param name - Health check name
   */
  public unregister(name: string): void {
    this.checks.delete(name);
  }

  /**
   * Execute a specific health check
   *
   * @param name - Health check name
   * @returns Health check result
   * @throws Error if check not found
   */
  public async check(name: string): Promise<HealthCheckResult> {
    const check = this.checks.get(name);
    if (!check) {
      throw new Error(`Health check '${name}' not found`);
    }

    try {
      return await check.check();
    } catch (error) {
      return {
        status: HealthStatus.DOWN,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
        details: { error: String(error) },
      };
    }
  }

  /**
   * Execute all health checks
   *
   * @returns Map of check names to results
   */
  public async checkAll(): Promise<Map<string, HealthCheckResult>> {
    const results = new Map<string, HealthCheckResult>();

    const promises = Array.from(this.checks.entries()).map(async ([name, check]) => {
      try {
        const result = await check.check();
        results.set(name, result);
      } catch (error) {
        results.set(name, {
          status: HealthStatus.DOWN,
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now(),
          details: { error: String(error) },
        });
      }
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Get overall health status
   *
   * @returns Overall status (UP if all checks pass, DOWN if any fail, DEGRADED if any degraded)
   */
  public async getOverallStatus(): Promise<HealthStatus> {
    const results = await this.checkAll();

    let hasDown = false;
    let hasDegraded = false;

    for (const result of results.values()) {
      if (result.status === HealthStatus.DOWN) {
        hasDown = true;
      } else if (result.status === HealthStatus.DEGRADED) {
        hasDegraded = true;
      }
    }

    if (hasDown) return HealthStatus.DOWN;
    if (hasDegraded) return HealthStatus.DEGRADED;
    return HealthStatus.UP;
  }

  /**
   * Get all registered health checks
   */
  public getChecks(): HealthCheck[] {
    return Array.from(this.checks.values());
  }

  /**
   * Get health check names
   */
  public getCheckNames(): string[] {
    return Array.from(this.checks.keys());
  }

  /**
   * Clear all health checks
   */
  public clear(): void {
    this.checks.clear();
  }
}
