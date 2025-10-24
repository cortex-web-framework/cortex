import { ComponentMetadata } from '../../metadata.js';

export const uiTableMetadata: ComponentMetadata = {
  tag: 'ui-table',
  name: 'Table',
  category: 'Data Display',
  description: 'Data table with sorting capabilities.',
  since: '1.0.0',
  props: [
    { name: 'columns', type: 'TableColumn[]', description: 'Table columns', isAttribute: false },
    { name: 'rows', type: 'TableRow[]', description: 'Table rows', isAttribute: false },
    { name: 'sortKey', type: 'string', description: 'Current sort column key', isAttribute: false },
    { name: 'sortDesc', type: 'boolean', description: 'Sort descending', isAttribute: false },
  ],
  events: [],
  slots: [],
  cssProps: [],
  examples: [],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-table',
};
