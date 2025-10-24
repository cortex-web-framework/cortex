import { ComponentMetadata } from '../../metadata.js';

export const uiRatingMetadata: ComponentMetadata = {
  tag: 'ui-rating',
  name: 'Rating',
  category: 'Input',
  description: 'A star rating component for user feedback. Supports interactive and readonly modes with configurable max value and sizes.',
  since: '1.0.0',
  props: [
    {
      name: 'value',
      type: 'number',
      default: '0',
      description: 'Current rating value',
      isAttribute: true,
    },
    {
      name: 'maxValue',
      type: 'number',
      default: '5',
      description: 'Maximum rating value',
      isAttribute: true,
    },
    {
      name: 'readonly',
      type: 'boolean',
      default: 'false',
      description: 'Disable interactive rating',
      isAttribute: true,
    },
    {
      name: 'size',
      type: "'small' | 'medium' | 'large'",
      default: "'medium'",
      description: 'Size of stars',
      isAttribute: true,
    },
  ],
  events: [],
  slots: [],
  cssProps: [],
  examples: [
    {
      title: 'Basic Rating',
      code: `<ui-rating value="3"></ui-rating>`,
      description: 'Interactive 5-star rating at 3 stars',
    },
    {
      title: 'Readonly Rating',
      code: `<ui-rating value="4" readonly></ui-rating>`,
      description: 'Non-interactive rating display',
    },
    {
      title: 'Large Rating',
      code: `<ui-rating value="5" size="large"></ui-rating>`,
      description: 'Large star rating',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-rating',
};
