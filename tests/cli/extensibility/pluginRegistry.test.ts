/**
 * Plugin Registry Tests
 * TDD approach with super strict TypeScript and comprehensive test coverage
 */

import assert from 'node:assert/strict';
import { describe, it, beforeEach, afterEach } from 'node:test';

// We'll import the actual implementation once we write it
// import { CortexPluginRegistry } from '../../../src/cli/extensibility/pluginRegistry.js';
// import { CortexPlugin } from '../../../src/cli/extensibility/types.js';

// Mock types for now - these will be replaced with actual imports
interface MockCortexPlugin {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly author: string;
  readonly config?: {
    readonly keywords?: readonly string[];
  };
}

interface MockPluginRegistry {
  register(plugin: MockCortexPlugin): void;
  unregister(pluginName: string): void;
  get(pluginName: string): MockCortexPlugin | undefined;
  list(): readonly MockCortexPlugin[];
  search(query: string): readonly MockCortexPlugin[];
  isRegistered(pluginName: string): boolean;
  getCount(): number;
  clear(): void;
  getByTag(tag: string): readonly MockCortexPlugin[];
  getByAuthor(author: string): readonly MockCortexPlugin[];
}

// Mock implementation for testing
class MockCortexPluginRegistry implements MockPluginRegistry {
  private readonly plugins = new Map<string, MockCortexPlugin>();

  register(plugin: MockCortexPlugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin '${plugin.name}' is already registered`);
    }
    this.plugins.set(plugin.name, plugin);
  }

  unregister(pluginName: string): void {
    if (!this.plugins.has(pluginName)) {
      throw new Error(`Plugin '${pluginName}' is not registered`);
    }
    this.plugins.delete(pluginName);
  }

  get(pluginName: string): MockCortexPlugin | undefined {
    return this.plugins.get(pluginName);
  }

  list(): readonly MockCortexPlugin[] {
    return Array.from(this.plugins.values());
  }

  search(query: string): readonly MockCortexPlugin[] {
    const lowercaseQuery = query.toLowerCase();
    return this.list().filter(plugin => 
      plugin.name.toLowerCase().includes(lowercaseQuery) ||
      plugin.description.toLowerCase().includes(lowercaseQuery) ||
      plugin.author.toLowerCase().includes(lowercaseQuery) ||
      (plugin.config?.keywords?.some(keyword => 
        keyword.toLowerCase().includes(lowercaseQuery)
      ) ?? false)
    );
  }

  isRegistered(pluginName: string): boolean {
    return this.plugins.has(pluginName);
  }

  getCount(): number {
    return this.plugins.size;
  }

  clear(): void {
    this.plugins.clear();
  }

  getByTag(tag: string): readonly MockCortexPlugin[] {
    return this.list().filter(plugin => 
      plugin.config?.keywords?.includes(tag) ?? false
    );
  }

  getByAuthor(author: string): readonly MockCortexPlugin[] {
    return this.list().filter(plugin => 
      plugin.author.toLowerCase() === author.toLowerCase()
    );
  }
}

describe('CortexPluginRegistry', () => {
  let registry: MockPluginRegistry;
  let testPlugin: MockCortexPlugin;
  let testPlugin2: MockCortexPlugin;

  beforeEach(() => {
    registry = new MockCortexPluginRegistry();
    testPlugin = {
      name: 'test-plugin',
      version: '1.0.0',
      description: 'A test plugin for unit testing',
      author: 'Test Author',
      config: {
        keywords: ['test', 'plugin', 'example']
      }
    };
    testPlugin2 = {
      name: 'another-plugin',
      version: '2.0.0',
      description: 'Another test plugin',
      author: 'Another Author',
      config: {
        keywords: ['another', 'test', 'plugin']
      }
    };
  });

  afterEach(() => {
    registry.clear();
  });

  describe('register', () => {
    it('should register a plugin successfully', () => {
      registry.register(testPlugin);
      
      assert.strictEqual(registry.getCount(), 1);
      assert.strictEqual(registry.isRegistered('test-plugin'), true);
      assert.deepStrictEqual(registry.get('test-plugin'), testPlugin);
    });

    it('should throw error when registering duplicate plugin', () => {
      registry.register(testPlugin);
      
      assert.throws(
        () => registry.register(testPlugin),
        {
          name: 'Error',
          message: "Plugin 'test-plugin' is already registered"
        }
      );
    });

    it('should register multiple plugins successfully', () => {
      registry.register(testPlugin);
      registry.register(testPlugin2);
      
      assert.strictEqual(registry.getCount(), 2);
      assert.strictEqual(registry.isRegistered('test-plugin'), true);
      assert.strictEqual(registry.isRegistered('another-plugin'), true);
    });

    it('should handle plugins without config', () => {
      const pluginWithoutConfig: MockCortexPlugin = {
        name: 'no-config-plugin',
        version: '1.0.0',
        description: 'Plugin without config',
        author: 'Test Author'
      };
      
      registry.register(pluginWithoutConfig);
      
      assert.strictEqual(registry.getCount(), 1);
      assert.strictEqual(registry.isRegistered('no-config-plugin'), true);
    });
  });

  describe('unregister', () => {
    it('should unregister a plugin successfully', () => {
      registry.register(testPlugin);
      assert.strictEqual(registry.getCount(), 1);
      
      registry.unregister('test-plugin');
      
      assert.strictEqual(registry.getCount(), 0);
      assert.strictEqual(registry.isRegistered('test-plugin'), false);
      assert.strictEqual(registry.get('test-plugin'), undefined);
    });

    it('should throw error when unregistering non-existent plugin', () => {
      assert.throws(
        () => registry.unregister('non-existent-plugin'),
        {
          name: 'Error',
          message: "Plugin 'non-existent-plugin' is not registered"
        }
      );
    });

    it('should unregister correct plugin when multiple are registered', () => {
      registry.register(testPlugin);
      registry.register(testPlugin2);
      assert.strictEqual(registry.getCount(), 2);
      
      registry.unregister('test-plugin');
      
      assert.strictEqual(registry.getCount(), 1);
      assert.strictEqual(registry.isRegistered('test-plugin'), false);
      assert.strictEqual(registry.isRegistered('another-plugin'), true);
    });
  });

  describe('get', () => {
    it('should return undefined for non-existent plugin', () => {
      assert.strictEqual(registry.get('non-existent-plugin'), undefined);
    });

    it('should return correct plugin when registered', () => {
      registry.register(testPlugin);
      
      const retrieved = registry.get('test-plugin');
      assert.deepStrictEqual(retrieved, testPlugin);
    });

    it('should return undefined after unregistering', () => {
      registry.register(testPlugin);
      registry.unregister('test-plugin');
      
      assert.strictEqual(registry.get('test-plugin'), undefined);
    });
  });

  describe('list', () => {
    it('should return empty array when no plugins registered', () => {
      const plugins = registry.list();
      assert.strictEqual(plugins.length, 0);
    });

    it('should return all registered plugins', () => {
      registry.register(testPlugin);
      registry.register(testPlugin2);
      
      const plugins = registry.list();
      assert.strictEqual(plugins.length, 2);
      assert.ok(plugins.includes(testPlugin));
      assert.ok(plugins.includes(testPlugin2));
    });

    it('should return empty array after clearing', () => {
      registry.register(testPlugin);
      registry.register(testPlugin2);
      registry.clear();
      
      const plugins = registry.list();
      assert.strictEqual(plugins.length, 0);
    });
  });

  describe('search', () => {
    beforeEach(() => {
      registry.register(testPlugin);
      registry.register(testPlugin2);
    });

    it('should search by plugin name', () => {
      const results = registry.search('test-plugin');
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0]?.name, 'test-plugin');
    });

    it('should search by description', () => {
      const results = registry.search('unit testing');
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0]?.name, 'test-plugin');
    });

    it('should search by author', () => {
      const results = registry.search('Test Author');
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0]?.name, 'test-plugin');
    });

    it('should search by keywords', () => {
      const results = registry.search('example');
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0]?.name, 'test-plugin');
    });

    it('should be case insensitive', () => {
      const results = registry.search('TEST-PLUGIN');
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0]?.name, 'test-plugin');
    });

    it('should return multiple results for partial matches', () => {
      const results = registry.search('plugin');
      assert.strictEqual(results.length, 2);
    });

    it('should return empty array for no matches', () => {
      const results = registry.search('non-existent');
      assert.strictEqual(results.length, 0);
    });

    it('should handle empty search query', () => {
      const results = registry.search('');
      assert.strictEqual(results.length, 2);
    });
  });

  describe('isRegistered', () => {
    it('should return false for non-existent plugin', () => {
      assert.strictEqual(registry.isRegistered('non-existent-plugin'), false);
    });

    it('should return true for registered plugin', () => {
      registry.register(testPlugin);
      assert.strictEqual(registry.isRegistered('test-plugin'), true);
    });

    it('should return false after unregistering', () => {
      registry.register(testPlugin);
      registry.unregister('test-plugin');
      assert.strictEqual(registry.isRegistered('test-plugin'), false);
    });
  });

  describe('getCount', () => {
    it('should return 0 for empty registry', () => {
      assert.strictEqual(registry.getCount(), 0);
    });

    it('should return correct count after registering plugins', () => {
      registry.register(testPlugin);
      assert.strictEqual(registry.getCount(), 1);
      
      registry.register(testPlugin2);
      assert.strictEqual(registry.getCount(), 2);
    });

    it('should return correct count after unregistering', () => {
      registry.register(testPlugin);
      registry.register(testPlugin2);
      registry.unregister('test-plugin');
      assert.strictEqual(registry.getCount(), 1);
    });
  });

  describe('clear', () => {
    it('should clear empty registry without error', () => {
      assert.doesNotThrow(() => registry.clear());
      assert.strictEqual(registry.getCount(), 0);
    });

    it('should clear all registered plugins', () => {
      registry.register(testPlugin);
      registry.register(testPlugin2);
      assert.strictEqual(registry.getCount(), 2);
      
      registry.clear();
      
      assert.strictEqual(registry.getCount(), 0);
      assert.strictEqual(registry.isRegistered('test-plugin'), false);
      assert.strictEqual(registry.isRegistered('another-plugin'), false);
    });
  });

  describe('getByTag', () => {
    beforeEach(() => {
      registry.register(testPlugin);
      registry.register(testPlugin2);
    });

    it('should return plugins with matching tag', () => {
      const results = registry.getByTag('example');
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0]?.name, 'test-plugin');
    });

    it('should return multiple plugins with same tag', () => {
      const results = registry.getByTag('test');
      assert.strictEqual(results.length, 2);
    });

    it('should return empty array for non-existent tag', () => {
      const results = registry.getByTag('non-existent');
      assert.strictEqual(results.length, 0);
    });

    it('should handle plugins without config', () => {
      const pluginWithoutConfig: MockCortexPlugin = {
        name: 'no-config-plugin',
        version: '1.0.0',
        description: 'Plugin without config',
        author: 'Test Author'
      };
      registry.register(pluginWithoutConfig);
      
      const results = registry.getByTag('any-tag');
      assert.strictEqual(results.length, 0);
    });
  });

  describe('getByAuthor', () => {
    beforeEach(() => {
      registry.register(testPlugin);
      registry.register(testPlugin2);
    });

    it('should return plugins by exact author match', () => {
      const results = registry.getByAuthor('Test Author');
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0]?.name, 'test-plugin');
    });

    it('should be case insensitive', () => {
      const results = registry.getByAuthor('test author');
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0]?.name, 'test-plugin');
    });

    it('should return empty array for non-existent author', () => {
      const results = registry.getByAuthor('Non Existent Author');
      assert.strictEqual(results.length, 0);
    });

    it('should return multiple plugins by same author', () => {
      const anotherPlugin: MockCortexPlugin = {
        name: 'third-plugin',
        version: '1.0.0',
        description: 'Third plugin',
        author: 'Test Author'
      };
      registry.register(anotherPlugin);
      
      const results = registry.getByAuthor('Test Author');
      assert.strictEqual(results.length, 2);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null/undefined plugin properties gracefully', () => {
      const invalidPlugin: MockCortexPlugin = {
        name: 'invalid-plugin',
        version: '1.0.0',
        description: 'Invalid plugin',
        author: 'Test Author',
        config: {}
      };
      
      registry.register(invalidPlugin);
      assert.strictEqual(registry.getCount(), 1);
    });

    it('should handle empty strings in search', () => {
      registry.register(testPlugin);
      const results = registry.search('');
      assert.strictEqual(results.length, 1);
    });

    it('should handle special characters in search', () => {
      registry.register(testPlugin);
      const results = registry.search('test-plugin@#$%');
      assert.strictEqual(results.length, 0);
    });

    it('should handle very long search queries', () => {
      registry.register(testPlugin);
      const longQuery = 'a'.repeat(10000);
      const results = registry.search(longQuery);
      assert.strictEqual(results.length, 0);
    });
  });

  describe('performance and memory', () => {
    it('should handle large number of plugins efficiently', () => {
      const startTime = Date.now();
      
      // Register 1000 plugins
      for (let i = 0; i < 1000; i++) {
        const plugin: MockCortexPlugin = {
          name: `plugin-${i}`,
          version: '1.0.0',
          description: `Plugin number ${i}`,
          author: `Author ${i}`,
          config: {
            keywords: [`tag${i}`, 'common']
          }
        };
        registry.register(plugin);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      assert.strictEqual(registry.getCount(), 1000);
      assert.ok(duration < 1000, `Registration took too long: ${duration}ms`);
    });

    it('should handle frequent search operations efficiently', () => {
      // Register plugins
      for (let i = 0; i < 100; i++) {
        const plugin: MockCortexPlugin = {
          name: `plugin-${i}`,
          version: '1.0.0',
          description: `Plugin number ${i}`,
          author: `Author ${i}`,
          config: {
            keywords: [`tag${i}`, 'common']
          }
        };
        registry.register(plugin);
      }
      
      const startTime = Date.now();
      
      // Perform 1000 search operations
      for (let i = 0; i < 1000; i++) {
        registry.search(`tag${i % 100}`);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      assert.ok(duration < 1000, `Search operations took too long: ${duration}ms`);
    });
  });
});