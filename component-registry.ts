/**
 * Component Registry Implementation
 * Zero Dependencies - Super Clean Code - Strict TypeScript
 */

export interface ComponentInfo {
  readonly name: string;
  readonly tagName: string;
  readonly category: string;
  readonly description: string;
  readonly implemented: boolean;
  readonly version: string;
  readonly dependencies: readonly string[];
  readonly props: readonly string[];
  readonly events: readonly string[];
}

export interface ComponentRegistry {
  readonly components: readonly ComponentInfo[];
  readonly totalCount: number;
  readonly categories: readonly string[];
  readonly version: string;
}

export type ComponentCategory = 
  | 'Buttons & Selection'
  | 'Text Inputs & Forms'
  | 'Display & Feedback'
  | 'Navigation'
  | 'Layout & Structure'
  | 'Data Display'
  | 'Overlays & Interactions'
  | 'Utilities & Special';

export class ComponentRegistryManager {
  private static readonly REGISTRY_VERSION = '1.0.0';
  
  private static readonly COMPONENT_CATEGORIES: readonly ComponentCategory[] = [
    'Buttons & Selection',
    'Text Inputs & Forms',
    'Display & Feedback',
    'Navigation',
    'Layout & Structure',
    'Data Display',
    'Overlays & Interactions',
    'Utilities & Special'
  ] as const;

  private static readonly COMPONENT_DEFINITIONS: readonly ComponentInfo[] = [
    // Buttons & Selection
    {
      name: 'button',
      tagName: 'ui-button',
      category: 'Buttons & Selection',
      description: 'Interactive button component with multiple variants and states',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['variant', 'size', 'disabled', 'loading', 'type'],
      events: ['click', 'focus', 'blur']
    },
    {
      name: 'checkbox',
      tagName: 'ui-checkbox',
      category: 'Buttons & Selection',
      description: 'Binary choice input with checked/unchecked states',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['checked', 'disabled', 'indeterminate', 'label'],
      events: ['change', 'focus', 'blur']
    },
    {
      name: 'radio',
      tagName: 'ui-radio',
      category: 'Buttons & Selection',
      description: 'Single-choice input from multiple options',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['name', 'value', 'checked', 'disabled', 'label'],
      events: ['change', 'focus', 'blur']
    },
    {
      name: 'switch',
      tagName: 'ui-switch',
      category: 'Buttons & Selection',
      description: 'Toggle switch for binary on/off states',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['checked', 'disabled', 'label'],
      events: ['change', 'focus', 'blur']
    },
    {
      name: 'toggle',
      tagName: 'ui-toggle',
      category: 'Buttons & Selection',
      description: 'Binary state toggle with visual feedback',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['checked', 'disabled'],
      events: ['change', 'focus', 'blur']
    },

    // Text Inputs & Forms
    {
      name: 'text-input',
      tagName: 'ui-text-input',
      category: 'Text Inputs & Forms',
      description: 'Single-line text input with validation support',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['value', 'placeholder', 'disabled', 'required', 'type', 'maxlength'],
      events: ['input', 'change', 'focus', 'blur']
    },
    {
      name: 'textarea',
      tagName: 'ui-textarea',
      category: 'Text Inputs & Forms',
      description: 'Multi-line text input for longer content',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['value', 'placeholder', 'disabled', 'required', 'rows', 'maxlength'],
      events: ['input', 'change', 'focus', 'blur']
    },
    {
      name: 'number-input',
      tagName: 'ui-number-input',
      category: 'Text Inputs & Forms',
      description: 'Numeric input with increment/decrement controls',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['value', 'min', 'max', 'step', 'disabled', 'required'],
      events: ['input', 'change', 'focus', 'blur']
    },
    {
      name: 'select',
      tagName: 'ui-select',
      category: 'Text Inputs & Forms',
      description: 'Dropdown selection input with search capability',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['value', 'placeholder', 'disabled', 'required', 'multiple'],
      events: ['change', 'focus', 'blur']
    },
    {
      name: 'autocomplete',
      tagName: 'ui-autocomplete',
      category: 'Text Inputs & Forms',
      description: 'Text input with dropdown suggestions and filtering',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['value', 'placeholder', 'options', 'disabled', 'required'],
      events: ['input', 'change', 'select', 'focus', 'blur']
    },
    {
      name: 'date-picker',
      tagName: 'ui-date-picker',
      category: 'Text Inputs & Forms',
      description: 'Date selection input with calendar interface',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['value', 'min', 'max', 'disabled', 'required'],
      events: ['change', 'focus', 'blur']
    },
    {
      name: 'color-picker',
      tagName: 'ui-color-picker',
      category: 'Text Inputs & Forms',
      description: 'Color selection input with visual picker',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['value', 'disabled', 'required'],
      events: ['change', 'focus', 'blur']
    },
    {
      name: 'slider',
      tagName: 'ui-slider',
      category: 'Text Inputs & Forms',
      description: 'Range input for numeric value selection',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['value', 'min', 'max', 'step', 'disabled', 'required'],
      events: ['input', 'change', 'focus', 'blur']
    },
    {
      name: 'file-upload',
      tagName: 'ui-file-upload',
      category: 'Text Inputs & Forms',
      description: 'File selection and upload interface component',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['accept', 'multiple', 'disabled', 'required'],
      events: ['change', 'focus', 'blur']
    },
    {
      name: 'form-field',
      tagName: 'ui-form-field',
      category: 'Text Inputs & Forms',
      description: 'Form input wrapper with label and validation',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['label', 'required', 'error', 'hint'],
      events: []
    },
    {
      name: 'form-group',
      tagName: 'ui-form-group',
      category: 'Text Inputs & Forms',
      description: 'Grouped form fields with consistent spacing',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['label', 'required'],
      events: []
    },
    {
      name: 'input-group',
      tagName: 'ui-input-group',
      category: 'Text Inputs & Forms',
      description: 'Input with attached text or buttons',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['size', 'disabled'],
      events: []
    },

    // Display & Feedback
    {
      name: 'badge',
      tagName: 'ui-badge',
      category: 'Display & Feedback',
      description: 'Small status indicators and notification badges',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['content', 'variant', 'pill', 'dot'],
      events: []
    },
    {
      name: 'tag',
      tagName: 'ui-tag',
      category: 'Display & Feedback',
      description: 'Categorization and labeling component',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['variant', 'removable', 'disabled'],
      events: ['remove']
    },
    {
      name: 'chip',
      tagName: 'ui-chip',
      category: 'Display & Feedback',
      description: 'Compact input element for tags and selections',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['variant', 'removable', 'disabled'],
      events: ['remove']
    },
    {
      name: 'avatar',
      tagName: 'ui-avatar',
      category: 'Display & Feedback',
      description: 'User profile image or initials display component',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['src', 'initials', 'size', 'alt'],
      events: []
    },
    {
      name: 'alert',
      tagName: 'ui-alert',
      category: 'Display & Feedback',
      description: 'Dismissible alert messages for user feedback',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['type', 'message', 'dismissible', 'visible'],
      events: ['dismiss', 'show', 'hide']
    },
    {
      name: 'progress-bar',
      tagName: 'ui-progress-bar',
      category: 'Display & Feedback',
      description: 'Linear progress indicator for task completion',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['value', 'max', 'indeterminate', 'variant'],
      events: []
    },
    {
      name: 'progress-circle',
      tagName: 'ui-progress-circle',
      category: 'Display & Feedback',
      description: 'Circular progress indicator for loading states',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['value', 'max', 'indeterminate', 'variant'],
      events: []
    },
    {
      name: 'spinner',
      tagName: 'ui-spinner',
      category: 'Display & Feedback',
      description: 'Loading indicator with rotating animation',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['size', 'variant'],
      events: []
    },
    {
      name: 'skeleton',
      tagName: 'ui-skeleton',
      category: 'Display & Feedback',
      description: 'Loading placeholder with content structure',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['width', 'height', 'variant'],
      events: []
    },
    {
      name: 'rating',
      tagName: 'ui-rating',
      category: 'Display & Feedback',
      description: 'Star-based rating input and display component',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['value', 'max', 'readonly', 'disabled'],
      events: ['change']
    },

    // Navigation
    {
      name: 'breadcrumb',
      tagName: 'ui-breadcrumb',
      category: 'Navigation',
      description: 'Navigation breadcrumb trail for page hierarchy',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['items', 'separator'],
      events: ['navigate']
    },
    {
      name: 'tabs',
      tagName: 'ui-tabs',
      category: 'Navigation',
      description: 'Tabbed interface for organizing related content',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['activeTab', 'variant'],
      events: ['change']
    },
    {
      name: 'pagination',
      tagName: 'ui-pagination',
      category: 'Navigation',
      description: 'Page navigation for large data sets',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['currentPage', 'totalPages', 'showFirstLast', 'showPrevNext'],
      events: ['change']
    },
    {
      name: 'menu',
      tagName: 'ui-menu',
      category: 'Navigation',
      description: 'Dropdown menu with trigger and option list',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['open', 'placement', 'trigger'],
      events: ['open', 'close', 'select']
    },

    // Layout & Structure
    {
      name: 'card',
      tagName: 'ui-card',
      category: 'Layout & Structure',
      description: 'Content container with header, body, and footer sections',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['elevation', 'variant'],
      events: []
    },
    {
      name: 'divider',
      tagName: 'ui-divider',
      category: 'Layout & Structure',
      description: 'Visual separator line for content organization',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['orientation', 'variant'],
      events: []
    },
    {
      name: 'label',
      tagName: 'ui-label',
      category: 'Layout & Structure',
      description: 'Form field labels with accessibility support',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['for', 'required', 'disabled'],
      events: []
    },
    {
      name: 'hint',
      tagName: 'ui-hint',
      category: 'Layout & Structure',
      description: 'Helper text and guidance for form inputs',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['variant'],
      events: []
    },
    {
      name: 'code',
      tagName: 'ui-code',
      category: 'Layout & Structure',
      description: 'Syntax-highlighted code block display component',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['language', 'theme'],
      events: []
    },
    {
      name: 'description-list',
      tagName: 'ui-description-list',
      category: 'Layout & Structure',
      description: 'Structured data display with terms and definitions',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['variant'],
      events: []
    },
    {
      name: 'timeline',
      tagName: 'ui-timeline',
      category: 'Layout & Structure',
      description: 'Chronological event display component',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['variant', 'orientation'],
      events: []
    },
    {
      name: 'stepper',
      tagName: 'ui-stepper',
      category: 'Layout & Structure',
      description: 'Step-by-step process navigation component',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['currentStep', 'steps', 'orientation'],
      events: ['change']
    },
    {
      name: 'accordion',
      tagName: 'ui-accordion',
      category: 'Layout & Structure',
      description: 'Collapsible content sections with expand/collapse functionality',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['allowMultiple', 'disabled'],
      events: ['itemOpened', 'itemClosed']
    },

    // Data Display
    {
      name: 'table',
      tagName: 'ui-table',
      category: 'Data Display',
      description: 'Data table with sorting, filtering, and pagination',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['data', 'columns', 'striped', 'bordered', 'hover'],
      events: ['sort', 'filter', 'select']
    },
    {
      name: 'stat',
      tagName: 'ui-stat',
      category: 'Data Display',
      description: 'Statistical data display with trends and values',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['headingText', 'resultTitle', 'trend', 'trendValue'],
      events: []
    },
    {
      name: 'empty-state',
      tagName: 'ui-empty-state',
      category: 'Data Display',
      description: 'Placeholder content when no data is available',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['headingText', 'resultTitle', 'icon'],
      events: []
    },
    {
      name: 'result',
      tagName: 'ui-result',
      category: 'Data Display',
      description: 'Success/error state display with actions',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['headingText', 'resultTitle', 'type', 'icon'],
      events: []
    },

    // Overlays & Interactions
    {
      name: 'modal',
      tagName: 'ui-modal',
      category: 'Overlays & Interactions',
      description: 'Overlay dialog for focused user interactions',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['visible', 'title', 'size', 'closable'],
      events: ['open', 'close', 'confirm', 'cancel']
    },
    {
      name: 'popover',
      tagName: 'ui-popover',
      category: 'Overlays & Interactions',
      description: 'Contextual information overlay on hover/focus',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['visible', 'placement', 'trigger'],
      events: ['show', 'hide']
    },
    {
      name: 'tooltip',
      tagName: 'ui-tooltip',
      category: 'Overlays & Interactions',
      description: 'Contextual help text on hover or focus',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['content', 'placement', 'trigger'],
      events: ['show', 'hide']
    },
    {
      name: 'toast',
      tagName: 'ui-toast',
      category: 'Overlays & Interactions',
      description: 'Temporary notification messages with auto-dismiss',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['type', 'message', 'duration', 'position'],
      events: ['show', 'hide']
    },

    // Utilities & Special
    {
      name: 'copy',
      tagName: 'ui-copy',
      category: 'Utilities & Special',
      description: 'One-click text copying functionality with feedback',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['copyable', 'text'],
      events: ['copy', 'error']
    },
    {
      name: 'link',
      tagName: 'ui-link',
      category: 'Utilities & Special',
      description: 'Styled anchor links with hover states',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['href', 'target', 'variant', 'disabled'],
      events: ['click']
    },
    {
      name: 'carousel',
      tagName: 'ui-carousel',
      category: 'Utilities & Special',
      description: 'Image or content slider with navigation controls',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['currentSlide', 'showControls', 'autoplay', 'interval'],
      events: ['change', 'next', 'prev']
    },
    {
      name: 'tile',
      tagName: 'ui-tile',
      category: 'Utilities & Special',
      description: 'Grid-based content display component',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['variant', 'elevation'],
      events: ['click']
    },
    {
      name: 'watermark',
      tagName: 'ui-watermark',
      category: 'Utilities & Special',
      description: 'Background text overlay for content protection',
      implemented: true,
      version: '1.0.0',
      dependencies: [],
      props: ['content', 'opacity', 'angle'],
      events: []
    }
  ] as const;

  static getRegistry(): ComponentRegistry {
    return {
      components: this.COMPONENT_DEFINITIONS,
      totalCount: this.COMPONENT_DEFINITIONS.length,
      categories: this.COMPONENT_CATEGORIES,
      version: this.REGISTRY_VERSION
    };
  }

  static getComponent(name: string): ComponentInfo | undefined {
    return this.COMPONENT_DEFINITIONS.find(component => component.name === name);
  }

  static getComponentsByCategory(category: ComponentCategory): readonly ComponentInfo[] {
    return this.COMPONENT_DEFINITIONS.filter(component => component.category === category);
  }

  static getImplementedComponents(): readonly ComponentInfo[] {
    return this.COMPONENT_DEFINITIONS.filter(component => component.implemented);
  }

  static getComponentCount(): number {
    return this.COMPONENT_DEFINITIONS.length;
  }

  static getCategoryCounts(): Record<ComponentCategory, number> {
    const counts = {} as Record<ComponentCategory, number>;
    
    this.COMPONENT_CATEGORIES.forEach(category => {
      counts[category] = this.getComponentsByCategory(category).length;
    });
    
    return counts;
  }

  static validateComponent(name: string): boolean {
    return this.COMPONENT_DEFINITIONS.some(component => component.name === name);
  }

  static getComponentDependencies(name: string): readonly string[] {
    const component = this.getComponent(name);
    return component?.dependencies || [];
  }

  static getComponentProps(name: string): readonly string[] {
    const component = this.getComponent(name);
    return component?.props || [];
  }

  static getComponentEvents(name: string): readonly string[] {
    const component = this.getComponent(name);
    return component?.events || [];
  }
}

// Export the registry instance
export const componentRegistry = ComponentRegistryManager.getRegistry();
export const componentRegistryManager = ComponentRegistryManager;