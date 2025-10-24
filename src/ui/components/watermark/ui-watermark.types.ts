export interface WatermarkState {
  text?: string;
  opacity: number;
  fontSize: number;
  angle: number;
}

export interface IWatermarkElement extends HTMLElement {
  text?: string;
  opacity: number;
  fontSize: number;
  angle: number;
}
