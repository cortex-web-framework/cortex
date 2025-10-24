import { ComponentMetadata } from '../../metadata.js';

export const uiTimelineMetadata: ComponentMetadata = {
  tag: 'ui-timeline',
  name: 'Timeline',
  category: 'Display',
  description: 'A timeline component for displaying sequential processes or events. Supports vertical and horizontal layouts.',
  since: '1.0.0',
  props: [
    {
      name: 'items',
      type: 'TimelineItem[]',
      default: '[]',
      description: 'Array of timeline items',
      isAttribute: false,
    },
    {
      name: 'orientation',
      type: "'vertical' | 'horizontal'",
      default: "'vertical'",
      description: 'Timeline layout direction',
      isAttribute: true,
    },
  ],
  events: [],
  slots: [],
  cssProps: [],
  examples: [
    {
      title: 'Vertical Timeline',
      code: `<ui-timeline></ui-timeline>\n<script>\nconst tl = document.querySelector('ui-timeline');\ntl.addItem({ title: 'Step 1', status: 'completed' });\ntl.addItem({ title: 'Step 2', status: 'completed' });\ntl.addItem({ title: 'Step 3', status: 'pending' });\n</script>`,
      description: 'Vertical timeline with multiple items',
    },
    {
      title: 'Horizontal Timeline',
      code: `<ui-timeline orientation="horizontal"></ui-timeline>`,
      description: 'Horizontal timeline layout',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-timeline',
};
