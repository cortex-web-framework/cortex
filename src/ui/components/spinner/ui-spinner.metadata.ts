import { ComponentMetadata } from '../../metadata.js';

export const uiSpinnerMetadata: ComponentMetadata = {
  tag: 'ui-spinner',
  name: 'Spinner',
  category: 'Feedback',
  description:
    'A loading spinner component with multiple animation variants (ring, dots, wave) and size options. Displays a visual indicator for loading states with optional loading message. Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'size',
      type: "'small' | 'medium' | 'large'",
      default: "'medium'",
      description: 'Size of the spinner',
      isAttribute: true,
    },
    {
      name: 'variant',
      type: "'ring' | 'dots' | 'wave'",
      default: "'ring'",
      description: 'Animation style variant',
      isAttribute: true,
    },
    {
      name: 'message',
      type: 'string',
      description: 'Optional loading message',
      isAttribute: true,
    },
  ],
  events: [],
  slots: [],
  cssProps: [
    {
      name: '--ui-spinner-color',
      description: 'Color of the spinner animation',
      default: 'var(--ui-color-primary, #007bff)',
    },
    {
      name: '--ui-spinner-size-small',
      description: 'Size of small spinner',
      default: '24px',
    },
    {
      name: '--ui-spinner-size-medium',
      description: 'Size of medium spinner',
      default: '40px',
    },
    {
      name: '--ui-spinner-size-large',
      description: 'Size of large spinner',
      default: '64px',
    },
  ],
  examples: [
    {
      title: 'Basic Spinner',
      code: `<ui-spinner></ui-spinner>`,
      description: 'Default medium-sized ring spinner',
    },
    {
      title: 'Spinner with Message',
      code: `<ui-spinner size="medium" message="Loading..."></ui-spinner>`,
      description: 'Spinner with loading message',
    },
    {
      title: 'Dots Variant',
      code: `<ui-spinner variant="dots" size="large"></ui-spinner>`,
      description: 'Large dots-style spinner',
    },
    {
      title: 'Wave Variant',
      code: `<ui-spinner variant="wave" message="Please wait..."></ui-spinner>`,
      description: 'Wave-style spinner with message',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-spinner',
};
