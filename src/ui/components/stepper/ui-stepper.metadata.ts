import { ComponentMetadata } from '../../metadata.js';

export const uiStepperMetadata: ComponentMetadata = {
  tag: 'ui-stepper',
  name: 'Stepper',
  category: 'Navigation',
  description:
    'A multi-step process indicator component for guiding users through sequential steps. Supports horizontal and vertical orientations, step states (completed, error, disabled), and keyboard navigation. Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'steps',
      type: 'StepperStep[]',
      description: 'Array of step objects with id, label, description, completed, disabled, and hasError properties',
    },
    {
      name: 'activeStep',
      type: 'number',
      default: '0',
      description: 'Index of the currently active step',
    },
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description: 'Layout orientation of the stepper',
      isAttribute: true,
    },
    {
      name: 'showLabels',
      type: 'boolean',
      default: 'true',
      description: 'Show step labels and descriptions',
      isAttribute: true,
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disable all steps',
      isAttribute: true,
    },
  ],
  events: [
    {
      name: 'stepChanged',
      description: 'Emitted when the active step changes',
      detail: '{ index: number; id: string; label: string }',
    },
  ],
  slots: [],
  cssProps: [
    {
      name: '--ui-color-primary',
      description: 'Active step indicator color',
      default: '#007bff',
    },
    {
      name: '--ui-color-success',
      description: 'Completed step indicator color',
      default: '#28a745',
    },
    {
      name: '--ui-color-error',
      description: 'Error state indicator color',
      default: '#dc3545',
    },
  ],
  examples: [
    {
      title: 'Basic Stepper',
      code: `<ui-stepper></ui-stepper>
<script>
  const stepper = document.querySelector('ui-stepper');
  stepper.steps = [
    { id: '1', label: 'Account Setup' },
    { id: '2', label: 'Personal Info' },
    { id: '3', label: 'Confirmation' }
  ];
</script>`,
      description: 'Basic horizontal stepper with three steps',
    },
    {
      title: 'Vertical Stepper',
      code: `<ui-stepper orientation="vertical"></ui-stepper>`,
      description: 'Vertical stepper for detailed step-by-step guidance',
    },
    {
      title: 'With Descriptions',
      code: `<ui-stepper></ui-stepper>
<script>
  const stepper = document.querySelector('ui-stepper');
  stepper.steps = [
    { id: '1', label: 'Account Setup', description: 'Create your account' },
    { id: '2', label: 'Personal Info', description: 'Enter your details' }
  ];
</script>`,
      description: 'Stepper with step descriptions',
    },
    {
      title: 'Tracking Progress',
      code: `<ui-stepper></ui-stepper>
<script>
  const stepper = document.querySelector('ui-stepper');
  stepper.steps = [
    { id: '1', label: 'Step 1', completed: true },
    { id: '2', label: 'Step 2', completed: true },
    { id: '3', label: 'Step 3', completed: false }
  ];
  stepper.activeStep = 2;
</script>`,
      description: 'Stepper showing completed steps',
    },
    {
      title: 'With Error State',
      code: `<ui-stepper></ui-stepper>
<script>
  const stepper = document.querySelector('ui-stepper');
  stepper.steps = [
    { id: '1', label: 'Step 1' },
    { id: '2', label: 'Step 2', hasError: true },
    { id: '3', label: 'Step 3' }
  ];
</script>`,
      description: 'Stepper showing error state on a step',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-stepper',
};
