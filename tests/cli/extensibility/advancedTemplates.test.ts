/**
 * Advanced Template Features Tests
 * TDD approach with super strict TypeScript and comprehensive template capabilities
 */

import assert from 'node:assert/strict';
import { describe, it, beforeEach, afterEach } from 'node:test';

// Mock types for now - these will be replaced with actual imports
interface MockAdvancedTemplateEngine {
  renderTemplate(template: MockAdvancedTemplate, context: MockTemplateContext): Promise<void>;
  renderFile(file: MockTemplateFile, context: MockTemplateContext): Promise<string>;
  validateTemplate(template: MockAdvancedTemplate): MockValidationResult;
  applyVariables(content: string, variables: Record<string, unknown>): string;
  processConditionals(content: string, variables: Record<string, unknown>): string;
  processLoops(content: string, variables: Record<string, unknown>): string;
  processIncludes(content: string, context: MockTemplateContext): Promise<string>;
  processPartials(content: string, context: MockTemplateContext): Promise<string>;
  processHelpers(content: string, context: MockTemplateContext): Promise<string>;
  processFilters(content: string, context: MockTemplateContext): Promise<string>;
  extractVariables(content: string): string[];
  validateVariables(template: MockAdvancedTemplate, variables: Record<string, unknown>): MockValidationResult;
  compileTemplate(template: MockAdvancedTemplate): MockCompiledTemplate;
  executeCompiledTemplate(compiled: MockCompiledTemplate, context: MockTemplateContext): Promise<void>;
  getTemplateDependencies(template: MockAdvancedTemplate): string[];
  validateTemplateDependencies(template: MockAdvancedTemplate): MockValidationResult;
  processTemplateHooks(template: MockAdvancedTemplate, context: MockTemplateContext, hookType: string): Promise<void>;
  generateTemplatePreview(template: MockAdvancedTemplate, context: MockTemplateContext): Promise<MockTemplatePreview>;
}

interface MockAdvancedTemplate {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly author: string;
  readonly files: readonly MockTemplateFile[];
  readonly config: MockTemplateConfig;
  readonly variables: readonly MockTemplateVariable[];
  readonly dependencies: readonly string[];
  readonly hooks: readonly MockTemplateHook[];
  readonly helpers: readonly MockTemplateHelper[];
  readonly filters: readonly MockTemplateFilter[];
  readonly partials: readonly MockTemplatePartial[];
  readonly includes: readonly MockTemplateInclude[];
  readonly metadata: MockTemplateMetadata;
}

interface MockTemplateFile {
  readonly path: string;
  readonly content: string | MockTemplateContentFunction;
  readonly type: 'text' | 'binary' | 'template';
  readonly permissions?: number;
  readonly encoding?: string;
  readonly size?: number;
  readonly checksum?: string;
}

interface MockTemplateContentFunction {
  (context: MockTemplateContext): string | Promise<string>;
}

interface MockTemplateContext {
  readonly variables: Record<string, unknown>;
  readonly metadata: Record<string, unknown>;
  readonly options: Record<string, unknown>;
  readonly helpers: Record<string, MockHelperFunction>;
  readonly filters: Record<string, MockFilterFunction>;
  readonly partials: Record<string, string>;
  readonly includes: Record<string, string>;
  readonly hooks: Record<string, MockHookFunction>;
}

interface MockTemplateConfig {
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly author: string;
  readonly license: string;
  readonly keywords: readonly string[];
  readonly categories: readonly string[];
  readonly tags: readonly string[];
  readonly minCortexVersion: string;
  readonly maxCortexVersion?: string;
  readonly dependencies: readonly string[];
  readonly peerDependencies: readonly string[];
  readonly devDependencies: readonly string[];
  readonly scripts: Record<string, string>;
  readonly config: Record<string, unknown>;
  readonly metadata: Record<string, unknown>;
}

interface MockTemplateVariable {
  readonly name: string;
  readonly type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'function';
  readonly description: string;
  readonly required: boolean;
  readonly default?: unknown;
  readonly validation?: MockValidationRule[];
  readonly options?: readonly unknown[];
  readonly group?: string;
  readonly order?: number;
}

interface MockValidationRule {
  readonly type: 'min' | 'max' | 'pattern' | 'custom' | 'required' | 'type';
  readonly value?: unknown;
  readonly message: string;
  readonly validator?: (value: unknown) => boolean;
}

interface MockTemplateHook {
  readonly name: string;
  readonly type: 'pre-render' | 'post-render' | 'pre-validate' | 'post-validate' | 'pre-install' | 'post-install';
  readonly handler: MockHookFunction;
  readonly priority: number;
  readonly async: boolean;
}

interface MockTemplateHelper {
  readonly name: string;
  readonly handler: MockHelperFunction;
  readonly description: string;
  readonly parameters: readonly MockHelperParameter[];
  readonly returnType: string;
  readonly async: boolean;
}

interface MockHelperParameter {
  readonly name: string;
  readonly type: string;
  readonly required: boolean;
  readonly description: string;
}

interface MockTemplateFilter {
  readonly name: string;
  readonly handler: MockFilterFunction;
  readonly description: string;
  readonly parameters: readonly MockFilterParameter[];
  readonly returnType: string;
  readonly async: boolean;
}

interface MockFilterParameter {
  readonly name: string;
  readonly type: string;
  readonly required: boolean;
  readonly description: string;
}

interface MockTemplatePartial {
  readonly name: string;
  readonly content: string;
  readonly variables: readonly string[];
  readonly description: string;
}

interface MockTemplateInclude {
  readonly name: string;
  readonly path: string;
  readonly variables: readonly string[];
  readonly description: string;
  readonly optional: boolean;
}

interface MockTemplateMetadata {
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly size: number;
  readonly fileCount: number;
  readonly complexity: 'low' | 'medium' | 'high';
  readonly performance: MockPerformanceMetrics;
  readonly security: MockSecurityMetrics;
}

interface MockPerformanceMetrics {
  readonly renderTime: number;
  readonly memoryUsage: number;
  readonly fileOperations: number;
  readonly cacheHits: number;
  readonly cacheMisses: number;
}

interface MockSecurityMetrics {
  readonly riskLevel: 'low' | 'medium' | 'high' | 'critical';
  readonly vulnerabilities: readonly string[];
  readonly permissions: readonly string[];
  readonly sandboxRequired: boolean;
}

interface MockCompiledTemplate {
  readonly template: MockAdvancedTemplate;
  readonly compiledFiles: readonly MockCompiledFile[];
  readonly compiledHelpers: Record<string, MockHelperFunction>;
  readonly compiledFilters: Record<string, MockFilterFunction>;
  readonly compiledHooks: Record<string, MockHookFunction>;
  readonly dependencies: readonly string[];
  readonly metadata: MockCompiledMetadata;
}

interface MockCompiledFile {
  readonly path: string;
  readonly compiledContent: string;
  readonly type: 'text' | 'binary' | 'template';
  readonly variables: readonly string[];
  readonly dependencies: readonly string[];
  readonly checksum: string;
}

interface MockCompiledMetadata {
  readonly compiledAt: Date;
  readonly compileTime: number;
  readonly size: number;
  readonly optimizationLevel: 'none' | 'basic' | 'advanced' | 'maximum';
  readonly cacheable: boolean;
}

interface MockTemplatePreview {
  readonly files: readonly MockPreviewFile[];
  readonly variables: Record<string, unknown>;
  readonly metadata: MockPreviewMetadata;
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
}

interface MockPreviewFile {
  readonly path: string;
  readonly content: string;
  readonly type: 'text' | 'binary' | 'template';
  readonly size: number;
  readonly preview: string;
}

interface MockPreviewMetadata {
  readonly generatedAt: Date;
  readonly fileCount: number;
  readonly totalSize: number;
  readonly complexity: 'low' | 'medium' | 'high';
}

interface MockValidationResult {
  readonly valid: boolean;
  readonly errors: readonly MockValidationError[];
  readonly warnings: readonly MockValidationWarning[];
}

interface MockValidationError {
  readonly type: string;
  readonly message: string;
  readonly field?: string;
  readonly code: string;
}

interface MockValidationWarning {
  readonly type: string;
  readonly message: string;
  readonly field?: string;
  readonly code: string;
}

type MockHelperFunction = (...args: unknown[]) => string | Promise<string>;
type MockFilterFunction = (value: unknown, ...args: unknown[]) => string | Promise<string>;
type MockHookFunction = (context: MockTemplateContext) => void | Promise<void>;

// Mock implementation for testing
class MockCortexAdvancedTemplateEngine implements MockAdvancedTemplateEngine {
  private readonly compiledTemplates = new Map<string, MockCompiledTemplate>();
  private readonly templateCache = new Map<string, string>();

  async renderTemplate(template: MockAdvancedTemplate, context: MockTemplateContext): Promise<void> {
    // Process template hooks
    await this.processTemplateHooks(template, context, 'pre-render');
    
    // Render each file
    for (const file of template.files) {
      const content = await this.renderFile(file, context);
      // In real implementation, this would write to filesystem
      console.log(`Rendered file: ${file.path}`);
    }
    
    // Process post-render hooks
    await this.processTemplateHooks(template, context, 'post-render');
  }

  async renderFile(file: MockTemplateFile, context: MockTemplateContext): Promise<string> {
    let content: string;
    
    if (typeof file.content === 'function') {
      content = await file.content(context);
    } else {
      content = file.content;
    }
    
    // Apply all processing steps
    content = this.applyVariables(content, context.variables);
    content = this.processConditionals(content, context.variables);
    content = this.processLoops(content, context.variables);
    content = await this.processIncludes(content, context);
    content = await this.processPartials(content, context);
    content = await this.processHelpers(content, context);
    content = await this.processFilters(content, context);
    
    return content;
  }

  validateTemplate(template: MockAdvancedTemplate): MockValidationResult {
    const errors: MockValidationError[] = [];
    const warnings: MockValidationWarning[] = [];

    // Validate required fields
    if (!template.name) {
      errors.push({
        type: 'REQUIRED_FIELD',
        message: 'Template name is required',
        field: 'name',
        code: 'MISSING_NAME'
      });
    }

    if (!template.version) {
      errors.push({
        type: 'REQUIRED_FIELD',
        message: 'Template version is required',
        field: 'version',
        code: 'MISSING_VERSION'
      });
    }

    if (!template.files || template.files.length === 0) {
      errors.push({
        type: 'REQUIRED_FIELD',
        message: 'Template must have at least one file',
        field: 'files',
        code: 'MISSING_FILES'
      });
    }

    // Validate files
    for (const file of template.files) {
      if (!file.path) {
        errors.push({
          type: 'INVALID_FILE',
          message: 'File path is required',
          field: 'files.path',
          code: 'MISSING_FILE_PATH'
        });
      }
    }

    // Validate variables
    for (const variable of template.variables) {
      if (!variable.name) {
        errors.push({
          type: 'INVALID_VARIABLE',
          message: 'Variable name is required',
          field: 'variables.name',
          code: 'MISSING_VARIABLE_NAME'
        });
      }
    }

    // Validate dependencies
    const depValidation = this.validateTemplateDependencies(template);
    errors.push(...depValidation.errors);
    warnings.push(...depValidation.warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  applyVariables(content: string, variables: Record<string, unknown>): string {
    return content.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
      const trimmed = variableName.trim();
      const value = variables[trimmed];
      return value !== undefined ? String(value) : match;
    });
  }

  processConditionals(content: string, variables: Record<string, unknown>): string {
    const conditionalRegex = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    return content.replace(conditionalRegex, (match, condition, body) => {
      const trimmed = condition.trim();
      const value = variables[trimmed];
      return value ? body : '';
    });
  }

  processLoops(content: string, variables: Record<string, unknown>): string {
    const loopRegex = /\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
    return content.replace(loopRegex, (match, arrayName, body) => {
      const trimmed = arrayName.trim();
      const array = variables[trimmed];
      if (Array.isArray(array)) {
        return array.map(item => {
          const itemContext = { ...variables, item };
          return this.applyVariables(body, itemContext);
        }).join('');
      }
      return '';
    });
  }

  async processIncludes(content: string, context: MockTemplateContext): Promise<string> {
    const includeRegex = /\{\{include\s+([^}]+)\}\}/g;
    let processed = content;
    
    const matches = Array.from(content.matchAll(includeRegex));
    for (const match of matches) {
      const includeName = match[1].trim();
      const includeContent = context.includes[includeName] || '';
      processed = processed.replace(match[0], includeContent);
    }
    
    return processed;
  }

  async processPartials(content: string, context: MockTemplateContext): Promise<string> {
    const partialRegex = /\{\{partial\s+([^}]+)\}\}/g;
    let processed = content;
    
    const matches = Array.from(content.matchAll(partialRegex));
    for (const match of matches) {
      const partialName = match[1].trim();
      const partialContent = context.partials[partialName] || '';
      processed = processed.replace(match[0], partialContent);
    }
    
    return processed;
  }

  async processHelpers(content: string, context: MockTemplateContext): Promise<string> {
    const helperRegex = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\s+([^}]+)\}\}/g;
    let processed = content;
    
    const matches = Array.from(content.matchAll(helperRegex));
    for (const match of matches) {
      const helperName = match[1];
      const args = match[2].split(',').map(arg => arg.trim());
      const helper = context.helpers[helperName];
      
      if (helper) {
        const result = await helper(...args);
        processed = processed.replace(match[0], result);
      }
    }
    
    return processed;
  }

  async processFilters(content: string, context: MockTemplateContext): Promise<string> {
    const filterRegex = /\{\{([^|]+)\|\s*([a-zA-Z_][a-zA-Z0-9_]*)(?:\s+([^}]+))?\}\}/g;
    let processed = content;
    
    const matches = Array.from(content.matchAll(filterRegex));
    for (const match of matches) {
      const value = match[1].trim();
      const filterName = match[2];
      const args = match[3] ? match[3].split(',').map(arg => arg.trim()) : [];
      const filter = context.filters[filterName];
      
      if (filter) {
        const result = await filter(value, ...args);
        processed = processed.replace(match[0], result);
      }
    }
    
    return processed;
  }

  extractVariables(content: string): string[] {
    const variables = new Set<string>();
    
    // Extract simple variables
    const variableRegex = /\{\{([^#\/][^}]+)\}\}/g;
    let match;
    while ((match = variableRegex.exec(content)) !== null) {
      const variableName = match[1].trim().split('|')[0].trim();
      if (!variableName.startsWith('if ') && !variableName.startsWith('each ')) {
        variables.add(variableName);
      }
    }
    
    return Array.from(variables);
  }

  validateVariables(template: MockAdvancedTemplate, variables: Record<string, unknown>): MockValidationResult {
    const errors: MockValidationError[] = [];
    const warnings: MockValidationWarning[] = [];

    for (const variable of template.variables) {
      const value = variables[variable.name];
      
      if (variable.required && value === undefined) {
        errors.push({
          type: 'REQUIRED_VARIABLE',
          message: `Variable '${variable.name}' is required`,
          field: variable.name,
          code: 'MISSING_REQUIRED_VARIABLE'
        });
      }
      
      if (value !== undefined && variable.validation) {
        for (const rule of variable.validation) {
          if (!this.validateVariableRule(value, rule)) {
            errors.push({
              type: 'VALIDATION_ERROR',
              message: rule.message,
              field: variable.name,
              code: rule.type.toUpperCase()
            });
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private validateVariableRule(value: unknown, rule: MockValidationRule): boolean {
    switch (rule.type) {
      case 'required':
        return value !== undefined && value !== null && value !== '';
      case 'type':
        return typeof value === rule.value;
      case 'min':
        return typeof value === 'number' && value >= (rule.value as number);
      case 'max':
        return typeof value === 'number' && value <= (rule.value as number);
      case 'pattern':
        return typeof value === 'string' && new RegExp(rule.value as string).test(value);
      case 'custom':
        return rule.validator ? rule.validator(value) : true;
      default:
        return true;
    }
  }

  compileTemplate(template: MockAdvancedTemplate): MockCompiledTemplate {
    const startTime = Date.now();
    
    const compiledFiles: MockCompiledFile[] = template.files.map(file => ({
      path: file.path,
      compiledContent: typeof file.content === 'string' ? file.content : '[COMPILED_FUNCTION]',
      type: file.type,
      variables: this.extractVariables(typeof file.content === 'string' ? file.content : ''),
      dependencies: [],
      checksum: this.calculateChecksum(file.path)
    }));
    
    const compiledHelpers: Record<string, MockHelperFunction> = {};
    for (const helper of template.helpers) {
      compiledHelpers[helper.name] = helper.handler;
    }
    
    const compiledFilters: Record<string, MockFilterFunction> = {};
    for (const filter of template.filters) {
      compiledFilters[filter.name] = filter.handler;
    }
    
    const compiledHooks: Record<string, MockHookFunction> = {};
    for (const hook of template.hooks) {
      compiledHooks[hook.name] = hook.handler;
    }
    
    const dependencies = this.getTemplateDependencies(template);
    
    const compiled: MockCompiledTemplate = {
      template,
      compiledFiles,
      compiledHelpers,
      compiledFilters,
      compiledHooks,
      dependencies,
      metadata: {
        compiledAt: new Date(),
        compileTime: Date.now() - startTime,
        size: compiledFiles.reduce((sum, file) => sum + file.compiledContent.length, 0),
        optimizationLevel: 'basic',
        cacheable: true
      }
    };
    
    this.compiledTemplates.set(template.name, compiled);
    return compiled;
  }

  async executeCompiledTemplate(compiled: MockCompiledTemplate, context: MockTemplateContext): Promise<void> {
    // Execute pre-render hooks
    for (const hook of Object.values(compiled.compiledHooks)) {
      await hook(context);
    }
    
    // Render compiled files
    for (const file of compiled.compiledFiles) {
      let content = file.compiledContent;
      
      // Apply all processing steps
      content = this.applyVariables(content, context.variables);
      content = this.processConditionals(content, context.variables);
      content = this.processLoops(content, context.variables);
      content = await this.processIncludes(content, context);
      content = await this.processPartials(content, context);
      content = await this.processHelpers(content, context);
      content = await this.processFilters(content, context);
      
      // In real implementation, this would write to filesystem
      console.log(`Executed compiled file: ${file.path}`);
    }
  }

  getTemplateDependencies(template: MockAdvancedTemplate): string[] {
    const dependencies = new Set<string>();
    
    // Add explicit dependencies
    for (const dep of template.dependencies) {
      dependencies.add(dep);
    }
    
    // Add helper dependencies
    for (const helper of template.helpers) {
      dependencies.add(`helper:${helper.name}`);
    }
    
    // Add filter dependencies
    for (const filter of template.filters) {
      dependencies.add(`filter:${filter.name}`);
    }
    
    return Array.from(dependencies);
  }

  validateTemplateDependencies(template: MockAdvancedTemplate): MockValidationResult {
    const errors: MockValidationError[] = [];
    const warnings: MockValidationWarning[] = [];

    // Check for circular dependencies
    const visited = new Set<string>();
    const visiting = new Set<string>();
    
    const checkCircular = (dep: string): boolean => {
      if (visiting.has(dep)) return true;
      if (visited.has(dep)) return false;
      
      visiting.add(dep);
      // In real implementation, would check actual dependencies
      visiting.delete(dep);
      visited.add(dep);
      return false;
    };
    
    for (const dep of template.dependencies) {
      if (checkCircular(dep)) {
        errors.push({
          type: 'CIRCULAR_DEPENDENCY',
          message: `Circular dependency detected: ${dep}`,
          field: 'dependencies',
          code: 'CIRCULAR_DEPENDENCY'
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  async processTemplateHooks(template: MockAdvancedTemplate, context: MockTemplateContext, hookType: string): Promise<void> {
    const relevantHooks = template.hooks.filter(hook => hook.type === hookType);
    
    // Sort by priority
    relevantHooks.sort((a, b) => a.priority - b.priority);
    
    for (const hook of relevantHooks) {
      if (hook.async) {
        await hook.handler(context);
      } else {
        hook.handler(context);
      }
    }
  }

  async generateTemplatePreview(template: MockAdvancedTemplate, context: MockTemplateContext): Promise<MockTemplatePreview> {
    const files: MockPreviewFile[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];
    
    try {
      for (const file of template.files) {
        const content = await this.renderFile(file, context);
        const preview = content.length > 200 ? content.substring(0, 200) + '...' : content;
        
        files.push({
          path: file.path,
          content,
          type: file.type,
          size: content.length,
          preview
        });
      }
    } catch (error) {
      errors.push(`Preview generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const complexity = totalSize > 10000 ? 'high' : totalSize > 1000 ? 'medium' : 'low';
    
    return {
      files,
      variables: context.variables,
      metadata: {
        generatedAt: new Date(),
        fileCount: files.length,
        totalSize,
        complexity
      },
      warnings,
      errors
    };
  }

  private calculateChecksum(content: string): string {
    // Simple checksum calculation
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }
}

describe('CortexAdvancedTemplateEngine', () => {
  let engine: MockCortexAdvancedTemplateEngine;

  beforeEach(() => {
    engine = new MockCortexAdvancedTemplateEngine();
  });

  describe('renderTemplate', () => {
    it('should render template with all features', async () => {
      const template: MockAdvancedTemplate = {
        name: 'advanced-template',
        version: '1.0.0',
        description: 'Advanced template with all features',
        author: 'Test Author',
        files: [
          {
            path: 'src/index.ts',
            content: 'Hello {{name}}! {{#if showMessage}}{{message}}{{/if}}',
            type: 'text'
          }
        ],
        config: {
          name: 'advanced-template',
          description: 'Advanced template',
          version: '1.0.0',
          author: 'Test Author',
          license: 'MIT',
          keywords: ['template'],
          categories: ['development'],
          tags: ['typescript'],
          minCortexVersion: '1.0.0',
          dependencies: [],
          peerDependencies: [],
          devDependencies: [],
          scripts: {},
          config: {},
          metadata: {}
        },
        variables: [
          {
            name: 'name',
            type: 'string',
            description: 'User name',
            required: true
          },
          {
            name: 'showMessage',
            type: 'boolean',
            description: 'Show message',
            required: false,
            default: true
          },
          {
            name: 'message',
            type: 'string',
            description: 'Message to show',
            required: false,
            default: 'Welcome!'
          }
        ],
        dependencies: [],
        hooks: [],
        helpers: [],
        filters: [],
        partials: [],
        includes: [],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          size: 1000,
          fileCount: 1,
          complexity: 'low',
          performance: {
            renderTime: 0,
            memoryUsage: 0,
            fileOperations: 0,
            cacheHits: 0,
            cacheMisses: 0
          },
          security: {
            riskLevel: 'low',
            vulnerabilities: [],
            permissions: [],
            sandboxRequired: false
          }
        }
      };

      const context: MockTemplateContext = {
        variables: {
          name: 'World',
          showMessage: true,
          message: 'Hello from template!'
        },
        metadata: {},
        options: {},
        helpers: {},
        filters: {},
        partials: {},
        includes: {},
        hooks: {}
      };

      await engine.renderTemplate(template, context);
      // Should not throw
    });
  });

  describe('renderFile', () => {
    it('should render file with variable substitution', async () => {
      const file: MockTemplateFile = {
        path: 'test.txt',
        content: 'Hello {{name}}!',
        type: 'text'
      };

      const context: MockTemplateContext = {
        variables: { name: 'World' },
        metadata: {},
        options: {},
        helpers: {},
        filters: {},
        partials: {},
        includes: {},
        hooks: {}
      };

      const result = await engine.renderFile(file, context);
      assert.strictEqual(result, 'Hello World!');
    });

    it('should render file with conditionals', async () => {
      const file: MockTemplateFile = {
        path: 'test.txt',
        content: 'Hello {{name}}! {{#if showMessage}}{{message}}{{/if}}',
        type: 'text'
      };

      const context: MockTemplateContext = {
        variables: { 
          name: 'World',
          showMessage: true,
          message: 'Welcome!'
        },
        metadata: {},
        options: {},
        helpers: {},
        filters: {},
        partials: {},
        includes: {},
        hooks: {}
      };

      const result = await engine.renderFile(file, context);
      assert.strictEqual(result, 'Hello World! Welcome!');
    });

    it('should render file with loops', async () => {
      const file: MockTemplateFile = {
        path: 'test.txt',
        content: 'Items: {{#each items}}{{item}}, {{/each}}',
        type: 'text'
      };

      const context: MockTemplateContext = {
        variables: { 
          items: ['apple', 'banana', 'cherry']
        },
        metadata: {},
        options: {},
        helpers: {},
        filters: {},
        partials: {},
        includes: {},
        hooks: {}
      };

      const result = await engine.renderFile(file, context);
      assert.strictEqual(result, 'Items: apple, banana, cherry, ');
    });
  });

  describe('validateTemplate', () => {
    it('should validate template successfully', () => {
      const template: MockAdvancedTemplate = {
        name: 'valid-template',
        version: '1.0.0',
        description: 'Valid template',
        author: 'Test Author',
        files: [
          {
            path: 'src/index.ts',
            content: 'Hello World!',
            type: 'text'
          }
        ],
        config: {
          name: 'valid-template',
          description: 'Valid template',
          version: '1.0.0',
          author: 'Test Author',
          license: 'MIT',
          keywords: ['template'],
          categories: ['development'],
          tags: ['typescript'],
          minCortexVersion: '1.0.0',
          dependencies: [],
          peerDependencies: [],
          devDependencies: [],
          scripts: {},
          config: {},
          metadata: {}
        },
        variables: [],
        dependencies: [],
        hooks: [],
        helpers: [],
        filters: [],
        partials: [],
        includes: [],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          size: 100,
          fileCount: 1,
          complexity: 'low',
          performance: {
            renderTime: 0,
            memoryUsage: 0,
            fileOperations: 0,
            cacheHits: 0,
            cacheMisses: 0
          },
          security: {
            riskLevel: 'low',
            vulnerabilities: [],
            permissions: [],
            sandboxRequired: false
          }
        }
      };

      const result = engine.validateTemplate(template);
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.errors.length, 0);
    });

    it('should validate template with errors', () => {
      const template: MockAdvancedTemplate = {
        name: '',
        version: '',
        description: 'Invalid template',
        author: 'Test Author',
        files: [],
        config: {
          name: '',
          description: 'Invalid template',
          version: '',
          author: 'Test Author',
          license: 'MIT',
          keywords: ['template'],
          categories: ['development'],
          tags: ['typescript'],
          minCortexVersion: '1.0.0',
          dependencies: [],
          peerDependencies: [],
          devDependencies: [],
          scripts: {},
          config: {},
          metadata: {}
        },
        variables: [],
        dependencies: [],
        hooks: [],
        helpers: [],
        filters: [],
        partials: [],
        includes: [],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          size: 0,
          fileCount: 0,
          complexity: 'low',
          performance: {
            renderTime: 0,
            memoryUsage: 0,
            fileOperations: 0,
            cacheHits: 0,
            cacheMisses: 0
          },
          security: {
            riskLevel: 'low',
            vulnerabilities: [],
            permissions: [],
            sandboxRequired: false
          }
        }
      };

      const result = engine.validateTemplate(template);
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.length > 0);
    });
  });

  describe('applyVariables', () => {
    it('should apply simple variables', () => {
      const content = 'Hello {{name}}!';
      const variables = { name: 'World' };
      const result = engine.applyVariables(content, variables);
      assert.strictEqual(result, 'Hello World!');
    });

    it('should handle missing variables', () => {
      const content = 'Hello {{name}}!';
      const variables = {};
      const result = engine.applyVariables(content, variables);
      assert.strictEqual(result, 'Hello {{name}}!');
    });
  });

  describe('processConditionals', () => {
    it('should process true conditionals', () => {
      const content = 'Hello {{#if showMessage}}World{{/if}}!';
      const variables = { showMessage: true };
      const result = engine.processConditionals(content, variables);
      assert.strictEqual(result, 'Hello World!');
    });

    it('should process false conditionals', () => {
      const content = 'Hello {{#if showMessage}}World{{/if}}!';
      const variables = { showMessage: false };
      const result = engine.processConditionals(content, variables);
      assert.strictEqual(result, 'Hello !');
    });
  });

  describe('processLoops', () => {
    it('should process array loops', () => {
      const content = 'Items: {{#each items}}{{item}}, {{/each}}';
      const variables = { items: ['apple', 'banana'] };
      const result = engine.processLoops(content, variables);
      assert.strictEqual(result, 'Items: apple, banana, ');
    });

    it('should handle non-array values', () => {
      const content = 'Items: {{#each items}}{{item}}, {{/each}}';
      const variables = { items: 'not an array' };
      const result = engine.processLoops(content, variables);
      assert.strictEqual(result, 'Items: ');
    });
  });

  describe('extractVariables', () => {
    it('should extract variables from content', () => {
      const content = 'Hello {{name}}! Your age is {{age}}.';
      const variables = engine.extractVariables(content);
      assert.ok(variables.includes('name'));
      assert.ok(variables.includes('age'));
    });

    it('should not extract conditional or loop variables', () => {
      const content = '{{#if condition}}Hello{{/if}} {{#each items}}{{item}}{{/each}}';
      const variables = engine.extractVariables(content);
      assert.ok(!variables.includes('condition'));
      assert.ok(!variables.includes('items'));
    });
  });

  describe('validateVariables', () => {
    it('should validate required variables', () => {
      const template: MockAdvancedTemplate = {
        name: 'test-template',
        version: '1.0.0',
        description: 'Test template',
        author: 'Test Author',
        files: [],
        config: {
          name: 'test-template',
          description: 'Test template',
          version: '1.0.0',
          author: 'Test Author',
          license: 'MIT',
          keywords: ['template'],
          categories: ['development'],
          tags: ['typescript'],
          minCortexVersion: '1.0.0',
          dependencies: [],
          peerDependencies: [],
          devDependencies: [],
          scripts: {},
          config: {},
          metadata: {}
        },
        variables: [
          {
            name: 'requiredVar',
            type: 'string',
            description: 'Required variable',
            required: true
          }
        ],
        dependencies: [],
        hooks: [],
        helpers: [],
        filters: [],
        partials: [],
        includes: [],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          size: 0,
          fileCount: 0,
          complexity: 'low',
          performance: {
            renderTime: 0,
            memoryUsage: 0,
            fileOperations: 0,
            cacheHits: 0,
            cacheMisses: 0
          },
          security: {
            riskLevel: 'low',
            vulnerabilities: [],
            permissions: [],
            sandboxRequired: false
          }
        }
      };

      const variables = {};
      const result = engine.validateVariables(template, variables);
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some(e => e.type === 'REQUIRED_VARIABLE'));
    });
  });

  describe('compileTemplate', () => {
    it('should compile template successfully', () => {
      const template: MockAdvancedTemplate = {
        name: 'compilable-template',
        version: '1.0.0',
        description: 'Compilable template',
        author: 'Test Author',
        files: [
          {
            path: 'src/index.ts',
            content: 'Hello {{name}}!',
            type: 'text'
          }
        ],
        config: {
          name: 'compilable-template',
          description: 'Compilable template',
          version: '1.0.0',
          author: 'Test Author',
          license: 'MIT',
          keywords: ['template'],
          categories: ['development'],
          tags: ['typescript'],
          minCortexVersion: '1.0.0',
          dependencies: [],
          peerDependencies: [],
          devDependencies: [],
          scripts: {},
          config: {},
          metadata: {}
        },
        variables: [],
        dependencies: [],
        hooks: [],
        helpers: [],
        filters: [],
        partials: [],
        includes: [],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          size: 100,
          fileCount: 1,
          complexity: 'low',
          performance: {
            renderTime: 0,
            memoryUsage: 0,
            fileOperations: 0,
            cacheHits: 0,
            cacheMisses: 0
          },
          security: {
            riskLevel: 'low',
            vulnerabilities: [],
            permissions: [],
            sandboxRequired: false
          }
        }
      };

      const compiled = engine.compileTemplate(template);
      assert.strictEqual(compiled.template.name, 'compilable-template');
      assert.strictEqual(compiled.compiledFiles.length, 1);
      assert.ok(compiled.metadata.compiledAt);
    });
  });

  describe('generateTemplatePreview', () => {
    it('should generate template preview', async () => {
      const template: MockAdvancedTemplate = {
        name: 'preview-template',
        version: '1.0.0',
        description: 'Preview template',
        author: 'Test Author',
        files: [
          {
            path: 'src/index.ts',
            content: 'Hello {{name}}!',
            type: 'text'
          }
        ],
        config: {
          name: 'preview-template',
          description: 'Preview template',
          version: '1.0.0',
          author: 'Test Author',
          license: 'MIT',
          keywords: ['template'],
          categories: ['development'],
          tags: ['typescript'],
          minCortexVersion: '1.0.0',
          dependencies: [],
          peerDependencies: [],
          devDependencies: [],
          scripts: {},
          config: {},
          metadata: {}
        },
        variables: [],
        dependencies: [],
        hooks: [],
        helpers: [],
        filters: [],
        partials: [],
        includes: [],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          size: 100,
          fileCount: 1,
          complexity: 'low',
          performance: {
            renderTime: 0,
            memoryUsage: 0,
            fileOperations: 0,
            cacheHits: 0,
            cacheMisses: 0
          },
          security: {
            riskLevel: 'low',
            vulnerabilities: [],
            permissions: [],
            sandboxRequired: false
          }
        }
      };

      const context: MockTemplateContext = {
        variables: { name: 'World' },
        metadata: {},
        options: {},
        helpers: {},
        filters: {},
        partials: {},
        includes: {},
        hooks: {}
      };

      const preview = await engine.generateTemplatePreview(template, context);
      assert.strictEqual(preview.files.length, 1);
      assert.strictEqual(preview.files[0]?.path, 'src/index.ts');
      assert.strictEqual(preview.files[0]?.content, 'Hello World!');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty template', () => {
      const template: MockAdvancedTemplate = {
        name: 'empty-template',
        version: '1.0.0',
        description: 'Empty template',
        author: 'Test Author',
        files: [],
        config: {
          name: 'empty-template',
          description: 'Empty template',
          version: '1.0.0',
          author: 'Test Author',
          license: 'MIT',
          keywords: ['template'],
          categories: ['development'],
          tags: ['typescript'],
          minCortexVersion: '1.0.0',
          dependencies: [],
          peerDependencies: [],
          devDependencies: [],
          scripts: {},
          config: {},
          metadata: {}
        },
        variables: [],
        dependencies: [],
        hooks: [],
        helpers: [],
        filters: [],
        partials: [],
        includes: [],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          size: 0,
          fileCount: 0,
          complexity: 'low',
          performance: {
            renderTime: 0,
            memoryUsage: 0,
            fileOperations: 0,
            cacheHits: 0,
            cacheMisses: 0
          },
          security: {
            riskLevel: 'low',
            vulnerabilities: [],
            permissions: [],
            sandboxRequired: false
          }
        }
      };

      const result = engine.validateTemplate(template);
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some(e => e.type === 'REQUIRED_FIELD'));
    });

    it('should handle malformed template content', () => {
      const content = 'Hello {{name}'; // Missing closing brace
      const variables = { name: 'World' };
      const result = engine.applyVariables(content, variables);
      assert.strictEqual(result, 'Hello {{name}'); // Should not crash
    });
  });

  describe('performance and scalability', () => {
    it('should handle large templates efficiently', () => {
      const largeContent = 'Hello {{name}}! '.repeat(1000);
      const template: MockAdvancedTemplate = {
        name: 'large-template',
        version: '1.0.0',
        description: 'Large template',
        author: 'Test Author',
        files: [
          {
            path: 'src/index.ts',
            content: largeContent,
            type: 'text'
          }
        ],
        config: {
          name: 'large-template',
          description: 'Large template',
          version: '1.0.0',
          author: 'Test Author',
          license: 'MIT',
          keywords: ['template'],
          categories: ['development'],
          tags: ['typescript'],
          minCortexVersion: '1.0.0',
          dependencies: [],
          peerDependencies: [],
          devDependencies: [],
          scripts: {},
          config: {},
          metadata: {}
        },
        variables: [],
        dependencies: [],
        hooks: [],
        helpers: [],
        filters: [],
        partials: [],
        includes: [],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          size: largeContent.length,
          fileCount: 1,
          complexity: 'high',
          performance: {
            renderTime: 0,
            memoryUsage: 0,
            fileOperations: 0,
            cacheHits: 0,
            cacheMisses: 0
          },
          security: {
            riskLevel: 'low',
            vulnerabilities: [],
            permissions: [],
            sandboxRequired: false
          }
        }
      };

      const startTime = Date.now();
      const compiled = engine.compileTemplate(template);
      const endTime = Date.now();
      const duration = endTime - startTime;

      assert.ok(compiled);
      assert.ok(duration < 100, `Compilation took too long: ${duration}ms`);
    });
  });
});