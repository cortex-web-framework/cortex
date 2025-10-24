import { ComponentMetadata } from '../../metadata.js';

export const uiDatePickerMetadata: ComponentMetadata = {
  tag: 'ui-date-picker',
  name: 'Date Picker',
  category: 'Date & Time Input',
  description:
    'A calendar-based date selection component with support for date constraints, disabled dates, optional range selection, and form integration. Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'value',
      type: 'Date | DateRange | null',
      default: 'null',
      description: 'Selected date(s) - single Date or range with start/end',
      isAttribute: true,
    },
    {
      name: 'min',
      type: 'Date | null',
      default: 'null',
      description: 'Minimum allowed date',
      isAttribute: true,
    },
    {
      name: 'max',
      type: 'Date | null',
      default: 'null',
      description: 'Maximum allowed date',
      isAttribute: true,
    },
    {
      name: 'disabledDates',
      type: 'Date[]',
      default: '[]',
      description: 'Array of specific dates to disable',
      isAttribute: false,
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
      description: 'If true, a date must be selected',
      isAttribute: true,
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: false,
      description: 'If true, the date picker is disabled',
      isAttribute: true,
    },
    {
      name: 'range',
      type: 'boolean',
      default: false,
      description: 'If true, enables date range selection',
      isAttribute: true,
    },
  ],
  events: [
    {
      name: 'change',
      detail: 'CustomEvent<{ value: Date | DateRange | null }>',
      description: 'Emitted when a date is selected',
    },
    {
      name: 'open',
      detail: 'CustomEvent<void>',
      description: 'Emitted when the calendar popup opens',
    },
    {
      name: 'close',
      detail: 'CustomEvent<void>',
      description: 'Emitted when the calendar popup closes',
    },
  ],
  slots: [],
  cssProps: [
    {
      name: '--ui-date-picker-bg',
      description: 'Background color of the calendar popup',
      default: 'white',
    },
    {
      name: '--ui-date-picker-selected-color',
      description: 'Color of selected date',
      default: 'var(--ui-color-primary, #007bff)',
    },
    {
      name: '--ui-date-picker-disabled-color',
      description: 'Color of disabled dates',
      default: 'var(--ui-color-text-light, #ccc)',
    },
  ],
  examples: [
    {
      title: 'Basic Date Picker',
      code: '<ui-date-picker placeholder="Select a date..."></ui-date-picker>',
      description: 'Simple date selection with calendar',
    },
    {
      title: 'Date Picker with Label',
      code: '<ui-date-picker label="Birth Date"></ui-date-picker>',
      description: 'Date picker with descriptive label',
    },
    {
      title: 'Date Picker with Constraints',
      code: '<ui-date-picker label="Event Date" min="2024-01-01" max="2024-12-31"></ui-date-picker>',
      description: 'Date picker limited to specific date range',
    },
    {
      title: 'Required Date Picker',
      code: '<ui-date-picker label="Appointment" required></ui-date-picker>',
      description: 'Required date selection with validation',
    },
    {
      title: 'Date Picker with Disabled Dates',
      code: `<ui-date-picker label="Available Dates">
  <script>
    const picker = document.currentScript.previousElementSibling;
    picker.disabledDates = [
      new Date(2024, 0, 5),
      new Date(2024, 0, 6),
      new Date(2024, 0, 7)
    ];
  </script>
</ui-date-picker>`,
      description: 'Date picker with specific dates disabled',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-date-picker',
};
