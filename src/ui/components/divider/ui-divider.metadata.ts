import { ComponentMetadata } from '../../metadata.js';

export const uiDividerMetadata: ComponentMetadata = {
  tag: 'ui-divider',
  name: 'Divider',
  category: 'Layout',
  description:
    'A simple divider/separator component for visually separating content. Supports horizontal and vertical orientations with multiple line variants (solid, dashed, dotted). Optional text label for dividing sections with titles. Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description: 'Direction of the divider line',
      isAttribute: true,
    },
    {
      name: 'variant',
      type: "'default' | 'dashed' | 'dotted'",
      default: "'default'",
      description: 'Style of the divider line',
      isAttribute: true,
    },
    {
      name: 'text',
      type: 'string',
      description: 'Optional label text displayed on the divider',
      isAttribute: true,
    },
  ],
  events: [],
  slots: [],
  cssProps: [
    {
      name: '--ui-color-border',
      description: 'Color of the divider line',
      default: '#ddd',
    },
  ],
  examples: [
    {
      title: 'Basic Divider',
      code: `<ui-divider></ui-divider>`,
      description: 'Simple horizontal divider line',
    },
    {
      title: 'Divider with Text',
      code: `<ui-divider text="Section Break"></ui-divider>`,
      description: 'Divider with centered text label',
    },
    {
      title: 'Dashed Divider',
      code: `<ui-divider variant="dashed"></ui-divider>`,
      description: 'Dashed style divider',
    },
    {
      title: 'Dotted Divider',
      code: `<ui-divider variant="dotted"></ui-divider>`,
      description: 'Dotted style divider',
    },
    {
      title: 'Vertical Divider',
      code: `<ui-divider orientation="vertical"></ui-divider>`,
      description: 'Vertical divider for side-by-side layouts',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-divider',
};
