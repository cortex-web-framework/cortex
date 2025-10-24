import { ComponentMetadata } from '../../metadata.js';

export const uiNumberInputMetadata: ComponentMetadata = {
  tag: 'ui-number-input',
  name: 'Number Input',
  category: 'Basic Input Controls',
  description:
    'A numeric input component with support for min/max validation, step values, required validation, and form integration. Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'value',
      type: 'number | null',
      default: 'null',
      description: 'The current numeric value',
      isAttribute: true,
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Placeholder text shown when empty',
      isAttribute: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Label text displayed above the input',
      isAttribute: true,
    },
    {
      name: 'min',
      type: 'number',
      default: 'Number.MIN_SAFE_INTEGER',
      description: 'Minimum value allowed',
      isAttribute: true,
    },
    {
      name: 'max',
      type: 'number',
      default: 'Number.MAX_SAFE_INTEGER',
      description: 'Maximum value allowed',
      isAttribute: true,
    },
    {
      name: 'step',
      type: 'number',
      default: 1,
      description: 'Increment/decrement step value',
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
      name: 'required',
      type: 'boolean',
      default: false,
      description: 'If true, a value is required',
      isAttribute: true,
    },
    {
      name: 'name',
      type: 'string',
      description: 'Form field name',
      isAttribute: true,
    },
  ],
  events: [
    {
      name: 'input',
      detail: 'CustomEvent<{ value: number | null }>',
      description: 'Emitted when value changes (on every keystroke)',
    },
    {
      name: 'change',
      detail: 'CustomEvent<{ value: number | null }>',
      description: 'Emitted when value changes and input loses focus',
    },
  ],
  slots: [],
  cssProps: [
    {
      name: '--ui-number-input-border-color',
      description: 'Border color of the input',
      default: 'var(--ui-color-border, #ddd)',
    },
  ],
  examples: [
    {
      title: 'Basic Number Input',
      code: '<ui-number-input placeholder="Enter a number..."></ui-number-input>',
      description: 'Simple number input',
    },
    {
      title: 'Number Input with Range',
      code: '<ui-number-input label="Age" min="0" max="150"></ui-number-input>',
      description: 'Number input with min/max constraints',
    },
    {
      title: 'Currency Input',
      code: '<ui-number-input label="Price" min="0" step="0.01" placeholder="0.00"></ui-number-input>',
      description: 'Number input for monetary values',
    },
    {
      title: 'Required Number Field',
      code: '<ui-number-input label="Quantity" required min="1"></ui-number-input>',
      description: 'Required numeric field with minimum value',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-number-input',
};
