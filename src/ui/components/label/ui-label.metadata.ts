import { ComponentMetadata } from '../../metadata.js';

/**
 * Metadata for the ui-label component.
 */
export const uiLabelMetadata: ComponentMetadata = {
  tag: 'ui-label',
  name: 'Label',
  category: 'Form Controls',
  description:
    'A semantic HTML label element for associating labels with form inputs. Supports required indicator and disabled state. Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'for',
      type: 'string',
      description: 'The ID of the form control that this label is associated with',
      isAttribute: true,
    },
    {
      name: 'required',
      type: 'boolean',
      default: false,
      description: 'If true, displays a required indicator (*) next to the label',
      isAttribute: true,
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: false,
      description: 'If true, the label is visually disabled',
      isAttribute: true,
    },
  ],
  events: [],
  slots: [
    {
      name: 'default',
      description: 'The label text content',
    },
  ],
  cssProps: [
    {
      name: '--ui-label-color',
      description: 'Text color of the label',
      default: 'var(--ui-color-text, #333)',
    },
    {
      name: '--ui-label-font-size',
      description: 'Font size of the label',
      default: 'var(--ui-font-size-md, 14px)',
    },
    {
      name: '--ui-label-required-color',
      description: 'Color of the required indicator',
      default: 'var(--ui-color-danger, #dc3545)',
    },
  ],
  examples: [
    {
      title: 'Basic Label',
      code: '<ui-label for="username">Username</ui-label>\n<input type="text" id="username">',
      description: 'Simple label associated with an input field',
    },
    {
      title: 'Required Label',
      code: '<ui-label for="email" required>Email Address</ui-label>\n<input type="email" id="email">',
      description: 'Label with required indicator for mandatory fields',
    },
    {
      title: 'Disabled Label',
      code: '<ui-label for="disabled-input" disabled>Disabled Field</ui-label>\n<input type="text" id="disabled-input" disabled>',
      description: 'Disabled label for inactive form fields',
    },
    {
      title: 'Label in Form',
      code: `<form>
  <ui-label for="name" required>Full Name</ui-label>
  <input type="text" id="name" required>
  <ui-label for="phone">Phone Number</ui-label>
  <input type="tel" id="phone">
</form>`,
      description: 'Multiple labels in a form structure',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-label',
};
