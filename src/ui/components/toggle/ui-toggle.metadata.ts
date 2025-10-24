import { ComponentMetadata } from '../../metadata.js';

export const uiToggleMetadata: ComponentMetadata = {
  tag: 'ui-toggle',
  name: 'Toggle',
  category: 'Basic Input Controls',
  description:
    'A toggle switch component for boolean values. Supports required validation, disabled state, and form integration. Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'checked',
      type: 'boolean',
      default: false,
      description: 'If true, the toggle is in the on/checked state',
      isAttribute: true,
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: false,
      description: 'If true, the toggle cannot be interacted with',
      isAttribute: true,
    },
    {
      name: 'required',
      type: 'boolean',
      default: false,
      description: 'If true, the toggle must be checked to be valid',
      isAttribute: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Label text displayed next to the toggle',
      isAttribute: true,
    },
    {
      name: 'name',
      type: 'string',
      description: 'Form field name for form submission',
      isAttribute: true,
    },
  ],
  events: [
    {
      name: 'change',
      detail: 'CustomEvent<{ checked: boolean }>',
      description: 'Emitted when the toggle state changes',
    },
  ],
  slots: [],
  cssProps: [
    {
      name: '--ui-toggle-width',
      description: 'Width of the toggle switch',
      default: '48px',
    },
    {
      name: '--ui-toggle-height',
      description: 'Height of the toggle switch',
      default: '28px',
    },
    {
      name: '--ui-toggle-on-color',
      description: 'Color when toggle is on',
      default: 'var(--ui-color-success, #28a745)',
    },
  ],
  examples: [
    {
      title: 'Basic Toggle',
      code: '<ui-toggle></ui-toggle>',
      description: 'Simple toggle switch',
    },
    {
      title: 'Toggle with Label',
      code: '<ui-toggle label="Enable notifications"></ui-toggle>',
      description: 'Toggle with descriptive label',
    },
    {
      title: 'Checked Toggle',
      code: '<ui-toggle label="Dark mode" checked></ui-toggle>',
      description: 'Toggle switch in checked/on state',
    },
    {
      title: 'Disabled Toggle',
      code: '<ui-toggle label="Unavailable" disabled></ui-toggle>',
      description: 'Disabled toggle that cannot be interacted with',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-toggle',
};
