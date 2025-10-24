import { ComponentMetadata } from '../../metadata.js';

export const uiAccordionMetadata: ComponentMetadata = {
  tag: 'ui-accordion',
  name: 'Accordion',
  category: 'Layout',
  description:
    'A collapsible accordion component for organizing content into expandable/collapsible sections. Supports single or multiple open items, keyboard navigation, and disabled states. Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'items',
      type: 'AccordionItem[]',
      description: 'Array of accordion items with id, label, content, and optional disabled flag',
    },
    {
      name: 'openItems',
      type: 'Set<string>',
      description: 'Set of currently open item IDs',
    },
    {
      name: 'allowMultiple',
      type: 'boolean',
      default: 'false',
      description: 'Allow multiple items to be open simultaneously',
      isAttribute: true,
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disable all accordion controls',
      isAttribute: true,
    },
  ],
  events: [
    {
      name: 'itemOpened',
      description: 'Emitted when an item is opened',
      detail: '{ id: string }',
    },
    {
      name: 'itemClosed',
      description: 'Emitted when an item is closed',
      detail: '{ id: string }',
    },
  ],
  slots: [],
  cssProps: [
    {
      name: '--ui-color-border',
      description: 'Border color of accordion items',
      default: '#ddd',
    },
    {
      name: '--ui-color-surface',
      description: 'Background color of accordion items',
      default: '#fff',
    },
    {
      name: '--ui-color-text',
      description: 'Text color of accordion items',
      default: '#000',
    },
  ],
  examples: [
    {
      title: 'Basic Accordion',
      code: `<ui-accordion></ui-accordion>
<script>
  const accordion = document.querySelector('ui-accordion');
  accordion.items = [
    { id: '1', label: 'Section 1', content: 'Content 1' },
    { id: '2', label: 'Section 2', content: 'Content 2' }
  ];
</script>`,
      description: 'Basic accordion with two items',
    },
    {
      title: 'Multiple Open Items',
      code: `<ui-accordion allowMultiple=""></ui-accordion>`,
      description: 'Accordion allowing multiple items to be open at once',
    },
    {
      title: 'Disabled Item',
      code: `<ui-accordion></ui-accordion>
<script>
  const accordion = document.querySelector('ui-accordion');
  accordion.items = [
    { id: '1', label: 'Enabled', content: 'This item is enabled' },
    { id: '2', label: 'Disabled', content: 'This item is disabled', disabled: true }
  ];
</script>`,
      description: 'Accordion with a disabled item',
    },
    {
      title: 'With Event Listeners',
      code: `<ui-accordion></ui-accordion>
<script>
  const accordion = document.querySelector('ui-accordion');
  accordion.addEventListener('itemOpened', (e) => {
    console.log('Opened item:', e.detail.id);
  });
  accordion.addEventListener('itemClosed', (e) => {
    console.log('Closed item:', e.detail.id);
  });
</script>`,
      description: 'Accordion with item open/close event listeners',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-accordion',
};
