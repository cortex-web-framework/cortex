import { ComponentMetadata } from '../../metadata.js';

/**
 * Metadata for the ui-text-input component.
 * Describes the component's API, events, and usage.
 */
export const uiTextInputMetadata: ComponentMetadata = {
  tag: 'ui-text-input',
  name: 'Text Input',
  category: 'Basic Input Controls',
  description:
    'A customizable text input field with built-in validation, accessibility support, and form integration. Supports various input types (text, email, password, number, etc) with automatic validation.',
  since: '1.0.0',
  props: [
    {
      name: 'value',
      type: 'string',
      default: '""',
      description: 'The current value of the input field',
      isAttribute: true,
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Placeholder text displayed when the input is empty',
      isAttribute: true,
    },
    {
      name: 'type',
      type: '"text" | "email" | "password" | "number" | "url" | "tel" | "date" | "time" | "search"',
      default: '"text"',
      description:
        'The type of input. Determines keyboard layout and validation behavior',
      isAttribute: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Label text displayed above the input field',
      isAttribute: true,
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: false,
      description:
        'If true, the input is disabled and cannot be interacted with. Visually grayed out',
      isAttribute: true,
    },
    {
      name: 'readonly',
      type: 'boolean',
      default: false,
      description: 'If true, the input is read-only. Value cannot be changed by user',
      isAttribute: true,
    },
    {
      name: 'required',
      type: 'boolean',
      default: false,
      description:
        'If true, the input field is required. Shows required indicator (*) and validates non-empty',
      isAttribute: true,
    },
    {
      name: 'maxLength',
      type: 'number',
      default: '524288',
      description: 'Maximum number of characters allowed in the input',
      isAttribute: true,
    },
    {
      name: 'pattern',
      type: 'string',
      description: 'Regular expression pattern for validation. Input must match this pattern',
      isAttribute: true,
    },
    {
      name: 'name',
      type: 'string',
      description: 'Form field name for form submission and identification',
      isAttribute: true,
    },
  ],
  events: [
    {
      name: 'input',
      detail:
        'CustomEvent<{ value: string, valid: boolean }>' ,
      description:
        'Emitted when the input value changes (fires on every keystroke)',
    },
    {
      name: 'change',
      detail: 'CustomEvent<{ value: string, valid: boolean }>',
      description: 'Emitted when the input value is committed (on blur or Enter)',
    },
    {
      name: 'focus',
      detail: 'FocusEvent',
      description: 'Emitted when the input gains focus',
    },
    {
      name: 'blur',
      detail: 'FocusEvent',
      description: 'Emitted when the input loses focus',
    },
  ],
  slots: [
    {
      name: 'default',
      description: '(Not used - text input has no slot content)',
    },
  ],
  cssProps: [
    {
      name: '--ui-text-input-background',
      description: 'Background color of the input field',
      default: 'white',
    },
    {
      name: '--ui-text-input-border-color',
      description: 'Border color of the input field',
      default: 'var(--ui-color-border, #ddd)',
    },
    {
      name: '--ui-text-input-border-color-focus',
      description: 'Border color when input is focused',
      default: 'var(--ui-color-primary, #007bff)',
    },
    {
      name: '--ui-text-input-color',
      description: 'Text color of the input',
      default: 'var(--ui-color-text, #333)',
    },
    {
      name: '--ui-text-input-padding',
      description: 'Padding inside the input field',
      default: 'var(--ui-spacing-md) var(--ui-spacing-lg)',
    },
    {
      name: '--ui-text-input-font-size',
      description: 'Font size of the input text',
      default: 'var(--ui-font-size-md)',
    },
    {
      name: '--ui-text-input-border-radius',
      description: 'Border radius of the input field',
      default: 'var(--ui-border-radius-md, 4px)',
    },
  ],
  examples: [
    {
      title: 'Basic Text Input',
      code: '<ui-text-input placeholder="Enter your name"></ui-text-input>',
      description: 'Simple text input with placeholder',
    },
    {
      title: 'Email Input with Label',
      code:
        '<ui-text-input type="email" label="Email Address" required></ui-text-input>',
      description: 'Email input with label and required validation',
    },
    {
      title: 'Password Input',
      code: '<ui-text-input type="password" label="Password"></ui-text-input>',
      description: 'Password field with obscured text',
    },
    {
      title: 'Disabled Input',
      code:
        '<ui-text-input value="Read-only value" disabled label="Disabled Field"></ui-text-input>',
      description: 'Disabled input field',
    },
    {
      title: 'Input with Validation Pattern',
      code:
        '<ui-text-input label="ZIP Code" pattern="^[0-9]{5}$" placeholder="12345"></ui-text-input>',
      description: 'Input with regex pattern validation (5 digits)',
    },
    {
      title: 'Input with Max Length',
      code:
        '<ui-text-input label="Username" maxLength="20" placeholder="Max 20 characters"></ui-text-input>',
      description: 'Input with maximum character limit',
    },
    {
      title: 'Date Input',
      code: '<ui-text-input type="date" label="Birth Date"></ui-text-input>',
      description: 'Date picker input',
    },
  ],
  issueUrl:
    'https://github.com/cortexproject/cortex/issues?q=label%3Aui-text-input',
};
