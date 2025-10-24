import { ComponentMetadata } from '../../metadata.js';
export const uiSwitchMetadata: ComponentMetadata = {
  tag: 'ui-switch',
  name: 'Switch',
  category: 'Input',
  description: 'Toggle switch component.',
  since: '1.0.0',
  props: [
    { name: 'checked', type: 'boolean', default: 'false', description: 'Checked state', isAttribute: true },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disabled state', isAttribute: true },
  ],
  events: [],
  slots: [],
  cssProps: [],
  examples: [],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-switch',
};
