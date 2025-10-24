import { ComponentMetadata } from '../../metadata.js';

export const uiModalMetadata: ComponentMetadata = {
  tag: 'ui-modal',
  name: 'Modal',
  category: 'Feedback',
  description:
    'A modal dialog component for displaying important content that requires user interaction. Supports multiple size options, customizable close behavior, and keyboard navigation. Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'isOpen',
      type: 'boolean',
      default: false,
      description: 'Whether the modal is open or closed',
      isAttribute: true,
    },
    {
      name: 'modalTitle',
      type: 'string',
      description: 'Title text displayed in the modal header',
      isAttribute: true,
    },
    {
      name: 'size',
      type: "'small' | 'medium' | 'large' | 'fullscreen'",
      default: "'medium'",
      description: 'Size of the modal dialog',
      isAttribute: true,
    },
    {
      name: 'closeOnEscape',
      type: 'boolean',
      default: true,
      description: 'Close modal when Escape key is pressed',
      isAttribute: true,
    },
    {
      name: 'closeOnBackdrop',
      type: 'boolean',
      default: true,
      description: 'Close modal when backdrop is clicked',
      isAttribute: true,
    },
    {
      name: 'backdrop',
      type: 'boolean',
      default: true,
      description: 'Show semi-transparent backdrop behind modal',
      isAttribute: true,
    },
  ],
  events: [
    {
      name: 'open',
      detail: 'CustomEvent<{ isOpen: boolean }>',
      description: 'Emitted when the modal opens',
    },
    {
      name: 'close',
      detail: 'CustomEvent<{ isOpen: boolean }>',
      description: 'Emitted when the modal closes',
    },
    {
      name: 'backdrop-click',
      detail: 'CustomEvent<{}>',
      description: 'Emitted when the backdrop is clicked',
    },
  ],
  slots: [
    {
      name: 'content',
      description: 'Main content area of the modal',
    },
    {
      name: 'footer',
      description: 'Footer area for buttons and actions',
    },
  ],
  cssProps: [
    {
      name: '--ui-modal-width',
      description: 'Width of the modal dialog',
      default: '500px (medium)',
    },
    {
      name: '--ui-modal-max-height',
      description: 'Maximum height of the modal',
      default: '90vh',
    },
    {
      name: '--ui-modal-bg',
      description: 'Background color of the modal',
      default: 'white',
    },
  ],
  examples: [
    {
      title: 'Basic Modal',
      code: `<ui-modal modalTitle="Confirm Action">
  <div slot="content">Are you sure you want to continue?</div>
  <div slot="footer">
    <button>Cancel</button>
    <button>Confirm</button>
  </div>
</ui-modal>`,
      description: 'Simple modal with title and actions',
    },
    {
      title: 'Large Modal',
      code: `<ui-modal modalTitle="Create New Item" size="large">
  <form slot="content">
    <!-- form fields -->
  </form>
  <div slot="footer">
    <button>Cancel</button>
    <button>Create</button>
  </div>
</ui-modal>`,
      description: 'Large modal suitable for forms',
    },
    {
      title: 'No Backdrop Modal',
      code: `<ui-modal modalTitle="Settings" backdrop="false" closeOnBackdrop="false">
  <div slot="content">Modal settings content</div>
</ui-modal>`,
      description: 'Modal without backdrop, click outside to close disabled',
    },
    {
      title: 'Programmatic Control',
      code: `<ui-modal id="myModal" modalTitle="Confirm">
  <div slot="content">Proceed with action?</div>
  <div slot="footer">
    <button onclick="document.getElementById('myModal').close()">No</button>
    <button>Yes</button>
  </div>
</ui-modal>
<script>
  const modal = document.getElementById('myModal');
  modal.open();
</script>`,
      description: 'Control modal with JavaScript methods',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-modal',
};
