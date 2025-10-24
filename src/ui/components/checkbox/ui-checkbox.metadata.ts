import { ComponentMetadata } from '../../metadata.js';

/**
 * Metadata for the ui-checkbox component.
 */
export const uiCheckboxMetadata: ComponentMetadata = {
  tag: 'ui-checkbox',
  name: 'Checkbox',
  category: 'Basic Input Controls',
  description:
    'A customizable checkbox component with support for checked, disabled, and indeterminate (tri-state) states. Includes built-in validation, accessibility features, and form integration.',
  since: '1.0.0',
  props: [
    {
      name: 'checked',
      type: 'boolean',
      default: false,
      description: 'Whether the checkbox is checked',
      isAttribute: true,
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: false,
      description:
        'If true, the checkbox is disabled and cannot be interacted with',
      isAttribute: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Label text displayed next to the checkbox',
      isAttribute: true,
    },
    {
      name: 'value',
      type: 'string',
      default: '"on"',
      description: 'The value submitted with the form when checkbox is checked',
      isAttribute: true,
    },
    {
      name: 'required',
      type: 'boolean',
      default: false,
      description:
        'If true, the checkbox must be checked. Shows required indicator (*)',
      isAttribute: true,
    },
    {
      name: 'indeterminate',
      type: 'boolean',
      default: false,
      description:
        'Tri-state checkbox. Use for parent checkboxes controlling multiple child items',
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
      detail: 'CustomEvent<{ checked: boolean, value: string, name: string }>',
      description:
        'Emitted when the checkbox state changes. Detail includes checked state and value',
    },
    {
      name: 'focus',
      detail: 'FocusEvent',
      description: 'Emitted when the checkbox gains focus',
    },
    {
      name: 'blur',
      detail: 'FocusEvent',
      description: 'Emitted when the checkbox loses focus',
    },
  ],
  cssProps: [
    {
      name: '--ui-checkbox-border-color',
      description: 'Border color of the checkbox box',
      default: 'var(--ui-color-border, #ddd)',
    },
    {
      name: '--ui-checkbox-checked-color',
      description: 'Color when checkbox is checked (accent-color)',
      default: 'var(--ui-color-primary, #007bff)',
    },
    {
      name: '--ui-checkbox-size',
      description: 'Size of the checkbox box',
      default: '20px',
    },
  ],
  examples: [
    {
      title: 'Basic Checkbox',
      code: '<ui-checkbox label="Accept terms and conditions"></ui-checkbox>',
      description: 'Simple checkbox with label',
    },
    {
      title: 'Checked Checkbox',
      code:
        '<ui-checkbox label="Remember me" checked></ui-checkbox>',
      description: 'Checkbox that starts in checked state',
    },
    {
      title: 'Required Checkbox',
      code:
        '<ui-checkbox label="I agree to the terms" required></ui-checkbox>',
      description: 'Required checkbox with validation',
    },
    {
      title: 'Disabled Checkbox',
      code:
        '<ui-checkbox label="Disabled option" disabled></ui-checkbox>',
      description: 'Disabled checkbox that cannot be toggled',
    },
    {
      title: 'Indeterminate Checkbox',
      code:
        '<ui-checkbox label="Select all items" indeterminate></ui-checkbox>',
      description:
        'Tri-state checkbox for parent/child selection patterns',
    },
    {
      title: 'Checkbox in Form',
      code:
        '<form><ui-checkbox name="newsletter" value="subscribe" label="Subscribe to newsletter"></ui-checkbox></form>',
      description: 'Checkbox integrated with HTML form',
    },
  ],
  issueUrl:
    'https://github.com/cortexproject/cortex/issues?q=label%3Aui-checkbox',
};
