import { ComponentMetadata } from '../../metadata.js';

export const uiInputGroupMetadata: ComponentMetadata = {
  tag: 'ui-input-group',
  name: 'Input Group',
  category: 'Form',
  description: 'Input with optional before/after addons.',
  since: '1.0.0',
  props: [
    { name: 'beforeText', type: 'string', description: 'Before addon text', isAttribute: true },
    { name: 'afterText', type: 'string', description: 'After addon text', isAttribute: true },
    { name: 'error', type: 'string', description: 'Error message', isAttribute: true },
    { name: 'disabled', type: 'boolean', description: 'Disabled state', isAttribute: true },
  ],
  events: [],
  slots: [{ name: 'default', description: 'Input element' }],
  cssProps: [],
  examples: [],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-input-group',
};
