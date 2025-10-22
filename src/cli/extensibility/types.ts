/**
 * CLI Extensibility Types
 * Zero dependencies, strictest TypeScript configuration
 */

import type { CLICommand, CLIOption } from '../types.js';

// Re-export CLI types for extensibility system
export type { CLICommand, CLIOption };

// Security Sandbox Types
export interface SecurityPolicy {
  readonly allowedOperations: readonly string[];
  readonly blockedOperations: readonly string[];
  readonly maxMemoryUsage: number;
  readonly maxCpuUsage: number;
  readonly maxExecutionTime: number;
  readonly networkAccess: boolean;
  readonly fileSystemAccess: boolean;
  readonly environmentAccess: boolean;
}

export interface SandboxContext {
  readonly pluginName: string;
  readonly permissions: Set<string>;
  isActive: boolean;
  readonly createdAt: Date;
  lastAccessed: Date;
  operationCount: number;
  blockedOperations: string[];
}

export interface SandboxInfo {
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

export interface SecurityError {
  readonly type: string;
  readonly message: string;
  readonly severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  readonly code: string;
}

export interface SecurityWarning {
  readonly type: string;
  readonly message: string;
  readonly severity: 'LOW' | 'MEDIUM' | 'HIGH';
  readonly code: string;
}

export interface SecurityValidationResult {
  readonly valid: boolean;
  readonly errors: readonly SecurityError[];
  readonly warnings: readonly SecurityWarning[];
  readonly riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  readonly recommendations: readonly string[];
}

export interface SecuritySandbox {
  createSandbox(pluginName: string, permissions: readonly string[]): SandboxContext;
  validatePlugin(plugin: CortexPlugin): SecurityValidationResult;
  executeInSandbox<T>(sandbox: SandboxContext, operation: () => T): T;
  checkPermission(sandbox: SandboxContext, permission: string): boolean;
  addPermission(sandbox: SandboxContext, permission: string): void;
  removePermission(sandbox: SandboxContext, permission: string): void;
  getSandboxInfo(sandbox: SandboxContext): SandboxInfo;
  destroySandbox(sandbox: SandboxContext): void;
}

// Plugin Marketplace Types
export interface PluginListing {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly author: string;
  readonly downloads: number;
  readonly rating: number;
  readonly reviewCount: number;
  readonly lastUpdated: Date;
  readonly createdAt: Date;
  readonly categories: readonly string[];
  readonly tags: readonly string[];
  readonly license: string;
  readonly homepage?: string;
  readonly repository?: string;
  readonly documentation?: string;
  readonly isInstalled: boolean;
  readonly isVerified: boolean;
  readonly securityScore: number;
  readonly size: number;
  readonly dependencies: readonly string[];
}

export interface InstalledPlugin {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly installedAt: Date;
  readonly lastUsed: Date;
  readonly isEnabled: boolean;
  readonly updateAvailable: boolean;
  readonly latestVersion: string;
}

export interface PluginVersion {
  readonly version: string;
  readonly releaseDate: Date;
  readonly changelog: string;
  readonly isStable: boolean;
  readonly isPrerelease: boolean;
  readonly downloadCount: number;
}

export interface SearchFilters {
  readonly category?: string;
  readonly tags?: readonly string[];
  readonly minRating?: number;
  readonly maxRating?: number;
  readonly minDownloads?: number;
  readonly maxDownloads?: number;
  readonly isVerified?: boolean;
  readonly isInstalled?: boolean;
  readonly license?: string;
  readonly author?: string;
  readonly sortBy?: 'name' | 'rating' | 'downloads' | 'updated' | 'created';
  readonly sortOrder?: 'asc' | 'desc';
  readonly limit?: number;
  readonly offset?: number;
}

export interface Category {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly pluginCount: number;
  readonly icon?: string;
}

export interface PluginReview {
  readonly id: string;
  readonly pluginId: string;
  readonly author: string;
  readonly rating: number;
  readonly title: string;
  readonly content: string;
  readonly createdAt: Date;
  readonly isVerified: boolean;
  readonly helpful: number;
  readonly notHelpful: number;
}

export interface InstallResult {
  readonly success: boolean;
  readonly pluginId: string;
  readonly version: string;
  readonly installedAt: Date;
  readonly errors?: readonly string[];
  readonly warnings?: readonly string[];
}

export interface UpdateResult {
  readonly success: boolean;
  readonly pluginId: string;
  readonly fromVersion: string;
  readonly toVersion: string;
  readonly updatedAt: Date;
  readonly errors?: readonly string[];
  readonly warnings?: readonly string[];
}

export interface PluginMarketplace {
  searchPlugins(query: string, filters?: SearchFilters): Promise<readonly PluginListing[]>;
  getPlugin(id: string): Promise<PluginListing | null>;
  installPlugin(id: string, version?: string): Promise<InstallResult>;
  uninstallPlugin(id: string): Promise<boolean>;
  getInstalledPlugins(): readonly InstalledPlugin[];
  updatePlugin(id: string): Promise<UpdateResult>;
  getPluginVersions(id: string): Promise<readonly PluginVersion[]>;
  getPopularPlugins(limit?: number): Promise<readonly PluginListing[]>;
  getRecentPlugins(limit?: number): Promise<readonly PluginListing[]>;
  getPluginCategories(): Promise<readonly Category[]>;
  getPluginsByCategory(category: string): Promise<readonly PluginListing[]>;
  ratePlugin(id: string, rating: number, review?: string): Promise<boolean>;
  getPluginReviews(id: string): Promise<readonly PluginReview[]>;
  reportPlugin(id: string, reason: string, description?: string): Promise<boolean>;
}

// Advanced Template Types
export interface AdvancedTemplate {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly author: string;
  readonly files: readonly TemplateFile[];
  readonly config: TemplateConfig;
  readonly variables: readonly TemplateVariable[];
  readonly dependencies: readonly string[];
  readonly hooks: readonly TemplateHook[];
  readonly helpers: readonly TemplateHelper[];
  readonly filters: readonly TemplateFilter[];
  readonly partials: readonly TemplatePartial[];
  readonly includes: readonly TemplateInclude[];
  readonly metadata: TemplateMetadata;
}

export interface TemplateVariable {
  readonly name: string;
  readonly type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'function';
  readonly description: string;
  readonly required: boolean;
  readonly default?: unknown;
  readonly validation?: readonly ValidationRule[];
  readonly options?: readonly unknown[];
  readonly group?: string;
  readonly order?: number;
}

export interface ValidationRule {
  readonly type: 'min' | 'max' | 'pattern' | 'custom' | 'required' | 'type';
  readonly value?: unknown;
  readonly message: string;
  readonly validator?: (value: unknown) => boolean;
}

export interface TemplateHook {
  readonly name: string;
  readonly type: 'pre-render' | 'post-render' | 'pre-validate' | 'post-validate' | 'pre-install' | 'post-install';
  readonly handler: (context: TemplateContext) => void | Promise<void>;
  readonly priority: number;
  readonly async: boolean;
}

export interface TemplateHelper {
  readonly name: string;
  readonly handler: (...args: unknown[]) => string | Promise<string>;
  readonly description: string;
  readonly parameters: readonly HelperParameter[];
  readonly returnType: string;
  readonly async: boolean;
}

export interface HelperParameter {
  readonly name: string;
  readonly type: string;
  readonly required: boolean;
  readonly description: string;
}

export interface TemplateFilter {
  readonly name: string;
  readonly handler: (value: unknown, ...args: unknown[]) => string | Promise<string>;
  readonly description: string;
  readonly parameters: readonly FilterParameter[];
  readonly returnType: string;
  readonly async: boolean;
}

export interface FilterParameter {
  readonly name: string;
  readonly type: string;
  readonly required: boolean;
  readonly description: string;
}

export interface TemplatePartial {
  readonly name: string;
  readonly content: string;
  readonly variables: readonly string[];
  readonly description: string;
}

export interface TemplateInclude {
  readonly name: string;
  readonly path: string;
  readonly variables: readonly string[];
  readonly description: string;
  readonly optional: boolean;
}

export interface TemplateMetadata {
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly size: number;
  readonly fileCount: number;
  readonly complexity: 'low' | 'medium' | 'high';
  readonly performance: PerformanceMetrics;
  readonly security: SecurityMetrics;
}

export interface PerformanceMetrics {
  readonly duration: number;
  readonly memoryUsage: number;
  readonly cpuUsage: number;
  readonly cacheHits: number;
  readonly cacheMisses: number;
  readonly networkRequests: number;
  readonly fileOperations: number;
  readonly timestamp: Date;
}

export interface MemoryUsage {
  readonly used: number;
  readonly total: number;
  readonly available: number;
  readonly percentage: number;
  readonly heapUsed: number;
  readonly heapTotal: number;
  readonly external: number;
  readonly rss: number;
}

export interface SecurityMetrics {
  readonly riskLevel: 'low' | 'medium' | 'high' | 'critical';
  readonly vulnerabilities: readonly string[];
  readonly permissions: readonly string[];
  readonly sandboxRequired: boolean;
}

export interface CompiledTemplate {
  readonly template: AdvancedTemplate;
  readonly compiledFiles: readonly CompiledFile[];
  readonly compiledHelpers: Record<string, (...args: unknown[]) => string | Promise<string>>;
  readonly compiledFilters: Record<string, (value: unknown, ...args: unknown[]) => string | Promise<string>>;
  readonly compiledHooks: Record<string, (context: TemplateContext) => void | Promise<void>>;
  readonly dependencies: readonly string[];
  readonly metadata: CompiledMetadata;
}

export interface CompiledFile {
  readonly path: string;
  readonly compiledContent: string;
  readonly type: 'text' | 'binary' | 'template';
  readonly variables: readonly string[];
  readonly dependencies: readonly string[];
  readonly checksum: string;
}

export interface CompiledMetadata {
  readonly compiledAt: Date;
  readonly compileTime: number;
  readonly size: number;
  readonly optimizationLevel: 'none' | 'basic' | 'advanced' | 'maximum';
  readonly cacheable: boolean;
}

export interface TemplatePreview {
  readonly files: readonly PreviewFile[];
  readonly variables: Record<string, unknown>;
  readonly metadata: PreviewMetadata;
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
}

export interface PreviewFile {
  readonly path: string;
  readonly content: string;
  readonly type: 'text' | 'binary' | 'template';
  readonly size: number;
  readonly preview: string;
}

export interface PreviewMetadata {
  readonly generatedAt: Date;
  readonly fileCount: number;
  readonly totalSize: number;
  readonly complexity: 'low' | 'medium' | 'high';
}

export interface AdvancedTemplateEngine {
  renderTemplate(template: AdvancedTemplate, context: TemplateContext): Promise<void>;
  renderFile(file: TemplateFile, context: TemplateContext): Promise<string>;
  validateTemplate(template: AdvancedTemplate): ValidationResult;
  applyVariables(content: string, variables: Record<string, unknown>): string;
  processConditionals(content: string, variables: Record<string, unknown>): string;
  processLoops(content: string, variables: Record<string, unknown>): string;
  processIncludes(content: string, context: TemplateContext): Promise<string>;
  processPartials(content: string, context: TemplateContext): Promise<string>;
  processHelpers(content: string, context: TemplateContext): Promise<string>;
  processFilters(content: string, context: TemplateContext): Promise<string>;
  extractVariables(content: string): string[];
  validateVariables(template: AdvancedTemplate, variables: Record<string, unknown>): ValidationResult;
  compileTemplate(template: AdvancedTemplate): CompiledTemplate;
  executeCompiledTemplate(compiled: CompiledTemplate, context: TemplateContext): Promise<void>;
  getTemplateDependencies(template: AdvancedTemplate): string[];
  validateTemplateDependencies(template: AdvancedTemplate): ValidationResult;
  processTemplateHooks(template: AdvancedTemplate, context: TemplateContext, hookType: string): Promise<void>;
  generateTemplatePreview(template: AdvancedTemplate, context: TemplateContext): Promise<TemplatePreview>;
}

// GitHub Integration Types
export interface GitHubRepository {
  readonly id: number;
  readonly name: string;
  readonly fullName: string;
  readonly description: string;
  readonly owner: GitHubUser;
  readonly htmlUrl: string;
  readonly cloneUrl: string;
  readonly sshUrl: string;
  readonly defaultBranch: string;
  readonly language: string;
  readonly stargazersCount: number;
  readonly forksCount: number;
  readonly openIssuesCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly pushedAt: Date;
  readonly size: number;
  readonly isPrivate: boolean;
  readonly isFork: boolean;
  readonly isArchived: boolean;
  readonly isDisabled: boolean;
  readonly topics: readonly string[];
  readonly license?: GitHubLicense;
  readonly permissions: GitHubPermissions;
}

export interface GitHubUser {
  readonly id: number;
  readonly login: string;
  readonly name: string;
  readonly email: string;
  readonly avatarUrl: string;
  readonly htmlUrl: string;
  readonly type: 'User' | 'Organization';
  readonly siteAdmin: boolean;
  readonly company?: string;
  readonly blog?: string;
  readonly location?: string;
  readonly bio?: string;
  readonly publicRepos: number;
  readonly publicGists: number;
  readonly followers: number;
  readonly following: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface GitHubLicense {
  readonly key: string;
  readonly name: string;
  readonly spdxId: string;
  readonly url: string;
  readonly nodeId: string;
}

export interface GitHubPermissions {
  readonly admin: boolean;
  readonly maintain: boolean;
  readonly push: boolean;
  readonly triage: boolean;
  readonly pull: boolean;
}

export interface GitHubRelease {
  readonly id: number;
  readonly tagName: string;
  readonly name: string;
  readonly body: string;
  readonly draft: boolean;
  readonly prerelease: boolean;
  readonly createdAt: Date;
  readonly publishedAt: Date;
  readonly author: GitHubUser;
  readonly assets: readonly GitHubAsset[];
  readonly tarballUrl: string;
  readonly zipballUrl: string;
  readonly htmlUrl: string;
}

export interface GitHubAsset {
  readonly id: number;
  readonly name: string;
  readonly label: string;
  readonly contentType: string;
  readonly state: string;
  readonly size: number;
  readonly downloadCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly browserDownloadUrl: string;
}

export interface GitHubInstallResult {
  readonly success: boolean;
  readonly repository: string;
  readonly version: string;
  readonly installedAt: Date;
  readonly pluginId: string;
  readonly errors?: readonly string[];
  readonly warnings?: readonly string[];
  readonly metadata: GitHubInstallMetadata;
}

export interface GitHubInstallMetadata {
  readonly source: 'github';
  readonly repository: string;
  readonly owner: string;
  readonly name: string;
  readonly branch: string;
  readonly commit: string;
  readonly downloadUrl: string;
  readonly size: number;
  readonly license?: string;
  readonly readme?: string;
  readonly packageJson?: Record<string, unknown>;
}

export interface GitHubInstaller {
  parseRepositoryUrl(repository: string): GitHubRepositoryInfo | null;
  validateRepository(repository: string): Promise<GitHubValidationResult>;
  getRepositoryInfo(repository: string): Promise<GitHubRepository | null>;
  getRepositoryReleases(repository: string): Promise<readonly GitHubRelease[]>;
  getRepositoryTags(repository: string): Promise<readonly GitHubTag[]>;
  installFromRepository(repository: string, version?: string): Promise<GitHubInstallResult>;
  installFromRelease(repository: string, release: string): Promise<GitHubInstallResult>;
  installFromTag(repository: string, tag: string): Promise<GitHubInstallResult>;
  installFromBranch(repository: string, branch: string): Promise<GitHubInstallResult>;
  getInstalledFromGitHub(): readonly GitHubInstalledPlugin[];
  updateFromGitHub(pluginId: string): Promise<GitHubInstallResult>;
  uninstallFromGitHub(pluginId: string): Promise<boolean>;
}

export interface GitHubRepositoryInfo {
  readonly owner: string;
  readonly name: string;
  readonly fullName: string;
  readonly url: string;
}

export interface GitHubValidationResult {
  readonly valid: boolean;
  readonly repository: string;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly info?: GitHubRepositoryInfo;
}

export interface GitHubTag {
  readonly name: string;
  readonly commit: GitHubCommit;
  readonly zipballUrl: string;
  readonly tarballUrl: string;
  readonly nodeId: string;
}

export interface GitHubCommit {
  readonly sha: string;
  readonly url: string;
  readonly htmlUrl: string;
  readonly author: GitHubCommitAuthor;
  readonly committer: GitHubCommitAuthor;
  readonly message: string;
  readonly tree: GitHubTree;
  readonly parents: readonly GitHubCommitParent[];
  readonly verification: GitHubVerification;
}

export interface GitHubCommitAuthor {
  readonly name: string;
  readonly email: string;
  readonly date: Date;
}

export interface GitHubTree {
  readonly sha: string;
  readonly url: string;
}

export interface GitHubCommitParent {
  readonly sha: string;
  readonly url: string;
  readonly htmlUrl: string;
}

export interface GitHubVerification {
  readonly verified: boolean;
  readonly reason: string;
  readonly signature?: string;
  readonly payload?: string;
}

export interface GitHubInstalledPlugin {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly repository: string;
  readonly owner: string;
  readonly installedAt: Date;
  readonly lastUpdated: Date;
  readonly isEnabled: boolean;
  readonly updateAvailable: boolean;
  readonly latestVersion: string;
  readonly metadata: GitHubInstallMetadata;
}

// Performance Optimization Types
export interface PerformanceOptimizer {
  optimizeTemplate(template: Template): OptimizedTemplate;
  optimizePlugin(plugin: Plugin): OptimizedPlugin;
  createCache(): Cache;
  getCacheStats(): CacheStats;
  clearCache(): void;
  warmupCache(templates: Template[], plugins: Plugin[]): Promise<void>;
  measurePerformance<T>(operation: () => T): PerformanceMetrics;
  optimizeMemory(): void;
  getMemoryUsage(): MemoryUsage;
  enableLazyLoading(): void;
  disableLazyLoading(): void;
  isLazyLoadingEnabled(): boolean;
  setCachePolicy(policy: CachePolicy): void;
  getCachePolicy(): CachePolicy;
  preloadResources(resources: Resource[]): Promise<void>;
  optimizeBundle(bundle: Bundle): OptimizedBundle;
  compressData(data: string): string;
  decompressData(compressedData: string): string;
  enableCompression(): void;
  disableCompression(): void;
  isCompressionEnabled(): boolean;
  setCompressionLevel(level: number): void;
  getCompressionLevel(): number;
  enableTreeShaking(): void;
  disableTreeShaking(): void;
  isTreeShakingEnabled(): boolean;
  enableCodeSplitting(): void;
  disableCodeSplitting(): void;
  isCodeSplittingEnabled(): boolean;
  optimizeDependencies(dependencies: Dependency[]): OptimizedDependency[];
  enableParallelProcessing(): void;
  disableParallelProcessing(): void;
  isParallelProcessingEnabled(): boolean;
  setMaxConcurrency(concurrency: number): void;
  getMaxConcurrency(): number;
  enableProfiling(): void;
  disableProfiling(): void;
  getProfilingData(): ProfilingData;
  clearProfilingData(): void;
  enableMetrics(): void;
  disableMetrics(): void;
  getMetrics(): Metrics;
  clearMetrics(): void;
  optimizeForProduction(): void;
  optimizeForDevelopment(): void;
  getOptimizationMode(): 'production' | 'development';
  setOptimizationMode(mode: 'production' | 'development'): void;
}

export interface OptimizedTemplate {
  readonly template: Template;
  readonly optimizations: readonly Optimization[];
  readonly performance: PerformanceMetrics;
  readonly size: number;
  readonly loadTime: number;
  readonly renderTime: number;
  readonly memoryUsage: number;
}

export interface OptimizedPlugin {
  readonly plugin: Plugin;
  readonly optimizations: readonly Optimization[];
  readonly performance: PerformanceMetrics;
  readonly size: number;
  readonly loadTime: number;
  readonly memoryUsage: number;
}

export interface Optimization {
  readonly type: 'compression' | 'minification' | 'tree-shaking' | 'lazy-loading' | 'caching' | 'parallel-processing';
  readonly description: string;
  readonly impact: 'low' | 'medium' | 'high';
  readonly applied: boolean;
  readonly savings: number;
}

export interface Cache {
  readonly id: string;
  readonly type: 'memory' | 'disk' | 'redis';
  readonly maxSize: number;
  readonly currentSize: number;
  readonly hitRate: number;
  readonly missRate: number;
  readonly evictionPolicy: 'lru' | 'lfu' | 'fifo' | 'ttl';
  readonly ttl: number;
  set(key: string, value: unknown, ttl?: number): void;
  get(key: string): unknown | null;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
  size(): number;
  keys(): string[];
  values(): unknown[];
  entries(): Array<[string, unknown]>;
  forEach(callback: (value: unknown, key: string) => void): void;
  getStats(): CacheStats;
}

export interface CacheStats {
  readonly hits: number;
  readonly misses: number;
  readonly hitRate: number;
  readonly missRate: number;
  readonly size: number;
  readonly maxSize: number;
  readonly evictions: number;
  readonly memoryUsage: number;
  readonly averageAccessTime: number;
  readonly lastAccessed: Date;
}

export interface CachePolicy {
  readonly maxSize: number;
  readonly ttl: number;
  readonly evictionPolicy: 'lru' | 'lfu' | 'fifo' | 'ttl';
  readonly compressionEnabled: boolean;
  readonly serializationEnabled: boolean;
  readonly lazyLoadingEnabled: boolean;
}

export interface Resource {
  readonly id: string;
  readonly type: 'template' | 'plugin' | 'asset' | 'data';
  readonly size: number;
  readonly priority: number;
  readonly dependencies: readonly string[];
}

export interface Bundle {
  readonly id: string;
  readonly type: 'template' | 'plugin' | 'application';
  readonly files: readonly BundleFile[];
  readonly dependencies: readonly string[];
  readonly size: number;
  readonly metadata: BundleMetadata;
}

export interface BundleFile {
  readonly path: string;
  readonly content: string;
  readonly type: string;
  readonly size: number;
  readonly hash: string;
}

export interface BundleMetadata {
  readonly createdAt: Date;
  readonly version: string;
  readonly author: string;
  readonly description: string;
}

export interface OptimizedBundle {
  readonly bundle: Bundle;
  readonly optimizations: readonly Optimization[];
  readonly size: number;
  readonly originalSize: number;
  readonly compressionRatio: number;
  readonly loadTime: number;
  readonly performance: PerformanceMetrics;
}

export interface Dependency {
  readonly name: string;
  readonly version: string;
  readonly type: 'production' | 'development' | 'peer';
  readonly size: number;
  readonly dependencies: readonly string[];
}

export interface OptimizedDependency {
  readonly dependency: Dependency;
  readonly optimizations: readonly Optimization[];
  readonly size: number;
  readonly originalSize: number;
  readonly loadTime: number;
  readonly memoryUsage: number;
}

export interface ProfilingData {
  functions: readonly FunctionProfile[];
  totalTime: number;
  averageTime: number;
  slowestFunction: string;
  fastestFunction: string;
  callCount: number;
  memoryPeak: number;
}

export interface FunctionProfile {
  readonly name: string;
  readonly calls: number;
  readonly totalTime: number;
  readonly averageTime: number;
  readonly minTime: number;
  readonly maxTime: number;
  readonly memoryUsage: number;
}

export interface Metrics {
  performance: PerformanceMetrics[];
  memory: MemoryUsage[];
  cache: CacheStats[];
  operations: readonly OperationMetric[];
  errors: readonly ErrorMetric[];
  warnings: readonly WarningMetric[];
}

export interface OperationMetric {
  readonly name: string;
  readonly count: number;
  readonly totalTime: number;
  readonly averageTime: number;
  readonly successRate: number;
  readonly lastExecuted: Date;
}

export interface ErrorMetric {
  readonly type: string;
  readonly message: string;
  readonly count: number;
  readonly firstOccurred: Date;
  readonly lastOccurred: Date;
  readonly stackTrace: string;
}

export interface WarningMetric {
  readonly type: string;
  readonly message: string;
  readonly count: number;
  readonly firstOccurred: Date;
  readonly lastOccurred: Date;
}

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
  readonly permissions?: readonly string[];
  readonly securityPolicy?: SecurityPolicy;
  readonly createdAt?: Date;
  
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
  readonly type: 'text' | 'binary' | 'template';
  readonly permissions?: number;
  readonly encoding?: string;
  readonly size?: number;
  readonly checksum?: string;
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
  readonly metadata: Record<string, unknown>;
  readonly options: Record<string, unknown>;
  readonly helpers: Record<string, (...args: unknown[]) => string | Promise<string>>;
  readonly filters: Record<string, (value: unknown, ...args: unknown[]) => string | Promise<string>>;
  readonly partials: Record<string, string>;
  readonly includes: Record<string, string>;
  readonly hooks: Record<string, (context: TemplateContext) => void | Promise<void>>;
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
  readonly type: string;
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