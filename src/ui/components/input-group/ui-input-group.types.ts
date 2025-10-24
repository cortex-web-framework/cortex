export interface InputGroupState {
  beforeText?: string;
  afterText?: string;
  error?: string;
  disabled: boolean;
}

export interface IInputGroupElement extends HTMLElement {
  beforeText?: string;
  afterText?: string;
  error?: string;
  disabled: boolean;
}
