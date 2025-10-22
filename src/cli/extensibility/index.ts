/**
 * CLI Extensibility System
 * Zero dependencies, strictest TypeScript configuration
 */

// Export all types
export type {
  PluginContext,
  PluginLogger,
  PluginConfig,
  CortexPlugin,
  TemplateFile,
  TemplateContentFunction,
  TemplateContext,
  TemplateConfig,
  TemplateVariable,
  Template,
  HookContext,
  Hook,
  ValidationResult,
  ValidationError,
  PluginRegistry,
  TemplateRegistry,
  HookRegistry,
  CommandDiscovery,
  CommandComposer,
  CommandExtension,
  PluginLoader,
  TemplateEngine,
  ExtensibilityManager
} from './types.js';

// Export all implementations
export { CortexPluginRegistry } from './pluginRegistry.js';
export { CortexTemplateRegistry } from './templateRegistry.js';
export { CortexHookRegistry } from './hookRegistry.js';
export { CortexPluginLoader } from './pluginLoader.js';
export { CortexTemplateEngine } from './templateEngine.js';
export { CortexCommandDiscovery } from './commandDiscovery.js';
export { CortexCommandComposer } from './commandComposer.js';
export { CortexExtensibilityManager } from './extensibilityManager.js';