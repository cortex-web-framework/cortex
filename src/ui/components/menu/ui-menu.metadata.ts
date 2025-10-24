import { ComponentMetadata } from '../../metadata.js';

export const uiMenuMetadata: ComponentMetadata = {
  tag: 'ui-menu',
  name: 'Menu',
  category: 'Navigation',
  description: 'Dropdown menu with selectable items.',
  since: '1.0.0',
  props: [
    { name: 'open', type: 'boolean', description: 'Menu open state', isAttribute: false },
    { name: 'items', type: 'MenuItem[]', description: 'Menu items', isAttribute: false },
    { name: 'selectedValue', type: 'string', description: 'Selected item value', isAttribute: false },
  ],
  events: [{ name: 'change', detail: '{ value: string }', description: 'Fired when menu item selected' }],
  slots: [],
  cssProps: [],
  examples: [],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-menu',
};
