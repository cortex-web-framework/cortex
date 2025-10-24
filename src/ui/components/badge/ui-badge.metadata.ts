import { ComponentMetadata } from '../../metadata.js';

export const uiBadgeMetadata: ComponentMetadata = {
  tag: 'ui-badge',
  name: 'Badge',
  category: 'Display',
  description:
    'A simple badge component for displaying status indicators, counts, or labels. Supports multiple variants (default, primary, success, warning, error, info), sizes (small, medium, large), and styles (default, pill, dot). Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'content',
      type: 'string',
      default: '""',
      description: 'Text content to display in the badge',
      isAttribute: true,
    },
    {
      name: 'variant',
      type: "'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'",
      default: "'default'",
      description: 'Color variant of the badge',
      isAttribute: true,
    },
    {
      name: 'size',
      type: "'small' | 'medium' | 'large'",
      default: "'medium'",
      description: 'Size of the badge',
      isAttribute: true,
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disable the badge',
      isAttribute: true,
    },
    {
      name: 'pill',
      type: 'boolean',
      default: 'false',
      description: 'Use pill-shaped style with more rounded borders',
      isAttribute: true,
    },
    {
      name: 'dot',
      type: 'boolean',
      default: 'false',
      description: 'Render as a small dot indicator',
      isAttribute: true,
    },
  ],
  events: [],
  slots: [],
  cssProps: [
    {
      name: '--ui-color-primary',
      description: 'Primary variant color',
      default: '#007bff',
    },
    {
      name: '--ui-color-surface-light',
      description: 'Default variant background color',
      default: '#e9ecef',
    },
  ],
  examples: [
    {
      title: 'Basic Badge',
      code: `<ui-badge content="5"></ui-badge>`,
      description: 'Simple badge with numeric content',
    },
    {
      title: 'Success Badge',
      code: `<ui-badge content="Active" variant="success"></ui-badge>`,
      description: 'Success-colored badge',
    },
    {
      title: 'Pill Badge',
      code: `<ui-badge content="New" variant="primary" pill=""></ui-badge>`,
      description: 'Pill-shaped badge',
    },
    {
      title: 'Dot Indicator',
      code: `<ui-badge variant="error" dot=""></ui-badge>`,
      description: 'Small dot badge for status indicators',
    },
    {
      title: 'Large Badge',
      code: `<ui-badge content="999+" size="large"></ui-badge>`,
      description: 'Large badge for prominent display',
    },
    {
      title: 'Warning State',
      code: `<ui-badge content="Pending" variant="warning"></ui-badge>`,
      description: 'Warning-colored badge',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-badge',
};
