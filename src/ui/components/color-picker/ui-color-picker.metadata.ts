import { ComponentMetadata } from '../../metadata.js';

export const uiColorPickerMetadata: ComponentMetadata = {
  tag: 'ui-color-picker',
  name: 'Color Picker',
  category: 'Advanced Input',
  description:
    'A color selection component with support for hex and RGB formats. Provides a visual color picker with format conversion and validation. Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'value',
      type: 'string | null',
      default: 'null',
      description: 'Currently selected color value in hex or RGB format',
      isAttribute: true,
    },
    {
      name: 'format',
      type: "'hex' | 'rgb'",
      default: "'hex'",
      description: 'Color format for the value (hex or rgb)',
      isAttribute: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Label text displayed above the color picker',
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
      description: 'If true, a color selection is required',
      isAttribute: true,
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: false,
      description: 'If true, the color picker is disabled',
      isAttribute: true,
    },
  ],
  events: [
    {
      name: 'change',
      detail: 'CustomEvent<{ value: string | null }>',
      description: 'Emitted when a color is selected',
    },
    {
      name: 'input',
      detail: 'CustomEvent<{ value: string }>',
      description: 'Emitted while the user is selecting a color',
    },
  ],
  slots: [],
  cssProps: [
    {
      name: '--ui-color-picker-border-color',
      description: 'Border color of the color input',
      default: 'var(--ui-color-border, #ddd)',
    },
    {
      name: '--ui-color-picker-focus-color',
      description: 'Border color when focused',
      default: 'var(--ui-color-primary, #007bff)',
    },
    {
      name: '--ui-color-picker-preview-bg',
      description: 'Background color of the preview area',
      default: '#f5f5f5',
    },
  ],
  examples: [
    {
      title: 'Basic Color Picker',
      code: `<ui-color-picker></ui-color-picker>`,
      description: 'Simple color picker with default hex format',
    },
    {
      title: 'Color Picker with Label',
      code: `<ui-color-picker label="Select Theme Color" required></ui-color-picker>`,
      description: 'Color picker with a label and required validation',
    },
    {
      title: 'Color Picker with RGB Format',
      code: `<ui-color-picker label="RGB Color" format="rgb" value="rgb(255, 0, 0)"></ui-color-picker>`,
      description: 'Color picker set to RGB format',
    },
    {
      title: 'Disabled Color Picker',
      code: `<ui-color-picker label="Disabled Color" disabled value="#0066cc"></ui-color-picker>`,
      description: 'Color picker in disabled state',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-color-picker',
};
