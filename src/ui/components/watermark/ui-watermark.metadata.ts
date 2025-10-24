import { ComponentMetadata } from '../../metadata.js';

export const uiWatermarkMetadata: ComponentMetadata = {
  tag: 'ui-watermark',
  name: 'Watermark',
  category: 'Layout',
  description: 'Background watermark text overlay.',
  since: '1.0.0',
  props: [
    { name: 'text', type: 'string', description: 'Watermark text', isAttribute: true },
    { name: 'opacity', type: 'number', description: 'Text opacity (0-1)', isAttribute: true },
    { name: 'fontSize', type: 'number', description: 'Font size in pixels', isAttribute: true },
    { name: 'angle', type: 'number', description: 'Text rotation angle', isAttribute: true },
  ],
  events: [],
  slots: [{ name: 'default', description: 'Content to display over watermark' }],
  cssProps: [],
  examples: [],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-watermark',
};
