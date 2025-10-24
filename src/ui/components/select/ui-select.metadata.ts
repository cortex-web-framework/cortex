import { ComponentMetadata } from '../../metadata.js';

/**
 * Metadata for the ui-select component.
 */
export const uiSelectMetadata: ComponentMetadata = {
  tag: 'ui-select',
  name: 'Select',
  category: 'Basic Input Controls',
  description:
    'A customizable dropdown select component with support for single/multiple selection, search filtering, keyboard navigation, and form integration. Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'options',
      type: 'SelectOption[]',
      description:
        'Array of available options. Each option has label, value, and optional description',
      isAttribute: true,
    },
    {
      name: 'value',
      type: 'string | string[] | null',
      default: 'null',
      description:
        'Currently selected value(s). String for single mode, array for multiple mode',
      isAttribute: true,
    },
    {
      name: 'placeholder',
      type: 'string',
      default: '"Select an option"',
      description: 'Placeholder text shown when no selection made',
      isAttribute: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Label text displayed above the select',
      isAttribute: true,
    },
    {
      name: 'multiple',
      type: 'boolean',
      default: false,
      description:
        'If true, allows multiple selections. Value becomes an array',
      isAttribute: true,
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: false,
      description: 'If true, the select is disabled and cannot be opened',
      isAttribute: true,
    },
    {
      name: 'required',
      type: 'boolean',
      default: false,
      description:
        'If true, a selection is required. Shows required indicator (*)',
      isAttribute: true,
    },
    {
      name: 'searchable',
      type: 'boolean',
      default: false,
      description:
        'If true, enables search/filter input in the dropdown',
      isAttribute: true,
    },
    {
      name: 'name',
      type: 'string',
      description: 'Form field name for form submission',
      isAttribute: true,
    },
  ],
  events: [
    {
      name: 'change',
      detail:
        'CustomEvent<{ value: string|string[]|null, label?: string, previousValue?: string|string[]|null }>',
      description: 'Emitted when the selection changes',
    },
    {
      name: 'open',
      detail: 'CustomEvent<void>',
      description: 'Emitted when the dropdown opens',
    },
    {
      name: 'close',
      detail: 'CustomEvent<void>',
      description: 'Emitted when the dropdown closes',
    },
  ],
  cssProps: [
    {
      name: '--ui-select-border-color',
      description: 'Border color of the select button',
      default: 'var(--ui-color-border, #ddd)',
    },
    {
      name: '--ui-select-background',
      description: 'Background color of the select button',
      default: 'white',
    },
    {
      name: '--ui-select-hover-color',
      description: 'Background color on hover',
      default: '#f5f5f5',
    },
  ],
  examples: [
    {
      title: 'Basic Select',
      code: `<ui-select placeholder="Choose a color">
  <script>
    const select = document.currentScript.previousElementSibling;
    select.options = [
      { label: 'Red', value: 'red' },
      { label: 'Green', value: 'green' },
      { label: 'Blue', value: 'blue' }
    ];
  </script>
</ui-select>`,
      description: 'Simple dropdown with color options',
    },
    {
      title: 'Select with Label',
      code: `<ui-select label="Choose your country" placeholder="Select...">
  <!-- populated with options -->
</ui-select>`,
      description: 'Select with descriptive label above',
    },
    {
      title: 'Multiple Selection',
      code: `<ui-select label="Select tags" multiple>
  <!-- populated with tag options -->
</ui-select>`,
      description: 'Multi-select mode allowing multiple selections',
    },
    {
      title: 'Searchable Select',
      code: `<ui-select label="Find user" searchable>
  <!-- populated with user options -->
</ui-select>`,
      description: 'Select with search/filter capability',
    },
    {
      title: 'Required Select',
      code: `<ui-select label="Choose category" required></ui-select>`,
      description: 'Required select with validation',
    },
    {
      title: 'Disabled Select',
      code: `<ui-select value="disabled-option" disabled></ui-select>`,
      description: 'Disabled select that cannot be opened',
    },
  ],
  issueUrl:
    'https://github.com/cortexproject/cortex/issues?q=label%3Aui-select',
};
