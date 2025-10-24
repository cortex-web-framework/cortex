import { ComponentMetadata } from '../../metadata.js';

export const uiSliderMetadata: ComponentMetadata = {
  tag: 'ui-slider',
  name: 'Slider',
  category: 'Form',
  description: 'Range slider input control.',
  since: '1.0.0',
  props: [
    { name: 'min', type: 'number', description: 'Minimum value', isAttribute: true },
    { name: 'max', type: 'number', description: 'Maximum value', isAttribute: true },
    { name: 'step', type: 'number', description: 'Step increment', isAttribute: true },
    { name: 'value', type: 'number', description: 'Current value', isAttribute: true },
    { name: 'disabled', type: 'boolean', description: 'Disabled state', isAttribute: true },
  ],
  events: [{ name: 'change', detail: '{ value: number }', description: 'Fired when value changes' }],
  slots: [],
  cssProps: [],
  examples: [],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-slider',
};
