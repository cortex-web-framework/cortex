import { HealthCheck, HealthCheckResult, HealthStatus } from '../types';

/**
 * Memory usage health check
 */
export class MemoryHealthCheck implements HealthCheck {
  public readonly name = 'memory';

  async check(): Promise<HealthCheckResult> {
    const memUsage = process.memoryUsage();
    const totalMB = memUsage.heapTotal / 1024 / 1024;
    const usedMB = memUsage.heapUsed / 1024 / 1024;
    const usagePercent = (usedMB / totalMB) * 100;

    let status: HealthStatus;
    if (usagePercent > 90) {
      status = HealthStatus.DOWN;
    } else if (usagePercent > 75) {
      status = HealthStatus.DEGRADED;
    } else {
      status = HealthStatus.UP;
    }

    return {
      status,
      message: `Memory usage: ${usagePercent.toFixed(1)}%`,
      timestamp: Date.now(),
      details: {
        heapTotal: totalMB,
        heapUsed: usedMB,
        usagePercent,
        rss: memUsage.rss / 1024 / 1024,
        external: memUsage.external / 1024 / 1024,
      },
    };
  }
}

/**
 * Uptime health check
 */
export class UptimeHealthCheck implements HealthCheck {
  public readonly name = 'uptime';

  async check(): Promise<HealthCheckResult> {
    const uptime = process.uptime();
    const uptimeHours = uptime / 3600;

    return {
      status: HealthStatus.UP,
      message: `Uptime: ${uptimeHours.toFixed(2)} hours`,
      timestamp: Date.now(),
      details: {
        uptimeSeconds: uptime,
        uptimeHours,
        startTime: new Date(Date.now() - uptime * 1000).toISOString(),
      },
    };
  }
}

/**
 * CPU usage health check (simplified)
 */
export class CpuHealthCheck implements HealthCheck {
  public readonly name = 'cpu';

  async check(): Promise<HealthCheckResult> {
    const startUsage = process.cpuUsage();
    
    // Wait a bit to measure CPU usage
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const endUsage = process.cpuUsage(startUsage);
    const cpuPercent = (endUsage.user + endUsage.system) / 1000000; // Convert to seconds

    let status: HealthStatus;
    if (cpuPercent > 80) {
      status = HealthStatus.DOWN;
    } else if (cpuPercent > 60) {
      status = HealthStatus.DEGRADED;
    } else {
      status = HealthStatus.UP;
    }

    return {
      status,
      message: `CPU usage: ${cpuPercent.toFixed(2)}%`,
      timestamp: Date.now(),
      details: {
        cpuPercent,
        userTime: endUsage.user,
        systemTime: endUsage.system,
      },
    };
  }
}

/**
 * Application health check (basic)
 */
export class ApplicationHealthCheck implements HealthCheck {
  public readonly name = 'application';

  async check(): Promise<HealthCheckResult> {
    // Basic application health - can be extended
    const nodeVersion = process.version;
    const platform = process.platform;
    const arch = process.arch;

    return {
      status: HealthStatus.UP,
      message: 'Application is running',
      timestamp: Date.now(),
      details: {
        nodeVersion,
        platform,
        arch,
        pid: process.pid,
      },
    };
  }
}

/**
 * Get all default health checks
 */
export function getDefaultHealthChecks(): HealthCheck[] {
  return [
    new MemoryHealthCheck(),
    new UptimeHealthCheck(),
    new CpuHealthCheck(),
    new ApplicationHealthCheck(),
  ];
}
