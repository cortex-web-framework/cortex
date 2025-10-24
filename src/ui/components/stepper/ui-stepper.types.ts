export interface StepperStep {
  id: string;
  label: string;
  description?: string;
  completed?: boolean;
  disabled?: boolean;
  hasError?: boolean;
}

export interface StepperState {
  steps: StepperStep[];
  activeStep: number;
  orientation: 'horizontal' | 'vertical';
  showLabels: boolean;
  disabled: boolean;
}

export interface IStepperElement extends HTMLElement {
  steps: StepperStep[];
  activeStep: number;
  orientation: 'horizontal' | 'vertical';
  showLabels: boolean;
  disabled: boolean;
  nextStep(): void;
  previousStep(): void;
  goToStep(index: number): void;
  addStep(step: StepperStep): void;
  removeStep(index: number): void;
}
