import { ComponentMetadata } from '../../metadata.js';

export const uiPaginationMetadata: ComponentMetadata = {
  tag: 'ui-pagination',
  name: 'Pagination',
  category: 'Navigation',
  description:
    'A pagination component for navigating through pages of content. Supports customizable visible page count, first/last buttons, and disabled states. Emits change events with page number detail. Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'currentPage',
      type: 'number',
      default: '1',
      description: 'The current active page number',
      isAttribute: true,
    },
    {
      name: 'totalPages',
      type: 'number',
      default: '0',
      description: 'Total number of pages',
      isAttribute: true,
    },
    {
      name: 'maxVisiblePages',
      type: 'number',
      default: '5',
      description: 'Maximum number of page buttons to show (excludes prev/next)',
      isAttribute: true,
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables all pagination controls',
      isAttribute: true,
    },
    {
      name: 'showFirstLast',
      type: 'boolean',
      default: 'false',
      description: 'Show first and last page buttons',
      isAttribute: true,
    },
  ],
  events: [
    {
      name: 'change',
      description: 'Emitted when the current page changes',
      detail: '{ page: number }',
    },
  ],
  slots: [],
  cssProps: [
    {
      name: '--ui-color-primary',
      description: 'Primary color for active page and hover states',
      default: '#007bff',
    },
    {
      name: '--ui-color-border',
      description: 'Border color of pagination buttons',
      default: '#ddd',
    },
    {
      name: '--ui-color-surface',
      description: 'Background color of pagination buttons',
      default: '#fff',
    },
    {
      name: '--ui-color-text',
      description: 'Text color of pagination buttons',
      default: '#000',
    },
  ],
  examples: [
    {
      title: 'Basic Pagination',
      code: `<ui-pagination currentPage="1" totalPages="10"></ui-pagination>`,
      description: 'Default pagination with 10 pages',
    },
    {
      title: 'With First/Last Buttons',
      code: `<ui-pagination currentPage="1" totalPages="20" showFirstLast=""></ui-pagination>`,
      description: 'Pagination showing first and last page buttons',
    },
    {
      title: 'More Visible Pages',
      code: `<ui-pagination currentPage="5" totalPages="50" maxVisiblePages="7"></ui-pagination>`,
      description: 'Pagination showing 7 page numbers at a time',
    },
    {
      title: 'Disabled State',
      code: `<ui-pagination disabled="" currentPage="1" totalPages="10"></ui-pagination>`,
      description: 'Disabled pagination control',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-pagination',
};
