/**
 * Security Sandbox Tests
 * TDD approach with super strict TypeScript and comprehensive security validation
 */

import assert from 'node:assert/strict';
import { describe, it, beforeEach } from 'node:test';

// Mock types for now - these will be replaced with actual imports
interface MockSecuritySandbox {
  createSandbox(pluginName: string, permissions: readonly string[]): MockSandboxContext;
  validatePlugin(plugin: MockCortexPlugin): MockSecurityValidationResult;
  executeInSandbox<T>(sandbox: MockSandboxContext, operation: () => T): T;
  checkPermission(sandbox: MockSandboxContext, permission: string): boolean;
  addPermission(sandbox: MockSandboxContext, permission: string): void;
  removePermission(sandbox: MockSandboxContext, permission: string): void;
  getSandboxInfo(sandbox: MockSandboxContext): MockSandboxInfo;
  destroySandbox(sandbox: MockSandboxContext): void;
}

interface MockSandboxContext {
  readonly pluginName: string;
  readonly permissions: Set<string>;
  isActive: boolean;
  readonly createdAt: Date;
  lastAccessed: Date;
  operationCount: number;
  readonly blockedOperations: string[];
}

interface MockSandboxInfo {
  readonly pluginName: string;
  readonly permissions: readonly string[];
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly lastAccessed: Date;
  readonly operationCount: number;
  readonly blockedOperations: readonly string[];
  readonly memoryUsage: number;
  readonly cpuUsage: number;
}

interface MockSecurityValidationResult {
  readonly valid: boolean;
  readonly errors: readonly MockSecurityError[];
  readonly warnings: readonly MockSecurityWarning[];
  readonly riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  readonly recommendations: readonly string[];
}

interface MockSecurityError {
  readonly type: string;
  readonly message: string;
  readonly severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  readonly code: string;
}

interface MockSecurityWarning {
  readonly type: string;
  readonly message: string;
  readonly severity: 'LOW' | 'MEDIUM' | 'HIGH';
  readonly code: string;
}

interface MockCortexPlugin {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly author: string;
  readonly permissions?: readonly string[];
  readonly securityPolicy?: MockSecurityPolicy;
  readonly commands?: readonly MockCLICommand[];
  readonly templates?: readonly MockTemplate[];
  readonly hooks?: readonly MockHook[];
}

interface MockSecurityPolicy {
  readonly allowedOperations: readonly string[];
  readonly blockedOperations: readonly string[];
  readonly maxMemoryUsage: number;
  readonly maxCpuUsage: number;
  readonly maxExecutionTime: number;
  readonly networkAccess: boolean;
  readonly fileSystemAccess: boolean;
  readonly environmentAccess: boolean;
}

interface MockCLICommand {
  readonly name: string;
  readonly description: string;
  readonly action: (args: string[], options: Record<string, unknown>) => Promise<void>;
  readonly options?: readonly MockCLIOption[];
  readonly subcommands?: MockCLICommand[];
}

interface MockCLIOption {
  readonly name: string;
  readonly description: string;
  readonly type: 'string' | 'number' | 'boolean' | 'array';
  readonly required?: boolean;
  readonly default?: unknown;
}

interface MockTemplate {
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly author: string;
  readonly tags: readonly string[];
  readonly files: readonly MockTemplateFile[];
  readonly config: MockTemplateConfig;
}

interface MockTemplateFile {
  readonly path: string;
  readonly content: string | ((context: MockTemplateContext) => string | Promise<string>);
  readonly permissions?: number;
  readonly executable?: boolean;
}

interface MockTemplateConfig {
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly author: string;
  readonly tags: readonly string[];
  readonly variables: readonly MockTemplateVariable[];
}

interface MockTemplateVariable {
  readonly name: string;
  readonly description: string;
  readonly type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  readonly required: boolean;
  readonly default?: unknown;
  readonly validation?: (value: unknown) => boolean;
  readonly prompt?: string;
}

interface MockTemplateContext {
  readonly templateName: string;
  readonly templateVersion: string;
  readonly variables: Record<string, unknown>;
  readonly workingDirectory: string;
  readonly logger: MockPluginLogger;
}

interface MockHook {
  readonly name: string;
  readonly event: string;
  readonly priority: number;
  readonly handler: (context: MockHookContext) => Promise<void>;
  readonly condition?: (context: MockHookContext) => boolean;
}

interface MockHookContext {
  readonly hookName: string;
  readonly event: string;
  readonly command?: string;
  readonly args?: readonly string[];
  readonly options?: Record<string, unknown>;
  readonly workingDirectory: string;
  readonly logger: MockPluginLogger;
  readonly data: Record<string, unknown>;
}

interface MockPluginLogger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

// Mock implementation for testing
class MockCortexSecuritySandbox implements MockSecuritySandbox {
  private readonly activeSandboxes = new Map<string, MockSandboxContext>();
  private readonly securityPolicies = new Map<string, MockSecurityPolicy>();

  createSandbox(pluginName: string, permissions: readonly string[]): MockSandboxContext {
    const sandbox: MockSandboxContext = {
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

  validatePlugin(plugin: MockCortexPlugin): MockSecurityValidationResult {
    const errors: MockSecurityError[] = [];
    const warnings: MockSecurityWarning[] = [];
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

  executeInSandbox<T>(sandbox: MockSandboxContext, operation: () => T): T {
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

  checkPermission(sandbox: MockSandboxContext, permission: string): boolean {
    return sandbox.permissions.has(permission);
  }

  addPermission(sandbox: MockSandboxContext, permission: string): void {
    if (this.isDangerousPermission(permission)) {
      throw new Error(`Permission '${permission}' is too dangerous to grant`);
    }
    sandbox.permissions.add(permission);
  }

  removePermission(sandbox: MockSandboxContext, permission: string): void {
    sandbox.permissions.delete(permission);
  }

  getSandboxInfo(sandbox: MockSandboxContext): MockSandboxInfo {
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

  destroySandbox(sandbox: MockSandboxContext): void {
    sandbox.isActive = false;
    this.activeSandboxes.delete(sandbox.pluginName);
  }

  private isDangerousCommand(commandName: string): boolean {
    const dangerousCommands = ['rm', 'del', 'format', 'shutdown', 'reboot', 'kill', 'sudo', 'su'];
    return dangerousCommands.some(cmd => commandName.toLowerCase().includes(cmd));
  }

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

  private validateSecurityPolicy(policy: MockSecurityPolicy): { errors: MockSecurityError[]; warnings: MockSecurityWarning[] } {
    const errors: MockSecurityError[] = [];
    const warnings: MockSecurityWarning[] = [];

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

  private calculateRiskLevel(errors: MockSecurityError[], warnings: MockSecurityWarning[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (errors.some(e => e.severity === 'CRITICAL')) return 'CRITICAL';
    if (errors.some(e => e.severity === 'HIGH')) return 'HIGH';
    if (errors.length > 0 || warnings.some(w => w.severity === 'HIGH')) return 'MEDIUM';
    if (warnings.length > 0) return 'LOW';
    return 'LOW';
  }

  private calculateMemoryUsage(sandbox: MockSandboxContext): number {
    // Mock memory usage calculation
    return sandbox.operationCount * 1024; // 1KB per operation
  }

  private calculateCpuUsage(sandbox: MockSandboxContext): number {
    // Mock CPU usage calculation
    return Math.min(sandbox.operationCount * 0.1, 100); // 0.1% per operation, max 100%
  }

  getSecurityPolicies(): Map<string, MockSecurityPolicy> {
    return this.securityPolicies;
  }
}

describe('CortexSecuritySandbox', () => {
  let sandbox: MockSecuritySandbox;
  let testPlugin: MockCortexPlugin;

  beforeEach(() => {
    sandbox = new MockCortexSecuritySandbox();
    testPlugin = {
      name: 'test-plugin',
      version: '1.0.0',
      description: 'A secure test plugin',
      author: 'Test Author',
      permissions: ['file:read', 'network:http'],
      securityPolicy: {
        allowedOperations: ['read', 'http'],
        blockedOperations: ['delete', 'write'],
        maxMemoryUsage: 50 * 1024 * 1024, // 50MB
        maxCpuUsage: 50,
        maxExecutionTime: 30000, // 30 seconds
        networkAccess: true,
        fileSystemAccess: true,
        environmentAccess: false
      }
    };
  });

  describe('createSandbox', () => {
    it('should create a sandbox with specified permissions', () => {
      const permissions = ['file:read', 'network:http'];
      const sandboxContext = sandbox.createSandbox('test-plugin', permissions);
      
      assert.strictEqual(sandboxContext.pluginName, 'test-plugin');
      assert.strictEqual(sandboxContext.isActive, true);
      assert.strictEqual(sandboxContext.operationCount, 0);
      assert.strictEqual(sandboxContext.permissions.size, 2);
      assert.ok(sandboxContext.permissions.has('file:read'));
      assert.ok(sandboxContext.permissions.has('network:http'));
    });

    it('should create sandbox with empty permissions', () => {
      const sandboxContext = sandbox.createSandbox('minimal-plugin', []);
      
      assert.strictEqual(sandboxContext.pluginName, 'minimal-plugin');
      assert.strictEqual(sandboxContext.permissions.size, 0);
    });

    it('should track sandbox creation time', () => {
      const before = new Date();
      const sandboxContext = sandbox.createSandbox('test-plugin', []);
      const after = new Date();
      
      assert.ok(sandboxContext.createdAt >= before);
      assert.ok(sandboxContext.createdAt <= after);
    });
  });

  describe('validatePlugin', () => {
    it('should validate a secure plugin', () => {
      const validation = sandbox.validatePlugin(testPlugin);
      
      assert.strictEqual(validation.valid, true);
      assert.strictEqual(validation.errors.length, 0);
      assert.strictEqual(validation.riskLevel, 'LOW');
      assert.ok(validation.recommendations.includes('Plugin appears to be secure'));
    });

    it('should detect dangerous commands', () => {
      const dangerousPlugin = {
        ...testPlugin,
        commands: [
          {
            name: 'delete-all-files',
            description: 'Dangerous command',
            action: async () => {}
          } as MockCLICommand
        ]
      };
      
      const validation = sandbox.validatePlugin(dangerousPlugin);
      
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some(e => e.type === 'DANGEROUS_COMMAND'));
      assert.strictEqual(validation.riskLevel, 'HIGH');
    });

    it('should detect suspicious patterns in description', () => {
      const suspiciousPlugin = {
        ...testPlugin,
        description: 'This plugin contains secret passwords and hacking tools'
      };
      
      const validation = sandbox.validatePlugin(suspiciousPlugin);
      
      assert.strictEqual(validation.valid, true); // Still valid, just warnings
      assert.ok(validation.warnings.some(w => w.type === 'SUSPICIOUS_PATTERN'));
      assert.strictEqual(validation.riskLevel, 'LOW');
    });

    it('should detect dangerous permissions', () => {
      const dangerousPermissionPlugin = {
        ...testPlugin,
        permissions: ['system:admin', 'file:delete', 'network:all']
      };
      
      const validation = sandbox.validatePlugin(dangerousPermissionPlugin);
      
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some(e => e.type === 'DANGEROUS_PERMISSION'));
      assert.strictEqual(validation.riskLevel, 'CRITICAL');
    });

    it('should validate security policy', () => {
      const highMemoryPlugin = {
        ...testPlugin,
        securityPolicy: {
          ...testPlugin.securityPolicy!,
          maxMemoryUsage: 2 * 1024 * 1024 * 1024 // 2GB
        }
      };
      
      const validation = sandbox.validatePlugin(highMemoryPlugin);
      
      assert.strictEqual(validation.valid, true);
      assert.ok(validation.warnings.some(w => w.type === 'HIGH_MEMORY_USAGE'));
    });

    it('should calculate risk level correctly', () => {
      const lowRiskPlugin = { ...testPlugin };
      const lowRiskValidation = sandbox.validatePlugin(lowRiskPlugin);
      assert.strictEqual(lowRiskValidation.riskLevel, 'LOW');

      const mediumRiskPlugin = {
        ...testPlugin,
        securityPolicy: {
          ...testPlugin.securityPolicy!,
          maxCpuUsage: 90
        }
      };
      const mediumRiskValidation = sandbox.validatePlugin(mediumRiskPlugin);
      assert.strictEqual(mediumRiskValidation.riskLevel, 'MEDIUM');
    });
  });

  describe('executeInSandbox', () => {
    it('should execute operations in sandbox', () => {
      const sandboxContext = sandbox.createSandbox('test-plugin', ['file:read']);
      
      const result = sandbox.executeInSandbox(sandboxContext, () => {
        return 'Hello from sandbox!';
      });
      
      assert.strictEqual(result, 'Hello from sandbox!');
      assert.strictEqual(sandboxContext.operationCount, 1);
      assert.ok(sandboxContext.lastAccessed > sandboxContext.createdAt);
    });

    it('should track operation count', () => {
      const sandboxContext = sandbox.createSandbox('test-plugin', []);
      
      sandbox.executeInSandbox(sandboxContext, () => 'op1');
      sandbox.executeInSandbox(sandboxContext, () => 'op2');
      sandbox.executeInSandbox(sandboxContext, () => 'op3');
      
      assert.strictEqual(sandboxContext.operationCount, 3);
    });

    it('should handle operation failures', () => {
      const sandboxContext = sandbox.createSandbox('test-plugin', []);
      
      assert.throws(() => {
        sandbox.executeInSandbox(sandboxContext, () => {
          throw new Error('Operation failed');
        });
      }, /Operation failed/);
      
      assert.strictEqual(sandboxContext.blockedOperations.length, 1);
      assert.ok(sandboxContext.blockedOperations[0]?.includes('Operation failed'));
    });

    it('should throw error for inactive sandbox', () => {
      const sandboxContext = sandbox.createSandbox('test-plugin', []);
      sandboxContext.isActive = false;
      
      assert.throws(() => {
        sandbox.executeInSandbox(sandboxContext, () => 'test');
      }, /Sandbox is not active/);
    });
  });

  describe('permission management', () => {
    it('should check permissions correctly', () => {
      const sandboxContext = sandbox.createSandbox('test-plugin', ['file:read', 'network:http']);
      
      assert.strictEqual(sandbox.checkPermission(sandboxContext, 'file:read'), true);
      assert.strictEqual(sandbox.checkPermission(sandboxContext, 'network:http'), true);
      assert.strictEqual(sandbox.checkPermission(sandboxContext, 'file:write'), false);
    });

    it('should add permissions safely', () => {
      const sandboxContext = sandbox.createSandbox('test-plugin', []);
      
      sandbox.addPermission(sandboxContext, 'file:read');
      assert.strictEqual(sandbox.checkPermission(sandboxContext, 'file:read'), true);
    });

    it('should reject dangerous permissions', () => {
      const sandboxContext = sandbox.createSandbox('test-plugin', []);
      
      assert.throws(() => {
        sandbox.addPermission(sandboxContext, 'system:admin');
      }, /Permission 'system:admin' is too dangerous to grant/);
    });

    it('should remove permissions', () => {
      const sandboxContext = sandbox.createSandbox('test-plugin', ['file:read', 'network:http']);
      
      sandbox.removePermission(sandboxContext, 'file:read');
      assert.strictEqual(sandbox.checkPermission(sandboxContext, 'file:read'), false);
      assert.strictEqual(sandbox.checkPermission(sandboxContext, 'network:http'), true);
    });
  });

  describe('getSandboxInfo', () => {
    it('should return comprehensive sandbox information', () => {
      const sandboxContext = sandbox.createSandbox('test-plugin', ['file:read']);
      
      // Execute some operations
      sandbox.executeInSandbox(sandboxContext, () => 'op1');
      sandbox.executeInSandbox(sandboxContext, () => 'op2');
      
      const info = sandbox.getSandboxInfo(sandboxContext);
      
      assert.strictEqual(info.pluginName, 'test-plugin');
      assert.deepStrictEqual(info.permissions, ['file:read']);
      assert.strictEqual(info.isActive, true);
      assert.strictEqual(info.operationCount, 2);
      assert.strictEqual(info.blockedOperations.length, 0);
      assert.strictEqual(typeof info.memoryUsage, 'number');
      assert.strictEqual(typeof info.cpuUsage, 'number');
    });

    it('should track memory and CPU usage', () => {
      const sandboxContext = sandbox.createSandbox('test-plugin', []);
      
      // Execute multiple operations
      for (let i = 0; i < 10; i++) {
        sandbox.executeInSandbox(sandboxContext, () => `op${i}`);
      }
      
      const info = sandbox.getSandboxInfo(sandboxContext);
      
      assert.strictEqual(info.operationCount, 10);
      assert.ok(info.memoryUsage > 0);
      assert.ok(info.cpuUsage > 0);
    });
  });

  describe('destroySandbox', () => {
    it('should deactivate and remove sandbox', () => {
      const sandboxContext = sandbox.createSandbox('test-plugin', []);
      
      assert.strictEqual(sandboxContext.isActive, true);
      
      sandbox.destroySandbox(sandboxContext);
      
      assert.strictEqual(sandboxContext.isActive, false);
    });

    it('should prevent operations on destroyed sandbox', () => {
      const sandboxContext = sandbox.createSandbox('test-plugin', []);
      sandbox.destroySandbox(sandboxContext);
      
      assert.throws(() => {
        sandbox.executeInSandbox(sandboxContext, () => 'test');
      }, /Sandbox is not active/);
    });
  });

  describe('security edge cases', () => {
    it('should handle plugins with no security policy', () => {
      const noPolicyPlugin: MockCortexPlugin = {
        name: 'no-policy-plugin',
        version: '1.0.0',
        description: 'Plugin without security policy',
        author: 'Test Author'
      };
      
      const validation = sandbox.validatePlugin(noPolicyPlugin);
      
      assert.strictEqual(validation.valid, true);
      assert.strictEqual(validation.riskLevel, 'LOW');
    });

    it('should handle plugins with empty permissions', () => {
      const noPermissionsPlugin = {
        ...testPlugin,
        permissions: []
      };
      
      const validation = sandbox.validatePlugin(noPermissionsPlugin);
      
      assert.strictEqual(validation.valid, true);
      assert.strictEqual(validation.riskLevel, 'LOW');
    });

    it('should handle plugins with very long names', () => {
      const longNamePlugin = {
        ...testPlugin,
        name: 'a'.repeat(1000)
      };
      
      const validation = sandbox.validatePlugin(longNamePlugin);
      
      assert.strictEqual(validation.valid, true);
    });

    it('should handle plugins with unicode characters', () => {
      const unicodePlugin = {
        ...testPlugin,
        name: 'plugin-世界-🌍',
        description: 'Plugin with unicode characters 世界🌍'
      };
      
      const validation = sandbox.validatePlugin(unicodePlugin);
      
      assert.strictEqual(validation.valid, true);
    });
  });

  describe('performance and scalability', () => {
    it('should handle multiple sandboxes efficiently', () => {
      const startTime = Date.now();
      
      // Create 100 sandboxes
      const sandboxes = [];
      for (let i = 0; i < 100; i++) {
        const sandboxContext = sandbox.createSandbox(`plugin-${i}`, ['file:read']);
        sandboxes.push(sandboxContext);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      assert.strictEqual(sandboxes.length, 100);
      assert.ok(duration < 1000, `Creating 100 sandboxes took too long: ${duration}ms`);
    });

    it('should handle high-frequency operations efficiently', () => {
      const sandboxContext = sandbox.createSandbox('test-plugin', []);
      const startTime = Date.now();
      
      // Execute 1000 operations
      for (let i = 0; i < 1000; i++) {
        sandbox.executeInSandbox(sandboxContext, () => `op${i}`);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      assert.strictEqual(sandboxContext.operationCount, 1000);
      assert.ok(duration < 1000, `1000 operations took too long: ${duration}ms`);
    });

    it('should handle large permission sets efficiently', () => {
      const largePermissionSet = Array.from({ length: 1000 }, (_, i) => `permission-${i}`);
      const startTime = Date.now();
      
      const sandboxContext = sandbox.createSandbox('test-plugin', largePermissionSet);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      assert.strictEqual(sandboxContext.permissions.size, 1000);
      assert.ok(duration < 1000, `Creating sandbox with 1000 permissions took too long: ${duration}ms`);
    });
  });
});
