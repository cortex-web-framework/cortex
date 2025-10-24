import { ComponentMetadata } from '../../metadata.js';

/**
 * Metadata for the ui-textarea component.
 */
export const uiTextareaMetadata: ComponentMetadata = {
  tag: 'ui-textarea',
  name: 'Textarea',
  category: 'Basic Input Controls',
  description:
    'A multi-line text input component with support for validation (required, minLength, maxLength), character counting, disabled and read-only states, and form integration. Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'value',
      type: 'string',
      default: '""',
      description: 'The current textarea value',
      isAttribute: true,
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Placeholder text shown when textarea is empty',
      isAttribute: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Label text displayed above the textarea',
      isAttribute: true,
    },
    {
      name: 'rows',
      type: 'number',
      default: 4,
      description: 'Number of visible text rows',
      isAttribute: true,
    },
    {
      name: 'cols',
      type: 'number',
      default: 40,
      description: 'Number of visible text columns',
      isAttribute: true,
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: false,
      description: 'If true, the textarea is disabled and cannot be edited',
      isAttribute: true,
    },
    {
      name: 'readonly',
      type: 'boolean',
      default: false,
      description: 'If true, the textarea is read-only',
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
      name: 'maxLength',
      type: 'number',
      default: -1,
      description: 'Maximum character length. Shows character counter when set',
      isAttribute: true,
    },
    {
      name: 'minLength',
      type: 'number',
      default: 0,
      description: 'Minimum character length required',
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
      name: 'input',
      detail: 'CustomEvent<{ value: string }>',
      description: 'Emitted when the value changes (on every keystroke)',
    },
    {
      name: 'change',
      detail: 'CustomEvent<{ value: string }>',
      description: 'Emitted when the value changes and textarea loses focus',
    },
    {
      name: 'focus',
      detail: 'CustomEvent<void>',
      description: 'Emitted when the textarea gains focus',
    },
    {
      name: 'blur',
      detail: 'CustomEvent<void>',
      description: 'Emitted when the textarea loses focus',
    },
  ],
  slots: [],
  cssProps: [
    {
      name: '--ui-textarea-border-color',
      description: 'Border color of the textarea',
      default: 'var(--ui-color-border, #ddd)',
    },
    {
      name: '--ui-textarea-background',
      description: 'Background color of the textarea',
      default: 'white',
    },
    {
      name: '--ui-textarea-focus-color',
      description: 'Border color when focused',
      default: 'var(--ui-color-primary, #007bff)',
    },
  ],
  examples: [
    {
      title: 'Basic Textarea',
      code: '<ui-textarea placeholder="Enter your message..."></ui-textarea>',
      description: 'Simple multi-line text input',
    },
    {
      title: 'Textarea with Label',
      code: '<ui-textarea label="Comments" rows="5" placeholder="Enter your feedback..."></ui-textarea>',
      description: 'Textarea with descriptive label',
    },
    {
      title: 'Required Textarea',
      code: '<ui-textarea label="Message" required placeholder="This field is required..."></ui-textarea>',
      description: 'Required field with validation',
    },
    {
      title: 'Textarea with Character Limit',
      code: '<ui-textarea label="Bio" maxLength="160" placeholder="Tell us about yourself..."></ui-textarea>',
      description: 'Textarea with character counter showing 0/160',
    },
    {
      title: 'Disabled Textarea',
      code: '<ui-textarea label="Comments" disabled value="This field is disabled"></ui-textarea>',
      description: 'Disabled textarea that cannot be edited',
    },
    {
      title: 'Read-Only Textarea',
      code: '<ui-textarea label="Code" readonly value="function hello() { }"></ui-textarea>',
      description: 'Read-only textarea showing uneditable content',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-textarea',
};
