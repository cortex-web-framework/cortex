export interface RatingState {
  value: number;
  maxValue: number;
  readonly: boolean;
  size: 'small' | 'medium' | 'large';
}

export interface IRatingElement extends HTMLElement {
  value: number;
  maxValue: number;
  readonly: boolean;
  size: 'small' | 'medium' | 'large';
}
