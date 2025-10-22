/**
 * Zero-dependency process utilities
 * Strictest TypeScript configuration
 */

import { ProcessOps } from '../types.js';
import { execSync, spawn } from 'node:child_process';

/**
 * Process operations implementation using Node.js built-ins
 */
export class NodeProcessOps implements ProcessOps {
  /**
   * Exit process with code
   */
  exit(code: number): never {
    process.exit(code);
  }

  /**
   * Get current working directory
   */
  cwd(): string {
    return process.cwd();
  }

  /**
   * Change working directory
   */
  chdir(path: string): void {
    try {
      process.chdir(path);
    } catch (error) {
      throw new Error(`Failed to change directory to ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get environment variables
   */
  get env(): NodeJS.ProcessEnv {
    return process.env;
  }

  /**
   * Get command line arguments
   */
  get argv(): readonly string[] {
    return process.argv;
  }

  /**
   * Get Node.js version
   */
  get version(): string {
    return process.version;
  }

  /**
   * Get platform
   */
  get platform(): string {
    return process.platform;
  }

  /**
   * Get architecture
   */
  get arch(): string {
    return process.arch;
  }

  /**
   * Get memory usage
   */
  memoryUsage(): NodeJS.MemoryUsage {
    return process.memoryUsage();
  }

  /**
   * Get uptime
   */
  uptime(): number {
    return process.uptime();
  }
}

/**
 * Default process operations instance
 */
export const processOps = new NodeProcessOps();

/**
 * Utility functions for process operations
 */
export const processUtils = {
  /**
   * Check if running in CI environment
   */
  isCI(): boolean {
    return !!(process.env.CI || process.env.CONTINUOUS_INTEGRATION || process.env.BUILD_NUMBER);
  },

  /**
   * Check if running in TTY (interactive terminal)
   */
  isTTY(): boolean {
    return process.stdin.isTTY === true && process.stdout.isTTY === true;
  },

  /**
   * Check if running in development mode
   */
  isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined;
  },

  /**
   * Check if running in production mode
   */
  isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  },

  /**
   * Check if running in test mode
   */
  isTest(): boolean {
    return process.env.NODE_ENV === 'test';
  },

  /**
   * Get environment variable with default
   */
  getEnv(key: string, defaultValue: string = ''): string {
    return process.env[key] ?? defaultValue;
  },

  /**
   * Get boolean environment variable
   */
  getBooleanEnv(key: string, defaultValue: boolean = false): boolean {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true' || value === '1';
  },

  /**
   * Get number environment variable
   */
  getNumberEnv(key: string, defaultValue: number = 0): number {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  },

  /**
   * Get available memory in MB
   */
  getAvailableMemory(): number {
    const memUsage = process.memoryUsage();
    return Math.round(memUsage.heapUsed / 1024 / 1024);
  },

  /**
   * Get total memory in MB
   */
  getTotalMemory(): number {
    const memUsage = process.memoryUsage();
    return Math.round(memUsage.heapTotal / 1024 / 1024);
  },

  /**
   * Get system information
   */
  getSystemInfo(): {
    readonly node: string;
    readonly platform: string;
    readonly arch: string;
    readonly cwd: string;
    readonly memory: NodeJS.MemoryUsage;
    readonly uptime: number;
  } {
    return {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      cwd: process.cwd(),
      memory: process.memoryUsage(),
      uptime: process.uptime(),
    };
  },

  /**
   * Check if command exists in PATH
   */
  commandExists(command: string): boolean {
    try {
      execSync(`which ${command}`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Execute command and return output
   */
  execCommand(command: string, options: { cwd?: string; silent?: boolean } = {}): string {
    try {
      return execSync(command, {
        cwd: options.cwd,
        stdio: options.silent ? 'pipe' : 'inherit',
        encoding: 'utf8',
      });
    } catch (error) {
      throw new Error(`Failed to execute command '${command}': ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Spawn process
   */
  spawnProcess(command: string, args: readonly string[] = [], options: { cwd?: string; stdio?: 'inherit' | 'pipe' } = {}): void {
    try {
      const child = spawn(command, args, {
        cwd: options.cwd,
        stdio: options.stdio || 'inherit',
      });
      
      child.on('error', (error: Error) => {
        throw new Error(`Process error: ${error.message}`);
      });
      
      child.on('exit', (code: number) => {
        if (code !== 0) {
          throw new Error(`Process exited with code ${code}`);
        }
      });
    } catch (error) {
      throw new Error(`Failed to spawn process '${command}': ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Handle process signals
   */
  onSignal(signal: NodeJS.Signals, handler: () => void): void {
    process.on(signal, handler);
  },

  /**
   * Handle uncaught exceptions
   */
  onUncaughtException(handler: (error: Error) => void): void {
    process.on('uncaughtException', handler);
  },

  /**
   * Handle unhandled rejections
   */
  onUnhandledRejection(handler: (reason: unknown) => void): void {
    process.on('unhandledRejection', handler);
  },

  /**
   * Get process ID
   */
  getPID(): number {
    return process.pid;
  },

  /**
   * Get parent process ID
   */
  getPPID(): number | undefined {
    return process.ppid;
  },

  /**
   * Check if process is running as root
   */
  isRoot(): boolean {
    return process.getuid?.() === 0;
  },

  /**
   * Get user ID
   */
  getUID(): number | undefined {
    return process.getuid?.();
  },

  /**
   * Get group ID
   */
  getGID(): number | undefined {
    return process.getgid?.();
  },
} as const;