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
  ExtensibilityManager,
  SecurityPolicy,
  SandboxContext,
  SandboxInfo,
  SecurityError,
  SecurityWarning,
  SecurityValidationResult,
  SecuritySandbox,
  PluginListing,
  InstalledPlugin,
  PluginVersion,
  SearchFilters,
  Category,
  PluginReview,
  InstallResult,
  UpdateResult,
  PluginMarketplace,
  AdvancedTemplate,
  ValidationRule,
  TemplateHook,
  TemplateHelper,
  TemplateFilter,
  TemplatePartial,
  TemplateInclude,
  TemplateMetadata,
  SecurityMetrics,
  CompiledTemplate,
  CompiledFile,
  CompiledMetadata,
  TemplatePreview,
  PreviewFile,
  PreviewMetadata,
  AdvancedTemplateEngine,
  GitHubRepository,
  GitHubRepositoryInfo,
  GitHubValidationResult,
  GitHubRelease,
  GitHubTag,
  GitHubInstallResult,
  GitHubInstallMetadata,
  GitHubInstalledPlugin,
  GitHubCommit,
  GitHubCommitAuthor,
  GitHubTree,
  GitHubCommitParent,
  GitHubVerification,
  GitHubInstaller,
  PerformanceOptimizer,
  OptimizedTemplate,
  OptimizedPlugin,
  Optimization,
  Cache,
  CacheStats,
  CachePolicy,
  Resource,
  Bundle,
  OptimizedBundle,
  Dependency,
  OptimizedDependency,
  ProfilingData,
  FunctionProfile,
  Metrics,
  OperationMetric,
  ErrorMetric,
  WarningMetric
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
export { CortexSecuritySandbox } from './securitySandbox.js';
export { CortexPluginMarketplace } from './pluginMarketplace.js';
export { CortexAdvancedTemplateEngine } from './advancedTemplateEngine.js';
export { CortexGitHubInstaller } from './githubInstaller.js';
export { CortexPerformanceOptimizer } from './performanceOptimizer.js';