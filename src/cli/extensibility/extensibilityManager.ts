/**
 * Extensibility Manager Implementation
 * Zero dependencies, strictest TypeScript configuration
 */

import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import type { 
  ExtensibilityManager, 
  PluginContext, 
  HookContext,
  CortexPlugin,
  Template
} from './types.js';
import { CortexPluginRegistry } from './pluginRegistry.js';
import { CortexTemplateRegistry } from './templateRegistry.js';
import { CortexHookRegistry } from './hookRegistry.js';
import { CortexPluginLoader } from './pluginLoader.js';
import { CortexTemplateEngine } from './templateEngine.js';
import { CortexCommandDiscovery } from './commandDiscovery.js';
import { CortexCommandComposer } from './commandComposer.js';

/**
 * Extensibility Manager Implementation
 */
export class CortexExtensibilityManager implements ExtensibilityManager {
  public readonly plugins: CortexPluginRegistry;
  public readonly templates: CortexTemplateRegistry;
  public readonly hooks: CortexHookRegistry;
  public readonly pluginLoader: CortexPluginLoader;
  public readonly templateEngine: CortexTemplateEngine;
  public readonly commandDiscovery: CortexCommandDiscovery;
  public readonly commandComposer: CortexCommandComposer;
  
  private readonly pluginDirectories: string[];
  private readonly templateDirectories: string[];
  private isInitialized = false;

  constructor(
    pluginDirectories: string[] = ['./plugins'],
    templateDirectories: string[] = ['./templates']
  ) {
    this.pluginDirectories = pluginDirectories;
    this.templateDirectories = templateDirectories;
    
    this.plugins = new CortexPluginRegistry();
    this.templates = new CortexTemplateRegistry();
    this.hooks = new CortexHookRegistry();
    this.pluginLoader = new CortexPluginLoader();
    this.templateEngine = new CortexTemplateEngine();
    this.commandDiscovery = new CortexCommandDiscovery();
    this.commandComposer = new CortexCommandComposer();
  }

  /**
   * Initialize the extensibility system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log('Initializing Cortex CLI Extensibility System...');

    // Load plugins from directories
    await this.loadPluginsFromDirectories();
    
    // Load templates from directories
    await this.loadTemplatesFromDirectories();
    
    // Register built-in hooks
    this.registerBuiltInHooks();
    
    // Activate all plugins
    await this.activateAllPlugins();
    
    this.isInitialized = true;
    console.log('Cortex CLI Extensibility System initialized successfully');
  }

  /**
   * Shutdown the extensibility system
   */
  async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    console.log('Shutting down Cortex CLI Extensibility System...');

    // Deactivate all plugins
    await this.deactivateAllPlugins();
    
    // Clear registries
    this.plugins.clear();
    this.templates.clear();
    this.hooks.clear();
    
    this.isInitialized = false;
    console.log('Cortex CLI Extensibility System shut down successfully');
  }

  /**
   * Reload the extensibility system
   */
  async reload(): Promise<void> {
    await this.shutdown();
    await this.initialize();
  }

  /**
   * Load plugins from configured directories
   */
  private async loadPluginsFromDirectories(): Promise<void> {
    for (const directory of this.pluginDirectories) {
      try {
        await stat(directory);
        const plugins = await this.pluginLoader.loadPlugins(directory);
        
        for (const plugin of plugins) {
          this.plugins.register(plugin);
          console.log(`Loaded plugin: ${plugin.name} v${plugin.version}`);
        }
      } catch (error) {
        console.warn(`Failed to load plugins from ${directory}:`, error);
      }
    }
  }

  /**
   * Load templates from configured directories
   */
  private async loadTemplatesFromDirectories(): Promise<void> {
    for (const directory of this.templateDirectories) {
      try {
        await stat(directory);
        const templates = await this.loadTemplatesFromDirectory(directory);
        
        for (const template of templates) {
          this.templates.register(template);
          console.log(`Loaded template: ${template.name} v${template.version}`);
        }
      } catch (error) {
        console.warn(`Failed to load templates from ${directory}:`, error);
      }
    }
  }

  /**
   * Load templates from a specific directory
   */
  private async loadTemplatesFromDirectory(directory: string): Promise<Template[]> {
    const templates: Template[] = [];
    
    try {
      const entries = await readdir(directory, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const templatePath = join(directory, entry.name);
          const template = await this.loadTemplateFromDirectory(templatePath);
          if (template) {
            templates.push(template);
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to load templates from ${directory}:`, error);
    }
    
    return templates;
  }

  /**
   * Load a template from a directory
   */
  private async loadTemplateFromDirectory(templatePath: string): Promise<Template | null> {
    try {
      // Look for template.json or template.js
      const templateConfigPath = join(templatePath, 'template.json');
      const templateModulePath = join(templatePath, 'template.js');
      
      let template: Template;
      
      try {
        // Try to load from JSON config
        const config = await import(templateConfigPath);
        template = config.default || config;
      } catch {
        // Try to load from JS module
        const module = await import(templateModulePath);
        template = module.default || module;
      }
      
      return template;
    } catch (error) {
      console.warn(`Failed to load template from ${templatePath}:`, error);
      return null;
    }
  }

  /**
   * Register built-in hooks
   */
  private registerBuiltInHooks(): void {
    // Pre-command hook
    this.hooks.register({
      name: 'builtin-pre-command',
      event: 'pre-command',
      priority: 100,
      handler: async (context: HookContext) => {
        console.log(`Executing command: ${context.command} with args:`, context.args);
      }
    });

    // Post-command hook
    this.hooks.register({
      name: 'builtin-post-command',
      event: 'post-command',
      priority: 100,
      handler: async (context: HookContext) => {
        console.log(`Command completed: ${context.command}`);
      }
    });

    // Template generation hook
    this.hooks.register({
      name: 'builtin-template-generation',
      event: 'template-generation',
      priority: 100,
      handler: async (context: HookContext) => {
        console.log(`Generating template: ${context.data.templateName}`);
      }
    });
  }

  /**
   * Activate all registered plugins
   */
  private async activateAllPlugins(): Promise<void> {
    for (const plugin of this.plugins.list()) {
      await this.activatePlugin(plugin);
    }
  }

  /**
   * Deactivate all registered plugins
   */
  private async deactivateAllPlugins(): Promise<void> {
    for (const plugin of this.plugins.list()) {
      await this.deactivatePlugin(plugin);
    }
  }

  /**
   * Activate a specific plugin
   */
  private async activatePlugin(plugin: CortexPlugin): Promise<void> {
    try {
      if (plugin.activate) {
        const context = this.createPluginContext(plugin);
        await plugin.activate(context);
      }
      
      // Register plugin commands
      if (plugin.commands) {
        for (const command of plugin.commands) {
          // Commands are registered through the main CLI system
          console.log(`Registered command: ${command.name} from plugin: ${plugin.name}`);
        }
      }
      
      // Register plugin templates
      if (plugin.templates) {
        for (const template of plugin.templates) {
          this.templates.register(template);
        }
      }
      
      // Register plugin hooks
      if (plugin.hooks) {
        for (const hook of plugin.hooks) {
          this.hooks.register(hook);
        }
      }
      
      console.log(`Activated plugin: ${plugin.name}`);
    } catch (error) {
      console.error(`Failed to activate plugin ${plugin.name}:`, error);
    }
  }

  /**
   * Deactivate a specific plugin
   */
  private async deactivatePlugin(plugin: CortexPlugin): Promise<void> {
    try {
      if (plugin.deactivate) {
        const context = this.createPluginContext(plugin);
        await plugin.deactivate(context);
      }
      
      console.log(`Deactivated plugin: ${plugin.name}`);
    } catch (error) {
      console.error(`Failed to deactivate plugin ${plugin.name}:`, error);
    }
  }

  /**
   * Create plugin context
   */
  private createPluginContext(plugin: CortexPlugin): PluginContext {
    return {
      pluginName: plugin.name,
      pluginVersion: plugin.version,
      cliVersion: '1.0.0', // This should come from package.json
      workingDirectory: process.cwd(),
      config: plugin.config?.config || {},
      logger: {
        debug: (message: string, ...args: unknown[]) => console.debug(`[${plugin.name}] ${message}`, ...args),
        info: (message: string, ...args: unknown[]) => console.info(`[${plugin.name}] ${message}`, ...args),
        warn: (message: string, ...args: unknown[]) => console.warn(`[${plugin.name}] ${message}`, ...args),
        error: (message: string, ...args: unknown[]) => console.error(`[${plugin.name}] ${message}`, ...args),
      }
    };
  }

  /**
   * Emit a hook event
   */
  async emitHook(event: string, context: Partial<HookContext>): Promise<void> {
    const fullContext: HookContext = {
      hookName: '',
      event,
      command: context.command,
      args: context.args,
      options: context.options,
      workingDirectory: context.workingDirectory || process.cwd(),
      logger: {
        debug: (message: string, ...args: unknown[]) => console.debug(`[Hook] ${message}`, ...args),
        info: (message: string, ...args: unknown[]) => console.info(`[Hook] ${message}`, ...args),
        warn: (message: string, ...args: unknown[]) => console.warn(`[Hook] ${message}`, ...args),
        error: (message: string, ...args: unknown[]) => console.error(`[Hook] ${message}`, ...args),
      },
      data: context.data || {}
    };
    
    await this.hooks.emit(event, fullContext);
  }
}