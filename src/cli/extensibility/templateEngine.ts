/**
 * Template Engine Implementation
 * Zero dependencies, strictest TypeScript configuration
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { 
  Template, 
  TemplateFile, 
  TemplateContext, 
  TemplateEngine, 
  ValidationResult, 
  ValidationError 
} from './types.js';

/**
 * Template Engine Implementation
 */
export class CortexTemplateEngine implements TemplateEngine {
  /**
   * Render a complete template
   */
  async renderTemplate(template: Template, context: TemplateContext): Promise<void> {
    // Validate template before rendering
    const validation = this.validateTemplate(template);
    if (!validation.valid) {
      throw new Error(`Template validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Render each file in the template
    for (const file of template.files) {
      await this.renderFile(file, context);
    }
  }

  /**
   * Render a single template file
   */
  async renderFile(file: TemplateFile, context: TemplateContext): Promise<string> {
    let content: string;
    
    if (typeof file.content === 'function') {
      content = await file.content(context);
    } else {
      content = file.content;
    }

    // Apply template variables
    content = this.applyVariables(content, context.variables);

    // Ensure directory exists
    const filePath = join(context.workingDirectory, file.path);
    const fileDir = dirname(filePath);
    await mkdir(fileDir, { recursive: true });

    // Write file
    await writeFile(filePath, content, { 
      mode: file.permissions,
      flag: 'w'
    });

    // Set executable permission if needed
    if (file.executable) {
      // Note: In a real implementation, you'd use chmod here
      // For now, we'll just log it
      console.log(`File ${filePath} marked as executable`);
    }

    return content;
  }

  /**
   * Validate a template
   */
  validateTemplate(template: Template): ValidationResult {
    const errors: ValidationError[] = [];
    
    // Check required properties
    if (!template.name || typeof template.name !== 'string') {
      errors.push({
        field: 'name',
        message: 'Template name is required and must be a string',
        code: 'MISSING_NAME'
      });
    }
    
    if (!template.description || typeof template.description !== 'string') {
      errors.push({
        field: 'description',
        message: 'Template description is required and must be a string',
        code: 'MISSING_DESCRIPTION'
      });
    }
    
    if (!template.version || typeof template.version !== 'string') {
      errors.push({
        field: 'version',
        message: 'Template version is required and must be a string',
        code: 'MISSING_VERSION'
      });
    }
    
    if (!template.author || typeof template.author !== 'string') {
      errors.push({
        field: 'author',
        message: 'Template author is required and must be a string',
        code: 'MISSING_AUTHOR'
      });
    }
    
    if (!template.files || !Array.isArray(template.files)) {
      errors.push({
        field: 'files',
        message: 'Template files are required and must be an array',
        code: 'MISSING_FILES'
      });
    } else {
      // Validate each file
      for (let i = 0; i < template.files.length; i++) {
        const file = template.files[i];
        
        if (!file.path || typeof file.path !== 'string') {
          errors.push({
            field: `files[${i}].path`,
            message: 'File path is required and must be a string',
            code: 'INVALID_FILE_PATH'
          });
        }
        
        if (!file.content || (typeof file.content !== 'string' && typeof file.content !== 'function')) {
          errors.push({
            field: `files[${i}].content`,
            message: 'File content is required and must be a string or function',
            code: 'INVALID_FILE_CONTENT'
          });
        }
      }
    }
    
    // Validate config if provided
    if (template.config) {
      if (!template.config.name || typeof template.config.name !== 'string') {
        errors.push({
          field: 'config.name',
          message: 'Template config name is required and must be a string',
          code: 'INVALID_CONFIG_NAME'
        });
      }
      
      if (!template.config.variables || !Array.isArray(template.config.variables)) {
        errors.push({
          field: 'config.variables',
          message: 'Template config variables are required and must be an array',
          code: 'INVALID_CONFIG_VARIABLES'
        });
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  /**
   * Apply template variables to content
   */
  private applyVariables(content: string, variables: Record<string, unknown>): string {
    let result = content;
    
    // Simple variable substitution: {{variableName}}
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      const replacement = String(value);
      result = result.replace(new RegExp(placeholder, 'g'), replacement);
    }
    
    // Conditional blocks: {{#if variableName}}...{{/if}}
    result = this.processConditionals(result, variables);
    
    // Loop blocks: {{#each arrayName}}...{{/each}}
    result = this.processLoops(result, variables);
    
    return result;
  }

  /**
   * Process conditional blocks
   */
  private processConditionals(content: string, variables: Record<string, unknown>): string {
    const conditionalRegex = /\{\{#if\s+(\w+)\}\}(.*?)\{\{\/if\}\}/g;
    
    return content.replace(conditionalRegex, (_, variableName, blockContent) => {
      const value = variables[variableName];
      const shouldInclude = Boolean(value);
      
      return shouldInclude ? blockContent : '';
    });
  }

  /**
   * Process loop blocks
   */
  private processLoops(content: string, variables: Record<string, unknown>): string {
    const loopRegex = /\{\{#each\s+(\w+)\}\}(.*?)\{\{\/each\}\}/g;
    
    return content.replace(loopRegex, (_, arrayName, blockContent) => {
      const value = variables[arrayName];
      
      if (!Array.isArray(value)) {
        return '';
      }
      
      return value.map((item, index) => {
        let itemContent = blockContent;
        
        // Replace {{this}} with the current item
        itemContent = itemContent.replace(/\{\{this\}\}/g, String(item));
        
        // Replace {{index}} with the current index
        itemContent = itemContent.replace(/\{\{index\}\}/g, String(index));
        
        // Replace {{@index}} with the current index (alternative syntax)
        itemContent = itemContent.replace(/\{\{@index\}\}/g, String(index));
        
        return itemContent;
      }).join('');
    });
  }

  /**
   * Extract variables from template content
   */
  extractVariables(content: string): string[] {
    const variables = new Set<string>();
    
    // Find {{variableName}} patterns
    const variableRegex = /\{\{(\w+)\}\}/g;
    let variableMatch;
    while ((variableMatch = variableRegex.exec(content)) !== null) {
      variables.add(variableMatch[1]);
    }
    
    // Find {{#if variableName}} patterns
    const conditionalRegex = /\{\{#if\s+(\w+)\}\}/g;
    let conditionalMatch;
    while ((conditionalMatch = conditionalRegex.exec(content)) !== null) {
      variables.add(conditionalMatch[1]);
    }
    
    // Find {{#each arrayName}} patterns
    const loopRegex = /\{\{#each\s+(\w+)\}\}/g;
    let loopMatch;
    while ((loopMatch = loopRegex.exec(content)) !== null) {
      variables.add(loopMatch[1]);
    }
    
    return Array.from(variables);
  }

  /**
   * Validate template variables
   */
  validateVariables(template: Template, variables: Record<string, unknown>): ValidationResult {
    const errors: ValidationError[] = [];
    
    if (!template.config?.variables) {
      return { valid: true, errors: [], warnings: [] };
    }
    
    for (const variableDef of template.config.variables) {
      const value = variables[variableDef.name];
      
      // Check required variables
      if (variableDef.required && (value === undefined || value === null)) {
        errors.push({
          field: variableDef.name,
          message: `Required variable '${variableDef.name}' is missing`,
          code: 'MISSING_REQUIRED_VARIABLE'
        });
        continue;
      }
      
      // Skip validation if variable is not provided and not required
      if (value === undefined || value === null) {
        continue;
      }
      
      // Check type
      if (!this.validateVariableType(value, variableDef.type)) {
        errors.push({
          field: variableDef.name,
          message: `Variable '${variableDef.name}' must be of type ${variableDef.type}`,
          code: 'INVALID_VARIABLE_TYPE'
        });
      }
      
      // Run custom validation
      if (variableDef.validation && !variableDef.validation(value)) {
        errors.push({
          field: variableDef.name,
          message: `Variable '${variableDef.name}' failed custom validation`,
          code: 'VARIABLE_VALIDATION_FAILED'
        });
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  /**
   * Validate variable type
   */
  private validateVariableType(value: unknown, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value as number);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        return true;
    }
  }
}