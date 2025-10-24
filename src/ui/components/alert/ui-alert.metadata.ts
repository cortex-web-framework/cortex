import { ComponentMetadata } from '../../metadata.js';

export const uiAlertMetadata: ComponentMetadata = {
  tag: 'ui-alert',
  name: 'Alert',
  category: 'Feedback',
  description:
    'An alert component for displaying notifications with multiple severity levels (success, error, warning, info). Supports dismissible alerts with customizable titles. Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'type',
      type: "'success' | 'error' | 'warning' | 'info'",
      default: "'info'",
      description: 'Alert severity type',
      isAttribute: true,
    },
    {
      name: 'message',
      type: 'string',
      description: 'Optional message/title text',
      isAttribute: true,
    },
    {
      name: 'dismissible',
      type: 'boolean',
      default: true,
      description: 'Show close button to dismiss alert',
      isAttribute: true,
    },
    {
      name: 'visible',
      type: 'boolean',
      default: true,
      description: 'Whether the alert is visible',
      isAttribute: true,
    },
  ],
  events: [
    {
      name: 'dismiss',
      detail: 'CustomEvent<{ type: AlertType }>',
      description: 'Emitted when alert is dismissed',
    },
    {
      name: 'show',
      detail: 'CustomEvent<{ type: AlertType }>',
      description: 'Emitted when alert becomes visible',
    },
    {
      name: 'hide',
      detail: 'CustomEvent<{ type: AlertType }>',
      description: 'Emitted when alert is hidden',
    },
  ],
  slots: [
    {
      name: 'content',
      description: 'Alert message content',
    },
  ],
  cssProps: [
    {
      name: '--ui-alert-success-bg',
      description: 'Background color for success alerts',
      default: '#d4edda',
    },
    {
      name: '--ui-alert-error-bg',
      description: 'Background color for error alerts',
      default: '#f8d7da',
    },
    {
      name: '--ui-alert-warning-bg',
      description: 'Background color for warning alerts',
      default: '#fff3cd',
    },
    {
      name: '--ui-alert-info-bg',
      description: 'Background color for info alerts',
      default: '#d1ecf1',
    },
  ],
  examples: [
    {
      title: 'Success Alert',
      code: `<ui-alert type="success" title="Success!">
  Your changes have been saved successfully.
</ui-alert>`,
      description: 'Alert for successful operations',
    },
    {
      title: 'Error Alert',
      code: `<ui-alert type="error" title="Error" dismissible="false">
  An error occurred. Please try again.
</ui-alert>`,
      description: 'Non-dismissible error alert',
    },
    {
      title: 'Warning Alert',
      code: `<ui-alert type="warning" title="Warning">
  Please review your input before submitting.
</ui-alert>`,
      description: 'Alert for warnings and cautions',
    },
    {
      title: 'Info Alert with Control',
      code: `<ui-alert id="infoAlert" type="info" title="Information">
  This is an informational message.
</ui-alert>
<script>
  const alert = document.getElementById('infoAlert');
  // Hide after 5 seconds
  setTimeout(() => alert.hide(), 5000);
</script>`,
      description: 'Info alert that auto-hides',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-alert',
};
