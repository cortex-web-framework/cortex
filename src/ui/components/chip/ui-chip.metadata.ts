import { ComponentMetadata } from '../../metadata.js';

export const uiChipMetadata: ComponentMetadata = {
  tag: 'ui-chip',
  name: 'Chip',
  category: 'Display',
  description:
    'A compact labeled component for displaying tags, filters, or selections. Supports multiple variants (default, outlined, filled), optional remove button, and selected/disabled states. Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'label',
      type: 'string',
      default: '""',
      description: 'The text label of the chip',
      isAttribute: true,
    },
    {
      name: 'variant',
      type: "'default' | 'outlined' | 'filled'",
      default: "'default'",
      description: 'Visual variant of the chip',
      isAttribute: true,
    },
    {
      name: 'removable',
      type: 'boolean',
      default: 'false',
      description: 'Show remove button',
      isAttribute: true,
    },
    {
      name: 'selected',
      type: 'boolean',
      default: 'false',
      description: 'Mark chip as selected',
      isAttribute: true,
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disable the chip',
      isAttribute: true,
    },
  ],
  events: [
    {
      name: 'remove',
      description: 'Emitted when the remove button is clicked',
      detail: '{}',
    },
  ],
  slots: [],
  cssProps: [
    {
      name: '--ui-color-primary',
      description: 'Primary color for filled variant',
      default: '#007bff',
    },
    {
      name: '--ui-color-surface-light',
      description: 'Background for default variant',
      default: '#e9ecef',
    },
  ],
  examples: [
    {
      title: 'Basic Chip',
      code: `<ui-chip label="JavaScript"></ui-chip>`,
      description: 'Simple chip with label',
    },
    {
      title: 'Removable Chip',
      code: `<ui-chip label="React" removable=""></ui-chip>`,
      description: 'Chip with remove button',
    },
    {
      title: 'Selected Chip',
      code: `<ui-chip label="Active" selected=""></ui-chip>`,
      description: 'Visually marked as selected',
    },
    {
      title: 'Outlined Variant',
      code: `<ui-chip label="Tag" variant="outlined"></ui-chip>`,
      description: 'Outlined style chip',
    },
    {
      title: 'Filled Variant',
      code: `<ui-chip label="Filter" variant="filled"></ui-chip>`,
      description: 'Filled style chip',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-chip',
};
