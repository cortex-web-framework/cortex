import { ComponentMetadata } from '../../metadata.js';

export const uiPopoverMetadata: ComponentMetadata = {
  tag: 'ui-popover',
  name: 'Popover',
  category: 'Popover',
  description:
    'A content-rich popover component for displaying detailed information. Supports header text, custom width, multiple positioning options, and trigger modes. Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'headerText',
      type: 'string | undefined',
      description: 'Optional header text displayed at the top of the popover',
      isAttribute: true,
    },
    {
      name: 'position',
      type: "'top' | 'bottom' | 'left' | 'right' | 'auto'",
      default: "'bottom'",
      description: 'Position of the popover relative to the trigger',
      isAttribute: true,
    },
    {
      name: 'trigger',
      type: "'hover' | 'click' | 'focus'",
      default: "'click'",
      description: 'How to trigger the popover display',
      isAttribute: true,
    },
    {
      name: 'width',
      type: 'string | undefined',
      default: "'320px'",
      description: 'Width of the popover content',
      isAttribute: true,
    },
    {
      name: 'visible',
      type: 'boolean',
      default: 'false',
      description: 'Whether the popover is currently visible',
      isAttribute: false,
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disable the popover from showing',
      isAttribute: true,
    },
  ],
  events: [],
  slots: [
    {
      name: 'default',
      description: 'The element that triggers the popover',
    },
    {
      name: 'body',
      description: 'The content displayed in the popover body',
    },
  ],
  cssProps: [
    {
      name: '--ui-color-surface',
      description: 'Background color of popover',
      default: '#ffffff',
    },
    {
      name: '--ui-color-text',
      description: 'Text color of popover',
      default: '#000000',
    },
    {
      name: '--ui-color-border',
      description: 'Border color of popover',
      default: '#dddddd',
    },
  ],
  examples: [
    {
      title: 'Click Popover',
      code: `<ui-popover headerText="Settings">
  <button>Open Settings</button>
  <div slot="body">
    <p>Configure your preferences here</p>
  </div>
</ui-popover>`,
      description: 'Popover triggered by click with header',
    },
    {
      title: 'Custom Width',
      code: `<ui-popover width="400px">
  <button>More Info</button>
  <div slot="body">
    <p>Extended content goes here with more room</p>
  </div>
</ui-popover>`,
      description: 'Popover with custom width',
    },
    {
      title: 'Hover Popover',
      code: `<ui-popover headerText="Help" trigger="hover" position="top">
  <button>Hover for help</button>
  <div slot="body">
    <p>Hover tooltip with rich content</p>
  </div>
</ui-popover>`,
      description: 'Popover triggered by hover',
    },
    {
      title: 'Disabled Popover',
      code: `<ui-popover headerText="Coming Soon" disabled>
  <button>Feature</button>
  <div slot="body">Not available yet</div>
</ui-popover>`,
      description: 'Disabled popover that will not show',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-popover',
};
