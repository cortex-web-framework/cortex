/**
 * CLI Extensibility Types
 * Zero dependencies, strictest TypeScript configuration
 */

import type { CLICommand, CLIOption } from '../types.js';

// Re-export CLI types for extensibility system
export type { CLICommand, CLIOption };

/**
 * Plugin Context
 */
export interface PluginContext {
  readonly pluginName: string;
  readonly pluginVersion: string;
  readonly cliVersion: string;
  readonly workingDirectory: string;
  readonly config: Record<string, unknown>;
  readonly logger: PluginLogger;
}

/**
 * Plugin Logger
 */
export interface PluginLogger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

/**
 * Plugin Configuration
 */
export interface PluginConfig {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly author: string;
  readonly license?: string;
  readonly homepage?: string;
  readonly repository?: string;
  readonly bugs?: string;
  readonly keywords?: readonly string[];
  readonly dependencies?: readonly string[];
  readonly peerDependencies?: readonly string[];
  readonly engines?: Record<string, string>;
  readonly config?: Record<string, unknown>;
}

/**
 * Core Plugin Interface
 */
export interface CortexPlugin {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly author: string;
  readonly config?: PluginConfig;
  readonly commands?: readonly CLICommand[];
  readonly templates?: readonly Template[];
  readonly hooks?: readonly Hook[];
  
  install?(context: PluginContext): Promise<void>;
  uninstall?(context: PluginContext): Promise<void>;
  activate?(context: PluginContext): Promise<void>;
  deactivate?(context: PluginContext): Promise<void>;
}

/**
 * Template File
 */
export interface TemplateFile {
  readonly path: string;
  readonly content: string | TemplateContentFunction;
  readonly permissions?: number;
  readonly executable?: boolean;
}

/**
 * Template Content Function
 */
export type TemplateContentFunction = (context: TemplateContext) => string | Promise<string>;

/**
 * Template Context
 */
export interface TemplateContext {
  readonly templateName: string;
  readonly templateVersion: string;
  readonly variables: Record<string, unknown>;
  readonly workingDirectory: string;
  readonly logger: PluginLogger;
}

/**
 * Template Configuration
 */
export interface TemplateConfig {
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly author: string;
  readonly tags: readonly string[];
  readonly variables: readonly TemplateVariable[];
  readonly dependencies?: readonly string[];
  readonly engines?: Record<string, string>;
}

/**
 * Template Variable
 */
export interface TemplateVariable {
  readonly name: string;
  readonly description: string;
  readonly type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  readonly required: boolean;
  readonly default?: unknown;
  readonly validation?: (value: unknown) => boolean;
  readonly prompt?: string;
}

/**
 * Template Interface
 */
export interface Template {
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly author: string;
  readonly tags: readonly string[];
  readonly files: readonly TemplateFile[];
  readonly config: TemplateConfig;
  readonly dependencies?: readonly string[];
  
  generate(context: TemplateContext): Promise<void>;
  validate?(context: TemplateContext): Promise<ValidationResult>;
}

/**
 * Hook Context
 */
export interface HookContext {
  readonly hookName: string;
  readonly event: string;
  readonly command?: string;
  readonly args?: readonly string[];
  readonly options?: Record<string, unknown>;
  readonly workingDirectory: string;
  readonly logger: PluginLogger;
  readonly data: Record<string, unknown>;
}

/**
 * Hook Interface
 */
export interface Hook {
  readonly name: string;
  readonly event: string;
  readonly priority: number;
  readonly handler: (context: HookContext) => Promise<void>;
  readonly condition?: (context: HookContext) => boolean;
}

/**
 * Validation Result
 */
export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ValidationError[];
  readonly warnings: readonly ValidationWarning[];
}

/**
 * Validation Error
 */
export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly code: string;
}

/**
 * Validation Warning
 */
export interface ValidationWarning {
  readonly field: string;
  readonly message: string;
  readonly code: string;
}

/**
 * Plugin Registry Interface
 */
export interface PluginRegistry {
  register(plugin: CortexPlugin): void;
  unregister(pluginName: string): void;
  get(pluginName: string): CortexPlugin | undefined;
  list(): readonly CortexPlugin[];
  search(query: string): readonly CortexPlugin[];
  isRegistered(pluginName: string): boolean;
}

/**
 * Template Registry Interface
 */
export interface TemplateRegistry {
  register(template: Template): void;
  unregister(templateName: string): void;
  get(templateName: string): Template | undefined;
  list(): readonly Template[];
  search(query: string): readonly Template[];
  isRegistered(templateName: string): boolean;
}

/**
 * Hook Registry Interface
 */
export interface HookRegistry {
  register(hook: Hook): void;
  unregister(hookName: string): void;
  emit(event: string, context: HookContext): Promise<void>;
  list(event?: string): readonly Hook[];
  isRegistered(hookName: string): boolean;
}

/**
 * Command Discovery Interface
 */
export interface CommandDiscovery {
  discoverCommands(directory: string): Promise<readonly CLICommand[]>;
  loadCommand(modulePath: string): Promise<CLICommand>;
  validateCommand(command: CLICommand): ValidationResult;
}

/**
 * Command Composer Interface
 */
export interface CommandComposer {
  compose(baseCommand: CLICommand, extensions: readonly CommandExtension[]): CLICommand;
  mergeOptions(options: readonly CLIOption[]): readonly CLIOption[];
  mergeSubcommands(subcommands: readonly CLICommand[]): readonly CLICommand[];
}

/**
 * Command Extension
 */
export interface CommandExtension {
  readonly name: string;
  readonly type: 'option' | 'subcommand' | 'action';
  readonly data: CLIOption | CLICommand | ((args: string[], options: Record<string, unknown>) => Promise<void>);
}

/**
 * Plugin Loader Interface
 */
export interface PluginLoader {
  loadPlugin(pluginPath: string): Promise<CortexPlugin>;
  loadPlugins(directory: string): Promise<readonly CortexPlugin[]>;
  validatePlugin(plugin: CortexPlugin): ValidationResult;
}

/**
 * Template Engine Interface
 */
export interface TemplateEngine {
  renderTemplate(template: Template, context: TemplateContext): Promise<void>;
  renderFile(file: TemplateFile, context: TemplateContext): Promise<string>;
  validateTemplate(template: Template): ValidationResult;
}

/**
 * Extensibility Manager Interface
 */
export interface ExtensibilityManager {
  readonly plugins: PluginRegistry;
  readonly templates: TemplateRegistry;
  readonly hooks: HookRegistry;
  readonly commandDiscovery: CommandDiscovery;
  readonly commandComposer: CommandComposer;
  readonly pluginLoader: PluginLoader;
  readonly templateEngine: TemplateEngine;
  
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  reload(): Promise<void>;
}