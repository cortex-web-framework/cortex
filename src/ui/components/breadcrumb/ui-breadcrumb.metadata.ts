import { ComponentMetadata } from '../../metadata.js';

export const uiBreadcrumbMetadata: ComponentMetadata = {
  tag: 'ui-breadcrumb',
  name: 'Breadcrumb',
  category: 'Navigation',
  description:
    'A breadcrumb navigation component for displaying the current page location within a hierarchy. Supports custom separators, disabled states, and navigation events. Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'items',
      type: 'BreadcrumbItem[]',
      description: 'Array of breadcrumb items with label, href, disabled, and current properties',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disable all breadcrumb navigation',
      isAttribute: true,
    },
    {
      name: 'separator',
      type: 'string',
      default: '"/"',
      description: 'Character(s) to display between breadcrumb items',
      isAttribute: true,
    },
  ],
  events: [
    {
      name: 'navigate',
      description: 'Emitted when a breadcrumb link is clicked',
      detail: '{ href: string }',
    },
  ],
  slots: [],
  cssProps: [
    {
      name: '--ui-color-primary',
      description: 'Color of breadcrumb links',
      default: '#007bff',
    },
    {
      name: '--ui-color-text',
      description: 'Color of breadcrumb text',
      default: '#000',
    },
    {
      name: '--ui-color-text-light',
      description: 'Color of separator and inactive text',
      default: '#666',
    },
  ],
  examples: [
    {
      title: 'Basic Breadcrumb',
      code: `<ui-breadcrumb></ui-breadcrumb>
<script>
  const breadcrumb = document.querySelector('ui-breadcrumb');
  breadcrumb.items = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Electronics', href: '/electronics' }
  ];
</script>`,
      description: 'Basic breadcrumb navigation',
    },
    {
      title: 'Custom Separator',
      code: `<ui-breadcrumb separator=">"></ui-breadcrumb>`,
      description: 'Breadcrumb with custom separator',
    },
    {
      title: 'With Navigation Event',
      code: `<ui-breadcrumb></ui-breadcrumb>
<script>
  const breadcrumb = document.querySelector('ui-breadcrumb');
  breadcrumb.addEventListener('navigate', (e) => {
    console.log('Navigate to:', e.detail.href);
    window.location.href = e.detail.href;
  });
</script>`,
      description: 'Breadcrumb with navigation event handling',
    },
    {
      title: 'Disabled Item',
      code: `<ui-breadcrumb></ui-breadcrumb>
<script>
  const breadcrumb = document.querySelector('ui-breadcrumb');
  breadcrumb.items = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products', disabled: true },
    { label: 'Electronics', href: '/electronics' }
  ];
</script>`,
      description: 'Breadcrumb with disabled items',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-breadcrumb',
};
