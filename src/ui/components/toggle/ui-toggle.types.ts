export interface IToggleElement extends HTMLElement {
  checked: boolean;
  disabled: boolean;
  required: boolean;
  label?: string;
  name: string;
  readonly validationMessage: string;
  focus(): void;
  blur(): void;
  toggle(): void;
  checkValidity(): boolean;
}

export interface ToggleState {
  checked: boolean;
  disabled: boolean;
  required: boolean;
  label?: string;
  name: string;
  isValid: boolean;
}
