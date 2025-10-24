export type SpinnerSize = 'small' | 'medium' | 'large';
export type SpinnerVariant = 'ring' | 'dots' | 'wave';

export interface SpinnerState {
  size: SpinnerSize;
  variant: SpinnerVariant;
  message?: string;
}

export interface ISpinnerElement extends HTMLElement {
  size: SpinnerSize;
  variant: SpinnerVariant;
  message?: string;
}
