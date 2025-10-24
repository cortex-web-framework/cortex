import { ComponentMetadata } from '../../metadata.js';

export const uiEmptyStateMetadata: ComponentMetadata = {
  tag: 'ui-empty-state',
  name: 'Empty State',
  category: 'Feedback',
  description:
    'A component for displaying empty or no-data states. Shows icon, title, and description to communicate the empty state to users. Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'headingText',
      type: 'string | undefined',
      description: 'Heading text for the empty state',
      isAttribute: true,
    },
    {
      name: 'description',
      type: 'string | undefined',
      description: 'Description text for the empty state',
      isAttribute: true,
    },
    {
      name: 'icon',
      type: 'string | undefined',
      description: 'Emoji or icon to display',
      isAttribute: true,
    },
  ],
  events: [],
  slots: [
    {
      name: 'default',
      description: 'Content to display below the empty state message (e.g., action buttons)',
    },
  ],
  cssProps: [
    {
      name: '--ui-color-text',
      description: 'Text color for title',
      default: '#333333',
    },
    {
      name: '--ui-color-text-light',
      description: 'Text color for description',
      default: '#999999',
    },
  ],
  examples: [
    {
      title: 'No Results',
      code: `<ui-empty-state icon="🔍" headingText="No Results" description="No items found matching your search"></ui-empty-state>`,
      description: 'Search no results state',
    },
    {
      title: 'Empty List',
      code: `<ui-empty-state icon="📝" headingText="Empty List" description="Start by creating your first item">
  <button>Create Item</button>
</ui-empty-state>`,
      description: 'Empty list with action button',
    },
    {
      title: 'No Data',
      code: `<ui-empty-state icon="📊" headingText="No Data Available" description="There is no data to display right now"></ui-empty-state>`,
      description: 'No data state',
    },
    {
      title: 'Error State',
      code: `<ui-empty-state icon="❌" headingText="Something went wrong" description="An error occurred while loading data">
  <button>Retry</button>
</ui-empty-state>`,
      description: 'Error state with retry button',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-empty-state',
};
