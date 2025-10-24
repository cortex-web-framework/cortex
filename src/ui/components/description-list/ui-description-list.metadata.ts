import { ComponentMetadata } from '../../metadata.js';

export const uiDescriptionListMetadata: ComponentMetadata = {
  tag: 'ui-description-list',
  name: 'Description List',
  category: 'Data Display',
  description: 'Display term-description pairs.',
  since: '1.0.0',
  props: [
    { name: 'items', type: 'DescriptionItem[]', description: 'List items', isAttribute: false },
    { name: 'bordered', type: 'boolean', description: 'Add borders between items', isAttribute: true },
  ],
  events: [],
  slots: [],
  cssProps: [],
  examples: [],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-description-list',
};
