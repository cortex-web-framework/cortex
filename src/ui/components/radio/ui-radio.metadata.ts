import { ComponentMetadata } from '../../metadata.js';

export const uiRadioMetadata: ComponentMetadata = {
  tag: 'ui-radio',
  name: 'Radio',
  category: 'Basic Input Controls',
  description:
    'A radio button group component for selecting a single option from a list. Supports required validation, keyboard navigation, and form integration. Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'options',
      type: 'RadioOption[]',
      description: 'Array of radio button options with label and value',
      isAttribute: true,
    },
    {
      name: 'value',
      type: 'string | null',
      default: 'null',
      description: 'Currently selected radio button value',
      isAttribute: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Label text for the radio group',
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
      description: 'If true, all options are disabled',
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
      detail: 'CustomEvent<{ value: string }>',
      description: 'Emitted when the selected value changes',
    },
  ],
  slots: [],
  cssProps: [
    {
      name: '--ui-radio-size',
      description: 'Size of the radio button',
      default: '20px',
    },
    {
      name: '--ui-radio-color',
      description: 'Color of the selected radio button',
      default: 'var(--ui-color-primary, #007bff)',
    },
  ],
  examples: [
    {
      title: 'Basic Radio Group',
      code: `<ui-radio>
  <script>
    document.currentScript.previousElementSibling.options = [
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' }
    ];
  </script>
</ui-radio>`,
      description: 'Simple radio button group',
    },
    {
      title: 'Radio with Label',
      code: `<ui-radio label="Choose a color">
  <script>
    const radio = document.currentScript.previousElementSibling;
    radio.options = [
      { label: 'Red', value: 'red' },
      { label: 'Green', value: 'green' },
      { label: 'Blue', value: 'blue' }
    ];
  </script>
</ui-radio>`,
      description: 'Radio group with descriptive label',
    },
    {
      title: 'Required Radio',
      code: `<ui-radio label="Select one" required>
  <script>
    const radio = document.currentScript.previousElementSibling;
    radio.options = [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' }
    ];
  </script>
</ui-radio>`,
      description: 'Required selection validation',
    },
    {
      title: 'Disabled Options',
      code: `<ui-radio>
  <script>
    const radio = document.currentScript.previousElementSibling;
    radio.options = [
      { label: 'Available', value: 'available' },
      { label: 'Unavailable', value: 'unavailable', disabled: true }
    ];
  </script>
</ui-radio>`,
      description: 'Radio group with disabled options',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-radio',
};
