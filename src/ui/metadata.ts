/**
 * Metadata system for Cortex UI components.
 * Provides strict TypeScript interfaces for component documentation.
 * Zero external dependencies.
 */

/**
 * Describes a single component property/attribute.
 */
export interface PropSchema {
  /** Property/attribute name */
  name: string;
  /** Property type as TypeScript string literal */
  type: string;
  /** Human-readable description */
  description?: string;
  /** Default value (optional) */
  default?: unknown;
  /** Whether the property is required */
  required?: boolean;
  /** Whether this is an attribute vs property */
  isAttribute?: boolean;
}

/**
 * Describes a custom event emitted by the component.
 */
export interface EventSchema {
  /** Event name */
  name: string;
  /** CustomEvent detail type as TypeScript string literal */
  detail: string;
  /** Human-readable description */
  description?: string;
}

/**
 * Describes a named slot in the component.
 */
export interface SlotSchema {
  /** Slot name ('default' for unnamed slot) */
  name: string;
  /** Human-readable description */
  description?: string;
}

/**
 * Describes a CSS custom property exposed by the component.
 */
export interface CssPropertySchema {
  /** CSS custom property name (e.g., --ui-button-color) */
  name: string;
  /** Human-readable description */
  description?: string;
  /** Default value if applicable */
  default?: string;
}

/**
 * Describes a usage example of the component.
 */
export interface ExampleSchema {
  /** Example title */
  title: string;
  /** HTML code showing usage */
  code: string;
  /** Optional description */
  description?: string;
}

/**
 * Complete metadata for a UI component.
 */
export interface ComponentMetadata {
  /** HTML tag name (e.g., 'ui-button') */
  tag: string;
  /** Human-readable component name */
  name: string;
  /** Detailed description of the component */
  description: string;
  /** Component category for organization */
  category?: string;
  /** Array of component properties */
  props: PropSchema[];
  /** Array of custom events */
  events: EventSchema[];
  /** Array of named slots (optional) */
  slots?: SlotSchema[];
  /** Array of exposed CSS custom properties (optional) */
  cssProps?: CssPropertySchema[];
  /** Array of usage examples (optional) */
  examples?: ExampleSchema[];
  /** Whether component is experimental */
  experimental?: boolean;
  /** Release version when component was introduced */
  since?: string;
  /** GitHub issue URL for feedback */
  issueUrl?: string;
}

/**
 * Registry for component metadata.
 * Provides type-safe storage and querying of component metadata.
 */
export class ComponentRegistry {
  private metadata: Map<string, ComponentMetadata> = new Map();

  /**
   * Register a component's metadata.
   * @param meta Component metadata
   * @throws Error if component tag already registered
   */
  register(meta: ComponentMetadata): void {
    if (this.metadata.has(meta.tag)) {
      throw new Error(`Component ${meta.tag} is already registered`);
    }
    this.metadata.set(meta.tag, meta);
  }

  /**
   * Retrieve metadata for a component by tag.
   * @param tag Component tag name
   * @returns Component metadata or undefined if not found
   */
  get(tag: string): ComponentMetadata | undefined {
    return this.metadata.get(tag);
  }

  /**
   * List all registered components.
   * @returns Array of all registered component metadata
   */
  list(): ComponentMetadata[] {
    return Array.from(this.metadata.values());
  }

  /**
   * List components by category.
   * @param category Category name
   * @returns Array of components in the category
   */
  listByCategory(category: string): ComponentMetadata[] {
    return this.list().filter((meta) => meta.category === category);
  }

  /**
   * Get all categories with registered components.
   * @returns Array of unique category names
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    for (const meta of this.metadata.values()) {
      if (meta.category) {
        categories.add(meta.category);
      }
    }
    return Array.from(categories).sort();
  }

  /**
   * Get count of registered components.
   * @returns Number of registered components
   */
  size(): number {
    return this.metadata.size;
  }

  /**
   * Clear all registered metadata.
   */
  clear(): void {
    this.metadata.clear();
  }
}

/**
 * Global component registry instance.
 */
export const globalRegistry = new ComponentRegistry();
