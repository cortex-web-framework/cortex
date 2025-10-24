import { ComponentMetadata } from '../../metadata.js';

export const uiCardMetadata: ComponentMetadata = {
  tag: 'ui-card',
  name: 'Card',
  category: 'Layout',
  description:
    'A card container component for grouping and presenting related content. Supports multiple variants (default, elevated, outlined, filled), optional titles/subtitles, clickable states, and link functionality. Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'title',
      type: 'string',
      description: 'Optional card title',
      isAttribute: true,
    },
    {
      name: 'subtitle',
      type: 'string',
      description: 'Optional card subtitle',
      isAttribute: true,
    },
    {
      name: 'variant',
      type: "'default' | 'elevated' | 'outlined' | 'filled'",
      default: "'default'",
      description: 'Visual variant of the card',
      isAttribute: true,
    },
    {
      name: 'clickable',
      type: 'boolean',
      default: 'false',
      description: 'Make the card interactive with hover effects',
      isAttribute: true,
    },
    {
      name: 'href',
      type: 'string',
      description: 'Optional link URL for clickable cards',
      isAttribute: true,
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disable the card',
      isAttribute: true,
    },
  ],
  events: [],
  slots: [
    {
      name: 'default',
      description: 'Main content area of the card',
    },
  ],
  cssProps: [
    {
      name: '--ui-color-surface',
      description: 'Background color of the card',
      default: '#fff',
    },
    {
      name: '--ui-color-border',
      description: 'Border color for outlined variant',
      default: '#ddd',
    },
  ],
  examples: [
    {
      title: 'Basic Card',
      code: `<ui-card title="Card Title">
  <p>Card content goes here</p>
</ui-card>`,
      description: 'Simple card with title and content',
    },
    {
      title: 'Card with Subtitle',
      code: `<ui-card title="Title" subtitle="Subtitle">
  <p>Content...</p>
</ui-card>`,
      description: 'Card with title and subtitle',
    },
    {
      title: 'Elevated Variant',
      code: `<ui-card variant="elevated" title="Elevated Card">
  Content with shadow effect
</ui-card>`,
      description: 'Card with elevation shadow',
    },
    {
      title: 'Outlined Variant',
      code: `<ui-card variant="outlined" title="Outlined Card">
  Card with border
</ui-card>`,
      description: 'Card with border outline',
    },
    {
      title: 'Clickable Card',
      code: `<ui-card title="Click Me" clickable="" href="/details">
  <p>Click this card to navigate</p>
</ui-card>`,
      description: 'Clickable card with link functionality',
    },
    {
      title: 'Filled Variant',
      code: `<ui-card variant="filled" title="Filled Card">
  <p>Card with filled background</p>
</ui-card>`,
      description: 'Card with filled background color',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-card',
};
