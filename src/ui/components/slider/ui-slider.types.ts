export interface SliderState {
  min: number;
  max: number;
  step: number;
  value: number;
  disabled: boolean;
}

export interface ISliderElement extends HTMLElement {
  min: number;
  max: number;
  step: number;
  value: number;
  disabled: boolean;
}
