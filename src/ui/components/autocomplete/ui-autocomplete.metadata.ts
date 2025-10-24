import { ComponentMetadata } from '../../metadata.js';

export const uiAutocompleteMetadata: ComponentMetadata = {
  tag: 'ui-autocomplete',
  name: 'Autocomplete',
  category: 'Advanced Input',
  description:
    'A searchable input component with autocomplete suggestions. Supports filtering, keyboard navigation, and custom rendering of suggestions. Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'options',
      type: 'AutocompleteOption[]',
      description: 'Array of suggestion options with label and value',
      isAttribute: true,
    },
    {
      name: 'value',
      type: 'string | null',
      default: 'null',
      description: 'Currently selected option value',
      isAttribute: true,
    },
    {
      name: 'placeholder',
      type: 'string',
      default: '"Search..."',
      description: 'Placeholder text in the input',
      isAttribute: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Label text displayed above the input',
      isAttribute: true,
    },
    {
      name: 'name',
      type: 'string',
      description: 'Form field name for form submission',
      isAttribute: true,
    },
    {
      name: 'required',
      type: 'boolean',
      default: false,
      description: 'If true, a selection is required',
      isAttribute: true,
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: false,
      description: 'If true, the input is disabled',
      isAttribute: true,
    },
    {
      name: 'minChars',
      type: 'number',
      default: 1,
      description: 'Minimum characters before showing suggestions',
      isAttribute: true,
    },
    {
      name: 'maxResults',
      type: 'number',
      default: 10,
      description: 'Maximum number of suggestions to display',
      isAttribute: true,
    },
  ],
  events: [
    {
      name: 'change',
      detail: 'CustomEvent<{ value: string | null }>',
      description: 'Emitted when an option is selected',
    },
    {
      name: 'input',
      detail: 'CustomEvent<{ value: string }>',
      description: 'Emitted when the search input changes',
    },
  ],
  slots: [],
  cssProps: [
    {
      name: '--ui-autocomplete-border-color',
      description: 'Border color of the input',
      default: 'var(--ui-color-border, #ddd)',
    },
    {
      name: '--ui-autocomplete-focus-color',
      description: 'Border color when focused',
      default: 'var(--ui-color-primary, #007bff)',
    },
    {
      name: '--ui-autocomplete-suggestion-bg',
      description: 'Background color of suggestion items',
      default: 'white',
    },
  ],
  examples: [
    {
      title: 'Basic Autocomplete',
      code: `<ui-autocomplete>
  <script>
    const autocomplete = document.currentScript.previousElementSibling;
    autocomplete.options = [
      { label: 'Apple', value: 'apple' },
      { label: 'Apricot', value: 'apricot' },
      { label: 'Banana', value: 'banana' }
    ];
  </script>
</ui-autocomplete>`,
      description: 'Simple autocomplete with fruit options',
    },
    {
      title: 'Autocomplete with Label',
      code: `<ui-autocomplete label="Search Users" placeholder="Enter name...">
  <script>
    const autocomplete = document.currentScript.previousElementSibling;
    autocomplete.options = [
      { label: 'Alice', value: 'alice' },
      { label: 'Bob', value: 'bob' }
    ];
  </script>
</ui-autocomplete>`,
      description: 'Autocomplete with label and placeholder',
    },
    {
      title: 'Autocomplete with Descriptions',
      code: `<ui-autocomplete label="Select Language">
  <script>
    const autocomplete = document.currentScript.previousElementSibling;
    autocomplete.options = [
      { label: 'JavaScript', value: 'js', description: 'Web & Node.js' },
      { label: 'Python', value: 'py', description: 'ML & Data Science' },
      { label: 'Rust', value: 'rs', description: 'Systems Programming' }
    ];
  </script>
</ui-autocomplete>`,
      description: 'Autocomplete with optional description fields',
    },
    {
      title: 'Required Autocomplete',
      code: `<ui-autocomplete label="Choose Option" required minChars="2" maxResults="5">
  <script>
    const autocomplete = document.currentScript.previousElementSibling;
    autocomplete.options = [
      { label: 'Option A', value: 'a' },
      { label: 'Option B', value: 'b' }
    ];
  </script>
</ui-autocomplete>`,
      description: 'Required autocomplete with minimum chars and max results',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-autocomplete',
};
