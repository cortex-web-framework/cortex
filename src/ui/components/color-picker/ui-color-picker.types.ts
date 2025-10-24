export interface IColorPickerElement extends HTMLElement {
  value: string | null;
  label?: string;
  name: string;
  required: boolean;
  disabled: boolean;
  format: 'hex' | 'rgb';
  readonly validationMessage: string;
  focus(): void;
  blur(): void;
  checkValidity(): boolean;
  reset(): void;
}

export interface ColorPickerState {
  value: string | null;
  label?: string;
  name: string;
  required: boolean;
  disabled: boolean;
  format: 'hex' | 'rgb';
  isOpen: boolean;
  isValid: boolean;
}
