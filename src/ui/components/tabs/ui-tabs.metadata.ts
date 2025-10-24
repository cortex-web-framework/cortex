import { ComponentMetadata } from '../../metadata.js';

export const uiTabsMetadata: ComponentMetadata = {
  tag: 'ui-tabs',
  name: 'Tabs',
  category: 'Navigation',
  description:
    'A tabbed interface component with keyboard navigation support. Provides multiple tab variants (default, pills, underline) and handles tab selection, addition, and removal. Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'tabs',
      type: 'TabItem[]',
      default: '[]',
      description: 'Array of tab objects with id and label',
      isAttribute: false,
    },
    {
      name: 'activeTabId',
      type: 'string | null',
      default: 'null',
      description: 'ID of the currently active tab',
      isAttribute: false,
    },
    {
      name: 'variant',
      type: "'default' | 'pills' | 'underline'",
      default: "'default'",
      description: 'Visual style variant of the tabs',
      isAttribute: true,
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: false,
      description: 'Disable all tabs',
      isAttribute: true,
    },
  ],
  events: [
    {
      name: 'change',
      detail: 'CustomEvent<{ activeTabId: string }>',
      description: 'Emitted when tab selection changes',
    },
  ],
  slots: [
    {
      name: 'panel-*',
      description: 'Content for each tab panel (use panel-{tabId})',
    },
  ],
  cssProps: [
    {
      name: '--ui-tabs-border-color',
      description: 'Border color of tab list',
      default: 'var(--ui-color-border, #ddd)',
    },
    {
      name: '--ui-tabs-active-color',
      description: 'Color of active tab',
      default: 'var(--ui-color-primary, #007bff)',
    },
    {
      name: '--ui-tabs-text-color',
      description: 'Text color of inactive tabs',
      default: 'var(--ui-color-text-light, #666)',
    },
  ],
  examples: [
    {
      title: 'Basic Tabs',
      code: `<ui-tabs id="basicTabs">
  <div slot="panel-tab1">Content for Tab 1</div>
  <div slot="panel-tab2">Content for Tab 2</div>
  <div slot="panel-tab3">Content for Tab 3</div>
</ui-tabs>
<script>
  const tabs = document.getElementById('basicTabs');
  tabs.tabs = [
    { id: 'tab1', label: 'Tab 1' },
    { id: 'tab2', label: 'Tab 2' },
    { id: 'tab3', label: 'Tab 3' }
  ];
</script>`,
      description: 'Simple tab interface with default styling',
    },
    {
      title: 'Pills Variant',
      code: `<ui-tabs variant="pills" id="pillTabs">
  <div slot="panel-home">Home content</div>
  <div slot="panel-profile">Profile content</div>
  <div slot="panel-settings">Settings content</div>
</ui-tabs>
<script>
  const tabs = document.getElementById('pillTabs');
  tabs.tabs = [
    { id: 'home', label: 'Home' },
    { id: 'profile', label: 'Profile' },
    { id: 'settings', label: 'Settings' }
  ];
</script>`,
      description: 'Tabs with pill-shaped buttons',
    },
    {
      title: 'Underline Variant',
      code: `<ui-tabs variant="underline" id="underlineTabs">
  <div slot="panel-overview">Overview content</div>
  <div slot="panel-details">Details content</div>
</ui-tabs>
<script>
  const tabs = document.getElementById('underlineTabs');
  tabs.tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'details', label: 'Details' }
  ];
</script>`,
      description: 'Tabs with underline indicator',
    },
    {
      title: 'Disabled Tabs',
      code: `<ui-tabs id="disabledTabs">
  <div slot="panel-enabled">Enabled content</div>
  <div slot="panel-disabled">Disabled content</div>
</ui-tabs>
<script>
  const tabs = document.getElementById('disabledTabs');
  tabs.tabs = [
    { id: 'enabled', label: 'Enabled Tab' },
    { id: 'disabled', label: 'Disabled Tab', disabled: true }
  ];
</script>`,
      description: 'Tabs with some disabled',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-tabs',
};
