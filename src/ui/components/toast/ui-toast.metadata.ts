import { ComponentMetadata } from '../../metadata.js';

export const uiToastMetadata: ComponentMetadata = {
  tag: 'ui-toast',
  name: 'Toast',
  category: 'Feedback',
  description:
    'A toast notification component for displaying temporary messages. Supports different notification types (info, success, warning, error) with auto-hide capability. Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'message',
      type: 'string | undefined',
      description: 'The message to display in the toast',
      isAttribute: true,
    },
    {
      name: 'toastType',
      type: "'info' | 'success' | 'warning' | 'error'",
      default: "'info'",
      description: 'The type of notification to display',
      isAttribute: true,
    },
    {
      name: 'autoHide',
      type: 'boolean',
      default: 'true',
      description: 'Automatically hide the toast after the duration',
      isAttribute: true,
    },
    {
      name: 'duration',
      type: 'number',
      default: '3000',
      description: 'How long to display the toast in milliseconds',
      isAttribute: true,
    },
    {
      name: 'visible',
      type: 'boolean',
      default: 'false',
      description: 'Whether the toast is currently visible',
      isAttribute: false,
    },
  ],
  events: [],
  slots: [],
  cssProps: [
    {
      name: '--ui-color-info',
      description: 'Color for info toast',
      default: '#17a2b8',
    },
    {
      name: '--ui-color-success',
      description: 'Color for success toast',
      default: '#28a745',
    },
    {
      name: '--ui-color-warning',
      description: 'Color for warning toast',
      default: '#ffc107',
    },
    {
      name: '--ui-color-error',
      description: 'Color for error toast',
      default: '#dc3545',
    },
  ],
  examples: [
    {
      title: 'Success Toast',
      code: `<ui-toast></ui-toast>\n<script>\nconst toast = document.querySelector('ui-toast');\ntoast.message = 'Item saved successfully!';\ntoast.toastType = 'success';\ntoast.show();\n</script>`,
      description: 'Success notification that auto-hides',
    },
    {
      title: 'Error Toast',
      code: `<ui-toast></ui-toast>\n<script>\nconst toast = document.querySelector('ui-toast');\ntoast.message = 'An error occurred';\ntoast.toastType = 'error';\ntoast.autoHide = false;\ntoast.show();\n</script>`,
      description: 'Error toast that does not auto-hide',
    },
    {
      title: 'Warning Toast',
      code: `<ui-toast toastType="warning" duration="5000"></ui-toast>\n<script>\nconst toast = document.querySelector('ui-toast');\ntoast.message = 'Please review the changes';\ntoast.show();\n</script>`,
      description: 'Warning toast with custom duration',
    },
    {
      title: 'Info Toast',
      code: `<ui-toast toastType="info"></ui-toast>\n<script>\nconst toast = document.querySelector('ui-toast');\ntoast.message = 'New updates available';\ntoast.show();\n</script>`,
      description: 'Info notification message',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-toast',
};
