/**
 * Advanced Template Engine Implementation
 * Zero dependencies, strictest TypeScript configuration
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type {
  AdvancedTemplateEngine,
  AdvancedTemplate,
  TemplateFile,
  TemplateContext,
  ValidationResult,
  ValidationError,
  ValidationRule,
  CompiledTemplate,
  CompiledFile,
  TemplatePreview,
  PreviewFile
} from './types.js';

/**
 * Advanced Template Engine Implementation
 */
export class CortexAdvancedTemplateEngine implements AdvancedTemplateEngine {
  private readonly compiledTemplates = new Map<string, CompiledTemplate>();

  /**
   * Render a complete template
   */
  async renderTemplate(template: AdvancedTemplate, context: TemplateContext): Promise<void> {
    // Process template hooks
    await this.processTemplateHooks(template, context, 'pre-render');
    
    // Render each file
    for (const file of template.files) {
      const content = await this.renderFile(file, context);
      const filePath = join(context.options.outputPath as string || '.', file.path);
      
      // Ensure directory exists
      await mkdir(dirname(filePath), { recursive: true });
      
      // Write file
      await writeFile(filePath, content, { 
        encoding: (file.encoding as BufferEncoding) || 'utf8',
        mode: file.permissions 
      });
    }
    
    // Process post-render hooks
    await this.processTemplateHooks(template, context, 'post-render');
  }

  /**
   * Render a single file
   */
  async renderFile(file: TemplateFile, context: TemplateContext): Promise<string> {
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

  /**
   * Validate a template
   */
  validateTemplate(template: AdvancedTemplate): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

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
    warnings.push(...depValidation.warnings.map(w => ({ ...w, type: 'WARNING' })));

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Apply variable substitution
   */
  applyVariables(content: string, variables: Record<string, unknown>): string {
    return content.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
      const trimmed = variableName.trim();
      const value = variables[trimmed];
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Process conditional blocks
   */
  processConditionals(content: string, variables: Record<string, unknown>): string {
    const conditionalRegex = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    return content.replace(conditionalRegex, (match, condition, body) => {
      const trimmed = condition.trim();
      const value = variables[trimmed];
      return value ? body : '';
    });
  }

  /**
   * Process loop blocks
   */
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

  /**
   * Process include statements
   */
  async processIncludes(content: string, context: TemplateContext): Promise<string> {
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

  /**
   * Process partial statements
   */
  async processPartials(content: string, context: TemplateContext): Promise<string> {
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

  /**
   * Process helper functions
   */
  async processHelpers(content: string, context: TemplateContext): Promise<string> {
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

  /**
   * Process filter functions
   */
  async processFilters(content: string, context: TemplateContext): Promise<string> {
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

  /**
   * Extract variables from content
   */
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

  /**
   * Validate template variables
   */
  validateVariables(template: AdvancedTemplate, variables: Record<string, unknown>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

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

  /**
   * Validate a single variable rule
   */
  private validateVariableRule(value: unknown, rule: ValidationRule): boolean {
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

  /**
   * Compile a template for better performance
   */
  compileTemplate(template: AdvancedTemplate): CompiledTemplate {
    const startTime = Date.now();
    
    const compiledFiles: CompiledFile[] = template.files.map(file => ({
      path: file.path,
      compiledContent: typeof file.content === 'string' ? file.content : '[COMPILED_FUNCTION]',
      type: file.type,
      variables: this.extractVariables(typeof file.content === 'string' ? file.content : ''),
      dependencies: [],
      checksum: this.calculateChecksum(file.path)
    }));
    
    const compiledHelpers: Record<string, (...args: unknown[]) => string | Promise<string>> = {};
    for (const helper of template.helpers) {
      compiledHelpers[helper.name] = helper.handler;
    }
    
    const compiledFilters: Record<string, (value: unknown, ...args: unknown[]) => string | Promise<string>> = {};
    for (const filter of template.filters) {
      compiledFilters[filter.name] = filter.handler;
    }
    
    const compiledHooks: Record<string, (context: TemplateContext) => void | Promise<void>> = {};
    for (const hook of template.hooks) {
      compiledHooks[hook.name] = hook.handler;
    }
    
    const dependencies = this.getTemplateDependencies(template);
    
    const compiled: CompiledTemplate = {
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

  /**
   * Execute a compiled template
   */
  async executeCompiledTemplate(compiled: CompiledTemplate, context: TemplateContext): Promise<void> {
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
      
      const filePath = join(context.options.outputPath as string || '.', file.path);
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, content, { encoding: 'utf8' });
    }
  }

  /**
   * Get template dependencies
   */
  getTemplateDependencies(template: AdvancedTemplate): string[] {
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

  /**
   * Validate template dependencies
   */
  validateTemplateDependencies(template: AdvancedTemplate): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

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

  /**
   * Process template hooks
   */
  async processTemplateHooks(template: AdvancedTemplate, context: TemplateContext, hookType: string): Promise<void> {
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

  /**
   * Generate template preview
   */
  async generateTemplatePreview(template: AdvancedTemplate, context: TemplateContext): Promise<TemplatePreview> {
    const files: PreviewFile[] = [];
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

  /**
   * Calculate checksum for content
   */
  private calculateChecksum(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }
}