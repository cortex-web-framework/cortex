import { ComponentMetadata } from '../../metadata.js';

export const uiHintMetadata: ComponentMetadata = {
  tag: 'ui-hint',
  name: 'Hint',
  category: 'Text',
  description: 'Small hint or help text with optional type styling.',
  since: '1.0.0',
  props: [
    { name: 'text', type: 'string', description: 'Hint text content', isAttribute: true },
    { name: 'type', type: "'info' | 'warning' | 'error' | 'success'", description: 'Hint type', isAttribute: true },
  ],
  events: [],
  slots: [],
  cssProps: [],
  examples: [],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-hint',
};
