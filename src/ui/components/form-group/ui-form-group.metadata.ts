import { ComponentMetadata } from '../../metadata.js';

export const uiFormGroupMetadata: ComponentMetadata = {
  tag: 'ui-form-group',
  name: 'Form Group',
  category: 'Form',
  description: 'Form field wrapper with label and validation messaging.',
  since: '1.0.0',
  props: [
    { name: 'label', type: 'string', description: 'Field label', isAttribute: true },
    { name: 'required', type: 'boolean', description: 'Mark field as required', isAttribute: true },
    { name: 'disabled', type: 'boolean', description: 'Disabled state', isAttribute: true },
    { name: 'error', type: 'string', description: 'Error message', isAttribute: true },
  ],
  events: [],
  slots: [{ name: 'default', description: 'Form control element' }],
  cssProps: [],
  examples: [],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-form-group',
};
