/**
 * Plugin Registry Implementation
 * Zero dependencies, strictest TypeScript configuration
 */

import type { CortexPlugin, PluginRegistry } from './types.js';

/**
 * Plugin Registry Implementation
 */
export class CortexPluginRegistry implements PluginRegistry {
  private readonly plugins = new Map<string, CortexPlugin>();

  /**
   * Register a plugin
   */
  register(plugin: CortexPlugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin '${plugin.name}' is already registered`);
    }
    
    this.plugins.set(plugin.name, plugin);
  }

  /**
   * Unregister a plugin
   */
  unregister(pluginName: string): void {
    if (!this.plugins.has(pluginName)) {
      throw new Error(`Plugin '${pluginName}' is not registered`);
    }
    
    this.plugins.delete(pluginName);
  }

  /**
   * Get a plugin by name
   */
  get(pluginName: string): CortexPlugin | undefined {
    return this.plugins.get(pluginName);
  }

  /**
   * List all registered plugins
   */
  list(): readonly CortexPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Search plugins by query
   */
  search(query: string): readonly CortexPlugin[] {
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

  /**
   * Check if a plugin is registered
   */
  isRegistered(pluginName: string): boolean {
    return this.plugins.has(pluginName);
  }

  /**
   * Get plugin count
   */
  getCount(): number {
    return this.plugins.size;
  }

  /**
   * Clear all plugins
   */
  clear(): void {
    this.plugins.clear();
  }

  /**
   * Get plugins by tag
   */
  getByTag(tag: string): readonly CortexPlugin[] {
    return this.list().filter(plugin => 
      plugin.config?.keywords?.includes(tag) ?? false
    );
  }

  /**
   * Get plugins by author
   */
  getByAuthor(author: string): readonly CortexPlugin[] {
    return this.list().filter(plugin => 
      plugin.author.toLowerCase() === author.toLowerCase()
    );
  }
}