/**
 * Template Registry Tests
 * TDD approach with super strict TypeScript and comprehensive test coverage
 */

import assert from 'node:assert/strict';
import { describe, it, beforeEach, afterEach } from 'node:test';

// Mock types for now - these will be replaced with actual imports
interface MockTemplateFile {
  readonly path: string;
  readonly content: string;
  readonly permissions?: number;
  readonly executable?: boolean;
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

interface MockTemplate {
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly author: string;
  readonly tags: readonly string[];
  readonly files: readonly MockTemplateFile[];
  readonly config: MockTemplateConfig;
  readonly dependencies?: readonly string[];
}

interface MockTemplateRegistry {
  register(template: MockTemplate): void;
  unregister(templateName: string): void;
  get(templateName: string): MockTemplate | undefined;
  list(): readonly MockTemplate[];
  search(query: string): readonly MockTemplate[];
  isRegistered(templateName: string): boolean;
  getCount(): number;
  clear(): void;
  getByTag(tag: string): readonly MockTemplate[];
  getByAuthor(author: string): readonly MockTemplate[];
  getByCategory(category: string): readonly MockTemplate[];
  getPopular(): readonly MockTemplate[];
  getRecent(): readonly MockTemplate[];
}

// Mock implementation for testing
class MockCortexTemplateRegistry implements MockTemplateRegistry {
  private readonly templates = new Map<string, MockTemplate>();

  register(template: MockTemplate): void {
    if (this.templates.has(template.name)) {
      throw new Error(`Template '${template.name}' is already registered`);
    }
    this.templates.set(template.name, template);
  }

  unregister(templateName: string): void {
    if (!this.templates.has(templateName)) {
      throw new Error(`Template '${templateName}' is not registered`);
    }
    this.templates.delete(templateName);
  }

  get(templateName: string): MockTemplate | undefined {
    return this.templates.get(templateName);
  }

  list(): readonly MockTemplate[] {
    return Array.from(this.templates.values());
  }

  search(query: string): readonly MockTemplate[] {
    const lowercaseQuery = query.toLowerCase();
    return this.list().filter(template => 
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.description.toLowerCase().includes(lowercaseQuery) ||
      template.author.toLowerCase().includes(lowercaseQuery) ||
      template.tags.some(tag => 
        tag.toLowerCase().includes(lowercaseQuery)
      )
    );
  }

  isRegistered(templateName: string): boolean {
    return this.templates.has(templateName);
  }

  getCount(): number {
    return this.templates.size;
  }

  clear(): void {
    this.templates.clear();
  }

  getByTag(tag: string): readonly MockTemplate[] {
    return this.list().filter(template => 
      template.tags.includes(tag)
    );
  }

  getByAuthor(author: string): readonly MockTemplate[] {
    return this.list().filter(template => 
      template.author.toLowerCase() === author.toLowerCase()
    );
  }

  getByCategory(category: string): readonly MockTemplate[] {
    return this.list().filter(template => 
      template.tags.some(tag => 
        tag.toLowerCase().includes(category.toLowerCase())
      )
    );
  }

  getPopular(): readonly MockTemplate[] {
    return this.list();
  }

  getRecent(): readonly MockTemplate[] {
    return this.list();
  }
}

describe('CortexTemplateRegistry', () => {
  let registry: MockTemplateRegistry;
  let testTemplate: MockTemplate;
  let testTemplate2: MockTemplate;

  beforeEach(() => {
    registry = new MockCortexTemplateRegistry();
    testTemplate = {
      name: 'test-template',
      description: 'A test template for unit testing',
      version: '1.0.0',
      author: 'Test Author',
      tags: ['test', 'template', 'example'],
      files: [
        {
          path: 'src/index.ts',
          content: 'console.log("Hello World");',
          permissions: 0o644,
          executable: false
        },
        {
          path: 'package.json',
          content: '{"name": "test-project"}',
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
        ],
        dependencies: ['typescript', 'ts-node'],
        engines: {
          node: '>=18.0.0'
        }
      }
    };
    testTemplate2 = {
      name: 'another-template',
      description: 'Another test template',
      version: '2.0.0',
      author: 'Another Author',
      tags: ['another', 'test', 'template'],
      files: [
        {
          path: 'src/main.js',
          content: 'console.log("Another Hello World");',
          permissions: 0o644,
          executable: false
        }
      ],
      config: {
        name: 'another-template',
        description: 'Another test template',
        version: '2.0.0',
        author: 'Another Author',
        tags: ['another', 'test', 'template'],
        variables: [
          {
            name: 'appName',
            description: 'Name of the application',
            type: 'string',
            required: true
          }
        ]
      }
    };
  });

  afterEach(() => {
    registry.clear();
  });

  describe('register', () => {
    it('should register a template successfully', () => {
      registry.register(testTemplate);
      
      assert.strictEqual(registry.getCount(), 1);
      assert.strictEqual(registry.isRegistered('test-template'), true);
      assert.deepStrictEqual(registry.get('test-template'), testTemplate);
    });

    it('should throw error when registering duplicate template', () => {
      registry.register(testTemplate);
      
      assert.throws(
        () => registry.register(testTemplate),
        {
          name: 'Error',
          message: "Template 'test-template' is already registered"
        }
      );
    });

    it('should register multiple templates successfully', () => {
      registry.register(testTemplate);
      registry.register(testTemplate2);
      
      assert.strictEqual(registry.getCount(), 2);
      assert.strictEqual(registry.isRegistered('test-template'), true);
      assert.strictEqual(registry.isRegistered('another-template'), true);
    });

    it('should handle templates with empty files array', () => {
      const emptyTemplate: MockTemplate = {
        ...testTemplate,
        name: 'empty-template',
        files: []
      };
      
      registry.register(emptyTemplate);
      
      assert.strictEqual(registry.getCount(), 1);
      assert.strictEqual(registry.isRegistered('empty-template'), true);
    });

    it('should handle templates with complex file structures', () => {
      const complexTemplate: MockTemplate = {
        ...testTemplate,
        name: 'complex-template',
        files: [
          {
            path: 'src/components/Button.tsx',
            content: 'export const Button = () => <button>Click me</button>;',
            permissions: 0o644,
            executable: false
          },
          {
            path: 'src/utils/helpers.ts',
            content: 'export const helper = () => {};',
            permissions: 0o644,
            executable: false
          },
          {
            path: 'scripts/build.sh',
            content: '#!/bin/bash\necho "Building..."',
            permissions: 0o755,
            executable: true
          }
        ]
      };
      
      registry.register(complexTemplate);
      
      assert.strictEqual(registry.getCount(), 1);
      const registered = registry.get('complex-template');
      assert.strictEqual(registered?.files.length, 3);
      assert.strictEqual(registered?.files[2]?.executable, true);
    });
  });

  describe('unregister', () => {
    it('should unregister a template successfully', () => {
      registry.register(testTemplate);
      assert.strictEqual(registry.getCount(), 1);
      
      registry.unregister('test-template');
      
      assert.strictEqual(registry.getCount(), 0);
      assert.strictEqual(registry.isRegistered('test-template'), false);
      assert.strictEqual(registry.get('test-template'), undefined);
    });

    it('should throw error when unregistering non-existent template', () => {
      assert.throws(
        () => registry.unregister('non-existent-template'),
        {
          name: 'Error',
          message: "Template 'non-existent-template' is not registered"
        }
      );
    });

    it('should unregister correct template when multiple are registered', () => {
      registry.register(testTemplate);
      registry.register(testTemplate2);
      assert.strictEqual(registry.getCount(), 2);
      
      registry.unregister('test-template');
      
      assert.strictEqual(registry.getCount(), 1);
      assert.strictEqual(registry.isRegistered('test-template'), false);
      assert.strictEqual(registry.isRegistered('another-template'), true);
    });
  });

  describe('get', () => {
    it('should return undefined for non-existent template', () => {
      assert.strictEqual(registry.get('non-existent-template'), undefined);
    });

    it('should return correct template when registered', () => {
      registry.register(testTemplate);
      
      const retrieved = registry.get('test-template');
      assert.deepStrictEqual(retrieved, testTemplate);
    });

    it('should return undefined after unregistering', () => {
      registry.register(testTemplate);
      registry.unregister('test-template');
      
      assert.strictEqual(registry.get('test-template'), undefined);
    });
  });

  describe('list', () => {
    it('should return empty array when no templates registered', () => {
      const templates = registry.list();
      assert.strictEqual(templates.length, 0);
    });

    it('should return all registered templates', () => {
      registry.register(testTemplate);
      registry.register(testTemplate2);
      
      const templates = registry.list();
      assert.strictEqual(templates.length, 2);
      assert.ok(templates.includes(testTemplate));
      assert.ok(templates.includes(testTemplate2));
    });

    it('should return empty array after clearing', () => {
      registry.register(testTemplate);
      registry.register(testTemplate2);
      registry.clear();
      
      const templates = registry.list();
      assert.strictEqual(templates.length, 0);
    });
  });

  describe('search', () => {
    beforeEach(() => {
      registry.register(testTemplate);
      registry.register(testTemplate2);
    });

    it('should search by template name', () => {
      const results = registry.search('test-template');
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0]?.name, 'test-template');
    });

    it('should search by description', () => {
      const results = registry.search('unit testing');
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0]?.name, 'test-template');
    });

    it('should search by author', () => {
      const results = registry.search('Test Author');
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0]?.name, 'test-template');
    });

    it('should search by tags', () => {
      const results = registry.search('example');
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0]?.name, 'test-template');
    });

    it('should be case insensitive', () => {
      const results = registry.search('TEST-TEMPLATE');
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0]?.name, 'test-template');
    });

    it('should return multiple results for partial matches', () => {
      const results = registry.search('template');
      assert.strictEqual(results.length, 2);
    });

    it('should return empty array for no matches', () => {
      const results = registry.search('non-existent');
      assert.strictEqual(results.length, 0);
    });

    it('should handle empty search query', () => {
      const results = registry.search('');
      assert.strictEqual(results.length, 2);
    });

    it('should search across multiple fields', () => {
      const results = registry.search('test');
      assert.strictEqual(results.length, 2);
    });
  });

  describe('getByTag', () => {
    beforeEach(() => {
      registry.register(testTemplate);
      registry.register(testTemplate2);
    });

    it('should return templates with exact tag match', () => {
      const results = registry.getByTag('example');
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0]?.name, 'test-template');
    });

    it('should return multiple templates with same tag', () => {
      const results = registry.getByTag('test');
      assert.strictEqual(results.length, 2);
    });

    it('should return empty array for non-existent tag', () => {
      const results = registry.getByTag('non-existent');
      assert.strictEqual(results.length, 0);
    });

    it('should be case sensitive for exact matches', () => {
      const results = registry.getByTag('EXAMPLE');
      assert.strictEqual(results.length, 0);
    });
  });

  describe('getByAuthor', () => {
    beforeEach(() => {
      registry.register(testTemplate);
      registry.register(testTemplate2);
    });

    it('should return templates by exact author match', () => {
      const results = registry.getByAuthor('Test Author');
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0]?.name, 'test-template');
    });

    it('should be case insensitive', () => {
      const results = registry.getByAuthor('test author');
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0]?.name, 'test-template');
    });

    it('should return empty array for non-existent author', () => {
      const results = registry.getByAuthor('Non Existent Author');
      assert.strictEqual(results.length, 0);
    });

    it('should return multiple templates by same author', () => {
      const anotherTemplate: MockTemplate = {
        ...testTemplate,
        name: 'third-template',
        author: 'Test Author'
      };
      registry.register(anotherTemplate);
      
      const results = registry.getByAuthor('Test Author');
      assert.strictEqual(results.length, 2);
    });
  });

  describe('getByCategory', () => {
    beforeEach(() => {
      registry.register(testTemplate);
      registry.register(testTemplate2);
    });

    it('should return templates by category (partial tag match)', () => {
      const results = registry.getByCategory('test');
      assert.strictEqual(results.length, 2);
    });

    it('should be case insensitive', () => {
      const results = registry.getByCategory('TEST');
      assert.strictEqual(results.length, 2);
    });

    it('should return empty array for non-existent category', () => {
      const results = registry.getByCategory('non-existent');
      assert.strictEqual(results.length, 0);
    });

    it('should handle partial matches correctly', () => {
      const results = registry.getByCategory('examp');
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0]?.name, 'test-template');
    });
  });

  describe('getPopular and getRecent', () => {
    beforeEach(() => {
      registry.register(testTemplate);
      registry.register(testTemplate2);
    });

    it('should return all templates for getPopular', () => {
      const results = registry.getPopular();
      assert.strictEqual(results.length, 2);
    });

    it('should return all templates for getRecent', () => {
      const results = registry.getRecent();
      assert.strictEqual(results.length, 2);
    });

    it('should return empty array when no templates registered', () => {
      registry.clear();
      assert.strictEqual(registry.getPopular().length, 0);
      assert.strictEqual(registry.getRecent().length, 0);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle templates with empty tags array', () => {
      const templateWithEmptyTags: MockTemplate = {
        ...testTemplate,
        name: 'empty-tags-template',
        tags: []
      };
      
      registry.register(templateWithEmptyTags);
      assert.strictEqual(registry.getCount(), 1);
    });

    it('should handle templates with very long content', () => {
      const longContent = 'x'.repeat(100000);
      const templateWithLongContent: MockTemplate = {
        ...testTemplate,
        name: 'long-content-template',
        files: [
          {
            path: 'src/large-file.ts',
            content: longContent,
            permissions: 0o644,
            executable: false
          }
        ]
      };
      
      registry.register(templateWithLongContent);
      assert.strictEqual(registry.getCount(), 1);
    });

    it('should handle special characters in template names', () => {
      const specialTemplate: MockTemplate = {
        ...testTemplate,
        name: 'template-with-special-chars-@#$%',
        description: 'Template with special characters'
      };
      
      registry.register(specialTemplate);
      assert.strictEqual(registry.getCount(), 1);
      assert.strictEqual(registry.isRegistered('template-with-special-chars-@#$%'), true);
    });

    it('should handle unicode characters in content', () => {
      const unicodeTemplate: MockTemplate = {
        ...testTemplate,
        name: 'unicode-template',
        files: [
          {
            path: 'src/unicode.ts',
            content: 'const message = "Hello 世界 🌍";',
            permissions: 0o644,
            executable: false
          }
        ]
      };
      
      registry.register(unicodeTemplate);
      assert.strictEqual(registry.getCount(), 1);
    });
  });

  describe('performance and memory', () => {
    it('should handle large number of templates efficiently', () => {
      const startTime = Date.now();
      
      // Register 1000 templates
      for (let i = 0; i < 1000; i++) {
        const template: MockTemplate = {
          name: `template-${i}`,
          description: `Template number ${i}`,
          version: '1.0.0',
          author: `Author ${i}`,
          tags: [`tag${i}`, 'common'],
          files: [
            {
              path: `src/file${i}.ts`,
              content: `console.log("Template ${i}");`,
              permissions: 0o644,
              executable: false
            }
          ],
          config: {
            name: `template-${i}`,
            description: `Template number ${i}`,
            version: '1.0.0',
            author: `Author ${i}`,
            tags: [`tag${i}`, 'common'],
            variables: []
          }
        };
        registry.register(template);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      assert.strictEqual(registry.getCount(), 1000);
      assert.ok(duration < 1000, `Registration took too long: ${duration}ms`);
    });

    it('should handle frequent search operations efficiently', () => {
      // Register templates
      for (let i = 0; i < 100; i++) {
        const template: MockTemplate = {
          name: `template-${i}`,
          description: `Template number ${i}`,
          version: '1.0.0',
          author: `Author ${i}`,
          tags: [`tag${i}`, 'common'],
          files: [
            {
              path: `src/file${i}.ts`,
              content: `console.log("Template ${i}");`,
              permissions: 0o644,
              executable: false
            }
          ],
          config: {
            name: `template-${i}`,
            description: `Template number ${i}`,
            version: '1.0.0',
            author: `Author ${i}`,
            tags: [`tag${i}`, 'common'],
            variables: []
          }
        };
        registry.register(template);
      }
      
      const startTime = Date.now();
      
      // Perform 1000 search operations
      for (let i = 0; i < 1000; i++) {
        registry.search(`tag${i % 100}`);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      assert.ok(duration < 1000, `Search operations took too long: ${duration}ms`);
    });
  });
});