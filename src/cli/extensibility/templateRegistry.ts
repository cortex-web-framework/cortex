/**
 * Template Registry Implementation
 * Zero dependencies, strictest TypeScript configuration
 */

import type { Template, TemplateRegistry } from './types.js';

/**
 * Template Registry Implementation
 */
export class CortexTemplateRegistry implements TemplateRegistry {
  private readonly templates = new Map<string, Template>();

  /**
   * Register a template
   */
  register(template: Template): void {
    if (this.templates.has(template.name)) {
      throw new Error(`Template '${template.name}' is already registered`);
    }
    
    this.templates.set(template.name, template);
  }

  /**
   * Unregister a template
   */
  unregister(templateName: string): void {
    if (!this.templates.has(templateName)) {
      throw new Error(`Template '${templateName}' is not registered`);
    }
    
    this.templates.delete(templateName);
  }

  /**
   * Get a template by name
   */
  get(templateName: string): Template | undefined {
    return this.templates.get(templateName);
  }

  /**
   * List all registered templates
   */
  list(): readonly Template[] {
    return Array.from(this.templates.values());
  }

  /**
   * Search templates by query
   */
  search(query: string): readonly Template[] {
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

  /**
   * Check if a template is registered
   */
  isRegistered(templateName: string): boolean {
    return this.templates.has(templateName);
  }

  /**
   * Get template count
   */
  getCount(): number {
    return this.templates.size;
  }

  /**
   * Clear all templates
   */
  clear(): void {
    this.templates.clear();
  }

  /**
   * Get templates by tag
   */
  getByTag(tag: string): readonly Template[] {
    return this.list().filter(template => 
      template.tags.includes(tag)
    );
  }

  /**
   * Get templates by author
   */
  getByAuthor(author: string): readonly Template[] {
    return this.list().filter(template => 
      template.author.toLowerCase() === author.toLowerCase()
    );
  }

  /**
   * Get templates by category
   */
  getByCategory(category: string): readonly Template[] {
    return this.list().filter(template => 
      template.tags.some(tag => 
        tag.toLowerCase().includes(category.toLowerCase())
      )
    );
  }

  /**
   * Get popular templates (by usage - placeholder for future implementation)
   */
  getPopular(): readonly Template[] {
    // For now, return all templates
    // In the future, this could track usage statistics
    return this.list();
  }

  /**
   * Get recent templates (by registration time - placeholder for future implementation)
   */
  getRecent(): readonly Template[] {
    // For now, return all templates
    // In the future, this could track registration timestamps
    return this.list();
  }
}