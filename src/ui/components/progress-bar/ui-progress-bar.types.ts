export type ProgressBarVariant = 'default' | 'striped' | 'animated';
export type ProgressBarSize = 'small' | 'medium' | 'large';
export type ProgressBarColor = 'primary' | 'success' | 'warning' | 'error' | 'info';

export interface ProgressBarState {
  value: number;
  max: number;
  label?: string;
  showLabel: boolean;
  showPercentage: boolean;
  variant: ProgressBarVariant;
  size: ProgressBarSize;
  color: ProgressBarColor;
  disabled: boolean;
  indeterminate: boolean;
}

export interface IProgressBarElement extends HTMLElement {
  value: number;
  max: number;
  label?: string;
  showLabel: boolean;
  showPercentage: boolean;
  variant: ProgressBarVariant;
  size: ProgressBarSize;
  color: ProgressBarColor;
  disabled: boolean;
  indeterminate: boolean;
}
