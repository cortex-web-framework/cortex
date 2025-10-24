import { ComponentMetadata } from '../../metadata.js';

export const uiLinkMetadata: ComponentMetadata = {
  tag: 'ui-link',
  name: 'Link',
  category: 'Navigation',
  description:
    'A hyperlink component with semantic meaning and theme support. Provides styled anchor element with disabled state, multiple color variants, and keyboard accessibility. Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'href',
      type: 'string | undefined',
      description: 'The URL to navigate to',
      isAttribute: true,
    },
    {
      name: 'target',
      type: "'_blank' | '_self' | '_parent' | '_top'",
      description: 'How to open the link (new tab, same window, etc)',
      isAttribute: true,
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disable the link and prevent navigation',
      isAttribute: true,
    },
    {
      name: 'variant',
      type: "'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'",
      default: "'default'",
      description: 'Semantic color variant for the link',
      isAttribute: true,
    },
    {
      name: 'underline',
      type: 'boolean',
      default: 'true',
      description: 'Show underline decoration on the link',
      isAttribute: true,
    },
  ],
  events: [],
  slots: [
    {
      name: 'default',
      description: 'The link text content',
    },
  ],
  cssProps: [
    {
      name: '--ui-color-text',
      description: 'Text color for default variant',
      default: '#000000',
    },
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
    {
      name: '--ui-color-info',
      description: 'Color for info variant',
      default: '#17a2b8',
    },
  ],
  examples: [
    {
      title: 'Basic Link',
      code: `<ui-link href="https://example.com">Visit Example</ui-link>`,
      description: 'Simple hyperlink with default styling',
    },
    {
      title: 'External Link',
      code: `<ui-link href="https://github.com" target="_blank">GitHub</ui-link>`,
      description: 'Link that opens in a new tab',
    },
    {
      title: 'Primary Variant',
      code: `<ui-link href="/dashboard" variant="primary">Dashboard</ui-link>`,
      description: 'Styled link with primary color',
    },
    {
      title: 'Disabled Link',
      code: `<ui-link href="/docs" disabled>Documentation (unavailable)</ui-link>`,
      description: 'Non-interactive disabled link',
    },
    {
      title: 'Without Underline',
      code: `<ui-link href="/profile" underline="false">My Profile</ui-link>`,
      description: 'Link without text decoration',
    },
    {
      title: 'Error Variant',
      code: `<ui-link href="/logout" variant="error">Sign Out</ui-link>`,
      description: 'Red danger-styled link',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-link',
};
