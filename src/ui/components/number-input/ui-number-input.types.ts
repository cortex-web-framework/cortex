export interface INumberInputElement extends HTMLElement {
  value: number | null;
  placeholder: string;
  label?: string;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
  required: boolean;
  name: string;
  readonly validationMessage: string;
  focus(): void;
  blur(): void;
  checkValidity(): boolean;
  reset(): void;
}

export interface NumberInputState {
  value: number | null;
  placeholder: string;
  label?: string;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
  required: boolean;
  name: string;
  isValid: boolean;
}
