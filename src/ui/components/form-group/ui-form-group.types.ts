export interface FormGroupState {
  label?: string;
  required: boolean;
  disabled: boolean;
  error?: string;
}

export interface IFormGroupElement extends HTMLElement {
  label?: string;
  required: boolean;
  disabled: boolean;
  error?: string;
}
