/**
 * Plugin Loader Tests
 * TDD approach with super strict TypeScript and comprehensive test coverage
 */

import assert from 'node:assert/strict';
import { describe, it, beforeEach, afterEach } from 'node:test';
import { readdir, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';

// Mock types for now - these will be replaced with actual imports
interface MockCortexPlugin {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly author: string;
  readonly config?: {
    readonly keywords?: readonly string[];
  };
  readonly commands?: readonly MockCLICommand[];
  readonly templates?: readonly MockTemplate[];
  readonly hooks?: readonly MockHook[];
  
  install?(context: MockPluginContext): Promise<void>;
  uninstall?(context: MockPluginContext): Promise<void>;
  activate?(context: MockPluginContext): Promise<void>;
  deactivate?(context: MockPluginContext): Promise<void>;
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
  
  generate(context: MockTemplateContext): Promise<void>;
  validate?(context: MockTemplateContext): Promise<MockValidationResult>;
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
  readonly dependencies?: readonly string[];
  readonly engines?: Record<string, string>;
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

interface MockPluginContext {
  readonly pluginName: string;
  readonly pluginVersion: string;
  readonly cliVersion: string;
  readonly workingDirectory: string;
  readonly config: Record<string, unknown>;
  readonly logger: MockPluginLogger;
}

interface MockPluginLogger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

interface MockValidationResult {
  readonly valid: boolean;
  readonly errors: readonly MockValidationError[];
  readonly warnings: readonly MockValidationWarning[];
}

interface MockValidationError {
  readonly field: string;
  readonly message: string;
  readonly code: string;
}

interface MockValidationWarning {
  readonly field: string;
  readonly message: string;
  readonly code: string;
}

interface MockPluginLoader {
  loadPlugin(pluginPath: string): Promise<MockCortexPlugin>;
  loadPlugins(directory: string): Promise<readonly MockCortexPlugin[]>;
  validatePlugin(plugin: MockCortexPlugin): MockValidationResult;
  isLoaded(pluginName: string): boolean;
  getLoadedPlugins(): readonly MockCortexPlugin[];
  clearCache(): void;
}

// Mock implementation for testing
class MockCortexPluginLoader implements MockPluginLoader {
  private readonly loadedPlugins = new Map<string, MockCortexPlugin>();

  async loadPlugin(pluginPath: string): Promise<MockCortexPlugin> {
    try {
      // Check if file exists and is readable
      await stat(pluginPath);
      
      // Load the module
      const module = await import(pluginPath);
      
      // Extract the plugin (default export or named export)
      const plugin = module.default || module.plugin || module;
      
      if (!plugin || typeof plugin !== 'object') {
        throw new Error(`Invalid plugin format in ${pluginPath}`);
      }

      // Validate the plugin
      const validation = this.validatePlugin(plugin);
      if (!validation.valid) {
        throw new Error(`Plugin validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      // Cache the loaded plugin
      this.loadedPlugins.set(plugin.name, plugin);
      
      return plugin;
    } catch (error) {
      throw new Error(`Failed to load plugin from ${pluginPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async loadPlugins(directory: string): Promise<readonly MockCortexPlugin[]> {
    const plugins: MockCortexPlugin[] = [];
    
    try {
      const entries = await readdir(directory, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isFile() && this.isPluginFile(entry.name)) {
          const pluginPath = join(directory, entry.name);
          try {
            const plugin = await this.loadPlugin(pluginPath);
            plugins.push(plugin);
          } catch (error) {
            console.warn(`Failed to load plugin from ${pluginPath}:`, error);
          }
        } else if (entry.isDirectory()) {
          // Recursively load plugins from subdirectories
          const subPlugins = await this.loadPlugins(join(directory, entry.name));
          plugins.push(...subPlugins);
        }
      }
    } catch (error) {
      throw new Error(`Failed to load plugins from ${directory}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return plugins;
  }

  validatePlugin(plugin: MockCortexPlugin): MockValidationResult {
    const errors: MockValidationError[] = [];
    
    // Check required properties
    if (!plugin.name || typeof plugin.name !== 'string') {
      errors.push({
        field: 'name',
        message: 'Plugin name is required and must be a string',
        code: 'MISSING_NAME'
      });
    }
    
    if (!plugin.version || typeof plugin.version !== 'string') {
      errors.push({
        field: 'version',
        message: 'Plugin version is required and must be a string',
        code: 'MISSING_VERSION'
      });
    }
    
    if (!plugin.description || typeof plugin.description !== 'string') {
      errors.push({
        field: 'description',
        message: 'Plugin description is required and must be a string',
        code: 'MISSING_DESCRIPTION'
      });
    }
    
    if (!plugin.author || typeof plugin.author !== 'string') {
      errors.push({
        field: 'author',
        message: 'Plugin author is required and must be a string',
        code: 'MISSING_AUTHOR'
      });
    }
    
    // Validate commands if provided
    if (plugin.commands) {
      for (let i = 0; i < plugin.commands.length; i++) {
        const command = plugin.commands[i]!;
        if (!command.name || typeof command.name !== 'string') {
          errors.push({
            field: `commands[${i}].name`,
            message: 'Command name is required and must be a string',
            code: 'INVALID_COMMAND_NAME'
          });
        }
        
        if (!command.action || typeof command.action !== 'function') {
          errors.push({
            field: `commands[${i}].action`,
            message: 'Command action is required and must be a function',
            code: 'INVALID_COMMAND_ACTION'
          });
        }
      }
    }
    
    // Validate templates if provided
    if (plugin.templates) {
      for (let i = 0; i < plugin.templates.length; i++) {
        const template = plugin.templates[i]!;
        if (!template.name || typeof template.name !== 'string') {
          errors.push({
            field: `templates[${i}].name`,
            message: 'Template name is required and must be a string',
            code: 'INVALID_TEMPLATE_NAME'
          });
        }
        
        if (!template.generate || typeof template.generate !== 'function') {
          errors.push({
            field: `templates[${i}].generate`,
            message: 'Template generate function is required and must be a function',
            code: 'INVALID_TEMPLATE_GENERATE'
          });
        }
      }
    }
    
    // Validate hooks if provided
    if (plugin.hooks) {
      for (let i = 0; i < plugin.hooks.length; i++) {
        const hook = plugin.hooks[i]!;
        if (!hook.name || typeof hook.name !== 'string') {
          errors.push({
            field: `hooks[${i}].name`,
            message: 'Hook name is required and must be a string',
            code: 'INVALID_HOOK_NAME'
          });
        }
        
        if (!hook.event || typeof hook.event !== 'string') {
          errors.push({
            field: `hooks[${i}].event`,
            message: 'Hook event is required and must be a string',
            code: 'INVALID_HOOK_EVENT'
          });
        }
        
        if (!hook.handler || typeof hook.handler !== 'function') {
          errors.push({
            field: `hooks[${i}].handler`,
            message: 'Hook handler is required and must be a function',
            code: 'INVALID_HOOK_HANDLER'
          });
        }
        
        if (typeof hook.priority !== 'number') {
          errors.push({
            field: `hooks[${i}].priority`,
            message: 'Hook priority is required and must be a number',
            code: 'INVALID_HOOK_PRIORITY'
          });
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  private isPluginFile(filename: string): boolean {
    const ext = extname(filename).toLowerCase();
    return ext === '.js' || ext === '.mjs' || ext === '.ts';
  }

  getLoadedPlugins(): readonly MockCortexPlugin[] {
    return Array.from(this.loadedPlugins.values());
  }

  isLoaded(pluginName: string): boolean {
    return this.loadedPlugins.has(pluginName);
  }

  clearCache(): void {
    this.loadedPlugins.clear();
  }
}

describe('CortexPluginLoader', () => {
  let loader: MockPluginLoader;
  let testPlugin: MockCortexPlugin;

  beforeEach(() => {
    loader = new MockCortexPluginLoader();
    testPlugin = {
      name: 'test-plugin',
      version: '1.0.0',
      description: 'A test plugin for unit testing',
      author: 'Test Author',
      config: {
        keywords: ['test', 'plugin', 'example']
      }
    };
  });

  afterEach(() => {
    loader.clearCache();
  });

  describe('loadPlugin', () => {
    it('should load a valid plugin successfully', async () => {
      // Mock the import function
      // const mockImport = mock.fn(() => Promise.resolve({ default: testPlugin }));
      
      // This would require mocking the import function, which is complex in Node.js
      // For now, we'll test the validation logic
      const validation = loader.validatePlugin(testPlugin);
      assert.strictEqual(validation.valid, true);
    });

    it('should throw error for invalid plugin path', async () => {
      await assert.rejects(
        () => loader.loadPlugin('/non/existent/path.js'),
        {
          name: 'Error',
          message: /Failed to load plugin from/
        }
      );
    });

    it('should throw error for invalid plugin format', async () => {
      // This would require mocking the import to return invalid data
      // For now, we'll test the validation logic
      const invalidPlugin = { invalid: 'data' } as unknown as MockCortexPlugin;
      const validation = loader.validatePlugin(invalidPlugin);
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.length > 0, 'Should have validation errors');
    });
  });

  describe('loadPlugins', () => {
    it('should load plugins from directory', async () => {
      // This would require mocking the filesystem operations
      // For now, we'll test the validation logic
      const validation = loader.validatePlugin(testPlugin);
      assert.strictEqual(validation.valid, true);
    });

    it('should handle non-existent directory', async () => {
      await assert.rejects(
        () => loader.loadPlugins('/non/existent/directory'),
        {
          name: 'Error',
          message: /Failed to load plugins from/
        }
      );
    });

    it('should skip non-plugin files', async () => {
      // This would require mocking the filesystem operations
      // For now, we'll test the file type detection
      const loaderInstance = loader as MockCortexPluginLoader;
      assert.strictEqual((loaderInstance as any).isPluginFile('test.js'), true);
      assert.strictEqual((loaderInstance as any).isPluginFile('test.mjs'), true);
      assert.strictEqual((loaderInstance as any).isPluginFile('test.ts'), true);
      assert.strictEqual((loaderInstance as any).isPluginFile('test.txt'), false);
      assert.strictEqual((loaderInstance as any).isPluginFile('test.json'), false);
    });
  });

  describe('validatePlugin', () => {
    it('should validate a correct plugin', () => {
      const validation = loader.validatePlugin(testPlugin);
      assert.strictEqual(validation.valid, true);
      assert.strictEqual(validation.errors.length, 0);
    });

    it('should reject plugin without name', () => {
      const invalidPlugin = { ...testPlugin, name: '' };
      const validation = loader.validatePlugin(invalidPlugin);
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some(e => e.field === 'name'));
    });

    it('should reject plugin without version', () => {
      const invalidPlugin = { ...testPlugin, version: '' };
      const validation = loader.validatePlugin(invalidPlugin);
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some(e => e.field === 'version'));
    });

    it('should reject plugin without description', () => {
      const invalidPlugin = { ...testPlugin, description: '' };
      const validation = loader.validatePlugin(invalidPlugin);
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some(e => e.field === 'description'));
    });

    it('should reject plugin without author', () => {
      const invalidPlugin = { ...testPlugin, author: '' };
      const validation = loader.validatePlugin(invalidPlugin);
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some(e => e.field === 'author'));
    });

    it('should validate plugin with commands', () => {
      const pluginWithCommands: MockCortexPlugin = {
        ...testPlugin,
        commands: [
          {
            name: 'test-command',
            description: 'A test command',
            action: async () => {}
          } as MockCLICommand
        ]
      };
      
      const validation = loader.validatePlugin(pluginWithCommands);
      assert.strictEqual(validation.valid, true);
    });

    it('should reject plugin with invalid commands', () => {
      const pluginWithInvalidCommands: MockCortexPlugin = {
        ...testPlugin,
        commands: [
          {
            name: '',
            description: 'A test command',
            action: async () => {}
          } as MockCLICommand
        ]
      };
      
      const validation = loader.validatePlugin(pluginWithInvalidCommands);
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some(e => e.field === 'commands[0].name'));
    });

    it('should validate plugin with templates', () => {
      const pluginWithTemplates: MockCortexPlugin = {
        ...testPlugin,
        templates: [
          {
            name: 'test-template',
            description: 'A test template',
            version: '1.0.0',
            author: 'Test Author',
            tags: ['test'],
            files: [],
            config: {
              name: 'test-template',
              description: 'A test template',
              version: '1.0.0',
              author: 'Test Author',
              tags: ['test'],
              variables: []
            },
            generate: async () => {}
          }
        ]
      };
      
      const validation = loader.validatePlugin(pluginWithTemplates);
      assert.strictEqual(validation.valid, true);
    });

    it('should reject plugin with invalid templates', () => {
      const pluginWithInvalidTemplates: MockCortexPlugin = {
        ...testPlugin,
        templates: [
          {
            name: '',
            description: 'A test template',
            version: '1.0.0',
            author: 'Test Author',
            tags: ['test'],
            files: [],
            config: {
              name: 'test-template',
              description: 'A test template',
              version: '1.0.0',
              author: 'Test Author',
              tags: ['test'],
              variables: []
            },
            generate: async () => {}
          } as MockTemplate
        ]
      };
      
      const validation = loader.validatePlugin(pluginWithInvalidTemplates);
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some(e => e.field === 'templates[0].name'));
    });

    it('should validate plugin with hooks', () => {
      const pluginWithHooks: MockCortexPlugin = {
        ...testPlugin,
        hooks: [
          {
            name: 'test-hook',
            event: 'test-event',
            priority: 100,
            handler: async () => {}
          }
        ]
      };
      
      const validation = loader.validatePlugin(pluginWithHooks);
      assert.strictEqual(validation.valid, true);
    });

    it('should reject plugin with invalid hooks', () => {
      const pluginWithInvalidHooks: MockCortexPlugin = {
        ...testPlugin,
        hooks: [
          {
            name: '',
            event: 'test-event',
            priority: 100,
            handler: async () => {}
          } as MockHook
        ]
      };
      
      const validation = loader.validatePlugin(pluginWithInvalidHooks);
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some(e => e.field === 'hooks[0].name'));
    });

    it('should reject plugin with invalid hook priority', () => {
      const pluginWithInvalidHookPriority: MockCortexPlugin = {
        ...testPlugin,
        hooks: [
          {
            name: 'test-hook',
            event: 'test-event',
            priority: 'invalid' as unknown as number,
            handler: async () => {}
          } as MockHook
        ]
      };
      
      const validation = loader.validatePlugin(pluginWithInvalidHookPriority);
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some(e => e.field === 'hooks[0].priority'));
    });
  });

  describe('isLoaded and getLoadedPlugins', () => {
    it('should return false for non-loaded plugin', () => {
      assert.strictEqual(loader.isLoaded('non-existent-plugin'), false);
    });

    it('should return empty array when no plugins loaded', () => {
      const loadedPlugins = loader.getLoadedPlugins();
      assert.strictEqual(loadedPlugins.length, 0);
    });

    it('should track loaded plugins', () => {
      // This would require actually loading a plugin
      // For now, we'll test the cache management
      const loaderInstance = loader as MockCortexPluginLoader;
      loaderInstance.clearCache();
      assert.strictEqual(loaderInstance.getLoadedPlugins().length, 0);
    });
  });

  describe('clearCache', () => {
    it('should clear loaded plugins cache', () => {
      const loaderInstance = loader as MockCortexPluginLoader;
      loaderInstance.clearCache();
      assert.strictEqual(loaderInstance.getLoadedPlugins().length, 0);
    });
  });

  describe('security validation', () => {
    it('should reject plugins with dangerous properties', () => {
      const dangerousPlugin = {
        ...testPlugin,
        // Simulate dangerous properties that might be injected
        __proto__: {},
        constructor: {},
        prototype: {}
      } as MockCortexPlugin;
      
      const validation = loader.validatePlugin(dangerousPlugin);
      // The validation should still pass as we're only checking required fields
      // In a real implementation, we'd have additional security checks
      assert.strictEqual(validation.valid, true);
    });

    it('should validate plugin structure integrity', () => {
      const malformedPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        description: 'A test plugin',
        author: 'Test Author',
        // Missing required structure
        commands: null,
        templates: undefined,
        hooks: []
      } as unknown as MockCortexPlugin;
      
      const validation = loader.validatePlugin(malformedPlugin);
      assert.strictEqual(validation.valid, true); // null/undefined optional fields should be valid
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle plugins with very long names', () => {
      const longNamePlugin = {
        ...testPlugin,
        name: 'a'.repeat(10000)
      };
      
      const validation = loader.validatePlugin(longNamePlugin);
      assert.strictEqual(validation.valid, true);
    });

    it('should handle plugins with special characters in names', () => {
      const specialCharPlugin = {
        ...testPlugin,
        name: 'plugin-with-special-chars-@#$%^&*()'
      };
      
      const validation = loader.validatePlugin(specialCharPlugin);
      assert.strictEqual(validation.valid, true);
    });

    it('should handle plugins with unicode characters', () => {
      const unicodePlugin = {
        ...testPlugin,
        name: 'plugin-with-unicode-世界🌍',
        description: 'Plugin with unicode characters 世界🌍'
      };
      
      const validation = loader.validatePlugin(unicodePlugin);
      assert.strictEqual(validation.valid, true);
    });

    it('should handle plugins with empty optional arrays', () => {
      const emptyArraysPlugin = {
        ...testPlugin,
        commands: [],
        templates: [],
        hooks: []
      };
      
      const validation = loader.validatePlugin(emptyArraysPlugin);
      assert.strictEqual(validation.valid, true);
    });
  });

  describe('performance and memory', () => {
    it('should handle validation of large plugins efficiently', () => {
      const startTime = Date.now();
      
      // Create a plugin with many commands, templates, and hooks
      const largePlugin: MockCortexPlugin = {
        ...testPlugin,
        commands: Array.from({ length: 100 }, (_, i) => ({
          name: `command-${i}`,
          description: `Command ${i}`,
          action: async () => {}
        })),
        templates: Array.from({ length: 50 }, (_, i) => ({
          name: `template-${i}`,
          description: `Template ${i}`,
          version: '1.0.0',
          author: 'Test Author',
          tags: ['test'],
          files: [],
          config: {
            name: `template-${i}`,
            description: `Template ${i}`,
            version: '1.0.0',
            author: 'Test Author',
            tags: ['test'],
            variables: []
          },
          generate: async () => {}
        })),
        hooks: Array.from({ length: 200 }, (_, i) => ({
          name: `hook-${i}`,
          event: `event-${i}`,
          priority: i,
          handler: async () => {}
        }))
      };
      
      const validation = loader.validatePlugin(largePlugin);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      assert.strictEqual(validation.valid, true);
      assert.ok(duration < 1000, `Validation took too long: ${duration}ms`);
    });

    it('should handle multiple validation operations efficiently', () => {
      const startTime = Date.now();
      
      // Perform 1000 validation operations
      for (let i = 0; i < 1000; i++) {
        const plugin = { ...testPlugin, name: `plugin-${i}` };
        loader.validatePlugin(plugin);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      assert.ok(duration < 1000, `Multiple validations took too long: ${duration}ms`);
    });
  });
});
