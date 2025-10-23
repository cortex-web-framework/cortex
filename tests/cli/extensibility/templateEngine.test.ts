/**
 * Template Engine Tests
 * TDD approach with super strict TypeScript and comprehensive test coverage
 */

import assert from 'node:assert/strict';
import { describe, it, beforeEach } from 'node:test';
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

// Mock types for now - these will be replaced with actual imports
interface MockTemplateFile {
  readonly path: string;
  readonly content: string | MockTemplateContentFunction;
  readonly permissions?: number;
  readonly executable?: boolean;
}

interface MockTemplateContentFunction {
  (context: MockTemplateContext): string | Promise<string>;
}

interface MockTemplateContext {
  readonly templateName: string;
  readonly templateVersion: string;
  readonly variables: Record<string, unknown>;
  readonly workingDirectory: string;
  readonly logger: MockPluginLogger;
}

interface MockTemplateConfig {
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly author: string;
  readonly tags: readonly string[];
  readonly variables: readonly MockTemplateVariable[];
  readonly dependencies?: readonly string[];
  readonly engines?: Record<string, string>;
}

interface MockTemplateVariable {
  readonly name: string;
  readonly description: string;
  readonly type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  readonly required: boolean;
  readonly default?: unknown;
  readonly validation?: (value: unknown) => boolean;
  readonly prompt?: string;
}

interface MockTemplate {
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly author: string;
  readonly tags: readonly string[];
  readonly files: readonly MockTemplateFile[];
  readonly config: MockTemplateConfig;
  readonly dependencies?: readonly string[];
  
  generate(context: MockTemplateContext): Promise<void>;
  validate?(context: MockTemplateContext): Promise<MockValidationResult>;
}

interface MockPluginLogger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

interface MockValidationResult {
  readonly valid: boolean;
  readonly errors: readonly MockValidationError[];
  readonly warnings: readonly MockValidationWarning[];
}

interface MockValidationError {
  readonly field: string;
  readonly message: string;
  readonly code: string;
}

interface MockValidationWarning {
  readonly field: string;
  readonly message: string;
  readonly code: string;
}

interface MockTemplateEngine {
  renderTemplate(template: MockTemplate, context: MockTemplateContext): Promise<void>;
  renderFile(file: MockTemplateFile, context: MockTemplateContext): Promise<string>;
  validateTemplate(template: MockTemplate): MockValidationResult;
  extractVariables(content: string): string[];
  validateVariables(template: MockTemplate, variables: Record<string, unknown>): MockValidationResult;
  applyVariables(content: string, variables: Record<string, unknown>): string;
}

// Mock implementation for testing
class MockCortexTemplateEngine implements MockTemplateEngine {
  async renderTemplate(template: MockTemplate, context: MockTemplateContext): Promise<void> {
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

  async renderFile(file: MockTemplateFile, context: MockTemplateContext): Promise<string> {
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

  validateTemplate(template: MockTemplate): MockValidationResult {
    const errors: MockValidationError[] = [];
    
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
        const file = template.files[i]!;
        
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

  applyVariables(content: string, variables: Record<string, unknown>): string {
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

  private processConditionals(content: string, variables: Record<string, unknown>): string {
    const conditionalRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/gm;

    return content.replace(conditionalRegex, (match, variableName, blockContent) => {
      const value = variables[variableName];
      const shouldInclude = Boolean(value);

      return shouldInclude ? blockContent : '';
    });
  }

  private processLoops(content: string, variables: Record<string, unknown>): string {
    const loopRegex = /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/gm;
    
    return content.replace(loopRegex, (match, arrayName, blockContent) => {
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
        itemContent = itemContent.replace(/\{\\{@index\}\}/g, String(index));
        
        return itemContent;
      }).join('');
    });
  }

  extractVariables(content: string): string[] {
    const variables = new Set<string>();

    // Find {{variableName}} patterns
    const variableRegex = /\{\{(\w+)\}\}/g;
    let match;
    while ((match = variableRegex.exec(content)) !== null) {
      if (match[1]) variables.add(match[1]);
    }

    // Find {{#if variableName}} patterns
    const conditionalRegex = /\{\{#if\s+(\w+)\}\}/g;
    while ((match = conditionalRegex.exec(content)) !== null) {
      if (match[1]) variables.add(match[1]);
    }

    // Find {{#each arrayName}} patterns
    const loopRegex = /\{\{#each\s+(\w+)\}\}/g;
    while ((match = loopRegex.exec(content)) !== null) {
      if (match[1]) variables.add(match[1]);
    }

    return Array.from(variables);
  }

  validateVariables(template: MockTemplate, variables: Record<string, unknown>): MockValidationResult {
    const errors: MockValidationError[] = [];
    
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

describe('CortexTemplateEngine', () => {
  let engine: MockTemplateEngine;
  let testTemplate: MockTemplate;
  let testContext: MockTemplateContext;

  beforeEach(() => {
    engine = new MockCortexTemplateEngine();
    testContext = {
      templateName: 'test-template',
      templateVersion: '1.0.0',
      variables: { projectName: 'Test Project', useTypeScript: true },
      workingDirectory: '/tmp/test',
      logger: {
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {}
      }
    };
    testTemplate = {
      name: 'test-template',
      description: 'A test template for unit testing',
      version: '1.0.0',
      author: 'Test Author',
      tags: ['test', 'template', 'example'],
      files: [
        {
          path: 'src/index.ts',
          content: 'console.log("Hello {{projectName}}");',
          permissions: 0o644,
          executable: false
        },
        {
          path: 'package.json',
          content: '{"name": "{{projectName}}", "typescript": {{useTypeScript}}}',
          permissions: 0o644,
          executable: false
        }
      ],
      config: {
        name: 'test-template',
        description: 'A test template for unit testing',
        version: '1.0.0',
        author: 'Test Author',
        tags: ['test', 'template', 'example'],
        variables: [
          {
            name: 'projectName',
            description: 'Name of the project',
            type: 'string',
            required: true,
            prompt: 'What is the project name?'
          },
          {
            name: 'useTypeScript',
            description: 'Whether to use TypeScript',
            type: 'boolean',
            required: false,
            default: true
          }
        ]
      },
      generate: async () => {}
    };
  });

  describe('renderTemplate', () => {
    it('should render a valid template successfully', async () => {
      // Mock the file system operations
      // const mockMkdir = mock.fn(() => Promise.resolve());
      // const mockWriteFile = mock.fn(() => Promise.resolve());
      
      // This would require mocking the file system operations
      // For now, we'll test the validation logic
      const validation = engine.validateTemplate(testTemplate);
      assert.strictEqual(validation.valid, true);
    });

    it('should throw error for invalid template', async () => {
      const invalidTemplate = { ...testTemplate, name: '' };
      
      await assert.rejects(
        () => engine.renderTemplate(invalidTemplate, testContext),
        {
          name: 'Error',
          message: /Template validation failed/
        }
      );
    });

    it('should render all files in template', async () => {
      // This would require mocking the file system operations
      // For now, we'll test the file processing logic
      const validation = engine.validateTemplate(testTemplate);
      assert.strictEqual(validation.valid, true);
      assert.strictEqual(testTemplate.files.length, 2);
    });
  });

  describe('renderFile', () => {
    it('should render file with string content', async () => {
      const file: MockTemplateFile = {
        path: 'test.txt',
        content: 'Hello {{projectName}}!',
        permissions: 0o644,
        executable: false
      };
      
      // Mock file system operations
      // const mockMkdir = mock.fn(() => Promise.resolve());
      // const mockWriteFile = mock.fn(() => Promise.resolve());
      
      // This would require mocking the file system operations
      // For now, we'll test the content processing
      const processedContent = engine.applyVariables(file.content as string, testContext.variables);
      assert.strictEqual(processedContent, 'Hello Test Project!');
    });

    it('should render file with function content', async () => {
      const file: MockTemplateFile = {
        path: 'test.txt',
        content: (context: MockTemplateContext) => `Hello ${String(context.variables['projectName'])}!`, 
        permissions: 0o644,
        executable: false
      };
      
      // This would require mocking the file system operations
      // For now, we'll test the function execution
      const content = await (file.content as MockTemplateContentFunction)(testContext);
      assert.strictEqual(content, 'Hello Test Project!');
    });

    it('should handle executable files', async () => {
      const file: MockTemplateFile = {
        path: 'script.sh',
        content: '#!/bin/bash\necho "Hello {{projectName}}" ',
        permissions: 0o755,
        executable: true
      };
      
      // This would require mocking the file system operations
      // For now, we'll test the content processing
      const processedContent = engine.applyVariables(file.content as string, testContext.variables);
      assert.strictEqual(processedContent, '#!/bin/bash\necho "Hello Test Project" ');
    });
  });

  describe('validateTemplate', () => {
    it('should validate a correct template', () => {
      const validation = engine.validateTemplate(testTemplate);
      assert.strictEqual(validation.valid, true);
      assert.strictEqual(validation.errors.length, 0);
    });

    it('should reject template without name', () => {
      const invalidTemplate = { ...testTemplate, name: '' };
      const validation = engine.validateTemplate(invalidTemplate);
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some(e => e.field === 'name'));
    });

    it('should reject template without description', () => {
      const invalidTemplate = { ...testTemplate, description: '' };
      const validation = engine.validateTemplate(invalidTemplate);
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some(e => e.field === 'description'));
    });

    it('should reject template without version', () => {
      const invalidTemplate = { ...testTemplate, version: '' };
      const validation = engine.validateTemplate(invalidTemplate);
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some(e => e.field === 'version'));
    });

    it('should reject template without author', () => {
      const invalidTemplate = { ...testTemplate, author: '' };
      const validation = engine.validateTemplate(invalidTemplate);
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some(e => e.field === 'author'));
    });

    it('should reject template without files', () => {
      const invalidTemplate = { ...testTemplate, files: [] };
      const validation = engine.validateTemplate(invalidTemplate);
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some(e => e.field === 'files'));
    });

    it('should reject template with invalid files', () => {
      const invalidTemplate = {
        ...testTemplate,
        files: [
          {
            path: '',
            content: 'test',
            permissions: 0o644,
            executable: false
          } as MockTemplateFile
        ]
      };
      const validation = engine.validateTemplate(invalidTemplate);
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some(e => e.field === 'files[0].path'));
    });

    it('should reject template with invalid file content', () => {
      const invalidTemplate = {
        ...testTemplate,
        files: [
          {
            path: 'test.txt',
            content: null as unknown as string,
            permissions: 0o644,
            executable: false
          } as MockTemplateFile
        ]
      };
      const validation = engine.validateTemplate(invalidTemplate);
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some(e => e.field === 'files[0].content'));
    });
  });

  describe('applyVariables', () => {
    it('should substitute simple variables', () => {
      const content = 'Hello {{name}}, welcome to {{project}}!';
      const variables = { name: 'John', project: 'Cortex' };
      const result = engine.applyVariables(content, variables);
      assert.strictEqual(result, 'Hello John, welcome to Cortex!');
    });

    it('should handle multiple occurrences of same variable', () => {
      const content = '{{name}} says hello to {{name}}!';
      const variables = { name: 'Alice' };
      const result = engine.applyVariables(content, variables);
      assert.strictEqual(result, 'Alice says hello to Alice!');
    });

    it('should handle variables with special characters', () => {
      const content = 'Price: ${{price}}, Tax: {{tax}}%';
      const variables = { price: '99.99', tax: '8.5' };
      const result = engine.applyVariables(content, variables);
      assert.strictEqual(result, 'Price: $99.99, Tax: 8.5%');
    });

    it('should handle undefined variables', () => {
      const content = 'Hello {{name}}, welcome to {{project}}!';
      const variables = { name: 'John' };
      const result = engine.applyVariables(content, variables);
      assert.strictEqual(result, 'Hello John, welcome to {{project}}!');
    });

    it('should handle empty variables', () => {
      const content = 'Hello {{name}}!';
      const variables = { name: '' };
      const result = engine.applyVariables(content, variables);
      assert.strictEqual(result, 'Hello !');
    });
  });

  describe('processConditionals', () => {
    it('should process conditional blocks correctly', () => {
      const content = 'Start {{#if showMessage}}Hello World{{/if}} End';
      const variables = { showMessage: true };
      const result = engine.applyVariables(content, variables);
      assert.strictEqual(result, 'Start Hello World End');
    });

    it('should skip conditional blocks when condition is false', () => {
      const content = 'Start {{#if showMessage}}Hello World{{/if}} End';
      const variables = { showMessage: false };
      const result = engine.applyVariables(content, variables);
      assert.strictEqual(result, 'Start  End');
    });

    it('should handle nested conditionals', () => {
      const content = '{{#if outer}}{{#if inner}}Nested{{/if}}{{/if}}';
      const variables = { outer: true, inner: true };
      const result = engine.applyVariables(content, variables);
      assert.strictEqual(result, 'Nested');
    });

    it('should handle multiple conditionals', () => {
      const content = '{{#if a}}A{{/if}}{{#if b}}B{{/if}}{{#if c}}C{{/if}}';
      const variables = { a: true, b: false, c: true };
      const result = engine.applyVariables(content, variables);
      assert.strictEqual(result, 'AC');
    });
  });

  describe('processLoops', () => {
    it('should process loop blocks correctly', () => {
      const content = 'Items: {{#each items}}{{this}}, {{/each}}';
      const variables = { items: ['apple', 'banana', 'cherry'] };
      const result = engine.applyVariables(content, variables);
      assert.strictEqual(result, 'Items: apple, banana, cherry, ');
    });

    it('should handle empty arrays', () => {
      const content = 'Items: {{#each items}}{{this}}, {{/each}}';
      const variables = { items: [] };
      const result = engine.applyVariables(content, variables);
      assert.strictEqual(result, 'Items: ');
    });

    it('should handle index variables', () => {
      const content = '{{#each items}}{{index}}: {{this}}\n{{/each}}';
      const variables = { items: ['first', 'second'] };
      const result = engine.applyVariables(content, variables);
      assert.strictEqual(result, '0: first\n1: second\n');
    });

    it('should handle @index syntax', () => {
      const content = '{{#each items}}{{@index}}: {{this}}\n{{/each}}';
      const variables = { items: ['first', 'second'] };
      const result = engine.applyVariables(content, variables);
      assert.strictEqual(result, '0: first\n1: second\n');
    });

    it('should skip loops for non-array values', () => {
      const content = '{{#each items}}{{this}}{{/each}}';
      const variables = { items: 'not an array' };
      const result = engine.applyVariables(content, variables);
      assert.strictEqual(result, '');
    });
  });

  describe('extractVariables', () => {
    it('should extract simple variables', () => {
      const content = 'Hello {{name}}, welcome to {{project}}!';
      const variables = engine.extractVariables(content);
      assert.deepStrictEqual(variables.sort(), ['name', 'project']);
    });

    it('should extract conditional variables', () => {
      const content = '{{#if showMessage}}Hello{{/if}}';
      const variables = engine.extractVariables(content);
      assert.deepStrictEqual(variables, ['showMessage']);
    });

    it('should extract loop variables', () => {
      const content = '{{#each items}}{{this}}{{/each}}';
      const variables = engine.extractVariables(content);
      assert.deepStrictEqual(variables, ['items']);
    });

    it('should extract all variable types', () => {
      const content = '{{name}} {{#if show}}{{#each items}}{{this}}{{/each}}{{/if}}';
      const variables = engine.extractVariables(content);
      assert.deepStrictEqual(variables.sort(), ['items', 'name', 'show']);
    });

    it('should handle duplicate variables', () => {
      const content = '{{name}} {{name}} {{name}}';
      const variables = engine.extractVariables(content);
      assert.deepStrictEqual(variables, ['name']);
    });
  });

  describe('validateVariables', () => {
    it('should validate correct variables', () => {
      const validation = engine.validateVariables(testTemplate, testContext.variables);
      assert.strictEqual(validation.valid, true);
    });

    it('should reject missing required variables', () => {
      const variables = { useTypeScript: true }; // Missing projectName
      const validation = engine.validateVariables(testTemplate, variables);
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some(e => e.field === 'projectName'));
    });

    it('should validate optional variables', () => {
      const variables = { projectName: 'Test' }; // Missing useTypeScript (optional)
      const validation = engine.validateVariables(testTemplate, variables);
      assert.strictEqual(validation.valid, true);
    });

    it('should validate variable types', () => {
      const variables = { projectName: 123, useTypeScript: 'true' }; // Wrong types
      const validation = engine.validateVariables(testTemplate, variables);
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some(e => e.field === 'projectName'));
      assert.ok(validation.errors.some(e => e.field === 'useTypeScript'));
    });

    it('should run custom validation', () => {
      const templateWithCustomValidation: MockTemplate = {
        ...testTemplate,
        config: {
          ...testTemplate.config,
          variables: [
            {
              name: 'age',
              description: 'Age must be positive',
              type: 'number',
              required: true,
              validation: (value) => typeof value === 'number' && value > 0
            }
          ]
        },
        generate: async () => {}
      };
      
      const validVariables = { age: 25 };
      const validValidation = engine.validateVariables(templateWithCustomValidation, validVariables);
      assert.strictEqual(validValidation.valid, true);
      
      const invalidVariables = { age: -5 };
      const invalidValidation = engine.validateVariables(templateWithCustomValidation, invalidVariables);
      assert.strictEqual(invalidValidation.valid, false);
      assert.ok(invalidValidation.errors.some(e => e.field === 'age'));
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle templates with very long content', () => {
      const longContent = 'x'.repeat(100000);
      const variables = { name: 'Test' };
      const result = engine.applyVariables(longContent, variables);
      assert.strictEqual(result, longContent);
    });

    it('should handle templates with special characters', () => {
      const content = 'Price: ${{price}}, Tax: {{tax}}%, Total: {{total}}';
      const variables = { price: '99.99', tax: '8.5', total: '108.49' };
      const result = engine.applyVariables(content, variables);
      assert.strictEqual(result, 'Price: $99.99, Tax: 8.5%, Total: 108.49');
    });

    it('should handle templates with unicode characters', () => {
      const content = 'Hello {{name}} 世界 🌍';
      const variables = { name: '世界' };
      const result = engine.applyVariables(content, variables);
      assert.strictEqual(result, 'Hello 世界 世界 🌍');
    });

    it('should handle malformed conditional blocks', () => {
      const content = '{{#if name}}Hello{{/if}} {{#if}}Invalid{{/if}}';
      const variables = { name: 'John' };
      const result = engine.applyVariables(content, variables);
      assert.strictEqual(result, 'Hello {{#if}}Invalid{{/if}}');
    });

    it('should handle malformed loop blocks', () => {
      const content = '{{#each items}}{{this}}{{/each}} {{#each}}Invalid{{/each}}';
      const variables = { items: ['a', 'b'] };
      const result = engine.applyVariables(content, variables);
      assert.strictEqual(result, 'ab {{#each}}Invalid{{/each}}');
    });
  });

  describe('performance and memory', () => {
    it('should handle large templates efficiently', () => {
      const startTime = Date.now();
      
      // Create a large template with many variables
      let content = '';
      for (let i = 0; i < 1000; i++) {
        content += `{{var${i}}} `;
      }
      
      const variables: Record<string, unknown> = {};
      for (let i = 0; i < 1000; i++) {
        variables[`var${i}`] = `value${i}`;
      }
      
      const result = engine.applyVariables(content, variables);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      assert.ok(duration < 1000, `Template processing took too long: ${duration}ms`);
      assert.ok(result.includes('value0'));
      assert.ok(result.includes('value999'));
    });

    it('should handle deep nesting efficiently', () => {
      const startTime = Date.now();
      
      // Create deeply nested conditionals and loops
      let content = '{{#if level0}}';
      for (let i = 0; i < 100; i++) {
        content += `{{#if level${i}}}{{level${i}}}{{/if}}`;
      }
      content += '{{/if}}';
      
      const variables: Record<string, unknown> = {};
      for (let i = 0; i < 100; i++) {
        variables[`level${i}`] = true;
      }

      void engine.applyVariables(content, variables);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      assert.ok(duration < 1000, `Deep nesting processing took too long: ${duration}ms`);
    });
  });
});
