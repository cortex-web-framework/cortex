/**
 * Strict TypeScript types for ui-radio component.
 */

export interface RadioOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface IRadioElement extends HTMLElement {
  options: RadioOption[];
  value: string | null;
  label?: string;
  required: boolean;
  disabled: boolean;
  name: string;
  readonly validationMessage: string;
  focus(): void;
  blur(): void;
  checkValidity(): boolean;
}

export interface RadioState {
  options: RadioOption[];
  value: string | null;
  label?: string;
  required: boolean;
  disabled: boolean;
  name: string;
  isValid: boolean;
}
