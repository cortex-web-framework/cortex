import { ComponentMetadata } from '../../metadata.js';

export const uiTooltipMetadata: ComponentMetadata = {
  tag: 'ui-tooltip',
  name: 'Tooltip',
  category: 'Popover',
  description:
    'A contextual hint component that displays additional information on interaction. Supports hover, click, and focus triggers with positioning options. Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'content',
      type: 'string | undefined',
      description: 'The text content to display in the tooltip',
      isAttribute: true,
    },
    {
      name: 'position',
      type: "'top' | 'bottom' | 'left' | 'right'",
      default: "'top'",
      description: 'Position of the tooltip relative to the trigger',
      isAttribute: true,
    },
    {
      name: 'trigger',
      type: "'hover' | 'click' | 'focus'",
      default: "'hover'",
      description: 'How to trigger the tooltip display',
      isAttribute: true,
    },
    {
      name: 'visible',
      type: 'boolean',
      default: 'false',
      description: 'Whether the tooltip is currently visible',
      isAttribute: false,
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disable the tooltip from showing',
      isAttribute: true,
    },
  ],
  events: [],
  slots: [
    {
      name: 'default',
      description: 'The element that triggers the tooltip',
    },
  ],
  cssProps: [
    {
      name: '--ui-color-surface-dark',
      description: 'Background color of tooltip',
      default: '#333333',
    },
    {
      name: '--ui-color-text-light',
      description: 'Text color of tooltip',
      default: '#ffffff',
    },
  ],
  examples: [
    {
      title: 'Hover Tooltip',
      code: `<ui-tooltip content="Click to save">
  <button>Save</button>
</ui-tooltip>`,
      description: 'Tooltip appears on mouse hover',
    },
    {
      title: 'Click Tooltip',
      code: `<ui-tooltip content="More information" trigger="click">
  <button>Help</button>
</ui-tooltip>`,
      description: 'Tooltip triggered by click',
    },
    {
      title: 'Bottom Position',
      code: `<ui-tooltip content="Bottom tooltip" position="bottom">
  <button>Info</button>
</ui-tooltip>`,
      description: 'Tooltip positioned below the trigger',
    },
    {
      title: 'Disabled Tooltip',
      code: `<ui-tooltip content="This is disabled" disabled>
  <button>Can\'t see me</button>
</ui-tooltip>`,
      description: 'Disabled tooltip will not show',
    },
    {
      title: 'Focus Trigger',
      code: `<ui-tooltip content="Enter your name" trigger="focus">
  <input type="text" placeholder="Name">
</ui-tooltip>`,
      description: 'Tooltip appears on focus',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-tooltip',
};
