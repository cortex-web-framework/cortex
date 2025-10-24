import { ComponentMetadata } from '../../metadata.js';

export const uiProgressBarMetadata: ComponentMetadata = {
  tag: 'ui-progress-bar',
  name: 'Progress Bar',
  category: 'Feedback',
  description:
    'A progress bar component for displaying task completion status. Supports multiple variants (default, striped, animated), sizes (small, medium, large), colors, and states (determinate, indeterminate, disabled). Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'value',
      type: 'number',
      default: '0',
      description: 'Current progress value',
      isAttribute: true,
    },
    {
      name: 'max',
      type: 'number',
      default: '100',
      description: 'Maximum progress value',
      isAttribute: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Optional label to display above progress bar',
      isAttribute: true,
    },
    {
      name: 'showLabel',
      type: 'boolean',
      default: 'false',
      description: 'Show the label above the progress bar',
      isAttribute: true,
    },
    {
      name: 'showPercentage',
      type: 'boolean',
      default: 'false',
      description: 'Show percentage value next to label',
      isAttribute: true,
    },
    {
      name: 'variant',
      type: "'default' | 'striped' | 'animated'",
      default: "'default'",
      description: 'Visual variant of the progress bar',
      isAttribute: true,
    },
    {
      name: 'size',
      type: "'small' | 'medium' | 'large'",
      default: "'medium'",
      description: 'Size of the progress bar',
      isAttribute: true,
    },
    {
      name: 'color',
      type: "'primary' | 'success' | 'warning' | 'error' | 'info'",
      default: "'primary'",
      description: 'Color of the progress bar',
      isAttribute: true,
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disable the progress bar',
      isAttribute: true,
    },
    {
      name: 'indeterminate',
      type: 'boolean',
      default: 'false',
      description: 'Show indeterminate progress animation',
      isAttribute: true,
    },
  ],
  events: [],
  slots: [],
  cssProps: [
    {
      name: '--ui-color-primary',
      description: 'Primary color for progress bar',
      default: '#007bff',
    },
    {
      name: '--ui-color-border',
      description: 'Border/track color of progress bar',
      default: '#ddd',
    },
    {
      name: '--ui-color-text',
      description: 'Text color of labels',
      default: '#000',
    },
  ],
  examples: [
    {
      title: 'Basic Progress Bar',
      code: `<ui-progress-bar value="50" max="100"></ui-progress-bar>`,
      description: '50% progress bar',
    },
    {
      title: 'With Label and Percentage',
      code: `<ui-progress-bar value="75" max="100" label="Upload" showLabel="" showPercentage=""></ui-progress-bar>`,
      description: 'Progress bar showing label and percentage',
    },
    {
      title: 'Striped Variant',
      code: `<ui-progress-bar value="60" max="100" variant="striped"></ui-progress-bar>`,
      description: 'Striped progress bar pattern',
    },
    {
      title: 'Animated Variant',
      code: `<ui-progress-bar value="40" max="100" variant="animated"></ui-progress-bar>`,
      description: 'Animated progress bar',
    },
    {
      title: 'Indeterminate Progress',
      code: `<ui-progress-bar indeterminate="" label="Loading..."></ui-progress-bar>`,
      description: 'Indeterminate progress bar for unknown duration tasks',
    },
    {
      title: 'Success Color',
      code: `<ui-progress-bar value="100" max="100" color="success" showPercentage=""></ui-progress-bar>`,
      description: 'Completed task shown in success color',
    },
    {
      title: 'Large Size',
      code: `<ui-progress-bar value="50" max="100" size="large"></ui-progress-bar>`,
      description: 'Large progress bar',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-progress-bar',
};
