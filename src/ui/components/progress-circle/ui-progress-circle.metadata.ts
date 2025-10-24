import { ComponentMetadata } from '../../metadata.js';

export const uiProgressCircleMetadata: ComponentMetadata = {
  tag: 'ui-progress-circle',
  name: 'Progress Circle',
  category: 'Feedback',
  description: 'A circular progress indicator with percentage display. Color changes based on progress level.',
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
      name: 'maxValue',
      type: 'number',
      default: '100',
      description: 'Maximum progress value',
      isAttribute: true,
    },
    {
      name: 'size',
      type: 'number',
      default: '100',
      description: 'Size in pixels',
      isAttribute: true,
    },
    {
      name: 'strokeWidth',
      type: 'number',
      default: '4',
      description: 'Stroke width in pixels',
      isAttribute: true,
    },
    {
      name: 'color',
      type: 'string | undefined',
      description: 'Custom color override',
      isAttribute: true,
    },
    {
      name: 'showLabel',
      type: 'boolean',
      default: 'true',
      description: 'Display percentage label',
      isAttribute: true,
    },
  ],
  events: [],
  slots: [],
  cssProps: [],
  examples: [
    {
      title: 'Basic Progress Circle',
      code: `<ui-progress-circle value="65"></ui-progress-circle>`,
      description: '65% progress indicator',
    },
    {
      title: 'Full Progress',
      code: `<ui-progress-circle value="100"></ui-progress-circle>`,
      description: '100% progress (green)',
    },
    {
      title: 'Large Circle',
      code: `<ui-progress-circle value="50" size="150" strokeWidth="6"></ui-progress-circle>`,
      description: 'Large progress circle',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-progress-circle',
};
