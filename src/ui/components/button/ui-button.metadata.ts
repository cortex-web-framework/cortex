import { ComponentMetadata } from '../../metadata.js';

/**
 * Metadata for the ui-button component.
 * Extracted from JSDoc and component analysis.
 */
export const uiButtonMetadata: ComponentMetadata = {
  tag: 'ui-button',
  name: 'Button',
  category: 'Buttons & Actions',
  description:
    'A customizable button component with support for different variants, sizes, disabled states, and loading indicators.',
  props: [
    {
      name: 'variant',
      type: '"primary" | "secondary" | "success" | "danger" | "warning" | "info" | "ghost"',
      default: '"primary"',
      description:
        'The visual style of the button. Determines the color scheme and appearance.',
      isAttribute: true,
    },
    {
      name: 'size',
      type: '"small" | "medium" | "large"',
      default: '"medium"',
      description: 'The size of the button content and padding.',
      isAttribute: true,
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: false,
      description:
        'If true, the button is disabled and prevents user interaction. Disabled state is visually indicated by reduced opacity.',
      isAttribute: true,
    },
    {
      name: 'loading',
      type: 'boolean',
      default: false,
      description:
        'If true, the button shows a loading spinner and is functionally disabled. Useful for async operations.',
      isAttribute: true,
    },
  ],
  events: [
    {
      name: 'click',
      detail: 'MouseEvent',
      description:
        'Fired when the button is clicked. Only fired if the button is not disabled or in loading state.',
    },
  ],
  slots: [
    {
      name: 'default',
      description: 'The content of the button. Can be text or any HTML elements.',
    },
  ],
  cssProps: [
    {
      name: '--ui-button-background-color',
      description: 'Background color of the button.',
      default: 'var(--ui-color-primary)',
    },
    {
      name: '--ui-button-color',
      description: 'Text color of the button.',
      default: 'var(--ui-color-background-default)',
    },
    {
      name: '--ui-button-border-color',
      description: 'Border color of the button.',
      default: 'var(--ui-color-primary)',
    },
    {
      name: '--ui-button-padding',
      description: 'Padding of the button.',
      default: 'var(--ui-spacing-md) var(--ui-spacing-lg)',
    },
    {
      name: '--ui-button-font-size',
      description: 'Font size of the button text.',
      default: 'var(--ui-font-size-md)',
    },
    {
      name: '--ui-button-border-radius',
      description: 'Border radius of the button.',
      default: 'var(--ui-border-radius-md)',
    },
  ],
  examples: [
    {
      title: 'Primary Button',
      code: '<ui-button variant="primary">Click me</ui-button>',
      description: 'Basic primary button with default size.',
    },
    {
      title: 'Button Sizes',
      code: `<ui-button size="small">Small</ui-button>
<ui-button size="medium">Medium</ui-button>
<ui-button size="large">Large</ui-button>`,
      description: 'Buttons in different sizes.',
    },
    {
      title: 'Button Variants',
      code: `<ui-button variant="primary">Primary</ui-button>
<ui-button variant="secondary">Secondary</ui-button>
<ui-button variant="success">Success</ui-button>
<ui-button variant="danger">Danger</ui-button>
<ui-button variant="warning">Warning</ui-button>
<ui-button variant="info">Info</ui-button>
<ui-button variant="ghost">Ghost</ui-button>`,
      description: 'Buttons with all available variants.',
    },
    {
      title: 'Disabled Button',
      code: '<ui-button disabled>Disabled</ui-button>',
      description: 'A disabled button that cannot be interacted with.',
    },
    {
      title: 'Loading Button',
      code: '<ui-button loading>Loading...</ui-button>',
      description:
        'A button with loading state showing a spinner and disabled state.',
    },
  ],
  since: '1.0.0',
  issueUrl:
    'https://github.com/cortexproject/cortex/issues?q=label%3Aui-button',
};
