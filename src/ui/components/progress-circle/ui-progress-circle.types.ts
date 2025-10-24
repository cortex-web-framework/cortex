export interface ProgressCircleState {
  value: number;
  maxValue: number;
  size: number;
  strokeWidth: number;
  color?: string;
  showLabel: boolean;
}

export interface IProgressCircleElement extends HTMLElement {
  value: number;
  maxValue: number;
  size: number;
  strokeWidth: number;
  color?: string;
  showLabel: boolean;
}
