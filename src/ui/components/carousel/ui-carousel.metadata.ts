import { ComponentMetadata } from '../../metadata.js';

export const uiCarouselMetadata: ComponentMetadata = {
  tag: 'ui-carousel',
  name: 'Carousel',
  category: 'Display',
  description: 'Image carousel with automatic and manual navigation.',
  since: '1.0.0',
  props: [
    { name: 'items', type: 'CarouselItem[]', description: 'Items to display', isAttribute: false },
    { name: 'currentIndex', type: 'number', default: '0', description: 'Current item', isAttribute: true },
    { name: 'autoPlay', type: 'boolean', default: 'false', description: 'Auto rotate', isAttribute: true },
    { name: 'interval', type: 'number', default: '5000', description: 'Auto rotate interval', isAttribute: true },
  ],
  events: [],
  slots: [],
  cssProps: [],
  examples: [],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-carousel',
};
