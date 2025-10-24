import { ComponentMetadata } from '../../metadata.js';

/**
 * Metadata for the ui-form-field component.
 */
export const uiFormFieldMetadata: ComponentMetadata = {
  tag: 'ui-form-field',
  name: 'Form Field',
  category: 'Form Controls',
  description:
    'A wrapper component that combines label, input, error, and hint messages in a single form field layout. Supports required indicator and disabled state. Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'error',
      type: 'string | null',
      default: 'null',
      description: 'Error message text displayed below the input',
      isAttribute: true,
    },
    {
      name: 'hint',
      type: 'string | null',
      default: 'null',
      description: 'Helper/hint text displayed below the input',
      isAttribute: true,
    },
    {
      name: 'required',
      type: 'boolean',
      default: false,
      description: 'If true, indicates this is a required field',
      isAttribute: true,
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: false,
      description: 'If true, the entire form field is disabled',
      isAttribute: true,
    },
  ],
  events: [],
  slots: [
    {
      name: 'label',
      description: 'Label content, typically a ui-label component',
    },
    {
      name: 'input',
      description: 'Input content, typically a form control (input, textarea, select, etc)',
    },
    {
      name: 'error',
      description: 'Error message slot content',
    },
    {
      name: 'hint',
      description: 'Hint/helper text slot content',
    },
  ],
  cssProps: [
    {
      name: '--ui-form-field-gap',
      description: 'Gap between form field elements',
      default: 'var(--ui-spacing-sm, 8px)',
    },
    {
      name: '--ui-form-field-color-error',
      description: 'Color for error messages',
      default: 'var(--ui-color-danger, #dc3545)',
    },
    {
      name: '--ui-form-field-color-hint',
      description: 'Color for hint messages',
      default: 'var(--ui-color-text-light, #666)',
    },
  ],
  examples: [
    {
      title: 'Basic Form Field',
      code: `<ui-form-field>
  <ui-label slot="label" for="username">Username</ui-label>
  <input slot="input" type="text" id="username" placeholder="Enter username">
</ui-form-field>`,
      description: 'Simple form field with label and input',
    },
    {
      title: 'Form Field with Hint',
      code: `<ui-form-field hint="Use 8+ characters for security">
  <ui-label slot="label" for="password" required>Password</ui-label>
  <input slot="input" type="password" id="password" required>
</ui-form-field>`,
      description: 'Form field with required indicator and hint text',
    },
    {
      title: 'Form Field with Error',
      code: `<ui-form-field error="Email is invalid">
  <ui-label slot="label" for="email">Email Address</ui-label>
  <input slot="input" type="email" id="email" value="invalid">
</ui-form-field>`,
      description: 'Form field displaying an error message',
    },
    {
      title: 'Disabled Form Field',
      code: `<ui-form-field disabled>
  <ui-label slot="label" for="disabled-input">Disabled Field</ui-label>
  <input slot="input" type="text" id="disabled-input" disabled>
</ui-form-field>`,
      description: 'Disabled form field that cannot be interacted with',
    },
    {
      title: 'Form Field in Form',
      code: `<form>
  <ui-form-field required>
    <ui-label slot="label" for="name" required>Full Name</ui-label>
    <input slot="input" type="text" id="name" required>
  </ui-form-field>

  <ui-form-field hint="Format: (123) 456-7890">
    <ui-label slot="label" for="phone">Phone Number</ui-label>
    <input slot="input" type="tel" id="phone">
  </ui-form-field>
</form>`,
      description: 'Multiple form fields in a form structure',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-form-field',
};
