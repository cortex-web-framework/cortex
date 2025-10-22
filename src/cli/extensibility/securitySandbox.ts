/**
 * Security Sandbox Implementation
 * Zero dependencies, strictest TypeScript configuration
 */

import type { 
  SecuritySandbox, 
  SandboxContext, 
  SandboxInfo,
  SecurityValidationResult, 
  SecurityError,
  SecurityWarning,
  CortexPlugin,
  SecurityPolicy
} from './types.js';

/**
 * Security Sandbox Implementation
 */
export class CortexSecuritySandbox implements SecuritySandbox {
  private readonly activeSandboxes = new Map<string, SandboxContext>();
  // private readonly securityPolicies = new Map<string, SecurityPolicy>();

  /**
   * Create a new security sandbox for a plugin
   */
  createSandbox(pluginName: string, permissions: readonly string[]): SandboxContext {
    const sandbox: SandboxContext = {
      pluginName,
      permissions: new Set(permissions),
      isActive: true,
      createdAt: new Date(),
      lastAccessed: new Date(),
      operationCount: 0,
      blockedOperations: []
    };

    this.activeSandboxes.set(pluginName, sandbox);
    return sandbox;
  }

  /**
   * Validate a plugin for security issues
   */
  validatePlugin(plugin: CortexPlugin): SecurityValidationResult {
    const errors: SecurityError[] = [];
    const warnings: SecurityWarning[] = [];
    const recommendations: string[] = [];

    // Check for dangerous operations
    if (plugin.commands) {
      for (const command of plugin.commands) {
        if (this.isDangerousCommand(command.name)) {
          errors.push({
            type: 'DANGEROUS_COMMAND',
            message: `Command '${command.name}' is potentially dangerous`,
            severity: 'HIGH',
            code: 'DANGEROUS_COMMAND'
          });
        }
      }
    }

    // Check for suspicious patterns
    if (plugin.description && this.containsSuspiciousPatterns(plugin.description)) {
      warnings.push({
        type: 'SUSPICIOUS_PATTERN',
        message: 'Plugin description contains suspicious patterns',
        severity: 'MEDIUM',
        code: 'SUSPICIOUS_PATTERN'
      });
    }

    // Check permissions
    if (plugin.permissions) {
      for (const permission of plugin.permissions) {
        if (this.isDangerousPermission(permission)) {
          errors.push({
            type: 'DANGEROUS_PERMISSION',
            message: `Permission '${permission}' is potentially dangerous`,
            severity: 'CRITICAL',
            code: 'DANGEROUS_PERMISSION'
          });
        }
      }
    }

    // Check security policy
    if (plugin.securityPolicy) {
      const policyValidation = this.validateSecurityPolicy(plugin.securityPolicy);
      errors.push(...policyValidation.errors);
      warnings.push(...policyValidation.warnings);
    }

    // Determine risk level
    const riskLevel = this.calculateRiskLevel(errors, warnings);

    // Generate recommendations
    if (errors.length === 0 && warnings.length === 0) {
      recommendations.push('Plugin appears to be secure');
    } else {
      recommendations.push('Review security warnings and errors before installation');
      if (errors.some(e => e.severity === 'CRITICAL')) {
        recommendations.push('CRITICAL: Do not install this plugin');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      riskLevel,
      recommendations
    };
  }

  /**
   * Execute an operation within a sandbox
   */
  executeInSandbox<T>(sandbox: SandboxContext, operation: () => T): T {
    if (!sandbox.isActive) {
      throw new Error('Sandbox is not active');
    }

    // Update sandbox state
    sandbox.lastAccessed = new Date();
    sandbox.operationCount++;

    try {
      return operation();
    } catch (error) {
      sandbox.blockedOperations.push(`Operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Check if a sandbox has a specific permission
   */
  checkPermission(sandbox: SandboxContext, permission: string): boolean {
    return sandbox.permissions.has(permission);
  }

  /**
   * Add a permission to a sandbox
   */
  addPermission(sandbox: SandboxContext, permission: string): void {
    if (this.isDangerousPermission(permission)) {
      throw new Error(`Permission '${permission}' is too dangerous to grant`);
    }
    sandbox.permissions.add(permission);
  }

  /**
   * Remove a permission from a sandbox
   */
  removePermission(sandbox: SandboxContext, permission: string): void {
    sandbox.permissions.delete(permission);
  }

  /**
   * Get comprehensive information about a sandbox
   */
  getSandboxInfo(sandbox: SandboxContext): SandboxInfo {
    return {
      pluginName: sandbox.pluginName,
      permissions: Array.from(sandbox.permissions),
      isActive: sandbox.isActive,
      createdAt: sandbox.createdAt,
      lastAccessed: sandbox.lastAccessed,
      operationCount: sandbox.operationCount,
      blockedOperations: [...sandbox.blockedOperations],
      memoryUsage: this.calculateMemoryUsage(sandbox),
      cpuUsage: this.calculateCpuUsage(sandbox)
    };
  }

  /**
   * Destroy a sandbox and clean up resources
   */
  destroySandbox(sandbox: SandboxContext): void {
    sandbox.isActive = false;
    this.activeSandboxes.delete(sandbox.pluginName);
  }

  /**
   * Check if a command name is potentially dangerous
   */
  private isDangerousCommand(commandName: string): boolean {
    const dangerousCommands = ['rm', 'del', 'format', 'shutdown', 'reboot', 'kill', 'sudo', 'su'];
    return dangerousCommands.some(cmd => commandName.toLowerCase().includes(cmd));
  }

  /**
   * Check if text contains suspicious patterns
   */
  private containsSuspiciousPatterns(text: string): boolean {
    const suspiciousPatterns = [
      /password/i,
      /secret/i,
      /key/i,
      /token/i,
      /credential/i,
      /hack/i,
      /exploit/i,
      /backdoor/i,
      /malware/i,
      /virus/i
    ];
    return suspiciousPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Check if a permission is dangerous
   */
  private isDangerousPermission(permission: string): boolean {
    const dangerousPermissions = [
      'system:admin',
      'system:root',
      'file:delete',
      'file:write',
      'network:all',
      'process:kill',
      'user:impersonate',
      'security:bypass'
    ];
    return dangerousPermissions.includes(permission);
  }

  /**
   * Validate a security policy
   */
  private validateSecurityPolicy(policy: SecurityPolicy): { errors: SecurityError[]; warnings: SecurityWarning[] } {
    const errors: SecurityError[] = [];
    const warnings: SecurityWarning[] = [];

    if (policy.maxMemoryUsage > 1000 * 1024 * 1024) { // 1GB
      warnings.push({
        type: 'HIGH_MEMORY_USAGE',
        message: 'Maximum memory usage is very high',
        severity: 'MEDIUM',
        code: 'HIGH_MEMORY_USAGE'
      });
    }

    if (policy.maxCpuUsage > 80) {
      warnings.push({
        type: 'HIGH_CPU_USAGE',
        message: 'Maximum CPU usage is very high',
        severity: 'MEDIUM',
        code: 'HIGH_CPU_USAGE'
      });
    }

    if (policy.networkAccess && policy.fileSystemAccess) {
      warnings.push({
        type: 'BROAD_ACCESS',
        message: 'Plugin has both network and file system access',
        severity: 'LOW',
        code: 'BROAD_ACCESS'
      });
    }

    return { errors, warnings };
  }

  /**
   * Calculate risk level based on errors and warnings
   */
  private calculateRiskLevel(errors: SecurityError[], warnings: SecurityWarning[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (errors.some(e => e.severity === 'CRITICAL')) return 'CRITICAL';
    if (errors.some(e => e.severity === 'HIGH')) return 'HIGH';
    if (errors.length > 0 || warnings.some(w => w.severity === 'HIGH')) return 'MEDIUM';
    if (warnings.length > 0) return 'LOW';
    return 'LOW';
  }

  /**
   * Calculate memory usage for a sandbox
   */
  private calculateMemoryUsage(sandbox: SandboxContext): number {
    // Mock memory usage calculation
    return sandbox.operationCount * 1024; // 1KB per operation
  }

  /**
   * Calculate CPU usage for a sandbox
   */
  private calculateCpuUsage(sandbox: SandboxContext): number {
    // Mock CPU usage calculation
    return Math.min(sandbox.operationCount * 0.1, 100); // 0.1% per operation, max 100%
  }
}