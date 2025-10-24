import { ComponentMetadata } from '../../metadata.js';

export const uiTileMetadata: ComponentMetadata = {
  tag: 'ui-tile',
  name: 'Tile',
  category: 'Data Display',
  description: 'Card-like tile for grid layouts with image support.',
  since: '1.0.0',
  props: [
    { name: 'imageUrl', type: 'string', description: 'Tile image URL', isAttribute: true },
    { name: 'title', type: 'string', description: 'Tile title', isAttribute: true },
    { name: 'description', type: 'string', description: 'Tile description', isAttribute: true },
    { name: 'href', type: 'string', description: 'Link destination', isAttribute: true },
  ],
  events: [],
  slots: [],
  cssProps: [],
  examples: [],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-tile',
};
