import { ComponentMetadata } from '../../metadata.js';

export const uiTagMetadata: ComponentMetadata = {
  tag: 'ui-tag',
  name: 'Tag',
  category: 'Display',
  description:
    'A tag component for labeling and categorizing content. Supports multiple variants, sizes, and optional close button. Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'label',
      type: 'string | undefined',
      description: 'The text content of the tag',
      isAttribute: true,
    },
    {
      name: 'variant',
      type: "'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'",
      default: "'default'",
      description: 'Semantic color variant',
      isAttribute: true,
    },
    {
      name: 'size',
      type: "'small' | 'medium' | 'large'",
      default: "'medium'",
      description: 'Size of the tag',
      isAttribute: true,
    },
    {
      name: 'closable',
      type: 'boolean',
      default: 'false',
      description: 'Show close button to remove tag',
      isAttribute: true,
    },
  ],
  events: [],
  slots: [],
  cssProps: [
    {
      name: '--ui-color-primary',
      description: 'Color for primary variant',
      default: '#007bff',
    },
    {
      name: '--ui-color-success',
      description: 'Color for success variant',
      default: '#28a745',
    },
    {
      name: '--ui-color-warning',
      description: 'Color for warning variant',
      default: '#ffc107',
    },
    {
      name: '--ui-color-error',
      description: 'Color for error variant',
      default: '#dc3545',
    },
  ],
  examples: [
    {
      title: 'Basic Tag',
      code: `<ui-tag label="JavaScript"></ui-tag>`,
      description: 'Simple tag with label',
    },
    {
      title: 'Success Variant',
      code: `<ui-tag label="Active" variant="success"></ui-tag>`,
      description: 'Green success tag',
    },
    {
      title: 'Closable Tag',
      code: `<ui-tag label="Removable" closable></ui-tag>`,
      description: 'Tag with close button',
    },
    {
      title: 'Large Error Tag',
      code: `<ui-tag label="Critical" variant="error" size="large"></ui-tag>`,
      description: 'Large error tag',
    },
    {
      title: 'Small Info Tag',
      code: `<ui-tag label="v1.0" variant="info" size="small"></ui-tag>`,
      description: 'Small info tag',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-tag',
};
