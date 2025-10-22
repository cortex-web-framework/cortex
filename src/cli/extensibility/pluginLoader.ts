/**
 * Plugin Loader Implementation
 * Zero dependencies, strictest TypeScript configuration
 */

import { readdir, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import type { 
  CortexPlugin, 
  PluginLoader, 
  ValidationResult, 
  ValidationError 
} from './types.js';

/**
 * Plugin Loader Implementation
 */
export class CortexPluginLoader implements PluginLoader {
  private readonly loadedPlugins = new Map<string, CortexPlugin>();

  /**
   * Load a plugin from a file path
   */
  async loadPlugin(pluginPath: string): Promise<CortexPlugin> {
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

  /**
   * Load all plugins from a directory
   */
  async loadPlugins(directory: string): Promise<readonly CortexPlugin[]> {
    const plugins: CortexPlugin[] = [];
    
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

  /**
   * Validate a plugin
   */
  validatePlugin(plugin: CortexPlugin): ValidationResult {
    const errors: ValidationError[] = [];
    
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
        const command = plugin.commands[i];
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
        const template = plugin.templates[i];
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
        const hook = plugin.hooks[i];
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

  /**
   * Check if a file is a plugin file
   */
  private isPluginFile(filename: string): boolean {
    const ext = extname(filename).toLowerCase();
    return ext === '.js' || ext === '.mjs' || ext === '.ts';
  }

  /**
   * Get loaded plugins
   */
  getLoadedPlugins(): readonly CortexPlugin[] {
    return Array.from(this.loadedPlugins.values());
  }

  /**
   * Check if a plugin is loaded
   */
  isLoaded(pluginName: string): boolean {
    return this.loadedPlugins.has(pluginName);
  }

  /**
   * Clear loaded plugins cache
   */
  clearCache(): void {
    this.loadedPlugins.clear();
  }
}